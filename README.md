<div align="center">
<img src="https://global-uploads.webflow.com/62e7004a0f9b3a63b980ac3c/62e70c84dd3aac06fb2ac2b6_topia-logo-blue-2x.png" style="width: 120px; margin-bottom: 20px" alt="Topia logo">
</div>

# Wiggle

<img src="https://user-images.githubusercontent.com/3702763/49344224-f0bb8980-f67c-11e8-935c-49fb2f30b566.gif" alt="Wiggle demo">

## Introduction / Summary

Wiggle is a real-time multiplayer snake-like arcade game built on Topia's SDK. Players inside a dropped asset's private zone (or the asset's landmark zone) join a shared match; anyone outside the zone spectates. Eat food, block other wiggles, avoid getting blocked yourself — it's endless and per-instance, with one asset in one world equating to one isolated room.

> **Note:** Wiggle predates the current Topia SDK-app conventions (React + Vite + Express, server data objects, canonical README template). It's a **Lance-gg + Socket.IO** game with a vanilla-JS client and no persisted state — this README reflects that reality rather than shoehorning it into the newer template.

## Key Features

### Canvas elements & interactions

- **Iframe host asset:** a single Topia dropped asset hosts the interactive iframe. Its `assetId` and its associated **private zone** (or a landmark zone matching that `assetId`) are the only in-world footprint — the game plays out in a full-window HTML5 `<canvas>` served by this app, not on the Topia canvas itself.
- **No app-drawn dropped assets:** the server does not create, update, or delete Topia dropped assets. Nothing needs to be pre-placed beyond the iframe host asset itself.

### Gameplay

- **Join:** click _Join Game_ while inside the host asset's private/landmark zone.
- **Spectate:** click the host asset from _outside_ the zone to watch.
- **Not-in-world:** visitors who aren't in the world at all get a `Not in world` error and can't spectate.
- **Movement:** mouse (or touch) direction sets your heading.
- **Food:** red circles. Eating grows your body by one segment.
- **Blocking:** if another wiggle runs into your body, they end their run and you score.
  - Blocking a **player**: `+1 score`, your body length grows by half of theirs.
  - Blocking a **bot**: no score, but your body grows by a quarter of theirs.
- **Shrink:** your wiggle shrinks over time; the bigger it gets, the faster it shrinks.

### Admin features

None. The game has no admin panel, no reset endpoint, and no in-game config — game constants are code-baked in [`src/common/WiggleGameEngine.js`](src/common/WiggleGameEngine.js).

### Rooms

- One room per `${urlSlug}_${assetId}` — every dropped asset in every world is an isolated game.
- Bots spawn to maintain `aiCount: 1` per room; extra bots respawn when a room drops below the target.
- Empty rooms are torn down (every 500 ticks a sweep runs, disposing rooms with zero human players).

## Required Assets with Unique Names

None. The app receives the host asset's id via the iframe query and needs no fixed unique names in the world. Configure the host dropped asset with a **private zone** (or place a landmark zone whose id matches the asset), point its iframe at the Wiggle URL, and you're done.

## Technical Architecture

### Data Objects

Not used. Wiggle does **not** call `setDataObject`, `updateDataObject`, or `fetchDataObject` on the visitor, key asset, or world. All game state — wiggles, food, scores, body parts — is held in memory by [`WiggleServerEngine`](src/server/WiggleServerEngine.js) / [`WiggleGameEngine`](src/common/WiggleGameEngine.js) and is lost on process restart.

### Real-time architecture

Authoritative-server netcode via [Lance-gg](https://lance-gg.github.io/) on top of Socket.IO — **not** SSE, not polling, not plain WebSockets.

- Server: `WiggleServerEngine(io, gameEngine, { updateRate: 2, fullSyncRate: 12, timeoutInterval: 600 })` broadcasts world state; clients send input events every `client__preStep` tick.
- Client: `WiggleClientEngine` connects with `sync: "interpolate"`, `bendingIncrements: 5`, `delayInputCount: 5`.
- Application-level events layered on the same socket:
  - `inzone` — server → client, the visitor is inside the host asset's zone and can play.
  - `spectating` — server → client, the visitor is outside the zone and can only watch.
  - `error` — server → client, something went wrong (e.g., not in world).
  - `requestRestart` — client → server, restart my wiggle.

### Zone gating

On connect, the server calls `Visitor.get(...)` for the visitor and compares `visitor.privateZoneId` and `visitor.landmarkZonesString` (comma-split) against the host `assetId`:

- Match → `inzone` (can join).
- No match, but visitor is in the world → `spectating`.
- Not in the world → `error: "Not in world"`.

### Game constants

All hard-coded in `WiggleGameEngine`'s constructor:

| Constant          | Value   | Meaning                           |
| ----------------- | ------- | --------------------------------- |
| `spaceWidth`      | `8`     | World width in game units         |
| `spaceHeight`     | `20`    | World height in game units        |
| `foodCount`       | `25`    | Food items maintained per room    |
| `aiCount`         | `1`     | Bots maintained per room          |
| `startBodyLength` | `15`    | Segments a new wiggle spawns with |
| `moveDist`        | `0.035` | Distance moved per tick           |
| `eatDistance`     | `0.3`   | Head-to-food eat radius           |
| `collideDistance` | `0.2`   | Head-to-body block radius         |
| `hungerTick`      | `0.01`  | ~1% shrink rate                   |

Bots (`aiCount: 1` per room): random-walk with a 1% per-tick `turnDirection` flip, edge-bounce at world bounds.

## API Endpoints

Wiggle uses Socket.IO for gameplay; the HTTP surface is intentionally tiny.

| Method | Route            | Description                                                                              |
| ------ | ---------------- | ---------------------------------------------------------------------------------------- |
| `GET`  | `/`              | Serves `dist/index.html`.                                                                |
| `GET`  | `/system/health` | Returns `{ appVersion, status, serverStartDate, envs }` with SET/NOT-SET env-var status. |
| `GET`  | `/*`             | Static-serves the built client from `dist/` (bundle.js, main.css, images).               |

## Analytics

Analytics are fired via `visitor.updatePublicKeyAnalytics(...)`. No app-side analytics DB or endpoint.

| Event        | Fired when                                         |
| ------------ | -------------------------------------------------- |
| `starts`     | A visitor opens the iframe for this dropped asset. |
| `joins`      | A visitor clicks _Join Game_ and enters the match. |
| `itemsEaten` | A wiggle eats a food item.                         |
| `kills`      | A wiggle blocks another (player or bot).           |

Optional: if `GOOGLESHEETS_SHEET_ID` is set, `starts` events are also appended to the configured Sheet via `addNewRowToGoogleSheets`.

**Particles:** `visitor.triggerParticle({ name: "balloon_float" })` fires when a wiggle is blocked (killed).

## Environment Variables

Wiggle does **not** ship a `.env-example`. Copy the template below into `.env` at the repo root.

| Variable                    | Description                                                                 | Required |
| --------------------------- | --------------------------------------------------------------------------- | -------- |
| `INTERACTIVE_KEY`           | Topia interactive app key.                                                  | Yes      |
| `INTERACTIVE_SECRET`        | Topia interactive app secret.                                               | Yes      |
| `INSTANCE_DOMAIN`           | Topia API domain. Defaults to `api.topia.io`.                               | No       |
| `INSTANCE_PROTOCOL`         | Topia API protocol. Defaults to `https`.                                    | No       |
| `API_KEY`                   | Reported in `/system/health` for ops; not used by the SDK init here.        | No       |
| `PORT`                      | Express listen port. Defaults to `3000`.                                    | No       |
| `NODE_ENV`                  | `production` toggles structured error logging.                              | No       |
| `GOOGLESHEETS_CLIENT_EMAIL` | Google service-account email for optional analytics logging on `starts`.    | No       |
| `GOOGLESHEETS_PRIVATE_KEY`  | Google service-account private key.                                         | No       |
| `GOOGLESHEETS_SHEET_ID`     | Sheet id to append `starts` events to. If unset, Sheets logging is skipped. | No       |
| `GOOGLESHEETS_SHEET_RANGE`  | Sheet range (defaults to `Sheet1`).                                         | No       |

### Where to find `INTERACTIVE_KEY` and `INTERACTIVE_SECRET`

- [Topia Production Account Dashboard](https://topia.io/t/dashboard/integrations)

## Getting Started

```bash
# from the repo root
npm install
# `postinstall` also runs the full build (webpack + babel).

# create a .env at the repo root (see Environment Variables above)

# start the server (uses the built output in dist-server/)
npm start
```

For iterative development you need two watchers running side-by-side — there is no combined dev command:

```bash
# terminal 1 — client bundle watcher
npm run dev

# terminal 2 — after any server change under src/
npx babel src --source-maps --out-dir dist-server && node dist-server/main.js
```

## For Developers

### Built With

![Node.js](https://img.shields.io/badge/node.js-%2343853D.svg?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/express-%23000000.svg?style=for-the-badge&logo=express&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)

- **Client:** vanilla JavaScript, HTML5 canvas 2D, `lance-gg` client engine, bundled with **webpack 3**.
- **Server:** Node.js + Express 4, Socket.IO 4, `lance-gg` server engine, `@rtsdk/lance-topia` fork for Topia integration, transpiled with **Babel CLI** into `dist-server/`.
- **SDKs:** [`@rtsdk/topia`](https://metaversecloud-com.github.io/mc-sdk-js/index.html) (visitor + zone lookups, analytics, particles), [`@rtsdk/lance-topia`](https://github.com/metaversecloud-com/lance-topia) (Lance netcode fork).

### Local SDK linking

Yalc scripts are wired up in `package.json`:

```bash
npm run link-sdk           # link @rtsdk/topia from ../mc-sdk-js
npm run unlink-sdk
npm run link-lancetopia    # link @rtsdk/lance-topia from ../lance-topia
npm run unlink-lancetopia
```

### App-specific notes

- **Rendering:** HTML5 canvas 2D. Player color `#39FF14`, other players `#2121DE`, food `#FD0000`. Camera centered on the player's head, `zoom = min(h/spaceHeight, w/spaceWidth)`. Score + length rendered to DOM every 18 draws; the player's display name is drawn as a label above their head.
- **Node engine:** `>=11.0.0` (very stale — bump before touching anything else here).
- **No `.env-example`.** Care must be taken when adding secrets to `.env` — see the note below.

### Repo hygiene issues to be aware of

Two things are checked into this repo that shouldn't be:

- A `.env` file with dev/stage keys and a Google service-account private key.
- A `server.trace` file (~136 MB Lance-gg trace dump).

Both should be removed and added to `.gitignore` before adding this repo to any new distribution.

### Helpful links

- [SDK Developer docs](https://metaversecloud-com.github.io/mc-sdk-js/index.html)
- [Lance-gg documentation](https://lance-gg.github.io/)
- [Notion One Pager](https://app.notion.com/p/topiaio/Wiggle-42d0978eb1fb4c6ca9fa31c791a96146?v=71f6c3828d3b4f33960326f9bde24781)
