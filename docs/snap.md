### Lens Studio - Getting Started Guide

Source: https://developers.snap.com/lens-studio/references/vfx-editor/nodes/functions/util/node_util_sticky

This section provides a 'Getting Started' guide for Lens Studio. It covers the initial steps required to begin developing lenses, including setup and basic concepts.

```JavaScript
Getting Started
```

--------------------------------

### Minimal Camera Kit Web SDK Integration

Source: https://developers.snap.com/camera-kit/integrate-sdk/web/web-configuration

A complete example demonstrating the basic setup for the Camera Kit Web SDK. It includes bootstrapping the SDK, creating a session, handling errors, setting up a media stream source, applying a Lens, and starting playback.

```JavaScript
import { boostrapCameraKit, createMediaStreamSource } from '@snap/camera-kit';

(async function main() {
  const apiToken =
    'Your API Token value copied from the SnapKit developer portal';
  const cameraKit = await bootstrapCameraKit({ apiToken });

  const canvas = document.getElementById('my-canvas');
  const session = await cameraKit.createSession({ liveRenderTarget: canvas });
  session.events.addEventListener('error', (event) => {
    if (event.detail.error.name === 'LensExecutionError') {
      console.log(
        'The current Lens encountered an error and was removed.',
        event.detail.error
      );
    }
  });

  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  const source = createMediaStreamSource(stream, {
    transform: Transform2D.MirrorX,
    cameraType: 'front',
  });
  await session.setSource(source);

  const lens = await cameraKit.lensRepository.loadLens(
    '<Lens ID>',
    '<Lens Group ID>'
  );
  await session.applyLens(lens);

  await session.play();
  console.log('Lens rendering has started!');
})();

main();
```

--------------------------------

### Spectacles Sync Kit: Example Files

Source: https://developers.snap.com/spectacles/spectacles-frameworks/spectacles-sync-kit/getting-started

Example TypeScript and JavaScript files demonstrating the features and components of the Spectacles Sync Kit. These serve as practical guides for developers.

```TypeScript
Examples
```

--------------------------------

### Snap Project Setup and Initialization

Source: https://developers.snap.com/lens-studio/4.55.1/references/templates/object/body/person-normals-and-depth

This snippet demonstrates the basic setup and initialization process for a Snap project. It outlines the necessary commands and configurations to get started.

```Shell
snap install project-name
cd project-name
snap start
```

--------------------------------

### Initialize System Configuration

Source: https://developers.snap.com/lens-studio/features/ar-tracking/world/world-templates/world-mesh

Initializes the system configuration by loading settings from a file. This is a fundamental step for starting any application or service.

```Shell
#!/bin/bash

CONFIG_FILE="/etc/app/config.conf"

if [ -f "$CONFIG_FILE" ]; then
  source "$CONFIG_FILE"
  echo "Configuration loaded successfully."
else
  echo "Error: Configuration file not found at $CONFIG_FILE."
  exit 1
fi
```

--------------------------------

### Minimal Extension Setup with Camera Kit

Source: https://developers.snap.com/camera-kit/integrate-sdk/web/guides/push-2-web

This code example shows the minimal setup for a Snap extension, integrating Push-to-Web with Camera Kit. It includes bootstrapping Camera Kit with an API token and creating a session, then subscribing to events.

```javascript
import { Push2Web } from '@snap/push2web';
import { bootstrapCameraKit } from '@snap/camera-kit';

const push2Web = new Push2Web();

const extensions = (container) => container.provides(push2Web.extension);
const cameraKit = await bootstrapCameraKit(
  {
    apiToken: '<API token from https://developer.snap.com/>',
  },
  extensions
);
const cameraKitSession = await cameraKit.createSession();

push2Web.subscribe(
  '<Login Kit access token>',
  cameraKitSession,
  cameraKit.lensRepository
);
```

--------------------------------

### Install Snap Package

Source: https://developers.snap.com/lens-studio/references/material-editor/nodes/inputs/engine/node_effect_global_bone_indices

This code example illustrates how to install a Snap package from the Snap Store. It covers the basic command used to fetch and install applications, ensuring all dependencies are met.

```bash
snap install <package-name>
```

--------------------------------

### Bash: Project Setup and Execution

Source: https://developers.snap.com/lens-studio/references/guides/lens-features/adding-interactivity/helper-scripts/behavior

Provides commands for setting up and running the project. It includes commands for navigating directories, creating virtual environments, installing dependencies, and running the application.

```Bash
cd /websites/developers_snap
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

--------------------------------

### Install Snap with Specific Track

Source: https://developers.snap.com/lens-studio/references/material-editor/nodes/inputs/engine/node_effect_global_bone_indices

This example shows how to install a Snap package and specify the track it should follow from the beginning.

```bash
snap install <package-name> --track=<track-name>
```

--------------------------------

### Install Snap Package

Source: https://developers.snap.com/lens-studio/4.55.1/references/material-editor/nodes/inputs/engine/node_effect_global_bone_indices

This code example illustrates how to install a Snap package from the Snap Store. It covers the basic command used to fetch and install applications, ensuring all dependencies are met.

```bash
snap install <package-name>
```

--------------------------------

### Bash: Project Setup and Execution

Source: https://developers.snap.com/lens-studio/4.55.1/references/guides/lens-features/adding-interactivity/helper-scripts/behavior

Provides commands for setting up and running the project. It includes commands for navigating directories, creating virtual environments, installing dependencies, and running the application.

```Bash
cd /websites/developers_snap
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

--------------------------------

### Install Camera Kit Web SDK using npm

Source: https://developers.snap.com/camera-kit/integrate-sdk/web/web-configuration

This command installs the Camera Kit Web SDK package from npm. It's the first step to integrating Snap's camera functionality into your web application.

```bash
npm install @snap/camera-kit
```

--------------------------------

### Run Development Server

Source: https://developers.snap.com/camera-kit/guides/tutorials/web-tutorials/camera-kit-web-for-beginners

Command to start the development server for the web application. This allows you to preview your Camera Kit integration in a browser.

```bash
npm run dev

```

--------------------------------

### Cloth Simulation Try-On Setup Guide

Source: https://developers.snap.com/lens-studio/4.55.1/references/templates/object/Try-On/cloth-simulation-try-on

This guide explains the common setup for the Cloth Simulation Try-On template. It involves using Object Tracking 3D for body tracking, Body Mesh for conforming clothes, Cloth Simulation for deformation, Physics Collider for guidance, and another Body Mesh for occlusion.

```English
The person is tracked with an `Object Tracking 3D` component for the body. A `Body Mesh` is used to conform the clothes to the body, and `Cloth Simulation` is used to deform the clothes based on the movement of the body. A `Physics Collider` is then used to guide the `cloth simulation` based on the body. Finally, a `Body Mesh` is used to occlude the part of the garment covered by the person.
```

--------------------------------

### Run Development Server

Source: https://developers.snap.com/camera-kit/integrate-sdk/web/guides/camera-kit-web-for-beginners

Command to start the development server for the web application. This allows you to preview your Camera Kit integration in a browser.

```bash
npm run dev

```

--------------------------------

### Spatial Image Setup Options

Source: https://developers.snap.com/spectacles/about-spectacles-features/apis/spatial-image

You can get started with Spatial Image by using the provided sample project in Lens Studio or by installing the custom component from the Asset Library. Ensure your project is set up for Spectacles and your simulation environment is configured accordingly.

```English
Setup your project so that it is built for Spectacles and your simulation environment is set to Spectacles
Once you have your environment setup, install the Spatial Image custom component through the Asset Library section under the Spectacles section.
```

--------------------------------

### Spectacles Interaction Kit Examples

Source: https://developers.snap.com/spectacles/about-spectacles-features/asset-library

This package offers examples for the Spectacles Interaction Kit (SIK), designed to help developers get started with Spectacles lens development. It is provided by Snap Inc.

```English
Spectacles Interaction Kit Examples
SIK
Snap Inc.
A package that provide SIK examples to get started with lens development.
```

--------------------------------

### Download Sample Code for Creative Kit and Login Kit

Source: https://developers.snap.com/snap-kit/home

This section provides access to sample code that facilitates integration with Snap's Creative Kit and Login Kit. These kits enable developers to leverage Snap's features within their applications.

```N/A
Download sample code to get started with Creative Kit and Login Kit.
```

--------------------------------

### 3D Body Tracking Component

Source: https://developers.snap.com/lens-studio/4.55.1/references/templates/interactive/cloth-simulation

This example shows the setup of the Object Tracking component for 3D body tracking. It includes mapping joints from the Collider Guides to the tracker.

```javascript
const bodyTracker = scene.getObjectByName('ObjectTracking');
const colliderGuides = scene.getObjectByName('ColliderGuides');

// Mapping a joint from Collider Guides to the tracker
bodyTracker.addJointMapping('Head', colliderGuides.getJoint('Head'));
```

--------------------------------

### Lens Studio Tutorial Navigation

Source: https://developers.snap.com/lens-studio/references/guides/getting-started

This snippet describes how to exit the Lens Studio tutorial or restart it. It includes keyboard shortcuts for exiting and the menu path to find the tutorial again.

```General
To exit the tutorial: CMD + W on Mac or CTRL + W on Windows.
To restart the tutorial: Select 'Start Tutorial' option in the 'Help' section of the top menu.
```

--------------------------------

### Get Public Profile by ID using Curl

Source: https://developers.snap.com/api/marketing-api/Public-Profile-API/GetStarted

Example request to retrieve a public profile's information using the Public Profile API's /public endpoints. This request does not require user authentication and uses a bearer token for authorization.

```curl
curl "https://businessapi.snapchat.com/public/v1/public_profiles/76da494b-76bc-4bbb-bb27-c5a66fb0d1ab" \
-H "Authorization: Bearer eyJpc3MiOiJodHRwczpcL1…upvJnQSoQ"
```

--------------------------------

### Go: Print "Hello, World!"

Source: https://developers.snap.com/lens-studio/4.55.1/references/templates/landmarker/download

A basic "Hello, World!" program in Go, showcasing the package and import statements required for output.

```Go
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}
```

--------------------------------

### Get Snap Installation Path

Source: https://developers.snap.com/lens-studio/4.55.1/references/vfx-editor/nodes/inputs/parameters/nodes_inputs_parameters_int

This command shows the installation path for a Snap package on the filesystem.

```bash
snap run --shell <package>
```

--------------------------------

### Get Snap Confinement Level

Source: https://developers.snap.com/lens-studio/references/material-editor/nodes/inputs/engine/node_effect_global_bone_indices

This example shows how to retrieve the current confinement level of an installed Snap package. Understanding confinement is essential for security and functionality.

```bash
snap list <snap-name> --all | grep confinement
```

--------------------------------

### Create Vite Project - npm create vite

Source: https://developers.snap.com/camera-kit/guides/tutorials/web-tutorials/camera-kit-web-for-beginners

This command initializes a new web project using Vite, a build tool for modern web development. It prompts the user to select a framework and variant, setting up the project structure.

```bash
npm create vite@latest
```

--------------------------------

### Get Snap Installation Path

Source: https://developers.snap.com/lens-studio/references/vfx-editor/nodes/inputs/parameters/nodes_inputs_parameters_int

This command shows the installation path for a Snap package on the filesystem.

```bash
snap run --shell <package>
```

--------------------------------

### Navigate and Install Dependencies - Vite Project

Source: https://developers.snap.com/camera-kit/guides/tutorials/web-tutorials/camera-kit-web-for-beginners

These commands are used after creating a Vite project. 'cd vite-project' changes the directory to the newly created project, 'code -a .' adds the project to the VS Code workspace, and 'npm install' installs all necessary project dependencies.

```bash
cd vite-project
```

```bash
code -a .
```

```bash
npm install
```

--------------------------------

### Control Material Properties with Scripts

Source: https://developers.snap.com/lens-studio/features/graphics/materials/material-editor/parameters-guide

This example shows how to access and modify material properties using scripts in Lens Studio. It demonstrates getting the initial value of a parameter and then updating it.

```JavaScript
//@input Asset.Material material  
print('Starting value: ' + script.material.mainPass.myIntParameter);
script.material.mainPass.myIntParameter = 1;
print('Changed value: ' + script.material.mainPass.myIntParameter);

```

--------------------------------

### Install Snap with Override Permissions

Source: https://developers.snap.com/lens-studio/references/material-editor/nodes/inputs/engine/node_effect_global_bone_indices

