import { MarvinAssistant } from "./MarvinAssistant";
import { VideoController } from "Remote Service Gateway.lspkg/Helpers/VideoController";

/**
 * Alternative YOLO trigger that uses MarvinAssistant's existing video stream
 * This reuses the same camera texture that's already working for Gemini
 */
@component
export class YOLODetectionFromVideo extends BaseScriptComponent {
  @ui.separator
  @ui.label("YOLO Detection from Video Stream")
  @ui.separator

  @input
  marvinAssistant: MarvinAssistant;

  @input
  @hint("Trigger detection automatically on start")
  autoTriggerOnStart: boolean = true;

  @input
  @hint("Delay before auto-trigger (seconds)")
  startDelay: number = 5;

  private videoController: VideoController;
  private lastCapturedTexture: Texture;

  onAwake() {
    this.createEvent("OnStartEvent").bind(() => {
      this.onStart();
    });
  }

  private onStart() {
    print("[YOLO VIDEO] Initializing...");

    // Create a video controller (same as MarvinAssistant uses)
    this.videoController = new VideoController(
      4000,
      CompressionQuality.LowQuality, // Use low compression for better encoding
      EncodingType.Jpg // JPG works better than PNG
    );

    print("[YOLO VIDEO] Video controller created");

    // Capture frames
    this.videoController.onEncodedFrame.add((encodedFrame) => {
      print(`[YOLO VIDEO] Frame captured: ${encodedFrame.length} bytes`);
    });

    if (this.autoTriggerOnStart) {
      print(`[YOLO VIDEO] Will capture and detect in ${this.startDelay} seconds...`);
      const delayedEvent = this.createEvent("DelayedCallbackEvent");
      delayedEvent.bind(() => {
        this.captureAndDetect();
      });
      delayedEvent.reset(this.startDelay);
    }
  }

  /**
   * Capture a frame and run detection
   */
  public async captureAndDetect() {
    print("[YOLO VIDEO] ===== CAPTURING FRAME FOR DETECTION =====");

    // Start recording to capture a frame
    this.videoController.startRecording();

    // Wait a moment for frame to be captured
    await this.delay(0.5);

    // Note: This component is deprecated
    // VideoController doesn't expose getCameraTexture()
    // Use SimpleYOLOTest with CameraTextureCapture instead
    print("[YOLO VIDEO] ========================================");
    print("[YOLO VIDEO] ERROR: This component is deprecated!");
    print("[YOLO VIDEO] ========================================");
    print("[YOLO VIDEO] VideoController doesn't expose camera texture directly");
    print("[YOLO VIDEO] Please use SimpleYOLOTest component instead:");
    print("[YOLO VIDEO]   1. Add CameraTextureCapture component");
    print("[YOLO VIDEO]   2. Add SimpleYOLOTest component");
    print("[YOLO VIDEO]   3. Link marvinAssistant and cameraCapture");
    print("[YOLO VIDEO] ========================================");
  }

  private delay(seconds: number): Promise<void> {
    return new Promise((resolve) => {
      const delayedEvent = this.createEvent("DelayedCallbackEvent");
      delayedEvent.bind(() => {
        resolve();
      });
      delayedEvent.reset(seconds);
    });
  }

  public clearDetections() {
    if (this.marvinAssistant) {
      this.marvinAssistant.clearRemoteDetections();
    }
  }
}
