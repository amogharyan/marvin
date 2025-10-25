# Object Detection Guide

## Overview

The Marvin AR object detection system recognizes and tracks 5 demo objects in real-time using Snap Spectacles native capabilities and machine learning.

**Functional Requirements Implemented:**
- FR-001: Native Snap Spectacles object detection
- FR-002: Recognition of 5 demo objects
- FR-003: Spatial position tracking with anchors
- FR-005: <100ms latency requirement
- FR-006: Stable tracking in demo lighting
- FR-007: Object occlusion handling

**Performance Targets:**
- Detection accuracy: >95%
- Latency: <100ms from detection to rendering
- Frame rate: Stable 60fps
- Max simultaneous objects: 10

## Architecture

### Components

```
ObjectDetection/
├── ObjectTracker.ts      # Main detection coordinator
├── DemoObjects.ts        # Object configurations
└── SpatialAnchors.ts     # Persistent positioning
```

### Data Flow

```
Camera Feed
    ↓
Lens Studio ObjectTracking
    ↓
ML Model Classification
    ↓
ObjectTracker (filtering & validation)
    ↓
SpatialAnchors (position memory)
    ↓
Event Emission
    ↓
AR Overlays / Gesture Handler
```

## Demo Objects

### 1. Medicine Bottle

**Purpose:** Health reminders and medication tracking

**Configuration:**
```typescript
{
  type: 'medicine_bottle',
  displayName: 'Medicine Bottle',
  mlLabels: ['bottle', 'medicine_bottle', 'pill_bottle'],
  confidenceThreshold: 0.95,
  enableSpatialMemory: true
}
```

**Triggers:**
- Medication reminders
- Health tracking
- Schedule alerts
- Dosage confirmation