This example shows how to install a Snap package while overriding specific permission settings. This allows for fine-tuning access rights during installation.

```bash
snap install <package-name> --allow-failure
```

--------------------------------

### Get Snap Confinement Level

Source: https://developers.snap.com/lens-studio/4.55.1/references/material-editor/nodes/inputs/engine/node_effect_global_bone_indices

This example shows how to retrieve the current confinement level of an installed Snap package. Understanding confinement is essential for security and functionality.

```bash
snap list <snap-name> --all | grep confinement
```

--------------------------------

### Lens Studio Tutorial Navigation

Source: https://developers.snap.com/lens-studio/4.55.1/references/guides/getting-started

This snippet describes how to exit the Lens Studio tutorial or restart it. It includes keyboard shortcuts for exiting and the menu path to find the tutorial again.

```General
To exit the tutorial: CMD + W on Mac or CTRL + W on Windows.
To restart the tutorial: Select 'Start Tutorial' option in the 'Help' section of the top menu.
```

--------------------------------

### Navigate and Install Dependencies - Vite Project

Source: https://developers.snap.com/camera-kit/integrate-sdk/web/guides/camera-kit-web-for-beginners

These commands are used after creating a Vite project. 'cd vite-project' changes the directory to the newly created project, 'code -a .' adds the project to the VS Code workspace, and 'npm install' installs all necessary project dependencies.

```bash
cd vite-project
```

```bash
code -a .
```

```bash
npm install
```

--------------------------------

### Generate Authorization URL for Snapchat API

Source: https://developers.snap.com/api/marketing-api/Public-Profile-API/GetStarted

Example of constructing an authorization URL to initiate the OAuth 2.0 flow for accessing Snapchat's authorized endpoints. This URL is sent to creators for them to grant permissions.

```http
GET
https://accounts.snapchat.com/login/oauth2/authorize?response_type=code&client_id={your_client_id}&redirect_uri={your_redirect_uri}&scope=snapchat-profile-api&state={unique_state}
```

--------------------------------

### Request Access Token using Curl

Source: https://developers.snap.com/api/marketing-api/Public-Profile-API/GetStarted

Example cURL command to exchange an authorization code for an access token from Snapchat's token endpoint. This is a necessary step to authenticate requests to protected API endpoints.

```curl
curl -X POST \
-d "grant_type=authorization_code&code={authorization_code}&redirect_uri={your_redirect_uri}&client_id={your_client_id}&client_secret={your_client_secret}" \
https://accounts.snapchat.com/login/oauth2/token
```

--------------------------------

### Lens Studio Scan Examples: Environment Switch and Get Car Price

Source: https://developers.snap.com/lens-studio/features/lens-cloud/scan/scan-examples

This snippet describes two Scan examples: 'Environment Switch' for activating visuals based on environmental changes and 'Get Car Price' for displaying a car's price range. These examples showcase the versatility of the Scan function in AR applications.

```English
* **Environment Switch:** Activate visuals on environment changes
* **Get Car Price:** Shows scanned car and its price range on screen
```

--------------------------------

### Install Node.js using Homebrew

Source: https://developers.snap.com/snap-kit/login-kit/Tutorials/react-native

Installs Node.js, a JavaScript runtime environment, using Homebrew.

```bash
brew install node
```

--------------------------------

### Install Camera Kit Web SDK - npm install

Source: https://developers.snap.com/camera-kit/guides/tutorials/web-tutorials/camera-kit-web-for-beginners

This command installs the Snap Camera Kit Web SDK package using npm. This SDK provides the necessary tools to integrate Snap AR experiences into web applications.

```bash
npm install @snap/camera-kit
```

--------------------------------

### Style Transfer Example Guide

Source: https://developers.snap.com/lens-studio/features/snap-ml/snap-ml-templates/style-transfer

This guide explains how to use the Style Transfer example in SnapML. It covers the prerequisites for creating a style transfer model, including a style reference image, machine learning training code (with an example notebook provided), and a dataset like COCO. It also mentions adhering to dataset usage licenses.

```Python
# Example Python notebook for training a style transfer model
# This is a placeholder and would contain actual training code.

# Import necessary libraries (e.g., TensorFlow, Keras, NumPy)
# import tensorflow as tf
# from tensorflow import keras
# import numpy as np

# Load the style reference image and content image
# style_image = keras.preprocessing.image.load_img('path/to/style_image.jpg')
# content_image = keras.preprocessing.image.load_img('path/to/content_image.jpg')

# Preprocess images (resize, normalize, etc.)
# ...

# Define the model architecture (e.g., using a pre-trained VGG network)
# ...

# Define loss functions (content loss, style loss)
# ...

# Train the model
# model.fit(...)

# Save the trained model
# model.save('style_transfer_model.h5')

```

--------------------------------

### Control Material Parameters with Scripts

Source: https://developers.snap.com/lens-studio/4.55.1/references/guides/lens-features/graphics/materials/material-editor/parameters-guide

This example demonstrates how to access and modify material parameters using JavaScript in Snap's Lens Studio. It shows how to get and set an integer parameter named 'myIntParameter' through the material's mainPass property.

```javascript

//@input Asset.Material material  
print('Starting value: ' + script.material.mainPass.myIntParameter);
script.material.mainPass.myIntParameter = 1;
print('Changed value: ' + script.material.mainPass.myIntParameter);


```

--------------------------------

### Create Vite Project - npm create vite

Source: https://developers.snap.com/camera-kit/integrate-sdk/web/guides/camera-kit-web-for-beginners

This command initializes a new web project using Vite, a build tool for modern web development. It prompts the user to select a framework and variant, setting up the project structure.

```bash
npm create vite@latest
```

--------------------------------

### Snap Project Setup and Configuration

Source: https://developers.snap.com/lens-studio/references/material-editor/nodes/math/relational/nodes_math_trigonometry_xor

This snippet demonstrates the basic commands and configurations for setting up and managing a Snap project. It covers essential operations for project initialization and management.

```Bash
snap install core; snap refresh core
snap install snapcraft --classic
snapcraft init
snapcraft.yaml
```

--------------------------------

### CameraKit: Input Frame From Example 2

Source: https://developers.snap.com/reference/CameraKit/android/1.35.0/-camera-kit/com.snap.camerakit.lenses/-lenses-component/-carousel/-view/-event/-item-selected/equals

Example of how to get an input frame from a surface.

```Kotlin
inputFrameFrom(BackedBySurface)
```

--------------------------------

### Complete Camera Kit Web App Code

Source: https://developers.snap.com/camera-kit/integrate-sdk/web/guides/camera-kit-web-for-beginners

Combines all the necessary code snippets for initializing Camera Kit, setting up the session, handling the webcam stream, and applying a Lens into a single, runnable example.

```typescript
import { bootstrapCameraKit } from '@snap/camera-kit';

(async function () {
  const cameraKit = await bootstrapCameraKit({
    apiToken: '<YOUR_API_TOKEN>',
  });
  const liveRenderTarget = document.getElementById(
    'canvas'
  ) as HTMLCanvasElement;
  const session = await cameraKit.createSession({ liveRenderTarget });
  const mediaStream = await navigator.mediaDevices.getUserMedia({
    video: true,
  });

  await session.setSource(mediaStream);
  await session.play();

  const lens = await cameraKit.lensRepository.loadLens(
    '<YOUR_LENS_ID>',
    '<YOUR_LENS_GROUP_ID>'
  );

  await session.applyLens(lens);
})();

```

--------------------------------

### CameraKit: Input Frame From Example

Source: https://developers.snap.com/reference/CameraKit/android/1.35.0/-camera-kit/com.snap.camerakit.lenses/-lenses-component/-carousel/-view/-event/-item-selected/equals

Example of how to get an input frame from a surface texture.

```Kotlin
inputFrameFrom(BackedBySurfaceTexture)
```

--------------------------------

### Visual Scripting Overview - Snap for Developers

Source: https://developers.snap.com/lens-studio/4.55.1/references/visual-scripting/overview

This section provides an overview of Visual Scripting in Snap for Developers, explaining its purpose in creating logic and interactivity without code. It directs users to getting started videos, a quick overview, and examples of Lens logic created with Visual Scripting.

```Documentation
Visual Scripting allows you to create logic and interactivity in your Lens without requiring writing any code.

Learn about Visual Scripting, how to visually script with Script Graphs, and how to create your first Lens logic with it.

Read a quick overview about visual scripting and how to create your first script graph.

See different Lens logic made in the Visual Scripting template. See how you can connect it to Tween, Behavior, and more!
```

--------------------------------

### Complete Camera Kit Web App Code

Source: https://developers.snap.com/camera-kit/guides/tutorials/web-tutorials/camera-kit-web-for-beginners

Combines all the necessary code snippets for initializing Camera Kit, setting up the session, handling the webcam stream, and applying a Lens into a single, runnable example.

```typescript
import { bootstrapCameraKit } from '@snap/camera-kit';

(async function () {
  const cameraKit = await bootstrapCameraKit({
    apiToken: '<YOUR_API_TOKEN>',
  });
  const liveRenderTarget = document.getElementById(
    'canvas'
  ) as HTMLCanvasElement;
  const session = await cameraKit.createSession({ liveRenderTarget });
  const mediaStream = await navigator.mediaDevices.getUserMedia({
    video: true,
  });

  await session.setSource(mediaStream);
  await session.play();

  const lens = await cameraKit.lensRepository.loadLens(
    '<YOUR_LENS_ID>',
    '<YOUR_LENS_GROUP_ID>'
  );

  await session.applyLens(lens);
})();

```

--------------------------------

### Get Snap's Install Size

Source: https://developers.snap.com/lens-studio/4.55.1/references/vfx-editor/nodes/functions/lights/nodes_inputs_misc_light_color

This command shows the disk space occupied by an installed Snap package.

```Bash
snap list <snap-name> | awk '{print $3}'
```

--------------------------------

### Install Snap with Specific Track

Source: https://developers.snap.com/lens-studio/4.55.1/references/material-editor/nodes/inputs/engine/node_effect_global_bone_indices

This example shows how to install a Snap package and specify the track it should follow from the beginning.

```bash
snap install <package-name> --track=<track-name>
```

--------------------------------

### Initiate Authentication via Spectacles App

Source: https://developers.snap.com/spectacles/spectacles-frameworks/auth-kit/getting-started

Illustrates how to start the OAuth2 authorization process using the Spectacles App, retrieve an access token, and make authenticated API calls.

```TypeScript
try {
  // Start the OAuth2 authorization process through Spectacles App
  const token = await oauth.authorize('read write profile');

  if (token) {
    print('Successfully authorized via Spectacles App!');

    // Get access token for authenticated API calls
    const accessToken = await oauth.getAccessToken();

    // Make authenticated requests to your OAuth2 provider
    const response = await fetch('https://api.provider.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }
} catch (error) {
  print(`Authorization failed: ${error.message}`);
}
```

--------------------------------

### Install Camera Kit Web SDK - npm install

Source: https://developers.snap.com/camera-kit/integrate-sdk/web/guides/camera-kit-web-for-beginners

This command installs the Snap Camera Kit Web SDK package using npm. This SDK provides the necessary tools to integrate Snap AR experiences into web applications.

```bash
npm install @snap/camera-kit
```

--------------------------------

### Get Snap's Install Date

Source: https://developers.snap.com/lens-studio/4.55.1/references/vfx-editor/nodes/functions/lights/nodes_inputs_misc_light_color

This command retrieves the date when a specific Snap package was installed on the system.

```Bash
snap changes <snap-name> | grep 'Install' | tail -n 1
```

--------------------------------

### Ruby: Print "Hello, World!"

Source: https://developers.snap.com/lens-studio/4.55.1/references/templates/landmarker/download

A concise Ruby program to print "Hello, World!" to the standard output.

```Ruby
puts "Hello, World!"
```

--------------------------------

### Beat Sync Component Setup in Lens Studio

Source: https://developers.snap.com/lens-studio/features/audio/beat-sync

This guide explains how to install and set up the Beat Sync custom component in Lens Studio. It involves adding the component to a scene, assigning an audio track, configuring triggers, and defining responses for beat-synchronized effects.

```Lens Studio
1. Add the Beat Sync component to a scene object.
2. Assign the downloaded Audio Track to the component.
3. Configure trigger inputs (OnBeat, OnDownBeat, specific beat indices).
4. Add responses for each trigger (behaviors, scripts, or property changes).
```

