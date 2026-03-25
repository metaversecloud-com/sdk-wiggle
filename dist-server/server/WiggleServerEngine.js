"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _lanceTopia = require("@rtsdk/lance-topia");
var _url = _interopRequireDefault(require("url"));
var _Wiggle = _interopRequireDefault(require("../common/Wiggle"));
var _Food = _interopRequireDefault(require("../common/Food"));
var _utils = require("../utils");
var _rtsdk = require("../rtsdk");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, defineProperty = Object.defineProperty || function (obj, key, desc) { obj[key] = desc.value; }, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return defineProperty(generator, "_invoke", { value: makeInvokeMethod(innerFn, self, context) }), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; defineProperty(this, "_invoke", { value: function value(method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; } function maybeInvokeDelegate(delegate, context) { var methodName = context.method, method = delegate.iterator[methodName]; if (undefined === method) return context.delegate = null, "throw" === methodName && delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method) || "return" !== methodName && (context.method = "throw", context.arg = new TypeError("The iterator does not provide a '" + methodName + "' method")), ContinueSentinel; var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, defineProperty(Gp, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), defineProperty(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (val) { var object = Object(val), keys = []; for (var key in object) keys.push(key); return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
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
var nameGenerator = require("./NameGenerator");
var isSessionExpired = function isSessionExpired(error) {
  var _error$response;
  return (error === null || error === void 0 ? void 0 : (_error$response = error.response) === null || _error$response === void 0 ? void 0 : _error$response.status) === 401 || (error === null || error === void 0 ? void 0 : error.status) === 401 || (error === null || error === void 0 ? void 0 : error.message) === "Invalid session token";
};
var WiggleServerEngine = /*#__PURE__*/function (_ServerEngine) {
  _inherits(WiggleServerEngine, _ServerEngine);
  var _super = _createSuper(WiggleServerEngine);
  function WiggleServerEngine(io, gameEngine, inputOptions) {
    var _this;
    _classCallCheck(this, WiggleServerEngine);
    _this = _super.call(this, io, gameEngine, inputOptions);
    _this.gameEngine.on("postStep", _this.stepLogic.bind(_assertThisInitialized(_this)));
    _this.roomPopulation = {};
    _this.visitor = {};
    _this.urlSlug = "";
    _this.isPlaying = false;
    return _this;
  }

  // create food and AI robots
  _createClass(WiggleServerEngine, [{
    key: "start",
    value: function start() {
      _get(_getPrototypeOf(WiggleServerEngine.prototype), "start", this).call(this);
    }
  }, {
    key: "addAI",
    value: function addAI(roomName) {
      var newAI = new _Wiggle["default"](this.gameEngine, null, {
        position: this.gameEngine.randPos()
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
  }, {
    key: "addFood",
    value: function addFood(roomName) {
      var newF = new _Food["default"](this.gameEngine, null, {
        position: this.gameEngine.randPos()
      });
      newF.roomName = roomName;
      this.gameEngine.addObjectToWorld(newF);
      this.assignObjectToRoom(newF, roomName);
    }
  }, {
    key: "generateRoom",
    value: function generateRoom(roomName) {
      for (var f = 0; f < this.gameEngine.foodCount; f++) this.addFood(roomName);
      for (var ai = 0; ai < this.gameEngine.aiCount; ai++) this.addAI(roomName);
    }
  }, {
    key: "destroyRoom",
    value: function destroyRoom(roomName) {
      var wiggles = this.gameEngine.world.queryObjects({
        instanceType: _Wiggle["default"]
      });
      var foodObjects = this.gameEngine.world.queryObjects({
        instanceType: _Food["default"]
      });
      var _iterator = _createForOfIteratorHelper(wiggles),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var w = _step.value;
          if (w.roomName === roomName) {
            if (!(w.id in this.gameEngine.world.objects)) return;
            this.gameEngine.removeObjectFromWorld(w.id);
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      var _iterator2 = _createForOfIteratorHelper(foodObjects),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var f = _step2.value;
          if (f.roomName === roomName) {
            if (!(f.id in this.gameEngine.world.objects)) return;
            this.gameEngine.removeObjectFromWorld(f.id);
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
      delete this.rooms[roomName];
    }
  }, {
    key: "onPlayerConnected",
    value: function onPlayerConnected(socket) {
      _get(_getPrototypeOf(WiggleServerEngine.prototype), "onPlayerConnected", this).call(this, socket);
      this.joinRoom(socket);
    }
  }, {
    key: "joinRoom",
    value: function () {
      var _joinRoom = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(socket) {
        var _this2 = this;
        var URL, parts, query, req, assetId, displayName, identityId, urlSlug, roomName, _yield$getVisitor, success, visitor, isInZone, message, profileId, username, makePlayerWiggle;
        return _regeneratorRuntime().wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              _context2.prev = 0;
              URL = socket.handshake.headers.referer;
              parts = _url["default"].parse(URL, true);
              query = parts.query;
              req = {
                body: query
              }; // Used for interactive assets
              assetId = query.assetId, displayName = query.displayName, identityId = query.identityId, urlSlug = query.urlSlug;
              roomName = "".concat(urlSlug, "_").concat(assetId);
              this.urlSlug = urlSlug;
              if (roomName) {
                _context2.next = 10;
                break;
              }
              return _context2.abrupt("return");
            case 10:
              _context2.next = 12;
              return (0, _rtsdk.getVisitor)(query);
            case 12:
              _yield$getVisitor = _context2.sent;
              success = _yield$getVisitor.success;
              visitor = _yield$getVisitor.visitor;
              isInZone = _yield$getVisitor.isInZone;
              message = _yield$getVisitor.message;
              if (success) {
                _context2.next = 19;
                break;
              }
              return _context2.abrupt("return", socket.emit("error", message || "Failed to get visitor"));
            case 19:
              this.visitor = visitor;
              profileId = visitor.profileId, username = visitor.username;
              if (!this.rooms || !this.rooms[roomName]) {
                _get(_getPrototypeOf(WiggleServerEngine.prototype), "createRoom", this).call(this, roomName);
                this.generateRoom(roomName);
              }
              this.roomPopulation[roomName] = this.roomPopulation[roomName] || 0;
              this.roomPopulation[roomName]++;
              _get(_getPrototypeOf(WiggleServerEngine.prototype), "assignPlayerToRoom", this).call(this, socket.playerId, roomName);
              if (isInZone) {
                socket.emit("inzone");
                makePlayerWiggle = /*#__PURE__*/function () {
                  var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
                    var player;
                    return _regeneratorRuntime().wrap(function _callee$(_context) {
                      while (1) switch (_context.prev = _context.next) {
                        case 0:
                          _this2.isPlaying = true;
                          player = new _Wiggle["default"](_this2.gameEngine, null, {
                            position: _this2.gameEngine.randPos()
                          });
                          player.direction = 0;
                          player.bodyLength = _this2.gameEngine.startBodyLength;
                          player.playerId = socket.playerId;
                          player.score = 0;
                          player.foodEaten = 0;
                          player.name = username;
                          player.req = req;
                          player.roomName = roomName;
                          player.profileId = profileId;
                          _this2.gameEngine.addObjectToWorld(player);
                          _this2.assignObjectToRoom(player, roomName);
                          _this2.visitor.updatePublicKeyAnalytics([{
                            analyticName: "starts",
                            profileId: profileId,
                            uniqueKey: profileId,
                            urlSlug: urlSlug
                          }])["catch"](function (error) {
                            if (isSessionExpired(error)) console.log("Session expired, skipping 'starts' analytics");else console.error("Error updating 'starts' analytics", error);
                          });
                          (0, _utils.addNewRowToGoogleSheets)([{
                            identityId: identityId,
                            displayName: displayName,
                            event: "starts",
                            urlSlug: urlSlug
                          }]);
                        case 15:
                        case "end":
                          return _context.stop();
                      }
                    }, _callee);
                  }));
                  return function makePlayerWiggle() {
                    return _ref.apply(this, arguments);
                  };
                }(); // handle client restart requests
                socket.on("requestRestart", makePlayerWiggle);
              } else {
                // User is spectating because not in private zone
                socket.emit("spectating");
              }
              this.visitor.updatePublicKeyAnalytics([{
                analyticName: "joins",
                profileId: profileId,
                uniqueKey: profileId,
                urlSlug: urlSlug
              }])["catch"](function (error) {
                if (isSessionExpired(error)) console.log("Session expired, skipping 'joins' analytics");else console.error("Error updating 'joins' analytics", error);
              });
              _context2.next = 32;
              break;
            case 29:
              _context2.prev = 29;
              _context2.t0 = _context2["catch"](0);
              (0, _utils.errorHandler)({
                error: _context2.t0,
                functionName: "joinRoom",
                message: "Error joining room"
              });
            case 32:
            case "end":
              return _context2.stop();
          }
        }, _callee2, this, [[0, 29]]);
      }));
      function joinRoom(_x) {
        return _joinRoom.apply(this, arguments);
      }
      return joinRoom;
    }()
  }, {
    key: "onPlayerDisconnected",
    value: function onPlayerDisconnected(socketId, playerId) {
      _get(_getPrototypeOf(WiggleServerEngine.prototype), "onPlayerDisconnected", this).call(this, socketId, playerId);
      var playerWiggle = this.gameEngine.world.queryObject({
        playerId: playerId
      });
      if (playerWiggle) {
        var roomName = playerWiggle.roomName;
        this.gameEngine.removeObjectFromWorld(playerWiggle.id);
        var wiggles = this.gameEngine.world.queryObjects({
          instanceType: _Wiggle["default"],
          roomName: roomName
        });
        if (wiggles.length <= this.gameEngine.aiCount) this.addAI(roomName);
      }
    }

    // Eating Food:
    // increase body length, and remove the food
  }, {
    key: "wiggleEatFood",
    value: function wiggleEatFood(w, f) {
      if (!f) return;
      if (!(f.id in this.gameEngine.world.objects)) return;
      this.gameEngine.removeObjectFromWorld(f.id);
      w.bodyLength++;
      w.foodEaten++;
      if (!w.AI) {
        this.visitor.updatePublicKeyAnalytics([{
          analyticName: "itemsEaten"
        }])["catch"](function (error) {
          if (isSessionExpired(error)) console.log("Session expired, skipping 'itemsEaten' analytics");else console.error("Error updating 'itemsEaten' analytics", error);
        });
      }
      if (f) this.addFood(f.roomName);
    }
  }, {
    key: "wiggleHitWiggle",
    value: function () {
      var _wiggleHitWiggle = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(w1, w2) {
        return _regeneratorRuntime().wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              if (!(!(w2.id in this.gameEngine.world.objects) || !(w1.id in this.gameEngine.world.objects))) {
                _context3.next = 2;
                break;
              }
              return _context3.abrupt("return");
            case 2:
              if (!w1.destroyed) {
                _context3.next = 4;
                break;
              }
              return _context3.abrupt("return");
            case 4:
              w1.destroyed = true; // Handles race condition that happens when multiple body parts get hit

              if (!w1.AI) {
                // Wiggle is player not bot
                w2.score++;
                w2.bodyLength += w1.bodyLength / 2; // Blocking other player steals more length
              } else {
                w2.bodyLength += w1.bodyLength / 4;
              }
              if (!w2.AI) {
                this.visitor.updatePublicKeyAnalytics([{
                  analyticName: "kills",
                  profileId: this.visitor.profileId
                }])["catch"](function (error) {
                  if (isSessionExpired(error)) console.log("Session expired, skipping 'kills' analytics");else console.error("Error updating 'kills' analytics", error);
                });
                this.visitor.triggerParticle({
                  name: "balloon_float"
                })["catch"](function (error) {
                  if (isSessionExpired(error)) console.log("Session expired, skipping particle trigger");else console.error("Error triggering particle", error);
                });
              }
              this.wiggleDestroyed(w1);
            case 8:
            case "end":
              return _context3.stop();
          }
        }, _callee3, this);
      }));
      function wiggleHitWiggle(_x2, _x3) {
        return _wiggleHitWiggle.apply(this, arguments);
      }
      return wiggleHitWiggle;
    }()
  }, {
    key: "wiggleDestroyed",
    value: function wiggleDestroyed(w) {
      if (!(w.id in this.gameEngine.world.objects)) return;
      this.gameEngine.removeObjectFromWorld(w.id);
      var wiggles = this.gameEngine.world.queryObjects({
        instanceType: _Wiggle["default"],
        roomName: w.roomName
      });
      if (wiggles.length <= this.gameEngine.aiCount) this.addAI(w.roomName);
    }

    // Used to clean up rooms with no players and prevent movement
  }, {
    key: "getRoomsWithPlayers",
    value: function getRoomsWithPlayers() {
      var roomPopulation = {};
      for (var prop in this.connectedPlayers) {
        var player = this.connectedPlayers[prop];
        roomPopulation[player.roomName] = roomPopulation[player.roomName] || 0;
        roomPopulation[player.roomName]++;
      }
      // Destroy all rooms that don't currently have players
      for (var roomName in this.roomPopulation) {
        if (!roomPopulation[roomName]) this.destroyRoom(roomName);
      }
      this.roomPopulation = roomPopulation;
    }
  }, {
    key: "stepLogic",
    value: function stepLogic(stepObj) {
      // TODO: possibly make more efficient by only looping through active rooms with this.rooms
      // Can add roomName to queryObjects
      var wiggles = this.gameEngine.world.queryObjects({
        instanceType: _Wiggle["default"]
      });
      var foodObjects = this.gameEngine.world.queryObjects({
        instanceType: _Food["default"]
      });

      // Check room populations every 500 ticks to prevent game logic in rooms that have no players
      if (stepObj.step % 500 === 0) this.getRoomsWithPlayers();
      var _iterator3 = _createForOfIteratorHelper(wiggles),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var w = _step3.value;
          // Skip if that room doesn't have anyone in it
          if (!this.roomPopulation[w.roomName] || !this.rooms[w.roomName]) continue;

          // check for collision
          var _iterator4 = _createForOfIteratorHelper(wiggles),
            _step4;
          try {
            for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
              var w2 = _step4.value;
              if (w === w2 || w.roomName !== w2.roomName) continue; // Don't have collision if in different rooms

              for (var i = 0; i < w2.bodyParts.length; i++) {
                var distance = w2.bodyParts[i].clone().subtract(w.position);
                if (distance.length() < this.gameEngine.collideDistance) {
                  this.wiggleHitWiggle(w, w2);
                  continue;
                }
              }
            }

            // check for food-eating
          } catch (err) {
            _iterator4.e(err);
          } finally {
            _iterator4.f();
          }
          var _iterator5 = _createForOfIteratorHelper(foodObjects),
            _step5;
          try {
            for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
              var f = _step5.value;
              if (w.roomName !== f.roomName) continue;
              var _distance = w.position.clone().subtract(f.position);
              if (_distance.length() < this.gameEngine.eatDistance) this.wiggleEatFood(w, f);
            }

            // Slowly (and somewhat randomly) reduce length to prevent just sitting and hiding
          } catch (err) {
            _iterator5.e(err);
          } finally {
            _iterator5.f();
          }
          if (Math.random() < 0.02) {
            w.bodyLength -= w.bodyLength * this.gameEngine.hungerTick;
            if (w.bodyLength < 1) this.wiggleDestroyed(w);
          }

          // move AI wiggles
          if (w.AI) {
            if (Math.random() < 0.01) w.turnDirection *= -1;
            w.direction += w.turnDirection * (Math.random() - 0.9) / 20;
            if (w.position.y >= this.gameEngine.spaceHeight / 2) w.direction = -Math.PI / 2;
            if (w.position.y <= -this.gameEngine.spaceHeight / 2) w.direction = Math.PI / 2;
            if (w.position.x >= this.gameEngine.spaceWidth / 2) w.direction = Math.PI;
            if (w.position.x <= -this.gameEngine.spaceWidth / 2) w.direction = 0;
            if (w.direction > Math.PI * 2) w.direction -= Math.PI * 2;
            if (w.direction < 0) w.direction += Math.PI * 2;
          }
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
    }
  }]);
  return WiggleServerEngine;
}(_lanceTopia.ServerEngine);
exports["default"] = WiggleServerEngine;
//# sourceMappingURL=WiggleServerEngine.js.map