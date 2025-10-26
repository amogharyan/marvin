# Silent Gemini Configuration Guide

## Goal
Gemini should **ONLY speak when YOLO detects an object for the first time**. Otherwise, Gemini stays completely silent.

## ✅ What's Been Configured

### 1. MarvinAssistant Instructions (Updated)
```
"You are Marvin, a silent AR assistant. CRITICAL RULES:

1. DO NOT analyze the video feed on your own
2. DO NOT speak unless you receive a DIRECT client message with specific instructions
3. When you receive a client message, respond ONLY to what is asked
4. Be natural and conversational when responding to client messages
5. Keep responses brief (1-2 sentences)

You will ONLY speak when explicitly told what to say via client messages.
Otherwise, remain completely silent and do not comment on anything you see in the video."
```

### 2. VideoAnalysisHelper (Deprecated)
- ⚠️ **enableAutoAnalysis**: MUST be **FALSE**
- This component is now deprecated
- If you have this component in your scene, make sure it's disabled or removed

### 3. ObjectDetectionTrigger (Primary Control)
- **This is the ONLY way Gemini speaks now**
- When YOLO detects an object (e.g., laptop), it sends a prompt to Gemini
- Gemini speaks that prompt naturally
- With `triggerOncePerSession: true`, it only speaks once per object type

## 🎯 How It Works Now

```
User sits with laptop
  ↓
YOLO detects laptop (confidence: 89%)
  ↓
ObjectDetectionTrigger checks:
  - Is laptop rule enabled? ✅
  - Is confidence ≥ 70%? ✅
  - Already triggered this session? ❌
  ↓
Sends to Gemini: "I see you're on your laptop! Would you like me to pull up your calendar for today?"
  ↓
Gemini speaks naturally: "I see you're on your laptop! Would you like me to pull up your calendar for today?"
  ↓
Rule locked for session
  ↓
YOLO detects laptop again (10 seconds later)
  ↓
ObjectDetectionTrigger: "Already triggered this session - staying silent"
  ↓
Gemini: [SILENT]
```

## 🔧 Required Configuration Checklist

### ✅ Step 1: Check MarvinAssistant
- [ ] Instructions are set to the "silent" version (see above)
- [ ] Video input is enabled (for YOLO to capture frames)

### ✅ Step 2: Disable VideoAnalysisHelper
- [ ] If you have this component, set `enableAutoAnalysis: false`
- [ ] Or remove the component entirely

### ✅ Step 3: Configure ObjectDetectionTrigger
- [ ] `laptopDetectionEnabled: true`
- [ ] `laptopTriggerOncePerSession: true` ← **Important!**
- [ ] `laptopMinConfidence: 0.7` (or higher)
- [ ] `laptopPrompt: "I see you're on your laptop! Would you like me to pull up your calendar for today?"`

### ✅ Step 4: Configure SimpleYOLOTest
- [ ] `enableContinuous: true` (to keep detecting)
- [ ] `continuousInterval: 10` (seconds between detections)

## 🔇 Ensuring Complete Silence

### Gemini Will ONLY Speak When:
1. ✅ YOLO detects a configured object (laptop, person, phone, custom)
2. ✅ Confidence meets the threshold (≥ 70% by default)
3. ✅ It's the first time detecting that object type (if triggerOncePerSession: true)
4. ✅ ObjectDetectionTrigger sends the prompt

### Gemini Will NEVER:
- ❌ Analyze video on its own
- ❌ Comment on objects it sees
- ❌ Speak without being explicitly triggered
- ❌ Repeat the same message (if triggerOncePerSession: true)

## 🧪 Testing the Silent Mode

### Test 1: No Objects
```
Expected: Gemini stays completely silent
Actual: [Should be silent]
```

### Test 2: Laptop Detected (First Time)
```
Expected: Gemini asks about calendar
Actual: "I see you're on your laptop! Would you like me to pull up your calendar for today?"
```

### Test 3: Laptop Detected (Second Time, Same Session)
```
Expected: Gemini stays silent
Actual: [Should be silent]
Logs: "laptop detected but already triggered this session"
```

