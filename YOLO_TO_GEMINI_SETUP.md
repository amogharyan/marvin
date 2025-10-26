# YOLO Detection → Gemini AI Integration Guide

This guide shows you how to trigger Gemini AI responses based on YOLO object detection.

## Overview

When YOLO detects specific objects (like a laptop) with high confidence, it automatically triggers Gemini to respond with contextual messages (like asking to pull up a calendar).

## Architecture

```
Camera → YOLO Detection → Object Detection Trigger → Gemini AI → Voice Response
         (finds laptop)    (checks rules)              (responds)
```

## Setup (5 minutes)

### Step 1: Add Required Components

Create these SceneObjects in your scene:

1. **CameraCapture**
   - Add: `CameraTextureCapture` script

2. **YOLOTest**
   - Add: `SimpleYOLOTest` script
   - Link inputs:
     - `marvinAssistant`: Your MarvinAssistant component
     - `cameraCapture`: The CameraCapture object
     - `autoTrigger`: ✅ Checked
     - `enableContinuous`: ✅ Checked (for ongoing detection)
     - `continuousInterval`: 10 seconds

3. **DetectionTrigger** (NEW!)
   - Add: `ObjectDetectionTrigger` script
   - Link inputs:
     - `marvinAssistant`: Your MarvinAssistant component
     - `detectionManager`: Your RemoteObjectDetectionManager component

### Step 2: Configure Detection Rules

In the **ObjectDetectionTrigger** component, you'll see these rule groups:

#### 📓 Laptop Detection Rule (Default: Enabled)

```
✅ laptopDetectionEnabled: true
📊 laptopMinConfidence: 0.7 (70%)
💬 laptopPrompt: "I see you're on your laptop! Would you like me to pull up your calendar for today?"
⏱️ laptopCooldown: 30 seconds
```

**This means:** When a laptop is detected with ≥70% confidence, Gemini will ask about the calendar. Won't trigger again for 30 seconds.

#### 👤 Person Detection Rule (Default: Disabled)

```
❌ personDetectionEnabled: false
📊 personMinConfidence: 0.8 (80%)
💬 personPrompt: "Hello! I see you there. How can I assist you today?"
⏱️ personCooldown: 60 seconds
```

**Enable this** to greet people when they appear.

#### 📱 Phone Detection Rule (Default: Disabled)

```
❌ phoneDetectionEnabled: false
📊 phoneMinConfidence: 0.7 (70%)
💬 phonePrompt: "I notice you have your phone. Would you like me to help you stay focused on your work?"
⏱️ phoneCooldown: 45 seconds
```

**Enable this** to help users stay focused.

#### 🔍 Custom Object Rule (Default: Disabled)

```
❌ customObjectEnabled: false
🎯 customObjectType: "cup"
📊 customObjectMinConfidence: 0.7 (70%)
💬 customObjectPrompt: "I see a cup nearby. Staying hydrated is important!"
⏱️ customObjectCooldown: 60 seconds
```

**Customize this** for any of the 80 YOLO objects!

### Step 3: Configure Your Prompts

Edit the prompts to match your use case:

**Work-focused Assistant:**
```
Laptop → "I see you're working. Would you like me to pull up your calendar?"
Phone → "Your phone might be distracting. Want me to set a focus timer?"
Cup → "Time for a coffee break? You've been working for a while!"
```

**Health-focused Assistant:**
```
Chair → "You've been sitting for a while. Time to stand and stretch?"
Food → "Great choice! Eating healthy keeps you energized."
```

**Home Assistant:**
```
Person → "Welcome home! Can I help you with anything?"
TV → "Relaxing with some TV? Let me know if you need recommendations."
```

## How It Works

### Detection Flow

1. **YOLO detects objects** every X seconds (set by `continuousInterval`)
2. **Confidence check**: Is confidence ≥ `minConfidence`?
3. **Cooldown check**: Has enough time passed since last trigger?
4. **Rule match**: Does object type match an enabled rule?
5. **Trigger Gemini**: Send the configured prompt to Gemini
6. **Gemini responds**: Speaks the response back to user

### Example Scenario

```
User sits down with laptop
  ↓
[5 seconds] YOLO runs detection
  ↓
YOLO: "laptop" detected (confidence: 0.89 = 89%)
  ↓
ObjectDetectionTrigger checks:
  - Is laptopDetectionEnabled? ✅ Yes
  - Is 0.89 ≥ 0.7? ✅ Yes
  - In cooldown? ❌ No (hasn't triggered yet)
  ↓
Sends to Gemini: "I see you're on your laptop! Would you like me to pull up your calendar for today?"
  ↓
Gemini speaks: "I see you're on your laptop! Would you like me to pull up your calendar for today?"
  ↓
[30 second cooldown starts]
  ↓
[15 seconds] YOLO detects laptop again
  ↓
ObjectDetectionTrigger checks:
  - In cooldown? ✅ Yes (15s < 30s)
  - Skips triggering
```

## Configuration Tips

### Confidence Thresholds

- **0.5-0.6 (50-60%)**: Permissive, more triggers but some false positives
- **0.7-0.8 (70-80%)**: Balanced, recommended for most use cases
- **0.9+ (90%+)**: Strict, very confident detections only

### Cooldown Times

