# Simplified Object Detection Pipeline

## Overview

The object detection to Gemini pipeline has been **dramatically simplified** from a convoluted multi-component architecture to a single, unified component.

## Before (Convoluted) 🔴

The old pipeline had **7 layers** of indirection:

```
SimpleYOLOTest
    ↓
CameraTextureCapture
    ↓
MarvinAssistant.triggerRemoteObjectDetection()
    ↓
RemoteObjectDetectionManager.detectObjects()
    ↓
Events fired back through MarvinAssistant
    ↓
ObjectDetectionTrigger listens to events
    ↓
MarvinAssistant.sendClientMessage()
    ↓
Gemini API
```

**Problems:**
- Too many components to configure
- Event chains difficult to debug
- Hard to understand flow
- Scattered configuration across multiple files
- Tight coupling between components

## After (Simplified) 🟢

The new pipeline is **ONE component**:

```
ObjectDetectionPipeline
    ↓
Camera → YOLO API → Process → Gemini
```

**Benefits:**
- ✅ Single component to configure
- ✅ Clear, linear flow
- ✅ All settings in one place
- ✅ Easy to debug
- ✅ Self-contained logic

## Migration Guide

### Old Way (Don't use)

You needed to set up:
1. `SimpleYOLOTest` - trigger detection
2. `CameraTextureCapture` - get texture
3. `RemoteObjectDetectionManager` - call API
4. `ObjectDetectionTrigger` - listen to events
5. `MarvinAssistant` - manage everything
6. `VideoAnalysisHelper` - periodic analysis

### New Way (Use this!)

You only need:
1. `ObjectDetectionPipeline` - does everything!

### Component Setup

```typescript
// In Lens Studio, add to scene:
ObjectDetectionPipeline
  - marvinAssistant: [MarvinAssistant reference]
  - cameraCapture: [CameraTextureCapture reference]
  - pinholeCapture: [PinholeCapture reference]
  
  // API Config
  - hfApiToken: "your_token"
  - hfSpaceUrl: "https://your-space.hf.space"
  - modelSize: "Medium - Balanced"
  - confidenceThreshold: 0.7
  
  // Detection Settings
  - continuousMode: true
  - detectionInterval: 10  // seconds
  - initialDelay: 5
  
  // Object Rules
  - laptopDetectionEnabled: true
  - laptopPrompt: "I see you're on your laptop!"
```

### MarvinUIBridge Update

The `MarvinUIBridge` now uses `ObjectDetectionPipeline` instead of `VideoAnalysisHelper`:

```typescript
@input
private detectionPipeline: ObjectDetectionPipeline;
```

The pipeline starts automatically when the UI starts.

## Architecture

### ObjectDetectionPipeline

**Single Responsibility:** Detect objects and trigger Gemini

**Methods:**
- `detectAndProcess()` - Main pipeline execution
- `triggerNow()` - Manual trigger for testing
- `resetSession()` - Clear trigger history

**Flow:**
1. **Capture** - Get camera texture via `CameraTextureCapture`
2. **Encode** - Convert texture to base64
3. **Detect** - Send to Hugging Face YOLO API
4. **Parse** - Extract detections from response
5. **Filter** - Apply confidence threshold
6. **Match** - Check against detection rules
7. **Trigger** - Send prompt to Gemini if rule matches

### Detection Rules

Each object type has a rule:
- `objectType` - Object class name (e.g., "laptop", "person")
- `minConfidence` - Minimum confidence to trigger (0.0-1.0)
- `geminiPrompt` - What Gemini should say
- `cooldownSeconds` - Prevent spam
- `triggerOnce` - Only trigger once per session

### Cooldown & Trigger-Once Logic

**Cooldown Mode** (triggerOnce = false):
- Object detected → Trigger Gemini
- Wait `cooldownSeconds` before allowing another trigger
- Can trigger multiple times

**Trigger-Once Mode** (triggerOnce = true):
- Object detected → Trigger Gemini
- Never triggers again until `resetSession()` is called
- Perfect for one-time notifications

## Configuration Examples

### Example 1: Laptop Detection (One-time)

