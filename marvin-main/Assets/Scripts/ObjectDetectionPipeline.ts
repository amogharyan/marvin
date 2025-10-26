import { MarvinAssistant } from "./MarvinAssistant";
import { CameraTextureCapture } from "./CameraTextureCapture";
import { PinholeCapture } from "./PinholeCapture";

/**
 * Simplified Object Detection Pipeline
 * Handles: Camera → YOLO Detection → Gemini Trigger
 * 
 * All-in-one component that:
 * 1. Captures camera frames
 * 2. Sends to Hugging Face YOLO API
 * 3. Processes detections
 * 4. Triggers Gemini with relevant prompts
 */

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

// Detection rule for triggering Gemini
interface DetectionRule {
  objectType: string;
  minConfidence: number;
  geminiPrompt: string;
  cooldownSeconds: number;
  triggerOnce: boolean;
}

@component
export class ObjectDetectionPipeline extends BaseScriptComponent {
  @ui.separator
  @ui.label("🔄 Simplified Object Detection Pipeline")
  @ui.separator

  @ui.group_start("Core Components")
  @input marvinAssistant: MarvinAssistant;
  @input cameraCapture: CameraTextureCapture;
  @input pinholeCapture: PinholeCapture;
  @ui.group_end

  @ui.group_start("API Configuration")
  @input hfApiToken: string = "";
  @input hfSpaceUrl: string = "https://agrancini-sc-simultaneous-segmented-depth-prediction.hf.space";
  @input
  @widget(new ComboBoxWidget([
    new ComboBoxItem("Small - Better performance", "Small - Better performance and less accuracy"),
    new ComboBoxItem("Medium - Balanced", "Medium - Balanced performance and accuracy"),
    new ComboBoxItem("Large - High accuracy", "Large - Slow performance and high accuracy")
  ]))
  modelSize: string = "Medium - Balanced performance and accuracy";
  @input confidenceThreshold: number = 0.7;
  @ui.group_end

  @ui.group_start("Detection Settings")
  @input
  @hint("Enable continuous detection")
  continuousMode: boolean = true;
  
  @input
  @hint("Seconds between detections")
  detectionInterval: number = 10;
  
  @input
  @hint("Delay before first detection (seconds)")
  initialDelay: number = 5;
  @ui.group_end

  @ui.group_start("Laptop Detection")
  @input laptopDetectionEnabled: boolean = true;
  @input laptopMinConfidence: number = 0.7;
  @input
  @widget(new TextAreaWidget())
  laptopPrompt: string = "I see you're on your laptop! Would you like me to pull up your calendar for today?";
  @input laptopTriggerOnce: boolean = true;
  @ui.group_end

  @ui.group_start("Person Detection")
  @input personDetectionEnabled: boolean = false;
  @input personMinConfidence: number = 0.8;
  @input
  @widget(new TextAreaWidget())
  personPrompt: string = "Hello! I see you there. How can I assist you today?";
  @input personTriggerOnce: boolean = false;
  @ui.group_end

  @ui.group_start("Phone Detection")
  @input phoneDetectionEnabled: boolean = false;
  @input phoneMinConfidence: number = 0.7;
  @input
  @widget(new TextAreaWidget())
  phonePrompt: string = "I notice you have your phone. Would you like me to help you stay focused?";
  @input phoneTriggerOnce: boolean = false;
  @ui.group_end

  @ui.group_start("Backpack Detection")
  @input backpackDetectionEnabled: boolean = true;
  @input backpackMinConfidence: number = 0.7;
  @input
  @widget(new TextAreaWidget())
  backpackPrompt: string = "here";
  @input backpackTriggerOnce: boolean = false;
  @ui.group_end

  private internetModule: any;
  private lastDetectionTime: number = 0;
  private triggeredObjects: Set<string> = new Set();
  private lastTriggerTimes: Map<string, number> = new Map();

  onAwake() {
    try {
      this.internetModule = require("LensStudio:InternetModule");
      print("[PIPELINE] Using InternetModule");
    } catch (e) {
      this.internetModule = require("LensStudio:RemoteServiceModule");
      print("[PIPELINE] Using RemoteServiceModule");
    }

    this.createEvent("OnStartEvent").bind(() => this.onStart());
    if (this.continuousMode) {
      this.createEvent("UpdateEvent").bind(() => this.onUpdate());
    }
  }

  private onStart() {
    print("[PIPELINE] ========================================");
    print("[PIPELINE] 🚀 Object Detection Pipeline Started");
    print("[PIPELINE] ========================================");
    print(`[PIPELINE] Continuous mode: ${this.continuousMode ? `ON (every ${this.detectionInterval}s)` : "OFF"}`);
    this.printActiveRules();

    if (this.initialDelay > 0) {
      print(`[PIPELINE] First detection in ${this.initialDelay}s...`);
      const delayEvent = this.createEvent("DelayedCallbackEvent");
      delayEvent.bind(() => {
        this.detectAndProcess();
        this.lastDetectionTime = getTime();
      });
      delayEvent.reset(this.initialDelay);
    }
  }

