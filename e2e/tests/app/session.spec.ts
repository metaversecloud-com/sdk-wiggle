// Joining a Wiggle room. The server reads the session credentials from the Referer of the socket.io
// handshake (the page URL Topia opened), checks the visitor with Topia, and lets them play only while
// they stand in the game asset's zone; everyone else spectates.
import { INTERACTIVE_SECRET } from "../../constants";
import { withPrivateServer } from "../../helpers/privateServer";
import { expect, test, TopiaWorld } from "../../fixtures";
import { emitRaw, frame, recordGame, seedGame, waitForMySnake, waitForRoom } from "./wiggle";

const ISSUE = "EXP-467";

test.beforeEach(async ({ page }) => {
  await recordGame(page);
});

test("a player in the game zone gets the Join Game button and a snake when they join", async ({ page, world }) => {
  await seedGame(world);
  await page.goto(world.url("/"));

  await expect(page.locator("#joinGame")).toHaveClass("show");
  await expect(page.locator("#spectating")).toHaveClass("hidden");
  await waitForRoom(page);
  expect((await frame(page)).myHeads).toHaveLength(0);

  await page.locator("#joinGame").click();

  await expect(page.locator("#instructions")).toHaveClass("hidden");
  await expect(page.locator("#joinGame")).toBeDisabled();
  await waitForMySnake(page);
  expect((await frame(page)).myHeads).toHaveLength(1);
  await expect(page.locator("#wiggle-length")).toContainText("Your Length:");
  await expect(page.locator("#score")).toHaveText("Your Score: 0");
});

test("opening the game records a 'joins' analytic for the player's world", async ({ page, world }) => {
  await seedGame(world);
  await page.goto(world.url("/"));
  await waitForRoom(page);

  await expect
    .poll(async () => (await world.events("analytics")).filter((e) => e.analyticName === "joins"))
    .toEqual([
      expect.objectContaining({
        profileId: world.profileId,
        uniqueKey: world.profileId,
        urlSlug: world.urlSlug,
        sessionVisitorId: "42",
      }),
    ]);
});

test("a visitor outside the game zone spectates and can't join", async ({ page, world }) => {
  await seedGame(world, { inZone: false });
  await page.goto(world.url("/"));

  await expect(page.locator("#spectating")).toHaveClass("show");
  await waitForRoom(page);
  await expect(page.locator("#joinGame")).toHaveClass("hidden");
  // Spectators still count as a join.
  await expect
    .poll(async () => (await world.events("analytics")).filter((e) => e.analyticName === "joins"))
    .toEqual([expect.objectContaining({ profileId: world.profileId })]);
});

test("a spectator can't spawn a snake by sending the join event themselves", async ({ page, world }) => {
  await seedGame(world, { inZone: false });
  await page.goto(world.url("/"));
  await expect(page.locator("#spectating")).toHaveClass("show");
  await waitForRoom(page);

  await emitRaw(page, "requestRestart");
  await page.waitForTimeout(1500);

  expect((await frame(page)).myHeads).toHaveLength(0);
});

test("a visitor who walks into the game zone can then join", async ({ page, world }) => {
  test.fail(true, `${ISSUE}: the zone is only checked when the socket connects`);
  await seedGame(world, { inZone: false });
  await page.goto(world.url("/"));
  await expect(page.locator("#spectating")).toHaveClass("show");
  await waitForRoom(page);

  await world.updateVisitor({ landmarkZonesString: world.assetId });

  // The page tells spectators to "Walk into game zone to play".
  await expect(page.locator("#joinGame")).toHaveClass("show", { timeout: 10_000 });
});

test("without session credentials nobody gets into a room", async ({ page, world }) => {
  await seedGame(world);
  await page.goto("/");
  await expect
    .poll(() => page.evaluate(() => (window as any).__sockets.some((s: WebSocket) => s.readyState === 1)))
    .toBe(true);
  await page.waitForTimeout(1500);

  await expect(page.locator("#joinGame")).toHaveClass("hidden");
  await expect(page.locator("#spectating")).toHaveClass("hidden");
  // A modified client can't spawn a snake either.
  await emitRaw(page, "requestRestart");
  await page.waitForTimeout(1000);
  expect((await frame(page)).myHeads).toHaveLength(0);
});

