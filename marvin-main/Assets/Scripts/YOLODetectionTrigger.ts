import { MarvinAssistant } from "./MarvinAssistant";

/**
 * Simple trigger to test YOLO object detection
 * Can be triggered by button press or automatically on start
 */
@component
export class YOLODetectionTrigger extends BaseScriptComponent {
  @ui.separator
  @ui.label("YOLO Detection Test Trigger")
  @ui.separator

  @input
  marvinAssistant: MarvinAssistant;

  @input
  @hint("Trigger detection automatically on start")
  autoTriggerOnStart: boolean = false;

  @input
  @hint("Delay before auto-trigger (seconds)")
  startDelay: number = 3;

  @input
  @hint("Enable continuous detection (triggers repeatedly)")
  continuousDetection: boolean = false;

  @input
  @hint("Interval between detections (seconds)")
  detectionInterval: number = 5;

  private cameraModule: CameraModule = require("LensStudio:CameraModule");
  private cameraTexture: Texture;
  private cameraTextureProvider: CameraTextureProvider;
  private lastDetectionTime: number = 0;
  private isRunning: boolean = false;
  private cameraReady: boolean = false;

  onAwake() {
    this.createEvent("OnStartEvent").bind(() => {
      this.onStart();
    });

    if (this.continuousDetection) {
      this.createEvent("UpdateEvent").bind(() => {
        this.onUpdate();
      });
    }
  }

  private onStart() {
    print("[YOLO TRIGGER] Initializing camera...");

    // Request camera access
    const camRequest = CameraModule.createCameraRequest();
    camRequest.cameraId = CameraModule.CameraId.Default_Color;

    // Request higher resolution for better detection
    if (!global.deviceInfoSystem.isEditor()) {
      camRequest.imageSmallerDimension = 756; // Higher res on device
    }

    this.cameraTexture = this.cameraModule.requestCamera(camRequest);
    this.cameraTextureProvider = this.cameraTexture.control as CameraTextureProvider;

    print(`[YOLO TRIGGER] Camera texture obtained - Type: ${this.cameraTexture ? 'valid' : 'invalid'}`);

    // Wait for first frame before marking ready
    this.cameraTextureProvider.onNewFrame.add(() => {
      if (!this.cameraReady) {
        this.cameraReady = true;
        print("[YOLO TRIGGER] ✅ Camera ready - first frame received");

        if (this.autoTriggerOnStart) {
          print(`[YOLO TRIGGER] Will auto-trigger in ${this.startDelay} seconds...`);
          const delayedEvent = this.createEvent("DelayedCallbackEvent");
          delayedEvent.bind(() => {
            this.triggerDetection();
          });
          delayedEvent.reset(this.startDelay);
        }
      }
    });
  }

  private onUpdate() {
    if (!this.isRunning) return;

    const currentTime = getTime();
    if (currentTime - this.lastDetectionTime >= this.detectionInterval) {
      this.triggerDetection();
      this.lastDetectionTime = currentTime;
    }
  }

  /**
   * Trigger YOLO object detection
   */
  public async triggerDetection() {
    if (!this.marvinAssistant) {
      print("[YOLO TRIGGER] ERROR: MarvinAssistant not connected!");
      return;
    }

    if (!this.cameraTexture) {
      print("[YOLO TRIGGER] ERROR: Camera texture not available!");
      return;
    }

    if (!this.cameraReady) {
      print("[YOLO TRIGGER] WARNING: Camera not ready yet, waiting for first frame...");
      return;
    }

    print("[YOLO TRIGGER] ===== TRIGGERING YOLO DETECTION =====");
    print(`[YOLO TRIGGER] Camera texture: ${this.cameraTexture.getWidth()}x${this.cameraTexture.getHeight()}`);

    try {
      const detections = await this.marvinAssistant.triggerRemoteObjectDetection(
        this.cameraTexture
      );

      print(`[YOLO TRIGGER] ===== DETECTION COMPLETE =====`);
      print(`[YOLO TRIGGER] Found ${detections.length} objects:`);

      detections.forEach((detection, index) => {
        print(
          `[YOLO TRIGGER] ${index + 1}. ${detection.class_name} - Confidence: ${(detection.confidence * 100).toFixed(1)}% - Distance: ${detection.distance.toFixed(2)}m`
        );
      });

      if (detections.length === 0) {
        print("[YOLO TRIGGER] No objects detected. Try:");
        print("  - Adjusting confidence threshold (lower it)");
        print("  - Increasing distance threshold");
        print("  - Ensuring good lighting");
        print("  - Pointing camera at common objects");
      }
    } catch (error) {
      print(`[YOLO TRIGGER] ERROR during detection: ${error}`);
      print("[YOLO TRIGGER] Make sure:");
      print("  - Hugging Face API token is set");
      print("  - Internet connection is available");
      print("  - RemoteObjectDetectionManager is configured");
    }
  }

  /**
   * Start continuous detection mode
   */
  public startContinuous() {
    print("[YOLO TRIGGER] Starting continuous detection mode");
    this.isRunning = true;
    this.lastDetectionTime = getTime();
  }

  /**
   * Stop continuous detection mode
   */
  public stopContinuous() {
    print("[YOLO TRIGGER] Stopping continuous detection mode");
    this.isRunning = false;
  }

  /**
   * Clear all detection visualizations
   */
  public clearDetections() {
    if (this.marvinAssistant) {
      this.marvinAssistant.clearRemoteDetections();
      print("[YOLO TRIGGER] Cleared all detections");
    }
  }
}
