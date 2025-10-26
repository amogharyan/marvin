import { MarvinAssistant } from "./MarvinAssistant";
import { CameraTextureCapture } from "./CameraTextureCapture";

/**
 * Simplest possible YOLO test - uses CameraTextureCapture component
 */
@component
export class SimpleYOLOTest extends BaseScriptComponent {
  @ui.separator
  @ui.label("Simple YOLO Test - Press trigger to detect")
  @ui.separator

  @input
  marvinAssistant: MarvinAssistant;

  @input
  cameraCapture: CameraTextureCapture;

  @input
  autoTrigger: boolean = true;

  @input
  triggerDelay: number = 5;

  @input
  @hint("Enable continuous detection mode")
  enableContinuous: boolean = true;

  @input
  @hint("Seconds between continuous detections")
  continuousInterval: number = 10;

  private lastDetectionTime: number = 0;

  onAwake() {
    this.createEvent("OnStartEvent").bind(() => {
      this.onStart();
    });

    if (this.enableContinuous) {
      this.createEvent("UpdateEvent").bind(() => {
        this.onUpdate();
      });
    }
  }

  private onUpdate() {
    const now = getTime();
    if (now - this.lastDetectionTime >= this.continuousInterval) {
      this.runTest();
      this.lastDetectionTime = now;
    }
  }

  private onStart() {
    print("[SIMPLE YOLO] Initialized");
    print(`[SIMPLE YOLO] Continuous mode: ${this.enableContinuous ? `ON (every ${this.continuousInterval}s)` : "OFF"}`);

    if (this.autoTrigger) {
      print(`[SIMPLE YOLO] Will trigger in ${this.triggerDelay} seconds...`);
      const delayedEvent = this.createEvent("DelayedCallbackEvent");
      delayedEvent.bind(() => {
        this.runTest();
        this.lastDetectionTime = getTime();
      });
      delayedEvent.reset(this.triggerDelay);
    }
  }

  public async runTest() {
    print("[SIMPLE YOLO] ========================================");
    print("[SIMPLE YOLO] Starting YOLO Detection Test");
    print("[SIMPLE YOLO] ========================================");

    // Validate components
    if (!this.marvinAssistant) {
      print("[SIMPLE YOLO] ❌ ERROR: MarvinAssistant not assigned!");
      return;
    }

    if (!this.cameraCapture) {
      print("[SIMPLE YOLO] ❌ ERROR: CameraTextureCapture not assigned!");
      return;
    }

    // Check camera ready
    if (!this.cameraCapture.isCameraReady()) {
      print("[SIMPLE YOLO] ⏳ Camera not ready, waiting 1 second...");
      await this.delay(1);

      if (!this.cameraCapture.isCameraReady()) {
        print("[SIMPLE YOLO] ❌ Camera still not ready!");
        return;
      }
    }

    // Get camera texture
    const texture = this.cameraCapture.getCameraTexture();
    if (!texture) {
      print("[SIMPLE YOLO] ❌ Failed to get camera texture!");
      return;
    }

    const res = this.cameraCapture.getResolution();
    print(`[SIMPLE YOLO] ✅ Camera texture ready: ${res.x}x${res.y}`);

    // Trigger detection
    print("[SIMPLE YOLO] 🎯 Triggering YOLO detection...");

    try {
      const detections = await this.marvinAssistant.triggerRemoteObjectDetection(
        texture
      );

      print("[SIMPLE YOLO] ========================================");
      print(`[SIMPLE YOLO] 🎉 SUCCESS! Found ${detections.length} objects`);
      print("[SIMPLE YOLO] ========================================");

      if (detections.length === 0) {
        print("[SIMPLE YOLO] ❌ No objects detected. Try:");
        print("[SIMPLE YOLO]   - Lower confidence threshold (currently at " + this.marvinAssistant["remoteObjectDetectionManager"]?.confidenceThreshold + ")");
        print("[SIMPLE YOLO]   - Point camera at common objects:");
        print("[SIMPLE YOLO]     📱 Electronics: laptop, phone, keyboard, mouse");
        print("[SIMPLE YOLO]     🪑 Furniture: chair, couch, table");
        print("[SIMPLE YOLO]     🍎 Food: cup, bottle, apple, banana");
        print("[SIMPLE YOLO]     👤 People: person");
        print("[SIMPLE YOLO]   - Ensure good lighting");
        print("[SIMPLE YOLO]   - Check that space URL is correct");
      } else {
        print("[SIMPLE YOLO] 📋 Detected objects:");
        detections.forEach((d, i) => {
          const emoji = this.getEmojiForObject(d.class_name);
          print(
            `[SIMPLE YOLO] ${emoji} ${i + 1}. ${d.class_name.toUpperCase()} - ${(d.confidence * 100).toFixed(0)}% - ${d.distance.toFixed(1)}m away`
          );
        });
        print("[SIMPLE YOLO] ========================================");
        print("[SIMPLE YOLO] 💡 TIP: Assign a detection prefab to see 3D bounding boxes!");
      }
    } catch (error) {
      print("[SIMPLE YOLO] ========================================");
      print(`[SIMPLE YOLO] ❌ ERROR: ${error}`);
      print("[SIMPLE YOLO] ========================================");
      print("[SIMPLE YOLO] Check:");
      print("[SIMPLE YOLO]   - Hugging Face API token is set");
      print("[SIMPLE YOLO]   - Internet connection is available");
      print("[SIMPLE YOLO]   - RemoteObjectDetectionManager is configured");
    }
  }

  private delay(seconds: number): Promise<void> {
    return new Promise((resolve) => {
      const delayedEvent = this.createEvent("DelayedCallbackEvent");
      delayedEvent.bind(() => resolve());
      delayedEvent.reset(seconds);
    });
  }

  private getEmojiForObject(className: string): string {
    const emojiMap: { [key: string]: string } = {
      person: "👤",
      laptop: "💻",
      phone: "📱",
      cup: "☕",
      bottle: "🍾",
      chair: "🪑",
      couch: "🛋️",
      car: "🚗",
      bicycle: "🚲",
      book: "📚",
      clock: "🕐",
      tv: "📺",
      keyboard: "⌨️",
      mouse: "🖱️",
      apple: "🍎",
      banana: "🍌",
      pizza: "🍕",
      dog: "🐕",
      cat: "🐱",
      bird: "🐦",
    };
    return emojiMap[className] || "🔍";
  }
}