test("a visitor Topia can't confirm doesn't get into a room", async ({ page, world }) => {
  await seedGame(world, { failures: { [`GET /api/v1/world/${world.urlSlug}/visitors/42`]: 500 } });
  await page.goto(world.url("/"));
  await expect.poll(async () => (await world.events("injected-failure")).length).toBeGreaterThan(0);
  await page.waitForTimeout(1500);

  await expect(page.locator("#joinGame")).toHaveClass("hidden");
  await emitRaw(page, "requestRestart");
  await page.waitForTimeout(1000);
  expect((await frame(page)).myHeads).toHaveLength(0);
  expect(await world.events("analytics")).toEqual([]);
});

test("a visitor without a valid session doesn't see other worlds' games", async ({ page, world, context, request }) => {
  test.slow();
  test.fail(true, `${ISSUE}: sockets left in Lance's lobby room get objects created in every room`);
  // On a private instance: which room gets another room's new objects depends on the order rooms were
  // created in, and the shared server's rooms come and go with every other test.
  const { result, error } = await withPrivateServer(async (origin) => {
    // What the server sends this page (Lance world updates are binary; strings are UTF-16).
    const received: Buffer[] = [];
    page.on("websocket", (socket) => socket.on("framereceived", ({ payload }) => received.push(Buffer.from(payload))));
    await recordGame(page);
    await page.goto(`${origin}/`);
    await expect
      .poll(() => page.evaluate(() => (window as any).__sockets.some((s: WebSocket) => s.readyState === 1)))
      .toBe(true);

    // Players start games in other worlds (each one creates a room, then a snake).
    const names: string[] = [];
    for (let k = 0; k < 3; k++) {
      const elsewhere = new TopiaWorld(`${world.urlSlug}-${k}`, `${world.profileId}-${k}`, request);
      names.push(`player-in-world-${k}`);
      await seedGame(elsewhere, { visitor: { username: names[k] } });
      const other = await context.newPage();
      await recordGame(other);
      await other.goto(`${origin}${elsewhere.url("/")}`);
      await waitForRoom(other);
      await other.locator("#joinGame").click();
      await waitForMySnake(other);
      await other.close();
    }
    await page.waitForTimeout(500);

    const utf16 = (text: string) => [Buffer.from(text, "utf16le"), Buffer.from(text, "utf16le").swap16()];
    return names.filter((name) => received.some((frame) => utf16(name).some((bytes) => frame.includes(bytes))));
  });

  expect(error).toBeUndefined();
  expect(result).toEqual([]);
});

test("a visitor Topia can't confirm is told why they can't play", async ({ page, world }) => {
  test.fail(true, `${ISSUE}: the server emits the error as a bare string and the client only shows error.message`);
  await seedGame(world, { failures: { [`GET /api/v1/world/${world.urlSlug}/visitors/42`]: 500 } });
  await page.goto(world.url("/"));

  await expect(page.locator("#error")).toContainText("Error getting visitor", { timeout: 10_000 });
});

test("the interactive secret never reaches the browser, in the page or on the socket", async ({ page, world }) => {
  await seedGame(world);
  const seen: string[] = [];
  page.on("response", async (response) => seen.push(await response.text().catch(() => "")));
  page.on("websocket", (socket) => {
    socket.on("framereceived", ({ payload }) => seen.push(String(payload)));
  });

  await page.goto(world.url("/"));
  await page.locator("#joinGame").click();
  await waitForMySnake(page);
  await page.waitForTimeout(1000);

  expect(seen.length).toBeGreaterThan(3);
  for (const text of seen) {
    for (const marker of [INTERACTIVE_SECRET, "interactiveSecret", "InteractiveJWT"]) {
      expect(text, `the browser received "${marker}"`).not.toContain(marker);
    }
  }
});
