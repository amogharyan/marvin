# Object Detection Integration Guide

This document explains how the immerseGT2025 object detection functionality has been integrated into the Marvin project.

## Overview

The integration brings YOLOv8-based remote object detection capabilities to Marvin, allowing the system to detect and spatially locate 80 different object categories using the Hugging Face API with depth estimation.

## New Files Added

### Core Object Detection Scripts

1. **PinholeCameraModel.ts** (`marvin-main/Assets/Scripts/`)
   - Handles camera intrinsic parameters and coordinate transformations
   - Provides methods to convert between 2D screen space and 3D world space
   - Essential for accurate spatial positioning of detected objects

2. **PinholeCapture.ts** (`marvin-main/Assets/Scripts/`)
   - Manages camera capture and coordinate transformation
   - Saves camera matrices for consistent spatial mapping
   - Converts 2D detection coordinates to 3D world positions

3. **ClosedPolyline.ts** (`marvin-main/Assets/Scripts/`)
   - Provides visual representation for bounding boxes
   - Renders polylines around detected objects
   - Supports continuous and split line rendering modes

4. **DetectionContainer.ts** (`marvin-main/Assets/Scripts/`)
   - Container component for detection visualizations
   - Manages text labels, polylines, and billboards
   - Handles lifecycle of detection UI elements

5. **RemoteObjectDetectionManager.ts** (`marvin-main/Assets/Scripts/`)
   - Main manager for remote object detection
   - Handles API communication with Hugging Face
   - Processes YOLO detection results
   - Creates and manages detection visualizations

## Updated Files

### MarvinAssistant.ts

Enhanced with:
- Extended `ComponentType` enum to include all 80 YOLO object categories
- New input for `RemoteObjectDetectionManager`
- New events: `yoloDetectionEvent` and `yoloDetectionCompleteEvent`
- Methods:
  - `triggerRemoteObjectDetection(texture)` - Initiates object detection
  - `clearRemoteDetections()` - Clears all detection visualizations
  - `getDetectedComponents()` - Returns currently detected objects

## YOLOv8 Object Categories

The system can detect 80 different object types:

**People & Animals:** person, bird, cat, dog, horse, sheep, cow, elephant, bear, zebra, giraffe

**Vehicles:** bicycle, car, motorcycle, airplane, bus, train, truck, boat

**Outdoor Objects:** traffic light, fire hydrant, stop sign, parking meter, bench

**Sports:** frisbee, skis, snowboard, sports ball, kite, baseball bat, baseball glove, skateboard, surfboard, tennis racket

**Kitchen:** bottle, wine glass, cup, fork, knife, spoon, bowl, banana, apple, sandwich, orange, broccoli, carrot, hot dog, pizza, donut, cake

**Furniture:** chair, couch, potted plant, bed, dining table, toilet

**Electronics:** tv, laptop, mouse, remote, keyboard, cell phone, microwave, oven, toaster, sink, refrigerator

**Accessories:** backpack, umbrella, handbag, tie, suitcase

**Home Items:** book, clock, vase, scissors, teddy bear, hair drier, toothbrush

## Setup Instructions

### 1. Hugging Face API Configuration

To use remote object detection, you need a Hugging Face API token:

1. Create a Hugging Face account at https://huggingface.co/
2. Generate an API token from your settings
3. Duplicate the detection space: https://huggingface.co/spaces/tallspice/Simultaneous-Segmented-Depth-Prediction
4. Configure your duplicated space settings (hardware, sleep time, etc.)

### 2. Lens Studio Setup

1. **Add RemoteObjectDetectionManager Component:**
   - Create a new SceneObject in your scene
   - Add the `RemoteObjectDetectionManager` script component
   - Configure the following inputs:
     - **hfApiToken**: Your Hugging Face API token
     - **modelSize**: Choose from Small, Medium, or Large
     - **confidenceThreshold**: Minimum confidence (0.0-1.0, recommended: 0.5)
     - **distanceThreshold**: Maximum detection distance in meters (recommended: 10.0)
     - **detectionPrefab**: Prefab for visualizing detections (needs to contain DetectionContainer)
     - **pinholeCapture**: Reference to PinholeCapture component

2. **Add PinholeCapture Component:**
   - Create a SceneObject
   - Add the `PinholeCapture` script component
   - This will automatically configure camera intrinsics

3. **Create Detection Prefab:**
   - Create a prefab with:
     - Root object with `DetectionContainer` script
     - Text components for category and distance labels
     - 4 SceneObjects for polyline points (PointA, PointB, PointC, PointD)
     - ClosedPolyline component for bounding box visualization
     - Billboard component for UI orientation

