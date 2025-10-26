import { PinholeCapture } from "./PinholeCapture";
import { DetectionContainer } from "./DetectionContainer";

// YOLOv8 Detection Data Interface
export interface YOLODetection {
  class_id: number;
  class_name: string;
  bounding_box: {
    vertices: number[][];
  };
  center_2d: number[];
  distance: number;
  color: number[];
  confidence: number;
}

// YOLOv8 Object Categories (80 classes)
export const YOLO_CATEGORIES = {
  0: 'person', 1: 'bicycle', 2: 'car', 3: 'motorcycle', 4: 'airplane', 5: 'bus',
  6: 'train', 7: 'truck', 8: 'boat', 9: 'traffic light', 10: 'fire hydrant',
  11: 'stop sign', 12: 'parking meter', 13: 'bench', 14: 'bird', 15: 'cat',
  16: 'dog', 17: 'horse', 18: 'sheep', 19: 'cow', 20: 'elephant', 21: 'bear',
  22: 'zebra', 23: 'giraffe', 24: 'backpack', 25: 'umbrella', 26: 'handbag',
  27: 'tie', 28: 'suitcase', 29: 'frisbee', 30: 'skis', 31: 'snowboard',
  32: 'sports ball', 33: 'kite', 34: 'baseball bat', 35: 'baseball glove',
  36: 'skateboard', 37: 'surfboard', 38: 'tennis racket', 39: 'bottle',
  40: 'wine glass', 41: 'cup', 42: 'fork', 43: 'knife', 44: 'spoon', 45: 'bowl',
  46: 'banana', 47: 'apple', 48: 'sandwich', 49: 'orange', 50: 'broccoli',
  51: 'carrot', 52: 'hot dog', 53: 'pizza', 54: 'donut', 55: 'cake', 56: 'chair',
  57: 'couch', 58: 'potted plant', 59: 'bed', 60: 'dining table', 61: 'toilet',
  62: 'tv', 63: 'laptop', 64: 'mouse', 65: 'remote', 66: 'keyboard',
  67: 'cell phone', 68: 'microwave', 69: 'oven', 70: 'toaster', 71: 'sink',
  72: 'refrigerator', 73: 'book', 74: 'clock', 75: 'vase', 76: 'scissors',
  77: 'teddy bear', 78: 'hair drier', 79: 'toothbrush'
};

@component
export class RemoteObjectDetectionManager extends BaseScriptComponent {
  @ui.group_start("API Configuration")
  @input
  hfApiToken: string = "";

  @input
  @hint("Your Hugging Face Space URL (e.g., https://YOUR-USERNAME-space-name.hf.space)")
  hfSpaceUrl: string = "https://agrancini-sc-simultaneous-segmented-depth-prediction.hf.space";

  @input
  @widget(new ComboBoxWidget([
    new ComboBoxItem("Small - Better performance and less accuracy", "Small - Better performance and less accuracy"),
    new ComboBoxItem("Medium - Balanced performance and accuracy", "Medium - Balanced performance and accuracy"),
    new ComboBoxItem("Large - Slow performance and high accuracy", "Large - Slow performance and high accuracy")
  ]))
  modelSize: string = "Medium - Balanced performance and accuracy";

  @input
  confidenceThreshold: number = 0.5;

  @input
  distanceThreshold: number = 10.0;
  @ui.group_end

  @ui.group_start("Detection Prefab")
  @input
  @allowUndefined
  detectionPrefab: ObjectPrefab;

  @input
  prefabBillboardEnabled: boolean = false;
  @ui.group_end

  @ui.group_start("Camera Setup")
  @input
  pinholeCapture: PinholeCapture;
  @ui.group_end

  // Internet module for fetch API
  private internetModule: any;

  // Active detection prefabs
  private activePrefabs: SceneObject[] = [];

  // Offset for positioning (adjust based on context)
  private offsetPositioning: number = 20;

