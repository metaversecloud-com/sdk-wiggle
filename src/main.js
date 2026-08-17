"use strict";

import path from "path";
import express from "express";
import socketIO from "socket.io";
import { Lib } from "@rtsdk/lance-topia";
import WiggleServerEngine from "./server/WiggleServerEngine";
import WiggleGameEngine from "./common/WiggleGameEngine";
import { getVersion } from "./utils/index.js";

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, "../dist/index.html");

// define routes and socket
const server = express();
server.get("/", function (req, res) {
  res.sendFile(INDEX);
});

const SERVER_START_DATE = new Date();

server.get("/system/health", (req, res) => {
  return res.json({
    appVersion: getVersion(),
    status: "OK",
    serverStartDate: SERVER_START_DATE,
    envs: {
      COMMIT_HASH: process.env.COMMIT_HASH ?? "NOT SET",
      BUILD_TIME: process.env.BUILD_TIME ?? "NOT SET",
      API_KEY: process.env.API_KEY ? "SET" : "NOT SET",
      INSTANCE_DOMAIN: process.env.INSTANCE_DOMAIN,
      INTERACTIVE_KEY: process.env.INTERACTIVE_KEY,
      GOOGLESHEETS_CLIENT_EMAIL: process.env.GOOGLESHEETS_CLIENT_EMAIL ? "SET" : "NOT SET",
      GOOGLESHEETS_SHEET_ID: process.env.GOOGLESHEETS_SHEET_ID ? "SET" : "NOT SET",
      GOOGLESHEETS_PRIVATE_KEY: process.env.GOOGLESHEETS_PRIVATE_KEY ? "SET" : "NOT SET",
      NODE_ENV: process.env.NODE_ENV,
    },
  });
});

server.use("/", express.static(path.join(__dirname, "../dist/")));
let requestHandler = server.listen(PORT, () => console.log(`Listening on ${PORT}`));
const io = socketIO(requestHandler);

// Game Instances
const gameEngine = new WiggleGameEngine({ traceLevel: Lib.Trace.TRACE_ALL });
const serverEngine = new WiggleServerEngine(io, gameEngine, {
  debug: {},
  updateRate: 2,
  fullSyncRate: 12,
  timeoutInterval: 600,
});

// start the game
serverEngine.start();
