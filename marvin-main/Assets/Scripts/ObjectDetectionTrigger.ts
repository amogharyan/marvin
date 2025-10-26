import { MarvinAssistant } from "./MarvinAssistant";
import { RemoteObjectDetectionManager, YOLODetection } from "./RemoteObjectDetectionManager";

/**
 * Detection rule for triggering Gemini based on YOLO detections
 */
export interface DetectionRule {
  objectType: string;
  minConfidence: number;
  geminiPrompt: string;
  enabled: boolean;
  cooldownSeconds: number; // Prevent spam
  triggerOncePerSession: boolean; // Only trigger once, then never again until restart
}

/**
 * Bridges YOLO object detection with Gemini AI responses
 * When specific objects are detected, triggers Gemini to respond
 */
@component
export class ObjectDetectionTrigger extends BaseScriptComponent {
  @ui.separator
  @ui.label("Object Detection → Gemini Bridge")
  @ui.separator

  @ui.group_start("Components")
  @input
  marvinAssistant: MarvinAssistant;

  @input
  detectionManager: RemoteObjectDetectionManager;
  @ui.group_end

  @ui.group_start("Laptop Detection Rule")
  @input
  laptopDetectionEnabled: boolean = true;

  @input
  @hint("Only trigger once per session (won't repeat even after cooldown)")
  laptopTriggerOncePerSession: boolean = true;

  @input
  @hint("Minimum confidence to trigger (0.0-1.0)")
  laptopMinConfidence: number = 0.7;

  @input
  @widget(new TextAreaWidget())
  @hint("What Gemini should say when laptop detected")
  laptopPrompt: string = "I see you're on your laptop! Would you like me to pull up your calendar for today?";

  @input
  @hint("Cooldown between laptop detections (seconds, ignored if trigger once is enabled)")
  laptopCooldown: number = 30;
  @ui.group_end

  @ui.group_start("Person Detection Rule")
  @input
  personDetectionEnabled: boolean = false;

  @input
  personTriggerOncePerSession: boolean = false;

  @input
  personMinConfidence: number = 0.8;

  @input
  @widget(new TextAreaWidget())
  personPrompt: string = "Hello! I see you there. How can I assist you today?";

  @input
  personCooldown: number = 60;
  @ui.group_end

  @ui.group_start("Phone Detection Rule")
  @input
  phoneDetectionEnabled: boolean = false;

  @input
  phoneTriggerOncePerSession: boolean = false;

  @input
  phoneMinConfidence: number = 0.7;

  @input
  @widget(new TextAreaWidget())
  phonePrompt: string = "I notice you have your phone. Would you like me to help you stay focused on your work?";

  @input
  phoneCooldown: number = 45;
  @ui.group_end

  @ui.group_start("Custom Detection Rules")
  @input
  @hint("Enable custom object detection (e.g., 'cup', 'book')")
  customObjectEnabled: boolean = false;

  @input
  customObjectTriggerOncePerSession: boolean = false;

  @input
  @hint("Object class name (e.g., 'cup', 'book', 'chair')")
  customObjectType: string = "cup";

  @input
  customObjectMinConfidence: number = 0.7;

  @input
  @widget(new TextAreaWidget())
  customObjectPrompt: string = "I see a cup nearby. Staying hydrated is important!";

  @input
  customObjectCooldown: number = 60;
  @ui.group_end

  // Track last trigger times to prevent spam
  private lastTriggerTimes: Map<string, number> = new Map();
  // Track which objects have been triggered this session
  private triggeredThisSession: Set<string> = new Set();
  private isListening: boolean = false;

  onAwake() {
    this.createEvent("OnStartEvent").bind(() => {
      this.onStart();
    });
  }

  private onStart() {
    print("[DETECTION TRIGGER] Initializing...");

    if (!this.marvinAssistant) {
      print("[DETECTION TRIGGER] ❌ ERROR: MarvinAssistant not assigned!");
      return;
    }

    if (!this.detectionManager) {
      print("[DETECTION TRIGGER] ❌ ERROR: DetectionManager not assigned!");
      return;
    }

    // Subscribe to YOLO detection events
    this.marvinAssistant.yoloDetectionCompleteEvent.add((result) => {
      this.handleDetections(result.detections);
    });

    print("[DETECTION TRIGGER] ✅ Ready to trigger Gemini based on detections");
    this.printActiveRules();
  }