--------------------------------

### Get Delta Start Position

Source: https://developers.snap.com/lens-studio/api/lens-scripting/classes/Packages_SpectaclesInteractionKit_Core_Interactor_BaseInteractor

Returns the delta start position from the previous frame.

```TypeScript
get deltaStartPosition(): vec3
```

--------------------------------

### Lens Studio Overview - Getting Started

Source: https://developers.snap.com/lens-studio/references/material-editor/nodes/inputs/engine/node_effect_global_time_elapsed

This section provides an introduction to Lens Studio and its capabilities. It covers the initial steps for new users, including downloading the software and understanding its core features.

```Lens Studio
Getting Started
```

--------------------------------

### Install Snap with Specific Options

Source: https://developers.snap.com/lens-studio/4.55.1/references/vfx-editor/nodes/inputs/parameters/nodes_inputs_parameters_int

This command demonstrates installing a Snap package with additional options, such as `--classic` for broader system access.

```bash
snap install <package> --classic
```

--------------------------------

### Snapchat Access Token Response Example

Source: https://developers.snap.com/api/marketing-api/Public-Profile-API/GetStarted

This JSON object represents a successful response when generating an access token. It includes the `access_token` for API requests, `token_type` (usually 'Bearer'), `expires_in` (in seconds), a `refresh_token` for obtaining new access tokens, and the granted `scope`.

```json
{
  "access_token": "eyJpc3MiOiJodHRwczpcL1...TruHKTAUIh2XMxWvapkbyw",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "hCgwKCjE3MTAxODAwMTUS...JWAer2MQWUbHiyItFSav-M",
  "scope": "snapchat-profile-api"
}
```

--------------------------------

### Object Detection Example - ML Component

Source: https://developers.snap.com/lens-studio/features/snap-ml/snap-ml-templates/object-detection

This example demonstrates how to use the ML Component in SnapML for object detection. It allows placing UI elements corresponding to detected object bounding boxes. The guide covers importing pre-existing models or using provided examples for cars and food.

```English
This example allows you to instantiate and place UI elements on the screen corresponding to the bounding boxes of objects belonging to a specific class, as identified by a Machine Learning model's output.

If you already have an object detection model, you can skip down to the Importing Your Model section below. You can skip to the Customizing Your Lens Experience section if you’d like to use the example car or food detection.

While the example comes with a car detection and food detection example model for the ML Component, you can make any kind of object detection by importing your own machine learning model. We’ll go through an example of what this might look like below.

To learn more about Machine Learning and Lens Studio, take a look at the ML Overview page.

To create a model, you will need:
* Machine learning training code: code that describes how the model is trained (this is sometimes referred to as a notebook). Please find our example notebook here.
* Data set: collection of data that our code will use to learn from (in this case we will use the COCO data set).

This dataset comes with a couple examples of classes that you can swap. Also the provided training notebook uses a generalized classes that consist of couple more specific classes in order to perform better on the particular dataset
```

--------------------------------

### Start Camera Session and Apply Lens in Swift

Source: https://developers.snap.com/camera-kit/integrate-sdk/ios/tutorials/building-your-first-ios-camera-kit-app

This code initializes and starts the camera session, configures touch handling, adds the preview view output, and sets up AR input. It also asynchronously starts the session running.

```Swift
previewView.automaticallyConfiguresTouchHandler = true
cameraKit.add(output: previewView)

let sessionInput = AVSessionInput(session: captureSession)
let arInput = ARSessionInput()
cameraKit.start(input: sessionInput, arInput: arInput)

DispatchQueue.global(qos: .utility).async {
    sessionInput.startRunning()
}
```

--------------------------------

### Get Delta Start Position

Source: https://developers.snap.com/lens-studio/api/lens-scripting/classes/Packages_SpectaclesInteractionKit_Core_MobileInteractor_MobileInteractor

Returns the delta start position from the previous frame. Inherited from BaseInteractor.

```TypeScript
get deltaStartPosition(): vec3
```

--------------------------------

### Get Delta Start Position

Source: https://developers.snap.com/lens-studio/api/lens-scripting/classes/Packages_SpectaclesInteractionKit_Core_HandInteractor_HandInteractor

Retrieves the delta start position from the previous frame.

```TypeScript
get deltaStartPosition(): vec3
// Returns the delta start position from previous frame
// Inherited from BaseInteractor.deltaStartPosition
```

--------------------------------

### Snap Project Initialization (Bash)

Source: https://developers.snap.com/lens-studio/4.55.1/references/guides/general/toolbar-and-shortcuts

This snippet demonstrates how to initialize a new Snap project using the command line. It outlines the basic steps required to set up the project structure.

```Bash
snap init /websites/developers_snap
cd /websites/developers_snap
```

--------------------------------

### Get Pixel Custom Conversions Example Response

Source: https://developers.snap.com/api/marketing-api/Ads-API/custom-conversions

An example response from the 'Get Pixel Custom Conversions' endpoint, illustrating the structure of the returned data, including request status, ID, and details of the custom conversions found.

```json
{
    "request_status": "SUCCESS",
    "request_id": "c33aa2b9-632a-4bf8-978c-c3f51ec911d8",
    "paging": {},
    "custom_conversions": [
        {
            "sub_request_status": "SUCCESS",
            "custom_conversion": {
                "id": "1234567891",
                "event_source": {
                "id": "a9650421-b387-4681-8954-a7c754627df6",
                "type": "PIXEL"
                },
                "name": "Some Conversion Name",
                "description": "Some optional description",
                "event_type": "PURCHASE",
                "rules": [
                {
                    "key": "EVENT_TAG",
                    "values": ["tag-1"],
                    "operator": "I_CONTAINS"
                }
                ]
            }
        }
    ]
}
```

--------------------------------

### Deploying a Website

Source: https://developers.snap.com/lens-studio/publishing/distributing/unlocking-lenses

This example provides a basic command for deploying a website. Deployment procedures can vary significantly based on the hosting environment and deployment strategy.

```bash
rsync -avz --delete ./dist/ user@your_server:/path/to/website/
```

--------------------------------

### Bash Script for Project Setup

Source: https://developers.snap.com/lens-studio/4.55.1/references/templates/object/Try-On/necklace-try-on

This snippet demonstrates a basic Bash script for setting up the project environment. It includes commands for creating directories and initializing configurations.

```Bash
mkdir -p /websites/developers_snap/src
mkdir -p /websites/developers_snap/tests
cp config.example.yaml /websites/developers_snap/config.yaml
```

--------------------------------

### Snapchat Refresh Token Response Example

Source: https://developers.snap.com/api/marketing-api/Public-Profile-API/GetStarted

This JSON object shows a typical response after refreshing an access token. It contains a new `access_token`, `token_type`, `expires_in` duration, and an updated `refresh_token`. This allows continued access to the Snapchat API without requiring the user to re-authenticate.

```json
{
  "access_token": "eyJpc3MiOiJodHRwczpcL1...upvJnQSoQ",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "hCgwKCjE3MTAxODA...wMTUSowFTK173WIy",
  "scope": "snapchat-profile-api"
}
```

--------------------------------

### Install Snap with Override Revision

Source: https://developers.snap.com/lens-studio/references/material-editor/nodes/inputs/engine/node_effect_global_bone_indices

This example shows how to install a Snap package and override its revision number. This is typically used for installing a specific older version.

```bash
snap install <package-name> --revision=<revision-number>
```

--------------------------------

### Snapcraft YAML configuration example

Source: https://developers.snap.com/lens-studio/lens-studio-workflow/lens-studio-interface/toolbar-and-shortcuts

An example of a snapcraft.yaml file, which defines the metadata and build instructions for a snap. It includes the name, version, summary, and details of the snap, as well as the parts and their build commands.

```yaml
name: my-snap
version: '1.0'
summary: A simple example snap
description: |
  This is a longer description of my snap.
  It can span multiple lines.

architecture: all
base: core20
confinement: strict

parts:
  my-app:
    plugin: nil
    source: .
    build-commands:
      - echo "Building my-app"

apps:
  my-app:
    command: usr/bin/my-command

```

--------------------------------

### Install and Refresh Core Snap

Source: https://developers.snap.com/lens-studio/4.55.1/references/visual-scripting/nodes/Basic%20Inputs/vec2_output

This bash script installs the 'core' snap if it's not already present and then refreshes it to the latest version. This is a common setup step for Snap-based systems.

```bash
snap install core; snap refresh core
```

--------------------------------

### Deploy Application

Source: https://developers.snap.com/lens-studio/features/ar-tracking/world/world-templates/world-mesh

Deploys the application to a target environment. This script automates the deployment process, including building and starting services.

```Shell
#!/bin/bash

APP_NAME="my-web-app"
TARGET_ENV="production"

echo "Building application..."
# npm run build or similar command

echo "Deploying to $TARGET_ENV..."
# scp -r build/ user@$TARGET_ENV:/path/to/deploy

echo "Starting application service..."
# systemctl start $APP_NAME or similar command

echo "Deployment complete."
```

--------------------------------

### Install Snap with Custom Store

Source: https://developers.snap.com/lens-studio/references/material-editor/nodes/inputs/engine/node_effect_global_bone_indices

This example shows how to install a Snap package from a custom Snap Store repository. This is useful for private or internal Snap distributions.

```bash
snap install <package-name> --channel=<channel> --from=<store-url>
```

--------------------------------

### Python: Create a Simple Web Server

Source: https://developers.snap.com/lens-studio/4.55.1/references/templates/audio/audio-analyzer

This Python snippet sets up a basic HTTP server using the `http.server` module. It serves files from the current directory on port 8000. Run this script in the directory you want to serve.

```Python
import http.server
import socketserver

PORT = 8000
Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(('', PORT), Handler) as httpd:
  print(f'Serving at port {PORT}')
  httpd.serve_forever()
```

--------------------------------

### Get Start Point

Source: https://developers.snap.com/lens-studio/api/lens-scripting/classes/Packages_SpectaclesInteractionKit_Core_MouseInteractor_MouseInteractor

Returns the starting point of the interactor's ray. This property overrides the BaseInteractor.startPoint.

```TypeScript
get startPoint(): vec3
```

--------------------------------

### Bootstrap Camera Kit SDK

Source: https://developers.snap.com/camera-kit/integrate-sdk/web/web-configuration

Initializes the Camera Kit Web SDK by downloading the WebAssembly runtime and configuring it with an API token. This is the first step before rendering Lenses.

```JavaScript
import { bootstrapCameraKit } from '@snap/camera-kit';

(async function main() {
  const apiToken = 'Your API Token value copied from the My Lenses';
  const cameraKit = await bootstrapCameraKit({ apiToken });
})();

```

--------------------------------

### Initialize Camera Kit Session (Kotlin)

Source: https://developers.snap.com/camera-kit/integrate-sdk/android/android-configuration

Creates a Camera Kit Session, connecting an image processor source and attaching it to a ViewStub for rendering the camera preview.

```Kotlin
var cameraKitSession = Session(context = this) {  
    imageProcessorSource(imageProcessorSource)  
    attachTo(findViewById(R.id.camera_kit_stub))  
}  
```

--------------------------------

### Register for Snapchat Login State Updates (JavaScript)

Source: https://developers.snap.com/snap-kit/login-kit/Tutorials/react-native

This JavaScript example shows how to register for real-time updates on the user's login state with Snapchat. It uses DeviceEventEmitter to listen for events like login started, succeeded, failed, and logout, allowing your app to react dynamically.

```JavaScript
const eventCallbackLoginStarted = () => {
  // Handle event emitted
};

const eventCallbackLoginSucceeded = () => {
  // Handle event emitted
};

const eventCallbackLoginFailed = () => {
  // Handle event emitted
};

const eventCallbackLogout = () => {
  // Handle event emitted
};

// Subscribing to events
const loginStartedListener = DeviceEventEmitter.addListener(
  LoginState.LOGIN_KIT_LOGIN_STARTED,
  eventCallbackLoginStarted
);

const loginSucceededListener = DeviceEventEmitter.addListener(
  LoginState.LOGIN_KIT_LOGIN_SUCCEEDED,
  eventCallbackLoginSucceeded
);

const loginFailedListener = DeviceEventEmitter.addListener(
  LoginState.LOGIN_KIT_LOGIN_FAILED,
  eventCallbackLoginFailed
);

const logoutListener = DeviceEventEmitter.addListener(
  LoginState.LOGIN_KIT_LOGOUT,
  eventCallbackLogout
);

// Unsubscribing to events
loginStartedListener.removeListener();
loginSucceededListener.removeListener();
loginFailedListener.removeListener();
logoutListener.removeListener();

```