  onAwake() {
    try {
      // Try new InternetModule first (Lens Studio 5.7+)
      this.internetModule = require("LensStudio:InternetModule");
      print("[DETECTION] Using InternetModule for fetch");
    } catch (e) {
      // Fallback to old RemoteServiceModule
      this.internetModule = require("LensStudio:RemoteServiceModule");
      print("[DETECTION] Using RemoteServiceModule for fetch");
    }
  }

  /**
   * Encode a texture to base64
   */
  private encode(texture: Texture): Promise<string> {
    return new Promise((resolve, reject) => {
      // Validate texture first
      if (!texture) {
        print(`[DETECTION] ERROR: Texture is null or undefined`);
        reject(new Error("Texture is null"));
        return;
      }

      print(`[DETECTION] Texture info - Width: ${texture.getWidth()}, Height: ${texture.getHeight()}`);
      print(`[DETECTION] Attempting encoding with: Compression=${CompressionQuality.LowQuality}, Format=PNG`);

      try {
        // Try encoding with different quality settings
        Base64.encodeTextureAsync(
          texture,
          (encoded) => {
            if (!encoded || encoded.length === 0) {
              print(`[DETECTION] ERROR: Encoded result is empty`);
              reject(new Error("Encoded texture is empty"));
              return;
            }
            print(`[DETECTION] ✅ Encoded texture length: ${encoded.length} bytes`);
            resolve(encoded);
          },
          () => {
            print(`[DETECTION] ERROR: Encoding failed - trying alternative settings...`);

            // Try with different settings as fallback
            Base64.encodeTextureAsync(
              texture,
              (encoded) => {
                if (!encoded || encoded.length === 0) {
                  reject(new Error("Encoded texture is empty (retry)"));
                  return;
                }
                print(`[DETECTION] ✅ Encoded with fallback settings: ${encoded.length} bytes`);
                resolve(encoded);
              },
              () => {
                reject(new Error("Failed to encode texture (all attempts failed)"));
              },
              CompressionQuality.MaximumCompression,
              EncodingType.Jpg
            );
          },
          CompressionQuality.LowQuality,
          EncodingType.Png
        );
      } catch (error) {
        print(`[DETECTION] ERROR: Exception during encoding: ${error}`);
        reject(error);
      }
    });
  }

