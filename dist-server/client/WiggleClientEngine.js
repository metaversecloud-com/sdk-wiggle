"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _lanceTopia = require("@rtsdk/lance-topia");
var _WiggleRenderer = _interopRequireDefault(require("../client/WiggleRenderer"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _get() { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get.bind(); } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(arguments.length < 3 ? target : receiver); } return desc.value; }; } return _get.apply(this, arguments); }
function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
var WiggleClientEngine = /*#__PURE__*/function (_ClientEngine) {
  _inherits(WiggleClientEngine, _ClientEngine);
  var _super = _createSuper(WiggleClientEngine);
  function WiggleClientEngine(gameEngine, options) {
    var _this;
    _classCallCheck(this, WiggleClientEngine);
    _this = _super.call(this, gameEngine, options, _WiggleRenderer["default"]);
    var params = new Proxy(new URLSearchParams(window.location.search), {
      get: function get(searchParams, prop) {
        return searchParams.get(prop);
      }
    });
    var assetId = params["assetId"];
    var urlSlug = params["urlSlug"];
    _this.roomName = "".concat(urlSlug, "_").concat(assetId);

    // show try-again button
    gameEngine.on("objectDestroyed", function (obj) {
      if (obj.playerId === gameEngine.playerId) {
        document.body.classList.add("lostGame");
        document.querySelector("#tryAgain").disabled = false;
        document.querySelector("#tryAgain").className = "show";
      }
    });

    // restart game
    document.querySelector("#tryAgain").addEventListener("click", function (clickEvent) {
      _this.socket.emit("requestRestart");
      clickEvent.currentTarget.disabled = true;
      document.querySelector("#tryAgain").className = "hidden";
      document.body.classList.remove("lostGame");
    });
    _this.mouseX = null;
    _this.mouseY = null;
    document.addEventListener("mousemove", _this.updateMouseXY.bind(_assertThisInitialized(_this)), false);
    document.addEventListener("mouseenter", _this.updateMouseXY.bind(_assertThisInitialized(_this)), false);
    document.addEventListener("touchmove", _this.updateMouseXY.bind(_assertThisInitialized(_this)), false);
    document.addEventListener("touchenter", _this.updateMouseXY.bind(_assertThisInitialized(_this)), false);
    _this.gameEngine.on("client__preStep", _this.sendMouseAngle.bind(_assertThisInitialized(_this)));
    return _this;
  }
  _createClass(WiggleClientEngine, [{
    key: "updateMouseXY",
    value: function updateMouseXY(e) {
      e.preventDefault();
      if (e.touches) e = e.touches.item(0);
      this.mouseX = e.pageX;
      this.mouseY = e.pageY;
    }
  }, {
    key: "sendMouseAngle",
    value: function sendMouseAngle() {
      var player = this.gameEngine.world.queryObject({
        playerId: this.gameEngine.playerId
      });
      if (this.mouseY === null || player === null) return;
      var mouseX = (this.mouseX - document.body.clientWidth / 2) / this.zoom;
      var mouseY = (this.mouseY - document.body.clientHeight / 2) / this.zoom;
      var dx = mouseY - player.position.y;
      var dy = mouseX - player.position.x;
      if (Math.sqrt(dx * dx + dy * dy) < 0.5) {
        this.sendInput(this.gameEngine.directionStop, {
          movement: true
        });
        return;
      }
      var angle = Math.atan2(dx, dy);
      this.sendInput(angle, {
        movement: true
      });
    }
  }, {
    key: "connect",
    value: function connect() {
      var _this2 = this;
      return _get(_getPrototypeOf(WiggleClientEngine.prototype), "connect", this).call(this).then(function () {
        _this2.socket.on("spectating", function () {
          console.log("spectating");
          document.querySelector("#spectating").className = "show";
        });
        _this2.socket.on("inzone", function () {
          document.querySelector("#spectating").className = "hidden";
          document.querySelector("#joinGame").className = "show";
          document.querySelector("#joinGame").addEventListener("click", function (clickEvent) {
            _this2.socket.emit("requestRestart");
            document.querySelector("#joinGame").className = "hidden";
            document.querySelector("#instructions").className = "hidden";
            clickEvent.currentTarget.disabled = true;
          });
        });
        _this2.socket.on("error", function (e) {
          console.error("error", e);
          if (e !== null && e !== void 0 && e.message) document.querySelector("#error").innerHTML = e.message;
        });
        _this2.socket.on("connection_error", function (e) {
          console.error("Socket connection error", e);
        });
        _this2.socket.on("disconnect", function (e) {
          console.log("disconnected");
          document.body.classList.add("disconnected");
          document.body.classList.remove("gameActive");
        });
      });
    }
  }]);
  return WiggleClientEngine;
}(_lanceTopia.ClientEngine);
exports["default"] = WiggleClientEngine;
//# sourceMappingURL=WiggleClientEngine.js.map