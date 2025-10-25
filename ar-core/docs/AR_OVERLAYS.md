# AR Overlays Guide

## Overview

The AR overlay system provides contextual visual information overlaid on physical objects in the user's environment. It handles rendering, positioning, styling, and lifecycle management of AR UI elements.

**Functional Requirements Implemented:**
- FR-043: Clear visual hierarchy
- FR-044: Consistent design language
- FR-045: Visual feedback for gestures
- FR-046: Non-obstructive overlay positioning
- FR-047: Multiple overlay types support
- FR-048: Adaptive brightness
- FR-049: Accessibility features
- FR-005: <100ms rendering latency

## Architecture

### Components

```
AROverlays/
└── OverlayManager.ts      # Main overlay coordinator
```

### Overlay Lifecycle

```
Create Overlay
    ↓
Apply Styling
    ↓
Position in 3D Space
    ↓
Render (< 100ms)
    ↓
Update Loop (60fps)
    ├── Billboard Rotation
    ├── Adaptive Brightness
    └── Position Updates
    ↓
Remove Overlay (manual or TTL)
```

## Overlay Types

### Text Overlay

Simple text display for labels and notifications.

**Use Cases:**
- Object labels
- Quick information
- Status messages

**Example:**
```typescript
overlayManager.createOverlay({
  id: 'text_001',
  type: 'text',
  position: new vec3(0, 0.2, 0.5),
  content: 'Medicine Bottle',
  style: {
    primaryColor: [1, 0.4, 0.4, 1],
    backgroundColor: [0.02, 0.03, 0.07, 0.8],
    fontSize: 24,
    animation: 'fade',
  },
  billboard: true,
  visible: true,
  opacity: 1.0,
});
```

### Panel Overlay

Structured information container with background.

**Use Cases:**
- Detailed information cards
- Multi-line content
- Rich data display

**Example:**
```typescript
overlayManager.createOverlay({
  id: 'panel_001',
  type: 'panel',
  position: new vec3(0, 0.3, 0.5),
  content: {
    title: 'Medication Schedule',
    subtitle: 'Take 2 pills at 8:00 AM',
    icon: 'health',
  },
  style: medicineOverlayStyle,
  billboard: true,
  visible: true,
  opacity: 1.0,
});
```

### Notification Overlay

Temporary notification with auto-removal.

**Use Cases:**
- User feedback
- Gesture confirmations
- Temporary alerts

**Example:**
```typescript
overlayManager.createOverlay({
  id: 'notif_001',
  type: 'notification',
  position: handPosition,
  content: 'Touch detected',
  style: feedbackStyle,
  billboard: true,
  visible: true,
  opacity: 1.0,
  ttl: 2000, // Auto-remove after 2 seconds
});
```

### Icon Overlay

Visual icon marker.

**Use Cases:**
- Object markers
- Interactive buttons
- Visual indicators

**Example:**
```typescript
overlayManager.createOverlay({
  id: 'icon_001',
  type: 'icon',
  position: objectPosition,
  content: '',
  style: {
    ...baseStyle,
    icon: 'calendar',
  },
  billboard: true,
  visible: true,
  opacity: 1.0,
});
```

### Progress Overlay

Progress bar or loading indicator.

**Use Cases:**
- AI processing feedback
- Loading states
- Task completion

**Example:**
```typescript
overlayManager.createOverlay({
  id: 'progress_001',
  type: 'progress',
  position: new vec3(0, 0.2, 0.5),
  content: {
    title: 'Analyzing nutrition...',
    progress: 0.65, // 65%
  },
  style: nutritionStyle,
  billboard: true,
  visible: true,
  opacity: 1.0,
});
```

### Arrow Overlay

Directional arrow for navigation.

**Use Cases:**
- "Find my keys" guidance
- Navigation arrows
- Directional indicators