  private printActiveRules() {
    print("[DETECTION TRIGGER] Active detection rules:");

    if (this.laptopDetectionEnabled) {
      print(`[DETECTION TRIGGER]   💻 LAPTOP (confidence ≥ ${(this.laptopMinConfidence * 100).toFixed(0)}%)`);
    }

    if (this.personDetectionEnabled) {
      print(`[DETECTION TRIGGER]   👤 PERSON (confidence ≥ ${(this.personMinConfidence * 100).toFixed(0)}%)`);
    }

    if (this.phoneDetectionEnabled) {
      print(`[DETECTION TRIGGER]   📱 PHONE (confidence ≥ ${(this.phoneMinConfidence * 100).toFixed(0)}%)`);
    }

    if (this.customObjectEnabled) {
      print(`[DETECTION TRIGGER]   🔍 ${this.customObjectType.toUpperCase()} (confidence ≥ ${(this.customObjectMinConfidence * 100).toFixed(0)}%)`);
    }
  }

  /**
   * Handle YOLO detections and trigger Gemini if rules match
   */
  private handleDetections(detections: YOLODetection[]) {
    if (!detections || detections.length === 0) {
      return;
    }

    print(`[DETECTION TRIGGER] Processing ${detections.length} detections...`);

    // Build detection rules
    const rules: DetectionRule[] = [];

    if (this.laptopDetectionEnabled) {
      rules.push({
        objectType: "laptop",
        minConfidence: this.laptopMinConfidence,
        geminiPrompt: this.laptopPrompt,
        enabled: true,
        cooldownSeconds: this.laptopCooldown,
        triggerOncePerSession: this.laptopTriggerOncePerSession,
      });
    }

    if (this.personDetectionEnabled) {
      rules.push({
        objectType: "person",
        minConfidence: this.personMinConfidence,
        geminiPrompt: this.personPrompt,
        enabled: true,
        cooldownSeconds: this.personCooldown,
        triggerOncePerSession: this.personTriggerOncePerSession,
      });
    }

    if (this.phoneDetectionEnabled) {
      rules.push({
        objectType: "cell phone",
        minConfidence: this.phoneMinConfidence,
        geminiPrompt: this.phonePrompt,
        enabled: true,
        cooldownSeconds: this.phoneCooldown,
        triggerOncePerSession: this.phoneTriggerOncePerSession,
      });
    }

    if (this.customObjectEnabled) {
      rules.push({
        objectType: this.customObjectType.toLowerCase(),
        minConfidence: this.customObjectMinConfidence,
        geminiPrompt: this.customObjectPrompt,
        enabled: true,
        cooldownSeconds: this.customObjectCooldown,
        triggerOncePerSession: this.customObjectTriggerOncePerSession,
      });
    }

    // Check each detection against rules
    detections.forEach((detection) => {
      this.checkDetectionAgainstRules(detection, rules);
    });
  }

  /**
   * Check if a detection matches any rules and trigger Gemini
   */
  private checkDetectionAgainstRules(
    detection: YOLODetection,
    rules: DetectionRule[]
  ) {
    const matchingRule = rules.find(
      (rule) =>
        rule.enabled &&
        detection.class_name.toLowerCase() === rule.objectType.toLowerCase() &&
        detection.confidence >= rule.minConfidence
    );

    if (!matchingRule) {
      return;
    }

    // Check if this object has already triggered this session (if triggerOncePerSession is enabled)
    if (matchingRule.triggerOncePerSession) {
      if (this.triggeredThisSession.has(matchingRule.objectType)) {
        print(
          `[DETECTION TRIGGER] 🔇 ${matchingRule.objectType} detected but already triggered this session (trigger once mode)`
        );
        return;
      }
    }

    // Check cooldown (only if not in trigger-once mode, or if it hasn't been triggered yet)
    const now = getTime();
    const lastTrigger = this.lastTriggerTimes.get(matchingRule.objectType) || 0;
    const timeSinceLastTrigger = now - lastTrigger;

    if (!matchingRule.triggerOncePerSession && timeSinceLastTrigger < matchingRule.cooldownSeconds) {
      const timeRemaining = matchingRule.cooldownSeconds - timeSinceLastTrigger;
      print(
        `[DETECTION TRIGGER] ⏳ ${matchingRule.objectType} detected but in cooldown (${timeRemaining.toFixed(0)}s remaining)`
      );
      return;
    }

    // Rule matched and not in cooldown - trigger Gemini!
    this.triggerGemini(detection, matchingRule);
  }

