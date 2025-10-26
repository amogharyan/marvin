import { MarvinAssistant } from "./MarvinAssistant";
import Event from "SpectaclesInteractionKit.lspkg/Utils/Event";
import { setTimeout } from "SpectaclesInteractionKit.lspkg/Utils/FunctionTimingUtils";

// Object types for demo
enum ObjectType {
  BreakfastBowl = "breakfast_bowl",
  Laptop = "laptop",
  Keys = "keys",
  MedicineBottle = "medicine_bottle",
  Phone = "phone",
  Unknown = "unknown"
}

// Proximity detection configuration
interface ProximityConfig {
  detectionDistance: number; // meters
  cooldownPeriod: number; // milliseconds
  minConfidence: number; // 0-1
}

// Contextual recommendation
interface ContextualRecommendation {
  objectType: ObjectType;
  message: string;
  priority: "high" | "medium" | "low";
  shouldSpeak: boolean;
}

// Object context from PRD
interface ObjectContext {
  triggers: string[];
  aiContext: string;
  recommendations: string[];
}

@component
export class ContextualAssistant extends BaseScriptComponent {
  @ui.separator
  @ui.label("Marvin Contextual Awareness System")
  @ui.separator
  
  @ui.group_start("Core Components")
  @input
  private marvinAssistant: MarvinAssistant;
  
  @input
  private camera: Camera;
  @ui.group_end
  
  @ui.separator
  @ui.group_start("Proximity Settings")
  @input
  @hint("Distance in meters to trigger contextual awareness")
  private proximityDistance: number = 0.5; // 50cm
  
  @input
  @hint("Cooldown between recommendations (ms)")
  private cooldownPeriod: number = 30000; // 30 seconds
  
  @input
  @hint("Minimum confidence for object detection")
  private minConfidence: number = 0.7;
  
  @input
  @hint("Enable automatic proactive recommendations")
  private enableProactiveMode: boolean = true;
  @ui.group_end

  // LAPTOP-ONLY prompt - triggers the exact phrase
  private objectPrompts: Map<ObjectType, string> = new Map([
    [ObjectType.Laptop, "Respond with your exact programmed phrase about the laptop and work schedule."]
  ]);

  // Object context mapping based on PRD
  private objectContexts: Map<ObjectType, ObjectContext> = new Map([
    [ObjectType.BreakfastBowl, {
      triggers: ["nutrition_analysis", "recipe_suggestions", "calorie_tracking"],
      aiContext: "I see you're having breakfast! Let me help with nutrition.",
      recommendations: [
        "Would you like to know the nutritional content?",
        "I can suggest healthy recipe variations",
        "Track this meal for your daily goals?"
      ]
    }],
    [ObjectType.Laptop, {
      triggers: ["calendar_briefing", "meeting_prep", "day_overview"],
      aiContext: "Ready to start your workday? Let me brief you.",
      recommendations: [
        "Here's your schedule for today",
        "You have 3 meetings coming up - want details?",
        "Priority tasks for this morning"
      ]
    }],
    [ObjectType.Keys, {
      triggers: ["departure_checklist", "location_tracking", "reminder_alerts"],
      aiContext: "Getting ready to leave? Let's make sure you're prepared.",
      recommendations: [
        "Don't forget your phone and wallet",
        "Check you have everything for your first meeting",
        "Traffic looks light on your usual route"
      ]
    }],
    [ObjectType.MedicineBottle, {
      triggers: ["medication_reminders", "health_tracking", "schedule_alerts"],
      aiContext: "Time for your medication! Here's your health schedule.",
      recommendations: [
        "Take 2 pills with food",
        "You've been consistent this week - great job!",
        "Next dose scheduled for this evening"
      ]
    }],
    [ObjectType.Phone, {
      triggers: ["connectivity_check", "backup_interface", "device_sync"],
      aiContext: "Checking your notifications and connectivity.",
      recommendations: [
        "You have 5 unread messages",
        "Battery at 85% - good for the day",
        "Sync completed successfully"
      ]
    }]
  ]);
  
  // Tracking state
  private lastRecommendationTime: Map<ObjectType, number> = new Map();
  private activeObjects: Map<string, ObjectType> = new Map();
  private isProcessing: boolean = false;
  
  // Events
  public contextualRecommendationEvent: Event<ContextualRecommendation> = 
    new Event<ContextualRecommendation>();
  
  onAwake() {
    this.createEvent("OnStartEvent").bind(this.onStart.bind(this));
    this.createEvent("UpdateEvent").bind(this.onUpdate.bind(this));
  }
  
  private onStart() {
    print("Contextual Assistant initialized - Proactive mode: " + this.enableProactiveMode);
    
    // Initialize cooldown tracking
    for (const objectType of Object.values(ObjectType)) {
      this.lastRecommendationTime.set(objectType as ObjectType, 0);
    }
  }
  
  private onUpdate() {
    if (!this.enableProactiveMode || this.isProcessing) {
      return;
    }
    
    // Check for nearby objects and provide contextual awareness
    this.checkProximityAndProvideContext();
  }
  
  private checkProximityAndProvideContext() {
    // In a real implementation, this would use actual object tracking
    // For now, we'll trigger based on component detection events
  }
  
