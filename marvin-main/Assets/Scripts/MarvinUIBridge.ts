import { PinchButton } from "SpectaclesInteractionKit.lspkg/Components/UI/PinchButton/PinchButton";
import { MarvinAssistant } from "./MarvinAssistant";
import { AROverlay } from "./AROverlay";
import { SphereController } from "./SphereController";
import { ContextualAssistant } from "./ContextualAssistant";
import { VideoAnalysisHelper } from "./VideoAnalysisHelper";
import { LSTween } from "LSTween.lspkg/LSTween";
import Easing from "LSTween.lspkg/TweenJS/Easing";
import Event from "SpectaclesInteractionKit.lspkg/Utils/Event";
import { setTimeout, clearTimeout } from "SpectaclesInteractionKit.lspkg/Utils/FunctionTimingUtils";

// Simplified - just start/stop analysis

// UI state management
enum UIState {
  Initial = "initial",
  Analyzing = "analyzing",
  ShowingGuidance = "showing_guidance",
  RecognitionComplete = "recognition_complete"
}

@component
export class MarvinUIBridge extends BaseScriptComponent {
  @ui.separator
  @ui.label("Marvin Object Recognition - Main UI Controller")
  @ui.separator
  @ui.group_start("Core Components")
  @input
  private marvinAssistant: MarvinAssistant;

  // Backward compatibility alias for scene configuration
  @input
  private breadboardAssistant: MarvinAssistant;

  @input
  private arOverlay: AROverlay;

  // Backward compatibility alias for scene configuration
  @input
  private breadboardAROverlay: AROverlay;

  @input
  private sphereController: SphereController;

  @input
  private contextualAssistant: ContextualAssistant;

  @input
  private videoAnalysisHelper: VideoAnalysisHelper;
  @ui.group_end
  @ui.separator
  @ui.group_start("UI Elements")
  @input
  private startStopButton: PinchButton;
  @input
  private hintTitle: Text;
  @input
  private hintText: Text;
  @input
  private statusText: Text;
  @ui.group_end
  @ui.separator
  @ui.group_start("Recognition Settings")
  @input
  private showObjectLabels: boolean = true;
  @input
  private showRelationshipLines: boolean = true;
  @ui.group_end

  // State management
  private currentUIState: UIState = UIState.Initial;
  private isAnalysisActive: boolean = false;
  private detectedComponentsCount: number = 0;
  private circuitTopologyComplete: boolean = false;
  private hasPressedButtonOnce: boolean = false;
  private revertTimeout: any = null;

  // Events
  public analysisCompletedEvent: Event<{ components: number; topologyComplete: boolean }> = new Event<{ components: number; topologyComplete: boolean }>();

  onAwake() {
    this.createEvent("OnStartEvent").bind(this.onStart.bind(this));
  }

  onDestroy() {
    // Clean up any pending timeouts
    if (this.revertTimeout) {
      clearTimeout(this.revertTimeout);
      this.revertTimeout = null;
    }
  }

  private onStart() {
    // Handle backward compatibility - use old property names if new ones aren't set
    if (!this.marvinAssistant && this.breadboardAssistant) {
      this.marvinAssistant = this.breadboardAssistant;
    }
    if (!this.arOverlay && this.breadboardAROverlay) {
      this.arOverlay = this.breadboardAROverlay;
    }

    this.initializeUI();
    this.connectEvents();
    this.updateUIState(UIState.Initial);
    
    // Automatically start the Gemini Live session and analysis
    print("[MarvinUI] Auto-starting Gemini Live session...");
    this.startAnalysis();
  }

  private initializeUI() {
    // Set up single start/stop button
    this.startStopButton.onButtonPinched.add(() => {
      if (this.isAnalysisActive) {
        this.stopAnalysis();
      } else {
        this.startAnalysis();
      }
    });

    // Initialize text content
    this.hintTitle.text = "Go!";
    this.hintText.text = "Look at objects for contextual help";
    this.statusText.text = "Ready for Marvin";

    // Update button text
    this.updateButtonText();
  }

