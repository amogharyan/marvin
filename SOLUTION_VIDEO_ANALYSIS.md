# Solution: Making Gemini Actively Analyze Video

## The Problem

**Video frames are streaming but Gemini isn't analyzing them** because:
1. Gemini receives video passively
2. Without a prompt/question, it doesn't describe what it sees
3. Object detection relies on Gemini mentioning objects
4. No mentions = no contextual recommendations

## The Solution: 3-Part Fix

### Part 1: Increase Video Quality ✅ SIMPLE

**File:** `Assets/Scripts/MarvinAssistant.ts` (line 95-99)

**Change:**
```typescript
// OLD:
private videoController: VideoController = new VideoController(
  1500,
  CompressionQuality.LowQuality,  // ❌ Too low quality
  EncodingType.Jpg
);

// NEW:
private videoController: VideoController = new VideoController(
  1500,
  CompressionQuality.HighQuality,  // ✅ Better for object detection
  EncodingType.Jpg
);
```

### Part 2: Add Periodic Analysis Method

**File:** `Assets/Scripts/MarvinAssistant.ts`

**Add this new method** (after line 441, before `parseObjectsFromResponse`):

```typescript
/**
 * Send a client message to Gemini to trigger analysis
 */
public sendClientMessage(message: string): void {
  if (!this.GeminiLive) {
    print("[MARVIN] ERROR: Gemini connection not established");
    return;
  }

  print(`[MARVIN] Sending client message: "${message}"`);

  const clientMessage = {
    client_content: {
      turns: [
        {
          role: "user",
          parts: [
            {
              text: message
            }
          ]
        }
      ],
      turn_complete: true
    }
  };

  this.GeminiLive.send(clientMessage);
}
```

### Part 3: Create VideoAnalysisHelper Component ✅ DONE

I've already created `Assets/Scripts/VideoAnalysisHelper.ts`

This component:
- Automatically asks Gemini "What do you see?" every 5 seconds
- Triggers object detection when Gemini responds
- Configurable interval
- Can be enabled/disabled

**How to use in Lens Studio:**
1. Add `VideoAnalysisHelper` component to your scene
2. Connect `marvinAssistant` reference
3. Set `analysisInterval` (default: 5 seconds)
4. Enable `enableAutoAnalysis`
5. Call `startAnalysis()` when Marvin starts

### Part 4: Integrate with MarvinUIBridge

**File:** `Assets/Scripts/MarvinUIBridge.ts`

**Add VideoAnalysisHelper reference** (after line 45):

```typescript
@input
private contextualAssistant: ContextualAssistant;

@input
private videoAnalysisHelper: VideoAnalysisHelper;  // ⬅️ ADD THIS
```

**Start analysis when Marvin starts** (in `startAnalysis()` method, around line 170):

```typescript
private startAnalysis() {
  if (this.isAnalysisActive) {
    this.stopAnalysis();
    return;
  }

  // ... existing code ...

  this.marvinAssistant.createGeminiLiveSession();
  this.marvinAssistant.startAnalysis();

  // Start periodic video analysis
  if (this.videoAnalysisHelper) {
    this.videoAnalysisHelper.startAnalysis();  // ⬅️ ADD THIS
  }

  // ... rest of code ...
}
```

**Stop analysis when Marvin stops** (in `stopAnalysis()` method):

```typescript
private stopAnalysis() {
  this.isAnalysisActive = false;
  this.marvinAssistant.stopAnalysis();

  // Stop periodic video analysis
  if (this.videoAnalysisHelper) {
    this.videoAnalysisHelper.stopAnalysis();  // ⬅️ ADD THIS
  }

  // ... rest of code ...
}
```

## How It Works

### Before (Not Working):
```
1. Video streams → Gemini
2. Gemini receives video (does nothing)
3. No analysis = no object mentions
4. No contextual recommendations
```

### After (Working!):
```
1. Video streams → Gemini
2. VideoAnalysisHelper asks "What do you see?" every 5s
3. Gemini responds: "I see a laptop on the desk..."
4. parseObjectsFromResponse() detects "laptop"
5. componentDetectedEvent fires
6. ContextualAssistant triggers
7. Marvin says: "Ready to start your workday? Here's your schedule..."
```

## Console Output You'll See

```
[VIDEO STREAM] Frame #10 sent - Size: 25432 bytes...
[VIDEO ANALYSIS] Requesting scene description from Gemini...
[MARVIN] Sending client message: "What objects do you see right now?..."
[GEMINI RESPONSE] Received: "I see a laptop on the desk..."
[OBJECT DETECTION] Parsing response: "I see a laptop on the desk..."
[OBJECT DETECTION] Detected: LAPTOP
[CONTEXTUAL] onObjectDetected called - Object: laptop
[CONTEXTUAL] Distance check - Object: 0.30m, Threshold: 0.50m
[CONTEXTUAL] Object within range, triggering recommendation
[CONTEXTUAL] Generated recommendation: Ready to start your workday? Here's your schedule for today...
```

## Quick Test

After implementing all parts:

1. **Start Marvin** (press button)
2. **Point camera at laptop**
3. **Wait 5 seconds** (first analysis interval)
4. **Watch console** - you should see `[VIDEO ANALYSIS] Requesting...`
5. **Marvin should respond** with contextual help about your laptop

## Alternative: Manual Testing

You can manually trigger analysis:

```typescript
// In Lens Studio console or via a button:
videoAnalysisHelper.analyzeNow();
```

## Benefits

✅ **Automatic** - No need to ask questions  
✅ **Periodic** - Continuous awareness of environment  
✅ **Configurable** - Adjust analysis frequency  
✅ **Smart** - Only when video is streaming  
✅ **Efficient** - Not on every frame (would be too expensive)

## Troubleshooting

### "Still no responses"
- Check console for `[MARVIN] Sending client message`
- Verify Gemini API key is valid
- Ensure `haveVideoInput = true` in MarvinAssistant
- Check internet connectivity

### "Too many analyses"
- Increase `analysisInterval` (try 10 seconds)
- Disable `enableAutoAnalysis` temporarily

### "Parse not detecting objects"
- Check `parseObjectsFromResponse()` keywords
- Add more keywords for your specific objects
- Verify Gemini is mentioning objects in responses

## Next Steps

1. ✅ Implement Part 1 (video quality)
2. ✅ Implement Part 2 (sendClientMessage method)
3. ✅ Part 3 already created (VideoAnalysisHelper)
4. Implement Part 4 (integrate with UI)
5. Test end-to-end flow
6. Adjust `analysisInterval` as needed