**Visual Style:** Health red (#FF6666)

### 2. Breakfast Bowl

**Purpose:** Nutrition tracking and recipe suggestions

**Configuration:**
```typescript
{
  type: 'breakfast_bowl',
  displayName: 'Breakfast Bowl',
  mlLabels: ['bowl', 'food_bowl', 'cereal_bowl'],
  confidenceThreshold: 0.92,
  enableSpatialMemory: false
}
```

**Triggers:**
- Nutrition analysis
- Recipe suggestions
- Calorie tracking
- Meal logging

**Visual Style:** Nutrition green (#8CCC66)

### 3. Laptop

**Purpose:** Calendar integration and work briefing

**Configuration:**
```typescript
{
  type: 'laptop',
  displayName: 'Laptop',
  mlLabels: ['laptop', 'computer', 'notebook_computer'],
  confidenceThreshold: 0.94,
  enableSpatialMemory: true
}
```

**Triggers:**
- Calendar briefing
- Meeting preparation
- Day overview
- Work mode activation

**Visual Style:** Work blue (#54B5D4)

### 4. Keys

**Purpose:** Location tracking and departure checklist

**Configuration:**
```typescript
{
  type: 'keys',
  displayName: 'Keys',
  mlLabels: ['keys', 'key_ring', 'car_keys'],
  confidenceThreshold: 0.93,
  enableSpatialMemory: true
}
```

**Triggers:**
- Departure checklist
- Location tracking
- Navigation guidance
- Reminder alerts

**Visual Style:** Departure yellow (#FFCC33)

### 5. Phone

**Purpose:** Connectivity status and backup interface

**Configuration:**
```typescript
{
  type: 'phone',
  displayName: 'Phone',
  mlLabels: ['phone', 'smartphone', 'mobile_phone'],
  confidenceThreshold: 0.94,
  enableSpatialMemory: false
}
```

**Triggers:**
- Connectivity check
- Backup interface
- Device sync
- Notification summary

**Visual Style:** Tech purple (#8C5CF5)

## Usage

### Initialize Object Tracker

```typescript
import { ObjectTracker } from './ObjectDetection/ObjectTracker';

const tracker = new ObjectTracker({
  enablePerformanceMonitoring: true,
  debugMode: false,
  maxTrackedObjects: 10,
  updateFrequency: 60,
});

// Initialize with Lens Studio components
await tracker.initialize(objectTracking, mlComponent);

// Start tracking
tracker.startTracking();
```

### Subscribe to Detection Events

```typescript
// Listen for object detection events
tracker.on((event) => {
  switch (event.type) {
    case 'object_detected':
      console.log('New object:', event.object.name);
      handleNewObject(event.object);
      break;
      
    case 'object_lost':
      console.log('Lost object:', event.object.name);
      handleLostObject(event.object);
      break;
      
    case 'object_updated':
      updateObjectPosition(event.object);
      break;
  }
});
```

### Query Tracked Objects

```typescript
// Get all tracked objects
const objects = tracker.getTrackedObjects();

// Get object by ID
const object = tracker.getObjectById('object_123');

// Get objects by type
const medicines = tracker.getObjectsByType('medicine_bottle');

// Get closest object to position
const nearest = tracker.getClosestObject(cameraPosition);

// Get count
const count = tracker.getTrackedObjectCount();
```

### Performance Monitoring

```typescript
// Get performance metrics
const metrics = tracker.getPerformanceMetrics();

console.log('Detection Latency:', metrics.detectionLatency, 'ms');
console.log('Tracked Objects:', metrics.trackedObjectCount);

// Get average latency
const avgLatency = tracker.getAverageDetectionLatency();
```

## Spatial Anchors

### Purpose

Spatial anchors provide:
- Persistent object positioning
- Location memory ("Where are my keys?")
- Stable AR tracking during occlusion
- Learning typical object locations

### Usage

```typescript
import { SpatialAnchorsManager } from './ObjectDetection/SpatialAnchors';

const anchors = new SpatialAnchorsManager({
  enableLearning: true,
  minConfidenceThreshold: 0.9,
  maxAnchorAge: 24 * 60 * 60 * 1000, // 24 hours
  debugMode: false,
});
```

### Create Anchors

```typescript
// Create anchor when object is detected
const anchorId = anchors.createOrUpdateAnchor(demoObject);
```

### Query Location Memory

```typescript
// Get last known position
const lastPosition = anchors.getLastKnownPosition(objectId);

// Get direction to object
const direction = anchors.getDirectionToObject(objectId, currentPosition);

// Get spatial memory (learned location)
const memory = anchors.getSpatialMemory(objectId);
console.log('Typical location:', memory.typicalLocation);
console.log('Confidence:', memory.locationConfidence);
```

### Statistics

```typescript
const stats = anchors.getStatistics();
console.log('Total anchors:', stats.totalAnchors);
console.log('Tracked anchors:', stats.trackedAnchors);
console.log('Learned locations:', stats.memoriesWithTypicalLocation);
```

## Configuration

### Object-Specific Configuration

```typescript
import { getDemoObjectConfig } from './ObjectDetection/DemoObjects';

const config = getDemoObjectConfig('medicine_bottle');
console.log('Display Name:', config.displayName);
console.log('ML Labels:', config.mlLabels);
console.log('Confidence Threshold:', config.confidenceThreshold);
console.log('Triggers:', config.triggers);
```

### Custom Configuration

```typescript
// Override default configuration
const customConfig = {
  ...DEMO_OBJECTS_CONFIG.medicine_bottle,
  confidenceThreshold: 0.98, // Stricter threshold
  enableSpatialMemory: false, // Disable memory
};
```

## ML Model Integration

### Model Requirements

- **Input:** RGB camera feed (640x480 or higher)
- **Output:** Object classifications with confidence scores
- **Format:** TensorFlow Lite or Lens Studio ML format
- **Performance:** <50ms inference time

### Supported Labels

```typescript
import { getAllMLLabels } from './ObjectDetection/DemoObjects';

const allLabels = getAllMLLabels();
// Returns: ['bottle', 'medicine_bottle', 'bowl', 'laptop', ...]
```

### Label Mapping

```typescript
import { getObjectTypeFromLabel } from './ObjectDetection/DemoObjects';

const objectType = getObjectTypeFromLabel('medicine_bottle');
// Returns: 'medicine_bottle'

const unknownType = getObjectTypeFromLabel('unknown_object');
// Returns: null
```

### Confidence Validation

```typescript
import { meetsConfidenceThreshold } from './ObjectDetection/DemoObjects';

const meets = meetsConfidenceThreshold('medicine_bottle', 0.96);
// Returns: true (threshold is 0.95)
```

## Optimizing Detection

### Lighting Conditions

**Optimal:**
- Color temperature: 5000K
- Brightness: 800 lux
- Even, diffused lighting

**Acceptable:**
- Color temperature: 4000-6000K
- Brightness: 500-1200 lux
- Minimal shadows

**Problematic:**
- Direct sunlight (too bright)
- Dim lighting <300 lux
- Harsh shadows
- Flickering lights

### Object Placement

**Best Practices:**
- Place objects on non-reflective surfaces
- Ensure clear view from camera
- Avoid overlapping objects
- Maintain 20-30cm between objects

**Distance:**
- Minimum: 0.3m from camera
- Optimal: 0.5-1.0m from camera
- Maximum: 2.0m from camera

### Performance Tuning

**Reduce Latency:**
```typescript
// Lower confidence threshold (trade accuracy for speed)
const config = {
  confidenceThreshold: 0.85, // Default: 0.9-0.95
};

// Reduce max tracked objects
const tracker = new ObjectTracker({
  maxTrackedObjects: 5, // Default: 10
});
```

**Improve Accuracy:**
```typescript
// Increase confidence threshold
const config = {
  confidenceThreshold: 0.98,
};

// Enable debug mode to log false positives
const tracker = new ObjectTracker({
  debugMode: true,
});
```

## Troubleshooting

### Objects Not Detected

**Problem:** Objects not being recognized

**Solutions:**
1. Check lighting conditions (aim for 800 lux)
2. Verify ML model loaded correctly
3. Lower confidence threshold temporarily
4. Ensure objects match expected appearance
5. Check console for ML model errors

### False Positives

**Problem:** Wrong objects being detected

**Solutions:**
1. Increase confidence threshold
2. Review ML label mappings
3. Improve lighting consistency
4. Use more distinctive objects
5. Train custom ML model if needed

### Poor Tracking Stability

**Problem:** Objects frequently lost and re-detected

**Solutions:**
1. Enable spatial anchors
2. Improve environmental lighting
3. Reduce camera movement
4. Check for object occlusion
5. Verify spatial tracking enabled

### High Latency

**Problem:** Detection latency >100ms

**Solutions:**
1. Reduce max tracked objects
2. Optimize ML model (quantization)
3. Lower update frequency
4. Check device performance
5. Profile with performance tools

## Demo Environment Setup

### Calibration Process

1. **Place Objects:**
   - Position objects at configured locations
   - Ensure proper spacing and visibility

2. **Test Detection:**
   ```typescript
   tracker.startTracking();
   
   // Wait for detection
   setTimeout(() => {
     const detected = tracker.getTrackedObjects();
     console.log(`Detected ${detected.length}/5 objects`);
   }, 3000);
   ```

3. **Validate Accuracy:**
   - Each object should detect >95% of time
   - Confidence scores should meet thresholds
   - No false positives

4. **Optimize Lighting:**
   - Measure lux with light meter
   - Adjust to 800 lux target
   - Ensure even distribution

5. **Test Occlusion:**
   - Temporarily occlude each object
   - Verify spatial anchors maintain position
   - Check re-detection time

## Best Practices

1. **Always enable spatial anchors** for objects that need location memory (keys, laptop)
2. **Subscribe to detection events** rather than polling
3. **Monitor performance metrics** to catch degradation early
4. **Use debug mode during development** to see detection details
5. **Validate confidence thresholds** in actual demo environment
6. **Test with actual demo objects** not substitutes
7. **Calibrate lighting** before each demo session
8. **Have backup objects** in case of detection issues

## API Reference

See full TypeScript API documentation in source files:
- [ObjectTracker.ts](../src/ObjectDetection/ObjectTracker.ts)
- [SpatialAnchors.ts](../src/ObjectDetection/SpatialAnchors.ts)
- [DemoObjects.ts](../src/ObjectDetection/DemoObjects.ts)

---

**Next:** [AR Overlays Guide](./AR_OVERLAYS.md)

