

# Developer quickstart

> Learn how to make your first ElevenLabs API request.

The ElevenLabs API provides a simple interface to state-of-the-art audio [models](/docs/models) and [features](/docs/api-reference/introduction). Follow this guide to learn how to create lifelike speech with our Text to Speech API. See the [developer guides](/docs/quickstart#explore-our-developer-guides) for more examples with our other products.

## Using the Text to Speech API

<Steps>
  <Step title="Create an API key">
    [Create an API key in the dashboard here](https://elevenlabs.io/app/settings/api-keys), which youâ€™ll use to securely [access the API](/docs/api-reference/authentication).

    Store the key as a managed secret and pass it to the SDKs either as a environment variable via an `.env` file, or directly in your appâ€™s configuration depending on your preference.

    ```js title=".env"
    ELEVENLABS_API_KEY=<your_api_key_here>
    ```
  </Step>

  <Step title="Install the SDK">
    We'll also use the `dotenv` library to load our API key from an environment variable.

    <CodeBlocks>
      ```python
      pip install elevenlabs
      pip install python-dotenv
      ```

      ```typescript
      npm install @elevenlabs/elevenlabs-js
      npm install dotenv
      ```
    </CodeBlocks>

    <Note>
      To play the audio through your speakers, you may be prompted to install [MPV](https://mpv.io/)
      and/or [ffmpeg](https://ffmpeg.org/).
    </Note>
  </Step>

  <Step title="Make your first request">
    Create a new file named `example.py` or `example.mts`, depending on your language of choice and add the following code:

    {/* This snippet was auto-generated */}

    <CodeBlocks>
      ```python
      from dotenv import load_dotenv
      from elevenlabs.client import ElevenLabs
      from elevenlabs.play import play
      import os

      load_dotenv()

      elevenlabs = ElevenLabs(
        api_key=os.getenv("ELEVENLABS_API_KEY"),
      )

      audio = elevenlabs.text_to_speech.convert(
          text="The first move is what sets everything in motion.",
          voice_id="JBFqnCBsd6RMkjVDRZzb",
          model_id="eleven_multilingual_v2",
          output_format="mp3_44100_128",
      )

      play(audio)

      ```

      ```typescript
      import { ElevenLabsClient, play } from '@elevenlabs/elevenlabs-js';
      import { Readable } from 'stream';
      import 'dotenv/config';

      const elevenlabs = new ElevenLabsClient();
      const audio = await elevenlabs.textToSpeech.convert('JBFqnCBsd6RMkjVDRZzb', {
        text: 'The first move is what sets everything in motion.',
        modelId: 'eleven_multilingual_v2',
        outputFormat: 'mp3_44100_128',
      });

      const reader = audio.getReader();
      const stream = new Readable({
        async read() {
          const { done, value } = await reader.read();
          if (done) {
            this.push(null);
          } else {
            this.push(value);
          }
        },
      });

      await play(stream);

      ```
    </CodeBlocks>
  </Step>

  <Step title="Run the code">
    <CodeBlocks>
      ```python
      python example.py
      ```

      ```typescript
      npx tsx example.mts
      ```
    </CodeBlocks>

    You should hear the audio play through your speakers.
  </Step>
</Steps>

## Explore our developer guides

Now that you've made your first ElevenLabs API request, you can explore the other products that ElevenLabs offers.

<CardGroup cols={2}>
  <Card title="Speech to Text" icon="duotone pen-clip" href="/docs/cookbooks/speech-to-text/quickstart">
    Convert spoken audio into text
  </Card>

  <Card title="ElevenLabs Agents" icon="duotone comments" href="/docs/agents-platform/quickstart">
    Deploy conversational voice agents
  </Card>

  <Card title="Music" icon="duotone music" href="/docs/cookbooks/music/quickstart">
    Generate studio-quality music
  </Card>

  <Card title="Voice Cloning" icon="duotone clone" href="/docs/cookbooks/voices/instant-voice-cloning">
    Clone a voice
  </Card>

  <Card title="Voice Remixing" icon="duotone shuffle" href="/docs/cookbooks/voices/remix-a-voice">
    Remix a voice
  </Card>

  <Card title="Sound Effects" icon="duotone explosion" href="/docs/cookbooks/sound-effects">
    Generate sound effects from text
  </Card>

  <Card title="Voice Changer" icon="duotone message-pen" href="/docs/cookbooks/voice-changer">
    Transform the voice of an audio file
  </Card>

  <Card title="Voice Isolator" icon="duotone ear" href="/docs/cookbooks/voice-isolator">
    Isolate background noise from audio
  </Card>

  <Card title="Voice Design" icon="duotone paint-brush" href="/docs/cookbooks/voices/voice-design">
    Generate voices from a single text prompt
  </Card>

  <Card title="Dubbing" icon="duotone language" href="/docs/cookbooks/dubbing">
    Dub audio/video from one language to another
  </Card>

  <Card title="Forced Alignment" icon="duotone objects-align-left" href="/docs/cookbooks/forced-alignment">
    Generate time-aligned transcripts for audio
  </Card>
</CardGroup>
# Streaming

> Learn how to stream real-time audio from the ElevenLabs API using chunked transfer encoding

The ElevenLabs API supports real-time audio streaming for select endpoints, returning raw audio bytes (e.g., MP3 data) directly over HTTP using chunked transfer encoding. This allows clients to process or play audio incrementally as it is generated.

Our official [Node](https://github.com/elevenlabs/elevenlabs-js) and [Python](https://github.com/elevenlabs/elevenlabs-python) libraries include utilities to simplify handling this continuous audio stream.

Streaming is supported for the [Text to Speech API](/docs/api-reference/streaming), [Voice Changer API](/docs/api-reference/speech-to-speech-streaming) & [Audio Isolation API](/docs/api-reference/audio-isolation-stream). This section focuses on how streaming works for requests made to the Text to Speech API.

In Python, a streaming request looks like:

```python
from elevenlabs import stream
from elevenlabs.client import ElevenLabs

elevenlabs = ElevenLabs()

audio_stream = elevenlabs.text_to_speech.stream(
    text="This is a test",
    voice_id="JBFqnCBsd6RMkjVDRZzb",
    model_id="eleven_multilingual_v2"
)

#Â option 1: play the streamed audio locally
stream(audio_stream)

#Â option 2: process the audio bytes manually
for chunk in audio_stream:
    if isinstance(chunk, bytes):
        print(chunk)
```

In Node / Typescript, a streaming request looks like:

```javascript maxLines=0
import { ElevenLabsClient, stream } from '@elevenlabs/elevenlabs-js';
import { Readable } from 'stream';

const elevenlabs = new ElevenLabsClient();

async function main() {
  const audioStream = await elevenlabs.textToSpeech.stream('JBFqnCBsd6RMkjVDRZzb', {
    text: 'This is a test',
    modelId: 'eleven_multilingual_v2',
  });

  // option 1: play the streamed audio locally
  await stream(Readable.from(audioStream));

  // option 2: process the audio manually
  for await (const chunk of audioStream) {
    console.log(chunk);
  }
}

main();
```
# Generate audio in real-time
> Learn how to generate audio in real-time via a WebSocket connection.
WebSocket streaming is a method of sending and receiving data over a single, long-lived
connection. This method is useful for real-time applications where you need to stream audio
data as it becomes available.
If you want to quickly test out the latency (time to first byte) of a WebSocket connection
to the ElevenLabs text-to-speech API, you can install `elevenlabs-latency` via `npm` and
follow the instructions [here](https://www.npmjs.com/package/elevenlabs-latency?
activeTab=readme).
<Note>
will
the
</Note>
WebSockets can be used with the Text to Speech and Agents Platform products. This guide
demonstrate how to use them with the Text to Speech API. WebSockets are not available for
`eleven_v3` model.
## Requirements
* An ElevenLabs account with an API key (hereâ€™s how to [find your API key](/docs/api-
reference/authentication)).
* Python or Node.js (or another JavaScript runtime) installed on your machine
## Setup
Install required dependencies:
<CodeBlocks>
```python Python
pip install python-dotenv
pip install websockets
```
```typescript TypeScript
npm install dotenv
npm install @types/dotenv --save-dev
npm install ws
```
</CodeBlocks>
Next, create a `.env` file in your project directory and add your API key:
```bash .env
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```
## Initiate the websocket connection
After choosing a voice from the Voice Library and the text to speech model you wish to use,
initiate a WebSocket connection to the text to speech API.
<CodeBlocks>
```python text-to-speech-websocket.py
import os
from dotenv import load_dotenv
import websockets
# Load the API key from the .env file
https://elevenlabs.io/docs/websockets.md 1/7
10/24/25, 10:54 PM elevenlabs.io/docs/websockets.md
load_dotenv()
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
voice_id = 'Xb7hH8MSUJpSbSDYk0k2'
# For use cases where latency is important, we recommend using the 'eleven_flash_v2_5'
model.
model_id = 'eleven_flash_v2_5'
async def text_to_speech_ws_streaming(voice_id, model_id):
uri = f"wss://api.elevenlabs.io/v1/text-to-speech/{voice_id}/stream-input?model_id=
{model_id}"
async with websockets.connect(uri) as websocket:
...
```
```typescript text-to-speech-websocket.ts
import * as dotenv from 'dotenv';
import * as fs from 'node:fs';
import WebSocket from 'ws';
// Load the API key from the .env file
dotenv.config();
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const voiceId = 'Xb7hH8MSUJpSbSDYk0k2';
// For use cases where latency is important, we recommend using the 'eleven_flash_v2_5'
model.
const model = 'eleven_flash_v2_5';
const uri = `wss://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream-input?
model_id=${model}`;
const websocket = new WebSocket(uri, {
headers: { 'xi-api-key': `${ELEVENLABS_API_KEY}` },
});
// Create a directory for saving the audio
const outputDir = './output';
try {
} catch (err) {
fs.mkdirSync(outputDir);
fs.accessSync(outputDir, fs.constants.R_OK | fs.constants.W_OK);
}
// Create a write stream for saving the audio into mp3
const writeStream = fs.createWriteStream(outputDir + '/test.mp3', {
flags: 'a',
});
```
</CodeBlocks>
## Send the input text
Once the WebSocket connection is open, set up voice settings first. Next, send the text
message to the API.
<CodeBlocks>
```python text-to-speech-websocket.py
async def text_to_speech_ws_streaming(voice_id, model_id):
async with websockets.connect(uri) as websocket:
https://elevenlabs.io/docs/websockets.md 2/7
10/24/25, 10:54 PM elevenlabs.io/docs/websockets.md
await websocket.send(json.dumps({
"text": " ",
"voice_settings": {"stability": 0.5, "similarity_boost": 0.8,
"use_speaker_boost": False},
"generation_config": {
"chunk_length_schedule": [120, 160, 250, 290]
},
"xi_api_key": ELEVENLABS_API_KEY,
}))
text = "The twilight sun cast its warm golden hues upon the vast rolling fields,
saturating the landscape with an ethereal glow. Silently, the meandering brook continued its
ceaseless journey, whispering secrets only the trees seemed privy to."
await websocket.send(json.dumps({"text": text}))
// Send empty string to indicate the end of the text sequence which will close the
WebSocket connection
await websocket.send(json.dumps({"text": ""}))
```
```typescript text-to-speech-websocket.ts
const text =
'The twilight sun cast its warm golden hues upon the vast rolling fields, saturating the
landscape with an ethereal glow. Silently, the meandering brook continued its ceaseless
journey, whispering secrets only the trees seemed privy to.';
websocket.on('open', async () => {
websocket.send(
JSON.stringify({
text: ' ',
voice_settings: {
stability: 0.5,
similarity_boost: 0.8,
use_speaker_boost: false,
},
generation_config: { chunk_length_schedule: [120, 160, 250, 290] },
})
);
websocket.send(JSON.stringify({ text: text }));
// Send empty string to indicate the end of the text sequence which will close the
websocket connection
websocket.send(JSON.stringify({ text: '' }));
});
```
</CodeBlocks>
## Save the audio to file
Read the incoming message from the WebSocket connection and write the audio chunks to a
local file.
<CodeBlocks>
```python text-to-speech-websocket.py
import asyncio
async def write_to_local(audio_stream):
"""Write the audio encoded in base64 string to a local mp3 file."""
with open(f'./output/test.mp3', "wb") as f:
async for chunk in audio_stream:
if chunk:
https://elevenlabs.io/docs/websockets.md 3/7
10/24/25, 10:54 PM elevenlabs.io/docs/websockets.md
f.write(chunk)
async def listen(websocket):
"""Listen to the websocket for audio data and stream it."""
while True:
try:
message = await websocket.recv()
data = json.loads(message)
if data.get("audio"):
yield base64.b64decode(data["audio"])
elif data.get('isFinal'):
break
except websockets.exceptions.ConnectionClosed:
print("Connection closed")
break
async def text_to_speech_ws_streaming(voice_id, model_id):
async with websockets.connect(uri) as websocket:
...
# Add listen task to submit the audio chunks to the write_to_local function
listen_task = asyncio.create_task(write_to_local(listen(websocket)))
await listen_task
asyncio.run(text_to_speech_ws_streaming(voice_id, model_id))
```
```typescript text-to-speech-websocket.ts
// Helper function to write the audio encoded in base64 string into local file
function writeToLocal(base64str: any, writeStream: fs.WriteStream) {
const audioBuffer: Buffer = Buffer.from(base64str, 'base64');
writeStream.write(audioBuffer, (err) => {
if (err) {
console.error('Error writing to file:', err);
}
});
}
// Listen to the incoming message from the websocket connection
websocket.on('message', function incoming(event) {
const data = JSON.parse(event.toString());
if (data['audio']) {
writeToLocal(data['audio'], writeStream);
}
});
// Close the writeStream when the websocket connection closes
websocket.on('close', () => {
writeStream.end();
});
```
</CodeBlocks>
## Run the script
You can run the script by executing the following command in your terminal. An mp3 audio
file will be saved in the `output` directory.
<CodeBlocks>
```python Python
python text-to-speech-websocket.py
https://elevenlabs.io/docs/websockets.md 4/7
10/24/25, 10:54 PM elevenlabs.io/docs/websockets.md
```
```typescript TypeScript
npx tsx text-to-speech-websocket.ts
```
</CodeBlocks>
## Advanced configuration
The use of WebSockets comes with some advanced settings that you can use to fine-tune your
real-time audio generation.
### Buffering
When generating real-time audio, two important concepts should be taken into account: Time
To First Byte (TTFB) and Buffering. To produce high quality audio and deduce context, the
model requires a certain threshold of input text. The more text that is sent in a WebSocket
connection, the better the audio quality. If the threshold is not met, the model will add
the text to a buffer and generate audio once the buffer is full.
In terms of latency, TTFB is the time it takes for the first byte of audio to be sent to the
client. This is important because it affects the perceived latency of the audio. As such,
you might want to control the buffer size to balance between quality and latency.
To manage this, you can use the `chunk_length_schedule` parameter when either initializing
the WebSocket connection or when sending text. This parameter is an array of integers that
represent the number of characters that will be sent to the model before generating audio.
For example, if you set `chunk_length_schedule` to `[120, 160, 250, 290]`, the model will
generate audio after 120, 160, 250, and 290 characters have been sent, respectively.
Here's an example of how this works with the default settings for `chunk_length_schedule`:
<img src="file:993daf20-3562-45e6-b42a-b5aebbbfe436" />
In the above diagram, audio is only generated after the second message is sent to the
server. This is because the first message is below the threshold of 120 characters, while
the second message brings the total number of characters above the threshold. The third
message is above the threshold of 160 characters, so audio is immediately generated and
returned to the client.
You can specify a custom value for `chunk_length_schedule` when initializing the WebSocket
connection or when sending text.
<CodeBlocks>
```python
await websocket.send(json.dumps({
"text": text,
"generation_config": {
# Generate audio after 50, 120, 160, and 290 characters have been sent
"chunk_length_schedule": [50, 120, 160, 290]
},
"xi_api_key": ELEVENLABS_API_KEY,
}))
```
```typescript
websocket.send(
JSON.stringify({
text: text,
// Generate audio after 50, 120, 160, and 290 characters have been sent
generation_config: { chunk_length_schedule: [50, 120, 160, 290] },
xi_api_key: ELEVENLABS_API_KEY,
})
https://elevenlabs.io/docs/websockets.md 5/7
10/24/25, 10:54 PM elevenlabs.io/docs/websockets.md
);
```
</CodeBlocks>
In the case that you want force the immediate return of the audio, you can use `flush: true`
to clear out the buffer and force generate any buffered text. This can be useful, for
example, when you have reached the end of a document and want to generate audio for the
final section.
<img src="file:bb91a94d-5adf-4ce2-a6fb-28925b5c435c" />
This can be specified on a per-message basis by setting `flush: true` in the message.
<CodeBlocks>
```python
True}))
```
await websocket.send(json.dumps({"text": "Generate this audio immediately.", "flush":
```typescript
websocket.send(JSON.stringify({ text: 'Generate this audio immediately.', flush: true }));
```
</CodeBlocks>
In addition, closing the websocket will automatically force generate any buffered text.
### Voice settings
When initializing the WebSocket connections, you can specify the voice settings for the
subsequent generations. This allows you to control the speed, stability, and other voice
characteristics of the generated audio.
<CodeBlocks>
```python
await websocket.send(json.dumps({
"text": text,
"voice_settings": {"stability": 0.5, "similarity_boost": 0.8, "use_speaker_boost":
False},
}))
```
```typescript
websocket.send(
JSON.stringify({
text: text,
voice_settings: { stability: 0.5, similarity_boost: 0.8, use_speaker_boost: false },
})
);
```
</CodeBlocks>
This can be overridden on a per-message basis by specifying a different `voice_settings` in
the message.
### Pronunciation dictionaries
You can use pronunciation dictionaries to control the pronunciation of specific words or
phrases. This can be useful for ensuring that certain words are pronounced correctly or for
adding emphasis to certain words or phrases.
Unlike `voice_settings` and `generation_config`, pronunciation dictionaries must be
specified in the "Initialize Connection" message. See the [API Reference](/docs/api-
reference/text-to-speech/v-1-text-to-speech-voice-id-stream-
https://elevenlabs.io/docs/websockets.md 6/7
10/24/25, 10:54 PM elevenlabs.io/docs/websockets.md
input#send.Initialize%20Connection.pronunciation_dictionary_locators) for more information.
## Best practice
* We suggest using the default setting for `chunk_length_schedule` in `generation_config`.
* When developing a real-time conversational agent application, we advise using `flush:
true` along with the text at the end of conversation turn to ensure timely audio generation.
* If the default setting doesn't provide optimal latency for your use case, you can modify
the `chunk_length_schedule`. However, be mindful that reducing latency through this
adjustment may come at the expense of quality.
## Tips
* The WebSocket connection will automatically close after 20 seconds of inactivity. To keep
the connection open, you can send a single space character `" "`. Please note that this
string must include a space, as sending a fully empty string, `""`, will close the
WebSocket.
* Send an empty string to close the WebSocket connection after sending the last text
message.
* You can use `alignment` to get the word-level timestamps for each word in the text. This
can be useful for aligning the audio with the text in a video or for other applications that
require precise timing. See the [API Reference](/docs/api-reference/text-to-speech/v-1-text-
to-speech-voice-id-stream-input#receive.Audio%20Output.alignment) for more information.
https://elevenlabs.io/docs/websockets.md 7/7

10/24/25, 10:55 PM elevenlabs.io/docs/api-reference/authentication.md
# API Authentication
> Learn how to authenticate your ElevenLabs API requests
## API Keys
The ElevenLabs API uses API keys for authentication. Every request to the API must include
your API key, used to authenticate your requests and track usage quota.
Each API key can be scoped to one of the following:
1. **Scope restriction:** Set access restrictions by limiting which API endpoints the key
can access.
2. **Credit quota:** Define custom credit limits to control usage.
**Remember that your API key is a secret.** Do not share it with others or expose it in any
client-side code (browsers, apps).
All API requests should include your API key in an `xi-api-key` HTTP header as follows:
```bash
xi-api-key: ELEVENLABS_API_KEY
```
### Making requests
You can paste the command below into your terminal to run your first API request. Make sure
to replace `$ELEVENLABS_API_KEY` with your secret API key.
```bash
curl 'https://api.elevenlabs.io/v1/models' \
-H 'Content-Type: application/json' \
-H 'xi-api-key: $ELEVENLABS_API_KEY'
```
Example with the `elevenlabs` Python package:
```python
from elevenlabs.client import ElevenLabs
elevenlabs = ElevenLabs(
api_key='YOUR_API_KEY',
)
```
Example with the `elevenlabs` Node.js package:
```javascript
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
const elevenlabs = new ElevenLabsClient({
apiKey: 'YOUR_API_KEY',
});
```
https://elevenlabs.io/docs/api-reference/authentication.md 1/1

10/24/25, 11:12 PM elevenlabs.io/docs/cookbooks/text-to-speech/streaming.md
# Streaming text to speech
> Learn how to stream text into speech in Python or Node.js.
In this tutorial, you'll learn how to convert [text to speech](https://elevenlabs.io/text-
to-speech) with the ElevenLabs SDK. Weâ€™ll start by talking through how to generate speech
and receive a file and then how to generate speech and stream the response back. Finally, as
a bonus weâ€™ll show you how to upload the generated audio to an AWS S3 bucket, and share it
through a signed URL. This signed URL will provide temporary access to the audio file,
making it perfect for sharing with users by SMS or embedding into an application.
If you want to jump straight to an example you can find them in the [Python]
(https://github.com/elevenlabs/elevenlabs-examples/tree/main/examples/text-to-speech/python)
and [Node.js](https://github.com/elevenlabs/elevenlabs-examples/tree/main/examples/text-to-
speech/node) example repositories.
## Requirements
* An ElevenLabs account with an API key (hereâ€™s how to [find your API key]
(/docs/developer-guides/quickstart#authentication)).
* Python or Node installed on your machine
* (Optionally) an AWS account with access to S3.
## Setup
### Installing our SDK
Before you begin, make sure you have installed the necessary SDKs and libraries. You will
need the ElevenLabs SDK for the text to speech conversion. You can install it using pip:
<CodeGroup>
```bash Python
pip install elevenlabs
```
```bash TypeScript
npm install @elevenlabs/elevenlabs-js
```
</CodeGroup>
Additionally, install necessary packages to manage your environmental variables:
<CodeGroup>
```bash Python
pip install python-dotenv
```
```bash TypeScript
npm install dotenv
npm install @types/dotenv --save-dev
```
</CodeGroup>
Next, create a `.env` file in your project directory and fill it with your credentials like
so:
```bash .env
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```
## Convert text to speech (file)
https://elevenlabs.io/docs/cookbooks/text-to-speech/streaming.md 1/10
10/24/25, 11:12 PM elevenlabs.io/docs/cookbooks/text-to-speech/streaming.md
To convert text to speech and save it as a file, weâ€™ll use the `convert` method of the
ElevenLabs SDK and then it locally as a `.mp3` file.
<CodeGroup>
```python Python
import os
import uuid
from dotenv import load_dotenv
from elevenlabs import VoiceSettings
from elevenlabs.client import ElevenLabs
load_dotenv()
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
elevenlabs = ElevenLabs(
api_key=ELEVENLABS_API_KEY,
)
def text_to_speech_file(text: str) -> str:
# Calling the text_to_speech conversion API with detailed parameters
response = elevenlabs.text_to_speech.convert(
voice_id="pNInz6obpgDQGcFmaJgB", # Adam pre-made voice
output_format="mp3_22050_32",
text=text,
model_id="eleven_turbo_v2_5", # use the turbo model for low latency
# Optional voice settings that allow you to customize the output
voice_settings=VoiceSettings(
stability=0.0,
similarity_boost=1.0,
style=0.0,
use_speaker_boost=True,
speed=1.0,
),
)
# uncomment the line below to play the audio back
# play(response)
# Generating a unique file name for the output MP3 file
save_file_path = f"{uuid.uuid4()}.mp3"
# Writing the audio to a file
with open(save_file_path, "wb") as f:
for chunk in response:
if chunk:
f.write(chunk)
print(f"{save_file_path}: A new audio file was saved successfully!")
# Return the path of the saved audio file
return save_file_path
```
```typescript TypeScript
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import * as dotenv from 'dotenv';
import { createWriteStream } from 'fs';
import { v4 as uuid } from 'uuid';
dotenv.config();
https://elevenlabs.io/docs/cookbooks/text-to-speech/streaming.md 2/10
10/24/25, 11:12 PM elevenlabs.io/docs/cookbooks/text-to-speech/streaming.md
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const elevenlabs = new ElevenLabsClient({
apiKey: ELEVENLABS_API_KEY,
});
export const createAudioFileFromText = async (text: string): Promise<string> => {
return new Promise<string>(async (resolve, reject) => {
try {
const audio = await elevenlabs.textToSpeech.convert('JBFqnCBsd6RMkjVDRZzb', {
modelId: 'eleven_multilingual_v2',
text,
outputFormat: 'mp3_44100_128',
// Optional voice settings that allow you to customize the output
voiceSettings: {
stability: 0,
similarityBoost: 0,
useSpeakerBoost: true,
speed: 1.0,
},
});
const fileName = `${uuid()}.mp3`;
const fileStream = createWriteStream(fileName);
audio.pipe(fileStream);
fileStream.on('finish', () => resolve(fileName)); // Resolve with the fileName
fileStream.on('error', reject);
} catch (error) {
reject(error);
}
});
};
```
</CodeGroup>
You can then run this function with:
<CodeGroup>
```python Python
text_to_speech_file("Hello World")
```
```typescript TypeScript
await createAudioFileFromText('Hello World');
```
</CodeGroup>
## Convert text to speech (streaming)
If you prefer to stream the audio directly without saving it to a file, you can use our
streaming feature.
<CodeGroup>
```python Python
import os
from typing import IO
from io import BytesIO
from dotenv import load_dotenv
from elevenlabs import VoiceSettings
from elevenlabs.client import ElevenLabs
https://elevenlabs.io/docs/cookbooks/text-to-speech/streaming.md 3/10
10/24/25, 11:12 PM elevenlabs.io/docs/cookbooks/text-to-speech/streaming.md
load_dotenv()
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
elevenlabs = ElevenLabs(
api_key=ELEVENLABS_API_KEY,
)
def text_to_speech_stream(text: str) -> IO[bytes]:
# Perform the text-to-speech conversion
response = elevenlabs.text_to_speech.stream(
voice_id="pNInz6obpgDQGcFmaJgB", # Adam pre-made voice
output_format="mp3_22050_32",
text=text,
model_id="eleven_multilingual_v2",
# Optional voice settings that allow you to customize the output
voice_settings=VoiceSettings(
stability=0.0,
similarity_boost=1.0,
style=0.0,
use_speaker_boost=True,
speed=1.0,
),
)
# Create a BytesIO object to hold the audio data in memory
audio_stream = BytesIO()
# Write each chunk of audio data to the stream
for chunk in response:
if chunk:
audio_stream.write(chunk)
# Reset stream position to the beginning
audio_stream.seek(0)
# Return the stream for further use
return audio_stream
```
```typescript TypeScript
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import * as dotenv from 'dotenv';
dotenv.config();
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
if (!ELEVENLABS_API_KEY) {
throw new Error('Missing ELEVENLABS_API_KEY in environment variables');
}
const elevenlabs = new ElevenLabsClient({
apiKey: ELEVENLABS_API_KEY,
});
export const createAudioStreamFromText = async (text: string): Promise<Buffer> => {
const audioStream = await elevenlabs.textToSpeech.stream('JBFqnCBsd6RMkjVDRZzb', {
modelId: 'eleven_multilingual_v2',
text,
outputFormat: 'mp3_44100_128',
https://elevenlabs.io/docs/cookbooks/text-to-speech/streaming.md 4/10
10/24/25, 11:12 PM elevenlabs.io/docs/cookbooks/text-to-speech/streaming.md
// Optional voice settings that allow you to customize the output
voiceSettings: {
stability: 0,
similarityBoost: 1.0,
useSpeakerBoost: true,
speed: 1.0,
},
});
const chunks: Buffer[] = [];
for await (const chunk of audioStream) {
chunks.push(chunk);
}
const content = Buffer.concat(chunks);
return content;
};
```
</CodeGroup>
You can then run this function with:
<CodeGroup>
```python Python
text_to_speech_stream("This is James")
```
```typescript TypeScript
await createAudioStreamFromText('This is James');
```
</CodeGroup>
## Bonus - Uploading to AWS S3 and getting a secure sharing link
Once your audio data is created as either a file or a stream you might want to share this
with your users. One way to do this is to upload it to an AWS S3 bucket and generate a
secure sharing link.
<AccordionGroup>
<Accordion title="Creating your AWS credentials">
To upload the data to S3 youâ€™ll need to add your AWS access key ID, secret access key
and AWS region name to your `.env` file. Follow these steps to find the credentials:
1. Log in to your AWS Management Console: Navigate to the AWS home page and sign in with
your account.
<Frame caption="AWS Console Login">
<img src="file:12843f65-6ac3-4589-9f4b-9aa3b4b645c8" />
</Frame>
2. Access the IAM (Identity and Access Management) Dashboard: You can find IAM under
"Security, Identity, & Compliance" on the services menu. The IAM dashboard manages access to
your AWS services securely.
<Frame caption="AWS IAM Dashboard">
<img src="file:415a0bd1-c1d3-47d3-b1ef-d6de8fb67f91" />
</Frame>
3. Create a New User (if necessary): On the IAM dashboard, select "Users" and then "Add
user". Enter a user name.
<Frame caption="Add AWS IAM User">
<img src="file:811ded63-da8f-4627-acc8-9ba4b387f7c1" />
https://elevenlabs.io/docs/cookbooks/text-to-speech/streaming.md 5/10
10/24/25, 11:12 PM elevenlabs.io/docs/cookbooks/text-to-speech/streaming.md
</Frame>
4. Set the permissions: attach policies directly to the user according to the access
level you wish to grant. For S3 uploads, you can use the AmazonS3FullAccess policy. However,
it's best practice to grant least privilege, or the minimal permissions necessary to perform
a task. You might want to create a custom policy that specifically allows only the necessary
actions on your S3 bucket.
<Frame caption="Set Permission for AWS IAM User">
<img src="file:91e09dea-8644-42a9-93d7-d6aa34a9b677" />
</Frame>
5. Review and create the user: Review your settings and create the user. Upon creation,
you'll be presented with an access key ID and a secret access key. Be sure to download and
securely save these credentials; the secret access key cannot be retrieved again after this
step.
<Frame caption="AWS Access Secret Key">
<img src="file:e3fea565-3525-44be-ad2e-a08d843fd4a9" />
</Frame>
6. Get AWS region name: ex. us-east-1
<Frame caption="AWS Region Name">
<img src="file:99946910-5cd4-409a-908d-f161a4e54a38" />
</Frame>
If you do not have an AWS S3 bucket, you will need to create a new one by following
these steps:
1. Access the S3 dashboard: You can find S3 under "Storage" on the services menu.
<Frame caption="AWS S3 Dashboard">
<img src="file:348a1c7e-2dec-484c-9b63-b3b397399505" />
</Frame>
2. Create a new bucket: On the S3 dashboard, click the "Create bucket" button.
<Frame caption="Click Create Bucket Button">
<img src="file:0302eee7-c08f-409c-97c7-877ca83e8b43" />
</Frame>
3. Enter a bucket name and click on the "Create bucket" button. You can leave the other
bucket options as default. The newly added bucket will appear in the list.
<Frame caption="Enter a New S3 Bucket Name">
<img src="file:b3e07b85-2b01-4185-bf5f-9339fd111cc1" />
</Frame>
<Frame caption="S3 Bucket List">
<img src="file:a9539949-898b-494e-a841-615bea5a5bb9" />
</Frame>
</Accordion>
<Accordion title="Installing the AWS SDK and adding the credentials">
Install `boto3` for interacting with AWS services using `pip` and `npm`.
<CodeGroup>
```bash Python
pip install boto3
```
```bash TypeScript
https://elevenlabs.io/docs/cookbooks/text-to-speech/streaming.md 6/10
10/24/25, 11:12 PM elevenlabs.io/docs/cookbooks/text-to-speech/streaming.md
npm install @aws-sdk/client-s3
npm install @aws-sdk/s3-request-presigner
```
</CodeGroup>
Then add the environment variables to `.env` file like so:
```
AWS_ACCESS_KEY_ID=your_aws_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key_here
AWS_REGION_NAME=your_aws_region_name_here
AWS_S3_BUCKET_NAME=your_s3_bucket_name_here
```
</Accordion>
<Accordion title="Uploading to AWS S3 and generating the signed URL">
Add the following functions to upload the audio stream to S3 and generate a signed URL.
<CodeGroup>
```python s3_uploader.py (Python)
import os
import boto3
import uuid
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION_NAME = os.getenv("AWS_REGION_NAME")
AWS_S3_BUCKET_NAME = os.getenv("AWS_S3_BUCKET_NAME")
session = boto3.Session(
aws_access_key_id=AWS_ACCESS_KEY_ID,
aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
region_name=AWS_REGION_NAME,
)
s3 = session.client("s3")
def generate_presigned_url(s3_file_name: str) -> str:
signed_url = s3.generate_presigned_url(
"get_object",
Params={"Bucket": AWS_S3_BUCKET_NAME, "Key": s3_file_name},
ExpiresIn=3600,
) # URL expires in 1 hour
return signed_url
def upload_audiostream_to_s3(audio_stream) -> str:
s3_file_name = f"{uuid.uuid4()}.mp3" # Generates a unique file name using UUID
s3.upload_fileobj(audio_stream, AWS_S3_BUCKET_NAME, s3_file_name)
return s3_file_name
```
```typescript s3_uploader.ts (TypeScript)
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as dotenv from 'dotenv';
import { v4 as uuid } from 'uuid';
dotenv.config();
https://elevenlabs.io/docs/cookbooks/text-to-speech/streaming.md 7/10
10/24/25, 11:12 PM elevenlabs.io/docs/cookbooks/text-to-speech/streaming.md
const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION_NAME, AWS_S3_BUCKET_NAME
} =
process.env;
if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_REGION_NAME ||
!AWS_S3_BUCKET_NAME) {
.env file.');
}
throw new Error('One or more environment variables are not set. Please check your
const s3 = new S3Client({
credentials: {
accessKeyId: AWS_ACCESS_KEY_ID,
secretAccessKey: AWS_SECRET_ACCESS_KEY,
},
region: AWS_REGION_NAME,
});
export const generatePresignedUrl = async (objectKey: string) => {
const getObjectParams = {
Bucket: AWS_S3_BUCKET_NAME,
Key: objectKey,
Expires: 3600,
};
const command = new GetObjectCommand(getObjectParams);
const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
return url;
};
export const uploadAudioStreamToS3 = async (audioStream: Buffer) => {
const remotePath = `${uuid()}.mp3`;
await s3.send(
new PutObjectCommand({
Bucket: AWS_S3_BUCKET_NAME,
Key: remotePath,
Body: audioStream,
ContentType: 'audio/mpeg',
})
);
return remotePath;
};
```
</CodeGroup>
You can then call uploading function with the audio stream from the text.
<CodeGroup>
```python Python
s3_file_name = upload_audiostream_to_s3(audio_stream)
```
```typescript TypeScript
const s3path = await uploadAudioStreamToS3(stream);
```
</CodeGroup>
After uploading the audio file to S3, generate a signed URL to share access to the file.
This URL will be time-limited, meaning it will expire after a certain period, making it
secure for temporary sharing.
You can now generate a URL from a file with:
<CodeGroup>
https://elevenlabs.io/docs/cookbooks/text-to-speech/streaming.md 8/10
10/24/25, 11:12 PM elevenlabs.io/docs/cookbooks/text-to-speech/streaming.md
```python Python
signed_url = generate_presigned_url(s3_file_name)
print(f"Signed URL to access the file: {signed_url}")
```
```typescript TypeScript
const presignedUrl = await generatePresignedUrl(s3path);
console.log('Presigned URL:', presignedUrl);
```
</CodeGroup>
If you want to use the file multiple times, you should store the s3 file path in your
database and then regenerate the signed URL each time you need rather than saving the signed
URL directly as it will expire.
</Accordion>
<Accordion title="Putting it all together">
To put it all together, you can use the following script:
<CodeGroup>
```python main.py (Python)
import os
from dotenv import load_dotenv
load_dotenv()
from text_to_speech_stream import text_to_speech_stream
from s3_uploader import upload_audiostream_to_s3, generate_presigned_url
def main():
text = "This is James"
audio_stream = text_to_speech_stream(text)
s3_file_name = upload_audiostream_to_s3(audio_stream)
signed_url = generate_presigned_url(s3_file_name)
print(f"Signed URL to access the file: {signed_url}")
if __name__ == "__main__":
main()
```
```typescript index.ts (Typescript)
import 'dotenv/config';
import { generatePresignedUrl, uploadAudioStreamToS3 } from './s3_uploader';
import { createAudioFileFromText } from './text_to_speech_file';
import { createAudioStreamFromText } from './text_to_speech_stream';
(async () => {
// save the audio file to disk
const fileName = await createAudioFileFromText(
'Today, the sky is exceptionally clear, and the sun shines brightly.'
);
console.log('File name:', fileName);
// OR stream the audio, upload to S3, and get a presigned URL
https://elevenlabs.io/docs/cookbooks/text-to-speech/streaming.md 9/10
10/24/25, 11:12 PM elevenlabs.io/docs/cookbooks/text-to-speech/streaming.md
const stream = await createAudioStreamFromText(
'Today, the sky is exceptionally clear, and the sun shines brightly.'
);
const s3path = await uploadAudioStreamToS3(stream);
const presignedUrl = await generatePresignedUrl(s3path);
console.log('Presigned URL:', presignedUrl);
})();
```
</CodeGroup>
</Accordion>
</AccordionGroup>
## Conclusion
You now know how to convert text into speech and generate a signed URL to share the audio
file. This functionality opens up numerous opportunities for creating and sharing content
dynamically.
Here are some examples of what you could build with this.
1. **Educational Podcasts**: Create personalized educational content that can be accessed by
students on demand. Teachers can convert their lessons into audio format, upload them to S3,
and share the links with students for a more engaging learning experience outside the
traditional classroom setting.
2. **Accessibility Features for Websites**: Enhance website accessibility by offering text
content in audio format. This can make information on websites more accessible to
individuals with visual impairments or those who prefer auditory learning.
3. **Automated Customer Support Messages**: Produce automated and personalized audio
messages for customer support, such as FAQs or order updates. This can provide a more
engaging customer experience compared to traditional text emails.
4. **Audio Books and Narration**: Convert entire books or short stories into audio format,
offering a new way for audiences to enjoy literature. Authors and publishers can diversify
their content offerings and reach audiences who prefer listening over reading.
5. **Language Learning Tools**: Develop language learning aids that provide learners with
audio lessons and exercises. This makes it possible to practice pronunciation and listening
skills in a targeted way.
For more details, visit the following to see the full project files which give a clear
structure for setting up your application:
For Python: [example repo](https://github.com/elevenlabs/elevenlabs-
examples/tree/main/examples/text-to-speech/python)
For TypeScript: [example repo](https://github.com/elevenlabs/elevenlabs-
examples/tree/main/examples/text-to-speech/node)
If you have any questions please create an issue on the [elevenlabs-doc Github]
(https://github.com/elevenlabs/elevenlabs-docs/issues).
https://elevenlabs.io/docs/cookbooks/text-to-speech/streaming.md 10/10
10/24/25, 11:14 PM elevenlabs.io/docs/capabilities/speech-to-text.md
# Speech to Text
> Learn how to turn spoken audio into text with ElevenLabs.
## Overview
The ElevenLabs [Speech to Text (STT)](/docs/api-reference/speech-to-text) API turns spoken
audio into text with state of the art accuracy. Our Scribe v1 [model](/docs/models) adapts
to textual cues across 99 languages and multiple voice styles and can be used to:
* Transcribe podcasts, interviews, and other audio or video content
* Generate transcripts for meetings and other audio or video recordings
<CardGroup cols={2}>
<Card title="Developer tutorial" icon="duotone book-sparkles"
href="/docs/cookbooks/speech-to-text/quickstart">
Learn how to integrate speech to text into your application.
</Card>
<Card title="Product guide" icon="duotone book-user" href="/docs/product-
guides/playground/speech-to-text">
Step-by-step guide for using speech to text in ElevenLabs.
</Card>
</CardGroup>
<Info>
Companies requiring HIPAA compliance must contact [ElevenLabs
Sales](https://elevenlabs.io/contact-sales) to sign a Business Associate Agreement (BAA)
agreement. Please ensure this step is completed before proceeding with any HIPAA-related
integrations or deployments.
</Info>
## State of the art accuracy
The Scribe v1 model is capable of transcribing audio from up to 32 speakers with high
accuracy. Optionally it can also transcribe audio events like laughter, applause, and other
non-speech sounds.
The transcribed output supports exact timestamps for each word and audio event, plus
diarization to identify the speaker for each word.
The Scribe v1 model is best used for when high-accuracy transcription is required rather
than real-time transcription. A low-latency, real-time version will be released soon.
## Pricing
<Tabs>
<Tab title="Developer API">
| Tier | Price/month | Hours included additional hour |
------------ |
| Price per included hour | Price per
| -------- | ----------- | ------------------- | ----------------------- | -------------
| Free | \$0 | Unavailable | Unavailable | Unavailable
|
|
|
|
|
| Starter | \$5 | 12 hours 30 minutes | \$0.40 | Unavailable
| Creator | \$22 | 62 hours 51 minutes | \$0.35 | \$0.48
| Pro | \$99 | 300 hours | \$0.33 | \$0.40
| Scale | \$330 | 1,100 hours | \$0.30 | \$0.33
https://elevenlabs.io/docs/capabilities/speech-to-text.md 1/11
10/24/25, 11:14 PM elevenlabs.io/docs/capabilities/speech-to-text.md
| Business | \$1,320 | 6,000 hours | \$0.22 | \$0.22
|
</Tab>
<Tab title="Product interface pricing">
| Tier | Price/month | Hours included | Price per included hour |
| -------- | ----------- | --------------- | ----------------------- |
| Free | \$0 | 12 minutes | Unavailable |
| Starter | \$5 | 1 hour | \$5 |
| Creator | \$22 | 4 hours 53 min | \$4.5 |
| Pro | \$99 | 24 hours 45 min | \$4 |
| Scale | \$330 | 94 hours 17 min | \$3.5 |
| Business | \$1,320 | 440 hours | \$3 |
</Tab>
</Tabs>
<Note>
DPAs,
For reduced pricing at higher scale than 6,000 hours/month in addition to custom MSAs and
please [contact sales](https://elevenlabs.io/contact-sales).
**Note: The free tier requires attribution and does not have commercial licensing.**
</Note>
Scribe has higher concurrency limits than other services from ElevenLabs.
Please see other concurrency limits [here](/docs/models#concurrency-and-priority)
| Plan | STT Concurrency Limit |
| ---------- | --------------------- |
| Free | 8 |
| Starter | 12 |
| Creator | 20 |
| Pro | 40 |
| Scale | 60 |
| Business | 60 |
| Enterprise | Elevated |
## Examples
The following example shows the output of the Scribe v1 model for a sample audio file.
<elevenlabs-audio-player audio-title="Nicole" audio-
src="https://storage.googleapis.com/eleven-public-cdn/audio/marketing/nicole.mp3" />
```javascript
{
"language_code": "en",
"language_probability": 1,
"text": "With a soft and whispery American accent, I'm the ideal choice for creating ASMR
content, meditative guides, or adding an intimate feel to your narrative projects.",
"words": [
{
"text": "With",
"start": 0.119,
"end": 0.259,
"type": "word",
"speaker_id": "speaker_0"
},
{
"text": " ",
"start": 0.239,
"end": 0.299,
"type": "spacing",
https://elevenlabs.io/docs/capabilities/speech-to-text.md 2/11
10/24/25, 11:14 PM elevenlabs.io/docs/capabilities/speech-to-text.md
"speaker_id": "speaker_0"
},
{
"text": "a",
"start": 0.279,
"end": 0.359,
"type": "word",
"speaker_id": "speaker_0"
},
{
"text": " ",
"start": 0.339,
"end": 0.499,
"type": "spacing",
"speaker_id": "speaker_0"
},
{
"text": "soft",
"start": 0.479,
"end": 1.039,
"type": "word",
"speaker_id": "speaker_0"
},
{
"text": " ",
"start": 1.019,
"end": 1.2,
"type": "spacing",
"speaker_id": "speaker_0"
},
{
"text": "and",
"start": 1.18,
"end": 1.359,
"type": "word",
"speaker_id": "speaker_0"
},
{
"text": " ",
"start": 1.339,
"end": 1.44,
"type": "spacing",
"speaker_id": "speaker_0"
},
{
"text": "whispery",
"start": 1.419,
"end": 1.979,
"type": "word",
"speaker_id": "speaker_0"
},
{
"text": " ",
"start": 1.959,
"end": 2.179,
"type": "spacing",
"speaker_id": "speaker_0"
},
{
"text": "American",
"start": 2.159,
"end": 2.719,
"type": "word",
https://elevenlabs.io/docs/capabilities/speech-to-text.md 3/11
10/24/25, 11:14 PM elevenlabs.io/docs/capabilities/speech-to-text.md
"speaker_id": "speaker_0"
},
{
"text": " ",
"start": 2.699,
"end": 2.779,
"type": "spacing",
"speaker_id": "speaker_0"
},
{
"text": "accent,",
"start": 2.759,
"end": 3.389,
"type": "word",
"speaker_id": "speaker_0"
},
{
"text": " ",
"start": 4.119,
"end": 4.179,
"type": "spacing",
"speaker_id": "speaker_0"
},
{
"text": "I'm",
"start": 4.159,
"end": 4.459,
"type": "word",
"speaker_id": "speaker_0"
},
{
"text": " ",
"start": 4.44,
"end": 4.52,
"type": "spacing",
"speaker_id": "speaker_0"
},
{
"text": "the",
"start": 4.5,
"end": 4.599,
"type": "word",
"speaker_id": "speaker_0"
},
{
"text": " ",
"start": 4.579,
"end": 4.699,
"type": "spacing",
"speaker_id": "speaker_0"
},
{
"text": "ideal",
"start": 4.679,
"end": 5.099,
"type": "word",
"speaker_id": "speaker_0"
},
{
"text": " ",
"start": 5.079,
"end": 5.219,
"type": "spacing",
https://elevenlabs.io/docs/capabilities/speech-to-text.md 4/11
10/24/25, 11:14 PM elevenlabs.io/docs/capabilities/speech-to-text.md
"speaker_id": "speaker_0"
},
{
"text": "choice",
"start": 5.199,
"end": 5.719,
"type": "word",
"speaker_id": "speaker_0"
},
{
"text": " ",
"start": 5.699,
"end": 6.099,
"type": "spacing",
"speaker_id": "speaker_0"
},
{
"text": "for",
"start": 6.099,
"end": 6.199,
"type": "word",
"speaker_id": "speaker_0"
},
{
"text": " ",
"start": 6.179,
"end": 6.279,
"type": "spacing",
"speaker_id": "speaker_0"
},
{
"text": "creating",
"start": 6.259,
"end": 6.799,
"type": "word",
"speaker_id": "speaker_0"
},
{
"text": " ",
"start": 6.779,
"end": 6.979,
"type": "spacing",
"speaker_id": "speaker_0"
},
{
"text": "ASMR",
"start": 6.959,
"end": 7.739,
"type": "word",
"speaker_id": "speaker_0"
},
{
"text": " ",
"start": 7.719,
"end": 7.859,
"type": "spacing",
"speaker_id": "speaker_0"
},
{
"text": "content,",
"start": 7.839,
"end": 8.45,
"type": "word",
https://elevenlabs.io/docs/capabilities/speech-to-text.md 5/11
10/24/25, 11:14 PM elevenlabs.io/docs/capabilities/speech-to-text.md
"speaker_id": "speaker_0"
},
{
"text": " ",
"start": 9,
"end": 9.06,
"type": "spacing",
"speaker_id": "speaker_0"
},
{
"text": "meditative",
"start": 9.04,
"end": 9.64,
"type": "word",
"speaker_id": "speaker_0"
},
{
"text": " ",
"start": 9.619,
"end": 9.699,
"type": "spacing",
"speaker_id": "speaker_0"
},
{
"text": "guides,",
"start": 9.679,
"end": 10.359,
"type": "word",
"speaker_id": "speaker_0"
},
{
"text": " ",
"start": 10.359,
"end": 10.409,
"type": "spacing",
"speaker_id": "speaker_0"
},
{
"text": "or",
"start": 11.319,
"end": 11.439,
"type": "word",
"speaker_id": "speaker_0"
},
{
"text": " ",
"start": 11.42,
"end": 11.52,
"type": "spacing",
"speaker_id": "speaker_0"
},
{
"text": "adding",
"start": 11.5,
"end": 11.879,
"type": "word",
"speaker_id": "speaker_0"
},
{
"text": " ",
"start": 11.859,
"end": 12,
"type": "spacing",
https://elevenlabs.io/docs/capabilities/speech-to-text.md 6/11
10/24/25, 11:14 PM elevenlabs.io/docs/capabilities/speech-to-text.md
"speaker_id": "speaker_0"
},
{
"text": "an",
"start": 11.979,
"end": 12.079,
"type": "word",
"speaker_id": "speaker_0"
},
{
"text": " ",
"start": 12.059,
"end": 12.179,
"type": "spacing",
"speaker_id": "speaker_0"
},
{
"text": "intimate",
"start": 12.179,
"end": 12.579,
"type": "word",
"speaker_id": "speaker_0"
},
{
"text": " ",
"start": 12.559,
"end": 12.699,
"type": "spacing",
"speaker_id": "speaker_0"
},
{
"text": "feel",
"start": 12.679,
"end": 13.159,
"type": "word",
"speaker_id": "speaker_0"
},
{
"text": " ",
"start": 13.139,
"end": 13.179,
"type": "spacing",
"speaker_id": "speaker_0"
},
{
"text": "to",
"start": 13.159,
"end": 13.26,
"type": "word",
"speaker_id": "speaker_0"
},
{
"text": " ",
"start": 13.239,
"end": 13.3,
"type": "spacing",
"speaker_id": "speaker_0"
},
{
"text": "your",
"start": 13.299,
"end": 13.399,
"type": "word",
https://elevenlabs.io/docs/capabilities/speech-to-text.md 7/11
10/24/25, 11:14 PM elevenlabs.io/docs/capabilities/speech-to-text.md
"speaker_id": "speaker_0"
},
{
"text": " ",
"start": 13.379,
"end": 13.479,
"type": "spacing",
"speaker_id": "speaker_0"
},
{
"text": "narrative",
"start": 13.479,
"end": 13.889,
"type": "word",
"speaker_id": "speaker_0"
},
{
"text": " ",
"start": 13.919,
"end": 13.939,
"type": "spacing",
"speaker_id": "speaker_0"
},
{
"text": "projects.",
"start": 13.919,
"end": 14.779,
"type": "word",
"speaker_id": "speaker_0"
}
}
]
```
The output is classified in three category types:
* `word` - A word in the language of the audio
* `spacing` - The space between words, not applicable for languages that don't use spaces
like Japanese, Mandarin, Thai, Lao, Burmese and Cantonese
* `audio_event` - Non-speech sounds like laughter or applause
## Models
<CardGroup cols={1} rows={1}>
<Card title="Scribe v1" href="/docs/models#scribe-v1">
State-of-the-art speech recognition model
<div>
<div>
</div>
Accurate transcription in 99 languages
<div>
</div>
Precise word-level timestamps
<div>
</div>
Speaker diarization
<div>
</div>
Dynamic audio tagging
https://elevenlabs.io/docs/capabilities/speech-to-text.md 8/11
10/24/25, 11:14 PM elevenlabs.io/docs/capabilities/speech-to-text.md
</div>
</Card>
</CardGroup>
<div>
<div>
</div>
</div>
[Explore all](/docs/models)
## Concurrency and priority
Concurrency is the concept of how many requests can be processed at the same time.
For Speech to Text, files that are over 8 minutes long are transcribed in parallel
internally in order to speed up processing. The audio is chunked into four segments to be
transcribed concurrently.
You can calculate the concurrency limit with the following calculation:
$$
Concurrency = \min(4, \text{round\_up}(\frac{\text{audio\_duration\_secs}}{480}))
$$
For example, a 15 minute audio file will be transcribed with a concurrency of 2, while a 120
minute audio file will be transcribed with a concurrency of 4.
## Supported languages
The Scribe v1 model supports 99 languages, including:
*Afrikaans (afr), Amharic (amh), Arabic (ara), Armenian (hye), Assamese (asm), Asturian
(ast), Azerbaijani (aze), Belarusian (bel), Bengali (ben), Bosnian (bos), Bulgarian (bul),
Burmese (mya), Cantonese (yue), Catalan (cat), Cebuano (ceb), Chichewa (nya), Croatian
(hrv), Czech (ces), Danish (dan), Dutch (nld), English (eng), Estonian (est), Filipino
(fil), Finnish (fin), French (fra), Fulah (ful), Galician (glg), Ganda (lug), Georgian
(kat), German (deu), Greek (ell), Gujarati (guj), Hausa (hau), Hebrew (heb), Hindi (hin),
Hungarian (hun), Icelandic (isl), Igbo (ibo), Indonesian (ind), Irish (gle), Italian (ita),
Japanese (jpn), Javanese (jav), Kabuverdianu (kea), Kannada (kan), Kazakh (kaz), Khmer
(khm), Korean (kor), Kurdish (kur), Kyrgyz (kir), Lao (lao), Latvian (lav), Lingala (lin),
Lithuanian (lit), Luo (luo), Luxembourgish (ltz), Macedonian (mkd), Malay (msa), Malayalam
(mal), Maltese (mlt), Mandarin Chinese (zho), MÄori (mri), Marathi (mar), Mongolian (mon),
Nepali (nep), Northern Sotho (nso), Norwegian (nor), Occitan (oci), Odia (ori), Pashto
(pus), Persian (fas), Polish (pol), Portuguese (por), Punjabi (pan), Romanian (ron), Russian
(rus), Serbian (srp), Shona (sna), Sindhi (snd), Slovak (slk), Slovenian (slv), Somali
(som), Spanish (spa), Swahili (swa), Swedish (swe), Tamil (tam), Tajik (tgk), Telugu (tel),
Thai (tha), Turkish (tur), Ukrainian (ukr), Umbundu (umb), Urdu (urd), Uzbek (uzb),
Vietnamese (vie), Welsh (cym), Wolof (wol), Xhosa (xho) and Zulu (zul).*
### Breakdown of language support
Word Error Rate (WER) is a key metric used to evaluate the accuracy of transcription
systems. It measures how many errors are present in a transcript compared to a reference
transcript. Below is a breakdown of the WER for each language that Scribe v1 supports.
<AccordionGroup>
<Accordion title="Excellent (â‰¤ 5% WER)">
Bulgarian (bul), Catalan (cat), Czech (ces), Danish (dan), Dutch (nld), English (eng),
Finnish
(fin), French (fra), Galician (glg), German (deu), Greek (ell), Hindi (hin), Indonesian
(ind),
Italian (ita), Japanese (jpn), Kannada (kan), Malay (msa), Malayalam (mal), Macedonian
(mkd),
https://elevenlabs.io/docs/capabilities/speech-to-text.md 9/11
10/24/25, 11:14 PM elevenlabs.io/docs/capabilities/speech-to-text.md
Norwegian (nor), Polish (pol), Portuguese (por), Romanian (ron), Russian (rus), Serbian
(srp),
Vietnamese (vie).
</Accordion>
Slovak (slk), Spanish (spa), Swedish (swe), Turkish (tur), Ukrainian (ukr) and
<Accordion title="High Accuracy (>5% to â‰¤10% WER)">
Bengali (ben), Belarusian (bel), Bosnian (bos), Cantonese (yue), Estonian (est),
Filipino (fil),
Gujarati (guj), Hungarian (hun), Kazakh (kaz), Latvian (lav), Lithuanian (lit), Mandarin
(cmn),
Marathi (mar), Nepali (nep), Odia (ori), Persian (fas), Slovenian (slv), Tamil (tam) and
Telugu
(tel)
</Accordion>
<Accordion title="Good (>10% to â‰¤25% WER)">
Afrikaans (afr), Arabic (ara), Armenian (hye), Assamese (asm), Asturian (ast),
Azerbaijani
(aze), Burmese (mya), Cebuano (ceb), Croatian (hrv), Georgian (kat), Hausa (hau), Hebrew
(heb),
Icelandic (isl), Javanese (jav), Kabuverdianu (kea), Korean (kor), Kyrgyz (kir), Lingala
(lin),
Maltese (mlt), Mongolian (mon), MÄori (mri), Occitan (oci), Punjabi (pan), Sindhi (snd),
Swahili
(swa), Tajik (tgk), Thai (tha), Urdu (urd), Uzbek (uzb) and Welsh (cym).
</Accordion>
<Accordion title="Moderate (>25% to â‰¤50% WER)">
Amharic (amh), Chichewa (nya), Fulah (ful), Ganda (lug), Igbo (ibo), Irish (gle), Khmer
(khm),
(pus),
</Accordion>
</AccordionGroup>
Kurdish (kur), Lao (lao), Luxembourgish (ltz), Luo (luo), Northern Sotho (nso), Pashto
Shona (sna), Somali (som), Umbundu (umb), Wolof (wol), Xhosa (xho) and Zulu (zul).
## FAQ
<AccordionGroup>
<Accordion title="Can I use speech to text with video files?">
Yes, the API supports uploading both audio and video files for transcription.
</Accordion>
<Accordion title="What are the file size and duration limits?">
Files up to 3 GB in size and up to 10 hours in duration are supported.
</Accordion>
<Accordion title="Which audio and video formats are supported?">
The audio supported audio formats include:
* audio/aac
* audio/x-aac
* audio/x-aiff
* audio/ogg
* audio/mpeg
* audio/mp3
* audio/mpeg3
* audio/x-mpeg-3
* audio/opus
* audio/wav
* audio/x-wav
* audio/webm
https://elevenlabs.io/docs/capabilities/speech-to-text.md 10/11
10/24/25, 11:14 PM elevenlabs.io/docs/capabilities/speech-to-text.md
* audio/flac
* audio/x-flac
* audio/mp4
* audio/aiff
* audio/x-m4a
Supported video formats include:
* video/mp4
* video/x-msvideo
* video/x-matroska
* video/quicktime
* video/x-ms-wmv
* video/x-flv
* video/webm
* video/mpeg
* video/3gpp
</Accordion>
<Accordion title="When will you support more languages?">
ElevenLabs is constantly expanding the number of languages supported by our models.
Please check back frequently for updates.
</Accordion>
<Accordion title="Does speech to text API support webhooks?">
Yes, asynchronous transcription results can be sent to webhooks configured in webhook
settings in the UI. Learn more in the [webhooks cookbook](/docs/cookbooks/speech-to-
text/webhooks).
</Accordion>
<Accordion title="Is a multichannel transcription mode supported?">
Yes, the multichannel STT feature allows you to transcribe audio where each channel is
processed independently and assigned a speaker ID based on its channel number. This feature
supports up to 5 channels. Learn more in the [multichannel transcription cookbook]
(/docs/cookbooks/speech-to-text/multichannel-transcription).
</Accordion>
</AccordionGroup>
https://elevenlabs.io/docs/capabilities/speech-to-text.md 11/11
10/24/25, 11:14 PM elevenlabs.io/docs/cookbooks/speech-to-text/quickstart.md
# Speech to Text quickstart
> Learn how to convert spoken audio into text.
This guide will show you how to convert spoken audio into text using the Speech to Text API.
## Using the Speech to Text API
<Steps>
<Step title="Create an API key">
[Create an API key in the dashboard here](https://elevenlabs.io/app/settings/api-keys),
which youâ€™ll use to securely [access the API](/docs/api-reference/authentication).
Store the key as a managed secret and pass it to the SDKs either as a environment
variable via an `.env` file, or directly in your appâ€™s configuration depending on your
preference.
```js title=".env"
ELEVENLABS_API_KEY=<your_api_key_here>
```
</Step>
<Step title="Install the SDK">
We'll also use the `dotenv` library to load our API key from an environment variable.
<CodeBlocks>
```python
pip install elevenlabs
pip install python-dotenv
```
```typescript
npm install @elevenlabs/elevenlabs-js
npm install dotenv
```
</CodeBlocks>
</Step>
<Step title="Make the API request">
Create a new file named `example.py` or `example.mts`, depending on your language of
choice and add the following code:
<CodeBlocks>
```python maxLines=0
# example.py
import os
from dotenv import load_dotenv
from io import BytesIO
import requests
from elevenlabs.client import ElevenLabs
load_dotenv()
elevenlabs = ElevenLabs(
api_key=os.getenv("ELEVENLABS_API_KEY"),
)
audio_url = (
"https://storage.googleapis.com/eleven-public-cdn/audio/marketing/nicole.mp3"
)
response = requests.get(audio_url)
audio_data = BytesIO(response.content)
https://elevenlabs.io/docs/cookbooks/speech-to-text/quickstart.md 1/2
10/24/25, 11:14 PM elevenlabs.io/docs/cookbooks/speech-to-text/quickstart.md
transcription = elevenlabs.speech_to_text.convert(
file=audio_data,
model_id="scribe_v1", # Model to use, for now only "scribe_v1" is supported
tag_audio_events=True, # Tag audio events like laughter, applause, etc.
language_code="eng", # Language of the audio file. If set to None, the model will
detect the language automatically.
diarize=True, # Whether to annotate who is speaking
)
print(transcription)
```
```typescript maxLines=0
// example.mts
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import "dotenv/config";
const elevenlabs = new ElevenLabsClient();
const response = await fetch(
"https://storage.googleapis.com/eleven-public-cdn/audio/marketing/nicole.mp3"
);
const audioBlob = new Blob([await response.arrayBuffer()], { type: "audio/mp3" });
const transcription = await elevenlabs.speechToText.convert({
file: audioBlob,
modelId: "scribe_v1", // Model to use, for now only "scribe_v1" is supported.
tagAudioEvents: true, // Tag audio events like laughter, applause, etc.
languageCode: "eng", // Language of the audio file. If set to null, the model will
detect the language automatically.
diarize: true, // Whether to annotate who is speaking
});
console.log(transcription);
```
</CodeBlocks>
</Step>
<Step title="Execute the code">
<CodeBlocks>
```python
python example.py
```
```typescript
npx tsx example.mts
```
</CodeBlocks>
You should see the transcription of the audio file printed to the console.
</Step>
</Steps>
## Next steps
Explore the [API reference](/docs/api-reference/speech-to-text/convert) for more information
on the Speech to Text API and its options.
https://elevenlabs.io/docs/cookbooks/speech-to-text/quickstart.md 2/2

10/24/25, 11:15 PM elevenlabs.io/docs/api-reference/speech-to-text/convert.md
# Create transcript
POST https://api.elevenlabs.io/v1/speech-to-text
Content-Type: multipart/form-data
Transcribe an audio or video file. If webhook is set to true, the request will be processed
asynchronously and results sent to configured webhooks. When use_multi_channel is true and
the provided audio has multiple channels, a 'transcripts' object with separate transcripts
for each channel is returned. Otherwise, returns a single transcript. The optional
webhook_metadata parameter allows you to attach custom data that will be included in webhook
responses for request correlation and tracking.
## OpenAPI Specification
```yaml
openapi: 3.1.1
info:
title: Create transcript
version: endpoint_speechToText.convert
paths:
/v1/speech-to-text:
post:
operationId: convert
summary: Create transcript
description: >-
Transcribe an audio or video file. If webhook is set to true, the
request will be processed asynchronously and results sent to configured
webhooks. When use_multi_channel is true and the provided audio has
multiple channels, a 'transcripts' object with separate transcripts for
each channel is returned. Otherwise, returns a single transcript. The
optional webhook_metadata parameter allows you to attach custom data
that will be included in webhook responses for request correlation and
tracking.
tags:
- - subpackage_speechToText
parameters:
- name: enable_logging
in: query
description: >-
When enable_logging is set to false zero retention mode will be used
for the request. This will mean log and transcript storage features
are unavailable for this request. Zero retention mode may only be
used by enterprise customers.
required: false
schema:
type: boolean
- name: xi-api-key
in: header
required: true
schema:
type: string
responses:
'200':
description: Synchronous transcription result
content:
application/json:
schema:
$ref: '#/components/schemas/speech_to_text_convert_Response_200'
'422':
description: Validation Error
content: {}
requestBody:
https://elevenlabs.io/docs/api-reference/speech-to-text/convert.md 1/24
10/24/25, 11:15 PM elevenlabs.io/docs/api-reference/speech-to-text/convert.md
content:
multipart/form-data:
schema:
type: object
properties:
model_id:
type: string
language_code:
type:
- string
- 'null'
tag_audio_events:
type: boolean
num_speakers:
type:
- integer
- 'null'
timestamps_granularity:
$ref: >-
#/components/schemas/V1SpeechToTextPostRequestBodyContentMultipartFormDataSchemaTimestampsGr
anularity
diarize:
type: boolean
diarization_threshold:
type:
- number
- 'null'
format: double
additional_formats:
$ref: '#/components/schemas/AdditionalFormats'
file_format:
$ref: >-
#/components/schemas/V1SpeechToTextPostRequestBodyContentMultipartFormDataSchemaFileFormat
cloud_storage_url:
type:
- string
- 'null'
webhook:
type: boolean
webhook_id:
type:
- string
- 'null'
temperature:
type:
- number
- 'null'
format: double
seed:
type:
- integer
- 'null'
use_multi_channel:
type: boolean
webhook_metadata:
oneOf:
- $ref: >-
#/components/schemas/V1SpeechToTextPostRequestBodyContentMultipartFormDataSchemaWebhookMetad
ata
- type: 'null'
https://elevenlabs.io/docs/api-reference/speech-to-text/convert.md 2/24
10/24/25, 11:15 PM elevenlabs.io/docs/api-reference/speech-to-text/convert.md
components:
schemas:
type: string
enum:
- value: none
- value: word
- value: character
SegmentedJsonExportOptions:
type: object
properties:
include_speakers:
type: boolean
include_timestamps:
type: boolean
format:
type: string
enum:
- type: stringLiteral
value: segmented_json
segment_on_silence_longer_than_s:
type:
- number
- 'null'
format: double
max_segment_duration_s:
type:
- number
- 'null'
format: double
max_segment_chars:
type:
- integer
- 'null'
required:
- format
DocxExportOptions:
type: object
properties:
include_speakers:
type: boolean
include_timestamps:
type: boolean
format:
type: string
enum:
- type: stringLiteral
value: docx
segment_on_silence_longer_than_s:
type:
- number
- 'null'
format: double
max_segment_duration_s:
type:
- number
- 'null'
format: double
max_segment_chars:
type:
- integer
- 'null'
required:
V1SpeechToTextPostRequestBodyContentMultipartFormDataSchemaTimestampsGranularity:
https://elevenlabs.io/docs/api-reference/speech-to-text/convert.md 3/24
10/24/25, 11:15 PM elevenlabs.io/docs/api-reference/speech-to-text/convert.md
- format
PdfExportOptions:
type: object
properties:
include_speakers:
type: boolean
include_timestamps:
type: boolean
format:
type: string
enum:
- type: stringLiteral
value: pdf
segment_on_silence_longer_than_s:
type:
- number
- 'null'
format: double
max_segment_duration_s:
type:
- number
- 'null'
format: double
max_segment_chars:
type:
- integer
- 'null'
required:
- format
TxtExportOptions:
type: object
properties:
max_characters_per_line:
type:
- integer
- 'null'
include_speakers:
type: boolean
include_timestamps:
type: boolean
format:
type: string
enum:
- type: stringLiteral
value: txt
segment_on_silence_longer_than_s:
type:
- number
- 'null'
format: double
max_segment_duration_s:
type:
- number
- 'null'
format: double
max_segment_chars:
type:
- integer
- 'null'
required:
- format
HtmlExportOptions:
type: object
https://elevenlabs.io/docs/api-reference/speech-to-text/convert.md 4/24
10/24/25, 11:15 PM elevenlabs.io/docs/api-reference/speech-to-text/convert.md
properties:
include_speakers:
type: boolean
include_timestamps:
type: boolean
format:
type: string
enum:
- type: stringLiteral
value: html
segment_on_silence_longer_than_s:
type:
- number
- 'null'
format: double
max_segment_duration_s:
type:
- number
- 'null'
format: double
max_segment_chars:
type:
- integer
- 'null'
required:
- format
SrtExportOptions:
type: object
properties:
max_characters_per_line:
type:
- integer
- 'null'
include_speakers:
type: boolean
include_timestamps:
type: boolean
format:
type: string
enum:
- type: stringLiteral
value: srt
segment_on_silence_longer_than_s:
type:
- number
- 'null'
format: double
max_segment_duration_s:
type:
- number
- 'null'
format: double
max_segment_chars:
type:
- integer
- 'null'
required:
- format
ExportOptions:
oneOf:
- $ref: '#/components/schemas/SegmentedJsonExportOptions'
- $ref: '#/components/schemas/DocxExportOptions'
- $ref: '#/components/schemas/PdfExportOptions'
https://elevenlabs.io/docs/api-reference/speech-to-text/convert.md 5/24
10/24/25, 11:15 PM elevenlabs.io/docs/api-reference/speech-to-text/convert.md
- $ref: '#/components/schemas/TxtExportOptions'
- $ref: '#/components/schemas/HtmlExportOptions'
- $ref: '#/components/schemas/SrtExportOptions'
AdditionalFormats:
type: array
items:
$ref: '#/components/schemas/ExportOptions'
V1SpeechToTextPostRequestBodyContentMultipartFormDataSchemaFileFormat:
type: string
enum:
- value: pcm_s16le_16
- value: other
V1SpeechToTextPostRequestBodyContentMultipartFormDataSchemaWebhookMetadata:
oneOf:
- type: string
- type: object
additionalProperties:
description: Any type
SpeechToTextWordResponseModelType:
type: string
enum:
- value: word
- value: spacing
- value: audio_event
SpeechToTextCharacterResponseModel:
type: object
properties:
text:
type: string
start:
type:
- number
- 'null'
format: double
end:
type:
- number
- 'null'
format: double
required:
- text
SpeechToTextWordResponseModel:
type: object
properties:
text:
type: string
start:
type:
- number
- 'null'
format: double
end:
type:
- number
- 'null'
format: double
type:
$ref: '#/components/schemas/SpeechToTextWordResponseModelType'
speaker_id:
type:
- string
- 'null'
logprob:
https://elevenlabs.io/docs/api-reference/speech-to-text/convert.md 6/24
10/24/25, 11:15 PM elevenlabs.io/docs/api-reference/speech-to-text/convert.md
type: number
format: double
characters:
type:
- array
- 'null'
items:
$ref: '#/components/schemas/SpeechToTextCharacterResponseModel'
required:
- text
- type
- logprob
AdditionalFormatResponseModel:
type: object
properties:
requested_format:
type: string
file_extension:
type: string
content_type:
type: string
is_base64_encoded:
type: boolean
content:
type: string
required:
- requested_format
- file_extension
- content_type
- is_base64_encoded
- content
SpeechToTextChunkResponseModel:
type: object
properties:
language_code:
type: string
language_probability:
type: number
format: double
text:
type: string
words:
type: array
items:
$ref: '#/components/schemas/SpeechToTextWordResponseModel'
channel_index:
type:
- integer
- 'null'
additional_formats:
type:
- array
- 'null'
items:
oneOf:
- $ref: '#/components/schemas/AdditionalFormatResponseModel'
- type: 'null'
transcription_id:
type:
- string
- 'null'
required:
- language_code
https://elevenlabs.io/docs/api-reference/speech-to-text/convert.md 7/24
10/24/25, 11:15 PM elevenlabs.io/docs/api-reference/speech-to-text/convert.md
- language_probability
- text
- words
MultichannelSpeechToTextResponseModel:
type: object
properties:
transcripts:
type: array
items:
$ref: '#/components/schemas/SpeechToTextChunkResponseModel'
transcription_id:
type:
- string
- 'null'
required:
- transcripts
SpeechToTextWebhookResponseModel:
type: object
properties:
message:
type: string
request_id:
type: string
transcription_id:
type:
- string
- 'null'
required:
- message
- request_id
speech_to_text_convert_Response_200:
oneOf:
- $ref: '#/components/schemas/SpeechToTextChunkResponseModel'
- $ref: '#/components/schemas/MultichannelSpeechToTextResponseModel'
- $ref: '#/components/schemas/SpeechToTextWebhookResponseModel'
```
## SDK Code Examples
```typescript Single channel response
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
async function main() {
const client = new ElevenLabsClient({
environment: "https://api.elevenlabs.io",
});
await client.speechToText.convert({});
}
main();
```
```python Single channel response
from elevenlabs import ElevenLabs
client = ElevenLabs(
base_url="https://api.elevenlabs.io"
client.speech_to_text.convert()
)
```
https://elevenlabs.io/docs/api-reference/speech-to-text/convert.md 8/24
10/24/25, 11:15 PM elevenlabs.io/docs/api-reference/speech-to-text/convert.md
```go Single channel response
package main
import (
"fmt"
"strings"
"net/http"
"io"
)
func main() {
url := "https://api.elevenlabs.io/v1/speech-to-text"
payload := strings.NewReader("-----011000010111000001101001\r\nContent-Disposition:
form-data; name=\"model_id\"\r\n\r\nstring\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"file\"; filename=\"<file1>\"\r\nContent-Type:
application/octet-stream\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition:
form-data; name=\"language_code\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"tag_audio_events\"\r\n\r\n\r\n----
-011000010111000001101001\r\nContent-Disposition: form-data;
name=\"num_speakers\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-
data; name=\"timestamps_granularity\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"diarize\"\r\n\r\n\r\n----
-011000010111000001101001\r\nContent-Disposition: form-data;
name=\"diarization_threshold\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"additional_formats\"\r\n\r\n\r\n----
-011000010111000001101001\r\nContent-Disposition: form-data;
name=\"file_format\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-
data; name=\"cloud_storage_url\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"webhook\"\r\n\r\n\r\n----
-011000010111000001101001\r\nContent-Disposition: form-data;
name=\"webhook_id\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-
data; name=\"temperature\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition:
form-data; name=\"seed\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition:
form-data; name=\"use_multi_channel\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"webhook_metadata\"\r\n\r\n\r\n-----011000010111000001101001--
\r\n")
req, _ := http.NewRequest("POST", url, payload)
req.Header.Add("xi-api-key", "xi-api-key")
req.Header.Add("Content-Type", "multipart/form-data; boundary=--
-011000010111000001101001")
res, _ := http.DefaultClient.Do(req)
defer res.Body.Close()
body, _ := io.ReadAll(res.Body)
fmt.Println(res)
fmt.Println(string(body))
}
```
```ruby Single channel response
require 'uri'
require 'net/http'
url = URI("https://api.elevenlabs.io/v1/speech-to-text")
https://elevenlabs.io/docs/api-reference/speech-to-text/convert.md 9/24
10/24/25, 11:15 PM elevenlabs.io/docs/api-reference/speech-to-text/convert.md
http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true
request = Net::HTTP::Post.new(url)
request["xi-api-key"] = 'xi-api-key'
request["Content-Type"] = 'multipart/form-data; boundary=---011000010111000001101001'
request.body = "-----011000010111000001101001\r\nContent-Disposition: form-data;
name=\"model_id\"\r\n\r\nstring\r\n-----011000010111000001101001\r\nContent-Disposition:
form-data; name=\"file\"; filename=\"<file1>\"\r\nContent-Type: application/octet-
stream\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-data;
name=\"language_code\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition:
form-data; name=\"tag_audio_events\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"num_speakers\"\r\n\r\n\r\n----
-011000010111000001101001\r\nContent-Disposition: form-data;
name=\"timestamps_granularity\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"diarize\"\r\n\r\n\r\n----
-011000010111000001101001\r\nContent-Disposition: form-data;
name=\"diarization_threshold\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"additional_formats\"\r\n\r\n\r\n----
-011000010111000001101001\r\nContent-Disposition: form-data;
name=\"file_format\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-
data; name=\"cloud_storage_url\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"webhook\"\r\n\r\n\r\n----
-011000010111000001101001\r\nContent-Disposition: form-data;
name=\"webhook_id\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-
data; name=\"temperature\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition:
form-data; name=\"seed\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition:
form-data; name=\"use_multi_channel\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"webhook_metadata\"\r\n\r\n\r\n-----011000010111000001101001--
\r\n"
response = http.request(request)
puts response.read_body
```
```java Single channel response
HttpResponse<String> response = Unirest.post("https://api.elevenlabs.io/v1/speech-to-text")
.header("xi-api-key", "xi-api-key")
.header("Content-Type", "multipart/form-data; boundary=---011000010111000001101001")
.body("-----011000010111000001101001\r\nContent-Disposition: form-data;
name=\"model_id\"\r\n\r\nstring\r\n-----011000010111000001101001\r\nContent-Disposition:
form-data; name=\"file\"; filename=\"<file1>\"\r\nContent-Type: application/octet-
stream\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-data;
name=\"language_code\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition:
form-data; name=\"tag_audio_events\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"num_speakers\"\r\n\r\n\r\n----
-011000010111000001101001\r\nContent-Disposition: form-data;
name=\"timestamps_granularity\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"diarize\"\r\n\r\n\r\n----
-011000010111000001101001\r\nContent-Disposition: form-data;
name=\"diarization_threshold\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"additional_formats\"\r\n\r\n\r\n----
-011000010111000001101001\r\nContent-Disposition: form-data;
name=\"file_format\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-
data; name=\"cloud_storage_url\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"webhook\"\r\n\r\n\r\n----
-011000010111000001101001\r\nContent-Disposition: form-data;
name=\"webhook_id\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-
data; name=\"temperature\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition:
form-data; name=\"seed\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition:
form-data; name=\"use_multi_channel\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"webhook_metadata\"\r\n\r\n\r\n-----011000010111000001101001--
\r\n")
https://elevenlabs.io/docs/api-reference/speech-to-text/convert.md 10/24
10/24/25, 11:15 PM elevenlabs.io/docs/api-reference/speech-to-text/convert.md
.asString();
```
```php Single channel response
<?php
$client = new \GuzzleHttp\Client();
$response = $client->request('POST', 'https://api.elevenlabs.io/v1/speech-to-text', [
'multipart' => [
[
'name' => 'model_id',
'contents' => 'string'
],
[
'name' => 'file',
'filename' => '<file1>',
'contents' => null
]
echo $response->getBody();
]
],
]);
```
'headers' => [
'xi-api-key' => 'xi-api-key',
```csharp Single channel response
var client = new RestClient("https://api.elevenlabs.io/v1/speech-to-text");
var request = new RestRequest(Method.POST);
request.AddHeader("xi-api-key", "xi-api-key");
request.AddParameter("multipart/form-data; boundary=---011000010111000001101001", "----
-011000010111000001101001\r\nContent-Disposition: form-data;
name=\"model_id\"\r\n\r\nstring\r\n-----011000010111000001101001\r\nContent-Disposition:
form-data; name=\"file\"; filename=\"<file1>\"\r\nContent-Type: application/octet-
stream\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-data;
name=\"language_code\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition:
form-data; name=\"tag_audio_events\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"num_speakers\"\r\n\r\n\r\n----
-011000010111000001101001\r\nContent-Disposition: form-data;
name=\"timestamps_granularity\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"diarize\"\r\n\r\n\r\n----
-011000010111000001101001\r\nContent-Disposition: form-data;
name=\"diarization_threshold\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"additional_formats\"\r\n\r\n\r\n----
-011000010111000001101001\r\nContent-Disposition: form-data;
name=\"file_format\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-
data; name=\"cloud_storage_url\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"webhook\"\r\n\r\n\r\n----
-011000010111000001101001\r\nContent-Disposition: form-data;
name=\"webhook_id\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-
data; name=\"temperature\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition:
form-data; name=\"seed\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition:
form-data; name=\"use_multi_channel\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"webhook_metadata\"\r\n\r\n\r\n-----011000010111000001101001--
\r\n", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```
```swift Single channel response
import Foundation
https://elevenlabs.io/docs/api-reference/speech-to-text/convert.md 11/24
10/24/25, 11:15 PM elevenlabs.io/docs/api-reference/speech-to-text/convert.md
let headers = [
"xi-api-key": "xi-api-key",
"Content-Type": "multipart/form-data; boundary=---011000010111000001101001"
]
let parameters = [
[
],
[
],
[
],
[
],
[
"name": "model_id",
"value": "string"
"name": "file",
"fileName": "<file1>"
"name": "language_code",
"value":
"name": "tag_audio_events",
"value":
"name": "num_speakers",
"value":
],
[
"name": "timestamps_granularity",
"value":
],
[
"name": "diarize",
"value":
],
[
],
[
"name": "diarization_threshold",
"value":
"name": "additional_formats",
"value":
],
[
],
[
"name": "file_format",
"value":
"name": "cloud_storage_url",
"value":
],
[
"name": "webhook",
"value":
],
[
"name": "webhook_id",
"value":
],
[
"name": "temperature",
"value":
],
[
"name": "seed",
https://elevenlabs.io/docs/api-reference/speech-to-text/convert.md 12/24
10/24/25, 11:15 PM elevenlabs.io/docs/api-reference/speech-to-text/convert.md
"value":
],
[
"name": "use_multi_channel",
"value":
],
[
"name": "webhook_metadata",
"value":
]
]
let boundary = "---011000010111000001101001"
var body = ""
var error: NSError? = nil
for param in parameters {
let paramName = param["name"]!
body += "--\(boundary)\r\n"
body += "Content-Disposition:form-data; name=\"\(paramName)\""
if let filename = param["fileName"] {
let contentType = param["content-type"]!
let fileContent = String(contentsOfFile: filename, encoding: String.Encoding.utf8)
if (error != nil) {
print(error as Any)
}
body += "; filename=\"\(filename)\"\r\n"
body += "Content-Type: \(contentType)\r\n\r\n"
body += fileContent
} else if let paramValue = param["value"] {
body += "\r\n\r\n\(paramValue)"
}
}
let request = NSMutableURLRequest(url: NSURL(string: "https://api.elevenlabs.io/v1/speech-
to-text")! as URL,
cachePolicy: .useProtocolCachePolicy,
timeoutInterval: 10.0)
request.httpMethod = "POST"
request.allHTTPHeaderFields = headers
request.httpBody = postData as Data
let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data,
response, error) -> Void in
if (error != nil) {
print(error as Any)
} else {
let httpResponse = response as? HTTPURLResponse
print(httpResponse)
}
})
dataTask.resume()
```
```typescript Multichannel response
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
async function main() {
const client = new ElevenLabsClient({
environment: "https://api.elevenlabs.io",
});
https://elevenlabs.io/docs/api-reference/speech-to-text/convert.md 13/24
10/24/25, 11:15 PM elevenlabs.io/docs/api-reference/speech-to-text/convert.md
await client.speechToText.convert({});
}
main();
```
```python Multichannel response
from elevenlabs import ElevenLabs
client = ElevenLabs(
base_url="https://api.elevenlabs.io"
client.speech_to_text.convert()
)
```
```go Multichannel response
package main
import (
"fmt"
"strings"
"net/http"
"io"
)
func main() {
url := "https://api.elevenlabs.io/v1/speech-to-text"
payload := strings.NewReader("-----011000010111000001101001\r\nContent-Disposition:
form-data; name=\"model_id\"\r\n\r\nstring\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"file\"; filename=\"<file1>\"\r\nContent-Type:
application/octet-stream\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition:
form-data; name=\"language_code\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"tag_audio_events\"\r\n\r\n\r\n----
-011000010111000001101001\r\nContent-Disposition: form-data;
name=\"num_speakers\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-
data; name=\"timestamps_granularity\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"diarize\"\r\n\r\n\r\n----
-011000010111000001101001\r\nContent-Disposition: form-data;
name=\"diarization_threshold\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"additional_formats\"\r\n\r\n\r\n----
-011000010111000001101001\r\nContent-Disposition: form-data;
name=\"file_format\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-
data; name=\"cloud_storage_url\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"webhook\"\r\n\r\n\r\n----
-011000010111000001101001\r\nContent-Disposition: form-data;
name=\"webhook_id\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-
data; name=\"temperature\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition:
form-data; name=\"seed\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition:
form-data; name=\"use_multi_channel\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"webhook_metadata\"\r\n\r\n\r\n-----011000010111000001101001--
\r\n")
req, _ := http.NewRequest("POST", url, payload)
req.Header.Add("xi-api-key", "xi-api-key")
req.Header.Add("Content-Type", "multipart/form-data; boundary=--
-011000010111000001101001")
res, _ := http.DefaultClient.Do(req)
https://elevenlabs.io/docs/api-reference/speech-to-text/convert.md 14/24
10/24/25, 11:15 PM elevenlabs.io/docs/api-reference/speech-to-text/convert.md
defer res.Body.Close()
body, _ := io.ReadAll(res.Body)
fmt.Println(res)
fmt.Println(string(body))
}
```
```ruby Multichannel response
require 'uri'
require 'net/http'
url = URI("https://api.elevenlabs.io/v1/speech-to-text")
http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true
request = Net::HTTP::Post.new(url)
request["xi-api-key"] = 'xi-api-key'
request["Content-Type"] = 'multipart/form-data; boundary=---011000010111000001101001'
request.body = "-----011000010111000001101001\r\nContent-Disposition: form-data;
name=\"model_id\"\r\n\r\nstring\r\n-----011000010111000001101001\r\nContent-Disposition:
form-data; name=\"file\"; filename=\"<file1>\"\r\nContent-Type: application/octet-
stream\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-data;
name=\"language_code\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition:
form-data; name=\"tag_audio_events\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"num_speakers\"\r\n\r\n\r\n----
-011000010111000001101001\r\nContent-Disposition: form-data;
name=\"timestamps_granularity\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"diarize\"\r\n\r\n\r\n----
-011000010111000001101001\r\nContent-Disposition: form-data;
name=\"diarization_threshold\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"additional_formats\"\r\n\r\n\r\n----
-011000010111000001101001\r\nContent-Disposition: form-data;
name=\"file_format\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-
data; name=\"cloud_storage_url\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"webhook\"\r\n\r\n\r\n----
-011000010111000001101001\r\nContent-Disposition: form-data;
name=\"webhook_id\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-
data; name=\"temperature\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition:
form-data; name=\"seed\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition:
form-data; name=\"use_multi_channel\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"webhook_metadata\"\r\n\r\n\r\n-----011000010111000001101001--
\r\n"
response = http.request(request)
puts response.read_body
```
```java Multichannel response
HttpResponse<String> response = Unirest.post("https://api.elevenlabs.io/v1/speech-to-text")
.header("xi-api-key", "xi-api-key")
.header("Content-Type", "multipart/form-data; boundary=---011000010111000001101001")
.body("-----011000010111000001101001\r\nContent-Disposition: form-data;
name=\"model_id\"\r\n\r\nstring\r\n-----011000010111000001101001\r\nContent-Disposition:
form-data; name=\"file\"; filename=\"<file1>\"\r\nContent-Type: application/octet-
stream\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-data;
name=\"language_code\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition:
form-data; name=\"tag_audio_events\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"num_speakers\"\r\n\r\n\r\n----
-011000010111000001101001\r\nContent-Disposition: form-data;
https://elevenlabs.io/docs/api-reference/speech-to-text/convert.md 15/24
10/24/25, 11:15 PM elevenlabs.io/docs/api-reference/speech-to-text/convert.md
name=\"timestamps_granularity\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"diarize\"\r\n\r\n\r\n----
-011000010111000001101001\r\nContent-Disposition: form-data;
name=\"diarization_threshold\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"additional_formats\"\r\n\r\n\r\n----
-011000010111000001101001\r\nContent-Disposition: form-data;
name=\"file_format\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-
data; name=\"cloud_storage_url\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"webhook\"\r\n\r\n\r\n----
-011000010111000001101001\r\nContent-Disposition: form-data;
name=\"webhook_id\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-
data; name=\"temperature\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition:
form-data; name=\"seed\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition:
form-data; name=\"use_multi_channel\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"webhook_metadata\"\r\n\r\n\r\n-----011000010111000001101001--
\r\n")
.asString();
```
```php Multichannel response
<?php
$client = new \GuzzleHttp\Client();
$response = $client->request('POST', 'https://api.elevenlabs.io/v1/speech-to-text', [
'multipart' => [
[
'name' => 'model_id',
'contents' => 'string'
],
[
'name' => 'file',
'filename' => '<file1>',
'contents' => null
]
echo $response->getBody();
]
],
]);
```
'headers' => [
'xi-api-key' => 'xi-api-key',
```csharp Multichannel response
var client = new RestClient("https://api.elevenlabs.io/v1/speech-to-text");
var request = new RestRequest(Method.POST);
request.AddHeader("xi-api-key", "xi-api-key");
request.AddParameter("multipart/form-data; boundary=---011000010111000001101001", "----
-011000010111000001101001\r\nContent-Disposition: form-data;
name=\"model_id\"\r\n\r\nstring\r\n-----011000010111000001101001\r\nContent-Disposition:
form-data; name=\"file\"; filename=\"<file1>\"\r\nContent-Type: application/octet-
stream\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-data;
name=\"language_code\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition:
form-data; name=\"tag_audio_events\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"num_speakers\"\r\n\r\n\r\n----
-011000010111000001101001\r\nContent-Disposition: form-data;
name=\"timestamps_granularity\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"diarize\"\r\n\r\n\r\n----
-011000010111000001101001\r\nContent-Disposition: form-data;
name=\"diarization_threshold\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"additional_formats\"\r\n\r\n\r\n----
-011000010111000001101001\r\nContent-Disposition: form-data;
https://elevenlabs.io/docs/api-reference/speech-to-text/convert.md 16/24
10/24/25, 11:15 PM elevenlabs.io/docs/api-reference/speech-to-text/convert.md
name=\"file_format\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-
data; name=\"cloud_storage_url\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"webhook\"\r\n\r\n\r\n----
-011000010111000001101001\r\nContent-Disposition: form-data;
name=\"webhook_id\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-
data; name=\"temperature\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition:
form-data; name=\"seed\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition:
form-data; name=\"use_multi_channel\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"webhook_metadata\"\r\n\r\n\r\n-----011000010111000001101001--
\r\n", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```
```swift Multichannel response
import Foundation
let headers = [
"xi-api-key": "xi-api-key",
"Content-Type": "multipart/form-data; boundary=---011000010111000001101001"
]
let parameters = [
[
"name": "model_id",
"value": "string"
],
[
"name": "file",
"fileName": "<file1>"
],
[
"name": "language_code",
"value":
],
[
"name": "tag_audio_events",
"value":
],
[
"name": "num_speakers",
"value":
],
[
],
[
"name": "timestamps_granularity",
"value":
"name": "diarize",
"value":
],
[
"name": "diarization_threshold",
"value":
],
[
"name": "additional_formats",
"value":
],
[
"name": "file_format",
"value":
],
[
"name": "cloud_storage_url",
https://elevenlabs.io/docs/api-reference/speech-to-text/convert.md 17/24
10/24/25, 11:15 PM elevenlabs.io/docs/api-reference/speech-to-text/convert.md
"value":
],
[
],
[
],
[
],
[
],
[
"name": "webhook",
"value":
"name": "webhook_id",
"value":
"name": "temperature",
"value":
"name": "seed",
"value":
"name": "use_multi_channel",
"value":
],
[
"name": "webhook_metadata",
"value":
]
]
let boundary = "---011000010111000001101001"
var body = ""
var error: NSError? = nil
for param in parameters {
let paramName = param["name"]!
body += "--\(boundary)\r\n"
body += "Content-Disposition:form-data; name=\"\(paramName)\""
if let filename = param["fileName"] {
let contentType = param["content-type"]!
let fileContent = String(contentsOfFile: filename, encoding: String.Encoding.utf8)
if (error != nil) {
print(error as Any)
}
body += "; filename=\"\(filename)\"\r\n"
body += "Content-Type: \(contentType)\r\n\r\n"
body += fileContent
} else if let paramValue = param["value"] {
body += "\r\n\r\n\(paramValue)"
}
}
let request = NSMutableURLRequest(url: NSURL(string: "https://api.elevenlabs.io/v1/speech-
to-text")! as URL,
cachePolicy: .useProtocolCachePolicy,
timeoutInterval: 10.0)
request.httpMethod = "POST"
request.allHTTPHeaderFields = headers
request.httpBody = postData as Data
let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data,
response, error) -> Void in
if (error != nil) {
print(error as Any)
https://elevenlabs.io/docs/api-reference/speech-to-text/convert.md 18/24
10/24/25, 11:15 PM elevenlabs.io/docs/api-reference/speech-to-text/convert.md
} else {
let httpResponse = response as? HTTPURLResponse
print(httpResponse)
}
})
dataTask.resume()
```
```typescript
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
async function main() {
const client = new ElevenLabsClient({
environment: "https://api.elevenlabs.io",
});
await client.speechToText.convert({});
}
main();
```
```python
from elevenlabs import ElevenLabs
client = ElevenLabs(
base_url="https://api.elevenlabs.io"
)
client.speech_to_text.convert()
```
```go
package main
import (
"fmt"
"strings"
"net/http"
"io"
)
func main() {
url := "https://api.elevenlabs.io/v1/speech-to-text"
payload := strings.NewReader("-----011000010111000001101001\r\nContent-Disposition:
form-data; name=\"model_id\"\r\n\r\nstring\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"file\"; filename=\"<file1>\"\r\nContent-Type:
application/octet-stream\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition:
form-data; name=\"language_code\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"tag_audio_events\"\r\n\r\n\r\n----
-011000010111000001101001\r\nContent-Disposition: form-data;
name=\"num_speakers\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-
data; name=\"timestamps_granularity\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"diarize\"\r\n\r\n\r\n----
-011000010111000001101001\r\nContent-Disposition: form-data;
name=\"diarization_threshold\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"additional_formats\"\r\n\r\n\r\n----
-011000010111000001101001\r\nContent-Disposition: form-data;
name=\"file_format\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-
data; name=\"cloud_storage_url\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
https://elevenlabs.io/docs/api-reference/speech-to-text/convert.md 19/24
10/24/25, 11:15 PM elevenlabs.io/docs/api-reference/speech-to-text/convert.md
Disposition: form-data; name=\"webhook\"\r\n\r\n\r\n----
-011000010111000001101001\r\nContent-Disposition: form-data;
name=\"webhook_id\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-
data; name=\"temperature\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition:
form-data; name=\"seed\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition:
form-data; name=\"use_multi_channel\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"webhook_metadata\"\r\n\r\n\r\n-----011000010111000001101001--
\r\n")
req, _ := http.NewRequest("POST", url, payload)
req.Header.Add("xi-api-key", "xi-api-key")
req.Header.Add("Content-Type", "multipart/form-data; boundary=--
-011000010111000001101001")
res, _ := http.DefaultClient.Do(req)
defer res.Body.Close()
body, _ := io.ReadAll(res.Body)
fmt.Println(res)
fmt.Println(string(body))
}
```
```ruby
require 'uri'
require 'net/http'
url = URI("https://api.elevenlabs.io/v1/speech-to-text")
http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true
request = Net::HTTP::Post.new(url)
request["xi-api-key"] = 'xi-api-key'
request["Content-Type"] = 'multipart/form-data; boundary=---011000010111000001101001'
request.body = "-----011000010111000001101001\r\nContent-Disposition: form-data;
name=\"model_id\"\r\n\r\nstring\r\n-----011000010111000001101001\r\nContent-Disposition:
form-data; name=\"file\"; filename=\"<file1>\"\r\nContent-Type: application/octet-
stream\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-data;
name=\"language_code\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition:
form-data; name=\"tag_audio_events\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"num_speakers\"\r\n\r\n\r\n----
-011000010111000001101001\r\nContent-Disposition: form-data;
name=\"timestamps_granularity\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"diarize\"\r\n\r\n\r\n----
-011000010111000001101001\r\nContent-Disposition: form-data;
name=\"diarization_threshold\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"additional_formats\"\r\n\r\n\r\n----
-011000010111000001101001\r\nContent-Disposition: form-data;
name=\"file_format\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-
data; name=\"cloud_storage_url\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"webhook\"\r\n\r\n\r\n----
-011000010111000001101001\r\nContent-Disposition: form-data;
name=\"webhook_id\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-
data; name=\"temperature\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition:
form-data; name=\"seed\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition:
form-data; name=\"use_multi_channel\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"webhook_metadata\"\r\n\r\n\r\n-----011000010111000001101001--
\r\n"
https://elevenlabs.io/docs/api-reference/speech-to-text/convert.md 20/24
10/24/25, 11:15 PM elevenlabs.io/docs/api-reference/speech-to-text/convert.md
response = http.request(request)
puts response.read_body
```
```java
HttpResponse<String> response = Unirest.post("https://api.elevenlabs.io/v1/speech-to-text")
.header("xi-api-key", "xi-api-key")
.header("Content-Type", "multipart/form-data; boundary=---011000010111000001101001")
.body("-----011000010111000001101001\r\nContent-Disposition: form-data;
name=\"model_id\"\r\n\r\nstring\r\n-----011000010111000001101001\r\nContent-Disposition:
form-data; name=\"file\"; filename=\"<file1>\"\r\nContent-Type: application/octet-
stream\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-data;
name=\"language_code\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition:
form-data; name=\"tag_audio_events\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"num_speakers\"\r\n\r\n\r\n----
-011000010111000001101001\r\nContent-Disposition: form-data;
name=\"timestamps_granularity\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"diarize\"\r\n\r\n\r\n----
-011000010111000001101001\r\nContent-Disposition: form-data;
name=\"diarization_threshold\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"additional_formats\"\r\n\r\n\r\n----
-011000010111000001101001\r\nContent-Disposition: form-data;
name=\"file_format\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-
data; name=\"cloud_storage_url\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"webhook\"\r\n\r\n\r\n----
-011000010111000001101001\r\nContent-Disposition: form-data;
name=\"webhook_id\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-
data; name=\"temperature\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition:
form-data; name=\"seed\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition:
form-data; name=\"use_multi_channel\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"webhook_metadata\"\r\n\r\n\r\n-----011000010111000001101001--
\r\n")
.asString();
```
```php
<?php
$client = new \GuzzleHttp\Client();
$response = $client->request('POST', 'https://api.elevenlabs.io/v1/speech-to-text', [
'multipart' => [
[
'name' => 'model_id',
'contents' => 'string'
],
[
'name' => 'file',
'filename' => '<file1>',
'contents' => null
]
echo $response->getBody();
]
],
]);
```
'headers' => [
'xi-api-key' => 'xi-api-key',
```csharp
var client = new RestClient("https://api.elevenlabs.io/v1/speech-to-text");
var request = new RestRequest(Method.POST);
https://elevenlabs.io/docs/api-reference/speech-to-text/convert.md 21/24
10/24/25, 11:15 PM elevenlabs.io/docs/api-reference/speech-to-text/convert.md
request.AddHeader("xi-api-key", "xi-api-key");
request.AddParameter("multipart/form-data; boundary=---011000010111000001101001", "----
-011000010111000001101001\r\nContent-Disposition: form-data;
name=\"model_id\"\r\n\r\nstring\r\n-----011000010111000001101001\r\nContent-Disposition:
form-data; name=\"file\"; filename=\"<file1>\"\r\nContent-Type: application/octet-
stream\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-data;
name=\"language_code\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition:
form-data; name=\"tag_audio_events\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"num_speakers\"\r\n\r\n\r\n----
-011000010111000001101001\r\nContent-Disposition: form-data;
name=\"timestamps_granularity\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"diarize\"\r\n\r\n\r\n----
-011000010111000001101001\r\nContent-Disposition: form-data;
name=\"diarization_threshold\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"additional_formats\"\r\n\r\n\r\n----
-011000010111000001101001\r\nContent-Disposition: form-data;
name=\"file_format\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-
data; name=\"cloud_storage_url\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"webhook\"\r\n\r\n\r\n----
-011000010111000001101001\r\nContent-Disposition: form-data;
name=\"webhook_id\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-
data; name=\"temperature\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition:
form-data; name=\"seed\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition:
form-data; name=\"use_multi_channel\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-
Disposition: form-data; name=\"webhook_metadata\"\r\n\r\n\r\n-----011000010111000001101001--
\r\n", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```
```swift
import Foundation
let headers = [
"xi-api-key": "xi-api-key",
"Content-Type": "multipart/form-data; boundary=---011000010111000001101001"
]
let parameters = [
[
"name": "model_id",
"value": "string"
],
[
"name": "file",
"fileName": "<file1>"
],
[
"name": "language_code",
"value":
],
[
"name": "tag_audio_events",
"value":
],
[
"name": "num_speakers",
"value":
],
[
"name": "timestamps_granularity",
"value":
],
[
"name": "diarize",
https://elevenlabs.io/docs/api-reference/speech-to-text/convert.md 22/24
10/24/25, 11:15 PM elevenlabs.io/docs/api-reference/speech-to-text/convert.md
"value":
],
[
"name": "diarization_threshold",
"value":
],
[
"name": "additional_formats",
"value":
],
[
"name": "file_format",
"value":
],
[
"name": "cloud_storage_url",
"value":
],
[
],
[
"name": "webhook",
"value":
"name": "webhook_id",
"value":
],
[
"name": "temperature",
"value":
],
[
"name": "seed",
"value":
],
[
"name": "use_multi_channel",
"value":
],
[
"name": "webhook_metadata",
"value":
]
]
let boundary = "---011000010111000001101001"
var body = ""
var error: NSError? = nil
for param in parameters {
let paramName = param["name"]!
body += "--\(boundary)\r\n"
body += "Content-Disposition:form-data; name=\"\(paramName)\""
if let filename = param["fileName"] {
let contentType = param["content-type"]!
let fileContent = String(contentsOfFile: filename, encoding: String.Encoding.utf8)
if (error != nil) {
print(error as Any)
}
body += "; filename=\"\(filename)\"\r\n"
body += "Content-Type: \(contentType)\r\n\r\n"
body += fileContent
} else if let paramValue = param["value"] {
body += "\r\n\r\n\(paramValue)"
https://elevenlabs.io/docs/api-reference/speech-to-text/convert.md 23/24
10/24/25, 11:15 PM elevenlabs.io/docs/api-reference/speech-to-text/convert.md
}
}
let request = NSMutableURLRequest(url: NSURL(string: "https://api.elevenlabs.io/v1/speech-
to-text")! as URL,
cachePolicy: .useProtocolCachePolicy,
timeoutInterval: 10.0)
request.httpMethod = "POST"
request.allHTTPHeaderFields = headers
request.httpBody = postData as Data
let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data,
response, error) -> Void in
if (error != nil) {
print(error as Any)
} else {
let httpResponse = response as? HTTPURLResponse
print(httpResponse)
}
})
dataTask.resume()
```
https://elevenlabs.io/docs/api-reference/speech-to-text/convert.md 24/24