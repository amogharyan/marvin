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
exports.PictureBehavior = void 0;
var __selfType = requireType("./PictureBehavior");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const SIK_1 = require("SpectaclesInteractionKit.lspkg/SIK");
const BOX_MIN_SIZE = 8; //min size in cm for image capture
let PictureBehavior = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var PictureBehavior = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.circleObjs = this.circleObjs;
            this.editorCamObj = this.editorCamObj;
            this.picAnchorObj = this.picAnchorObj;
            this.loadingObj = this.loadingObj;
            this.captureRendMesh = this.captureRendMesh;
            this.screenCropTexture = this.screenCropTexture;
            this.cropRegion = this.cropRegion;
            this.chatGPT = this.chatGPT;
            this.caption = this.caption;
            this.isEditor = global.deviceInfoSystem.isEditor();
            this.rightHand = SIK_1.SIK.HandInputData.getHand("right");
            this.leftHand = SIK_1.SIK.HandInputData.getHand("left");
            this.picAnchorTrans = null;
            this.leftDown = true;
            this.rightDown = true;
            this.rotMat = new mat3();
            this.updateEvent = null;
            this.leftPinchDown = () => {
                print("LEFT Pinch down");
                this.leftDown = true;
            };
            this.leftPinchUp = () => {
                print("LEFT Pinch up");
                this.leftDown = false;
                if (!this.rightDown) {
                    this.processImage();
                }
            };
            this.rightPinchDown = () => {
                print("RIGHT Pinch down");
                this.rightDown = true;
            };
            this.rightPinchUp = () => {
                print("RIGHT Pinch up");
                this.rightDown = false;
                if (!this.leftDown) {
                    this.processImage();
                }
            };
        }
        __initialize() {
            super.__initialize();
            this.circleObjs = this.circleObjs;
            this.editorCamObj = this.editorCamObj;
            this.picAnchorObj = this.picAnchorObj;
            this.loadingObj = this.loadingObj;
            this.captureRendMesh = this.captureRendMesh;
            this.screenCropTexture = this.screenCropTexture;
            this.cropRegion = this.cropRegion;
            this.chatGPT = this.chatGPT;
            this.caption = this.caption;
            this.isEditor = global.deviceInfoSystem.isEditor();
            this.rightHand = SIK_1.SIK.HandInputData.getHand("right");
            this.leftHand = SIK_1.SIK.HandInputData.getHand("left");
            this.picAnchorTrans = null;
            this.leftDown = true;
            this.rightDown = true;
            this.rotMat = new mat3();
            this.updateEvent = null;
            this.leftPinchDown = () => {
                print("LEFT Pinch down");
                this.leftDown = true;
            };
            this.leftPinchUp = () => {
                print("LEFT Pinch up");
                this.leftDown = false;
                if (!this.rightDown) {
                    this.processImage();
                }
            };
            this.rightPinchDown = () => {
                print("RIGHT Pinch down");
                this.rightDown = true;
            };
            this.rightPinchUp = () => {
                print("RIGHT Pinch up");
                this.rightDown = false;
                if (!this.leftDown) {
                    this.processImage();
                }
            };
        }
        onAwake() {
            this.loadingObj.enabled = false;
            this.loadingTrans = this.loadingObj.getTransform();
            this.captureRendMesh.mainMaterial =
                this.captureRendMesh.mainMaterial.clone();
            this.camTrans = this.editorCamObj.getTransform();
            this.picAnchorTrans = this.picAnchorObj.getTransform();
            this.circleTrans = this.circleObjs.map((obj) => obj.getTransform());
            this.rightHand.onPinchUp.add(this.rightPinchUp);
            this.rightHand.onPinchDown.add(this.rightPinchDown);
            this.leftHand.onPinchUp.add(this.leftPinchUp);
            this.leftHand.onPinchDown.add(this.leftPinchDown);
            if (this.isEditor) {
                //place this transform in front of camera for testing
                var trans = this.getSceneObject().getTransform();
                trans.setWorldPosition(this.camTrans
                    .getWorldPosition()
                    .add(this.camTrans.forward.uniformScale(-60)));
                trans.setWorldRotation(quat.lookAt(this.camTrans.forward, vec3.up()));
                //wait for small delay and capture image
                var delayedEvent = this.createEvent("DelayedCallbackEvent");
                delayedEvent.bind(() => {
                    this.loadingObj.enabled = true;
                    this.cropRegion.enabled = false;
                    this.captureRendMesh.mainPass.captureImage =
                        ProceduralTextureProvider.createFromTexture(this.screenCropTexture);
                    this.chatGPT.makeImageRequest(this.captureRendMesh.mainPass.captureImage, (response) => {
                        this.loadingObj.enabled = false;
                        this.loadCaption(response);
                    });
                });
                delayedEvent.reset(0.1);
            }
            else {
                //send offscreen
                this.getSceneObject()
                    .getTransform()
                    .setWorldPosition(vec3.up().uniformScale(1000));
                this.updateEvent = this.createEvent("UpdateEvent");
                this.updateEvent.bind(this.update.bind(this));
            }
        }
        loadCaption(text) {
            //position caption 5cm above top of box formed by circles
            var topCenterPos = this.circleTrans[0]
                .getWorldPosition()
                .add(this.circleTrans[1].getWorldPosition())
                .uniformScale(0.5);
            var captionPos = topCenterPos.add(this.picAnchorTrans.up.uniformScale(1)); //1.5
            var captionRot = this.picAnchorTrans.getWorldRotation();
            this.caption.openCaption(text, captionPos, captionRot);
        }
        processImage() {
            if (this.updateEvent != null) {
                //remove all events
                this.removeEvent(this.updateEvent);
                this.updateEvent = null;
                this.rightHand.onPinchUp.remove(this.rightPinchUp);
                this.rightHand.onPinchDown.remove(this.rightPinchDown);
                this.leftHand.onPinchUp.remove(this.leftPinchUp);
                this.leftHand.onPinchDown.remove(this.leftPinchDown);
                //make sure image area is above threshold
                if (this.getHeight() < BOX_MIN_SIZE || this.getWidth() < BOX_MIN_SIZE) {
                    print("too small, destroying.");
                    this.getSceneObject().destroy();
                    return;
                }
                //remove update loop and process image
                this.loadingObj.enabled = true;
                this.cropRegion.enabled = false;
                this.chatGPT.makeImageRequest(this.captureRendMesh.mainPass.captureImage, (response) => {
                    this.loadingObj.enabled = false;
                    this.loadCaption(response);
                });
            }
        }
        localTopLeft() {
            return this.camTrans
                .getInvertedWorldTransform()
                .multiplyPoint(this.circleTrans[0].getWorldPosition());
        }
        localBottomRight() {
            return this.camTrans
                .getInvertedWorldTransform()
                .multiplyPoint(this.circleTrans[2].getWorldPosition());
        }
        getWidth() {
            return Math.abs(this.localBottomRight().x - this.localTopLeft().x);
        }
        getHeight() {
            return Math.abs(this.localBottomRight().y - this.localTopLeft().y);
        }
        update() {
            if (this.rightDown || this.leftDown) {
                //have to do this or else it wont show up in capture
                if (this.screenCropTexture.getColorspace() == 3) {
                    this.captureRendMesh.mainPass.captureImage =
                        ProceduralTextureProvider.createFromTexture(this.screenCropTexture);
                }
                //set top left and bottom right to both pinch positions
                this.circleTrans[0].setWorldPosition(this.leftHand.thumbTip.position);
                this.circleTrans[2].setWorldPosition(this.rightHand.thumbTip.position);
                var topLeftPos = this.circleTrans[0].getWorldPosition();
                var bottomRightPos = this.circleTrans[2].getWorldPosition();
                var centerPos = topLeftPos.add(bottomRightPos).uniformScale(0.5);
                var camPos = this.camTrans.getWorldPosition();
                var directionToCenter = camPos.sub(centerPos).normalize();
                var right = this.camTrans.up.cross(directionToCenter).normalize();
                //set top right and bottom left to remaining points to form a rectangle relative to worldCameraForward
                var width = this.getWidth();
                var topRightPos = topLeftPos.add(right.uniformScale(width)); // Add width along the X-axis
                var bottomLeftPos = bottomRightPos.add(right.uniformScale(-width)); // Subtract height along the Y-axis
                // Set the positions for the remaining corners
                this.circleTrans[1].setWorldPosition(topRightPos); // Top right
                this.circleTrans[3].setWorldPosition(bottomLeftPos); // Bottom left
                // rotate the picAnchorTrans to stay aligned with the box formed by the circles
                this.picAnchorTrans.setWorldPosition(bottomRightPos);
                var worldWidth = bottomRightPos.distance(bottomLeftPos);
                var worldHeight = topRightPos.distance(bottomRightPos);
                this.picAnchorTrans.setWorldScale(new vec3(worldWidth, worldHeight, 1));
                var rectRight = topRightPos.sub(topLeftPos).normalize();
                var rectUp = topLeftPos.sub(bottomLeftPos).normalize();
                var rectForward = rectRight.cross(rectUp).normalize();
                this.rotMat.column0 = rectRight;
                this.rotMat.column1 = rectUp;
                this.rotMat.column2 = rectForward;
                var rectRotation = quat.fromRotationMat(this.rotMat);
                this.picAnchorTrans.setWorldRotation(rectRotation);
                //set loader position to center of rectangle
                this.loadingTrans.setWorldPosition(centerPos.add(rectForward.uniformScale(0.2)));
                this.loadingTrans.setWorldRotation(rectRotation);
            }
        }
    };
    __setFunctionName(_classThis, "PictureBehavior");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PictureBehavior = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PictureBehavior = _classThis;
})();
exports.PictureBehavior = PictureBehavior;
//# sourceMappingURL=PictureBehavior.js.map