"use strict";

import { GameEngine, SimplePhysicsEngine, TwoVector } from "@rtsdk/lance-topia";
import Wiggle from "./Wiggle";
import Food from "./Food";

export default class WiggleGameEngine extends GameEngine {
  constructor(options) {
    super(options);
    this.physicsEngine = new SimplePhysicsEngine({
      gameEngine: this,
      collisions: { autoResolve: false },
    });
    this.on("preStep", this.moveAll.bind(this));

    // game variables
    Object.assign(this, {
      foodRadius: 0.13,
      headRadius: 0.1,
      bodyRadius: 0.2,
      eyeDist: 0.12,
      eyeRadius: 0.05,
      eyeAngle: 0.8,
      spaceWidth: 8,
      spaceHeight: 20,
      moveDist: 0.035,
      foodCount: 25,
      eatDistance: 0.3,
      collideDistance: 0.2,
      startBodyLength: 15,
      aiCount: 1,
      directionStop: 100,
      hungerTick: 0.01,
      xpPerBlock: 100,
      xpPerFood: 1,
      xpLevelConstant: 0.04,
      error: "",
    });
  }

  registerClasses(serializer) {
    serializer.registerClass(Wiggle);
    serializer.registerClass(Food);
  }

  start() {
    super.start();
  }

  randPos() {
    let x = (Math.random() - 0.5) * this.spaceWidth;
    let y = (Math.random() - 0.5) * this.spaceHeight;
    return new TwoVector(x, y);
  }

  moveAll(stepInfo) {
    if (stepInfo.isReenact) return;

    this.world.forEachObject((id, obj) => {
      if (obj instanceof Wiggle) {
        // if the position changed, add a body part and trim the length
        let pos = obj.position.clone();
        if (obj.bodyParts.length === 0 || pos.subtract(obj.bodyParts[obj.bodyParts.length - 1]).length() > 0.05) {
          obj.bodyParts.push(obj.position.clone());
          while (obj.bodyLength < obj.bodyParts.length) obj.bodyParts.shift();
        }

        // if not stopped, move along
        if (obj.direction === this.directionStop) return;
        let move = new TwoVector(Math.cos(obj.direction), Math.sin(obj.direction));
        move.multiplyScalar(this.moveDist);
        obj.position.add(move);
        obj.position.y = Math.min(obj.position.y, this.spaceHeight / 2);
        obj.position.y = Math.max(obj.position.y, -this.spaceHeight / 2);
        obj.position.x = Math.min(obj.position.x, this.spaceWidth / 2);
        obj.position.x = Math.max(obj.position.x, -this.spaceWidth / 2);
      }
    });
  }

  processInput(inputData, playerId) {
    super.processInput(inputData, playerId);

    // get the player's primary object
    let player = this.world.queryObject({ playerId });
    if (player) {
      player.direction = inputData.input;
    }
  }
}