--------------------------------

### Bash Script for Project Setup

Source: https://developers.snap.com/lens-studio/4.55.1/references/guides/publishing/configuring/configuring-project-info

This snippet demonstrates a basic bash script for setting up the Snap project environment. It includes commands for navigating directories and potentially initializing project files.

```bash
cd /websites/developers_snap
# Further setup commands would follow here
```

--------------------------------

### Set Particle Color from Texture (Snap Graph)

Source: https://developers.snap.com/lens-studio/4.55.1/references/templates/world/vfx

This example shows how to sample colors from a texture based on particle attributes and apply them to the particles. It uses a 'Texture 2D Object Parameter' to get colors and the 'Modify Attribute (Set Color)' node to update particle colors.

```Snap Graph
// Conceptual representation of Snap Graph nodes:
// Texture 2D Object Parameter -> Modify Attribute (Set Color)
```

--------------------------------

### Snap Project Structure and Initialization

Source: https://developers.snap.com/lens-studio/4.55.1/references/templates/landmarker/download

This snippet outlines the basic structure of the Snap project and its initialization process. It includes file paths and potentially configuration details relevant to setting up the project environment.

```text
Project: /websites/developers_snap
```

--------------------------------

### Install Yarn using Homebrew

Source: https://developers.snap.com/snap-kit/login-kit/Tutorials/react-native

Installs Yarn, a JavaScript package manager, using Homebrew.

```bash
brew install yarn
```

--------------------------------

### Text To Speech Template Guide

Source: https://developers.snap.com/lens-studio/4.55.1/references/templates/audio/text-to-speech

This snippet describes the Text To Speech template's guide section, which showcases three distinct examples of using Text To Speech functionality. These examples include generating greetings based on location and weather, creating audio from button selections, and applying different voice styles contextually.

```English
The template has three different examples shows how to use Text To Speech:
  * **Greeting Example:** Generating a simple greeting Text To Speech audio based on location and weather information.
  * **Feeling Example:** Generating a Text To Speech audio based on the button selection.
  * **Automatic Voice Style Example:** Generating a Text To Speech audio with different voice styles based on the context.

When we open the template, we can find the examples in the `Objects panel`.
```

--------------------------------

### C++: Print "Hello, World!"

Source: https://developers.snap.com/lens-studio/4.55.1/references/templates/landmarker/download

This C++ code prints "Hello, World!" to the console using the iostream library. It's a fundamental example for C++ beginners.

```C++
#include <iostream>

int main() {
    std::cout << "Hello, World!\n";
    return 0;
}
```

--------------------------------

### Initialize Snap Project

Source: https://developers.snap.com/lens-studio/4.55.1/references/templates/interactive/cloth-simulation

This snippet demonstrates how to initialize a new Snap project. It typically involves setting up the project directory and configuration files.

```Bash
snap init my_project
cd my_project
```

--------------------------------

### Get Hash Code - CameraKit

Source: https://developers.snap.com/reference/CameraKit/android/1.35.0/-camera-kit/com.snap.camerakit.lenses/-lenses-component/-remote-api-service/-request/hash-code

Example of how to get the hash code for an object in CameraKit. This is a standard method for object identity.

```Kotlin
open override fun hashCode(): Int
```

--------------------------------

### Get Snap Install Size

Source: https://developers.snap.com/lens-studio/examples/lens-examples/quiz-template

This snippet demonstrates how to view the disk space used by an installed Snap package.

```bash
snap list --size package-name
```

--------------------------------

### Initialize System Component with JavaScript

Source: https://developers.snap.com/lens-studio/references/guides/lens-features/scene-set-up/2d/screen-region-device-simulation

This JavaScript code snippet shows how to initialize a system component. It typically involves setting up configurations and starting services. It might depend on external libraries like Node.js modules.

```JavaScript
class SystemComponent {
    constructor(config) {
        this.config = config;
        this.isRunning = false;
    }

    start() {
        console.log('Starting system component...');
        // Initialize services based on this.config
        this.isRunning = true;
        console.log('System component started.');
    }

    stop() {
        console.log('Stopping system component...');
        // Clean up resources
        this.isRunning = false;
        console.log('System component stopped.');
    }
}

// Example usage:
// const componentConfig = { port: 8080 };
// const myComponent = new SystemComponent(componentConfig);
// myComponent.start();
```

--------------------------------

### Initialize Snap Project

Source: https://developers.snap.com/lens-studio/references/material-editor/nodes/inputs/shader/node_input_shader_instance_ratio

This snippet demonstrates how to initialize a new Snap project. It typically involves setting up the project structure and basic configuration files. This is often the first step in developing with Snap.

```Bash
snap init project-name
cd project-name
```

--------------------------------

### Get LineRenderer Start Width

Source: https://developers.snap.com/lens-studio/api/lens-scripting/classes/Packages_SpectaclesInteractionKit_Components_Interaction_InteractorLineVisual_InteractorLineRenderer

Retrieves the width of the line at its start. This property returns a number and is inherited from the base LineRenderer class.

```typescript
get startWidth(): number
```

--------------------------------

### Install Snap with Override Confinement

Source: https://developers.snap.com/lens-studio/references/material-editor/nodes/inputs/engine/node_effect_global_bone_indices

This example shows how to install a Snap package and override its confinement settings, potentially allowing broader access for development purposes.

```bash
snap install <package-name> --devmode
```

--------------------------------

### Managing Project Configurations

Source: https://developers.snap.com/lens-studio/publishing/distributing/unlocking-lenses

This example shows how to manage project configurations, which might involve editing configuration files or using command-line tools to set parameters. The specific commands depend on the project's setup.

```bash
nano project_config.json
# or
./manage.py set_setting --key=some_key --value=some_value
```

--------------------------------

### Get LineRenderer Start Color

Source: https://developers.snap.com/lens-studio/api/lens-scripting/classes/Packages_SpectaclesInteractionKit_Components_Interaction_InteractorLineVisual_InteractorLineRenderer

Retrieves the color of the line at its start. This property returns a vec4 and is inherited from the base LineRenderer class.

```typescript
get startColor(): vec4
```

--------------------------------

### Snap Project Setup for Screen Recording

Source: https://developers.snap.com/lens-studio/lens-studio-workflow/previewing-your-lens

This command sets up the Snap project directory for screen recording functionalities. It navigates to the specified project path.

```bash
cd /websites/developers_snap
```

--------------------------------

### Tutorial: Building Your First Lens

Source: https://developers.snap.com/lens-studio/download/release-notes

A beginner-friendly tutorial designed to guide new users through the process of creating their first AR lens using Lens Studio. It covers fundamental concepts and workflows.

--------------------------------

### Install Snap with Override Revision

Source: https://developers.snap.com/lens-studio/4.55.1/references/material-editor/nodes/inputs/engine/node_effect_global_bone_indices

This example shows how to install a Snap package and override its revision number. This is typically used for installing a specific older version.

```bash
snap install <package-name> --revision=<revision-number>
```

--------------------------------

### Install Snap with Override Permissions

Source: https://developers.snap.com/lens-studio/4.55.1/references/material-editor/nodes/inputs/engine/node_effect_global_bone_indices

This example shows how to install a Snap package while overriding specific permission settings. This allows for fine-tuning access rights during installation.

```bash
snap install <package-name> --allow-failure
```

--------------------------------

### Snap Project Structure and Code Examples

Source: https://developers.snap.com/lens-studio/references/guides/lens-features/scene-set-up/2d/pixel-accurate-rendering

This snippet outlines the general structure of the Snap project and provides examples of code used within it. It serves as a starting point for understanding the project's implementation details.

```bash
Project: /websites/developers_snap
```

--------------------------------

### Minimal Camera Kit Web SDK Integration

Source: https://developers.snap.com/reference/CameraKit/web/1.2.0/index

A complete example demonstrating the minimal integration of the Camera Kit Web SDK. It includes bootstrapping CameraKit with an API token, creating a session with a render target, setting up an error listener, getting a media stream, creating a media stream source, loading and applying a Lens, and starting the session playback.

```javascript
import { boostrapCameraKit, createMediaStreamSource } from "@snap/camera-kit";

(async function main() {
    const apiToken = "Your API Token value copied from the SnapKit developer portal";
    const cameraKit = await bootstrapCameraKit({ apiToken });

    const canvas = document.getElementById("my-canvas");
    const session = await cameraKit.createSession({ liveRenderTarget: canvas });
    session.events.addEventListener('error', (event) => {
      if (event.detail.error.name === 'LensExecutionError') {
        console.log('The current Lens encountered an error and was removed.', event.detail.error);
      }
    });

    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const source = createMediaStreamSource(stream, { transform: Transform2D.MirrorX, cameraType: 'user' });
    await session.setSource(source);

    const lens = await cameraKit.lensRepository.loadLens("<Lens ID>", "<Lens Group ID>");
    await session.applyLens(lens);

    await session.play();
    console.log("Lens rendering has started!");
})();

main();
```

### Start VoiceML Listening on Enabled Event in JavaScript

Source: https://developers.snap.com/lens-studio/api/editor-scripting/documents/Full_API_List.html/lens-scripting/classes/Built-In.VoiceMLModule

This JavaScript example demonstrates how to start the VoiceML listening session (startListening) once microphone permissions are granted and the module is enabled, by adding a callback to onListeningEnabled.

```JavaScript
//@input Asset.VoiceMLModule vmlModule
var onListeningEnabledHandler = function(){
    script.vmlModule.startListening(options);
}
script.vmlModule.onListeningEnabled.add(onListeningEnabledHandler);
```

--------------------------------

### Example: Managing Mapping Sessions and Location Storage

Source: https://developers.snap.com/lens-studio/api/editor-scripting/documents/Full_API_List.html/lens-scripting/classes/Built-In.MappingSession

Demonstrates how to create and manage a `MappingSession` using `LocatedAtComponent` to map physical locations. It covers starting a session, handling mapped locations, storing them in cloud storage, retrieving previous locations, and controlling session progress and throttling.

```JavaScript
// Have a frame of reference to where
// tracking starting in the session
// LocationAsset returns a label for the co-ordinate frame
var worldOriginLocationAsset = LocationAsset.getAROrigin();

worldOriginLocatedAt = global.scene.createSceneObject("AR Origin").createComponent("LocatedAtComponent");

// LocatedAtComponent
worldOriginLocatedAt.location = worldOriginLocationAsset;

// MAP NEW LOCATION + GET STORE FOR IT

// Start mapping the space of the user
var options = LocatedAtComponent.createMappingOptions();
options.locationCloudStorageModule = locationCloudStorageModule;
options.location = worldOriginLocationAsset;

mappingSession = LocatedAtComponent.createMappingSession(options);

mappingSession.onMapped.add((location) => {
   // we _can_ use location if we like - it is now a persisted private custom
   // location and has the same coordinate frame as worldOriginLocationAsset
   currentLocationLocatedAt.location = location;

   locationCloudStorageModule.storeLocation(
       location,
       (locationId) => {
          // cloud storage is not associated with locations but can store strings
          // locationCloudStorageModule has privacy model for location <-> string.
          cloudStorage.putString("previous-location",
                                 locationId);
      },
      (errorString) => {
          print("failed to obtain persistent id for location: " + errorString);
      });

    var options = LocationCloudStorageOptions.create();
    options.location = location;
    options.onDiscoveredNearby.add((store) => {
        //store code here
    });

    options.onError.add((error) => {
        //error code here
    });

    // get store and use it
    locationCloudStorageModule.getNearbyLocationStores(options);

   ...

   // Mapping will continue; can be cancelled or throttled here
});

...

// Progress towards map being of acceptable quality (ie canCheckpoint going true)
print(mappingSession.quality);           // 0 -> 1
print(mappingSession.canCheckpoint);     // == (quality >= 1)

// force onMapped to be fired immediately
// can be called 'early' once canCheckpoint goes true
mappingSession.checkpoint();             // error to call with
                                         // canCheckpoint == false

print(mappingSession.capacityUsed);      // 0 -> 1
                                         // when ==1 onMapped is fired
                                         // quality guaranteed >=1 at
                                         // that point

...

mappingSession.setThrottling(MappingSession.Auto);
//                or    (MappingSession.MappingThrottling.Foreground)
//                or    (MappingSession.MappingThrottling.Background)
//                or    (MappingSession.MappingThrottling.Off)

... or
mappingSession.cancel();

...

// concurrently with creating a new map

function onPreviousLocationRetrieved(previousLocationAsset) {
    // TRACKING PREVIOUS + GETTING STORES FOR PREVIOUS
    previousLocationLocatedAt.location = previousLocationAsset;
    previousLocationLocatedAt.onFound.add(() => {
        // Cancel new location mapping
        mappingSession.cancel();

        // we could switch to incremental by creating a new mapping session here
        // using previousLocationAsset

        ...

        var options = LocationCloudStorageOptions.create();
        options.location = previousLocationAsset;
        options.onDiscoveredNearby.add((store) => {
            //store code here
        });

        options.onError.add((error) => {
            //error code here
        });

        // get a store for the tracked location
        locationCloudStorageModule.getNearbyLocationStores(options);
    });
};

function onError(errorString) {
    print("could not retrieve previous location: " + errorString);
};

// use some other means of storage to retrieve a previously stored location id
var previousLocationId = cloudStorage.getString("previous-location");

locationCloudStorageModule.retrieveLocation(
                                previousLocationId,
                                onPreviousLocationRetrieved,
                                onError);
```

