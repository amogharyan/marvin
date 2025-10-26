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
exports.BLEArduino = void 0;
var __selfType = requireType("./BLEArduino");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const SERVICE_UUID = "0000FFE5-0000-1000-8000-00805F9B34FB";
const CHARACTERISTIC_UUID = "0000FFE6-0000-1000-8000-00805F9B34FB";
let BLEArduino = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var BLEArduino = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.bluetoothModule = this.bluetoothModule;
            this.screenText = this.screenText;
            this.cube = this.cube;
            this.scanFilter = new Bluetooth.ScanFilter();
            this.scanSetting = new Bluetooth.ScanSettings();
        }
        __initialize() {
            super.__initialize();
            this.bluetoothModule = this.bluetoothModule;
            this.screenText = this.screenText;
            this.cube = this.cube;
            this.scanFilter = new Bluetooth.ScanFilter();
            this.scanSetting = new Bluetooth.ScanSettings();
        }
        onAwake() {
            this.scanFilter.serviceUUID = SERVICE_UUID;
            this.scanSetting.uniqueDevices = true;
            this.scanSetting.scanMode = Bluetooth.ScanMode.Balanced;
            this.scanSetting.timeoutSeconds = 1000;
            this.createEvent("OnStartEvent").bind(this.onStart.bind(this));
        }
        onStart() {
            this.startScan();
        }
        startScan() {
            this.screenText.text = "Looking for device...";
            this.log("starting scan...");
            this.bluetoothModule
                .startScan([this.scanFilter], this.scanSetting, (scanResult) => {
                this.log("Found device: " + scanResult.deviceName);
                this.screenText.text = "Found device!\n" + scanResult.deviceName;
                return true;
            })
                .then((scanResult) => {
                print("Scan result: " + scanResult.deviceName);
                this.bluetoothModule.stopScan().then(() => {
                    this.connectGATT(scanResult);
                });
            })
                .catch((error) => {
                this.log("Error during scan: " + error);
            });
        }
        async connectGATT(scanResult) {
            this.log("Attempting connection: " + scanResult.deviceAddress);
            var gatt = await this.bluetoothModule.connectGatt(scanResult.deviceAddress);
            this.log("Got connection result...");
            let desiredService = gatt.getService(SERVICE_UUID);
            let desiredChar = desiredService.getCharacteristic(CHARACTERISTIC_UUID);
            gatt.onConnectionStateChangedEvent.add(async (connectionState) => {
                this.log("Connection state changed: " + connectionState.state);
                if (connectionState.state == Bluetooth.ConnectionState.Disconnected) {
                    this.log("Disconnected from: " + scanResult.deviceName);
                    this.screenText.text = "Disconnected...";
                }
                if (connectionState.state == Bluetooth.ConnectionState.Connected) {
                    this.log("Connected to device: " + scanResult.deviceName);
                    this.screenText.text = "Connected to:\n" + scanResult.deviceName;
                    //send example value to Arduino
                    this.log("writing value...");
                    await desiredChar.writeValue(this.str2bin("HI FROM Spectacles"));
                    this.log("done write!");
                    desiredChar
                        .registerNotifications((value) => {
                        var message = this.bin2str(value);
                        print("Notification: " + message);
                        //message looks like "0.1, 0.2, 0.5"
                        var numArray = message.split(",").map((x) => {
                            return parseFloat(x);
                        });
                        //parse it into a number array
                        this.cube.setRotationAngle(numArray);
                    })
                        .then(() => {
                        this.log("Notifications registered successfully.");
                        this.screenText.text = "Notifications registered!";
                    })
                        .catch((error) => {
                        this.log("Error registering notifications: " + error);
                    });
                }
            });
        }
        bin2str(array) {
            var result = "";
            for (var i = 0; i < array.length; i++) {
                result += String.fromCharCode(array[i]);
            }
            return result;
        }
        str2bin(str) {
            const out = new Uint8Array(str.length);
            for (let i = 0; i < str.length; ++i) {
                out[i] = str.charCodeAt(i);
            }
            return out;
        }
        log(message) {
            print("BLE TEST: " + message);
        }
    };
    __setFunctionName(_classThis, "BLEArduino");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        BLEArduino = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return BLEArduino = _classThis;
})();
exports.BLEArduino = BLEArduino;
//# sourceMappingURL=BLEArduino.js.map