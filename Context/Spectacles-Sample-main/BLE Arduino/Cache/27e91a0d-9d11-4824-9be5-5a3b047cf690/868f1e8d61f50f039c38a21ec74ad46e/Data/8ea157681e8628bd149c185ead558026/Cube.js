"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cube = void 0;
var __selfType = requireType("./Cube");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const CAM_DISTANCE = 50;
const FOLLOW_SPEED = 6;
let Cube = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var Cube = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.camObj = this.camObj;
            this.desiredRotation = quat.quatIdentity();
        }
        __initialize() {
            super.__initialize();
            this.camObj = this.camObj;
            this.desiredRotation = quat.quatIdentity();
        }
        onAwake() {
            this.trans = this.getSceneObject().getTransform();
            this.camTrans = this.camObj.getTransform();
            this.createEvent("UpdateEvent").bind(this.onUpdate.bind(this));
        }
        onUpdate() {
            this.softFollow();
        }
        setRotationAngle(angle) {
            try {
                var angleVec = new vec3(angle[0], angle[1], angle[2]);
                this.desiredRotation = quat.fromEulerVec(angleVec.uniformScale(MathUtils.DegToRad));
                this.trans.setWorldRotation(this.desiredRotation);
            }
            catch (e) {
                print("Error parsing JSON: " + e);
            }
        }
        softFollow() {
            var desiredPosition = this.camTrans
                .getWorldPosition()
                .add(this.camTrans.forward.uniformScale(-CAM_DISTANCE));
            this.trans.setWorldPosition(vec3.lerp(this.trans.getWorldPosition(), desiredPosition, getDeltaTime() * FOLLOW_SPEED));
        }
    };
    __setFunctionName(_classThis, "Cube");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Cube = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Cube = _classThis;
})();
exports.Cube = Cube;
//# sourceMappingURL=Cube.js.map