--------------------------------

### Configure and Process VoiceML Module Events and Responses

Source: https://developers.snap.com/lens-studio/api/editor-scripting/documents/Full_API_List.html/lens-scripting/classes/Built-In.VoiceMLModule

This JavaScript code snippet showcases the complete setup and event handling for the VoiceML module in Snap Lens Studio. It details the creation of listening options, including speech recognizer selection, ASR transcription settings, and the addition of custom speech contexts. The snippet further demonstrates how to define and apply NLP keyword and intent models. Crucially, it includes functions for starting and stopping the listening process, a utility for mapping VoiceML error codes to human-readable messages, and robust parsing logic for both keyword and command recognition responses, illustrating how to extract and process the output from the VoiceML system.

```javascript
//@input Asset.VoiceMLModule vmlModule {"label": "Voice ML Module"}
//@input Asset.AudioTrackAsset audioTrack

var options = VoiceML.ListeningOptions.create();
options.speechRecognizer = VoiceMLModule.SpeechRecognizer.Default;

//General Option
options.shouldReturnAsrTranscription = true;
options.shouldReturnInterimAsrTranscription = true;

//Speech Context
var phrasesOne = ["carrot", "tomato"];
var boostValueOne = 5;
options.addSpeechContext(phrasesOne,boostValueOne);

var phrasesTwo = ["orange", "apple"];
var boostValueTwo = 6;
options.addSpeechContext(phrasesTwo,boostValueTwo);

//NLPKeywordModel
var nlpKeywordModel = VoiceML.NlpKeywordModelOptions.create();
nlpKeywordModel.addKeywordGroup("Vegetable", ["carrot", "tomato"]);
nlpKeywordModel.addKeywordGroup("Fruit", ["orange", "apple"]);

//Command
var nlpIntentModel = VoiceML.NlpIntentsModelOptions.create("VOICE_ENABLED_UI");
nlpIntentModel.possibleIntents =  ["next", "back", "left", "right", "up", "down", "first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth"];
options.nlpModels =[nlpKeywordModel, nlpIntentModel];

var onListeningEnabledHandler = function() {
    script.vmlModule.startListening(options);
};
var onListeningDisabledHandler = function() {
    script.vmlModule.stopListening();
};

var getErrorMessage = function(response) {
    var errorMessage = "";
    switch (response) {
        case "#SNAP_ERROR_INDECISIVE":
            errorMessage = "indecisive";
            break;
        case "#SNAP_ERROR_INCONCLUSIVE":
            errorMessage = "inconclusive";
            break;
        case "#SNAP_ERROR_NONVERBAL":
            errorMessage = "non verbal";
            break;
        case "#SNAP_ERROR_SILENCE":
            errorMessage = "too long silence";
            break;
        default:
        if (response.includes("#SNAP_ERROR")) {
            errorMessage = "general error";
        } else {
            errorMessage = "unknown error";
        }
    }
    return errorMessage;
};

var parseKeywordResponses = function(keywordResponses) {
    var keywords = [];
    var code = "";
    for (var kIterator = 0; kIterator < keywordResponses.length; kIterator++) {
        var keywordResponse = keywordResponses[kIterator];

        switch (keywordResponse.status.code) {
            case VoiceMLModule.NlpResponsesStatusCodes.OK:
                code= "OK";
                for (var keywordsIterator = 0; keywordsIterator < keywordResponse.keywords.length; keywordsIterator++) {
                    var keyword = keywordResponse.keywords[keywordsIterator];
                    if (keyword.includes("#SNAP_ERROR")) {
                        var errorMessage = getErrorMessage(keyword);
                        print("Keyword Error: " + errorMessage);
                        break;
                    }
                    keywords.push(keyword);
                }
                break;
            case VoiceMLModule.NlpResponsesStatusCodes.ERROR:
                code = "ERROR";
                print("Status Code: "+code+ " Description: " + keywordResponse.status.code.description);
                break;
            default:
                print("Status Code: No Status Code");
        }
    }
    return keywords;
};

var parseCommandResponses = function(commandResponses) {
    var commands = [];
    var code = "";
    for (var iIterator = 0; iIterator < commandResponses.length; iIterator++) {
        var commandResponse = commandResponses[iIterator];
        switch (commandResponse.status.code) {
            case VoiceMLModule.NlpResponsesStatusCodes.OK:
                code= "OK";
                var command = commandResponse.intent;
                if (command.includes("#SNAP_ERROR")) {
                    var errorMessage = getErrorMessage(command);
                    print("Command Error: " + errorMessage);
                    break;
                }
                commands.push(commandResponse.intent);
                break;
            case VoiceMLModule.NlpResponsesStatusCodes.ERROR:
                code = "ERROR";
                print("Status Code: "+code+ " Description: " + commandResponse.status.code.description);
                break;
            default:
                print("Status Code: No Status Code");
        }
    }
    return commands;
};

var onUpdateListeningEventHandler = function(eventArgs) {
    if (eventArgs.transcription.trim() == "") {
        return;
    }
    print("Transcription: " + eventArgs.transcription);

    if (!eventArgs.isFinalTranscription) {
        return;
    }
    print("Final Transcription: " + eventArgs.transcription);

    //Keyword Results
    var keywordResponses = eventArgs.getKeywordResponses();
    var keywords = parseKeywordResponses(keywordResponses);
    if (keywords.length > 0) {
        var keywordResponseText = "";
        for (var kIterator=0;kIterator<keywords.length;kIterator++) {

```

--------------------------------

### Example: Configure TransformerBuilder and OutputBuilder

Source: https://developers.snap.com/lens-studio/api/editor-scripting/documents/Full_API_List.html/lens-scripting/classes/Built-In.TransformerBuilder

Demonstrates how to create and configure a Transformer object using TransformerBuilder, and then apply it to an OutputBuilder for machine learning output. This example sets alignment, rotation, fill color, and then builds both the transformer and an output placeholder.

```JavaScript
var transformer = MachineLearning.createTransformerBuilder()
    .setVerticalAlignment(VerticalAlignment.Center)
    .setHorizontalAlignment(HorizontalAlignment.Center)
    .setRotation(TransformerRotation.Rotate180)
    .setFillColor(new vec4(0, 0, 0, 1))
    .build();

var outputBuilder = MachineLearning.createOutputBuilder();
outputBuilder.setName("probs");
outputBuilder.setShape(new vec3(1, 1, 200));
outputBuilder.setOutputMode(MachineLearning.OutputMode.Data);
outputBuilder.setTransformer(transformer);
var outputPlaceholder = outputBuilder.build();
```

--------------------------------

### Download RemoteReferenceAsset Example

Source: https://developers.snap.com/lens-studio/api/editor-scripting/documents/Full_API_List.html/lens-scripting/classes/Built-In.RemoteReferenceAsset

Demonstrates how to download a remote asset using `RemoteReferenceAsset` and handle success/failure callbacks. The example also shows how to preview an audio asset if the downloaded asset is of type `Asset.AudioTrackAsset`. It requires `Asset.RemoteReferenceAsset` and `Component.AudioComponent` as script inputs.

```javascript
//@input Asset.RemoteReferenceAsset myRemoteReferenceAsset
//@input Component.AudioComponent myAudioComponent

function onFailed() {
    print("Asset wasn't downloaded from the reference " + script.myRemoteReferenceAsset.name);
}

function previewDownloadedAsset(asset) {
    if (asset.isOfType("Asset.AudioTrackAsset")) {
        script.myAudioComponent.audioTrack = asset;
        script.myAudioComponent.play(1);
    } else {
        print("Warning, asset has type " + asset.getTypeName() + ", please set Audio Component input to display");
    }
}

script.myRemoteReferenceAsset.downloadAsset(previewDownloadedAsset, onFailed);
```

--------------------------------

### Lens Studio Subprocess Example Plugin Class (JavaScript)

Source: https://developers.snap.com/lens-studio/api/editor-scripting/documents/Full_API_List.html/editor-scripting/modules/Editor_Scripting.LensStudio_Subprocess

The `ProcessTest` class extends `CoreService` and serves as the main plugin entry point. It defines the plugin's metadata via `descriptor()` and sets up the constructor, preparing it to manage subprocesses within the Lens Studio environment.

```javascript
export class ProcessTest extends CoreService {
    static descriptor() {
        return {
            id: 'snap.test.SubprocessExample',
            interfaces: CoreService. descriptor().interfaces,
            name: 'Subprocess Example',
            description: 'Run some sync and async subprocess.',
            dependencies: []
        };
    }

    constructor(pluginSystem) {
        super(pluginSystem);
    }
}
```

--------------------------------

### Initialize Spectrogram Instance

Source: https://developers.snap.com/lens-studio/api/editor-scripting/documents/Full_API_List.html/lens-scripting/classes/Built-In.Spectrogram

Demonstrates how to create a new Spectrogram instance using the `spectrogramBuilder` with various configuration parameters like frame size, hop size, and FFT size. This example shows the typical setup for preparing a spectrogram object.

```JavaScript
var spectrogram = spectrogramBuilder
    .setFrameSize(frameSize)
    .setHopSize(hopSize)
    .setFFTSize(fftSize)
    .build();
```

--------------------------------

### Configure AsrTranscriptionOptions Instance

Source: https://developers.snap.com/lens-studio/api/editor-scripting/documents/Full_API_List.html/lens-scripting/classes/Built-In.AsrModule.AsrTranscriptionOptions

Demonstrates how to create and configure an `AsrTranscriptionOptions` instance, setting properties like `silenceUntilTerminationMs` and `mode`, and attaching event listeners for transcription updates and errors. This example shows a typical setup for an ASR session.

```javascript
const options = AsrModule.AsrTranscriptionOptions.create()
options.silenceUntilTerminationMs = 1000
options.mode = AsrModule.AsrMode.HighAccuracy
options.onTranscriptionUpdateEvent.add((eventArgs) => print(eventArgs))
options.onTranscriptionErrorEvent.add((eventArgs) => print(`Error while transcribing: ${eventArgs}`))
```

--------------------------------

### InternetModule.createWebSocket Full Example (JavaScript)

Source: https://developers.snap.com/lens-studio/api/editor-scripting/documents/Full_API_List.html/lens-scripting/classes/Built-In.InternetModule

Illustrates a complete example of establishing and managing a WebSocket connection using `InternetModule.createWebSocket`. It demonstrates sending text and binary messages, and handling `onopen`, `onmessage`, `onclose`, and `onerror` events for robust communication.

```JavaScript
//@input Asset.InternetModule internetModule
var internetModule = script.internetModule;

// Create WebSocket connection.
let socket = script.internetModule.createWebSocket("wss://<some-url>");
socket.binaryType = "blob";

// Listen for the open event
socket.onopen = (event) => {
    // Socket has opened, send a message back to the server
    socket.send("Message 1");

    // Try sending a binary message
    // (the bytes below spell 'Message 2')
    const message = [77, 101, 115, 115, 97, 103, 101, 32, 50];
    const bytes = new Uint8Array(message);
    socket.send(bytes);
};

// Listen for messages
socket.onmessage = async (event) => {
    if (event.data instanceof Blob) {
        // Binary frame, can be retrieved as either Uint8Array or string
        let bytes = await event.data.bytes();
        let text = await event.data.text();

        print("Received binary message, printing as text: " + text);
    } else {
        // Text frame
        let text = event.data;
        print("Received text message: " + text);
    }
};

socket.onclose = (event) => {
    if (event.wasClean) {
        print("Socket closed cleanly");
    } else {
        print("Socket closed with error, code: " + event.code);
    }
};

socket.onerror = (event) => {
    print("Socket error");
};
```

