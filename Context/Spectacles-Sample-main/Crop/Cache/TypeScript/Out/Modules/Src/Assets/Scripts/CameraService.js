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
exports.CameraService = void 0;
var __selfType = requireType("./CameraService");
function component(target) { target.getTypeName = function () { return __selfType; }; }
let CameraService = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var CameraService = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.editorCamera = this.editorCamera;
            this.specsLeftCamera = this.specsLeftCamera;
            this.specsRightCamera = this.specsRightCamera;
            this.screenCropTexture = this.screenCropTexture;
            this.deviceCamTexture = this.deviceCamTexture;
            this.isEditor = global.deviceInfoSystem.isEditor();
            this.camTexture = null;
            this.cropProvider = null;
            this.camModule = require("LensStudio:CameraModule");
        }
        __initialize() {
            super.__initialize();
            this.editorCamera = this.editorCamera;
            this.specsLeftCamera = this.specsLeftCamera;
            this.specsRightCamera = this.specsRightCamera;
            this.screenCropTexture = this.screenCropTexture;
            this.deviceCamTexture = this.deviceCamTexture;
            this.isEditor = global.deviceInfoSystem.isEditor();
            this.camTexture = null;
            this.cropProvider = null;
            this.camModule = require("LensStudio:CameraModule");
        }
        onAwake() {
            this.createEvent("OnStartEvent").bind(this.start.bind(this));
        }
        start() {
            var camID = this.isEditor
                ? CameraModule.CameraId.Default_Color
                : CameraModule.CameraId.Right_Color;
            var camRequest = CameraModule.createCameraRequest();
            camRequest.cameraId = camID;
            camRequest.imageSmallerDimension = this.isEditor ? 352 : 756;
            this.camTexture = this.camModule.requestCamera(camRequest);
            var camTexControl = this.camTexture.control;
            camTexControl.onNewFrame.add(() => { });
            this.cropProvider = this.screenCropTexture.control;
            this.cropProvider.inputTexture = this.camTexture;
            this.cropProvider;
            if (this.isEditor) {
                return;
            }
            var leftTrackingCamera = global.deviceInfoSystem.getTrackingCameraForId(camID);
            var rightTrackingCamera = global.deviceInfoSystem.getTrackingCameraForId(CameraModule.CameraId.Right_Color);
            this.SetUpVirtualCamera(this.specsLeftCamera, leftTrackingCamera);
            this.SetUpVirtualCamera(this.specsRightCamera, rightTrackingCamera);
        }
        SetUpVirtualCamera(camComp, trackingCam) {
            //set pose
            var camTrans = camComp.getSceneObject().getTransform();
            camTrans.setLocalTransform(trackingCam.pose);
            //set intrinsics
            var aspect = trackingCam.resolution.x / trackingCam.resolution.y;
            camComp.aspect = aspect;
            const avgFocalLengthPixels = (trackingCam.focalLength.x + trackingCam.focalLength.y) / 2;
            const fovRadians = 2 * Math.atan(trackingCam.resolution.y / 2 / avgFocalLengthPixels);
            camComp.fov = fovRadians;
        }
        WorldToEditorCameraSpace(worldPos) {
            return this.CameraToScreenSpace(this.editorCamera, worldPos);
        }
        WorldToTrackingLeftCameraSpace(worldPos) {
            return this.CameraToScreenSpace(this.specsLeftCamera, worldPos);
        }
        WorldToTrackingRightCameraSpace(worldPos) {
            return this.CameraToScreenSpace(this.specsRightCamera, worldPos);
        }
        CameraToScreenSpace(camComp, worldPos) {
            var screenPoint = camComp.worldSpaceToScreenSpace(worldPos);
            var localX = this.Remap(screenPoint.x, 0, 1, -1, 1);
            var localY = this.Remap(screenPoint.y, 1, 0, -1, 1);
            return new vec2(localX, localY);
        }
        Remap(value, low1, high1, low2, high2) {
            return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
        }
    };
    __setFunctionName(_classThis, "CameraService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        CameraService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return CameraService = _classThis;
})();
exports.CameraService = CameraService;
//# sourceMappingURL=CameraService.js.map