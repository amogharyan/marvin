import { MarvinAssistant } from "./MarvinAssistant";
import { setTimeout } from "SpectaclesInteractionKit.lspkg/Utils/FunctionTimingUtils";

/**
 * Helper component to periodically request video analysis from Gemini
 * This ensures Gemini actively analyzes the video stream
 */
@component
export class VideoAnalysisHelper extends BaseScriptComponent {
  @ui.separator
  @ui.label("Video Analysis Helper - Triggers Gemini to analyze video")
  @ui.separator
  
  @input
  private marvinAssistant: MarvinAssistant;
  
  @input
  @hint("Seconds between analysis requests")
  private analysisInterval: number = 5;
  
  @input
  @hint("Enable automatic periodic analysis - DEPRECATED: Use object-specific prompts instead")
  private enableAutoAnalysis: boolean = false; // Disabled - now using targeted object-specific prompts
  
  private lastAnalysisTime: number = 0;
  private isActive: boolean = false;
  
  onAwake() {
    this.createEvent("OnStartEvent").bind(this.onStart.bind(this));
    this.createEvent("UpdateEvent").bind(this.onUpdate.bind(this));
  }
  
  private onStart() {
    print("[VIDEO ANALYSIS] Helper initialized");
    print(`[VIDEO ANALYSIS] Interval: ${this.analysisInterval}s, Auto: ${this.enableAutoAnalysis}`);
  }
  
  private onUpdate() {
    if (!this.enableAutoAnalysis || !this.isActive) {
      return;
    }
    
    const currentTime = getTime();
    if (currentTime - this.lastAnalysisTime >= this.analysisInterval) {
      this.requestAnalysis();
      this.lastAnalysisTime = currentTime;
    }
  }
  
  /**
   * Request Gemini to analyze the current video frame
   */
  public requestAnalysis() {
    if (!this.marvinAssistant) {
      print("[VIDEO ANALYSIS] ERROR: MarvinAssistant not connected");
      return;
    }
    
    print("[VIDEO ANALYSIS] Requesting scene description from Gemini...");

    // Send a client message asking Gemini to describe what it sees
    // This will be spoken back to the user and trigger object detection
    this.marvinAssistant.sendClientMessage(
      ""
    );
  }
  
  /**
   * Start periodic analysi
   */
  public startAnalysis() {
    this.isActive = true;
    this.lastAnalysisTime = getTime();
    print("[VIDEO ANALYSIS] Started periodic analysis");
  }
  
  /**
   * Stop periodic analysis
   */
  public stopAnalysis() {
    this.isActive = false;
    print("[VIDEO ANALYSIS] Stopped periodic analysis");
  }
  
  /**
   * Trigger immediate analysis (for manual testing)
   */
  public analyzeNow() {
    print("[VIDEO ANALYSIS] Manual analysis triggered");
    this.requestAnalysis();
  }
}