  /**
   * Called when an object is detected
   */
  public onObjectDetected(objectName: string, position: vec3, confidence: number) {
    print(`[CONTEXTUAL] onObjectDetected called - Object: ${objectName}, Confidence: ${confidence}`);

    if (confidence < this.minConfidence) {
      print(`[CONTEXTUAL] Confidence too low: ${confidence} < ${this.minConfidence}`);
      return;
    }

    const objectType = this.classifyObject(objectName);
    print(`[CONTEXTUAL] Classified as: ${objectType}`);

    // ONLY process laptop detections, ignore everything else
    if (objectType !== ObjectType.Laptop) {
      print(`[CONTEXTUAL] Not a laptop, ignoring (only laptop triggers enabled)`);
      return;
    }

    // At this point, we know it's a laptop

    // Check if object is close enough
    if (!this.camera) {
      print(`[CONTEXTUAL] ERROR: Camera not set!`);
      return;
    }

    const cameraPos = this.camera.getTransform().getWorldPosition();
    const distance = position.distance(cameraPos);

    print(`[CONTEXTUAL] Distance check - Object: ${distance.toFixed(2)}m, Threshold: ${this.proximityDistance}m`);

    if (distance <= this.proximityDistance) {
      print(`[CONTEXTUAL] Laptop within range, triggering recommendation`);
      this.triggerContextualRecommendation(objectType);
    } else {
      print(`[CONTEXTUAL] Laptop too far away: ${distance.toFixed(2)}m > ${this.proximityDistance}m`);
    }
  }
  
  /**
   * Classify detected object into known types
   */
  private classifyObject(objectName: string): ObjectType {
    const name = objectName.toLowerCase();
    
    if (name.includes("bowl") || name.includes("food") || name.includes("breakfast")) {
      return ObjectType.BreakfastBowl;
    } else if (name.includes("laptop") || name.includes("computer")) {
      return ObjectType.Laptop;
    } else if (name.includes("key")) {
      return ObjectType.Keys;
    } else if (name.includes("medicine") || name.includes("pill") || name.includes("bottle")) {
      return ObjectType.MedicineBottle;
    } else if (name.includes("phone")) {
      return ObjectType.Phone;
    }
    
    return ObjectType.Unknown;
  }
  
  /**
   * Trigger contextual recommendation for an object
   */
  private triggerContextualRecommendation(objectType: ObjectType) {
    // Check cooldown
    const lastTime = this.lastRecommendationTime.get(objectType) || 0;
    const currentTime = getTime() * 1000; // Convert to milliseconds

    print(`[CONTEXTUAL] Checking cooldown for ${objectType} - Last: ${lastTime}, Current: ${currentTime}`);

    if (currentTime - lastTime < this.cooldownPeriod) {
      print(`[CONTEXTUAL] Still in cooldown, skipping (${this.cooldownPeriod - (currentTime - lastTime)}ms remaining)`);
      return; // Still in cooldown
    }

    this.isProcessing = true;

    // Get object-specific prompt from PRD
    const prompt = this.objectPrompts.get(objectType);
    if (!prompt) {
      print(`[CONTEXTUAL] No prompt found for ${objectType}`);
      this.isProcessing = false;
      return;
    }

    print(`[CONTEXTUAL] Triggering Gemini with object-specific prompt for ${objectType}`);

    // Update cooldown
    this.lastRecommendationTime.set(objectType, currentTime);

    // Send object-specific prompt to Marvin/Gemini
    if (this.marvinAssistant) {
      this.marvinAssistant.sendClientMessage(prompt);
      print(`[CONTEXTUAL] Sent to Gemini: "${prompt}"`);
    } else {
      print(`[CONTEXTUAL] ERROR: MarvinAssistant not connected!`);
    }

    // Reset processing flag after a delay
    setTimeout(() => {
      this.isProcessing = false;
    }, 2000);
  }
  
  /**
   * Generate contextual recommendation
   */
  private generateRecommendation(
    objectType: ObjectType, 
    context: ObjectContext
  ): ContextualRecommendation {
    
    // Pick a random recommendation for variety
    const randomIndex = Math.floor(Math.random() * context.recommendations.length);
    const message = context.aiContext + " " + context.recommendations[randomIndex];
    
    // Determine priority based on object type
    let priority: "high" | "medium" | "low" = "medium";
    if (objectType === ObjectType.MedicineBottle) {
      priority = "high";
    } else if (objectType === ObjectType.Keys) {
      priority = "high";
    }
    
    return {
      objectType: objectType,
      message: message,
      priority: priority,
      shouldSpeak: true
    };
  }
  
  /**
   * Send contextual message to Marvin for voice output
   */
  private sendToMarvin(recommendation: ContextualRecommendation) {
    print("Contextual recommendation: " + recommendation.message);
    
    // In a real implementation, this would send the message to Marvin
    // to be spoken through the voice synthesis system
    if (this.marvinAssistant && recommendation.shouldSpeak) {
      // Marvin will process this as a proactive notification
      // This would integrate with the existing updateTextEvent
    }
  }
  
  /**
   * Manually trigger recommendation for testing
   */
  public triggerManualRecommendation(objectType: ObjectType) {
    this.triggerContextualRecommendation(objectType);
  }
  
  /**
   * Reset cooldowns (for demo purposes)
   */
  public resetCooldowns() {
    for (const objectType of Object.values(ObjectType)) {
      this.lastRecommendationTime.set(objectType as ObjectType, 0);
    }
    print("All cooldowns reset");
  }
  
  /**
   * Enable/disable proactive mode at runtime
   */
  public setProactiveMode(enabled: boolean) {
    this.enableProactiveMode = enabled;
    print("Proactive mode " + (enabled ? "enabled" : "disabled"));
  }
}