  private onUpdate() {
    const now = getTime();
    if (now - this.lastDetectionTime >= this.detectionInterval) {
      this.detectAndProcess();
      this.lastDetectionTime = now;
    }
  }

  private printActiveRules() {
    print("[PIPELINE] Active rules:");
    if (this.laptopDetectionEnabled) {
      print(`[PIPELINE]   💻 Laptop (${(this.laptopMinConfidence * 100).toFixed(0)}%)`);
    }
    if (this.personDetectionEnabled) {
      print(`[PIPELINE]   👤 Person (${(this.personMinConfidence * 100).toFixed(0)}%)`);
    }
    if (this.phoneDetectionEnabled) {
      print(`[PIPELINE]   📱 Phone (${(this.phoneMinConfidence * 100).toFixed(0)}%)`);
    }
    if (this.backpackDetectionEnabled) {
      print(`[PIPELINE]   🎒 Backpack (${(this.backpackMinConfidence * 100).toFixed(0)}%)`);
    }
  }

  /**
   * Main pipeline: Detect → Process → Trigger Gemini
   */
  public async detectAndProcess() {
    print("[PIPELINE] 🔍 Starting detection...");

    try {
      // 1. Get camera texture
      const texture = this.getCameraTexture();
      if (!texture) {
        print("[PIPELINE] ❌ No camera texture");
        return;
      }

      // 2. Detect objects via YOLO API
      const detections = await this.detectObjects(texture);

      // 3. Process detections and trigger Gemini
      this.processDetections(detections);

    } catch (error) {
      print(`[PIPELINE] ❌ Error: ${error}`);
    }
  }

  /**
   * Get camera texture (with validation)
   */
  private getCameraTexture(): Texture | null {
    if (!this.cameraCapture) {
      print("[PIPELINE] ❌ CameraCapture not assigned");
      return null;
    }

    if (!this.cameraCapture.isCameraReady()) {
      print("[PIPELINE] ⏳ Camera not ready");
      return null;
    }

    return this.cameraCapture.getCameraTexture();
  }

  /**
   * Detect objects using YOLO API
   */
  private async detectObjects(texture: Texture): Promise<YOLODetection[]> {
    // Save camera matrix for spatial positioning
    if (this.pinholeCapture) {
      this.pinholeCapture.saveMatrix();
    }

    // Encode texture to base64
    const encodedImage = await this.encodeTexture(texture);
    
    // Send to API
    const detections = await this.sendToYOLOAPI(encodedImage);
    
    // Filter by confidence
    const filtered = detections.filter(d => d.confidence >= this.confidenceThreshold);
    
    print(`[PIPELINE] ✅ Found ${filtered.length} objects`);
    filtered.forEach((d, i) => {
      print(`[PIPELINE]   ${i+1}. ${d.class_name} (${(d.confidence*100).toFixed(0)}%) - ${d.distance.toFixed(1)}m`);
    });

    return filtered;
  }

  /**
   * Encode texture to base64
   */
  private encodeTexture(texture: Texture): Promise<string> {
    return new Promise((resolve, reject) => {
      Base64.encodeTextureAsync(
        texture,
        (encoded) => {
          if (!encoded || encoded.length === 0) {
            reject(new Error("Encoding failed"));
            return;
          }
          resolve(encoded);
        },
        () => reject(new Error("Encoding error")),
        CompressionQuality.LowQuality,
        EncodingType.Png
      );
    });
  }

