/**
 * Camera texture capture component
 * Based on immerseGT2025 CameraTexture.js
 * Properly manages camera texture for encoding
 */
@component
export class CameraTextureCapture extends BaseScriptComponent {
  private cameraModule: CameraModule = require("LensStudio:CameraModule");
  private cameraRequest: CameraModule.CameraRequest;
  private cameraTexture: Texture;
  private cameraTextureProvider: CameraTextureProvider;
  private isReady: boolean = false;

  onAwake() {
    this.createEvent("OnStartEvent").bind(() => {
      this.onStart();
    });
  }

  private onStart() {
    print("[CAMERA CAPTURE] Initializing camera...");

    this.cameraRequest = CameraModule.createCameraRequest();
    this.cameraRequest.cameraId = CameraModule.CameraId.Default_Color;

    // Request camera
    this.cameraTexture = this.cameraModule.requestCamera(this.cameraRequest);
    this.cameraTextureProvider = this.cameraTexture.control as CameraTextureProvider;

    const camera = global.deviceInfoSystem.getTrackingCameraForId(
      CameraModule.CameraId.Default_Color
    );
    const resolution = camera.resolution;
    print(`[CAMERA CAPTURE] Camera resolution: ${resolution.x} x ${resolution.y}`);

    // Wait for first frame
    this.cameraTextureProvider.onNewFrame.add(() => {
      if (!this.isReady) {
        this.isReady = true;
        print("[CAMERA CAPTURE] ✅ Camera ready - first frame received");
        print(`[CAMERA CAPTURE] Texture: ${this.cameraTexture.getWidth()}x${this.cameraTexture.getHeight()}`);
      }
    });
  }

  /**
   * Get the camera texture for detection
   * Returns the raw camera texture
   */
  public getCameraTexture(): Texture {
    if (!this.isReady) {
      print("[CAMERA CAPTURE] WARNING: Camera not ready yet");
      return null;
    }
    return this.cameraTexture;
  }

  /**
   * Check if camera is ready
   */
  public isCameraReady(): boolean {
    return this.isReady;
  }

  /**
   * Get camera resolution
   */
  public getResolution(): vec2 {
    if (!this.cameraTexture) {
      return new vec2(0, 0);
    }
    return new vec2(this.cameraTexture.getWidth(), this.cameraTexture.getHeight());
  }
}
