import { ClientEngine } from "@rtsdk/lance-topia";
import WiggleRenderer from "../client/WiggleRenderer";

export default class WiggleClientEngine extends ClientEngine {
  constructor(gameEngine, options) {
    super(gameEngine, options, WiggleRenderer);

    const params = new Proxy(new URLSearchParams(window.location.search), {
      get: (searchParams, prop) => searchParams.get(prop),
    });
    const assetId = params["assetId"];
    const urlSlug = params["urlSlug"];
    this.roomName = `${urlSlug}_${assetId}`;

    // show try-again button
    gameEngine.on("objectDestroyed", (obj) => {
      if (obj.playerId === gameEngine.playerId) {
        document.body.classList.add("lostGame");
        document.querySelector("#tryAgain").disabled = false;
        document.querySelector("#tryAgain").className = "show";
      }
    });

    // restart game
    document.querySelector("#tryAgain").addEventListener("click", (clickEvent) => {
      this.socket.emit("requestRestart");
      clickEvent.currentTarget.disabled = true;
      document.querySelector("#tryAgain").className = "hidden";
      document.body.classList.remove("lostGame");
    });

    this.mouseX = null;
    this.mouseY = null;

    document.addEventListener("mousemove", this.updateMouseXY.bind(this), false);
    document.addEventListener("mouseenter", this.updateMouseXY.bind(this), false);
    document.addEventListener("touchmove", this.updateMouseXY.bind(this), false);
    document.addEventListener("touchenter", this.updateMouseXY.bind(this), false);
    this.gameEngine.on("client__preStep", this.sendMouseAngle.bind(this));
  }

  updateMouseXY(e) {
    e.preventDefault();
    if (e.touches) e = e.touches.item(0);
    this.mouseX = e.pageX;
    this.mouseY = e.pageY;
  }

  sendMouseAngle() {
    let player = this.gameEngine.world.queryObject({ playerId: this.gameEngine.playerId });
    if (this.mouseY === null || player === null) return;

    let mouseX = (this.mouseX - document.body.clientWidth / 2) / this.zoom;
    let mouseY = (this.mouseY - document.body.clientHeight / 2) / this.zoom;
    let dx = mouseY - player.position.y;
    let dy = mouseX - player.position.x;
    if (Math.sqrt(dx * dx + dy * dy) < 0.5) {
      this.sendInput(this.gameEngine.directionStop, { movement: true });
      return;
    }

    let angle = Math.atan2(dx, dy);
    this.sendInput(angle, { movement: true });
  }

  connect() {
    return super.connect().then(() => {
      this.socket.on("spectating", () => {
        console.log("spectating");
        document.querySelector("#spectating").className = "show";
      });

      this.socket.on("inzone", () => {
        document.querySelector("#spectating").className = "hidden";
        document.querySelector("#joinGame").className = "show";
        document.querySelector("#joinGame").addEventListener("click", (clickEvent) => {
          this.socket.emit("requestRestart");
          document.querySelector("#joinGame").className = "hidden";
          document.querySelector("#instructions").className = "hidden";
          clickEvent.currentTarget.disabled = true;
        });
      });

      this.socket.on("error", (e) => {
        console.error("error", e);
        if (e?.message) document.querySelector("#error").innerHTML = e.message;
      });

      this.socket.on("connection_error", (e) => {
        console.error("Socket connection error", e);
      });

      this.socket.on("disconnect", (e) => {
        console.log("disconnected");
        document.body.classList.add("disconnected");
        document.body.classList.remove("gameActive");
      });
    });
  }
}
