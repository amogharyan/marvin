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
exports.InteractableLineProjection = void 0;
var __selfType = requireType("./InteractableManipulatorController");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const NativeLogger_1 = require("SpectaclesInteractionKit.lspkg/Utils/NativeLogger");
const TAG = "InteractableClampController";
/**
 * Projects an interactable object's position onto a line and moves a visual reference
 * to show the clamped/projected position. Calculates normalized values for callbacks.
 */
let InteractableLineProjection = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var InteractableLineProjection = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.interactable = this.interactable;
            this.manipulationComponent = this.manipulationComponent;
            this.lineStart = this.lineStart;
            this.lineEnd = this.lineEnd;
            this.visualReference = this.visualReference;
            this.callback = this.callback;
            this.methodName = this.methodName;
            this.enableProjection = this.enableProjection;
            this.onlyDuringManipulation = this.onlyDuringManipulation;
            this.doubleMapping = this.doubleMapping;
            this.log = new NativeLogger_1.default(TAG);
            this.isManipulating = false;
            this.lastNormalizedValue = -1; // Track to avoid redundant callbacks
        }
        __initialize() {
            super.__initialize();
            this.interactable = this.interactable;
            this.manipulationComponent = this.manipulationComponent;
            this.lineStart = this.lineStart;
            this.lineEnd = this.lineEnd;
            this.visualReference = this.visualReference;
            this.callback = this.callback;
            this.methodName = this.methodName;
            this.enableProjection = this.enableProjection;
            this.onlyDuringManipulation = this.onlyDuringManipulation;
            this.doubleMapping = this.doubleMapping;
            this.log = new NativeLogger_1.default(TAG);
            this.isManipulating = false;
            this.lastNormalizedValue = -1; // Track to avoid redundant callbacks
        }
        onAwake() {
            this.createEvent("OnStartEvent").bind(() => {
                this.onStart();
            });
            // Update every frame if not limited to manipulation only
            if (!this.onlyDuringManipulation) {
                this.createEvent("UpdateEvent").bind(() => {
                    this.update();
                });
            }
        }
        onStart() {
            if (!this.interactable) {
                this.log.e("Interactable component is required");
                return;
            }
            if (!this.manipulationComponent) {
                this.log.e("InteractableManipulation component is required");
                return;
            }
            if (!this.lineStart || !this.lineEnd) {
                this.log.e("Line Start and Line End are required");
                return;
            }
            if (!this.visualReference) {
                this.log.e("Visual Reference object is required");
                return;
            }
            this.setupManipulationCallbacks();
            this.log.d("InteractableLineProjection initialized");
            // Do initial projection
            this.updateProjection();
        }
        setupManipulationCallbacks() {
            if (this.manipulationComponent) {
                // Manipulation start event
                this.manipulationComponent.onManipulationStart.add((event) => {
                    this.onManipulationStarted(event);
                });
                // Manipulation update event
                this.manipulationComponent.onManipulationUpdate.add((event) => {
                    this.onManipulationUpdate(event);
                });
                // Manipulation end event
                this.manipulationComponent.onManipulationEnd.add((event) => {
                    this.onManipulationEnded(event);
                });
            }
        }
        onManipulationStarted(event) {
            this.isManipulating = true;
            this.log.d("Manipulation started - projection active");
        }
        onManipulationUpdate(event) {
            if (this.enableProjection) {
                this.updateProjection();
            }
        }
        onManipulationEnded(event) {
            this.isManipulating = false;
            this.log.d("Manipulation ended - snapping to projected position");
            // Move the manipulator object to match the visual reference position
            if (this.visualReference) {
                const visualPosition = this.visualReference.getTransform().getWorldPosition();
                this.manipulationComponent.getManipulateRoot().setWorldPosition(visualPosition);
            }
        }
        update() {
            if (this.enableProjection && (!this.onlyDuringManipulation || this.isManipulating)) {
                this.updateProjection();
            }
        }
        /**
         * Projects the interactable object's position onto the line and updates visual reference
         */
        updateProjection() {
            if (!this.lineStart || !this.lineEnd || !this.visualReference) {
                return;
            }
            // Get positions
            const objectPosition = this.manipulationComponent.getManipulateRoot().getWorldPosition();
            const lineStartPosition = this.lineStart.getTransform().getWorldPosition();
            const lineEndPosition = this.lineEnd.getTransform().getWorldPosition();
            // Project the object position onto the line
            const projectedPosition = this.getProjectionOnLine(objectPosition, lineStartPosition, lineEndPosition);
            // Move visual reference to projected position
            this.visualReference.getTransform().setWorldPosition(projectedPosition);
            // Calculate normalized value (0 to 1) based on position along the line
            const normalizedValue = this.calculateNormalizedValue(projectedPosition, lineStartPosition, lineEndPosition);
            // Call callback if value changed
            if (Math.abs(normalizedValue - this.lastNormalizedValue) > 0.001) {
                this.invokeCallback(normalizedValue);
                this.lastNormalizedValue = normalizedValue;
            }
        }
        /**
         * Calculate the closest point on a line to a given point
         * Based on the SnapToLine algorithm
         */
        getProjectionOnLine(point, lineStart, lineEnd) {
            // Calculate the line direction and length
            const lineDirection = lineEnd.sub(lineStart);
            const lineLength = lineDirection.length;
            if (lineLength === 0) {
                return lineStart; // Line has no length, return start point
            }
            const normalizedDirection = lineDirection.normalize();
            // Project the point onto the line
            const startToPoint = point.sub(lineStart);
            const projectionLength = startToPoint.dot(normalizedDirection);
            // Clamp the projection to the bounds of the line
            const clampedProjection = Math.max(0, Math.min(projectionLength, lineLength));
            // Calculate the closest point on the line
            return lineStart.add(normalizedDirection.uniformScale(clampedProjection));
        }
        /**
         * Calculate normalized value (0 to 1) based on position along the line
         */
        calculateNormalizedValue(projectedPosition, lineStart, lineEnd) {
            const lineDirection = lineEnd.sub(lineStart);
            const lineLength = lineDirection.length;
            if (lineLength === 0) {
                return 0; // Line has no length
            }
            const startToProjected = projectedPosition.sub(lineStart);
            const projectionLength = startToProjected.dot(lineDirection.normalize());
            // Normalize to 0-1 range
            // return MathUtils.clamp(projectionLength / lineLength, 0, 2); // from zero speed to double speed
            // Normalize to 0-2 range
            if (this.doubleMapping) {
                const normalizedValue = (projectionLength / lineLength) * 2;
                return MathUtils.clamp(normalizedValue, 0, 2);
            }
            else {
                const normalizedValue = (projectionLength / lineLength);
                return MathUtils.clamp(normalizedValue, 0, 1);
            }
        }
        /**
         * Invokes the callback with the calculated normalized value
         */
        invokeCallback(normalizedValue) {
            if (this.callback && this.callback[this.methodName]) {
                try {
                    this.callback[this.methodName](normalizedValue);
                    this.log.d(`Callback invoked with value: ${normalizedValue}`);
                }
                catch (error) {
                    this.log.e(`Error invoking callback: ${error}`);
                }
            }
        }
        /**
         * Manually set the line boundaries
         */
        setLineBoundaries(startPoint, endPoint) {
            this.lineStart = startPoint;
            this.lineEnd = endPoint;
            this.log.d("Line boundaries updated");
            // Update projection with new boundaries
            if (this.enableProjection) {
                this.updateProjection();
            }
        }
        /**
         * Enable or disable projection
         */
        setProjectionEnabled(enabled) {
            this.enableProjection = enabled;
            this.log.d(`Projection ${enabled ? 'enabled' : 'disabled'}`);
        }
        /**
         * Update the callback configuration
         */
        setCallback(callbackScript, methodName) {
            this.callback = callbackScript;
            this.methodName = methodName;
            this.log.d(`Callback updated: ${methodName}`);
        }
        /**
         * Get the current normalized value
         */
        getCurrentNormalizedValue() {
            return this.lastNormalizedValue;
        }
        /**
         * Get the current projected position
         */
        getCurrentProjectedPosition() {
            if (!this.visualReference) {
                return vec3.zero();
            }
            return this.visualReference.getTransform().getWorldPosition();
        }
    };
    __setFunctionName(_classThis, "InteractableLineProjection");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        InteractableLineProjection = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return InteractableLineProjection = _classThis;
})();
exports.InteractableLineProjection = InteractableLineProjection;
//# sourceMappingURL=InteractableManipulatorController.js.map