  private connectEvents() {
    // Connect to marvin assistant events
    this.marvinAssistant.componentDetectedEvent.add((component) => {
      this.onComponentDetected(component);
    });

    this.marvinAssistant.circuitCompleteEvent.add((topology) => {
      this.onCircuitComplete(topology);
    });

    this.marvinAssistant.updateTextEvent.add((data) => {
      this.updateStatusText(data.text);
    });

    // Connect to AR overlay events
    this.arOverlay.overlayCreatedEvent.add((overlay) => {
      this.onOverlayCreated(overlay);
    });

    this.arOverlay.overlayRemovedEvent.add((overlayId) => {
      this.onOverlayRemoved(overlayId);
    });

    // Connect to sphere controller for activation
    this.sphereController.isActivatedEvent.add((isActivated) => {
      this.onSphereActivated(isActivated);
    });

    // Connect to contextual assistant for proactive recommendations
    if (this.contextualAssistant) {
      this.contextualAssistant.contextualRecommendationEvent.add((recommendation) => {
        this.onContextualRecommendation(recommendation);
      });
    }
  }

  private startAnalysis() {
    if (this.isAnalysisActive) {
      this.stopAnalysis();
      return;
    }

    // Clear any pending revert timeout since user is actively using the system
    if (this.revertTimeout) {
      clearTimeout(this.revertTimeout);
      this.revertTimeout = null;
      print("Cleared revert timeout - user is actively using system");
    }

    this.isAnalysisActive = true;
    this.updateUIState(UIState.Analyzing);

    // Start the assistant for object recognition
    this.marvinAssistant.createGeminiLiveSession();
    this.marvinAssistant.startAnalysis();

    // Start periodic video analysis
    if (this.videoAnalysisHelper) {
      this.videoAnalysisHelper.startAnalysis();
      print("[UI] Started VideoAnalysisHelper for periodic scene analysis");
    }

    // Update UI for Marvin analysis mode
    this.updateStatusText("Ask me a question!");
    
    // Hide hint text and title after first button press
    if (!this.hasPressedButtonOnce) {
      this.hasPressedButtonOnce = true;
      // Hide the hint text and title by making them invisible
      this.hintText.sceneObject.enabled = false;
      this.hintTitle.sceneObject.enabled = false;
    }

    // Update button text
    this.updateButtonText();
  }

  private stopAnalysis() {
    this.isAnalysisActive = false;
    this.marvinAssistant.stopAnalysis();

    // Stop periodic video analysis
    if (this.videoAnalysisHelper) {
      this.videoAnalysisHelper.stopAnalysis();
      print("[UI] Stopped VideoAnalysisHelper");
    }

    this.updateUIState(UIState.Initial);
    this.updateStatusText("Analysis stopped");
    
    // Start 10-second timeout to revert to original state
    this.startRevertTimeout();
    
    // Update button text
    this.updateButtonText();
  }

  private updateButtonText() {
    // PinchButton doesn't have text property - we'll use status text instead
    // The button state is managed by the analysis state
  }

  private startRevertTimeout() {
    // Clear any existing timeout
    if (this.revertTimeout) {
      clearTimeout(this.revertTimeout);
    }
    
    // Start 4-second timeout
    this.revertTimeout = setTimeout(() => {
      this.revertToOriginalState();
    }, 4000); // 4 seconds
    
    print("Started 4-second revert timeout");
  }

  private revertToOriginalState() {
    // Show hint text and title again
    this.hintText.sceneObject.enabled = true;
    this.hintTitle.sceneObject.enabled = true;
    this.hintText.text = "Press button to start/stop analysis";
    this.updateStatusText("Ready for Marvin");
    
    // Reset the flag so hint can be hidden again on next start
    this.hasPressedButtonOnce = false;
    
    print("Reverted to original state - hint text visible again");
  }