### Test 4: Different Object (Not Configured)
```
Expected: Gemini stays silent (cup, phone not enabled by default)
Actual: [Should be silent]
```

## 📋 Default Object Detection Rules

### Enabled by Default:
- **Laptop** (trigger once per session)
  - Confidence: ≥70%
  - Prompt: "I see you're on your laptop! Would you like me to pull up your calendar for today?"

### Disabled by Default:
- **Person** (can enable for greeting)
- **Phone** (can enable for focus reminders)
- **Custom Object** (fully customizable)

## 🎨 Customizing Responses

To change what Gemini says when it detects a laptop:

1. Open **ObjectDetectionTrigger** component
2. Find **Laptop Detection Rule**
3. Edit **laptopPrompt**:

```
Examples:
- "Ready to work? Let me pull up your schedule."
- "Good to see you! Want to review today's tasks?"
- "Laptop detected. Time to be productive!"
- "I see you're working. Need your calendar?"
```

## ⚙️ Advanced: Multiple Detection Types

You can enable multiple object types:

```
Laptop (trigger once) → "Calendar time!"
Person (trigger once) → "Welcome! How can I help?"
Cup (repeating) → "Stay hydrated!" (every 30 mins)
Phone (repeating) → "Focus on your work!" (every time detected)
```

**Setup:**
1. Enable the rule (e.g., `personDetectionEnabled: true`)
2. Set trigger mode (`personTriggerOncePerSession: true/false`)
3. Set confidence (`personMinConfidence: 0.8`)
4. Write prompt (`personPrompt: "Welcome! How can I help?"`)
5. Set cooldown if repeating (`personCooldown: 60`)

## 🐛 Troubleshooting

### Problem: Gemini speaks when I don't expect it
**Check:**
- [ ] Is `VideoAnalysisHelper.enableAutoAnalysis` set to `false`?
- [ ] Are there any other scripts sending messages to Gemini?
- [ ] Check console logs for `[DETECTION TRIGGER]` messages

### Problem: Gemini doesn't speak at all
**Check:**
- [ ] Is Gemini session active? (call `createGeminiLiveSession()`)
- [ ] Is ObjectDetectionTrigger linked to MarvinAssistant?
- [ ] Is laptop detection enabled? (`laptopDetectionEnabled: true`)
- [ ] Is YOLO detecting the laptop? (check console for detection logs)
- [ ] Is confidence high enough? (lower threshold if needed)

### Problem: Gemini speaks multiple times for same object
**Check:**
- [ ] Is `laptopTriggerOncePerSession` set to `true`?
- [ ] Check console for "already triggered this session" messages
- [ ] If you want it to repeat, set `triggerOncePerSession: false`

## 📝 Console Log Guide

### When Working Correctly:
```
[DETECTION] 1. LAPTOP - 89% - 1.5m
[DETECTION TRIGGER] 🎯 RULE MATCHED!
[DETECTION TRIGGER] Mode: TRIGGER ONCE (won't repeat this session)
[DETECTION TRIGGER] 🔒 Locked: laptop won't trigger again this session
[DETECTION TRIGGER] ✅ Sent to Gemini

[10 seconds later...]

[DETECTION] 1. LAPTOP - 91% - 1.4m
[DETECTION TRIGGER] 🔇 laptop detected but already triggered this session
```

### When Silent (Expected):
```
[DETECTION] 1. CHAIR - 85% - 2.1m
[DETECTION] 2. CUP - 72% - 1.8m
[No trigger messages - these objects aren't enabled]
```

## 🎯 Summary

**The New System:**
1. 🔇 Gemini is silent by default
2. 👁️ YOLO continuously detects objects
3. 🎯 ObjectDetectionTrigger checks detection rules
4. 💬 Gemini speaks ONLY when rules match
5. 🔒 With trigger-once mode, speaks only first time
6. 🔁 Restart Lens Studio to reset session

**Result:** Gemini only speaks meaningful, context-aware messages based on what YOLO actually detects, and doesn't repeat itself!

Happy detecting! 🚀
