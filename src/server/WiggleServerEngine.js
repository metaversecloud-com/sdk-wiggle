"use strict";

import { ServerEngine } from "@rtsdk/lance-topia";
import url from "url";
import Wiggle from "../common/Wiggle";
import Food from "../common/Food";
import { addNewRowToGoogleSheets, errorHandler } from "../utils";
import { getVisitor } from "../rtsdk";
const nameGenerator = require("./NameGenerator");

export default class WiggleServerEngine extends ServerEngine {
  constructor(io, gameEngine, inputOptions) {
    super(io, gameEngine, inputOptions);
    this.gameEngine.on("postStep", this.stepLogic.bind(this));
    this.roomPopulation = {};
    this.visitor = {};
    this.urlSlug = "";
    this.isPlaying = false;
  }

  // create food and AI robots
  start() {
    super.start();
  }

  addAI(roomName) {
    let newAI = new Wiggle(this.gameEngine, null, {
      position: this.gameEngine.randPos(),
    });
    newAI.AI = true;
    newAI.direction = 0;
    newAI.turnDirection = 1;
    newAI.bodyLength = this.gameEngine.startBodyLength;
    newAI.playerId = 0;
    newAI.score = 0;
    newAI.foodEaten = 0;
    newAI.name = nameGenerator() + "Bot";
    newAI.roomName = roomName;
    this.gameEngine.addObjectToWorld(newAI);
    this.assignObjectToRoom(newAI, roomName);
  }

  addFood(roomName) {
    let newF = new Food(this.gameEngine, null, {
      position: this.gameEngine.randPos(),
    });
    newF.roomName = roomName;
    this.gameEngine.addObjectToWorld(newF);
    this.assignObjectToRoom(newF, roomName);
  }

  generateRoom(roomName) {
    for (let f = 0; f < this.gameEngine.foodCount; f++) this.addFood(roomName);
    for (let ai = 0; ai < this.gameEngine.aiCount; ai++) this.addAI(roomName);
  }

  destroyRoom(roomName) {
    let wiggles = this.gameEngine.world.queryObjects({ instanceType: Wiggle });
    let foodObjects = this.gameEngine.world.queryObjects({
      instanceType: Food,
    });

    for (let w of wiggles) {
      if (w.roomName === roomName) {
        if (!(w.id in this.gameEngine.world.objects)) return;
        this.gameEngine.removeObjectFromWorld(w.id);
      }
    }

    for (let f of foodObjects) {
      if (f.roomName === roomName) {
        if (!(f.id in this.gameEngine.world.objects)) return;
        this.gameEngine.removeObjectFromWorld(f.id);
      }
    }
    delete this.rooms[roomName];
  }

  onPlayerConnected(socket) {
    super.onPlayerConnected(socket);
    this.joinRoom(socket);
  }

  async joinRoom(socket) {
    try {
      const URL = socket.handshake.headers.referer;
      const parts = url.parse(URL, true);
      const query = parts.query;
      const req = { body: query }; // Used for interactive assets
      const { assetId, displayName, identityId, urlSlug } = query;
      const roomName = `${urlSlug}_${assetId}`;
      this.urlSlug = urlSlug;

      if (!roomName) return;

      const { success, visitor, isInZone } = await getVisitor(query);
      if (!success) return socket.emit("error", message);
      this.visitor = visitor;

      const { profileId, username } = visitor;
      if (!this.rooms || !this.rooms[roomName]) {
        super.createRoom(roomName);
        this.generateRoom(roomName);
      }

      this.roomPopulation[roomName] = this.roomPopulation[roomName] || 0;
      this.roomPopulation[roomName]++;

      super.assignPlayerToRoom(socket.playerId, roomName);
      if (isInZone) {
        socket.emit("inzone");

        const makePlayerWiggle = async () => {
          this.isPlaying = true;
          let player = new Wiggle(this.gameEngine, null, {
            position: this.gameEngine.randPos(),
          });
          player.direction = 0;
          player.bodyLength = this.gameEngine.startBodyLength;
          player.playerId = socket.playerId;
          player.score = 0;
          player.foodEaten = 0;
          player.name = username;
          player.req = req;
          player.roomName = roomName;
          player.profileId = profileId;

          this.gameEngine.addObjectToWorld(player);
          this.assignObjectToRoom(player, roomName);

          this.visitor.updatePublicKeyAnalytics([{ analyticName: "starts", profileId, uniqueKey: profileId, urlSlug }]);
          addNewRowToGoogleSheets([
            {
              identityId,
              displayName,
              event: "starts",
              urlSlug,
            },
          ]);
        };

        // handle client restart requests
        socket.on("requestRestart", makePlayerWiggle);
      } else {
        // User is spectating because not in private zone
        socket.emit("spectating");
      }
      this.visitor.updatePublicKeyAnalytics([{ analyticName: "joins", profileId, uniqueKey: profileId, urlSlug }]);
    } catch (error) {
      errorHandler({
        error,
        functionName: "joinRoom",
        message: "Error joining room",
      });
    }
  }

