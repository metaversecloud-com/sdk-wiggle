// Helpers for driving Wiggle, a Lance (socket.io) game drawn on a canvas. The game state isn't exposed to
// the page, so an init script records what the renderer draws: every circle is drawn with ctx.arc in
// world coordinates (the canvas is translated and scaled first), and the colour and radius tell what it
// is (WiggleRenderer.drawWiggle / drawFood). It also keeps the game's WebSocket so a test can send raw
// socket.io events the UI wouldn't.
import type { Page } from "@playwright/test";
import { expect, type SeedOptions, type TopiaWorld } from "../../fixtures";

export type Point = { x: number; y: number };
export type Frame = {
  /** Head of each snake this page's player owns (green). */
  myHeads: Point[];
  myBody: Point[];
  /** Heads and bodies of every other snake (bots and other players, blue). */
  otherHeads: Point[];
  otherBody: Point[];
  food: Point[];
  /** Names drawn over the snakes. */
  names: string[];
};

const PLAYER = "#39ff14";
const OTHER = "#2121de";
const FOOD = "#fd0000";

/** Installs the canvas and WebSocket recorders; call before page.goto. */
export const recordGame = async (page: Page) => {
  await page.addInitScript(
    ({ PLAYER, OTHER, FOOD }) => {
      const w = window as any;
      const empty = () => ({ myHeads: [], myBody: [], otherHeads: [], otherBody: [], food: [], names: [] });
      let current = empty();
      w.__frame = empty();
      w.__frames = 0;
      const proto = CanvasRenderingContext2D.prototype;
      const clearRect = proto.clearRect;
      proto.clearRect = function (...args: any[]) {
        // A new frame starts with clearRect (WiggleRenderer.draw).
        w.__frame = current;
        w.__frames++;
        current = empty();
        return clearRect.apply(this, args as any);
      };
      const arc = proto.arc;
      proto.arc = function (x: number, y: number, radius: number, ...rest: any[]) {
        const style = String(this.fillStyle).toLowerCase();
        const point = { x, y };
        if (style === FOOD) current.food.push(point);
        else if (style === PLAYER) (radius < 0.15 ? current.myHeads : current.myBody).push(point);
        else if (style === OTHER) (radius < 0.15 ? current.otherHeads : current.otherBody).push(point);
        return arc.call(this, x, y, radius, ...rest);
      };
      const fillText = proto.fillText;
      proto.fillText = function (text: string, ...rest: any[]) {
        current.names.push(String(text));
        return fillText.call(this, text, ...rest);
      };
      // The game's socket.io connection, once it upgrades to a WebSocket.
      const NativeWebSocket = window.WebSocket;
      w.__sockets = [];
      w.WebSocket = function (...args: any[]) {
        const socket = new (NativeWebSocket as any)(...args);
        w.__sockets.push(socket);
        return socket;
      } as any;
      w.WebSocket.prototype = NativeWebSocket.prototype;
      Object.assign(w.WebSocket, { CONNECTING: 0, OPEN: 1, CLOSING: 2, CLOSED: 3 });
    },
    { PLAYER, OTHER, FOOD },
  );
};

/** The last complete frame the renderer drew. */
export const frame = (page: Page): Promise<Frame> => page.evaluate(() => (window as any).__frame);

/**
 * Waits until the server put the player in the room (it says "inzone" or "spectating" once it has) and the
 * renderer draws the room. Food alone isn't proof: a socket still waiting for its visitor check sits in
 * Lance's lobby room, which also gets objects created in other rooms.
 */
export const waitForRoom = async (page: Page) => {
  await expect(page.locator("#joinGame.show, #spectating.show")).toHaveCount(1, { timeout: 15_000 });
  await expect.poll(async () => (await frame(page)).food.length, { timeout: 15_000 }).toBeGreaterThan(0);
};

/** Waits until the page's player has a snake on the board, and returns how many it has. */
export const waitForMySnake = async (page: Page) => {
  await expect.poll(async () => (await frame(page)).myHeads.length, { timeout: 15_000 }).toBeGreaterThan(0);
};

/**
 * Sends a raw socket.io event on the game's connection (e.g. "requestRestart"), as a modified client
 * could. Waits for the WebSocket upgrade first.
 */
export const emitRaw = async (page: Page, event: string) => {
  await expect
    .poll(() => page.evaluate(() => (window as any).__sockets.some((s: WebSocket) => s.readyState === 1)), {
      timeout: 15_000,
    })
    .toBe(true);
  await page.evaluate((packet) => {
    const socket = (window as any).__sockets.filter((s: WebSocket) => s.readyState === 1).at(-1);
    socket.send(packet);
  }, `42${JSON.stringify([event])}`);
};