**Example:**
```typescript
overlayManager.createOverlay({
  id: 'arrow_001',
  type: 'arrow',
  position: currentPosition,
  rotation: calculateRotationToTarget(targetPosition),
  content: '',
  style: departureSStyle,
  billboard: false, // Arrow has specific direction
  visible: true,
  opacity: 1.0,
});
```

## Usage

### Initialize Overlay Manager

```typescript
import { OverlayManager } from './AROverlays/OverlayManager';

const overlayManager = new OverlayManager({
  parentScene: sceneRoot,
  maxOverlays: 20,
  adaptiveBrightness: true,
  defaultBillboard: true,
  defaultDistance: 0.5,
  debugMode: false,
});
```

### Create Overlays

```typescript
// Simple text overlay
const overlayId = overlayManager.createOverlay({
  id: 'my_overlay',
  type: 'text',
  position: new vec3(0, 0, 0.5),
  content: 'Hello AR',
  style: defaultStyle,
  billboard: true,
  visible: true,
  opacity: 1.0,
});

// With rich content
overlayManager.createOverlay({
  id: 'info_panel',
  type: 'panel',
  position: objectPosition,
  content: {
    title: 'Daily Schedule',
    subtitle: '3 meetings today',
    data: { meetingCount: 3 },
  },
  style: calendarStyle,
  billboard: true,
  visible: true,
  opacity: 1.0,
  attachedTo: laptopObject.id,
});
```

### Update Overlays

```typescript
// Update properties
overlayManager.updateOverlay('my_overlay', {
  content: 'Updated text',
  opacity: 0.8,
  visible: false,
});

// Update position (for moving objects)
overlayManager.attachToPosition('my_overlay', newPosition);
```

### Remove Overlays

```typescript
// Remove specific overlay
overlayManager.removeOverlay('my_overlay');

// Remove all overlays
overlayManager.removeAllOverlays();

// Auto-removal with TTL
overlayManager.createOverlay({
  // ... other props
  ttl: 3000, // Auto-remove after 3 seconds
});
```

### Query Overlays

```typescript
// Get overlay by ID
const overlay = overlayManager.getOverlay('my_overlay');

// Get all overlays
const allOverlays = overlayManager.getAllOverlays();

// Get overlay count
const count = overlayManager.getOverlayCount();

// Check if overlay exists
const exists = overlayManager.hasOverlay('my_overlay');
```

## Styling System

### Design System Colors

Based on PRD Section 6 Design Considerations:

```typescript
const COLORS = {
  primary: [0.53, 0.91, 0.72, 1.0],     // #6ee7b7 - Primary accent
  health: [1.0, 0.4, 0.4, 1.0],         // Health red
  nutrition: [0.55, 0.8, 0.4, 1.0],     // Nutrition green
  work: [0.33, 0.71, 0.83, 1.0],        // Work blue
  departure: [1.0, 0.8, 0.2, 1.0],      // Departure yellow
  tech: [0.55, 0.36, 0.96, 1.0],        // Tech purple
  background: [0.02, 0.03, 0.07, 0.8],  // Dark glass
};
```

### Creating Overlay Styles

```typescript
import { OverlayStyle } from './types/core';

const medicineStyle: OverlayStyle = {
  primaryColor: [1.0, 0.4, 0.4, 1.0],           // Health red
  backgroundColor: [0.02, 0.03, 0.07, 0.8],     // Dark glass
  fontSize: 24,
  icon: 'health',
  animation: 'fade',
  animationDuration: 300,
};

const nutritionStyle: OverlayStyle = {
  primaryColor: [0.55, 0.8, 0.4, 1.0],          // Nutrition green
  backgroundColor: [0.02, 0.03, 0.07, 0.8],
  fontSize: 28,
  icon: 'food',
  animation: 'pulse',
  animationDuration: 500,
};
```

### Animation Types

```typescript
type AnimationType = 'fade' | 'slide' | 'pulse' | 'none';

// Fade in/out
{ animation: 'fade', animationDuration: 300 }

// Slide from direction
{ animation: 'slide', animationDuration: 400 }

// Pulse effect
{ animation: 'pulse', animationDuration: 500 }

// No animation
{ animation: 'none' }
```

