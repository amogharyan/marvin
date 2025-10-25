# Marvin AR Core - Setup Guide

## Prerequisites

### Required Software

1. **Node.js 20 LTS or higher**
   ```bash
   node --version  # Should be >= 20.0.0
   ```
   Download from: https://nodejs.org/

2. **Snap Lens Studio 5.13+**
   - Download from: https://ar.snap.com/lens-studio
   - Minimum version: 5.13
   - Target platform: Snap Spectacles

3. **Git**
   ```bash
   git --version
   ```

4. **Visual Studio Code** (recommended)
   - Download from: https://code.visualstudio.com/
   - Recommended extensions:
     - TypeScript + JavaScript
     - ESLint
     - Prettier

### Required Accounts

1. **Snap Spectacles Developer Account**
   - Sign up at: https://ar.snap.com/
   - Complete developer verification
   - Accept developer terms

2. **Supabase Account** (for backend integration)
   - Sign up at: https://supabase.com/
   - Create new project for Marvin AR

### Hardware

- **Snap Spectacles device** for testing
- **USB cable** for device connection
- **Computer** with:
  - macOS 11+, Windows 10+, or Ubuntu 20.04+
  - 8GB RAM minimum (16GB recommended)
  - Dedicated GPU recommended for AR development

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/marvin-ar/marvin-ar-assistant.git
cd marvin-ar-assistant/lens-studio
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- TypeScript compiler
- Jest testing framework
- ESLint for code quality
- Type definitions

### 3. Configure Environment

Create `.env` file in lens-studio root:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Development Configuration
NODE_ENV=development
LOG_LEVEL=debug

# Performance Thresholds
TARGET_FPS=60
MAX_DETECTION_LATENCY=100
MAX_RENDER_LATENCY=100

# Demo Configuration
DEMO_MODE=false
```

### 4. Build TypeScript

```bash
npm run build
```

Output will be in `dist/` directory.

### 5. Verify Installation

```bash
# Run tests
npm test

# Run linter
npm run lint
```

## Lens Studio Setup

### 1. Create New Project

1. Open Snap Lens Studio
2. Create new project
3. Select **Spectacles** as target device
4. Choose **Blank** template

### 2. Configure Project Settings

**Project Settings:**
- Target Device: Spectacles
- Minimum OS Version: Latest
- Optimization Level: High Performance

**Scene Setup:**
- Add Camera component
- Add Device Tracking component
- Add Hand Tracking component
- Add Object Tracking component

### 3. Import TypeScript Output

1. In Lens Studio, go to Resources panel
2. Right-click → Import Files
3. Navigate to `dist/` folder
4. Import `main.js` and all dependencies

### 4. Create Script Component

1. Add new Script component to scene
2. Assign `main.js` as script file
3. Configure script inputs:
   - Scene Root: Link to scene root object
   - Object Tracking: Link to Object Tracking component
   - ML Component: Link to ML Component
   - Hand Tracking: Link to Hand Tracking component
   - Device Tracking: Link to Device Tracking component
   - Scene Understanding: Link to Scene Understanding component
   - Camera Provider: Link to Camera component
   - Remote Service: Link to Remote Service Module

### 5. Configure ML Model

1. Download object detection model (provided separately)
2. Import model to Lens Studio Resources
3. Link model to ML Component
4. Configure model parameters:
   - Confidence threshold: 0.9
   - Max detections: 10

### 6. Test in Preview

1. Click **Preview** button
2. Use webcam for initial testing
3. Verify object detection working
4. Check AR overlays rendering

## Device Testing

### 1. Connect Spectacles

**Wireless Connection:**
1. Enable pairing mode on Spectacles
2. In Lens Studio: Device → Connect to Device
3. Select your Spectacles from list
4. Wait for connection confirmation

**USB Connection:**
1. Connect Spectacles via USB
2. Enable developer mode on device
3. Accept connection prompt

### 2. Deploy to Device

1. Click **Push to Device** button
2. Wait for build to complete
3. Project will automatically launch on Spectacles

### 3. Test on Device

**Basic Tests:**
- [ ] Object detection working (5 objects)
- [ ] AR overlays rendering correctly
- [ ] Hand gestures recognized
- [ ] Spatial tracking stable
- [ ] Performance: 60fps maintained

**Demo Environment Tests:**
- [ ] All 5 objects detected reliably
- [ ] Overlays positioned correctly
- [ ] Gesture interactions working
- [ ] Spatial memory persisting

## Demo Environment Setup

### Physical Setup

**Desk Configuration:**
- Size: 6ft x 3ft minimum
- Surface: Non-reflective, neutral color
- Background: Minimal, neutral backdrop

**Lighting:**
- LED panels: 5000K color temperature
- Brightness: 800 lux consistent
- Avoid direct sunlight or harsh shadows

**Object Placement:**

```
Desk Layout (top view):

