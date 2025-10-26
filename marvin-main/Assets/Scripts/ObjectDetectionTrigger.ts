import { MarvinAssistant } from "./MarvinAssistant";
import { RemoteObjectDetectionManager, YOLODetection } from "./RemoteObjectDetectionManager";

/**
 * Detection rule for triggering Gemini and Image Popup based on YOLO detections
 */
export interface DetectionRule {
  objectType: string;
  minConfidence: number;
  geminiPrompt: string;
  imageTexture: Texture | null;
  imageContainer: SceneObject | null;
  enabled: boolean;
  cooldownSeconds: number; // Prevent spam
  triggerOncePerSession: boolean; // Only trigger once, then never again until restart
}

/**
 * Bridges YOLO object detection with Gemini AI responses and Image Popups
 * When specific objects are detected, triggers Gemini to respond AND shows custom images
 */
@component
export class ObjectDetectionTrigger extends BaseScriptComponent {
  @ui.separator
  @ui.label("🎯 Object Detection → Gemini + Image Popup")
  @ui.separator

  @ui.group_start("Components")
  @input
  marvinAssistant: MarvinAssistant;

  @input
  detectionManager: RemoteObjectDetectionManager;
  @ui.group_end

  @ui.group_start("Image Popup Settings")
  @input
  @hint("Enable image popup feature")
  imagePopupEnabled: boolean = true;

  @input
  @hint("Animation duration in seconds")
  animationDuration: number = 0.5;

  @input
  @hint("Auto-hide image after X seconds (0 = never)")
  autoHideAfterSeconds: number = 0;
  @ui.group_end

  @ui.group_start("💻 Laptop Detection Rule")
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
  @hint("Image container for laptop (SceneObject with Image component)")
  @allowUndefined
  laptopImageContainer: SceneObject;

  @input
  @showIf("laptopImageContainer")
  @hint("Image to show when laptop is detected")
  @allowUndefined
  laptopImage: Texture;

  @input
  @hint("Cooldown between laptop detections (seconds, ignored if trigger once is enabled)")
  laptopCooldown: number = 30;
  @ui.group_end

  @ui.group_start("🥣 Bowl Detection Rule")
  @input
  bowlDetectionEnabled: boolean = false;

  @input
  bowlTriggerOncePerSession: boolean = false;

  @input
  bowlMinConfidence: number = 0.7;

  @input
  @widget(new TextAreaWidget())
  bowlPrompt: string = "I see a bowl nearby. Are you having a meal?";

  @input
  @hint("Image container for bowl (SceneObject with Image component)")
  @allowUndefined
  bowlImageContainer: SceneObject;

  @input
  @showIf("bowlImageContainer")
  @hint("Image to show when bowl is detected")
  @allowUndefined
  bowlImage: Texture;

  @input
  bowlCooldown: number = 60;
  @ui.group_end

  @ui.group_start("📚 Book Detection Rule")
  @input
  bookDetectionEnabled: boolean = false;

  @input
  bookTriggerOncePerSession: boolean = false;

  @input
  bookMinConfidence: number = 0.7;

  @input
  @widget(new TextAreaWidget())
  bookPrompt: string = "I see a book nearby. What are you reading?";

  @input
  @hint("Image container for book (SceneObject with Image component)")
  @allowUndefined
  bookImageContainer: SceneObject;

  @input
  @showIf("bookImageContainer")
  @hint("Image to show when book is detected")
  @allowUndefined
  bookImage: Texture;

  @input
  bookCooldown: number = 45;
  @ui.group_end

  @ui.group_start("✨ Custom Detection Rules")
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
  @hint("Image container for custom object (SceneObject with Image component)")
  @allowUndefined
  customObjectImageContainer: SceneObject;

  @input
  @showIf("customObjectImageContainer")
  @hint("Image to show when custom object is detected")
  @allowUndefined
  customObjectImage: Texture;

  @input
  customObjectCooldown: number = 60;
  @ui.group_end

  // Track last trigger times to prevent spam
  private lastTriggerTimes: Map<string, number> = new Map();
  // Track which objects have been triggered this session
  private triggeredThisSession: Set<string> = new Set();
  private isListening: boolean = false;

