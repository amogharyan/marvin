#!/bin/bash

###############################################################################
# Marvin AR - Lens Studio Project Setup Script
#
# This script creates the proper project structure for importing into
# Snap Lens Studio 5.13+
#
# Usage:
#   chmod +x setup-lens-studio.sh
#   ./setup-lens-studio.sh
#
# Or via npm:
#   npm run setup-lens-studio
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
LENS_STUDIO_DIR="$PROJECT_ROOT/LensStudioProject"
ASSETS_DIR="$LENS_STUDIO_DIR/Assets"
SCRIPTS_DIR="$ASSETS_DIR/Scripts"
PACKAGES_DIR="$LENS_STUDIO_DIR/Packages"
WORKSPACES_DIR="$LENS_STUDIO_DIR/Workspaces"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Marvin AR - Lens Studio Project Setup                    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

###############################################################################
# Step 1: Check Prerequisites
###############################################################################

echo -e "${YELLOW}[1/6] Checking prerequisites...${NC}"

# Check if source files exist
if [ ! -d "$PROJECT_ROOT/src" ]; then
    echo -e "${RED}Error: src/ directory not found${NC}"
    echo "Please run this script from the lens-studio directory"
    exit 1
fi

# Check if .esproj exists
if [ ! -f "$PROJECT_ROOT/MarvinAR.esproj" ]; then
    echo -e "${RED}Error: MarvinAR.esproj not found${NC}"
    echo "Please ensure the .esproj file exists in the lens-studio directory"
    exit 1
fi

echo -e "${GREEN}✓ Prerequisites checked${NC}"

###############################################################################
# Step 2: Create Directory Structure
###############################################################################

echo -e "${YELLOW}[2/6] Creating directory structure...${NC}"

# Clean existing directory if it exists
if [ -d "$LENS_STUDIO_DIR" ]; then
    echo -e "${YELLOW}  Removing existing LensStudioProject directory...${NC}"
    rm -rf "$LENS_STUDIO_DIR"
fi

# Create directory structure
mkdir -p "$SCRIPTS_DIR"
mkdir -p "$ASSETS_DIR/Materials"
mkdir -p "$ASSETS_DIR/Textures"
mkdir -p "$ASSETS_DIR/Models"
mkdir -p "$ASSETS_DIR/Icons"
mkdir -p "$ASSETS_DIR/Resources"
mkdir -p "$PACKAGES_DIR"
mkdir -p "$WORKSPACES_DIR"

echo -e "${GREEN}✓ Directory structure created${NC}"

###############################################################################
# Step 3: Copy TypeScript Source Files
###############################################################################

echo -e "${YELLOW}[3/6] Copying TypeScript source files...${NC}"