## Adaptive Brightness

### How It Works

The overlay system automatically adjusts opacity based on environmental lighting (FR-048).

**Environmental Brightness → Overlay Opacity:**
- Dark environment (0.0): 70% opacity
- Normal environment (0.5): 85% opacity
- Bright environment (1.0): 100% opacity

### Usage

```typescript
// Automatic (recommended)
const overlayManager = new OverlayManager({
  adaptiveBrightness: true, // Enabled by default
  // ... other config
});

// Manual update
overlayManager.updateEnvironmentalBrightness(0.8); // 80% brightness
```

### Calibration

```typescript
// Get lighting from SceneUnderstanding
const lighting = sceneUnderstanding.getLighting();

// Normalize brightness (0-1)
const normalizedBrightness = Math.min(1.0, lighting.brightness / 1000);

// Update overlay manager
overlayManager.updateEnvironmentalBrightness(normalizedBrightness);
```

## Billboard Effect

### Purpose

Billboard effect makes overlays always face the camera, improving readability.

**When to Use:**
- ✅ Text overlays
- ✅ Information panels
- ✅ Notifications
- ❌ Directional arrows
- ❌ Object-attached indicators (sometimes)

### Usage

```typescript
// Enable billboard (default)
overlayManager.createOverlay({
  // ... other props
  billboard: true, // Overlay faces camera
});

// Disable billboard (for directional elements)
overlayManager.createOverlay({
  // ... other props
  billboard: false,
  rotation: specificRotation, // Manual rotation control
});
```

### Update Loop

Billboard rotations update automatically in the main update loop:

```typescript
// In MarvinARSystem update():
overlayManager.updateCameraPosition(cameraPosition);
overlayManager.updateBillboards(); // Called every frame
```

## Positioning

### Coordinate System

Lens Studio uses a right-handed coordinate system:
- **X**: Left (-) to Right (+)
- **Y**: Down (-) to Up (+)
- **Z**: Away (-) to Toward (+)

### Positioning Strategies

**Above Object:**
```typescript
const position = new vec3(
  objectPosition.x,
  objectPosition.y + 0.2, // 20cm above
  objectPosition.z
);
```

**In Front of Camera:**
```typescript
const position = new vec3(
  0,                    // Center horizontally
  0,                    // Center vertically
  cameraPosition.z + 0.5 // 50cm in front
);
```

**Attached to Object:**
```typescript
overlayManager.createOverlay({
  // ... other props
  position: objectPosition,
  attachedTo: object.id, // Follows object
});

// Auto-update in object update handler:
overlayManager.attachToPosition(overlayId, newObjectPosition);
```

### Distance Guidelines

- **Minimum:** 0.3m (too close is hard to focus)
- **Optimal:** 0.5-1.0m (comfortable viewing)
- **Maximum:** 2.0m (legibility limit)

## Performance

### Metrics

```typescript
// Get performance metrics
const metrics = overlayManager.getPerformanceMetrics();

console.log('Render Latency:', metrics.renderLatency, 'ms');
console.log('Active Overlays:', metrics.activeOverlayCount);

// Get average render latency
const avgLatency = overlayManager.getAverageRenderLatency();
```

### Optimization Tips

**1. Limit Active Overlays:**
```typescript
const overlayManager = new OverlayManager({
  maxOverlays: 15, // Reduce from default 20
  // ...
});
```

**2. Use TTL for Temporary Overlays:**
```typescript
overlayManager.createOverlay({
  // ... other props
  ttl: 3000, // Auto-cleanup after 3 seconds
});
```

**3. Batch Updates:**
```typescript
// Instead of:
for (const object of objects) {
  overlayManager.updateOverlay(object.id, { position: object.position });
}

// Do:
// Update all at once in update loop
```