  // Image popup state - per object type
  private imageComponents: Map<string, Image> = new Map();
  private imageContainers: Map<string, SceneObject> = new Map();
  private originalScales: Map<string, vec3> = new Map();
  private visibleImages: Set<string> = new Set();
  private currentAnimations: Map<string, SceneEvent> = new Map();
  private autoHideEvents: Map<string, SceneEvent> = new Map();

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

    // Set up image popups for each object type
    print(`[DETECTION TRIGGER] 🖼️ Image popup enabled: ${this.imagePopupEnabled}`);

    if (this.imagePopupEnabled) {
      // Initialize laptop container
      if (this.laptopImageContainer) {
        this.initializeImageContainer("laptop", this.laptopImageContainer);
      }

      // Initialize bowl container
      if (this.bowlImageContainer) {
        this.initializeImageContainer("bowl", this.bowlImageContainer);
      }

      // Initialize book container
      if (this.bookImageContainer) {
        this.initializeImageContainer("book", this.bookImageContainer);
      }

      // Initialize custom object container
      if (this.customObjectImageContainer) {
        this.initializeImageContainer(this.customObjectType.toLowerCase(), this.customObjectImageContainer);
      }

      print(`[DETECTION TRIGGER] ✅ Image popup system initialized`);
      print(`[DETECTION TRIGGER] 📊 Auto-hide: ${this.autoHideAfterSeconds}s`);
      print(`[DETECTION TRIGGER] 📊 Animation duration: ${this.animationDuration}s`);
    }

    // Subscribe to YOLO detection events
    this.marvinAssistant.yoloDetectionCompleteEvent.add((result) => {
      this.handleDetections(result.detections);
    });