# Copy all TypeScript files preserving structure
echo "  Copying src/ → Scripts/"
cp -r "$PROJECT_ROOT/src"/* "$SCRIPTS_DIR/"

# Count files
TS_COUNT=$(find "$SCRIPTS_DIR" -name "*.ts" | wc -l | tr -d ' ')
echo -e "${GREEN}✓ Copied $TS_COUNT TypeScript files${NC}"

###############################################################################
# Step 4: Copy Project Configuration
###############################################################################

echo -e "${YELLOW}[4/6] Copying project configuration...${NC}"

# Copy .esproj file to LensStudioProject root
cp "$PROJECT_ROOT/MarvinAR.esproj" "$LENS_STUDIO_DIR/"

# Create basic scene file
cat > "$ASSETS_DIR/Scene.scene" << 'EOF'
{
  "name": "Marvin AR Main Scene",
  "version": "1.0.0",
  "description": "Main scene for Marvin AR Morning Assistant",
  "created": "2024-10-25",
  "objects": []
}
EOF

echo -e "${GREEN}✓ Project configuration copied${NC}"

###############################################################################
# Step 5: Create README for Lens Studio Import
###############################################################################

echo -e "${YELLOW}[5/6] Creating import instructions...${NC}"

cat > "$LENS_STUDIO_DIR/README.md" << 'EOF'
# Marvin AR - Lens Studio Project

This directory contains the ready-to-import Lens Studio project.

## How to Open in Lens Studio

1. **Open Lens Studio** (version 5.13 or higher)

2. **Open Project**:
   - File → Open Project
   - Navigate to this directory
   - Select `MarvinAR.esproj`
   - Click Open

3. **Verify Structure**:
   - Check Resources panel shows all Scripts
   - Assets folder contains all TypeScript files
   - Scene.scene is present

## Next Steps

Follow the comprehensive guide:
- **[LENS_STUDIO_GUIDE.md](../LENS_STUDIO_GUIDE.md)** - Complete setup instructions

### Quick Setup Checklist

After opening in Lens Studio:

- [ ] Add Camera component to scene
- [ ] Add Device Tracking component
- [ ] Add Object Tracking component
- [ ] Add ML Component (import object detection model)
- [ ] Add Hand Tracking component
- [ ] Add Scene Root object
- [ ] Add Script component to Scene Root
- [ ] Assign `Scripts/lens-studio-entry.ts` to Script component
- [ ] Wire all script inputs in Inspector
- [ ] Test in Preview mode
- [ ] Push to Spectacles device

## Project Structure

```
MarvinAR.esproj              # Project configuration
Assets/
  ├── Scripts/               # All TypeScript source files
  │   ├── lens-studio-entry.ts
  │   ├── main.ts
  │   ├── ObjectDetection/
  │   ├── AROverlays/
  │   ├── Gestures/
  │   └── types/
  ├── Scene.scene            # Main scene
  ├── Materials/             # Material assets (add as needed)
  ├── Textures/              # Texture files (add as needed)
  ├── Models/                # 3D models (add as needed)
  └── Icons/                 # UI icons (add as needed)
Packages/                    # External packages (.lspkg files)
Workspaces/                  # Lens Studio workspace settings
```

## Troubleshooting

**Scripts not appearing?**
- Refresh Resources panel (right-click → Refresh)
- Check file extensions are `.ts` or `.js`

**TypeScript errors?**
- Ensure Lens Studio version is 5.13+
- Check that all files in Scripts/ were copied

**Component wiring issues?**
- Follow the detailed guide in LENS_STUDIO_GUIDE.md
- Ensure all components exist in scene hierarchy

## Support

See parent directory documentation:
- [LENS_STUDIO_GUIDE.md](../LENS_STUDIO_GUIDE.md)
- [Setup Guide](../docs/SETUP.md)
- [README.md](../README.md)

---

**Generated by**: setup-lens-studio.sh
**Date**: 2024-10-25
**Project**: Marvin AR Morning Assistant
EOF

echo -e "${GREEN}✓ Import instructions created${NC}"

###############################################################################
# Step 6: Create Package Info
###############################################################################

echo -e "${YELLOW}[6/6] Creating package information...${NC}"

cat > "$PACKAGES_DIR/README.md" << 'EOF'
# Packages Directory

This directory is for Lens Studio package files (.lspkg).

## Required Packages (Optional)

Depending on your needs, you may want to add:

1. **Spectacles Interaction Kit**
   - Download from Lens Studio Asset Library
   - Or from: https://github.com/Snapchat/Spectacles-Sample

2. **LSTween** (Animation Library)
   - Usually included in sample projects
   - Provides smooth animations

## How to Add Packages

1. Download `.lspkg` file
2. In Lens Studio: Resources → Add Files
3. Select the `.lspkg` file
4. Package appears in this directory

## Current Packages

(None installed by default - add as needed)
EOF

echo -e "${GREEN}✓ Package information created${NC}"

###############################################################################
# Summary
###############################################################################

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✓ Lens Studio Project Setup Complete!                    ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Project Location:${NC}"
echo "  $LENS_STUDIO_DIR"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo ""
echo "  1. Open Lens Studio (version 5.13+)"
echo ""
echo "  2. Open project:"
echo "     File → Open Project"
echo "     Navigate to: $LENS_STUDIO_DIR"
echo "     Select: MarvinAR.esproj"
echo ""
echo "  3. Follow the complete setup guide:"
echo "     ${YELLOW}lens-studio/LENS_STUDIO_GUIDE.md${NC}"
echo ""
echo -e "${BLUE}Project Statistics:${NC}"
echo "  TypeScript files: $TS_COUNT"
echo "  Directory structure: ✓ Created"
echo "  Configuration: ✓ Ready"
echo ""
echo -e "${YELLOW}⚠ Important:${NC}"
echo "  - You still need to configure components in Lens Studio"
echo "  - Import your ML object detection model"
echo "  - Wire script inputs in the Inspector"
echo "  - Test thoroughly before deploying to device"
echo ""
echo -e "${GREEN}Happy building! 🚀${NC}"
echo ""

# Open the directory in file browser (optional, platform-specific)
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    echo -e "${BLUE}Opening project directory...${NC}"
    open "$LENS_STUDIO_DIR"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    if command -v xdg-open > /dev/null; then
        xdg-open "$LENS_STUDIO_DIR"
    fi
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    # Windows
    explorer "$LENS_STUDIO_DIR"
fi

exit 0