--------------------------------

### Example Usage of FileLicensedSoundProvider

Source: https://developers.snap.com/lens-studio/api/editor-scripting/documents/Full_API_List.html/lens-scripting/classes/Built-In.FileLicensedSoundProvider

Demonstrates how to use the FileLicensedSoundProvider to access and process audio data from an AudioTrackAsset. It shows how to get the sample rate, create an audio buffer, and continuously read audio data in an update event loop.

```javascript
//@input Asset.AudioTrackAsset audioTrack

var control = script.audioTrack.control;
var sampleRate = control.sampleRate;
var audioBuffer = new Float32Array(control.maxFrameSize);
control.loops = -1;

script.createEvent("UpdateEvent").bind(function (eventData) {
   var readSize = eventData.getDeltaTime() * sampleRate;
   control.getAudioBuffer(audioBuffer, readSize);
});
```

--------------------------------

### Example Usage of NlpIntentModel

Source: https://developers.snap.com/lens-studio/api/editor-scripting/documents/Full_API_List.html/lens-scripting/classes/Built-In.VoiceML.NlpIntentModel

Demonstrates how to create instances of `NlpIntentModel` using `VoiceML.NlpIntentsModelOptions.create()` and configure their `possibleIntents` property for specific NLP classification scenarios. This example shows setting an empty list for all intents and a specific list for 'next' and 'back' intents.

```javascript
var options = VoiceML.ListeningOptions.create();

var nlpIntentsModel = VoiceML.NlpIntentsModelOptions.create("VOICE_ENABLED_UI");
nlpIntentsModel.possibleIntents = [];

var nlpIntentsModel2 = VoiceML.NlpIntentsModelOptions.create("VOICE_ENABLED_UI");
nlpIntentsModel2.possibleIntents = ["next", "back"]
```

--------------------------------

### Initialize MotionControllerModule and Get Controller Instance

Source: https://developers.snap.com/lens-studio/api/editor-scripting/documents/Full_API_List.html/lens-scripting/classes/Built-In.MotionControllerModule

This JavaScript example demonstrates how to import the `MotionControllerModule`, create `MotionController.Options` to specify motion type (e.g., SixDoF), and then obtain a `MotionController` instance using `getController`.

```JavaScript
const MotionControllerModule = require("LensStudio:MotionControllerModule")
let options = MotionController.Options.create()
options.motionType = MotionController.MotionType.SixDoF
const motionController = MotionControllerModule.getController(options)
```

--------------------------------

### Example Custom DockManager Implementation

Source: https://developers.snap.com/lens-studio/api/editor-scripting/documents/Full_API_List.html/editor-scripting/classes/Editor_Scripting.Editor.Dock.IDockManager

This JavaScript example demonstrates how to create a custom `DockManager` class that extends `CoreService` and interacts with the `Editor.Dock.IDockManager` interface. It shows how to use serialization to read and write panel layout configurations, illustrating a practical application of the Lens Studio plugin system.

```JavaScript
import CoreService from 'LensStudio:CoreService';
import * as serialization from 'LensStudio:Serialization';

export class DockManager extends CoreService {
    static descriptor() {
        return {
            id: 'Snap.Test.DockManager',
            name: 'DockManager',
            description: 'DockManager',
            interfaces: CoreService.descriptor().interfaces,
            dependencies: [Editor.Dock.IDockManager]
        };
    }

    constructor(pluginSystem) {
        super(pluginSystem);
        this.guards = [];
    }

    start() {
        const layoutStr = 'dock:\n' +
'  d: false\n' +
            '  main:\n' +
            '    items:\n' +
            '      - items:\n';

        // Simply test that reader and writer can be created and used without throwing
        let reader = serialization.Yaml.createReader(layoutStr);
        const writer = serialization.Yaml.createWriter();

        const dockManager = this.pluginSystem.findInterface(Editor.Dock.IDockManager);
        dockManager.write(writer);
        const writtenContent = writer.getString();
        reader = serialization.Yaml.createReader(writtenContent);
    }

    stop() {
    }
}
```

--------------------------------

### Example Usage of DeltaBuilder

Source: https://developers.snap.com/lens-studio/api/editor-scripting/documents/Full_API_List.html/lens-scripting/classes/Built-In.Delta

Demonstrates how to create a Delta instance using MachineLearning.createDeltaBuilder(), setting its features and window size.

```JavaScript
var deltaBuilder = MachineLearning.createDeltaBuilder();
var delta = deltaBuilder.setNumFeatures(numFeatures).setWindowSize(windowSize).build();
```

--------------------------------

### Example Usage of MotionControllerOptions

Source: https://developers.snap.com/lens-studio/api/editor-scripting/documents/Full_API_List.html/lens-scripting/classes/Built-In.MotionController.MotionControllerOptions

Demonstrates how to create and configure a MotionControllerOptions instance and use it to get a motion controller from the MotionControllerModule. This snippet shows how to set the motion type to ThreeDoF.

```javascript
const MotionControllerModule = require("LensStudio:MotionControllerModule")
let options = MotionController.Options.create()
options.motionType = MotionController.MotionType.ThreeDoF
const motionController = MotionControllerModule.getController(options)
```

--------------------------------

### SetupScript Class API Reference

Source: https://developers.snap.com/lens-studio/api/editor-scripting/documents/Full_API_List.html/editor-scripting/classes/Editor_Scripting.Editor.Assets.SetupScript

Detailed API documentation for the `SetupScript` class, including its constructor and the 'code' property. This class is part of the Editor Scripting API and is currently in Beta.

```APIDOC
Class SetupScript `Beta`
  Constructors:
    - constructor(): SetupScript
      Returns: SetupScript
  Properties:
    - code: string `Readonly` `Beta`
```

--------------------------------

### Start and Stop Voice Transcription with AsrModule

Source: https://developers.snap.com/lens-studio/api/editor-scripting/documents/Full_API_List.html/lens-scripting/classes/Built-In.AsrModule

Provides examples in JavaScript and TypeScript for initiating and terminating voice transcription using the Lens Studio AsrModule. It includes setup for transcription options, handling real-time updates, and error management.

```JavaScript
const asrModule = require("LensStudio:AsrModule");

function onTranscriptionError(errorCode) {
  print(`onTranscriptionErrorCallback errorCode: ${errorCode}`);
  switch (errorCode) {
    case AsrModule.AsrStatusCode.InternalError:
      print("stopTranscribing: Internal Error");
      break;
    case AsrModule.AsrStatusCode.Unauthenticated:
      print("stopTranscribing: Unauthenticated");
      break;
    case AsrModule.AsrStatusCode.NoInternet:
      print("stopTranscribing: No Internet");
      break;
  }
}

function onTranscriptionUpdate(eventArgs) {
   var text = eventArgs.text;
   var isFinal = eventArgs.isFinal;
   print(`onTranscriptionUpdateCallback text=${text}, isFinal=${isFinal}`)
}

function startSession() {
  var options = AsrModule.AsrTranscriptionOptions.create();
  options.silenceUntilTerminationMs = 1000;
  options.mode = AsrModule.AsrMode.HighAccuracy;
  options.onTranscriptionUpdateEvent.add(onTranscriptionUpdateCallback);
  options.onTranscriptionErrorEvent.add(onTranscriptionErrorCallback);

  // Start session
  asrModule.startTranscribing(options);
}

function stopSession() {
  asrModule
  .stopTranscribing()
  .then(function () {
    print(
      `stopTranscribing successfully`
    );
  });
}
```

```TypeScript
@component
export class AsrExample extends BaseScriptComponent {
  private asrModule = require("LensStudio:AsrModule")

  private onTranscriptionUpdate(eventArgs: AsrModule.TranscriptionUpdateEvent) {
    print(`onTranscriptionUpdateCallback text=${eventArgs.text}, isFinal=${eventArgs.isFinal}`)
  }

  private onTranscriptionError(eventArgs: AsrModule.AsrStatusCode) {
    print(`onTranscriptionErrorCallback errorCode: ${eventArgs}`);
    switch (eventArgs) {
      case AsrModule.AsrStatusCode.InternalError:
        print("stopTranscribing: Internal Error");
        break;
      case AsrModule.AsrStatusCode.Unauthenticated:
        print("stopTranscribing: Unauthenticated");
        break;
      case AsrModule.AsrStatusCode.NoInternet:
        print("stopTranscribing: No Internet");
        break;
    }
  }

  onAwake(): void {
    const options = AsrModule.AsrTranscriptionOptions.create()
    options.silenceUntilTerminationMs = 1000
    options.mode = AsrModule.AsrMode.HighAccuracy
    options.onTranscriptionUpdateEvent.add((eventArgs) => this.onTranscriptionUpdate(eventArgs))
    options.onTranscriptionErrorEvent.add((eventArgs) => this.onTranscriptionError(eventArgs))

    this.asrModule.startTranscribing(options)
  }

  private stopSession(): void {
    this.asrModule.stopTranscribing()
  }
}
```

--------------------------------

### Get MLComponent Scheduled Start Time

Source: https://developers.snap.com/lens-studio/api/editor-scripting/documents/Full_API_List.html/lens-scripting/classes/Built-In.MLComponent

Returns the start time of the scheduled MLComponent run.

```APIDOC
getScheduledStart(): FrameTiming
```

--------------------------------

### Configure and Use Lens Studio FileSystem Module

Source: https://developers.snap.com/lens-studio/api/editor-scripting/documents/Full_API_List.html/editor-scripting/modules/Editor_Scripting.LensStudio_FileSystem

This example demonstrates how to configure your `module.json` to include `filesystem` permissions, which is required before using the `LensStudio:FileSystem` module. It then shows a basic JavaScript usage example of importing the module and reading a file using `fs.readFile`.

```JSON
{
    "main": "main.js",
    "permissions": ["filesystem"]
}
```

```JavaScript
import * as fs from 'LensStudio:FileSystem';
let s = fs.readFile(new Editor.Path(import.meta.resolve('ellipsis.txt')));
```

--------------------------------

### Initialize VoiceML.QnaAction Object

Source: https://developers.snap.com/lens-studio/api/editor-scripting/documents/Full_API_List.html/lens-scripting/classes/Built-In.VoiceML.QnaAction

Demonstrates how to create an instance of `QnaAction` using the static `VoiceML.QnaAction.create` method and assign it to the `options.postProcessingActions` array for use in VoiceML.

```JavaScript
var qa = VoiceML.QnaAction.create("The moon is 239 miles away");
options.postProcessingActions = [qa];
```

--------------------------------

### APIDOC: VoiceMLModule Methods

Source: https://developers.snap.com/lens-studio/api/editor-scripting/documents/Full_API_List.html/lens-scripting/documents/Full_API_List

Documentation for methods available in the VoiceMLModule, including starting and stopping voice listening.

```APIDOC
VoiceMLModule:
  startListening(options: VoiceML.ListeningOptions): void
  stopListening(): void
```

--------------------------------

### Get Delta Start Position

Source: https://developers.snap.com/lens-studio/api/editor-scripting/documents/Full_API_List.html/lens-scripting/classes/Packages_SpectaclesInteractionKit_Core_HandInteractor_HandInteractor.HandInteractor

Retrieves the change in start position from the previous frame. This property is read-only.

```APIDOC
Property: deltaStartPosition
  Type: vec3
  Access: Read-only
  Description: Returns the delta start position from previous frame
  Returns: vec3
  Inherited from: BaseInteractor.deltaStartPosition
```

--------------------------------

### Get startPoint Property

Source: https://developers.snap.com/lens-studio/api/editor-scripting/documents/Full_API_List.html/lens-scripting/classes/Packages_SpectaclesInteractionKit_Core_MobileInteractor_MobileInteractor.MobileInteractor

Returns the point where the interactor's ray starts.

```APIDOC
get startPoint(): vec3
  Returns: vec3
  Overrides: BaseInteractor.startPoint
```