  onPlayerDisconnected(socketId, playerId) {
    super.onPlayerDisconnected(socketId, playerId);
    let playerWiggle = this.gameEngine.world.queryObject({ playerId });

    if (playerWiggle) {
      const { roomName } = playerWiggle;
      this.gameEngine.removeObjectFromWorld(playerWiggle.id);
      let wiggles = this.gameEngine.world.queryObjects({
        instanceType: Wiggle,
        roomName,
      });
      if (wiggles.length <= this.gameEngine.aiCount) this.addAI(roomName);
    }
  }

  // Eating Food:
  // increase body length, and remove the food
  wiggleEatFood(w, f) {
    if (!f) return;
    if (!(f.id in this.gameEngine.world.objects)) return;
    this.gameEngine.removeObjectFromWorld(f.id);
    w.bodyLength++;
    w.foodEaten++;
    try {
      if (!w.AI) this.visitor.updatePublicKeyAnalytics([{ analyticName: "itemsEaten" }]);
    } catch (error) {
      console.error(error);
    }
    if (f) this.addFood(f.roomName);
  }

  async wiggleHitWiggle(w1, w2) {
    // w2 is the winner
    if (!(w2.id in this.gameEngine.world.objects) || !(w1.id in this.gameEngine.world.objects)) return;
    if (w1.destroyed) return;
    w1.destroyed = true; // Handles race condition that happens when multiple body parts get hit

    if (!w1.AI) {
      // Wiggle is player not bot
      w2.score++;
      w2.bodyLength += w1.bodyLength / 2; // Blocking other player steals more length
    } else {
      w2.bodyLength += w1.bodyLength / 4;
    }

    if (!w2.AI) {
      try {
        this.visitor.updatePublicKeyAnalytics([{ analyticName: "kills", profileId: this.visitor.profileId }]);
        this.visitor.triggerParticle({ name: "balloon_float" });
      } catch (error) {
        console.error(error);
      }
    }

    this.wiggleDestroyed(w1);
  }

  wiggleDestroyed(w) {
    if (!(w.id in this.gameEngine.world.objects)) return;
    this.gameEngine.removeObjectFromWorld(w.id);
    let wiggles = this.gameEngine.world.queryObjects({
      instanceType: Wiggle,
      roomName: w.roomName,
    });
    if (wiggles.length <= this.gameEngine.aiCount) this.addAI(w.roomName);
  }

  // Used to clean up rooms with no players and prevent movement
  getRoomsWithPlayers() {
    let roomPopulation = {};
    for (const prop in this.connectedPlayers) {
      const player = this.connectedPlayers[prop];
      roomPopulation[player.roomName] = roomPopulation[player.roomName] || 0;
      roomPopulation[player.roomName]++;
    }
    // Destroy all rooms that don't currently have players
    for (var roomName in this.roomPopulation) {
      if (!roomPopulation[roomName]) this.destroyRoom(roomName);
    }
    this.roomPopulation = roomPopulation;
  }

  stepLogic(stepObj) {
    // TODO: possibly make more efficient by only looping through active rooms with this.rooms
    // Can add roomName to queryObjects
    let wiggles = this.gameEngine.world.queryObjects({ instanceType: Wiggle });
    let foodObjects = this.gameEngine.world.queryObjects({ instanceType: Food });

    // Check room populations every 500 ticks to prevent game logic in rooms that have no players
    if (stepObj.step % 500 === 0) this.getRoomsWithPlayers();

    for (let w of wiggles) {
      // Skip if that room doesn't have anyone in it
      if (!this.roomPopulation[w.roomName] || !this.rooms[w.roomName]) continue;

      // check for collision
      for (let w2 of wiggles) {
        if (w === w2 || w.roomName !== w2.roomName) continue; // Don't have collision if in different rooms

        for (let i = 0; i < w2.bodyParts.length; i++) {
          let distance = w2.bodyParts[i].clone().subtract(w.position);
          if (distance.length() < this.gameEngine.collideDistance) {
            this.wiggleHitWiggle(w, w2);
            continue;
          }
        }
      }

      // check for food-eating
      for (let f of foodObjects) {
        if (w.roomName !== f.roomName) continue;
        let distance = w.position.clone().subtract(f.position);
        if (distance.length() < this.gameEngine.eatDistance) this.wiggleEatFood(w, f);
      }

      // Slowly (and somewhat randomly) reduce length to prevent just sitting and hiding
      if (Math.random() < 0.02) {
        w.bodyLength -= w.bodyLength * this.gameEngine.hungerTick;
        if (w.bodyLength < 1) this.wiggleDestroyed(w);
      }

      // move AI wiggles
      if (w.AI) {
        if (Math.random() < 0.01) w.turnDirection *= -1;
        w.direction += (w.turnDirection * (Math.random() - 0.9)) / 20;
        if (w.position.y >= this.gameEngine.spaceHeight / 2) w.direction = -Math.PI / 2;
        if (w.position.y <= -this.gameEngine.spaceHeight / 2) w.direction = Math.PI / 2;
        if (w.position.x >= this.gameEngine.spaceWidth / 2) w.direction = Math.PI;
        if (w.position.x <= -this.gameEngine.spaceWidth / 2) w.direction = 0;
        if (w.direction > Math.PI * 2) w.direction -= Math.PI * 2;
        if (w.direction < 0) w.direction += Math.PI * 2;
      }
    }
  }
}