  /**
   * Send encoded image to Hugging Face API for detection
   */
  private async sendToHuggingFace(encodedImage: string): Promise<YOLODetection[]> {
    if (!this.hfApiToken || this.hfApiToken === "") {
      throw new Error("Hugging Face API token is not set");
    }

    if (!this.hfSpaceUrl || this.hfSpaceUrl === "") {
      throw new Error("Hugging Face Space URL is not set");
    }

    // Build API URL from space URL
    const apiUrl = `${this.hfSpaceUrl}/gradio_api/call/get_detection_data`;
    print(`[DETECTION] API URL: ${apiUrl}`);

    const requestPayload = JSON.stringify({
      data: [
        {
          image: {
            image: {
              path: null,
              url: null,
              data: "data:image/png;base64," + encodedImage,
              mime_type: "image/png",
              size: null,
            },
          },
          model_size: this.modelSize,
          confidence_threshold: this.confidenceThreshold,
          distance_threshold: this.distanceThreshold,
        },
      ],
    });

    print("[DETECTION] Sending detection request to Hugging Face...");

    const request = new Request(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.hfApiToken}`,
        "Content-Type": "application/json",
      },
      body: requestPayload,
    });

    try {
      // Try the request with retry logic for sleeping spaces
      let response = await this.internetModule.fetch(request);
      print(`[DETECTION] Response status: ${response.status}`);

      // Handle 503 (Service Unavailable - space is sleeping)
      if (response.status === 503) {
        print("[DETECTION] ⏳ Space is sleeping/starting... Retrying in 5 seconds...");
        print("[DETECTION] 💡 TIP: Visit your space URL in a browser to wake it up faster!");

        await this.delay(5);

        // Retry
        print("[DETECTION] 🔄 Retrying request...");
        response = await this.internetModule.fetch(request);
        print(`[DETECTION] Retry response status: ${response.status}`);

        if (response.status === 503) {
          print("[DETECTION] ⏳ Still sleeping... One more retry in 10 seconds...");
          await this.delay(10);

          response = await this.internetModule.fetch(request);
          print(`[DETECTION] Final retry response status: ${response.status}`);
        }
      }

      if (!response.ok) {
        if (response.status === 503) {
          throw new Error("Space is still starting up. Please visit the space URL in a browser to wake it up, then try again.");
        }
        throw new Error(`Server responded with ${response.status}`);
      }

      const text = await response.text();
      print(`[DETECTION] Initial response text: ${text.substring(0, 200)}...`);
      const data = JSON.parse(text);

      if (data && data.event_id) {
        const resultUrl = apiUrl + "/" + data.event_id;
        print(`[DETECTION] Fetching results from: ${resultUrl}`);

        const resultResponse = await this.internetModule.fetch(
          new Request(resultUrl, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${this.hfApiToken}`,
            },
          })
        );

        const resultText = await resultResponse.text();
        return this.parseDetectionResults(resultText);
      }

      return [];
    } catch (error) {
      print(`[DETECTION] Error: ${error}`);
      throw error;
    }
  }

  /**
   * Parse detection results from Hugging Face response
   */
  private parseDetectionResults(text: string): YOLODetection[] {
    const lines = text.split("\n");
    let allDetections: YOLODetection[] = [];

    lines.forEach((line, index) => {
      if (line.startsWith("data: ")) {
        try {
          const jsonStr = line.substring(6);
          const parsed = JSON.parse(jsonStr);

          if (parsed && Array.isArray(parsed)) {
            parsed.forEach((item) => {
              if (item && item.detections) {
                print(`[DETECTION] Found ${item.detections.length} detections in chunk`);
                allDetections = allDetections.concat(item.detections);
              }
            });
          }
        } catch (e) {
          print(`[DETECTION] Parse error on line ${index}: ${e}`);
        }
      }
    });

    print(`[DETECTION] Total detections: ${allDetections.length}`);
    return allDetections;
  }

  /**
   * Create a detection prefab for a detected object
   */
  private async createDetectionPrefab(detection: YOLODetection): Promise<void> {
    try {
      if (!this.detectionPrefab) {
        print("[DETECTION] No detection prefab assigned");
        return;
      }

      print(`[DETECTION] Creating detection for: ${detection.class_name}`);

      const detectionObj = global.scene.createSceneObject("Detection");
      this.detectionPrefab.instantiate(detectionObj);
      const prefabChild = detectionObj.getChild(0);

      if (!prefabChild) {
        throw new Error("No child found on Detection object");
      }

      const container = prefabChild.getComponent("Component.ScriptComponent") as DetectionContainer;

      if (!container) {
        throw new Error("No DetectionContainer found on prefab child");
      }

      // Normalize the center coordinates
      const normalizedCenter = new vec2(
        (detection.center_2d[0] + 0.5) / 640,
        1 - (detection.center_2d[1] + 0.5) / 480
      );

      // Convert 2D screen position to 3D world position
      let worldPos = new vec3(0, 0, 0);

      if (this.pinholeCapture) {
        worldPos = this.pinholeCapture.captureToWorld(
          normalizedCenter,
          detection.distance * this.offsetPositioning
        );
      } else {
        print("[DETECTION] Warning: No PinholeCapture available, using default position");
        worldPos = new vec3(
          (normalizedCenter.x - 0.5) * 2,
          (normalizedCenter.y - 0.5) * 2,
          detection.distance
        );
      }

      detectionObj.getTransform().setWorldPosition(worldPos);
      print(`[DETECTION] Positioned at: [${worldPos.x.toFixed(3)}, ${worldPos.y.toFixed(3)}, ${worldPos.z.toFixed(3)}]`);

      // Set billboard mode (safely check if method exists)
      if (container.setBillboardOnUpdate && typeof container.setBillboardOnUpdate === 'function') {
        container.setBillboardOnUpdate(this.prefabBillboardEnabled);
      }

      // Hide text labels - disable object names and distances
      if (container.categoryAndConfidence) {
        container.categoryAndConfidence.enabled = false;
      }

      if (container.distanceFromCamera) {
        container.distanceFromCamera.enabled = false;
      }

      // Set polyline color (safely check if method exists)
      if (container.polyline && detection.color && container.polyline.setColor && typeof container.polyline.setColor === 'function') {
        const color = new vec3(
          detection.color[0] / 255.0,
          detection.color[1] / 255.0,
          detection.color[2] / 255.0
        );
        container.polyline.setColor(color);
      }

      this.activePrefabs.push(detectionObj);
      print(`[DETECTION] Detection prefab created successfully`);
    } catch (error) {
      print(`[DETECTION] Error creating detection prefab: ${error}`);
    }
  }

  /**
   * Process all detections and create visualizations
   */
  private async processDetections(detections: YOLODetection[]): Promise<void> {
    // Clear existing detections
    this.clearDetections();

    // Filter by confidence threshold
    const validDetections = detections.filter(
      (d) => d.confidence >= this.confidenceThreshold
    );

    print(`[DETECTION] ========================================`);
    print(`[DETECTION] 🎯 Processing ${validDetections.length} valid detections`);
    print(`[DETECTION] ========================================`);

    // Log all detections
    validDetections.forEach((detection, index) => {
      print(`[DETECTION] ${index + 1}. ${detection.class_name.toUpperCase()}`);
      print(`[DETECTION]    📊 Confidence: ${(detection.confidence * 100).toFixed(1)}%`);
      print(`[DETECTION]    📏 Distance: ${detection.distance.toFixed(2)}m`);
      print(`[DETECTION]    📍 Position: [${detection.center_2d[0].toFixed(0)}, ${detection.center_2d[1].toFixed(0)}]`);
    });

    print(`[DETECTION] ========================================`);

    // Only create visual prefabs if prefab is assigned
    if (this.detectionPrefab) {
      print(`[DETECTION] Creating visual prefabs...`);
      for (const detection of validDetections) {
        await this.createDetectionPrefab(detection);
        // Small delay between creations
        await this.delay(0.1);
      }
      print(`[DETECTION] Finished creating prefabs`);
    } else {
      print(`[DETECTION] ⚠️ No detection prefab assigned - skipping visualization`);
      print(`[DETECTION] 💡 To see 3D bounding boxes, assign a detection prefab`);
    }

    print(`[DETECTION] ========================================`);
  }

  /**
   * Clear all active detection visualizations
   */
  public clearDetections(): void {
    this.activePrefabs.forEach((prefab) => {
      prefab.destroy();
    });
    this.activePrefabs = [];
    print("[DETECTION] Cleared all detections");
  }

  /**
   * Utility delay function
   */
  public delay(seconds: number): Promise<void> {
    return new Promise((resolve) => {
      const delayedEvent = this.createEvent("DelayedCallbackEvent");
      delayedEvent.bind(() => {
        resolve();
      });
      delayedEvent.reset(seconds);
    });
  }

  /**
   * Public method to perform object detection on a texture
   */
  public async detectObjects(texture: Texture): Promise<YOLODetection[]> {
    try {
      print("[DETECTION] Starting object detection...");

      // Save camera matrix for spatial positioning
      if (this.pinholeCapture) {
        this.pinholeCapture.saveMatrix();
        print("[DETECTION] Camera matrix saved");
      }

      // Encode the texture
      print("[DETECTION] Encoding texture...");
      const encodedImage = await this.encode(texture);

      // Send to Hugging Face API
      print("[DETECTION] Sending to Hugging Face API...");
      const detections = await this.sendToHuggingFace(encodedImage);

      // Process and visualize detections
      await this.processDetections(detections);

      print(`[DETECTION] Detection complete. Found ${detections.length} objects`);
      return detections;
    } catch (error) {
      print(`[DETECTION] Detection failed: ${error}`);
      throw error;
    }
  }

  /**
   * Get all currently detected objects
   */
  public getDetections(): SceneObject[] {
    return this.activePrefabs;
  }
}