--------------------------------

### API Accessor: startPosition

Source: https://developers.snap.com/lens-studio/api/editor-scripting/documents/Full_API_List.html/lens-scripting/classes/Packages_SpectaclesInteractionKit_Components_UI_Slider_Slider.Slider

Gets or sets the starting position of the component as a 3D vector.

```APIDOC
startPosition:
  get startPosition(): vec3
  set startPosition(position: vec3): void
    Parameters:
      position: vec3
```

--------------------------------

### Get sixDofSwitchPosition Property

Source: https://developers.snap.com/lens-studio/api/editor-scripting/documents/Full_API_List.html/lens-scripting/classes/Packages_SpectaclesInteractionKit_Core_MobileInteractor_MobileInteractor.MobileInteractor

If manipulating, this property uses the location of the phone as the start point. Otherwise, it uses the endpoint of the raycast.

```APIDOC
sixDofSwitchPosition:
  get(): vec3
    Returns: vec3
```

--------------------------------

### RenderMeshVisual Class API Reference

Source: https://developers.snap.com/lens-studio/api/editor-scripting/documents/Full_API_List.html/editor-scripting/classes/Editor_Scripting.Editor.Components.RenderMeshVisual

Comprehensive API reference for the `RenderMeshVisual` class, outlining its hierarchy, constructor, all available properties with their types and inheritance details, and a list of its methods.

```APIDOC
Class RenderMeshVisual (Beta):
  Description: The same entity as in Lens Scripting.
  See: LensScripting.RenderMeshVisual

  Hierarchy:
    MaterialMeshVisual
      + RenderMeshVisual

  Constructors:
    constructor(): RenderMeshVisual (Protected, Beta)
      Overrides: MaterialMeshVisual.constructor

  Properties:
    blendNormals: boolean (Beta)
    blendShapesEnabled: boolean (Beta)
    enabled: boolean (Beta, Inherited from MaterialMeshVisual)
    horizontalAlignment: Horizontal (Beta, Inherited from MaterialMeshVisual)
    id: Uuid (Readonly, Beta, Inherited from MaterialMeshVisual)
      Description: The unique id of the entity.
    mainMaterial: Material (Beta, Inherited from MaterialMeshVisual)
    materials: Material[] (Beta, Inherited from MaterialMeshVisual)
    mesh: RenderMesh (Beta)
    meshShadowMode: MeshShadowMode (Beta, Inherited from MaterialMeshVisual)
    name: string (Beta, Inherited from MaterialMeshVisual)
    renderOrder: number (Beta, Inherited from MaterialMeshVisual)
    sceneObject: SceneObject (Readonly, Beta, Inherited from MaterialMeshVisual)

  Methods:
    addMaterialAt()
    clearMaterials()
    getDirectlyReferencedEntities()
    getMaterialAt()
    getMaterialsCount()
    getOwnedEntities()
    getTypeName()
    indexOfMaterial()
    isOfType()
    isSame()
    moveMaterial()
    remapReferences()
    removeMaterialAt()
    setMaterialAt()
```

--------------------------------

### startWidth Property API Reference

Source: https://developers.snap.com/lens-studio/api/editor-scripting/documents/Full_API_List.html/lens-scripting/classes/Packages_SpectaclesInteractionKit_Components_Interaction_InteractorLineVisual_InteractorLineRenderer.default

API reference for the 'startWidth' property, which gets or sets the width of the line at its start.

```APIDOC
startWidth:
  get:
    description: Gets the width of the line at the start.
    returns: number
    inherited_from: LineRenderer.startWidth
  set:
    description: Sets the width of the line at the start.
    parameters:
      - name: newWidth
        type: number
    returns: void
    inherited_from: LineRenderer.startWidth
```

--------------------------------

### API Method: startListening

Source: https://developers.snap.com/lens-studio/api/editor-scripting/documents/Full_API_List.html/lens-scripting/classes/Built-In.VoiceMLModule

Initiates audio transcription and connects to the NLP model for voice commands. This method exposes user data and requires microphone permissions. It is recommended to call this method only after the `onListeningEnabled` callback has been invoked.

```APIDOC
startListening(options: ListeningOptions): void
  Exposes User Data
  Parameters:
    options: ListeningOptions - Configuration options for listening.
  Returns: void
```

--------------------------------

### startColor Property API Reference

Source: https://developers.snap.com/lens-studio/api/editor-scripting/documents/Full_API_List.html/lens-scripting/classes/Packages_SpectaclesInteractionKit_Components_Interaction_InteractorLineVisual_InteractorLineRenderer.default

API reference for the 'startColor' property, which gets or sets the color of the line at its start.

```APIDOC
startColor:
  get:
    description: Gets the color of the line at the start.
    returns: vec4
    inherited_from: LineRenderer.startColor
  set:
    description: Sets the color of the line at the start.
    parameters:
      - name: color
        type: vec4
    returns: void
    inherited_from: LineRenderer.startColor
```

--------------------------------

### Get startPoint Property

Source: https://developers.snap.com/lens-studio/api/editor-scripting/documents/Full_API_List.html/lens-scripting/classes/Packages_SpectaclesInteractionKit_Core_Interactor_BaseInteractor.default

Retrieves the starting point of the interactor's ray in 3D space, represented as a vec3.

```APIDOC
startPoint: vec3
  get startPoint(): vec3
    Returns the point where the interactor's ray starts.
```

--------------------------------

### start() API Documentation

Source: https://developers.snap.com/lens-studio/api/editor-scripting/documents/Full_API_List.html/lens-scripting/classes/Built-In.AnimationMixer

Starts playing animation layers named `name`, or all layers if `name` is empty. The animation will start with an offset of `offset` seconds. The animation will play `cycles` times, or loop forever if `cycles` is -1.

```APIDOC
start(name: string, offset: number, cycles: number): void
  Starts playing animation layers named `name`, or all layers if `name` is empty. The animation will start with an offset of `offset` seconds. The animation will play `cycles` times, or loop forever if `cycles` is -1.
  Parameters:
    name: string
    offset: number
    cycles: number
  Returns: void
  Deprecated
```

--------------------------------

### RealtimeStoreCreationInfo Class API Reference

Source: https://developers.snap.com/lens-studio/api/editor-scripting/documents/Full_API_List.html/lens-scripting/classes/Built-In.ConnectedLensModule.RealtimeStoreCreationInfo

Detailed API documentation for the `RealtimeStoreCreationInfo` class, including its constructor, properties, and methods, providing context about a RealtimeStore's creation within the Lens Scripting API. This class extends `ScriptObject`.

```APIDOC
Class RealtimeStoreCreationInfo
  Description: Provides extra context about a RealtimeStore's creation.
  Hierarchy:
    - ScriptObject
    - RealtimeStoreCreationInfo

  Constructors:
    - Protected constructor(): RealtimeStoreCreationInfo
      Returns: RealtimeStoreCreationInfo
      Overrides: ScriptObject.constructor

  Properties:
    - Readonly allowOwnershipTakeOver: boolean
      Description: If true, ownership of the store can be claimed even if the store is already owned.
    - Readonly lastUpdatedServerTimestamp: number
      Description: Provides the server timestamp (in milliseconds) of the last time the store was updated.
    - Readonly ownerInfo: UserInfo
      Description: Provides the UserInfo of the current owner of the RealtimeStore. If the store is unowned, a UserInfo object with null fields will be returned.
    - Readonly persistence: Persistence
      Description: The persistence setting that the store was created with.
    - Readonly sentServerTimeMilliseconds: number
      Description: Provides the server timestamp (in milliseconds) of when the store was created.
    - Readonly storeId: string
      Description: A string that can be used to identify the RealtimeStore.

  Methods:
    - getTypeName(): string
      Description: Returns the name of this object's type.
      Inherited from: ScriptObject.getTypeName
    - isOfType(type: string): boolean
      Description: Returns true if the object matches or derives from the passed in type.
      Parameters:
        - type: string
      Inherited from: ScriptObject.isOfType
    - isSame(other: ScriptObject): boolean
      Description: Returns true if this object is the same as `other`. Useful for checking if two references point to the same thing.
      Parameters:
        - other: ScriptObject
      Inherited from: ScriptObject.isSame
```

--------------------------------

### Example: Animate World Rotation with LSTween

Source: https://developers.snap.com/lens-studio/api/editor-scripting/documents/Full_API_List.html/lens-scripting/classes/Packages_LSTween_LSTween.LSTween

Demonstrates animating a transform's world rotation using LSTween.rotateToWorld, setting the destination with `quat.angleAxis` and starting the tween.

```JavaScript
LSTween.rotateToWorld(transform, quat.angleAxis(radians, axis), 1000.0).start();
```

--------------------------------

### Example: Animate Local Rotation with LSTween

Source: https://developers.snap.com/lens-studio/api/editor-scripting/documents/Full_API_List.html/lens-scripting/classes/Packages_LSTween_LSTween.LSTween

Demonstrates animating a transform's local rotation using LSTween.rotateToLocal, setting the destination with `quat.angleAxis` and starting the tween.

```JavaScript
LSTween.rotateToLocal(transform, quat.angleAxis(radians, axis), 1000.0).start();
```

--------------------------------

### VoiceMLModule Class API Reference

Source: https://developers.snap.com/lens-studio/api/editor-scripting/documents/Full_API_List.html/lens-scripting/classes/Built-In.VoiceMLModule

Comprehensive API documentation for the VoiceMLModule class, detailing its inheritance, constructors, properties, and methods for managing voice interactions and system commands within Lens Studio.

```APIDOC
Hierarchy:
* Asset
  + VoiceMLModule

Index:
Constructors:
* constructor

Properties:
* name
* onListeningDisabled
* onListeningEnabled
* onListeningError
* onListeningUpdate
* uniqueIdentifier

Methods:
* enableSystemCommands
* getTypeName
* isOfType
* isSame
* startListening
* stopListening

Constructors:
Protected constructor:
* new VoiceMLModule(): VoiceMLModule
  Returns: VoiceMLModule
  Overrides: Asset.constructor

Properties:
name: string
* Description: The name of the Asset in Lens Studio.
* Inherited from: Asset.name

Readonly onListeningDisabled: event0<void>
* Description: Registers a callback which will be called when microphone permissions are taken from the lens. `stopListening()` is implicitly called in such case.

Readonly onListeningEnabled: event0<void>
* Description: Registers a callback which will be called when microphone permissions are granted to the Lens, the microphone is initialized, and is actively listening. The expected design pattern is to start the listening session once those permissions have been granted.

Readonly onListeningError: event1<ListeningErrorEventArgs, void>
* Description: Registers a callback, which will be called in case the VoiceML module can't process the inputs. Most errors are due to network connectivity, or misconfigured NLP inputs.

Readonly onListeningUpdate: event1<ListeningUpdateEventArgs, void>
* Description: Registers a callback, which will be called with interim transcription or related NLP models.

Readonly uniqueIdentifier: string
* Inherited from: Asset.uniqueIdentifier

Methods:
enableSystemCommands(): void
* Description: Allows the user to provide voice commands for the VoiceML to execute on behalf of the users. Current supported commands: "Take a Snap", "Start Recording", "Stop Recording". In case a command was detected, it will be automtically executed by the system and returned as part of the VoiceML.NlpCommandResponse in the `onListeningUpdate` callback.
* Returns: void

getTypeName(): string
* Description: Returns the name of this object's type.
* Returns: string
* Inherited from: Asset.getTypeName
```

--------------------------------

### VertexBinding Class API Reference

Source: https://developers.snap.com/lens-studio/api/editor-scripting/documents/Full_API_List.html/editor-scripting/classes/Editor_Scripting.Editor.Components.ClothVisual.VertexBinding

Comprehensive API documentation for the `VertexBinding` class, detailing its constructor, properties, and methods, including their signatures, parameters, return types, and inheritance.