4. **Link to MarvinAssistant:**
   - In your MarvinAssistant component inspector
   - Assign the RemoteObjectDetectionManager to the new input field

## Usage

### Triggering Object Detection

```typescript
// Get a reference to MarvinAssistant
const marvin = this.getComponent(MarvinAssistant);

// Get camera texture
const cameraTexture = someCameraTexture;

// Trigger detection
const detections = await marvin.triggerRemoteObjectDetection(cameraTexture);

// Process results
detections.forEach(detection => {
  print(`Detected: ${detection.class_name}`);
  print(`Confidence: ${detection.confidence}`);
  print(`Distance: ${detection.distance}m`);
  print(`Position: [${detection.center_2d[0]}, ${detection.center_2d[1]}]`);
});
```

### Listening to Detection Events

```typescript
// Listen for YOLO detections
marvin.yoloDetectionEvent.add((detections) => {
  print(`Detected ${detections.length} objects`);
});

// Listen for detection completion
marvin.yoloDetectionCompleteEvent.add((result) => {
  print(`Detection complete: ${result.count} objects found`);
});

// Listen for individual component detections (backwards compatible)
marvin.componentDetectedEvent.add((component) => {
  print(`Component detected: ${component.type}`);
});
```

### Clearing Detections

```typescript
// Clear all active detection visualizations
marvin.clearRemoteDetections();
```

## Configuration Options

### Model Size
- **Small**: Faster performance, lower accuracy
- **Medium**: Balanced performance and accuracy (recommended)
- **Large**: Slower performance, higher accuracy

### Confidence Threshold
- Range: 0.0 to 1.0
- Recommended: 0.5 or higher
- Lower values = more detections but potentially more false positives
- Higher values = fewer detections but higher confidence

### Distance Threshold
- Maximum detection distance in meters
- Recommended: 10.0 meters
- Objects beyond this distance won't be detected

## Detection Data Structure

Each detection includes:

```typescript
interface YOLODetection {
  class_id: number;           // YOLO class ID (0-79)
  class_name: string;         // Object name (e.g., "laptop", "person")
  bounding_box: {
    vertices: number[][];     // 4 corner points of bounding box
  };
  center_2d: number[];        // [x, y] center position in pixels
  distance: number;           // Estimated distance in meters
  color: number[];            // RGB color for visualization
  confidence: number;         // Detection confidence (0.0-1.0)
}
```

## Spatial Positioning

The system uses pinhole camera model for accurate 3D positioning:

1. Camera captures 2D image
2. YOLO detects objects and estimates depth
3. PinholeCameraModel converts 2D coordinates + depth to 3D world position
4. Detection prefabs are positioned in 3D space at calculated positions

## API Limitations

- Requires active internet connection
- Subject to Hugging Face API rate limits
- Response time depends on:
  - Model size (Small/Medium/Large)
  - Image resolution
  - Number of objects in scene
  - Server load

## Troubleshooting

### "Hugging Face API token is not set"
- Ensure you've entered your API token in the RemoteObjectDetectionManager

### "Remote Object Detection Manager not configured"
- Link the RemoteObjectDetectionManager to MarvinAssistant in the inspector

### "Error: viewToWorld matrix is undefined"
- Ensure PinholeCapture is properly initialized and saveMatrix() is called before detection

### Detections appear in wrong positions
- Verify PinholeCapture is correctly configured
- Check that camera intrinsics are being captured properly
- Adjust offsetPositioning parameter in RemoteObjectDetectionManager

### No detections appearing
- Lower the confidenceThreshold
- Increase the distanceThreshold
- Ensure objects are well-lit and clearly visible
- Verify Hugging Face API connection is working

## Integration with Existing Marvin Features

The object detection system integrates seamlessly with Marvin's existing features:

- **Gemini AI Integration**: Can provide context about detected objects to Gemini
- **Component Detection Events**: Detection results fire existing component events
- **UI Bridge**: Can display detection results through existing UI components
- **AR Overlay**: Detected objects can be highlighted in AR view

## Performance Tips

1. Use **Medium** model size for best balance
2. Set confidence threshold to **0.5** or higher to reduce false positives
3. Limit distance threshold to **10 meters** to reduce processing time
4. Don't run detection on every frame - use periodic intervals
5. Clear old detections regularly to maintain performance

## Future Enhancements

Potential improvements:
- On-device object detection using SnapML
- Object tracking between frames
- Custom object categories
- Multi-object relationship analysis
- Integration with Gemini for natural language queries about detected objects

## Credits

Object detection implementation based on:
- **immerseGT2025-obj-detection** project
- YOLOv8 model via Hugging Face
- Simultaneous Segmentation and Depth Estimation by Vaishanth