  private onComponentDetected(component: any) {
    this.detectedComponentsCount++;

    // Update status based on component type - generalized for any object
    this.updateStatusText(`Detected ${component.type}${component.value ? ' (' + component.value + ')' : ''} - Total: ${this.detectedComponentsCount}`);

    // Show object label if enabled
    if (this.showObjectLabels) {
      this.arOverlay.showComponentLabel(component);
    }

    // Trigger contextual recommendations if enabled
    if (this.contextualAssistant && component.position) {
      this.contextualAssistant.onObjectDetected(
        component.type,
        component.position,
        component.confidence || 0.9
      );
    }

    // Check if we have enough objects for analysis
    if (this.detectedComponentsCount >= 3) {
      this.performCircuitTopologyAnalysis();
    }
  }

  private onContextualRecommendation(recommendation: any) {
    // Display proactive contextual recommendation
    print(`Contextual: ${recommendation.message}`);

    // Update UI with contextual message
    this.updateStatusText(recommendation.message);

    // Show with special styling for high priority
    if (recommendation.priority === "high") {
      this.hintTitle.text = "Important!";
      this.hintText.text = recommendation.message;
      this.hintText.sceneObject.enabled = true;
      this.hintTitle.sceneObject.enabled = true;

      // Auto-hide after 5 seconds
      setTimeout(() => {
        if (!this.isAnalysisActive) {
          this.hintText.sceneObject.enabled = false;
          this.hintTitle.sceneObject.enabled = false;
        }
      }, 5000);
    }
  }

  private onCircuitComplete(topology: any) {
    this.circuitTopologyComplete = true;
    this.updateUIState(UIState.RecognitionComplete);

    // Show relationship visualization
    if (this.showRelationshipLines) {
      this.arOverlay.showCircuitTopology(topology);
    }

    // Update status
    this.updateStatusText("Object recognition complete!");
    this.hintText.text = "Analysis complete. All objects and relationships identified.";

    // Trigger completion event
    this.analysisCompletedEvent.invoke({
      components: this.detectedComponentsCount,
      topologyComplete: true
    });
  }

  private performCircuitTopologyAnalysis() {
    this.updateUIState(UIState.ShowingGuidance);
    this.updateStatusText("Ask me a question!");
    
    // The actual analysis is handled by the Gemini assistant
    // This just updates the UI state
  }

  private onSphereActivated(isActivated: boolean) {
    if (this.isAnalysisActive) {
      if (isActivated) {
        this.marvinAssistant.startAnalysis();
      } else {
        this.marvinAssistant.stopAnalysis();
      }
    }
  }

  private onOverlayCreated(overlay: any) {
    // Log overlay creation for debugging
    print(`AR Overlay created: ${overlay.type} at (${overlay.position.x}, ${overlay.position.y}, ${overlay.position.z})`);
  }

  private onOverlayRemoved(overlayId: string) {
    // Log overlay removal for debugging
    print(`AR Overlay removed: ${overlayId}`);
  }

  // Removed old analysis mode methods - simplified to start/stop only

  private updateUIState(newState: UIState) {
    this.currentUIState = newState;
    
    // Keep the single start/stop button enabled and visible
    if (this.startStopButton) {
      this.startStopButton.enabled = true;
      this.startStopButton.sceneObject.enabled = true;
    }
  }

  // Removed hideButtons and showButtons methods - simplified UI

  // Removed clearAllOverlays method - simplified UI

  private updateStatusText(text: string) {
    this.statusText.text = text;
    
    // Animate text update
    LSTween.textAlphaTo(this.statusText, 0, 200)
      .onComplete(() => {
        this.statusText.text = text;
        LSTween.textAlphaTo(this.statusText, 1, 200).start();
      })
      .start();
  }

  // Public methods for external control
  public getDetectedComponentsCount(): number {
    return this.detectedComponentsCount;
  }

  public isCircuitTopologyComplete(): boolean {
    return this.circuitTopologyComplete;
  }

  public getCurrentUIState(): UIState {
    return this.currentUIState;
  }
}