```APIDOC
Class VertexBinding (Beta)
  Description: The same entity as in Lens Scripting.
  Hierarchy: Entity -> VertexBinding

  Constructors:
    constructor (Protected)
      Signature: new VertexBinding(): VertexBinding
      Returns: VertexBinding
      Overrides: Entity.constructor

  Properties:
    color (Beta)
      Type: vec4
    colorMask (Beta)
      Type: any
    followObject (Beta)
      Type: SceneObject
    id (Readonly, Beta)
      Type: Uuid
      Description: The unique id of the entity.
      Inherited from: Entity.id
    type (Readonly, Beta)
      Type: string
      Description: The entity's type.
      Inherited from: Entity.type

  Methods:
    getDirectlyReferencedEntities (Beta)
      Signature: getDirectlyReferencedEntities(): Entity[]
      Returns: Entity[]
      Description: A list of entities which this entity has a reference to.
      Inherited from: Entity.getDirectlyReferencedEntities
    getOwnedEntities (Beta)
      Signature: getOwnedEntities(): Entity[]
      Returns: Entity[]
      Description: A list of entities which has a reference to this entity.
      Inherited from: Entity.getOwnedEntities
    getTypeName (Beta)
      Signature: getTypeName(): string
      Returns: string
      Inherited from: Entity.getTypeName
    isOfType (Beta)
      Signature: isOfType(type: string): boolean
      Parameters:
        type: string
      Returns: boolean
      Inherited from: Entity.isOfType
    isSame (Beta)
      Signature: isSame(other: ScriptObject): boolean
      Parameters:
        other: ScriptObject
      Returns: boolean
      Inherited from: Entity.isSame
    remapReferences (Beta)
      Signature: remapReferences(referenceMapping: any): void
      Parameters:
        referenceMapping: any
      Returns: void
      Description: Swap this entity for another one based on a JSON of the current entity id and the target entity id.
      Inherited from: Entity.remapReferences
```

--------------------------------

### Lens Studio Lyrics Synchronization Example with TypeScript

Source: https://developers.snap.com/lens-studio/api/editor-scripting/documents/Full_API_List.html/lens-scripting/classes/Built-In.LyricsSync

This TypeScript example demonstrates how to use the `LyricsSync` class in Lens Studio to track word synchronization for lyrics. It utilizes the `ExternalMusicModule` to get a `LyricsTracker` and registers callbacks for `onWordStart` and `onWordEnd` events, printing the synchronized text. It requires an `AudioTrackAsset` to be included in the scene and its 'Bundled' property unchecked.

```TypeScript
const externalMusicModule = require("LensStudio:ExternalMusicModule") as ExternalMusicModule;

@component
export class LyricsExample extends BaseScriptComponent {
    // Make sure an AudioTrack asset is included in the scene. It determines the track that plays.
    // If you see errors, make sure that "Bundled" is unchecked (disabled) on the AudioTrack.
    @input audioAsset: AudioTrackAsset;

    onAwake() {
        const lyricsTracker = externalMusicModule.getLyricsTracker();

        lyricsTracker.onWordStart.add(sync => {
            print("Sync started: " + sync.text);
        });

        lyricsTracker.onWordEnd.add(sync => {
            print("Sync ended: " + sync.text);
        })
    }
}
```

--------------------------------

### API Reference for ConnectedLensModule.RealtimeStoreCreationInfo

Source: https://developers.snap.com/lens-studio/api/editor-scripting/documents/Full_API_List.html/lens-scripting/documents/Full_API_List

Details the parameters required for creating a real-time data store, such as ownership, persistence, and initial timestamps.

```APIDOC
ConnectedLensModule.RealtimeStoreCreationInfo:
  allowOwnershipTakeOver: boolean
  lastUpdatedServerTimestamp: number
  ownerInfo: ConnectedLensModule.UserInfo
  persistence: RealtimeStoreCreateOptions.Persistence
  sentServerTimeMilliseconds: number
  storeId: string
```

--------------------------------

### Retrieve MaterialMeshVisual Component from SceneObject

Source: https://developers.snap.com/lens-studio/api/editor-scripting/documents/Full_API_List.html/lens-scripting/classes/Built-In.SceneObject

This example demonstrates how to get the SceneObject associated with the current script and then retrieve a specific component, such as a MaterialMeshVisual, from it. It includes a check for the component's existence before proceeding with further operations.

```javascript
// Look for a MaterialMeshVisual on this SceneObject
var sceneObj = script.getSceneObject();
var meshVisual = sceneObj.getComponent("Component.MaterialMeshVisual");
if(meshVisual)
{
	// ...
}
```

--------------------------------

### API Method: initialize

Source: https://developers.snap.com/lens-studio/api/editor-scripting/documents/Full_API_List.html/lens-scripting/interfaces/Packages_SpectaclesInteractionKit_Providers_HandInputData_HandVisuals.HandVisuals

Describes the `initialize` method, which sets up all joint `Transform`s and sets the `initialized` property to true, making the class ready for use.

```APIDOC
initialize(): void
  Sets up all joint Transforms and sets initialized to true.
  Returns: void
```

--------------------------------

### JavaScript Leaderboard Integration Example

Source: https://developers.snap.com/lens-studio/api/editor-scripting/documents/Full_API_List.html/lens-scripting/classes/Built-In.Leaderboard

This code snippet demonstrates how to interact with the LeaderboardModule asset in Lens Studio. It illustrates the process of creating a new leaderboard, retrieving its information, and submitting user scores. The example includes functions for setting up creation and retrieval options, as well as callback functions to handle success and failure scenarios for various leaderboard operations.

```javascript
//@input Asset.LeaderboardModule leaderboardModule

const createOptions = getCreateOptions();
script.leaderboardModule.getLeaderboard(createOptions, getLeaderboardSuccessCallback, getLeaderboardFailureCallback);

function getCreateOptions() {
    const options = Leaderboard.CreateOptions.create();
    options.name = "leaderboardName";
    options.ttlSeconds = 64000;
    options.orderingType = Leaderboard.OrderingType.Descending;

    return options;
}

function getRetrievalOptions() {
    const retrievalOptions = Leaderboard.RetrievalOptions.create();
    retrievalOptions.usersType = Leaderboard.UsersType.Friends;
    retrievalOptions.usersLimit = 3;

    return retrievalOptions;
}

function getLeaderboardSuccessCallback(leaderboard) {
    print("[Leaderboard] getLeaderbaord success callback");
    print("[Leaderboard] Leaderboard Name = " + leaderboard.name);
    print("[Leaderboard] Ordering Type = " + leaderboard.orderingType);

    const retrievalOptions = getRetrievalOptions();
    leaderboard.getLeaderboardInfo(retrievalOptions, getInfoSuccessCallback, getInfoFailureCallback);
    leaderboard.submitScore(100, submitScoreSuccessCallback, submitScoreFailureCallback);
}

function getLeaderboardFailureCallback(message) {
    print("[Leaderboard] getLeaderboard failure callback with message " + message);
}

function getInfoSuccessCallback(othersInfo, currentUserInfo) {
    print("[Leaderboard] getLeaderboardInfo success callback");

    if (!isNull(currentUserInfo)) {
        print(`[Leaderboard] Current User info: ${currentUserInfo.snapchatUser.displayName ? currentUserInfo.snapchatUser.displayName : ''} score: ${currentUserInfo.score}`);
    }
    othersInfo.forEach((userRecord, idx) => {
        print(`[Leaderboard] ${idx + 1}. ${userRecord.snapchatUser.displayName ? userRecord.snapchatUser.displayName : ''} score: ${userRecord.score}`);
    });
}

function getInfoFailureCallback(message) {
    print("[Leaderboard] getLeaderboardInfo failure callback with message " + message);
}

function submitScoreSuccessCallback(currentUserInfo) {
    print("[Leaderboard] submitScore success callback");
    if (!isNull(currentUserInfo)) {
        print(`[Leaderboard] Current User info: ${currentUserInfo.snapchatUser.displayName ? currentUserInfo.snapchatUser.displayName : ''} score: ${currentUserInfo.score}`);
    }
}

function submitScoreFailureCallback(message) {
    print("[Leaderboard] submitScore failure callback with message " + message);
}
```

--------------------------------

### Handle Smile Started Event in JavaScript

Source: https://developers.snap.com/lens-studio/api/editor-scripting/documents/Full_API_List.html/lens-scripting/classes/Built-In.SmileStartedEvent

Demonstrates how to create and bind a callback function to the SmileStartedEvent to detect when a smile begins on a specific tracked face. The example prints a message to the console when the event triggers.

```JavaScript
var event = script.createEvent("SmileStartedEvent");
event.faceIndex = 0;
event.bind(function (eventData)
{
	print("Smile started on face 0");
});
```

--------------------------------

### RealtimeStoreCreateOptions Class API Reference

Source: https://developers.snap.com/lens-studio/api/editor-scripting/documents/Full_API_List.html/lens-scripting/classes/Built-In.RealtimeStoreCreateOptions

This section provides the full API documentation for the `RealtimeStoreCreateOptions` class, including its inheritance hierarchy, protected constructor, properties (e.g., `allowOwnershipTakeOver`, `initialStore`, `ownership`, `persistence`, `storeId`), and methods (e.g., `create`, `getTypeName`, `isOfType`, `isSame`). It details parameter types, return types, and descriptions for each member.

```APIDOC
Class RealtimeStoreCreateOptions
  Description: The options for the realtime store.
  See:
    Used By: MultiplayerSession#createRealtimeStore
    Returned By: RealtimeStoreCreateOptions.create
  Hierarchy:
    - ScriptObject
      - RealtimeStoreCreateOptions
  Constructors:
    - Protected constructor(): RealtimeStoreCreateOptions
      Description: Overrides ScriptObject.constructor
  Properties:
    - allowOwnershipTakeOver: boolean
    - initialStore: GeneralDataStore
      Description: An existing store to be used as the initial values for the real time store.
    - ownership: RealtimeStoreCreateOptions.Ownership
      Description: The ownership model for the realtime store.
    - persistence: RealtimeStoreCreateOptions.Persistence
      Description: The persistence model for the realtime store.
    - storeId: string
      Description: Writes an id string to the store that can be used to identify it later.
  Methods:
    - Static create(): RealtimeStoreCreateOptions
      Description: Creates the realtime store options object.
    - getTypeName(): string
      Description: Returns the name of this object's type. Inherited from ScriptObject.getTypeName
    - isOfType(type: string): boolean
      Description: Returns true if the object matches or derives from the passed in type.
      Parameters:
        - type: string
    - isSame(other: ScriptObject): boolean
      Description: Returns true if this object is the same as `other`. Useful for checking if two references point to the same thing.
      Parameters:
        - other: ScriptObject
```

--------------------------------

### VoiceML.QnaAction Class API Reference

Source: https://developers.snap.com/lens-studio/api/editor-scripting/documents/Full_API_List.html/lens-scripting/classes/Built-In.VoiceML.QnaAction

Detailed API documentation for the `VoiceML.QnaAction` class, which extends `PostProcessingAction`. It includes information on its constructor, the `context` property, and methods like `create`, `getTypeName`, `isOfType`, and `isSame`.

```APIDOC
Class QnaAction
  See: Returned By: VoiceML.QnaAction.create
  Hierarchy: PostProcessingAction

  Constructors:
    Protected new QnaAction(): QnaAction
      Overrides PostProcessingAction.constructor

  Properties:
    context: string
      Description: The context passed to the QnaAction. The QnaAction is passed to VoiceML.listeningOptions to use the DialogML within the VoiceML automatically

  Methods:
    Static create(context: string): QnaAction
      Parameters:
        context: string (Creates a QnaAction object with a given context i.e. source text for the Dialog ML.)
      Returns: QnaAction

    getTypeName(): string
      Description: Returns the name of this object's type.
      Returns: string
      Inherited from PostProcessingAction.getTypeName

    isOfType(type: string): boolean
      Parameters:
        type: string
      Returns: boolean
      Description: Returns true if the object matches or derives from the passed in type.
      Inherited from PostProcessingAction.isOfType

    isSame(other: ScriptObject): boolean
      Parameters:
        other: ScriptObject
      Returns: boolean
      Description: Returns true if this object is the same as `other`. Useful for checking if two references point to the same thing.
      Inherited from PostProcessingAction.isSame
```

--------------------------------

### Accessing EyeColorVisual faceIndex Property (JavaScript)

Source: https://developers.snap.com/lens-studio/api/editor-scripting/documents/Full_API_List.html/lens-scripting/classes/Built-In.EyeColorVisual

This JavaScript example demonstrates how to retrieve the `faceIndex` property from an `EyeColorVisual` component attached to a scene object. It accesses the component, gets the `faceIndex`, and prints its value to the console.

```JavaScript
// Prints the eye property `faceIndex`, the face the eye color effect is applied to
var face = script.getSceneObject().getFirstComponent("Component.EyeColorVisual").faceIndex;

print("faceIndex = " + face.toString());
```