/** Page coordinates of a world point (the renderer centres the board and scales it to fit). */
const toScreen = async (page: Page, { x, y }: Point) => {
  const { width, height } = page.viewportSize()!;
  // WiggleRenderer: zoom = min(height / spaceHeight, width / spaceWidth), spaceWidth 8, spaceHeight 20.
  const zoom = Math.min(height / 20, width / 8);
  return { x: width / 2 + x * zoom, y: height / 2 + y * zoom };
};

/** Points the snake at a world point (the client steers the head towards the mouse). */
export const steerTo = async (page: Page, point: Point) => {
  const { x, y } = await toScreen(page, point);
  await page.mouse.move(x, y);
};

/**
 * Steers the head through a point: the client stops a snake whose head is within 0.5 of the mouse, which
 * is farther than the 0.3 it needs to eat or hit something, so aim 1 past the point.
 */
const steerThrough = async (page: Page, head: Point, point: Point) => {
  const d = distance(head, point) || 1;
  // Kept on the board (8 x 20): the page gets no mouse events outside the viewport.
  const x = Math.max(-3.95, Math.min(3.95, point.x + (point.x - head.x) / d));
  const y = Math.max(-9.95, Math.min(9.95, point.y + (point.y - head.y) / d));
  await steerTo(page, { x, y });
};

/** Food this close to the board's edge can't be overshot, and the snake would stop short of it. */
export const nearEdge = ({ x, y }: Point) => Math.abs(x) > 3.4 || Math.abs(y) > 9.4;

const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
/** Distance from p to the segment a-b. */
const toSegment = (p: Point, a: Point, b: Point) => {
  const length = distance(a, b) ** 2;
  if (!length) return distance(p, a);
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / length));
  return distance(p, { x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) });
};

/**
 * Steers the page's snake to the nearest food it can reach without crossing another snake, until
 * `done()` holds or the time runs out.
 */
export const eatUntil = async (page: Page, done: () => Promise<boolean>, timeoutMs = 45_000) => {
  for (const started = Date.now(); Date.now() - started < timeoutMs; ) {
    if (await done()) return;
    const { myHeads, food, otherBody, otherHeads } = await frame(page);
    const head = myHeads[0];
    if (head) {
      const others = [...otherBody, ...otherHeads];
      const reachable = food.filter((f) => !nearEdge(f));
      const safe = reachable.filter((f) => !others.some((o) => toSegment(o, head, f) < 0.45));
      const target = (safe.length ? safe : reachable).sort((a, b) => distance(head, a) - distance(head, b))[0];
      if (target) await steerThrough(page, head, target);
    }
    await page.waitForTimeout(80);
  }
  expect(await done(), "the snake didn't get there in time").toBe(true);
};

/** Steers the page's snake head into a point (e.g. another player's body) and keeps it there. */
export const ramInto = async (page: Page, target: () => Promise<Point | undefined>, done: () => Promise<boolean>) => {
  for (const started = Date.now(); Date.now() - started < 45_000; ) {
    if (await done()) return;
    const point = await target();
    const head = (await frame(page)).myHeads[0];
    if (point && head) await steerThrough(page, head, point);
    await page.waitForTimeout(80);
  }
  expect(await done(), "the snake didn't get there in time").toBe(true);
};

export { distance };

/** Name the test's own visitor plays under. */
export const USERNAME = "e2e-player";

/**
 * world.seed with a username on every visitor (Topia always sends one, and a snake without a name breaks
 * Lance's serializer, which crashes the whole game server) and a realistic delay on the visitor check.
 * Without the delay the server's "inzone" can reach the client in the same polling response as the
 * connect packet, before WiggleClientEngine.connect() has registered its handler, and the Join button
 * never shows (an app race that real Topia latency mostly hides).
 */
export const seedGame = (world: TopiaWorld, options: SeedOptions = {}) =>
  world.seed({
    ...options,
    delays: { "/visitors/": 250, ...options.delays },
    visitor: { username: USERNAME, ...options.visitor },
    otherVisitors: Object.fromEntries(
      Object.entries(options.otherVisitors ?? {}).map(([id, v]) => [id, { username: `player-${id}`, ...v }]),
    ),
  });

/** Whether the page's player just lost (the Try Again screen). */
export const lost = async (page: Page) => (await page.locator("body").getAttribute("class"))?.includes("lostGame") ?? false;

/** Try Again, and wait for the new snake. */
export const respawn = async (page: Page) => {
  await page.locator("#tryAgain").click();
  await waitForMySnake(page);
};

/**
 * Steers the snake to a point and leaves the mouse there, so it stops next to it. Starts over if the
 * room's bot gets in the way.
 */
export const park = async (page: Page, point: Point) => {
  for (const started = Date.now(); Date.now() - started < 30_000; await page.waitForTimeout(100)) {
    if (await lost(page)) await respawn(page);
    await steerTo(page, point);
    const head = (await frame(page)).myHeads[0];
    if (head && distance(head, point) < 0.6) return;
  }
  throw new Error("the snake didn't park in time");
};