**4. Minimize Billboard Updates:**
```typescript
// Only update when camera moves significantly
if (cameraMovedSignificantly) {
  overlayManager.updateBillboards();
}
```

## Accessibility Features

### High Contrast Mode

```typescript
// Increase contrast for better visibility
const highContrastStyle: OverlayStyle = {
  primaryColor: [1.0, 1.0, 1.0, 1.0],          // White text
  backgroundColor: [0.0, 0.0, 0.0, 0.9],       // Opaque black
  fontSize: 32,                                 // Larger text
  animation: 'none',                            // No distractions
};
```

### Large Text Mode

```typescript
const largeTextStyle: OverlayStyle = {
  ...baseStyle,
  fontSize: 36, // 50% larger than default
};
```

### Simplified Overlays

```typescript
// Reduce visual clutter
const simplifiedOverlay = {
  type: 'text' as const, // Simple text only
  content: 'Medicine', // Concise labels
  style: {
    ...baseStyle,
    animation: 'none', // No animations
  },
};
```

## Troubleshooting

### Overlays Not Visible

**Problem:** Created overlays don't appear

**Solutions:**
1. Check `visible: true` is set
2. Verify position is within camera view
3. Ensure opacity > 0
4. Check parent scene enabled
5. Review console for render errors

### Poor Performance

**Problem:** Frame rate drops with overlays

**Solutions:**
1. Reduce max overlay count
2. Use simpler overlay types (text vs panel)
3. Disable unnecessary animations
4. Check for memory leaks (undisposed overlays)
5. Profile render latency

### Overlays Not Facing Camera

**Problem:** Billboard effect not working

**Solutions:**
1. Verify `billboard: true` is set
2. Ensure camera position is updating
3. Call `updateBillboards()` in update loop
4. Check camera reference is valid

### Text Not Readable

**Problem:** Text overlays hard to read

**Solutions:**
1. Increase font size
2. Enable adaptive brightness
3. Use high contrast colors
4. Improve environmental lighting
5. Position overlays at optimal distance (0.5-1.0m)

## Best Practices

1. **Always set TTL for temporary overlays** to prevent memory leaks
2. **Use billboard effect for text** for better readability
3. **Enable adaptive brightness** in production
4. **Position overlays above objects** (0.1-0.3m) to avoid occlusion
5. **Limit simultaneous overlays** to prevent visual clutter
6. **Use consistent styling** across object types
7. **Monitor render latency** to maintain <100ms target
8. **Test in actual lighting conditions** before demo
9. **Provide visual feedback** for all user interactions
10. **Clean up overlays** when objects are lost

## Examples

### Complete Example: Object Detection with Overlay

```typescript
import { MarvinARSystem } from './main';
import { OverlayManager } from './AROverlays/OverlayManager';
import { ObjectTracker } from './ObjectDetection/ObjectTracker';

// Initialize system
const arSystem = new MarvinARSystem(config);
await arSystem.initialize(/* ... */);

// Subscribe to object detection
objectTracker.on((event) => {
  if (event.type === 'object_detected') {
    const object = event.object;
    const config = getDemoObjectConfig(object.type);
    
    // Create overlay for detected object
    overlayManager.createOverlay({
      id: `overlay_${object.id}`,
      type: 'panel',
      position: new vec3(
        object.spatialPosition.x,
        object.spatialPosition.y + 0.2,
        object.spatialPosition.z
      ),
      content: {
        title: config.displayName,
        subtitle: `Confidence: ${(object.detectionConfidence * 100).toFixed(0)}%`,
      },
      style: config.overlayStyle,
      billboard: true,
      visible: true,
      opacity: 1.0,
      attachedTo: object.id,
    });
  }
});
```

## API Reference

See full TypeScript API documentation:
- [OverlayManager.ts](../src/AROverlays/OverlayManager.ts)
- [core.ts types](../src/types/core.ts)

---

**Next:** [Gesture System Guide](./GESTURES.md)