```typescript
laptopDetectionEnabled: true
laptopMinConfidence: 0.7
laptopPrompt: "I see you're on your laptop! Would you like me to pull up your calendar?"
laptopTriggerOnce: true  // Only say this once per session
```

### Example 2: Person Detection (Repeating)

```typescript
personDetectionEnabled: true
personMinConfidence: 0.8
personPrompt: "Hello! I see you there."
personTriggerOnce: false  // Can repeat with cooldown
```

### Example 3: Continuous Detection

```typescript
continuousMode: true
detectionInterval: 10  // Check every 10 seconds
initialDelay: 5        // Wait 5 seconds before first detection
```

## Debugging

The pipeline logs everything clearly:

```
[PIPELINE] 🚀 Object Detection Pipeline Started
[PIPELINE] Continuous mode: ON (every 10s)
[PIPELINE] Active rules:
[PIPELINE]   💻 Laptop (70%)
[PIPELINE]   👤 Person (80%)
[PIPELINE] 🔍 Starting detection...
[PIPELINE] ✅ Found 2 objects
[PIPELINE]   1. laptop (85%) - 1.2m
[PIPELINE]   2. person (92%) - 2.5m
[PIPELINE] ========================================
[PIPELINE] 🎯 TRIGGERING GEMINI
[PIPELINE] Object: laptop
[PIPELINE] Confidence: 85%
[PIPELINE] Distance: 1.2m
[PIPELINE] ========================================
[PIPELINE] ✅ Sent: "I see you're on your laptop!..."
```

## Deprecated Components

These components are **no longer needed**:

- ❌ `SimpleYOLOTest` - Replaced by `ObjectDetectionPipeline`
- ❌ `ObjectDetectionTrigger` - Logic moved into `ObjectDetectionPipeline`
- ❌ `VideoAnalysisHelper` - Not needed (pipeline handles timing)
- ❌ `RemoteObjectDetectionManager` - API logic moved into `ObjectDetectionPipeline`

You can remove them from your scene.

## API Details

### Hugging Face YOLO API

The pipeline calls:
```
POST https://your-space.hf.space/gradio_api/call/get_detection_data
```

**Request:**
```json
{
  "data": [{
    "image": {
      "image": {
        "data": "data:image/png;base64,..."
      }
    },
    "model_size": "Medium - Balanced performance and accuracy",
    "confidence_threshold": 0.7,
    "distance_threshold": 10.0
  }]
}
```

**Response:**
```json
{
  "event_id": "abc123"
}
```

Then fetch results:
```
GET https://your-space.hf.space/gradio_api/call/get_detection_data/abc123
```

Results are streamed as:
```
data: [{"detections": [...]}]
```

## Performance

- **Latency:** ~2-5 seconds per detection
- **API Calls:** 1 per detection interval
- **Bandwidth:** ~50KB per request (compressed image)
- **Recommended Interval:** 10 seconds (balance between responsiveness and API usage)

## Testing

### Manual Trigger

```typescript
// Get reference to pipeline
const pipeline = sceneObject.getComponent("ObjectDetectionPipeline");

// Trigger detection now (ignores interval)
pipeline.triggerNow();

// Reset session (allows trigger-once rules to fire again)
pipeline.resetSession();
```

### Logs

Enable pipeline logs:
```typescript
print("[PIPELINE] ...");  // All logs are prefixed with [PIPELINE]
```

## Troubleshooting

### No objects detected

**Check:**
1. Camera is pointing at objects
2. Confidence threshold isn't too high (try 0.5)
3. HF Space URL is correct
4. API token is set
5. Internet connection is active

### Gemini not triggered

**Check:**
1. Detection rule is enabled
2. Confidence meets minimum threshold
3. Not in cooldown period
4. Not already triggered (if triggerOnce=true)
5. `marvinAssistant` is connected

### API errors

**Check:**
1. HF Space is awake (visit URL in browser)
2. API token has permissions
3. Space URL ends with `.hf.space`
4. Internet connection is stable

## Summary

**Old pipeline:** 7 components, complex event chains, hard to debug

**New pipeline:** 1 component, simple flow, easy to configure

**Migration:** Replace `VideoAnalysisHelper` with `ObjectDetectionPipeline`

**Result:** Cleaner, faster, easier to maintain! 🎉

