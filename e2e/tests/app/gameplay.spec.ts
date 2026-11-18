// Playing Wiggle: the snake follows the mouse, grows by eating food, dies when its head runs into another
// snake, and blocking another player scores a point (plus a "kills" analytic and a balloon particle).
// Each world's game asset is its own room. The tests steer by reading what the renderer draws (wiggle.ts).
import type { BrowserContext, Page } from "@playwright/test";
import { expect, test, TopiaWorld } from "../../fixtures";
import {
  distance,
  eatUntil,
  emitRaw,
  frame,
  lost,
  nearEdge,
  park,
  ramInto,
  recordGame,
  respawn,
  seedGame,
  waitForMySnake,
  waitForRoom,
} from "./wiggle";

const ISSUE = "EXP-467";

const open = async (page: Page, url: string) => {
  await recordGame(page);
  await page.goto(url);
  await waitForRoom(page);
};

const join = async (page: Page) => {
  await page.locator("#joinGame").click();
  await waitForMySnake(page);
};

const length = async (page: Page) => Number((await page.locator("#wiggle-length").textContent())?.match(/\d+/)?.[0] ?? 0);

/** A second drawer in the same browser, for another player (or another world). */
const openOther = async (context: BrowserContext, url: string) => {
  const page = await context.newPage();
  await open(page, url);
  return page;
};

const PARKING = { x: 0, y: -4 };

/**
 * Player 42 (page) joins and parks; then player 43 joins and runs its head into 42's body, so 42 blocks 43.
 * Returns 43's page.
 */
const blockPlayer43 = async (page: Page, context: BrowserContext, world: TopiaWorld) => {
  await seedGame(world, { otherVisitors: { 43: {} } });
  await open(page, world.url("/"));
  await join(page);
  // Parked mid-board, its body trailing behind it.
  await park(page, PARKING);
  const loser = await openOther(context, world.url("/", world.as(43)));
  await join(loser);

  const scored = async () => (await page.locator("#score").textContent()) === "Your Score: 1";
  await ramInto(
    loser,
    async () => {
      // A point of 42's body away from its head (and from the board's edge, where 43 would stop short).
      const { myHeads, myBody } = await frame(page);
      const head = myHeads[0];
      if (!head) return undefined;
      return myBody.filter((p) => !nearEdge(p)).sort((a, b) => distance(b, head) - distance(a, head))[0];
    },
    async () => {
      if (await scored()) return true;
      // The room's bot got in the way: start that player over.
      if (await lost(page)) {
        await respawn(page);
        await park(page, PARKING);
      }
      if (await lost(loser)) {
        // The page only redraws the score now and then (WiggleRenderer.drawWiggle), slower under load.
        await expect.poll(scored, { timeout: 10_000 }).toBe(true).catch(() => {});
        if (await scored()) return true;
        await respawn(loser);
      }
      return false;
    },
  );
  return loser;
};

test("eating food grows the snake, and new food replaces what was eaten", async ({ page, world }) => {
  test.slow();
  await seedGame(world);
  await open(page, world.url("/"));
  await join(page);

  await eatUntil(page, async () => (await length(page)) >= 19);

  expect(await length(page)).toBeGreaterThanOrEqual(19);
  await expect.poll(async () => (await frame(page)).food.length).toBe(25);
});

test("running into another snake ends the game, and Try Again brings a new snake", async ({ page, world }) => {
  test.slow();
  await seedGame(world);
  await open(page, world.url("/"));
  await join(page);
  await expect(page.locator("#tryAgain")).toBeDisabled();

  // The room's bot is the only other snake.
  await ramInto(
    page,
    async () => {
      const { myHeads, otherBody } = await frame(page);
      const head = myHeads[0];
      return head ? otherBody.sort((a, b) => distance(head, a) - distance(head, b))[0] : undefined;
    },
    () => lost(page),
  );

  await expect(page.locator("#tryAgain")).toHaveClass("show");
  await expect.poll(async () => (await frame(page)).myHeads).toHaveLength(0);

  await page.locator("#tryAgain").click();

  await expect(page.locator("#tryAgain")).toHaveClass("hidden");
  await waitForMySnake(page);
  await expect(page.locator("body")).not.toHaveClass(/lostGame/);
});

