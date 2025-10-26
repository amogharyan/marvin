import { ContextualAssistant } from "./ContextualAssistant";
import { PinchButton } from "SpectaclesInteractionKit.lspkg/Components/UI/PinchButton/PinchButton";

// Manual trigger for testing contextual awareness
@component
export class ManualContextTrigger extends BaseScriptComponent {
  @ui.separator
  @ui.label("Manual Contextual Trigger - For Testing")
  @ui.separator
  
  @input
  private contextualAssistant: ContextualAssistant;
  
  @input
  private laptopButton: PinchButton;
  
  @input
  private medicineButton: PinchButton;
  
  @input
  private keysButton: PinchButton;
  
  @input
  private breakfastButton: PinchButton;
  
  @input
  private phoneButton: PinchButton;
  
  onAwake() {
    this.createEvent("OnStartEvent").bind(this.onStart.bind(this));
  }
  
  private onStart() {
    print("[MANUAL TRIGGER] Manual context trigger initialized");
    
    if (this.laptopButton) {
      this.laptopButton.onButtonPinched.add(() => {
        print("[MANUAL TRIGGER] Laptop button pressed");
        this.triggerLaptop();
      });
    }
    
    if (this.medicineButton) {
      this.medicineButton.onButtonPinched.add(() => {
        print("[MANUAL TRIGGER] Medicine button pressed");
        this.triggerMedicine();
      });
    }
    
    if (this.keysButton) {
      this.keysButton.onButtonPinched.add(() => {
        print("[MANUAL TRIGGER] Keys button pressed");
        this.triggerKeys();
      });
    }
    
    if (this.breakfastButton) {
      this.breakfastButton.onButtonPinched.add(() => {
        print("[MANUAL TRIGGER] Breakfast button pressed");
        this.triggerBreakfast();
      });
    }
    
    if (this.phoneButton) {
      this.phoneButton.onButtonPinched.add(() => {
        print("[MANUAL TRIGGER] Phone button pressed");
        this.triggerPhone();
      });
    }
  }
  
  private triggerLaptop() {
    if (this.contextualAssistant) {
      const fakePosition = new vec3(0, 0, 0.3); // 30cm in front
      this.contextualAssistant.onObjectDetected("laptop", fakePosition, 0.95);
    }
  }
  
  private triggerMedicine() {
    if (this.contextualAssistant) {
      const fakePosition = new vec3(0, 0, 0.3);
      this.contextualAssistant.onObjectDetected("medicine", fakePosition, 0.95);
    }
  }
  
  private triggerKeys() {
    if (this.contextualAssistant) {
      const fakePosition = new vec3(0, 0, 0.3);
      this.contextualAssistant.onObjectDetected("keys", fakePosition, 0.95);
    }
  }
  
  private triggerBreakfast() {
    if (this.contextualAssistant) {
      const fakePosition = new vec3(0, 0, 0.3);
      this.contextualAssistant.onObjectDetected("bowl", fakePosition, 0.95);
    }
  }
  
  private triggerPhone() {
    if (this.contextualAssistant) {
      const fakePosition = new vec3(0, 0, 0.3);
      this.contextualAssistant.onObjectDetected("phone", fakePosition, 0.95);
    }
  }
}