+----------------------------------------+
|  [Medicine]                    [Phone] |
|                                        |
|  [Keys]      [Bowl]    [Laptop]       |
|                                        |
+----------------------------------------+

Medicine Bottle: Back-left (-0.6, 0.05, -0.3)
Breakfast Bowl:  Center-left (-0.3, 0.05, 0.3)
Laptop:          Center-right (0.3, 0.05, 0.2)
Keys:            Far left (-0.8, 0.05, 0.4)
Phone:           Right side (0.7, 0.05, 0.3)
```

### Object Requirements

**Medicine Bottle:**
- Standard prescription bottle
- Clear label visible
- Distinct from other bottles

**Breakfast Bowl:**
- Ceramic or glass bowl
- Distinct color/pattern
- Food optional for demo

**Laptop:**
- Any laptop, open at 45° angle
- Screen visible but not glaring
- Modern design (MacBook ideal)

**Keys:**
- Standard keyring with 3-5 keys
- Metal keys preferred
- Consistent placement

**Phone:**
- Modern smartphone
- Face-up position
- Screen visible

## Troubleshooting

### Build Errors

**TypeScript compilation errors:**
```bash
# Clear dist and rebuild
npm run clean
npm run build
```

**Dependency issues:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

### Lens Studio Issues

**Script not loading:**
- Verify all dependencies imported
- Check script component configuration
- Review console for errors

**Object detection not working:**
- Verify ML model loaded correctly
- Check confidence threshold settings
- Ensure proper lighting conditions

**Performance issues:**
- Lower max tracked objects
- Reduce overlay count
- Optimize update frequency

### Device Connection

**Can't connect to Spectacles:**
- Verify Wi-Fi connection
- Check developer mode enabled
- Restart Lens Studio and device

**Deployment fails:**
- Check device storage space
- Verify project size under limit
- Try USB connection instead

### Runtime Errors

**Objects not detected:**
- Check lighting (800 lux target)
- Verify object placement
- Adjust confidence thresholds

**Gestures not recognized:**
- Ensure hand tracking enabled
- Check interaction distance (30cm)
- Verify gesture types enabled

**Poor performance:**
- Check FPS in debug output
- Review performance metrics
- Reduce simultaneous overlays

## Development Workflow

### Typical Development Cycle

1. **Code Changes**
   ```bash
   # Make changes to TypeScript files
   npm run dev  # Watch mode
   ```

2. **Test Locally**
   ```bash
   npm test
   npm run lint
   ```

3. **Build for Lens Studio**
   ```bash
   npm run build
   ```

4. **Import to Lens Studio**
   - Reimport updated `dist/` files
   - Test in preview

5. **Deploy to Device**
   - Push to Spectacles
   - Test in actual environment

### Debug Mode

Enable debug logging in `main.ts`:

```typescript
const config = {
  ...createDefaultConfig(),
  logLevel: 'debug',
  debugMode: true,
};
```

View logs in:
- Lens Studio console
- Device logs (via adb or Lens Studio device panel)

### Performance Profiling

Monitor performance metrics:

```typescript
const metrics = arSystem.getPerformanceMetrics();
console.log('FPS:', metrics.fps);
console.log('Detection Latency:', metrics.detectionLatency);
console.log('Render Latency:', metrics.renderLatency);
```

## Next Steps

- [Object Detection Guide](./OBJECT_DETECTION.md)
- [AR Overlays Guide](./AR_OVERLAYS.md)
- [Gesture System Guide](./GESTURES.md)
- [Testing Guide](./TESTING.md)

## Support

- Review main [README](../README.md)
- Check [Task List](../../marvin-ar-task-list.md)
- Refer to [PRD](../../prd.md)

---

**Last Updated**: Phase 1 Foundation  
**Dev**: Dev 1 (AR Core)  
**Status**: Setup Complete