    print("[DETECTION TRIGGER] ✅ Ready to trigger Gemini + Image Popups");
    this.printActiveRules();
  }

  /**
   * Initialize an image container for a specific object type
   */
  private initializeImageContainer(objectType: string, container: SceneObject) {
    const imageComponent = container.getComponent("Component.Image") as Image;

    if (!imageComponent) {
      print(`[DETECTION TRIGGER] ⚠️ WARNING: No Image component on ${objectType} container!`);
      return;
    }

    // Store the components
    this.imageContainers.set(objectType, container);
    this.imageComponents.set(objectType, imageComponent);

    // Save original scale
    const transform = container.getTransform();
    const originalScale = transform.getLocalScale();
    this.originalScales.set(objectType, originalScale);

    // Hide initially
    container.enabled = false;

    print(`[DETECTION TRIGGER] ✅ Initialized ${objectType} image container (scale: ${originalScale.x}, ${originalScale.y}, ${originalScale.z})`);
  }

  private printActiveRules() {
    print("[DETECTION TRIGGER] Active detection rules:");

    if (this.laptopDetectionEnabled) {
      print(`[DETECTION TRIGGER]   💻 LAPTOP (confidence ≥ ${(this.laptopMinConfidence * 100).toFixed(0)}%)`);
    }

    if (this.bowlDetectionEnabled) {
      print(`[DETECTION TRIGGER]   🥣 BOWL (confidence ≥ ${(this.bowlMinConfidence * 100).toFixed(0)}%)`);
    }

    if (this.bookDetectionEnabled) {
      print(`[DETECTION TRIGGER]   📚 BOOK (confidence ≥ ${(this.bookMinConfidence * 100).toFixed(0)}%)`);
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
        imageTexture: this.laptopImage,
        imageContainer: this.laptopImageContainer,
        enabled: true,
        cooldownSeconds: this.laptopCooldown,
        triggerOncePerSession: this.laptopTriggerOncePerSession,
      });
    }

    if (this.bowlDetectionEnabled) {
      rules.push({
        objectType: "bowl",
        minConfidence: this.bowlMinConfidence,
        geminiPrompt: this.bowlPrompt,
        imageTexture: this.bowlImage,
        imageContainer: this.bowlImageContainer,
        enabled: true,
        cooldownSeconds: this.bowlCooldown,
        triggerOncePerSession: this.bowlTriggerOncePerSession,
      });
    }

    if (this.bookDetectionEnabled) {
      rules.push({
        objectType: "book",
        minConfidence: this.bookMinConfidence,
        geminiPrompt: this.bookPrompt,
        imageTexture: this.bookImage,
        imageContainer: this.bookImageContainer,
        enabled: true,
        cooldownSeconds: this.bookCooldown,
        triggerOncePerSession: this.bookTriggerOncePerSession,
      });
    }

    if (this.customObjectEnabled) {
      rules.push({
        objectType: this.customObjectType.toLowerCase(),
        minConfidence: this.customObjectMinConfidence,
        geminiPrompt: this.customObjectPrompt,
        imageTexture: this.customObjectImage,
        imageContainer: this.customObjectImageContainer,
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
   * Trigger Gemini with a detection-based prompt and show image popup
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

    print(`[DETECTION TRIGGER] Triggering Gemini + Image Popup...`);
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

    // Show image popup if enabled and container/image are assigned
    if (this.imagePopupEnabled && rule.imageContainer && rule.imageTexture) {
      this.showImageForObject(rule.objectType, rule.imageTexture);
      print(`[DETECTION TRIGGER] 🖼️ Showing image for ${detection.class_name}`);
    } else if (this.imagePopupEnabled && !rule.imageContainer) {
      print(`[DETECTION TRIGGER] ⚠️ No image container assigned for ${detection.class_name}`);
    } else if (this.imagePopupEnabled && !rule.imageTexture) {
      print(`[DETECTION TRIGGER] ⚠️ No image texture assigned for ${detection.class_name}`);
    }
  }

  /**
   * Show image popup with animation for a specific object type
   */
  private showImageForObject(objectType: string, texture: Texture) {
    print(`[DETECTION TRIGGER] 📸 showImageForObject called for: ${objectType}`);

    const container = this.imageContainers.get(objectType);
    const imageComponent = this.imageComponents.get(objectType);
    const originalScale = this.originalScales.get(objectType);

    if (!container || !imageComponent) {
      print(`[DETECTION TRIGGER] ❌ Cannot show image - missing components for ${objectType}!`);
      return;
    }

    // Cancel any existing animation for this object
    const existingAnimation = this.currentAnimations.get(objectType);
    if (existingAnimation) {
      existingAnimation.enabled = false;
      this.currentAnimations.delete(objectType);
    }

    const existingAutoHide = this.autoHideEvents.get(objectType);
    if (existingAutoHide) {
      existingAutoHide.enabled = false;
      this.autoHideEvents.delete(objectType);
    }

    // Set the texture
    print(`[DETECTION TRIGGER] 🎨 Setting texture on ${objectType} image component...`);
    imageComponent.mainPass.baseTex = texture;

    // Enable container
    print(`[DETECTION TRIGGER] 👁️ Enabling ${objectType} image container...`);
    container.enabled = true;
    this.visibleImages.add(objectType);

    // Animate scale - preserve original scale from scene
    const transform = container.getTransform();

    const startScale = originalScale
      ? new vec3(
          originalScale.x * 0.1,
          originalScale.y * 0.1,
          originalScale.z * 0.1
        )
      : new vec3(0.1, 0.1, 0.1);

    const endScale = originalScale || new vec3(1, 1, 1);

    print(`[DETECTION TRIGGER] 📏 Starting scale animation for ${objectType} from ${startScale.x} to ${endScale.x}...`);
    transform.setLocalScale(startScale);
    this.animateScaleForObject(objectType, transform, startScale, endScale, this.animationDuration);

    // Set up auto-hide if configured
    print(`[DETECTION TRIGGER] 🔍 Checking auto-hide... autoHideAfterSeconds = ${this.autoHideAfterSeconds}`);
    if (this.autoHideAfterSeconds > 0) {
      print(`[DETECTION TRIGGER] ⏲️ Auto-hide IS ENABLED for ${objectType} - scheduling for ${this.autoHideAfterSeconds}s`);
      this.scheduleAutoHideForObject(objectType);
    } else {
      print(`[DETECTION TRIGGER] ⏲️⏲️⏲️ Auto-hide DISABLED for ${objectType} (value is ${this.autoHideAfterSeconds})`);
    }

    print(`[DETECTION TRIGGER] ✅ Image popup for ${objectType} setup complete!`);
  }

  /**
   * Hide image popup with animation for a specific object type
   */
  public hideImageForObject(objectType: string) {
    const container = this.imageContainers.get(objectType);
    const originalScale = this.originalScales.get(objectType);

    if (!this.visibleImages.has(objectType) || !container) return;

    // Cancel auto-hide event
    const existingAutoHide = this.autoHideEvents.get(objectType);
    if (existingAutoHide) {
      existingAutoHide.enabled = false;
      this.autoHideEvents.delete(objectType);
    }

    // Cancel any existing animation
    const existingAnimation = this.currentAnimations.get(objectType);
    if (existingAnimation) {
      existingAnimation.enabled = false;
      this.currentAnimations.delete(objectType);
    }

    const transform = container.getTransform();
    const startScale = transform.getLocalScale();

    // Use original scale for end animation
    const endScale = originalScale
      ? new vec3(
          originalScale.x * 0.1,
          originalScale.y * 0.1,
          originalScale.z * 0.1
        )
      : new vec3(0.1, 0.1, 0.1);

    print(`[DETECTION TRIGGER] 🔽 Hiding ${objectType} image - animating from ${startScale.x} to ${endScale.x}...`);

    this.animateScaleForObject(objectType, transform, startScale, endScale, this.animationDuration, () => {
      container.enabled = false;
      this.visibleImages.delete(objectType);
      print(`[DETECTION TRIGGER] ✅ ${objectType} image hidden`);
    });
  }

  /**
   * Animate scale over time for a specific object type
   */
  private animateScaleForObject(
    objectType: string,
    transform: Transform,
    startScale: vec3,
    endScale: vec3,
    duration: number,
    onComplete?: () => void
  ) {
    let elapsed = 0;

    const updateEvent = this.createEvent("UpdateEvent");
    this.currentAnimations.set(objectType, updateEvent);

    updateEvent.bind(() => {
      elapsed += getDeltaTime();
      const t = Math.min(elapsed / duration, 1.0);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - t, 3);

      const currentScale = vec3.lerp(startScale, endScale, eased);
      transform.setLocalScale(currentScale);

      if (t >= 1.0) {
        updateEvent.enabled = false;
        this.currentAnimations.delete(objectType);
        if (onComplete) onComplete();
      }
    });
  }

  /**
   * Schedule auto-hide for a specific object type
   */
  private scheduleAutoHideForObject(objectType: string) {
    print(`[DETECTION TRIGGER] ⏲️⏲️⏲️ scheduleAutoHideForObject called for ${objectType}! Timer: ${this.autoHideAfterSeconds}s`);

    const existingEvent = this.autoHideEvents.get(objectType);
    if (existingEvent) {
      existingEvent.enabled = false;
    }

    const delayEvent = this.createEvent("DelayedCallbackEvent") as DelayedCallbackEvent;
    this.autoHideEvents.set(objectType, delayEvent);
    delayEvent.bind(() => {
      print(`[DETECTION TRIGGER] ⏰⏰⏰ AUTO-HIDING ${objectType} IMAGE NOW!`);
      this.hideImageForObject(objectType);
    });
    delayEvent.reset(this.autoHideAfterSeconds);
    print(`[DETECTION TRIGGER] ⏲️ Auto-hide event for ${objectType} scheduled for ${this.autoHideAfterSeconds} seconds from now`);
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
   * Hide all visible images
   */
  public hideAllImages() {
    const visibleTypes = Array.from(this.visibleImages);
    visibleTypes.forEach(objectType => {
      this.hideImageForObject(objectType);
    });
    print(`[DETECTION TRIGGER] ✅ Hiding all ${visibleTypes.length} visible images`);
  }

  /**
   * Check if any images are currently visible
   */
  public hasVisibleImages(): boolean {
    return this.visibleImages.size > 0;
  }

  /**
   * Get list of currently visible image types
   */
  public getVisibleImageTypes(): string[] {
    return Array.from(this.visibleImages);
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
    if (objectType.toLowerCase() === "bowl") cooldown = this.bowlCooldown;
    if (objectType.toLowerCase() === "book") cooldown = this.bookCooldown;
    if (objectType.toLowerCase() === this.customObjectType.toLowerCase())
      cooldown = this.customObjectCooldown;

    const remaining = cooldown - timeSince;
    return Math.max(0, remaining);
  }
}
