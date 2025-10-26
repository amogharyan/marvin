# Marvin Contextual Awareness System

## Overview

Marvin now features **proactive contextual awareness** - automatically providing helpful recommendations when you look at or interact with objects, without waiting for you to ask.

## How It Works

### Automatic Object Detection
When Marvin's analysis is active, it continuously monitors the camera feed for objects. When an object is detected within proximity (default: 50cm), Marvin automatically provides contextual recommendations.

### Object-Specific Intelligence

Based on the PRD, Marvin recognizes 5 key object types and provides tailored assistance:

#### 1. **Medicine Bottle** 🏥
- **Priority:** High
- **Triggers:** Medication reminders, health tracking
- **Example:** "Time for your medication! Take 2 pills with food. You've been consistent this week!"

#### 2. **Breakfast Bowl** 🥣
- **Priority:** Medium  
- **Triggers:** Nutrition analysis, recipe suggestions
- **Example:** "I see you're having breakfast! Would you like to know the nutritional content?"

#### 3. **Laptop** 💻
- **Priority:** Medium
- **Triggers:** Calendar briefing, meeting prep, work overview
- **Example:** "Ready to start your workday? Here's your schedule for today - you have 3 meetings coming up."

#### 4. **Keys** 🔑
- **Priority:** High
- **Triggers:** Departure checklist, location memory
- **Example:** "Getting ready to leave? Don't forget your phone and wallet. Traffic looks light on your usual route."

#### 5. **Phone** 📱
- **Priority:** Medium
- **Triggers:** Connectivity check, notifications
- **Example:** "You have 5 unread messages. Battery at 85% - good for the day."

## Key Features

### Proximity Detection
- **Detection Range:** 50cm (configurable)
- **Confidence Threshold:** 70% (configurable)
- Uses spatial tracking to determine when objects are "nearby"

### Cooldown System
- **Default Cooldown:** 30 seconds between recommendations for the same object
- Prevents notification spam
- Can be reset for demo purposes

### Priority System
- **High Priority:** Medicine, Keys - Shows prominently with "Important!" label
- **Medium/Low Priority:** Other objects - Standard notification
- High priority items auto-dismiss after 5 seconds

### Proactive Mode
- **Default:** Enabled
- Can be toggled on/off at runtime
- When enabled, Marvin speaks recommendations automatically
- When disabled, works in reactive mode (waits for questions)

## Architecture

### Components

#### ContextualAssistant.ts
- Core contextual awareness engine
- Manages object detection and proximity tracking
- Generates contextual recommendations
- Handles cooldown and priority logic

#### MarvinAssistant.ts
- Updated system prompt for proactive assistance
- Processes visual context
- Generates natural language responses

#### MarvinUIBridge.ts
- Connects contextual assistant to UI
- Displays recommendations
- Manages high-priority notifications

## Configuration

### In Lens Studio

1. **Add ContextualAssistant Component** to your scene
2. **Configure Settings:**
   - `proximityDistance`: How close objects need to be (meters)
   - `cooldownPeriod`: Time between recommendations (milliseconds)
   - `minConfidence`: Minimum detection confidence (0-1)
   - `enableProactiveMode`: Toggle automatic recommendations

3. **Connect to MarvinUIBridge:**
   - Link ContextualAssistant to the bridge component
   - Ensure MarvinAssistant is also connected

### Object Context Mapping

Objects are classified based on detection names:
```typescript
- "bowl", "food", "breakfast" → BreakfastBowl
- "laptop", "computer" → Laptop  
- "key" → Keys
- "medicine", "pill", "bottle" → MedicineBottle
- "phone" → Phone
```

## Usage Examples

### Scenario 1: Morning Medicine
```
User looks at medicine bottle → 
Marvin (automatically): "Time for your medication! Take 2 pills with food."
```

### Scenario 2: Starting Work
```
User sits at laptop →
Marvin (automatically): "Ready to start your workday? Here's your schedule - 
you have 3 meetings today."
```

### Scenario 3: Leaving Home
```
User picks up keys →
Marvin (automatically): "Getting ready to leave? Don't forget your phone 
and wallet!"
```

## Integration with PRD

This implementation follows the PRD requirements:

- ✅ **FR-008:** Gemini API for contextual responses
- ✅ **FR-010:** Contextual responses based on object interaction
- ✅ **FR-013:** Intelligent suggestions based on patterns
- ✅ **FR-022-026:** Object-specific intelligence
- ✅ **FR-027:** Time-of-day adaptation (ready for expansion)

## API Reference

### ContextualAssistant

**Public Methods:**
```typescript
onObjectDetected(objectName: string, position: vec3, confidence: number)
// Manually trigger object detection (usually called by system)

triggerManualRecommendation(objectType: ObjectType)
// Force a recommendation for testing

resetCooldowns()
// Clear all cooldown timers

setProactiveMode(enabled: boolean)
// Enable/disable automatic recommendations
```

**Events:**
```typescript
contextualRecommendationEvent: Event<ContextualRecommendation>
// Fired when a contextual recommendation is generated
```

## Future Enhancements

### Planned Features
- [ ] Learning from user responses (accept/ignore)
- [ ] Time-of-day contextual variations
- [ ] Calendar integration for meeting-aware recommendations
- [ ] Health tracking integration
- [ ] Spatial memory of object locations
- [ ] Multi-object context awareness

### Demo Improvements
- [ ] Pre-configured demo mode with scripted recommendations
- [ ] Visual AR indicators for detected objects
- [ ] Voice output for all recommendations
- [ ] Gesture-based acknowledgment

## Troubleshooting

### Recommendations Not Appearing
1. Check `enableProactiveMode` is true
2. Verify object is within `proximityDistance`
3. Check detection confidence meets `minConfidence`
4. Ensure cooldown period has elapsed

### Too Many Notifications
1. Increase `cooldownPeriod`
2. Increase `proximityDistance` (objects must be closer)
3. Increase `minConfidence` (more selective)

### Wrong Object Classification
1. Check object detection naming
2. Verify classification logic in `classifyObject()`
3. Train or adjust ML model if using custom detection

## Credits

Built for the Marvin AR Morning Assistant project as part of the contextual awareness feature set defined in the PRD.
