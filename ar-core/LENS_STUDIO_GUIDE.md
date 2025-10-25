# Lens Studio Integration Guide for Marvin AR

## Overview

This guide explains how to import and configure the Marvin AR TypeScript code in Snap Lens Studio for deployment on Spectacles devices.

**Target**: Snap Spectacles (2024)
**Lens Studio Version**: 5.13+ (tested with 5.15.0)
**Platform**: Spectacles OS 5.64+

## Table of Contents

- [Understanding Lens Studio Projects](#understanding-lens-studio-projects)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [Component Configuration](#component-configuration)
- [Script Integration](#script-integration)
- [Testing Workflow](#testing-workflow)
- [Troubleshooting](#troubleshooting)

---

## Understanding Lens Studio Projects

### Project Structure

A Lens Studio project consists of several key components:

```
MarvinAR.esproj              # Project configuration file (YAML format)
│
├── Assets/                   # All project assets
│   ├── Scripts/             # TypeScript/JavaScript files
│   │   ├── lens-studio-entry.ts
│   │   ├── main.ts
│   │   ├── ObjectDetection/
│   │   ├── AROverlays/
│   │   └── Gestures/
│   ├── Scene.scene          # Main scene configuration
│   ├── Materials/           # Material assets
│   ├── Textures/            # Texture files
│   └── Models/              # 3D models
│
├── Packages/                 # External packages (.lspkg files)
│   ├── SpectaclesInteractionKit.lspkg
│   └── LSTween.lspkg        # Animation library
│
└── Workspaces/              # Lens Studio workspace settings
```

### How TypeScript Works in Lens Studio

**Important**: Lens Studio has **native TypeScript support**. You don't need to compile TypeScript to JavaScript first - Lens Studio handles this automatically.

- `.ts` files can be imported directly
- Type checking happens at build time
- Source maps are generated for debugging
- Supports ES6+ features

### Script Component System

Scripts in Lens Studio use a special annotation system for inputs:

```typescript
// @input SceneObject targetObject
// @input Component.HandTracking handTracking
// @input float speed = 1.0 {"hint":"Movement speed"}
```

These annotations:
- Create editable fields in the Lens Studio Inspector
- Allow you to wire up components visually
- Support optional parameters with defaults
- Provide type safety

---

## Quick Start

### Prerequisites

1. **Lens Studio 5.13+** installed from [ar.snap.com/lens-studio](https://ar.snap.com/lens-studio)
2. **Snap Spectacles device** with OS 5.64+
3. **Spectacles mobile app** (iOS 0.64+ or Android 0.64+)
4. **This repository** cloned locally

### Option A: Automated Setup (Recommended)

```bash
cd lens-studio
npm run setup-lens-studio
```

This script will:
- Create the proper project structure
- Generate the `.esproj` file
- Copy TypeScript files to `Assets/Scripts/`
- Set up the scene configuration

Then open `MarvinAR.esproj` in Lens Studio.

### Option B: Manual Setup

Follow the [Detailed Setup](#detailed-setup) section below.

---

## Detailed Setup

### Step 1: Create New Lens Studio Project

1. **Open Lens Studio**

2. **Create New Project**:
   - File → New Project
   - Select **"Spectacles"** template
   - Choose **"Blank"** starter template
   - Name: `MarvinAR`
   - Location: Save in a temporary location (we'll replace this)

3. **Configure Project Settings**:
   - Go to Project → Project Settings
   - Set **Target Device**: Spectacles (2024)
   - Enable **Source Maps**: Yes (for debugging)
   - Set **Optimization Level**: Performance

### Step 2: Set Up Scene Components

#### Add Required Components to Scene

In the Objects panel, create this hierarchy:

```
Camera [Camera]
  └── Device Tracking [DeviceTracking]

Tracking Systems
  ├── Object Tracking [ObjectTracking]
  ├── ML Component [MLComponent]
  └── Hand Tracking [HandTracking]

Scene Root [SceneObject]
  └── Marvin AR Controller [Script]

Remote Services
  └── Remote Service Module [RemoteServiceModule]
```

#### Component Configuration Details

**1. Camera Component**
- Add Component → Camera
- Type: Perspective
- Field of View: Default (66.6°)
- Render Target: Default render target

**2. Device Tracking**
- Add Component → Device Tracking
- Tracking Mode: World
- Enable: Surface Tracking ✓
- Enable: Plane Detection ✓

**3. Object Tracking**
- Add Component → Object Tracking
- Tracking Mode: World Object Tracking
- Max Tracked Objects: 10
- Tracking Quality: High

**4. ML Component**
- Add Component → ML Component
- Model: (Import your object detection model)
- Input: Camera texture
- Output: Object detections

**5. Hand Tracking**
- Add Component → Hand Tracking
- Enable Both Hands: ✓
- Hand Mesh: Enabled
- Landmark Detection: Enabled

**6. Scene Understanding** (Optional)
- Add Component → Scene Understanding
- Mesh Generation: Enabled
- Semantic Segmentation: Enabled

**7. Remote Service Module** (Optional)
- Add Component → Remote Service Module
- For Supabase integration

### Step 3: Import TypeScript Files

#### Prepare Files

From your project root:

```bash
# Build TypeScript (optional - Lens Studio can use .ts directly)
cd lens-studio
npm run build

# Or just use source files directly
```

#### Import into Lens Studio

**Method 1: Direct TypeScript Import** (Recommended)

1. In Lens Studio, go to **Resources Panel**
2. Right-click → **Add Files**
3. Navigate to `lens-studio/src/`
4. Select all TypeScript files and folders
5. Click **Import**

The file structure should appear as:
```
Resources/
├── Scripts/
│   ├── lens-studio-entry.ts
│   ├── main.ts
│   ├── ObjectDetection/
│   │   ├── DemoObjects.ts
│   │   ├── ObjectTracker.ts
│   │   └── SpatialAnchors.ts
│   ├── AROverlays/
│   │   └── OverlayManager.ts
│   ├── Gestures/
│   │   └── GestureHandler.ts
│   └── types/
│       ├── core.ts
│       └── lens-studio.d.ts
```

**Method 2: Compiled JavaScript Import**

1. Build the project: `npm run build`
2. In Resources Panel → Add Files
3. Import files from `lens-studio/dist/`
4. Note: You'll lose TypeScript type checking in Lens Studio

### Step 4: Attach Script to Scene

1. **Select Scene Root object** in Objects panel

2. **Add Script Component**:
   - Click **Add Component**
   - Choose **Script**
   - Script Asset: Select `lens-studio-entry.ts`

3. **Configure Script Inputs** (Inspector panel):

The script expects these inputs to be wired:

| Input Name | Type | Link To | Required |
|------------|------|---------|----------|
| `sceneRoot` | SceneObject | Scene Root object | Yes |
| `objectTracking` | ObjectTracking | Object Tracking component | Yes |
| `mlComponent` | MLComponent | ML Component | Yes |
| `handTracking` | HandTracking | Hand Tracking component | Yes |
| `deviceTracking` | DeviceTracking | Device Tracking component | Yes |
| `camera` | Camera | Camera component | Yes |
| `sceneUnderstanding` | SceneUnderstanding | Scene Understanding component | Optional |
| `remoteService` | RemoteServiceModule | Remote Service Module | Optional |

4. **Wire Components**:
   - Drag each component from the Objects panel
   - Drop onto corresponding input field in Script Inspector

### Step 5: Import ML Model

1. **Download Object Detection Model**:
   - Model should be in `.onnx` or `.tflite` format
   - Trained to recognize the 5 demo objects:
     - Medicine bottle
     - Breakfast bowl
     - Laptop
     - Keys
     - Phone

2. **Import Model**:
   - Resources Panel → Add Files
   - Select model file
   - Lens Studio will process the model

3. **Assign to ML Component**:
   - Select ML Component in Objects panel
   - Inspector → Model: Choose imported model
   - Configure:
     - Confidence Threshold: 0.90
     - Max Detections: 10
     - Input Size: (model-specific, typically 640x640)

### Step 6: Import Required Packages

Some Lens Studio packages may be needed:

1. **Download Spectacles Interaction Kit**:
   - Available in Lens Studio Asset Library
   - Or from [Spectacles Sample Repository](https://github.com/Snapchat/Spectacles-Sample)

2. **Import Package**:
   - Resources Panel → Add Files
   - Select `.lspkg` file
   - Package will be added to Packages folder

---

## Component Configuration

### Object Detection Configuration

The system recognizes 5 specific objects defined in [DemoObjects.ts](src/ObjectDetection/DemoObjects.ts):

```typescript
export const DEMO_OBJECTS: DemoObject[] = [
  {
    id: 'medicine_bottle',
    name: 'Medicine Bottle',
    category: 'health',
    confidenceThreshold: 0.90,
    // ... configuration
  },
  // ... other objects
];
```

**To customize object detection**:

1. Edit [DemoObjects.ts](src/ObjectDetection/DemoObjects.ts)
2. Adjust `confidenceThreshold` for each object
3. Modify spatial constraints (min/max size)
4. Update overlay configurations

### AR Overlay Configuration

Overlays are configured in the `OverlayManager`:

```typescript
const config: OverlayConfig = {
  billboardMode: true,              // Face camera
  fadeInDuration: 0.3,              // Seconds
  fadeOutDuration: 0.2,             // Seconds
  defaultOpacity: 0.9,
  maxVisibleOverlays: 20,
  updateFrequency: 60,              // Hz (match FPS)
};
```

**Customization**:
- Colors, fonts, sizes in `VisualHierarchy.ts`
- Icon assets in `Assets/Icons/`
- Positioning offsets in overlay creation calls

### Performance Configuration

Key performance settings in [main.ts](src/main.ts):

```typescript
const config: ARConfig = {
  performance: {
    minFps: 60,
    maxDetectionLatency: 100,       // ms
    maxRenderLatency: 100,          // ms
    targetAccuracy: 0.95,
  },
  enableSpatialMemory: true,
  enablePerformanceMonitoring: true,
  logLevel: 'info',                 // 'debug' | 'info' | 'warn' | 'error'
};
```

---

## Script Integration

### Entry Point Explained

The [lens-studio-entry.ts](src/lens-studio-entry.ts) file bridges Lens Studio and your TypeScript code:

```typescript
// Declare inputs (creates Inspector fields)
// @input SceneObject sceneRoot
// @input Component.ObjectTracking objectTracking
// ... etc

// Access declared inputs
declare const sceneRoot: SceneObject;
declare const objectTracking: ObjectTracking;

// Initialize system
async function initializeSystem() {
  arSystem = new MarvinARSystem(config);
  await arSystem.initialize(
    script,
    sceneRoot,
    objectTracking,
    mlComponent,
    // ... all components
  );
  arSystem.start();
}

// Hook into Lens Studio lifecycle
const sceneLoadEvent = script.createEvent('SceneEvent.OnStart');
sceneLoadEvent.bind(() => {
  initializeSystem();
});
```

### Custom Event Handlers

To add custom behavior:

1. **Extend the MarvinARSystem**:

```typescript
// In main.ts
export class MarvinARSystem {
  // Add custom method
  public onCustomEvent(callback: () => void) {
    this.customCallbacks.push(callback);
  }
}
```

2. **Call from Entry Point**:

```typescript
// In lens-studio-entry.ts
arSystem.onCustomEvent(() => {
  print('Custom event triggered!');
});
```

### Debugging

**Enable Debug Logging**:

```typescript
const config = createDefaultConfig();
config.logLevel = 'debug';  // Verbose logging
```

**Access Debug Console**:
- In Lens Studio: View → Logger Panel
- Shows all `print()` statements
- Displays errors and warnings
- Performance metrics

**Global Debug Object**:

```typescript
// Available in Lens Studio console
global.marvinAR = {
  getSystem: () => arSystem,
  getTrackedObjects: () => arSystem?.getTrackedObjects(),
  getPerformance: () => arSystem?.getPerformanceMetrics(),
};
```

Use in Logger Panel:
```javascript
// Check current state
global.marvinAR.getTrackedObjects()
global.marvinAR.getPerformance()
```

---

## Testing Workflow

### In-Editor Testing (Preview Mode)

1. **Start Preview**:
   - Click **Preview** button (top toolbar)
   - Or press `Cmd/Ctrl + P`

2. **Select Preview Mode**:
   - **Webcam**: Use computer webcam
   - **Spectacles**: Connect device for live preview
   - **Recording**: Test with recorded video

3. **Test Object Detection**:
   - Place physical objects in view
   - Or use printed images of demo objects
   - Watch for AR overlays to appear

4. **Monitor Performance**:
   - View → Performance Panel
   - Check FPS (should be 60)
   - Monitor detection latency
   - Watch memory usage

### Device Testing (Spectacles)

#### Connect Spectacles to Lens Studio

**Wireless Connection** (Recommended):

1. On Spectacles:
   - Long press button
   - Enable "Developer Mode"
   - Connect to Wi-Fi network

2. In Lens Studio:
   - Device → Connect to Device
   - Select your Spectacles from list
   - Wait for connection (should see green indicator)

**USB Connection**:

1. Connect Spectacles via USB cable
2. Enable Developer Mode on device
3. Lens Studio should auto-detect

#### Push to Device

1. **Build and Push**:
   - Click **Push to Device** button
   - Or Device → Push to Device
   - Lens builds and deploys automatically

2. **Monitor on Device**:
   - Lens launches automatically on Spectacles
   - View real-time performance
   - Test with actual physical objects

3. **Collect Logs**:
   - Device → Device Logs
   - View console output from device
   - Download logs for analysis

### Demo Environment Testing

**Physical Setup** (from [SETUP.md](docs/SETUP.md)):

```
+----------------------------------------+
|  [Medicine]                    [Phone] |
|                                        |
|  [Keys]      [Bowl]    [Laptop]       |
|                                        |
+----------------------------------------+

Lighting: 800 lux, 5000K LED panels
Desk: 6ft x 3ft, neutral backdrop
```

**Testing Checklist**:

- [ ] All 5 objects detected with >95% confidence
- [ ] AR overlays positioned correctly above objects
- [ ] Spatial tracking remains stable while moving
- [ ] Hand gestures recognized (reach, touch, point)
- [ ] Performance: 60 FPS maintained
- [ ] Adaptive brightness working in demo lighting
- [ ] Object occlusion handled (objects behind others)
- [ ] Spatial memory persists (keys location remembered)

### Iteration Workflow

**Typical development cycle**:

1. **Edit TypeScript** (in VS Code or editor)
   ```bash
   # Optional: build to check for errors
   npm run build
   ```

2. **Reload in Lens Studio**
   - Files update automatically if using .ts directly
   - Or reimport from `dist/` if using compiled JS

3. **Test in Preview**
   - Quick validation of changes
   - Check console for errors

4. **Push to Device**
   - Test in real AR environment
   - Validate with physical objects

5. **Collect Metrics**
   - Check performance panel
   - Review device logs
   - Validate against requirements

---

## Troubleshooting

### Common Import Issues

**Problem**: "Cannot find module" errors

**Solution**:
- Ensure all files imported together (not individually)
- Check that `types/` folder is included
- Verify import paths use relative paths
- In Lens Studio, check Resources panel shows all files

**Problem**: TypeScript errors in Lens Studio

**Solution**:
- Update Lens Studio to 5.13+
- Check `tsconfig.json` is compatible
- Enable source maps in Project Settings
- Try reimporting with "Clean" option

### Script Component Issues

**Problem**: Script inputs not appearing in Inspector

**Solution**:
- Check `@input` annotations are correct format
- Ensure space after `//` in comments
- Verify component types match Lens Studio types
- Try removing and re-adding script component

**Problem**: "sceneRoot is required" error

**Solution**:
- Ensure all required inputs are wired
- Check component names match exactly
- Verify components exist in scene hierarchy
- Look for red indicators in Inspector

### Object Detection Issues

**Problem**: Objects not being detected

**Solution**:
- Check ML model is loaded (Resources panel)
- Verify model is assigned to ML Component
- Ensure confidence threshold not too high (try 0.70)
- Check lighting conditions (800 lux recommended)
- Verify camera permissions granted
- Test with known working objects first

**Problem**: Low detection confidence (<95%)

**Solution**:
- Improve lighting (even, diffuse, 800 lux)
- Position objects clearly in view
- Ensure objects match training data
- Adjust `confidenceThreshold` in DemoObjects.ts
- Check for reflections/glare on objects

### Performance Issues

**Problem**: FPS below 60

**Solution**:
- Reduce `maxTrackedObjects` (try 5 instead of 10)
- Decrease `maxVisibleOverlays` (try 10 instead of 20)
- Disable Scene Understanding if not needed
- Simplify overlay geometry (fewer vertices)
- Profile with Performance Panel to find bottleneck

**Problem**: High detection/render latency (>100ms)

**Solution**:
- Optimize ML model (use quantized version)
- Reduce model input resolution
- Throttle update frequency (try 30 Hz)
- Use object pooling for overlays
- Minimize work in update loops

### Runtime Errors

**Problem**: "Cannot read property of undefined"

**Solution**:
- Add null checks for optional components
- Ensure async initialization completes
- Check component lifecycle order
- Validate all inputs before use

**Problem**: Spatial tracking lost

**Solution**:
- Recalibrate device (restart app)
- Check environment mapping quality
- Ensure adequate visual features in scene
- Avoid blank walls or uniform surfaces
- Reset spatial anchors and rebuild

### Build/Deployment Issues

**Problem**: "Failed to build" in Lens Studio

**Solution**:
- Check Logger Panel for specific errors
- Verify all resources present
- Clear Lens Studio cache (Preferences → Clear Cache)
- Try cleaning and rebuilding project

**Problem**: Can't connect to Spectacles

**Solution**:
- Verify Wi-Fi connection (same network)
- Check Developer Mode enabled on device
- Restart Lens Studio and Spectacles
- Try USB connection instead
- Update Spectacles firmware and mobile app

---

## Advanced Topics

### Custom ML Models

To use your own object detection model:

1. **Train Model**:
   - Use TensorFlow or PyTorch
   - Export to ONNX or TFLite format
   - Target input: 640x640 (or model-specific)
   - Output: Bounding boxes + class labels + confidence

2. **Import to Lens Studio**:
   - Resources → Add Files → Select model
   - Lens Studio auto-converts if needed

3. **Update DemoObjects.ts**:
   - Add new object definitions
   - Match class labels from model
   - Configure thresholds and constraints

### Supabase Integration

The Remote Service Module enables backend communication:

```typescript
// In lens-studio-entry.ts
const remoteService = ...; // From input

// Configure in arSystem
arSystem.configureRemoteService(remoteService, {
  supabaseUrl: 'https://your-project.supabase.co',
  supabaseKey: 'your-anon-key',
});
```

See [backend documentation](../supabase/README.md) for setup.

### Extended Permissions

Some features require Extended Permissions mode:

1. On Spectacles:
   - Settings → Developer
   - Enable Extended Permissions

2. In Lens Studio:
   - Project Settings → Capabilities
   - Enable required permissions:
     - Camera Access
     - Internet Access
     - Location (if using)

### Multiplayer/Connected Lenses

For multi-user experiences:

1. Import Spectacles Sync Kit package
2. Set up session management
3. Sync object transforms and states
4. Handle network latency

See [Spectacles Sync Kit documentation](https://developers.snap.com/spectacles/spectacles-frameworks/spectacles-sync-kit).

---

## Resources

### Official Documentation

- [Lens Studio Documentation](https://developers.snap.com/lens-studio)
- [Spectacles Developer Guide](https://developers.snap.com/spectacles)
- [Spectacles API Reference](https://developers.snap.com/spectacles/about-spectacles-features/apis/overview)
- [TypeScript in Lens Studio](https://developers.snap.com/lens-studio/scripting/typescript)

### Sample Projects

- [Spectacles Sample Repository](https://github.com/Snapchat/Spectacles-Sample)
- [Context/Spectacles-Sample-main/](../Context/Spectacles-Sample-main/) (local reference)
- Essentials project: Comprehensive examples

### Marvin AR Documentation

- [Project README](../README.md)
- [Product Requirements](../prd.md)
- [Task List](../marvin-ar-task-list.md)
- [Setup Guide](docs/SETUP.md)
- [Object Detection Guide](docs/OBJECT_DETECTION.md)
- [AR Overlays Guide](docs/AR_OVERLAYS.md)

### Community Support

- [Spectacles Reddit](https://www.reddit.com/r/Spectacles/)
- [Snap Developer Forums](https://support.snapchat.com/en-US/i-need-help)
- Marvin AR Team: Dev 1 (AR Core)

---

## Next Steps

1. **Complete Lens Studio Setup**:
   - Follow steps in this guide
   - Wire all components
   - Test in preview mode

2. **Deploy to Device**:
   - Connect Spectacles
   - Push lens to device
   - Test with physical demo objects

3. **Integrate with Team**:
   - Coordinate with Dev 2 (AI & Voice)
   - Set up Supabase connection (Dev 3)
   - Establish CI/CD pipeline (Dev 4)

4. **Prepare for Demo**:
   - Set up physical environment
   - Practice 2-minute presentation
   - Configure fallback systems
   - Test reliability repeatedly

---

**Last Updated**: Phase 1 Foundation Complete
**Version**: 1.0.0
**Author**: Dev 1 (AR Core)
**Status**: Ready for Lens Studio Import