test("players in the same world see each other's snakes and names; leaving removes the snake", async ({
  page,
  world,
  context,
}) => {
  await seedGame(world, { otherVisitors: { 43: {} } });
  await open(page, world.url("/"));
  await join(page);
  const other = await openOther(context, world.url("/", world.as(43)));
  await join(other);

  await expect.poll(async () => (await frame(page)).names).toContain("player-43");
  await expect.poll(async () => (await frame(other)).names).toContain("e2e-player");

  await other.close();

  await expect.poll(async () => (await frame(page)).names, { timeout: 10_000 }).not.toContain("player-43");
});

test("each world's game is its own room", async ({ page, world, context, request }) => {
  await seedGame(world);
  const elsewhere = new TopiaWorld(`${world.urlSlug}-b`, `${world.profileId}-b`, request);
  await seedGame(elsewhere, { visitor: { username: "player-in-another-world" } });
  await open(page, world.url("/"));
  await join(page);
  const other = await openOther(context, elsewhere.url("/"));
  await join(other);
  await page.waitForTimeout(1000);

  expect((await frame(page)).names).not.toContain("player-in-another-world");
  expect((await frame(other)).names).not.toContain("e2e-player");
});

test("blocking another player scores a point and ends their game", async ({ page, world, context }) => {
  test.slow();
  const loser = await blockPlayer43(page, context, world);

  await expect(loser.locator("#tryAgain")).toHaveClass("show");
  await expect(page.locator("#score")).toHaveText("Your Score: 1", { timeout: 10_000 });
  await expect(page.locator("body")).not.toHaveClass(/lostGame/);
});

test("blocking another player credits the kill and the balloon to the winner", async ({ page, world, context }) => {
  test.slow();
  test.fail(true, `${ISSUE}: kill rewards go to whoever opened Wiggle last (one shared this.visitor)`);
  await blockPlayer43(page, context, world);
  await expect(page.locator("#score")).toHaveText("Your Score: 1", { timeout: 10_000 });

  await expect
    .poll(async () => (await world.events("analytics")).filter((e) => e.analyticName === "kills"), { timeout: 5_000 })
    .toEqual([expect.objectContaining({ profileId: world.profileId, sessionVisitorId: "42" })]);
  expect(await world.events("particles")).toEqual([
    expect.objectContaining({ particleName: "balloon_float", followPlayerId: 42 }),
  ]);
});

test("a player's 'starts' and 'itemsEaten' analytics go to their own world", async ({
  page,
  world,
  context,
  request,
}) => {
  test.slow();
  test.fail(true, `${ISSUE}: analytics go to whoever opened Wiggle last (one shared this.visitor)`);
  await seedGame(world);
  await open(page, world.url("/"));
  // Someone opens Wiggle in another world before this player starts.
  const elsewhere = new TopiaWorld(`${world.urlSlug}-b`, `${world.profileId}-b`, request);
  await seedGame(elsewhere);
  await openOther(context, elsewhere.url("/"));
  // Until now other players' analytics may land here too (that's the bug); from now on only this player's can.
  const before = (await world.events("analytics")).length;
  const mine = async () => (await world.events("analytics")).slice(before);

  await join(page);
  // A few pieces of food: the snake starts at 15 and grows by one per piece.
  await eatUntil(page, async () => (await length(page)) >= 18);

  await expect
    .poll(async () => (await mine()).map((e) => e.analyticName), { timeout: 5_000 })
    .toEqual(expect.arrayContaining(["starts", "itemsEaten"]));
  expect(await mine()).toContainEqual(expect.objectContaining({ analyticName: "starts", profileId: world.profileId }));
});

test("a player has at most one snake at a time", async ({ page, world }) => {
  test.fail(true, `${ISSUE}: every requestRestart spawns another snake for the same player`);
  await seedGame(world);
  await open(page, world.url("/"));
  await join(page);

  // The Join button disables itself, but the server accepts the event again from a modified client.
  await emitRaw(page, "requestRestart");
  // Sampled for a while rather than read once after a fixed wait: under load the extra snake can show up
  // late, or spawn into the first one and both vanish again, so a single frame can miss it.
  let most = 0;
  for (const end = Date.now() + 3000; Date.now() < end && most < 2; await page.waitForTimeout(100)) {
    most = Math.max(most, (await frame(page)).myHeads.length);
  }

  expect(most).toBe(1);
});