  /**
   * Trigger Gemini with a detection-based prompt
   */
  private triggerGemini(detection: YOLODetection, rule: DetectionRule) {
    print("[DETECTION TRIGGER] ========================================");
    print(`[DETECTION TRIGGER] 🎯 RULE MATCHED!`);
    print(`[DETECTION TRIGGER] Object: ${detection.class_name.toUpperCase()}`);
    print(`[DETECTION TRIGGER] Confidence: ${(detection.confidence * 100).toFixed(1)}%`);
    print(`[DETECTION TRIGGER] Distance: ${detection.distance.toFixed(2)}m`);

    if (rule.triggerOncePerSession) {
      print(`[DETECTION TRIGGER] Mode: TRIGGER ONCE (won't repeat this session)`);
    } else {
      print(`[DETECTION TRIGGER] Mode: REPEATING (cooldown: ${rule.cooldownSeconds}s)`);
    }

    print(`[DETECTION TRIGGER] Triggering Gemini...`);
    print("[DETECTION TRIGGER] ========================================");

    // Update last trigger time
    this.lastTriggerTimes.set(rule.objectType, getTime());

    // Mark as triggered this session if in trigger-once mode
    if (rule.triggerOncePerSession) {
      this.triggeredThisSession.add(rule.objectType);
      print(`[DETECTION TRIGGER] 🔒 Locked: ${rule.objectType} won't trigger again this session`);
    }

    // Send prompt to Gemini
    this.marvinAssistant.sendClientMessage(rule.geminiPrompt);

    print(`[DETECTION TRIGGER] ✅ Sent to Gemini: "${rule.geminiPrompt.substring(0, 50)}..."`);
  }

  /**
   * Manually trigger detection (for testing)
   */
  public async triggerDetectionNow() {
    print("[DETECTION TRIGGER] 🔍 Manual detection triggered...");

    // Get camera texture from detection manager
    const texture = this.detectionManager["cameraTexture"];
    if (!texture) {
      print("[DETECTION TRIGGER] ❌ No camera texture available");
      return;
    }

    // Trigger detection
    await this.marvinAssistant.triggerRemoteObjectDetection(texture);
  }

  /**
   * Reset cooldowns for all objects
   */
  public resetCooldowns() {
    this.lastTriggerTimes.clear();
    print("[DETECTION TRIGGER] ✅ All cooldowns reset");
  }

  /**
   * Reset session triggers (allows trigger-once rules to fire again)
   */
  public resetSession() {
    this.triggeredThisSession.clear();
    this.lastTriggerTimes.clear();
    print("[DETECTION TRIGGER] ✅ Session reset - all rules can trigger again");
  }

  /**
   * Get time until next trigger is allowed for an object
   */
  public getTimeUntilNextTrigger(objectType: string): number {
    const lastTrigger = this.lastTriggerTimes.get(objectType.toLowerCase()) || 0;
    const timeSince = getTime() - lastTrigger;

    // Find the rule for this object type
    let cooldown = 30; // default
    if (objectType.toLowerCase() === "laptop") cooldown = this.laptopCooldown;
    if (objectType.toLowerCase() === "person") cooldown = this.personCooldown;
    if (objectType.toLowerCase() === "cell phone") cooldown = this.phoneCooldown;
    if (objectType.toLowerCase() === this.customObjectType.toLowerCase())
      cooldown = this.customObjectCooldown;

    const remaining = cooldown - timeSince;
    return Math.max(0, remaining);
  }
}