  /**
   * Send to YOLO API
   */
  private async sendToYOLOAPI(encodedImage: string): Promise<YOLODetection[]> {
    if (!this.hfApiToken || !this.hfSpaceUrl) {
      throw new Error("API configuration missing");
    }

    const apiUrl = `${this.hfSpaceUrl}/gradio_api/call/get_detection_data`;
    
    const request = new Request(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.hfApiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: [{
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
          distance_threshold: 10.0,
        }],
      }),
    });

    let response = await this.internetModule.fetch(request);

    // Handle sleeping space (503)
    if (response.status === 503) {
      print("[PIPELINE] ⏳ Space sleeping, retrying...");
      await this.delay(5);
      response = await this.internetModule.fetch(request);
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = JSON.parse(await response.text());
    
    if (data && data.event_id) {
      const resultUrl = `${apiUrl}/${data.event_id}`;
      const resultResponse = await this.internetModule.fetch(
        new Request(resultUrl, {
          method: "GET",
          headers: { Authorization: `Bearer ${this.hfApiToken}` },
        })
      );
      
      return this.parseResults(await resultResponse.text());
    }

    return [];
  }

  /**
   * Parse API results
   */
  private parseResults(text: string): YOLODetection[] {
    const lines = text.split("\n");
    let detections: YOLODetection[] = [];

    lines.forEach((line) => {
      if (line.startsWith("data: ")) {
        try {
          const parsed = JSON.parse(line.substring(6));
          if (Array.isArray(parsed)) {
            parsed.forEach((item) => {
              if (item && item.detections) {
                detections = detections.concat(item.detections);
              }
            });
          }
        } catch (e) {
          // Skip parse errors
        }
      }
    });

    return detections;
  }

  /**
   * Process detections and trigger Gemini
   */
  private processDetections(detections: YOLODetection[]) {
    if (detections.length === 0) {
      print("[PIPELINE] No objects detected");
      return;
    }

    // Build rules
    const rules: DetectionRule[] = [];

    if (this.laptopDetectionEnabled) {
      rules.push({
        objectType: "laptop",
        minConfidence: this.laptopMinConfidence,
        geminiPrompt: this.laptopPrompt,
        cooldownSeconds: 30,
        triggerOnce: this.laptopTriggerOnce,
      });
    }

    if (this.personDetectionEnabled) {
      rules.push({
        objectType: "person",
        minConfidence: this.personMinConfidence,
        geminiPrompt: this.personPrompt,
        cooldownSeconds: 60,
        triggerOnce: this.personTriggerOnce,
      });
    }

    if (this.phoneDetectionEnabled) {
      rules.push({
        objectType: "cell phone",
        minConfidence: this.phoneMinConfidence,
        geminiPrompt: this.phonePrompt,
        cooldownSeconds: 45,
        triggerOnce: this.phoneTriggerOnce,
      });
    }

    if (this.backpackDetectionEnabled) {
      rules.push({
        objectType: "backpack",
        minConfidence: this.backpackMinConfidence,
        geminiPrompt: this.backpackPrompt,
        cooldownSeconds: 30,
        triggerOnce: this.backpackTriggerOnce,
      });
    }

    // Check each detection
    detections.forEach((detection) => {
      const rule = rules.find(
        (r) => r.objectType.toLowerCase() === detection.class_name.toLowerCase() &&
               detection.confidence >= r.minConfidence
      );

      if (rule) {
        this.triggerGemini(detection, rule);
      }
    });
  }

  /**
   * Trigger Gemini with prompt
   */
  private triggerGemini(detection: YOLODetection, rule: DetectionRule) {
    const objKey = rule.objectType;

    // Check if already triggered (trigger once mode)
    if (rule.triggerOnce && this.triggeredObjects.has(objKey)) {
      print(`[PIPELINE] 🔇 ${objKey} already triggered this session`);
      return;
    }

    // Check cooldown
    const now = getTime();
    const lastTrigger = this.lastTriggerTimes.get(objKey) || 0;
    if (!rule.triggerOnce && now - lastTrigger < rule.cooldownSeconds) {
      print(`[PIPELINE] ⏳ ${objKey} in cooldown`);
      return;
    }

    // Trigger!
    print("[PIPELINE] ========================================");
    print(`[PIPELINE] 🎯 TRIGGERING GEMINI`);
    print(`[PIPELINE] Object: ${detection.class_name}`);
    print(`[PIPELINE] Confidence: ${(detection.confidence * 100).toFixed(0)}%`);
    print(`[PIPELINE] Distance: ${detection.distance.toFixed(1)}m`);
    print("[PIPELINE] ========================================");

    // Send to Gemini
    if (this.marvinAssistant) {
      this.marvinAssistant.sendClientMessage(rule.geminiPrompt);
      print(`[PIPELINE] ✅ Sent: "${rule.geminiPrompt.substring(0, 50)}..."`);
    }

    // Update tracking
    this.lastTriggerTimes.set(objKey, now);
    if (rule.triggerOnce) {
      this.triggeredObjects.add(objKey);
    }
  }

  /**
   * Utility: delay
   */
  private delay(seconds: number): Promise<void> {
    return new Promise((resolve) => {
      const event = this.createEvent("DelayedCallbackEvent");
      event.bind(() => resolve());
      event.reset(seconds);
    });
  }

  /**
   * Manual trigger (for testing)
   */
  public triggerNow() {
    print("[PIPELINE] 🔍 Manual trigger");
    this.detectAndProcess();
  }

  /**
   * Reset session
   */
  public resetSession() {
    this.triggeredObjects.clear();
    this.lastTriggerTimes.clear();
    print("[PIPELINE] ✅ Session reset");
  }
}