- **Short (10-30s)**: Good for active monitoring, might feel spammy
- **Medium (30-60s)**: Balanced, recommended for most use cases
- **Long (60-120s)**: Infrequent updates, good for passive monitoring

### Continuous Detection Interval

Set in `SimpleYOLOTest.continuousInterval`:
- **5-10 seconds**: Active monitoring (costs more API calls)
- **10-20 seconds**: Balanced
- **30-60 seconds**: Passive monitoring

## Available Objects (80 total)

### 👥 People & Animals
person, bird, cat, dog, horse, sheep, cow, elephant, bear, zebra, giraffe

### 💻 Electronics
laptop, cell phone, tv, keyboard, mouse, remote

### 🪑 Furniture
chair, couch, bed, dining table, toilet

### 🍎 Food & Drink
cup, bottle, wine glass, bowl, banana, apple, sandwich, orange, pizza, donut, cake

### 🚗 Vehicles
bicycle, car, motorcycle, bus, train, truck, boat, airplane

### 🏀 Sports
frisbee, sports ball, baseball bat, skateboard, surfboard, tennis racket

### 🏠 Home Items
book, clock, vase, scissors, potted plant, backpack, umbrella, handbag

...and 40+ more!

## Advanced Customization

### Multiple Custom Rules

You can add multiple custom rules by editing the code:

```typescript
// In ObjectDetectionTrigger.ts, add more custom rules:
if (this.customObject2Enabled) {
  rules.push({
    objectType: "book",
    minConfidence: 0.75,
    geminiPrompt: "I see you're reading! Would you like me to save this page?",
    enabled: true,
    cooldownSeconds: 45,
  });
}
```

### Context-Aware Prompts

Make prompts context-aware:

```typescript
const timeOfDay = new Date().getHours();
let laptopPrompt = "";

if (timeOfDay < 12) {
  laptopPrompt = "Good morning! Ready to tackle your tasks? Let me pull up your calendar.";
} else if (timeOfDay < 17) {
  laptopPrompt = "Afternoon productivity time! Want to see what's on your schedule?";
} else {
  laptopPrompt = "Working late? Let me check your remaining tasks for today.";
}
```

### Distance-Based Rules

Trigger different prompts based on distance:

```typescript
if (detection.distance < 1.0) {
  // Object very close
  geminiPrompt = "You're right next to your laptop. Time to dive in!";
} else if (detection.distance < 2.0) {
  // Object at normal distance
  geminiPrompt = "I see your laptop nearby. Ready to work?";
} else {
  // Object far away
  geminiPrompt = "Your laptop is over there. Moving closer to start working?";
}
```

## Troubleshooting

### Gemini Not Responding

**Check:**
1. Is Gemini session active? (MarvinAssistant.createGeminiLiveSession() called?)
2. Is the rule enabled? (check `laptopDetectionEnabled`)
3. Is confidence high enough? (check detection confidence vs `minConfidence`)
4. Is it in cooldown? (check console for "in cooldown" messages)

**Fix:**
- Call `marvinAssistant.createGeminiLiveSession()` on start
- Enable the rule you want
- Lower the `minConfidence` threshold
- Wait for cooldown or call `resetCooldowns()`

### Too Many Triggers

**Check:**
- Cooldown too short?
- Confidence threshold too low?
- Continuous interval too short?

**Fix:**
- Increase cooldown times (e.g., 60-120 seconds)
- Increase confidence threshold (e.g., 0.8-0.9)
- Increase continuous interval (e.g., 20-30 seconds)

### Not Detecting Objects

**Check:**
- Is YOLO detection working? (check console for detection logs)
- Is object in YOLO's 80 categories?
- Is confidence too low?

**Fix:**
- Test YOLO independently first
- Check [available objects list](#available-objects-80-total)
- Lower `confidenceThreshold` in RemoteObjectDetectionManager

## Example Use Cases

### 1. Productivity Assistant
```
laptop (0.7) → "Calendar time! Let's plan your day."
phone (0.7) → "Phone detected. Stay focused on your work!"
cup (0.6) → "Hydration break! Good job staying healthy."
```

### 2. Smart Home Greeter
```
person (0.8) → "Welcome home! How can I help?"
couch (0.7) → "Relaxing? Want me to dim the lights?"
tv (0.7) → "Movie time? I can suggest something!"
```

### 3. Fitness Coach
```
person (0.9) → "Ready for your workout?"
bottle (0.7) → "Don't forget to hydrate during exercise!"
chair (0.8) → "You've been sitting. Time for movement!"
```

### 4. Kitchen Assistant
```
apple (0.7) → "Healthy snack choice!"
pizza (0.7) → "Pizza time! Enjoy your meal."
cup (0.6) → "Making coffee? The perfect pick-me-up!"
```

## API Costs

- **YOLO Detection**: ~1-3 seconds per detection (Hugging Face API)
- **Gemini Response**: Included in existing Gemini Live session
- **Recommendation**: Use 10-30 second intervals to balance responsiveness and cost

## Next Steps

1. ✅ Set up the components
2. ✅ Configure your first rule (laptop detection)
3. ✅ Test with `autoTrigger: true`
4. ✅ Enable continuous mode
5. ✅ Add more custom rules
6. ✅ Fine-tune confidence and cooldowns
7. ✅ Customize prompts for your use case

Happy detecting! 🎯
