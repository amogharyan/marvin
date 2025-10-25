10/24/25, 10:57 PM ai.google.dev/gemini-api/docs.md.txt
# Gemini Developer API
[Get a Gemini API Key](https://aistudio.google.com/apikey)
Get a Gemini API key and make your first API request in minutes.
### Python
from google import genai
client = genai.Client()
response = client.models.generate_content(
model="gemini-2.5-flash",
contents="Explain how AI works in a few words",
)
print(response.text)
### JavaScript
import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({});
async function main() {
const response = await ai.models.generateContent({
model: "gemini-2.5-flash",
contents: "Explain how AI works in a few words",
});
console.log(response.text);
}
await main();
### Go
package main
import (
"context"
"fmt"
"log"
"google.golang.org/genai"
)
func main() {
ctx := context.Background()
client, err := genai.NewClient(ctx, nil)
if err != nil {
log.Fatal(err)
}
result, err := client.Models.GenerateContent(
ctx,
"gemini-2.5-flash",
genai.Text("Explain how AI works in a few words"),
nil,
)
if err != nil {
log.Fatal(err)
}
https://ai.google.dev/gemini-api/docs.md.txt 1/3
10/24/25, 10:57 PM ai.google.dev/gemini-api/docs.md.txt
fmt.Println(result.Text())
}
### Java
package com.example;
import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
public class GenerateTextFromTextInput {
public static void main(String[] args) {
Client client = new Client();
GenerateContentResponse response =
client.models.generateContent(
"gemini-2.5-flash",
"Explain how AI works in a few words",
null);
System.out.println(response.text());
}
}
### REST
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-
flash:generateContent" \
-H "x-goog-api-key: $GEMINI_API_KEY" \
-H 'Content-Type: application/json' \
-X POST \
-d '{
"contents": [
{
"parts": [
{
"text": "Explain how AI works in a few words"
}
]
}
]
}'
## Meet the models
[Start building with Gemini](https://aistudio.google.com/apps)
2.5 Pro
spark
Our most powerful thinking model with features for complex reasoning and much more
[](https://ai.google.dev/gemini-api/docs/models#gemini-2.5-pro)
2.5 Flash
spark
Our most balanced model, with a 1 million token context window and more
[](https://ai.google.dev/gemini-api/docs/models/gemini#gemini-2.5-flash)
2.5 Flash-Lite
https://ai.google.dev/gemini-api/docs.md.txt 2/3
10/24/25, 10:57 PM ai.google.dev/gemini-api/docs.md.txt
spark
Our fastest and most cost-efficient multimodal model with great performance
for high-frequency tasks
[](https://ai.google.dev/gemini-api/docs/models/gemini#gemini-2.5-flash-lite)
Veo 3
video_library
Our state of the art video generation model, with native audio
[](https://ai.google.dev/gemini-api/docs/video)
Gemini 2.5 Flash Image
imagesmode
(Nano Banana), our highly effective and precise image generation model
[](https://ai.google.dev/gemini-api/docs/image-generation)
Gemini Embeddings
data_array
Our first Gemini embedding model, designed for production RAG workflows
[](https://ai.google.dev/gemini-api/docs/embeddings)
## Explore the API
![](https://ai.google.dev/static/site-assets/images/image-generation-index.png)
### Native Image Generation (aka Nano Banana)
Generate and edit highly contextual images natively with Gemini 2.5 Flash Image.
[](https://ai.google.dev/gemini-api/docs/image-generation)
![](https://ai.google.dev/static/site-assets/images/long-context-overview.png)
### Explore long context
Input millions of tokens to Gemini models and derive understanding from unstructured images,
videos, and documents.
[](https://ai.google.dev/gemini-api/docs/long-context)
![](https://ai.google.dev/static/site-assets/images/structured-outputs-index.png)
### Generate structured outputs
Constrain Gemini to respond with JSON, a structured data format suitable for automated
processing.
[](https://ai.google.dev/gemini-api/docs/structured-output)
### Start building with the Gemini API
[Get started](https://ai.google.dev/gemini-api/docs/quickstart)
https://ai.google.dev/gemini-api/docs.md.txt 3/3

10/24/25, 10:58 PM ai.google.dev/api.md.txt
# Gemini API reference
<br />
This API reference describes the standard, streaming, and realtime APIs you can
use to interact with the Gemini models. You can use the REST APIs in any
environment that supports HTTP requests. Refer to the
[Quickstart guide](https://ai.google.dev/gemini-api/docs/quickstart) for how to
get started with your first API call. If you're looking for the references for
our language-specific libraries and SDKs, go to the link for that language in
the left navigation under **SDK references**.
## Primary endpoints
The Gemini API is organized around the following major endpoints:
- **Standard content generation ([`generateContent`](https://ai.google.dev/api/generate-
content#method:-models.generatecontent)):** A standard REST endpoint that processes your
request and returns the model's full response in a single package. This is best for non-
interactive tasks where you can wait for the entire result.
- **Streaming content generation ([`streamGenerateContent`]
(https://ai.google.dev/api/generate-content#method:-models.streamGenerateContent)):** Uses
Server-Sent Events (SSE) to push chunks of the response to you as they are generated. This
provides a faster, more interactive experience for applications like chatbots.
- **Live API ([`BidiGenerateContent`](https://ai.google.dev/api/live#send-messages)):** A
stateful WebSocket-based API for bi-directional streaming, designed for real-time
conversational use cases.
- **Batch mode ([`batchGenerateContent`](https://ai.google.dev/api/batch-mode)):** A
standard REST endpoint for submitting batches of `generateContent` requests.
- **Embeddings ([`embedContent`](https://ai.google.dev/api/embeddings)):** A standard REST
endpoint that generates a text embedding vector from the input `Content`.
- **Gen Media APIs:** Endpoints for generating media with our specialized models such as
[Imagen for image generation](https://ai.google.dev/api/models#method:-models.predict), and
[Veo for video generation](https://ai.google.dev/api/models#method:-
models.predictlongrunning). Gemini also has these capabilities built in which you can access
using the `generateContent` API.
- **Platform APIs:** Utility endpoints that support core capabilities such as [uploading
files](https://ai.google.dev/api/files), and [counting tokens]
(https://ai.google.dev/api/tokens).
## Authentication
All requests to the Gemini API must include an `x-goog-api-key` header with your
API key. Create one with a few clicks in [Google AI
Studio](https://aistudio.google.com/app/apikey).
The following is an example request with the API key included in the header:
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-
flash:generateContent" \
-H "x-goog-api-key: $GEMINI_API_KEY" \
-H 'Content-Type: application/json' \
-X POST \
-d '{
"contents": [
{
"parts": [
{
"text": "Explain how AI works in a few words"
}
]
}
https://ai.google.dev/api.md.txt 1/6
10/24/25, 10:58 PM ai.google.dev/api.md.txt
]
}'
For instructions on how to pass your key to the API using Gemini SDKs,
see the [Using Gemini API keys](https://ai.google.dev/gemini-api/docs/api-key) guide.
## Content generation
This is the central endpoint for sending prompts to the model. There are two
endpoints for generating content, the key difference is how you receive the
response:
- **[`generateContent`](https://ai.google.dev/api/generate-content#method:-
models.generatecontent)
(REST)**: Receives a request and provides a single response after the model has finished
its entire generation.
- **[`streamGenerateContent`](https://ai.google.dev/api/generate-content#method:-
models.streamgeneratecontent)
(SSE)**: Receives the exact same request, but the model streams back chunks of the
response as they are generated. This provides a better user experience for interactive
applications as it lets you display partial results immediately.
### Request body structure
The [request body](https://ai.google.dev/api/generate-content#request-body) is a JSON object
that is
**identical** for both standard and streaming modes and is built from a few core
objects:
- [`Content`](https://ai.google.dev/api/caching#Content) object: Represents a single turn in
a conversation.
- [`Part`](https://ai.google.dev/api/caching#Part) object: A piece of data within a
`Content` turn (like text or an image).
- `inline_data` ([`Blob`](https://ai.google.dev/api/caching#Blob)): A container for raw
media bytes and their MIME type.
At the highest level, the request body contains a `contents` object, which is a
list of `Content` objects, each representing turns in conversation. In most
cases, for basic text generation, you will have a single `Content` object, but
if you'd like to maintain conversation history, you can use multiple `Content`
objects.
The following shows a typical `generateContent` request body:
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-
flash:generateContent" \
-H "x-goog-api-key: $GEMINI_API_KEY" \
-H 'Content-Type: application/json' \
-X POST \
-d '{
"contents": [
{
"role": "user",
"parts": [
// A list of Part objects goes here
]
},
{
"role": "model",
"parts": [
// A list of Part objects goes here
]
}
https://ai.google.dev/api.md.txt 2/6
10/24/25, 10:58 PM ai.google.dev/api.md.txt
]
}'
### Response body structure
The [response body](https://ai.google.dev/api/generate-content#response-body) is similar for
both
the streaming and standard modes except for the following:
- Standard mode: The response body contains an instance of [`GenerateContentResponse`]
(https://ai.google.dev/api/generate-content#v1beta.GenerateContentResponse).
- Streaming mode: The response body contains a stream of [`GenerateContentResponse`]
(https://ai.google.dev/api/generate-content#v1beta.GenerateContentResponse) instances.
At a high level, the response body contains a `candidates` object, which is a
list of `Candidate` objects. The `Candidate` object contains a `Content`
object that has the generated response returned from the model.
## Request examples
The following examples show how these components come together for different
types of requests.
### Text-only prompt
A simple text prompt consists of a `contents` array with a single `Content`
object. That object's `parts` array, in turn, contains a single `Part` object
with a `text` field.
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-
flash:generateContent" \
-H "x-goog-api-key: $GEMINI_API_KEY" \
-H 'Content-Type: application/json' \
-X POST \
-d '{
"contents": [
{
"parts": [
{
"text": "Explain how AI works in a single paragraph."
}
]
}
]
}'
### Multimodal prompt (text and image)
To provide both text and an image in a prompt, the `parts` array should contain
two `Part` objects: one for the text, and one for the image `inline_data`.
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-
flash:generateContent" \
-H "x-goog-api-key: $GEMINI_API_KEY" \
-H 'Content-Type: application/json' \
-X POST \
-d '{
"contents": [{
"parts":[
{
"inline_data": {
"mime_type":"image/jpeg",
"data": "/9j/4AAQSkZJRgABAQ... (base64-encoded image)"
https://ai.google.dev/api.md.txt 3/6
10/24/25, 10:58 PM ai.google.dev/api.md.txt
}
},
{"text": "What is in this picture?"},
]
}]
}'
### Multi-turn conversations (chat)
To build a conversation with multiple turns, you define the `contents` array
with multiple `Content` objects. The API will use this entire history as context
for the next response. The `role` for each `Content` object should alternate
between `user` and `model`.
**Note:** The client SDKs provide a chat interface that manages this list for you
automatically. When using the REST API, you are responsible for maintaining the conversation
history.
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-
flash:generateContent" \
-H "x-goog-api-key: $GEMINI_API_KEY" \
-H 'Content-Type: application/json' \
-X POST \
-d '{
"contents": [
{
"role": "user",
"parts": [
{ "text": "Hello." }
]
},
{
"role": "model",
"parts": [
{ "text": "Hello! How can I help you today?" }
]
},
{
"role": "user",
"parts": [
{ "text": "Please write a four-line poem about the ocean." }
]
}
]
}'
### Key takeaways
- `Content` is the envelope: It's the top-level container for a message turn, whether it's
from the user or the model.
- `Part` enables multimodality: Use multiple `Part` objects within a single `Content` object
to combine different types of data (text, image, video URI, etc.).
- Choose your data method:
- For small, directly embedded media (like most images), use a `Part` with `inline_data`.
- For larger files or files you want to reuse across requests, use the File API to upload
the file and reference it with a `file_data` part.
- Manage conversation history: For chat applications using the REST API, build the
`contents` array by appending `Content` objects for each turn, alternating between `"user"`
and `"model"` roles. If you're using an SDK, refer to the SDK documentation for the
recommended way to manage conversation history.
## Response examples
The following examples show how these components come together for different
https://ai.google.dev/api.md.txt 4/6
10/24/25, 10:58 PM ai.google.dev/api.md.txt
types of requests.
### Text-only response
A simple text response consists of a `candidates` array with one or more
`content` objects that contain the model's response.
The following is an example of a **standard** response:
{
"candidates": [
{
"content": {
"parts": [
{
amounts of data ..."
}
],
"role": "model"
},
"finishReason": "STOP",
"index": 1
"text": "At its core, Artificial Intelligence works by learning from vast
}
],
}
The following is series of **streaming** responses. Each response contains a
`responseId` that ties the full response together:
{
"candidates": [
{
"content": {
"parts": [
{
"text": "The image displays"
}
],
"role": "model"
},
"index": 0
}
],
"usageMetadata": {
"promptTokenCount": ...
},
"modelVersion": "gemini-2.5-flash-lite",
"responseId": "mAitaLmkHPPlz7IPvtfUqQ4"
}
...
{
"candidates": [
{
"content": {
"parts": [
{
"text": " the following materials:\n\n* violin are primarily"
}
],
**Wood:** The accordion and the
https://ai.google.dev/api.md.txt 5/6
10/24/25, 10:58 PM ai.google.dev/api.md.txt
"role": "model"
},
"index": 0
}
],
"usageMetadata": {
"promptTokenCount": ...
}
"modelVersion": "gemini-2.5-flash-lite",
"responseId": "mAitaLmkHPPlz7IPvtfUqQ4"
}
## Live API (BidiGenerateContent) WebSockets API
Live API offers a stateful WebSocket based API for bi-directional streaming to
enable real-time streaming use cases. You can review
[Live API guide](https://ai.google.dev/gemini-api/docs/live) and the [Live API reference]
(https://ai.google.dev/api/live)
for more details.
## Specialized models
In addition to the Gemini family of models, Gemini API offers endpoints for
specialized models such as [Imagen](https://ai.google.dev/gemini-api/docs/imagen),
[Lyria](https://ai.google.dev/gemini-api/docs/music-generation) and
[embedding](https://ai.google.dev/gemini-api/docs/embeddings) models. You can check out
these guides under the Models section.
## Platform APIs
The rest of the endpoints enable additional capabilities to use with the main
endpoints described so far. Check out topics
[Batch mode](https://ai.google.dev/gemini-api/docs/batch-mode) and
[File API](https://ai.google.dev/gemini-api/docs/files) in the Guides section to learn more.
## What's next
If you're just getting started, check out the following guides, which will help
you understand the Gemini API programming model:
- [Gemini API quickstart](https://ai.google.dev/gemini-api/docs/quickstart)
- [Gemini model guide](https://ai.google.dev/gemini-api/docs/models/gemini)
You might also want to check out the capabilities guides, which introduce different
Gemini API features and provide code examples:
- [Text generation](https://ai.google.dev/gemini-api/docs/text-generation)
- [Context caching](https://ai.google.dev/gemini-api/docs/caching)
- [Embeddings](https://ai.google.dev/gemini-api/docs/embeddings)
https://ai.google.dev/api.md.txt 6/6

10/24/25, 10:59 PM ai.google.dev/gemini-api/docs/live.md.txt
| **Note:** Introducing a [new version of the Gemini 2.5 Flash Live model]
(https://x.com/GoogleAIStudio/status/1970545734736023564), with improved function calling
and conversational accuracy
The Live API enables low-latency, real-time voice and video interactions with
Gemini. It processes continuous streams of audio, video, or text to deliver
immediate, human-like spoken responses, creating a natural conversational
experience for your users.
![Live API Overview](https://ai.google.dev/static/gemini-api/docs/images/live-api-
overview.png)
Live API offers a comprehensive set of features such as [Voice Activity Detection]
(https://ai.google.dev/gemini-api/docs/live-guide#interruptions), [tool use and function
calling](https://ai.google.dev/gemini-api/docs/live-tools), [session management]
(https://ai.google.dev/gemini-api/docs/live-session) (for managing long running
conversations) and [ephemeral tokens](https://ai.google.dev/gemini-api/docs/ephemeral-
tokens) (for secure client-sided authentication).
This page gets you up and running with examples and basic code samples.
[Try the Live API in Google AI Studiomic](https://aistudio.google.com/live)
## Example applications
Check out the following example applications that illustrate how to use Live API
for end-to-end use cases:
- [Live audio starter app](https://aistudio.google.com/apps/bundled/live_audio?
showPreview=true&showCode=true&showAssistant=false) on AI Studio, using JavaScript libraries
to connect to Live API and stream bidirectional audio through your microphone and speakers.
- Live API [Python cookbook](https://colab.research.google.com/github/google-
gemini/cookbook/blob/main/quickstarts/Get_started_LiveAPI.ipynb) using Pyaudio that connects
to Live API.
## Partner integrations
If you prefer a simpler development process, you can use [Daily]
(https://www.daily.co/products/gemini/multimodal-live-api/), [LiveKit]
(https://docs.livekit.io/agents/integrations/google/#multimodal-live-api) or [Voximplant]
(https://voximplant.com/products/gemini-client). These are third-party partner platforms
that have already integrated the Gemini Live API over the WebRTC protocol to streamline the
development of real-time audio and video applications.
## Before you begin building
There are two important decisions to make before you begin building with the
Live API: choosing a model and choosing an implementation
approach.
### Choose an audio generation architecture
If you're building an audio-based use case, your choice of model determines the
audio generation architecture used to create the audio response:
- **[Native audio](https://ai.google.dev/gemini-api/docs/live-guide#native-audio-output):**
This option provides the most natural and realistic-sounding speech and better multilingual
performance. It also enables advanced features like [affective (emotion-aware) dialogue]
(https://ai.google.dev/gemini-api/docs/live-guide#affective-dialog), [proactive audio]
(https://ai.google.dev/gemini-api/docs/live-guide#proactive-audio) (where the model can
decide to ignore or respond to certain inputs), and ["thinking"]
(https://ai.google.dev/gemini-api/docs/live-guide#native-audio-output-thinking). Native
https://ai.google.dev/gemini-api/docs/live.md.txt 1/5
10/24/25, 10:59 PM ai.google.dev/gemini-api/docs/live.md.txt
audio is supported by the following [native audio models](https://ai.google.dev/gemini-
api/docs/models#gemini-2.5-flash-native-audio):
- `gemini-2.5-flash-native-audio-preview-09-2025`
- **Half-cascade audio** : This option uses a cascaded model architecture (native audio
input and text-to-speech output). It offers better performance and reliability in production
environments, especially with [tool use](https://ai.google.dev/gemini-api/docs/live-tools).
Half-cascaded audio is supported by the following models:
- `gemini-live-2.5-flash-preview`
- `gemini-2.0-flash-live-001`
### Choose an implementation approach
When integrating with Live API, you'll need to choose one of the following
implementation approaches:
- **Server-to-server** : Your backend connects to the Live API using [WebSockets]
(https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API). Typically, your client
sends stream data (audio, video, text) to your server, which then forwards it to the Live
API.
- **Client-to-server** : Your frontend code connects directly to the Live API using
[WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) to stream
data, bypassing your backend.
| **Note:** Client-to-server generally offers better performance for streaming audio and
video, since it bypasses the need to send the stream to your backend first. It's also easier
to set up since you don't need to implement a proxy that sends data from your client to your
server and then your server to the API. However, for production environments, in order to
mitigate security risks, we recommend using [ephemeral tokens](https://ai.google.dev/gemini-
api/docs/ephemeral-tokens) instead of standard API keys.
## Get started
This example ***reads a WAV file***, sends it in the correct format, and saves
the received data as WAV file.
You can send audio by converting it to 16-bit PCM, 16kHz, mono format, and you
can receive audio by setting `AUDIO` as response modality. The output uses a
sample rate of 24kHz.
### Python
# Test file: https://storage.googleapis.com/generativeai-downloads/data/16000.wav
# Install helpers for converting files: pip install librosa soundfile
import asyncio
import io
from pathlib import Path
import wave
from google import genai
from google.genai import types
import soundfile as sf
import librosa
client = genai.Client()
# New native audio model:
model = "gemini-2.5-flash-native-audio-preview-09-2025"
config = {
"response_modalities": ["AUDIO"],
"system_instruction": "You are a helpful assistant and answer in a friendly tone.",
}
async def main():
https://ai.google.dev/gemini-api/docs/live.md.txt 2/5
10/24/25, 10:59 PM ai.google.dev/gemini-api/docs/live.md.txt
async with client.aio.live.connect(model=model, config=config) as session:
buffer = io.BytesIO()
y, sr = librosa.load("sample.wav", sr=16000)
sf.write(buffer, y, sr, format='RAW', subtype='PCM_16')
buffer.seek(0)
audio_bytes = buffer.read()
# If already in correct format, you can use this:
# audio_bytes = Path("sample.pcm").read_bytes()
await session.send_realtime_input(
audio=types.Blob(data=audio_bytes, mime_type="audio/pcm;rate=16000")
)
wf = wave.open("audio.wav", "wb")
wf.setnchannels(1)
wf.setsampwidth(2)
wf.setframerate(24000) # Output is 24kHz
async for response in session.receive():
if response.data is not None:
wf.writeframes(response.data)
# Un-comment this code to print audio data info
# if response.server_content.model_turn is not None:
#
print(response.server_content.model_turn.parts[0].inline_data.mime_type)
wf.close()
if __name__ == "__main__":
asyncio.run(main())
### JavaScript
// Test file: https://storage.googleapis.com/generativeai-downloads/data/16000.wav
import { GoogleGenAI, Modality } from '@google/genai';
import * as fs from "node:fs";
import pkg from 'wavefile'; // npm install wavefile
const { WaveFile } = pkg;
const ai = new GoogleGenAI({});
// WARNING: Do not use API keys in client-side (browser based) applications
// Consider using Ephemeral Tokens instead
// More information at: https://ai.google.dev/gemini-api/docs/ephemeral-tokens
// New native audio model:
const model = "gemini-2.5-flash-native-audio-preview-09-2025"
const config = {
responseModalities: [Modality.AUDIO],
systemInstruction: "You are a helpful assistant and answer in a friendly tone."
};
async function live() {
const responseQueue = [];
async function waitMessage() {
let done = false;
let message = undefined;
while (!done) {
message = responseQueue.shift();
https://ai.google.dev/gemini-api/docs/live.md.txt 3/5
10/24/25, 10:59 PM ai.google.dev/gemini-api/docs/live.md.txt
if (message) {
done = true;
} else {
await new Promise((resolve) => setTimeout(resolve, 100));
}
}
return message;
}
async function handleTurn() {
const turns = [];
let done = false;
while (!done) {
const message = await waitMessage();
turns.push(message);
if (message.serverContent && message.serverContent.turnComplete) {
done = true;
}
}
return turns;
}
const session = await ai.live.connect({
model: model,
callbacks: {
onopen: function () {
console.debug('Opened');
},
onmessage: function (message) {
responseQueue.push(message);
},
onerror: function (e) {
console.debug('Error:', e.message);
},
onclose: function (e) {
console.debug('Close:', e.reason);
},
},
config: config,
});
// Send Audio Chunk
const fileBuffer = fs.readFileSync("sample.wav");
// Ensure audio conforms to API requirements (16-bit PCM, 16kHz, mono)
const wav = new WaveFile();
wav.fromBuffer(fileBuffer);
wav.toSampleRate(16000);
wav.toBitDepth("16");
const base64Audio = wav.toBase64();
// If already in correct format, you can use this:
// const fileBuffer = fs.readFileSync("sample.pcm");
// const base64Audio = Buffer.from(fileBuffer).toString('base64');
session.sendRealtimeInput(
{
audio: {
data: base64Audio,
mimeType: "audio/pcm;rate=16000"
}
}
https://ai.google.dev/gemini-api/docs/live.md.txt 4/5
10/24/25, 10:59 PM ai.google.dev/gemini-api/docs/live.md.txt
);
const turns = await handleTurn();
// Combine audio data strings and save as wave file
const combinedAudio = turns.reduce((acc, turn) => {
if (turn.data) {
const buffer = Buffer.from(turn.data, 'base64');
const intArray = new Int16Array(buffer.buffer, buffer.byteOffset,
buffer.byteLength / Int16Array.BYTES_PER_ELEMENT);
return acc.concat(Array.from(intArray));
}
return acc;
}, []);
const audioBuffer = new Int16Array(combinedAudio);
const wf = new WaveFile();
wf.fromScratch(1, 24000, '16', audioBuffer); // output is 24kHz
fs.writeFileSync('audio.wav', wf.toBuffer());
session.close();
}
async function main() {
await live().catch((e) => console.error('got error', e));
}
main();
## What's next
- Read the full Live API [Capabilities](https://ai.google.dev/gemini-api/docs/live-guide)
guide for key capabilities and configurations; including Voice Activity Detection and native
audio features.
- Read the [Tool use](https://ai.google.dev/gemini-api/docs/live-tools) guide to learn how
to integrate Live API with tools and function calling.
- Read the [Session management](https://ai.google.dev/gemini-api/docs/live-session) guide
for managing long running conversations.
- Read the [Ephemeral tokens](https://ai.google.dev/gemini-api/docs/ephemeral-tokens) guide
for secure authentication in [client-to-server](https://ai.google.dev/gemini-
api/docs/live#implementation-approach) applications.
- For more information about the underlying WebSockets API, see the [WebSockets API
reference](https://ai.google.dev/api/live).
https://ai.google.dev/gemini-api/docs/live.md.txt 5/5

10/24/25, 11:00 PM ai.google.dev/api/live.md.txt
# Live API - WebSockets API reference
<br />
| **Preview:** The Live API is in preview.
The Live API is a stateful API
that uses [WebSockets](https://en.wikipedia.org/wiki/WebSocket).
In this section, you'll find additional details regarding the WebSockets API.
## Sessions
A WebSocket connection establishes a session between the client and the Gemini
server. After a client initiates a new connection the session can exchange
messages with the server to:
- Send text, audio, or video to the Gemini server.
- Receive audio, text, or function call requests from the Gemini server.
### WebSocket connection
To start a session, connect to this websocket endpoint:
wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeSer
vice.BidiGenerateContent
| **Note:** The URL is for version `v1beta`.
### Session configuration
The initial message after connection sets the session configuration, which
includes the model, generation parameters, system instructions, and tools.
You can change the configuration parameters except the model during the session.
See the following example configuration. Note that the name casing in SDKs may
vary. You can look up the [Python SDK configuration options here]
(https://github.com/googleapis/python-genai/blob/main/google/genai/types.py).
{
"model": string,
"generationConfig": {
"candidateCount": integer,
"maxOutputTokens": integer,
"temperature": number,
"topP": number,
"topK": integer,
"presencePenalty": number,
"frequencyPenalty": number,
"responseModalities": [string],
"speechConfig": object,
"mediaResolution": object
},
"systemInstruction": string,
"tools": [object]
}
For more information on the API field, see [generationConfig]
(https://ai.google.dev/api/generate-content#v1beta.GenerationConfig).
https://ai.google.dev/api/live.md.txt 1/13
10/24/25, 11:00 PM ai.google.dev/api/live.md.txt
## Send messages
To exchange messages over the WebSocket connection, the client must send a JSON
object over an open WebSocket connection. The JSON object must have
**exactly one** of the fields from the following object set:
{
"setup": BidiGenerateContentSetup,
"clientContent": BidiGenerateContentClientContent,
"realtimeInput": BidiGenerateContentRealtimeInput,
"toolResponse": BidiGenerateContentToolResponse
}
### Supported client messages
See the supported client messages in the following table:
| Message | Description
|
|------------------------------------|------------------------------------------------------
----------------------------|
| `BidiGenerateContentSetup` | Session configuration to be sent in the first message
|
| `BidiGenerateContentClientContent` | Incremental content update of the current
conversation delivered from the client |
| `BidiGenerateContentRealtimeInput` | Real time audio, video, or text input
|
| `BidiGenerateContentToolResponse` | Response to a `ToolCallMessage` received from the
server |
## Receive messages
To receive messages from Gemini, listen for the WebSocket 'message' event,
and then parse the result according to the definition of the
supported server messages.
See the following:
async with client.aio.live.connect(model='...', config=config) as session:
await session.send(input='Hello world!', end_of_turn=True)
async for message in session.receive():
print(message)
Server messages may have a [`usageMetadata`](https://ai.google.dev/api/live#UsageMetadata)
field but will
otherwise include **exactly one** of the other fields from the
[`BidiGenerateContentServerMessage`]
(https://ai.google.dev/api/live#BidiGenerateContentServerMessage)
message. (The `messageType` union is not expressed in JSON so the field will
appear at the top-level of the message.)
## Messages and events
### ActivityEnd
This type has no fields.
Marks the end of user activity.
### ActivityHandling
The different ways of handling user activity.
https://ai.google.dev/api/live.md.txt 2/13
10/24/25, 11:00 PM ai.google.dev/api/live.md.txt
|
Enums
||
|---------------------------------|---------------------------------------------------------
--------------------------------------------------------------------------------------------
---------------------------------------------------|
| `ACTIVITY_HANDLING_UNSPECIFIED` | If unspecified, the default behavior is
`START_OF_ACTIVITY_INTERRUPTS`.
|
| `START_OF_ACTIVITY_INTERRUPTS` | If true, start of activity will interrupt the model's
response (also called "barge in"). The model's current response will be cut-off in the
moment of the interruption. This is the default behavior. |
| `NO_INTERRUPTION` | The model's response will not be interrupted.
|
### ActivityStart
This type has no fields.
Marks the start of user activity.
### AudioTranscriptionConfig
This type has no fields.
The audio transcription configuration.
### AutomaticActivityDetection
Configures automatic detection of activity.
|
Fields
||
|----------------------------|--------------------------------------------------------------
--------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------
----------------------------|
| `disabled` | `bool` Optional. If enabled (the default), detected voice and
text input count as activity. If disabled, the client must send activity signals.
|
| `startOfSpeechSensitivity` | [StartSensitivity]
(https://ai.google.dev/api/live#RealtimeInputConfig.AutomaticActivityDetection.StartSensitiv
ity) Optional. Determines how likely speech is to be detected.
|
| `prefixPaddingMs` | `int32` Optional. The required duration of detected speech
before start-of-speech is committed. The lower this value, the more sensitive the start-of-
speech detection is and shorter speech can be recognized. However, this also increases the
probability of false positives. |
| `endOfSpeechSensitivity` | [EndSensitivity]
(https://ai.google.dev/api/live#RealtimeInputConfig.AutomaticActivityDetection.EndSensitivit
y) Optional. Determines how likely detected speech is ended.
|
| `silenceDurationMs` | `int32` Optional. The required duration of detected non-
speech (e.g. silence) before end-of-speech is committed. The larger this value, the longer
speech gaps can be without interrupting the user's activity but this will increase the
model's latency. |
### BidiGenerateContentClientContent
Incremental update of the current conversation delivered from the client. All of the content
here is unconditionally appended to the conversation history and used as part of the prompt
to the model to generate content.
A message here will interrupt any current model generation.
https://ai.google.dev/api/live.md.txt 3/13
10/24/25, 11:00 PM ai.google.dev/api/live.md.txt
|
Fields
||
|----------------|--------------------------------------------------------------------------
--------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------
----------------------------|
| `turns[]` | [Content](https://ai.google.dev/api/live#Content) Optional. The content
appended to the current conversation with the model. For single-turn queries, this is a
single instance. For multi-turn queries, this is a repeated field that contains conversation
history and the latest request. |
| `turnComplete` | `bool` Optional. If true, indicates that the server content generation
should start with the currently accumulated prompt. Otherwise, the server awaits additional
messages before starting generation.
|
### BidiGenerateContentRealtimeInput
User input that is sent in real time.
The different modalities (audio, video and text) are handled as concurrent streams. The
ordering across these streams is not guaranteed.
This is different from [BidiGenerateContentClientContent]
(https://ai.google.dev/api/live#BidiGenerateContentClientContent) in a few ways:
- Can be sent continuously without interruption to model generation.
- If there is a need to mix data interleaved across the [BidiGenerateContentClientContent]
(https://ai.google.dev/api/live#BidiGenerateContentClientContent) and the
[BidiGenerateContentRealtimeInput]
(https://ai.google.dev/api/live#BidiGenerateContentRealtimeInput), the server attempts to
optimize for best response, but there are no guarantees.
- End of turn is not explicitly specified, but is rather derived from user activity (for
example, end of speech).
- Even before the end of turn, the data is processed incrementally to optimize for a fast
start of the response from the model.
|
Fields
||
|------------------|------------------------------------------------------------------------
--------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------
-----|
| `mediaChunks[]` | [Blob](https://ai.google.dev/api/live#Blob) Optional. Inlined bytes
data for media input. Multiple `mediaChunks` are not supported, all but the first will be
ignored. DEPRECATED: Use one of `audio`, `video`, or `text` instead.
|
| `audio` realtime audio input stream.
| [Blob](https://ai.google.dev/api/live#Blob) Optional. These form the
|
| `video` realtime video input stream.
| [Blob](https://ai.google.dev/api/live#Blob) Optional. These form the
|
| `activityStart` | [ActivityStart]
(https://ai.google.dev/api/live#BidiGenerateContentRealtimeInput.ActivityStart) Optional.
Marks the start of user activity. This can only be sent if automatic (i.e. server-side)
activity detection is disabled. |
| `activityEnd` | [ActivityEnd]
(https://ai.google.dev/api/live#BidiGenerateContentRealtimeInput.ActivityEnd) Optional.
Marks the end of user activity. This can only be sent if automatic (i.e. server-side)
activity detection is disabled. |
https://ai.google.dev/api/live.md.txt 4/13
10/24/25, 11:00 PM ai.google.dev/api/live.md.txt
| `audioStreamEnd` | `bool` Optional. Indicates that the audio stream has ended, e.g.
because the microphone was turned off. This should only be sent when automatic activity
detection is enabled (which is the default). The client can reopen the stream by sending an
audio message. |
| `text` | `string` Optional. These form the realtime text input stream.
|
### BidiGenerateContentServerContent
Incremental server update generated by the model in response to client messages.
Content is generated as quickly as possible, and not in real time. Clients may choose to
buffer and play it out in real time.
|
Fields
||
|-----------------------|-------------------------------------------------------------------
--------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------
-----------------------------------------------------|
| `generationComplete` | `bool` Output only. If true, indicates that the model is done
generating. When model is interrupted while generating there will be no
'generation_complete' message in interrupted turn, it will go through 'interrupted \>
turn_complete'. When model assumes realtime playback there will be delay between
generation_complete and turn_complete that is caused by model waiting for playback to
finish. |
| `turnComplete` | `bool` Output only. If true, indicates that the model has
completed its turn. Generation will only start in response to additional client messages.
|
| `interrupted` | `bool` Output only. If true, indicates that a client message has
interrupted current model generation. If the client is playing out the content in real time,
this is a good signal to stop and empty the current playback queue.
|
| `groundingMetadata` | [GroundingMetadata]
(https://ai.google.dev/api/live#GroundingMetadata) Output only. Grounding metadata for the
generated content.
|
| `inputTranscription` | [BidiGenerateContentTranscription]
(https://ai.google.dev/api/live#BidiGenerateContentTranscription) Output only. Input audio
transcription. The transcription is sent independently of the other server messages and
there is no guaranteed ordering.
|
| `outputTranscription` | [BidiGenerateContentTranscription]
(https://ai.google.dev/api/live#BidiGenerateContentTranscription) Output only. Output audio
transcription. The transcription is sent independently of the other server messages and
there is no guaranteed ordering, in particular not between `serverContent` and this
`outputTranscription`.
|
| `urlContextMetadata` | [UrlContextMetadata]
(https://ai.google.dev/api/live#UrlContextMetadata)
|
| `modelTurn` | [Content](https://ai.google.dev/api/live#Content) Output only. The
content that the model has generated as part of the current conversation with the user.
|
### BidiGenerateContentServerMessage
Response message for the BidiGenerateContent call.
|
Fields
https://ai.google.dev/api/live.md.txt 5/13
10/24/25, 11:00 PM ai.google.dev/api/live.md.txt
||
|---------------------------|---------------------------------------------------------------
--------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------|
| `usageMetadata` | [UsageMetadata](https://ai.google.dev/api/live#UsageMetadata)
Output only. Usage metadata about the response(s).
|
| Union field `messageType`. The type of the message. `messageType` can be only one of the
following:
||
| `setupComplete` | [BidiGenerateContentSetupComplete]
(https://ai.google.dev/api/live#BidiGenerateContentSetupComplete) Output only. Sent in
response to a `BidiGenerateContentSetup` message from the client when setup is complete.
|
| `serverContent` | [BidiGenerateContentServerContent]
(https://ai.google.dev/api/live#BidiGenerateContentServerContent) Output only. Content
generated by the model in response to client messages.
|
| `toolCall` | [BidiGenerateContentToolCall]
(https://ai.google.dev/api/live#BidiGenerateContentToolCall) Output only. Request for the
client to execute the `functionCalls` and return the responses with the matching `id`s.
|
| `toolCallCancellation` | [BidiGenerateContentToolCallCancellation]
(https://ai.google.dev/api/live#BidiGenerateContentToolCallCancellation) Output only.
Notification for the client that a previously issued `ToolCallMessage` with the specified
`id`s should be cancelled. |
| `goAway` | [GoAway](https://ai.google.dev/api/live#GoAway) Output only. A
notice that the server will soon disconnect.
|
| `sessionResumptionUpdate` | [SessionResumptionUpdate]
(https://ai.google.dev/api/live#SessionResumptionUpdate) Output only. Update of the session
resumption state.
|
### BidiGenerateContentSetup
Message to be sent in the first (and only in the first) `BidiGenerateContentClientMessage`.
Contains configuration that will apply for the duration of the streaming RPC.
Clients should wait for a `BidiGenerateContentSetupComplete` message before sending any
additional messages.
|
Fields
||
|----------------------------|--------------------------------------------------------------
--------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------
------------------------------------------------|
| `model` | `string` Required. The model's resource name. This serves as
an ID for the Model to use. Format: `models/{model}`
|
| `generationConfig` | [GenerationConfig]
(https://ai.google.dev/api/live#GenerationConfig) Optional. Generation config. The following
fields are not supported: - `responseLogprobs` - `responseMimeType` - `logprobs` -
`responseSchema` - `stopSequence` - `routingConfig` - `audioTimestamp`
|
| `systemInstruction` | [Content](https://ai.google.dev/api/live#Content) Optional.
The user provided system instructions for the model. Note: Only text should be used in parts
and content in each part will be in a separate paragraph.
|
| `tools[]` | [Tool](https://ai.google.dev/api/live#Tool) Optional. A list
of `Tools` the model may use to generate the next response. A `Tool` is a piece of code that
https://ai.google.dev/api/live.md.txt 6/13
10/24/25, 11:00 PM ai.google.dev/api/live.md.txt
enables the system to interact with external systems to perform an action, or set of
actions, outside of knowledge and scope of the model. |
| `realtimeInputConfig` | [RealtimeInputConfig]
(https://ai.google.dev/api/live#RealtimeInputConfig) Optional. Configures the handling of
realtime input.
|
| `sessionResumption` | [SessionResumptionConfig]
(https://ai.google.dev/api/live#SessionResumptionConfig) Optional. Configures session
resumption mechanism. If included, the server will send `SessionResumptionUpdate` messages.
|
| `contextWindowCompression` | [ContextWindowCompressionConfig]
(https://ai.google.dev/api/live#ContextWindowCompressionConfig) Optional. Configures a
context window compression mechanism. If included, the server will automatically reduce the
size of the context when it exceeds the configured length. |
| `inputAudioTranscription` | [AudioTranscriptionConfig]
(https://ai.google.dev/api/live#AudioTranscriptionConfig) Optional. If set, enables
transcription of voice input. The transcription aligns with the input audio language, if
configured.
|
| `outputAudioTranscription` | [AudioTranscriptionConfig]
(https://ai.google.dev/api/live#AudioTranscriptionConfig) Optional. If set, enables
transcription of the model's audio output. The transcription aligns with the language code
specified for the output audio, if configured.
|
| `proactivity` | [ProactivityConfig]
(https://ai.google.dev/api/live#ProactivityConfig) Optional. Configures the proactivity of
the model. This allows the model to respond proactively to the input and to ignore
irrelevant input.
|
### BidiGenerateContentSetupComplete
This type has no fields.
Sent in response to a `BidiGenerateContentSetup` message from the client.
### BidiGenerateContentToolCall
Request for the client to execute the `functionCalls` and return the responses with the
matching `id`s.
| Fields
||
|-------------------|-----------------------------------------------------------------------
-------------------------------------|
| `functionCalls[]` | [FunctionCall](https://ai.google.dev/api/live#FunctionCall) Output
only. The function call to be executed. |
### BidiGenerateContentToolCallCancellation
Notification for the client that a previously issued `ToolCallMessage` with the specified
`id`s should not have been executed and should be cancelled. If there were side-effects to
those tool calls, clients may attempt to undo the tool calls. This message occurs only in
cases where the clients interrupt server turns.
| Fields ||
|---------|------------------------------------------------------------------|
| `ids[]` | `string` Output only. The ids of the tool calls to be cancelled. |
### BidiGenerateContentToolResponse
Client generated response to a `ToolCall` received from the server. Individual
`FunctionResponse` objects are matched to the respective `FunctionCall` objects by the `id`
field.
https://ai.google.dev/api/live.md.txt 7/13
10/24/25, 11:00 PM ai.google.dev/api/live.md.txt
Note that in the unary and server-streaming GenerateContent APIs function calling happens by
exchanging the `Content` parts, while in the bidi GenerateContent APIs function calling
happens over these dedicated set of messages.
| Fields
||
|-----------------------|-------------------------------------------------------------------
------------------------------------------------|
| `functionResponses[]` | [FunctionResponse]
(https://ai.google.dev/api/live#FunctionResponse) Optional. The response to the function
calls. |
### BidiGenerateContentTranscription
Transcription of audio (input or output).
| Fields ||
|--------|------------------------------|
| `text` | `string` Transcription text. |
### ContextWindowCompressionConfig
Enables context window compression --- a mechanism for managing the model's context window
so that it does not exceed a given length.
|
Fields
||
|-----------------|-------------------------------------------------------------------------
--------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------
--------------------------|
| Union field `compressionMechanism`. The context window compression mechanism used.
`compressionMechanism` can be only one of the following:
||
| `slidingWindow` | [SlidingWindow]
(https://ai.google.dev/api/live#ContextWindowCompressionConfig.SlidingWindow) A sliding-
window mechanism.
|
| `triggerTokens` | `int64` The number of tokens (before running a turn) required to trigger
a context window compression. This can be used to balance quality against latency as shorter
context windows may result in faster model responses. However, any compression operation
will cause a temporary latency increase, so they should not be triggered frequently. If not
set, the default is 80% of the model's context window limit. This leaves 20% for the next
user request/model response. |
### EndSensitivity
Determines how end of speech is detected.
| Enums ||
|-------------------------------|---------------------------------------------|
| `END_SENSITIVITY_UNSPECIFIED` | The default is END_SENSITIVITY_HIGH. |
| `END_SENSITIVITY_HIGH` | Automatic detection ends speech more often. |
| `END_SENSITIVITY_LOW` | Automatic detection ends speech less often. |
### GoAway
A notice that the server will soon disconnect.
https://ai.google.dev/api/live.md.txt 8/13
10/24/25, 11:00 PM ai.google.dev/api/live.md.txt
|
Fields
||
|------------|------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------
----------------------|
| `timeLeft` | [Duration](https://protobuf.dev/reference/protobuf/google.protobuf/#duration)
The remaining time before the connection will be terminated as ABORTED. This duration will
never be less than a model-specific minimum, which will be specified together with the rate
limits for the model. |
### ProactivityConfig
Config for proactivity features.
|
Fields
||
|------------------|------------------------------------------------------------------------
--------------------------------------------------------------------------------------------
--------------------------------------------|
| `proactiveAudio` | `bool` Optional. If enabled, the model can reject responding to the
last prompt. For example, this allows the model to ignore out of context speech or to stay
silent if the user did not make a request, yet. |
### RealtimeInputConfig
Configures the realtime input behavior in `BidiGenerateContent`.
|
Fields
||
|------------------------------|------------------------------------------------------------
--------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------
--------------------|
| `automaticActivityDetection` | [AutomaticActivityDetection]
(https://ai.google.dev/api/live#RealtimeInputConfig.AutomaticActivityDetection) Optional. If
not set, automatic activity detection is enabled by default. If automatic voice detection is
disabled, the client must send activity signals. |
| `activityHandling` | [ActivityHandling]
(https://ai.google.dev/api/live#RealtimeInputConfig.ActivityHandling) Optional. Defines what
effect activity has.
|
| `turnCoverage` | [TurnCoverage]
(https://ai.google.dev/api/live#RealtimeInputConfig.TurnCoverage) Optional. Defines which
input is included in the user's turn.
|
### SessionResumptionConfig
Session resumption configuration.
This message is included in the session configuration as
`BidiGenerateContentSetup.sessionResumption`. If configured, the server will send
`SessionResumptionUpdate` messages.
|
Fields
||
|----------|--------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------
https://ai.google.dev/api/live.md.txt 9/13
10/24/25, 11:00 PM ai.google.dev/api/live.md.txt
--------|
| `handle` | `string` The handle of a previous session. If not present then a new session is
created. Session handles come from `SessionResumptionUpdate.token` values in previous
connections. |
### SessionResumptionUpdate
Update of the session resumption state.
Only sent if `BidiGenerateContentSetup.sessionResumption` was set.
|
Fields
||
|-------------|-----------------------------------------------------------------------------
--------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------
----------------|
`resumable`=false.
| `newHandle` | `string` New handle that represents a state that can be resumed. Empty if
|
| `resumable` | `bool` True if the current session can be resumed at this point. Resumption
is not possible at some points in the session. For example, when the model is executing
function calls or generating. Resuming the session (using a previous session token) in such
a state will result in some data loss. In these cases, `newHandle` will be empty and
`resumable` will be false. |
### SlidingWindow
The SlidingWindow method operates by discarding content at the beginning of the context
window. The resulting context will always begin at the start of a USER role turn. System
instructions and any `BidiGenerateContentSetup.prefixTurns` will always remain at the
beginning of the result.
|
Fields
||
|----------------|--------------------------------------------------------------------------
--------------------------------------------------------------------------------------------
-----------------------------------------------------------------------|
| `targetTokens` | `int64` The target number of tokens to keep. The default value is
trigger_tokens/2. Discarding parts of the context window causes a temporary latency increase
so this value should be calibrated to avoid frequent compression operations. |
### StartSensitivity
Determines how start of speech is detected.
| Enums
||
--------|
|
| `START_SENSITIVITY_HIGH` often. |
| `START_SENSITIVITY_LOW` often. |
|---------------------------------|---------------------------------------------------------
| `START_SENSITIVITY_UNSPECIFIED` | The default is START_SENSITIVITY_HIGH.
| Automatic detection will detect the start of speech more
| Automatic detection will detect the start of speech less
### TurnCoverage
Options about which input is included in the user's turn.
https://ai.google.dev/api/live.md.txt 10/13
10/24/25, 11:00 PM ai.google.dev/api/live.md.txt
| Enums
||
|-------------------------------|-----------------------------------------------------------
----------------------------------------------------------------------------------------|
| `TURN_COVERAGE_UNSPECIFIED` | If unspecified, the default behavior is
`TURN_INCLUDES_ONLY_ACTIVITY`.
|
| `TURN_INCLUDES_ONLY_ACTIVITY` | The users turn only includes activity since the last turn,
excluding inactivity (e.g. silence on the audio stream). This is the default behavior. |
| `TURN_INCLUDES_ALL_INPUT` | The users turn includes all realtime input since the last
turn, including inactivity (e.g. silence on the audio stream). |
### UrlContextMetadata
Metadata related to url context retrieval tool.
| Fields
||
-------|
context. |
|-----------------|-------------------------------------------------------------------------
| `urlMetadata[]` | [UrlMetadata](https://ai.google.dev/api/live#UrlMetadata) List of url
### UsageMetadata
Usage metadata about response(s).
|
Fields
||
|--------------------------------|----------------------------------------------------------
--------------------------------------------------------------------------------------------
---------------------------------------------|
| `promptTokenCount` | `int32` Output only. Number of tokens in the prompt. When
`cachedContent` is set, this is still the total effective prompt size meaning this includes
the number of tokens in the cached content. |
| `cachedContentTokenCount` | `int32` Number of tokens in the cached part of the prompt
(the cached content)
|
| `responseTokenCount` the generated response candidates.
| `int32` Output only. Total number of tokens across all
|
| `toolUsePromptTokenCount` prompt(s).
| `int32` Output only. Number of tokens present in tool-use
|
| `thoughtsTokenCount` thinking models.
| `int32` Output only. Number of tokens of thoughts for
|
| `totalTokenCount` request (prompt + response candidates).
| `int32` Output only. Total token count for the generation
|
| `promptTokensDetails[]` | [ModalityTokenCount]
(https://ai.google.dev/api/live#ModalityTokenCount) Output only. List of modalities that
were processed in the request input. |
| `cacheTokensDetails[]` | [ModalityTokenCount]
(https://ai.google.dev/api/live#ModalityTokenCount) Output only. List of modalities of the
cached content in the request input. |
| `responseTokensDetails[]` | [ModalityTokenCount]
(https://ai.google.dev/api/live#ModalityTokenCount) Output only. List of modalities that
were returned in the response. |
| `toolUsePromptTokensDetails[]` | [ModalityTokenCount]
(https://ai.google.dev/api/live#ModalityTokenCount) Output only. List of modalities that
https://ai.google.dev/api/live.md.txt 11/13
10/24/25, 11:00 PM ai.google.dev/api/live.md.txt
were processed for tool-use request inputs. |
## Ephemeral authentication tokens
Ephemeral authentication tokens can be obtained by calling
`AuthTokenService.CreateToken` and then used with
`GenerativeService.BidiGenerateContentConstrained`, either by passing the token
in an `access_token` query parameter, or in an HTTP `Authorization` header with
"`Token`" prefixed to it.
### CreateAuthTokenRequest
Create an ephemeral authentication token.
| Fields
||
---------|
create. |
|-------------|-----------------------------------------------------------------------------
| `authToken` | [AuthToken](https://ai.google.dev/api/live#AuthToken) Required. The token to
### AuthToken
A request to create an ephemeral authentication token.
|
Fields
||
|----------------------------|--------------------------------------------------------------
--------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------
---------------------------------------------------------------------------------|
| `name` | `string` Output only. Identifier. The token itself.
|
| `expireTime` | [Timestamp]
(https://protobuf.dev/reference/protobuf/google.protobuf/#timestamp) Optional. Input only.
Immutable. An optional time after which, when using the resulting token, messages in
BidiGenerateContent sessions will be rejected. (Gemini may preemptively close the session
after this time.) If not set then this defaults to 30 minutes in the future. If set, this
value must be less than 20 hours in the future.
|
| `newSessionExpireTime` | [Timestamp]
(https://protobuf.dev/reference/protobuf/google.protobuf/#timestamp) Optional. Input only.
Immutable. The time after which new Live API sessions using the token resulting from this
request will be rejected. If not set this defaults to 60 seconds in the future. If set, this
value must be less than 20 hours in the future.
|
| `fieldMask` | [FieldMask]
(https://protobuf.dev/reference/protobuf/google.protobuf/#field-mask) Optional. Input only.
Immutable. If field_mask is empty, and `bidiGenerateContentSetup` is not present, then the
effective `BidiGenerateContentSetup` message is taken from the Live API connection. If
field_mask is empty, and `bidiGenerateContentSetup` *is* present, then the effective
`BidiGenerateContentSetup` message is taken entirely from `bidiGenerateContentSetup` in this
request. The setup message from the Live API connection is ignored. If field_mask is not
empty, then the corresponding fields from `bidiGenerateContentSetup` will overwrite the
fields from the setup message in the Live API connection. |
| Union field `config`. The method-specific configuration for the resulting token. `config`
can be only one of the following:
||
https://ai.google.dev/api/live.md.txt 12/13
10/24/25, 11:00 PM ai.google.dev/api/live.md.txt
| `bidiGenerateContentSetup` | [BidiGenerateContentSetup]
(https://ai.google.dev/api/live#BidiGenerateContentSetup) Optional. Input only. Immutable.
Configuration specific to `BidiGenerateContent`.
|
| `uses` | `int32` Optional. Input only. Immutable. The number of times
the token can be used. If this value is zero then no limit is applied. Resuming a Live API
session does not count as a use. If unspecified, the default is 1.
|
## More information on common types
For more information on the commonly-used API resource types `Blob`,
`Content`, `FunctionCall`, `FunctionResponse`, `GenerationConfig`,
`GroundingMetadata`, `ModalityTokenCount`, and `Tool`, see
[Generating content](https://ai.google.dev/api/generate-content).
https://ai.google.dev/api/live.md.txt 13/13

10/24/25, 11:03 PM ai.google.dev/gemini-api/docs/image-understanding.md.txt
Gemini models are built to be multimodal from the ground up, unlocking a wide range of image
processing and computer vision tasks including but not limited to image captioning,
classification, and visual question answering without having to train specialized ML models.
| **Tip:** In addition to their general multimodal capabilities, Gemini models (2.0 and
newer) offer **improved accuracy** for specific use cases like [object detection]
(https://ai.google.dev/gemini-api/docs/image-understanding#object-detection) and
[segmentation](https://ai.google.dev/gemini-api/docs/image-understanding#segmentation),
through additional training. See the [Capabilities](https://ai.google.dev/gemini-
api/docs/image-understanding#capabilities) section for more details.
## Passing images to Gemini
You can provide images as input to Gemini using two methods:
- [Passing inline image data](https://ai.google.dev/gemini-api/docs/image-
understanding#inline-image): Ideal for smaller files (total request size less than 20MB,
including prompts).
- [Uploading images using the File API](https://ai.google.dev/gemini-api/docs/image-
understanding#upload-image): Recommended for larger files or for reusing images across
multiple requests.
### Passing inline image data
You can pass inline image data in the
request to `generateContent`. You can provide image data as Base64 encoded
strings or by reading local files directly (depending on the language).
The following example shows how to read an image from a local file and pass
it to `generateContent` API for processing.
### Python
from google import genai
from google.genai import types
with open('path/to/small-sample.jpg', 'rb') as f:
image_bytes = f.read()
client = genai.Client()
response = client.models.generate_content(
model='gemini-2.5-flash',
contents=[
types.Part.from_bytes(
data=image_bytes,
mime_type='image/jpeg',
),
'Caption this image.'
]
)
print(response.text)
### JavaScript
import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";
const ai = new GoogleGenAI({});
const base64ImageFile = fs.readFileSync("path/to/small-sample.jpg", {
encoding: "base64",
});
https://ai.google.dev/gemini-api/docs/image-understanding.md.txt 1/14
10/24/25, 11:03 PM ai.google.dev/gemini-api/docs/image-understanding.md.txt
const contents = [
{
inlineData: {
mimeType: "image/jpeg",
data: base64ImageFile,
},
},
{ text: "Caption this image." },
];
const response = await ai.models.generateContent({
model: "gemini-2.5-flash",
contents: contents,
});
console.log(response.text);
### Go
bytes, _ := os.ReadFile("path/to/small-sample.jpg")
parts := []*genai.Part{
genai.NewPartFromBytes(bytes, "image/jpeg"),
genai.NewPartFromText("Caption this image."),
}
contents := []*genai.Content{
genai.NewContentFromParts(parts, genai.RoleUser),
}
result, _ := client.Models.GenerateContent(
ctx,
"gemini-2.5-flash",
contents,
nil,
)
fmt.Println(result.Text())
### REST
IMG_PATH="/path/to/your/image1.jpg"
if [[ "$(base64 --version 2>&1)" = *"FreeBSD"* ]]; then
B64FLAGS="--input"
else
B64FLAGS="-w0"
fi
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-
flash:generateContent" \
-H "x-goog-api-key: $GEMINI_API_KEY" \
-H 'Content-Type: application/json' \
-X POST \
-d '{
"contents": [{
"parts":[
{
"inline_data": {
"mime_type":"image/jpeg",
"data": "'"$(base64 $B64FLAGS $IMG_PATH)"'"
}
},
{"text": "Caption this image."},
https://ai.google.dev/gemini-api/docs/image-understanding.md.txt 2/14
10/24/25, 11:03 PM ai.google.dev/gemini-api/docs/image-understanding.md.txt
]
}]
}' 2> /dev/null
You can also fetch an image from a URL, convert it to bytes, and pass it to
`generateContent` as shown in the following examples.
### Python
from google import genai
from google.genai import types
import requests
image_path = "https://goo.gle/instrument-img"
image_bytes = requests.get(image_path).content
image = types.Part.from_bytes(
data=image_bytes, mime_type="image/jpeg"
)
client = genai.Client()
response = client.models.generate_content(
model="gemini-2.5-flash",
contents=["What is this image?", image],
)
print(response.text)
### JavaScript
import { GoogleGenAI } from "@google/genai";
async function main() {
const ai = new GoogleGenAI({});
const imageUrl = "https://goo.gle/instrument-img";
const response = await fetch(imageUrl);
const imageArrayBuffer = await response.arrayBuffer();
const base64ImageData = Buffer.from(imageArrayBuffer).toString('base64');
const result = await ai.models.generateContent({
model: "gemini-2.5-flash",
contents: [
{
inlineData: {
mimeType: 'image/jpeg',
data: base64ImageData,
},
{ text: "Caption this image." }
},
],
});
console.log(result.text);
}
main();
### Go
package main
https://ai.google.dev/gemini-api/docs/image-understanding.md.txt 3/14
10/24/25, 11:03 PM ai.google.dev/gemini-api/docs/image-understanding.md.txt
import (
"context"
"fmt"
"os"
"io"
"net/http"
"google.golang.org/genai"
)
func main() {
ctx := context.Background()
client, err := genai.NewClient(ctx, nil)
if err != nil {
log.Fatal(err)
}
// Download the image.
imageResp, _ := http.Get("https://goo.gle/instrument-img")
imageBytes, _ := io.ReadAll(imageResp.Body)
parts := []*genai.Part{
genai.NewPartFromBytes(imageBytes, "image/jpeg"),
genai.NewPartFromText("Caption this image."),
contents := []*genai.Content{
genai.NewContentFromParts(parts, genai.RoleUser),
}
}
result, _ := client.Models.GenerateContent(
ctx,
"gemini-2.5-flash",
contents,
nil,
)
fmt.Println(result.Text())
}
### REST
IMG_URL="https://goo.gle/instrument-img"
MIME_TYPE=$(curl -sIL "$IMG_URL" | grep -i '^content-type:' | awk -F ': ' '{print $2}' |
sed 's/\r$//' | head -n 1)
if [[ -z "$MIME_TYPE" || ! "$MIME_TYPE" == image/* ]]; then
MIME_TYPE="image/jpeg"
fi
# Check for macOS
if [[ "$(uname)" == "Darwin" ]]; then
IMAGE_B64=$(curl -sL "$IMG_URL" | base64 -b 0)
elif [[ "$(base64 --version 2>&1)" = *"FreeBSD"* ]]; then
IMAGE_B64=$(curl -sL "$IMG_URL" | base64)
else
IMAGE_B64=$(curl -sL "$IMG_URL" | base64 -w0)
fi
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-
flash:generateContent" \
-H "x-goog-api-key: $GEMINI_API_KEY" \
-H 'Content-Type: application/json' \
https://ai.google.dev/gemini-api/docs/image-understanding.md.txt 4/14
10/24/25, 11:03 PM ai.google.dev/gemini-api/docs/image-understanding.md.txt
-X POST \
-d '{
"contents": [{
"parts":[
{
"inline_data": {
"mime_type":"'"$MIME_TYPE"'",
"data": "'"$IMAGE_B64"'"
}
},
{"text": "Caption this image."}
]
}]
}' 2> /dev/null
| **Note:** Inline image data limits your total request size (text prompts, system
instructions, and inline bytes) to 20MB. For larger requests, [upload image files]
(https://ai.google.dev/gemini-api/docs/image-understanding#upload-image) using the File API.
Files API is also more efficient for scenarios that use the same image repeatedly.
### Uploading images using the File API
For large files or to be able to use the same image file repeatedly, use the
Files API. The following code uploads an image file and then uses the file in a
call to `generateContent`. See the [Files API guide](https://ai.google.dev/gemini-
api/docs/files) for
more information and examples.
### Python
from google import genai
client = genai.Client()
my_file = client.files.upload(file="path/to/sample.jpg")
response = client.models.generate_content(
model="gemini-2.5-flash",
contents=[my_file, "Caption this image."],
)
print(response.text)
### JavaScript
import {
GoogleGenAI,
createUserContent,
createPartFromUri,
} from "@google/genai";
const ai = new GoogleGenAI({});
async function main() {
const myfile = await ai.files.upload({
file: "path/to/sample.jpg",
config: { mimeType: "image/jpeg" },
});
const response = await ai.models.generateContent({
model: "gemini-2.5-flash",
contents: createUserContent([
createPartFromUri(myfile.uri, myfile.mimeType),
https://ai.google.dev/gemini-api/docs/image-understanding.md.txt 5/14
10/24/25, 11:03 PM ai.google.dev/gemini-api/docs/image-understanding.md.txt
"Caption this image.",
]),
});
console.log(response.text);
}
await main();
### Go
package main
import (
"context"
"fmt"
"os"
"google.golang.org/genai"
)
func main() {
ctx := context.Background()
client, err := genai.NewClient(ctx, nil)
if err != nil {
log.Fatal(err)
}
uploadedFile, _ := client.Files.UploadFromPath(ctx, "path/to/sample.jpg", nil)
parts := []*genai.Part{
genai.NewPartFromText("Caption this image."),
genai.NewPartFromURI(uploadedFile.URI, uploadedFile.MIMEType),
contents := []*genai.Content{
genai.NewContentFromParts(parts, genai.RoleUser),
}
}
result, _ := client.Models.GenerateContent(
ctx,
"gemini-2.5-flash",
contents,
nil,
)
fmt.Println(result.Text())
}
### REST
IMAGE_PATH="path/to/sample.jpg"
MIME_TYPE=$(file -b --mime-type "${IMAGE_PATH}")
NUM_BYTES=$(wc -c < "${IMAGE_PATH}")
DISPLAY_NAME=IMAGE
tmp_header_file=upload-header.tmp
# Initial resumable request defining metadata.
# The upload url is in the response headers dump them to a file.
curl "https://generativelanguage.googleapis.com/upload/v1beta/files" \
-H "x-goog-api-key: $GEMINI_API_KEY" \
-D upload-header.tmp \
-H "X-Goog-Upload-Protocol: resumable" \
-H "X-Goog-Upload-Command: start" \
https://ai.google.dev/gemini-api/docs/image-understanding.md.txt 6/14
10/24/25, 11:03 PM ai.google.dev/gemini-api/docs/image-understanding.md.txt
-H "X-Goog-Upload-Header-Content-Length: ${NUM_BYTES}" \
-H "X-Goog-Upload-Header-Content-Type: ${MIME_TYPE}" \
-H "Content-Type: application/json" \
-d "{'file': {'display_name': '${DISPLAY_NAME}'}}" 2> /dev/null
upload_url=$(grep -i "x-goog-upload-url: " "${tmp_header_file}" | cut -d" " -f2 | tr -d
"\r")
rm "${tmp_header_file}"
# Upload the actual bytes.
curl "${upload_url}" \
-H "x-goog-api-key: $GEMINI_API_KEY" \
-H "Content-Length: ${NUM_BYTES}" \
-H "X-Goog-Upload-Offset: 0" \
-H "X-Goog-Upload-Command: upload, finalize" \
--data-binary "@${IMAGE_PATH}" 2> /dev/null > file_info.json
file_uri=$(jq -r ".file.uri" file_info.json)
echo file_uri=$file_uri
# Now generate content using that file
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-
flash:generateContent" \
-H "x-goog-api-key: $GEMINI_API_KEY" \
-H 'Content-Type: application/json' \
-X POST \
-d '{
"contents": [{
"parts":[
{"file_data":{"mime_type": "'"${MIME_TYPE}"'", "file_uri":
"'"${file_uri}"'"}},
{"text": "Caption this image."}]
}]
}' 2> /dev/null > response.json
cat response.json
echo
jq ".candidates[].content.parts[].text" response.json
## Prompting with multiple images
You can provide multiple images in a single prompt by including multiple image
`Part` objects in the `contents` array. These can be a mix of inline data
(local files or URLs) and File API references.
### Python
from google import genai
from google.genai import types
client = genai.Client()
# Upload the first image
image1_path = "path/to/image1.jpg"
uploaded_file = client.files.upload(file=image1_path)
# Prepare the second image as inline data
image2_path = "path/to/image2.png"
with open(image2_path, 'rb') as f:
img2_bytes = f.read()
# Create the prompt with text and multiple images
https://ai.google.dev/gemini-api/docs/image-understanding.md.txt 7/14
10/24/25, 11:03 PM ai.google.dev/gemini-api/docs/image-understanding.md.txt
response = client.models.generate_content(
model="gemini-2.5-flash",
contents=[
"What is different between these two images?",
uploaded_file, # Use the uploaded file reference
types.Part.from_bytes(
data=img2_bytes,
mime_type='image/png'
)
]
)
print(response.text)
### JavaScript
import {
GoogleGenAI,
createUserContent,
createPartFromUri,
} from "@google/genai";
import * as fs from "node:fs";
const ai = new GoogleGenAI({});
async function main() {
// Upload the first image
const image1_path = "path/to/image1.jpg";
const uploadedFile = await ai.files.upload({
file: image1_path,
config: { mimeType: "image/jpeg" },
});
// Prepare the second image as inline data
const image2_path = "path/to/image2.png";
const base64Image2File = fs.readFileSync(image2_path, {
encoding: "base64",
});
// Create the prompt with text and multiple images
const response = await ai.models.generateContent({
model: "gemini-2.5-flash",
contents: createUserContent([
"What is different between these two images?",
createPartFromUri(uploadedFile.uri, uploadedFile.mimeType),
{
inlineData: {
mimeType: "image/png",
data: base64Image2File,
},
},
]),
});
console.log(response.text);
}
### Go
await main();
https://ai.google.dev/gemini-api/docs/image-understanding.md.txt 8/14
10/24/25, 11:03 PM ai.google.dev/gemini-api/docs/image-understanding.md.txt
// Upload the first image
image1Path := "path/to/image1.jpg"
uploadedFile, _ := client.Files.UploadFromPath(ctx, image1Path, nil)
// Prepare the second image as inline data
image2Path := "path/to/image2.jpeg"
imgBytes, _ := os.ReadFile(image2Path)
parts := []*genai.Part{
genai.NewPartFromText("What is different between these two images?"),
genai.NewPartFromBytes(imgBytes, "image/jpeg"),
genai.NewPartFromURI(uploadedFile.URI, uploadedFile.MIMEType),
contents := []*genai.Content{
genai.NewContentFromParts(parts, genai.RoleUser),
}
}
result, _ := client.Models.GenerateContent(
ctx,
"gemini-2.5-flash",
contents,
nil,
)
fmt.Println(result.Text())
### REST
# Upload the first image
IMAGE1_PATH="path/to/image1.jpg"
MIME1_TYPE=$(file -b --mime-type "${IMAGE1_PATH}")
NUM1_BYTES=$(wc -c < "${IMAGE1_PATH}")
DISPLAY_NAME1=IMAGE1
tmp_header_file1=upload-header1.tmp
curl "https://generativelanguage.googleapis.com/upload/v1beta/files" \
-H "x-goog-api-key: $GEMINI_API_KEY" \
-D upload-header1.tmp \
-H "X-Goog-Upload-Protocol: resumable" \
-H "X-Goog-Upload-Command: start" \
-H "X-Goog-Upload-Header-Content-Length: ${NUM1_BYTES}" \
-H "X-Goog-Upload-Header-Content-Type: ${MIME1_TYPE}" \
-H "Content-Type: application/json" \
-d "{'file': {'display_name': '${DISPLAY_NAME1}'}}" 2> /dev/null
upload_url1=$(grep -i "x-goog-upload-url: " "${tmp_header_file1}" | cut -d" " -f2 | tr -
d "\r")
rm "${tmp_header_file1}"
curl "${upload_url1}" \
-H "Content-Length: ${NUM1_BYTES}" \
-H "X-Goog-Upload-Offset: 0" \
-H "X-Goog-Upload-Command: upload, finalize" \
--data-binary "@${IMAGE1_PATH}" 2> /dev/null > file_info1.json
file1_uri=$(jq ".file.uri" file_info1.json)
echo file1_uri=$file1_uri
# Prepare the second image (inline)
IMAGE2_PATH="path/to/image2.png"
MIME2_TYPE=$(file -b --mime-type "${IMAGE2_PATH}")
https://ai.google.dev/gemini-api/docs/image-understanding.md.txt 9/14
10/24/25, 11:03 PM ai.google.dev/gemini-api/docs/image-understanding.md.txt
if [[ "$(base64 --version 2>&1)" = *"FreeBSD"* ]]; then
B64FLAGS="--input"
else
B64FLAGS="-w0"
fi
IMAGE2_BASE64=$(base64 $B64FLAGS $IMAGE2_PATH)
# Now generate content using both images
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-
flash:generateContent" \
-H "x-goog-api-key: $GEMINI_API_KEY" \
-H 'Content-Type: application/json' \
-X POST \
-d '{
"contents": [{
"parts":[
{"text": "What is different between these two images?"},
{"file_data":{"mime_type": "'"${MIME1_TYPE}"'", "file_uri": '$file1_uri'}},
{
"inline_data": {
"mime_type":"'"${MIME2_TYPE}"'",
"data": "'"$IMAGE2_BASE64"'"
}
}
]
}]
}' 2> /dev/null > response.json
cat response.json
echo
jq ".candidates[].content.parts[].text" response.json
## Object detection
From Gemini 2.0 onwards, models are further trained to detect objects in an
image and get their bounding box coordinates. The coordinates, relative to image
dimensions, scale to \[0, 1000\]. You need to descale these coordinates based on
your original image size.
### Python
from google import genai
from google.genai import types
from PIL import Image
import json
client = genai.Client()
prompt = "Detect the all of the prominent items in the image. The box_2d should be
[ymin, xmin, ymax, xmax] normalized to 0-1000."
image = Image.open("/path/to/image.png")
config = types.GenerateContentConfig(
response_mime_type="application/json"
)
response = client.models.generate_content(model="gemini-2.5-flash",
contents=[image, prompt],
config=config
)
https://ai.google.dev/gemini-api/docs/image-understanding.md.txt 10/14
10/24/25, 11:03 PM ai.google.dev/gemini-api/docs/image-understanding.md.txt
width, height = image.size
bounding_boxes = json.loads(response.text)
converted_bounding_boxes = []
for bounding_box in bounding_boxes:
abs_y1 = int(bounding_box["box_2d"][0]/1000 * height)
abs_x1 = int(bounding_box["box_2d"][1]/1000 * width)
abs_y2 = int(bounding_box["box_2d"][2]/1000 * height)
abs_x2 = int(bounding_box["box_2d"][3]/1000 * width)
converted_bounding_boxes.append([abs_x1, abs_y1, abs_x2, abs_y2])
print("Image size: ", width, height)
print("Bounding boxes:", converted_bounding_boxes)
| **Note:** The model also supports generating bounding boxes based on custom instructions,
such as: "Show bounding boxes of all green objects in this image". It also support custom
labels like "label the items with the allergens they can contain".
For more examples, check following notebooks in the [Gemini Cookbook]
(https://github.com/google-gemini/cookbook):
- [2D spatial understanding notebook](https://colab.research.google.com/github/google-
gemini/cookbook/blob/main/quickstarts/Spatial_understanding.ipynb)
- [Experimental 3D pointing notebook](https://colab.research.google.com/github/google-
gemini/cookbook/blob/main/examples/Spatial_understanding_3d.ipynb)
## Segmentation
Starting with Gemini 2.5, models not only detect items but also segment them
and provide their contour masks.
The model predicts a JSON list, where each item represents a segmentation mask.
Each item has a bounding box ("`box_2d`") in the format `[y0, x0, y1, x1]` with
normalized coordinates between 0 and 1000, a label ("`label`") that identifies
the object, and finally the segmentation mask inside the bounding box, as base64
encoded png that is a probability map with values between 0 and 255.
The mask needs to be resized to match the bounding box dimensions, then
binarized at your confidence threshold (127 for the midpoint).
**Note:** For better results, disable [thinking](https://ai.google.dev/gemini-
api/docs/thinking) by setting the thinking budget to 0. See code sample below for an
example.
### Python
from google import genai
from google.genai import types
from PIL import Image, ImageDraw
import io
import base64
import json
import numpy as np
import os
client = genai.Client()
def parse_json(json_output: str):
# Parsing out the markdown fencing
lines = json_output.splitlines()
for i, line in enumerate(lines):
if line == "```json":
json_output = "\n".join(lines[i+1:]) # Remove everything before "```json"
output = json_output.split("```")[0] # Remove everything after the closing "```"
break # Exit the loop once "```json" is found
https://ai.google.dev/gemini-api/docs/image-understanding.md.txt 11/14
10/24/25, 11:03 PM ai.google.dev/gemini-api/docs/image-understanding.md.txt
return json_output
def extract_segmentation_masks(image_path: str, output_dir: str =
"segmentation_outputs"):
# Load and resize image
im = Image.open(image_path)
im.thumbnail([1024, 1024], Image.Resampling.LANCZOS)
prompt = """
Give the segmentation masks for the wooden and glass items.
Output a JSON list of segmentation masks where each entry contains the 2D
bounding box in the key "box_2d", the segmentation mask in key "mask", and
the text label in the key "label". Use descriptive labels.
"""
config = types.GenerateContentConfig(
thinking_config=types.ThinkingConfig(thinking_budget=0) # set thinking_budget to 0
for better results in object detection
)
response = client.models.generate_content(
model="gemini-2.5-flash",
contents=[prompt, im], # Pillow images can be directly passed as inputs (which will
be converted by the SDK)
config=config
)
# Parse JSON response
items = json.loads(parse_json(response.text))
# Create output directory
os.makedirs(output_dir, exist_ok=True)
# Process each mask
for i, item in enumerate(items):
# Get bounding box coordinates
box = item["box_2d"]
y0 = int(box[0] / 1000 * im.size[1])
x0 = int(box[1] / 1000 * im.size[0])
y1 = int(box[2] / 1000 * im.size[1])
x1 = int(box[3] / 1000 * im.size[0])
# Skip invalid boxes
if y0 >= y1 or x0 >= x1:
continue
# Process mask
png_str = item["mask"]
if not png_str.startswith("data:image/png;base64,"):
continue
# Remove prefix
png_str = png_str.removeprefix("data:image/png;base64,")
mask_data = base64.b64decode(png_str)
mask = Image.open(io.BytesIO(mask_data))
# Resize mask to match bounding box
mask = mask.resize((x1 - x0, y1 - y0), Image.Resampling.BILINEAR)
# Convert mask to numpy array for processing
mask_array = np.array(mask)
# Create overlay for this mask
https://ai.google.dev/gemini-api/docs/image-understanding.md.txt 12/14
10/24/25, 11:03 PM ai.google.dev/gemini-api/docs/image-understanding.md.txt
overlay = Image.new('RGBA', im.size, (0, 0, 0, 0))
overlay_draw = ImageDraw.Draw(overlay)
# Create overlay for the mask
color = (255, 255, 255, 200)
for y in range(y0, y1):
for x in range(x0, x1):
if mask_array[y - y0, x - x0] > 128: # Threshold for mask
overlay_draw.point((x, y), fill=color)
# Save individual mask and its overlay
mask_filename = f"{item['label']}_{i}_mask.png"
overlay_filename = f"{item['label']}_{i}_overlay.png"
mask.save(os.path.join(output_dir, mask_filename))
# Create and save overlay
composite = Image.alpha_composite(im.convert('RGBA'), overlay)
composite.save(os.path.join(output_dir, overlay_filename))
print(f"Saved mask and overlay for {item['label']} to {output_dir}")
# Example usage
if __name__ == "__main__":
extract_segmentation_masks("path/to/image.png")
Check the
[segmentation example](https://colab.research.google.com/github/google-
gemini/cookbook/blob/main/quickstarts/Spatial_understanding.ipynb#scrollTo=WQJTJ8wdGOKx)
in the cookbook guide for a more detailed example.
![A table with cupcakes, with the wooden and glass objects highlighted]
(https://ai.google.dev/static/gemini-api/docs/images/segmentation.jpg) An example
segmentation output with objects and segmentation masks
## Supported image formats
Gemini supports the following image format MIME types:
- PNG - `image/png`
- JPEG - `image/jpeg`
- WEBP - `image/webp`
- HEIC - `image/heic`
- HEIF - `image/heif`
## Capabilities
All Gemini model versions are multimodal and can be utilized in a wide range of
image processing and computer vision tasks including but not limited to image captioning,
visual question and answering, image classification, object detection and segmentation.
Gemini can reduce the need to use specialized ML models depending on your quality and
performance requirements.
Some later model versions are specifically trained improve accuracy of specialized tasks in
addition to generic capabilities:
- **Gemini 2.0 models** are further trained to support enhanced [object detection]
(https://ai.google.dev/gemini-api/docs/image-understanding#object-detection).
- **Gemini 2.5 models** are further trained to support enhanced [segmentation]
(https://ai.google.dev/gemini-api/docs/image-understanding#segmentation) in addition to
[object detection](https://ai.google.dev/gemini-api/docs/image-understanding#object-
detection).
https://ai.google.dev/gemini-api/docs/image-understanding.md.txt 13/14
10/24/25, 11:03 PM ai.google.dev/gemini-api/docs/image-understanding.md.txt
## Limitations and key technical information
### File limit
Gemini 2.5 Pro/Flash, 2.0 Flash, 1.5 Pro, and 1.5 Flash support a
maximum of 3,600 image files per request.
### Token calculation
- **Gemini 1.5 Flash and Gemini 1.5 Pro**: 258 tokens if both dimensions \<= 384 pixels.
Larger images are tiled (min tile 256px, max 768px, resized to 768x768), with each tile
costing 258 tokens.
- **Gemini 2.0 Flash and Gemini 2.5 Flash/Pro**: 258 tokens if both dimensions \<= 384
pixels. Larger images are tiled into 768x768 pixel tiles, each costing 258 tokens.
A rough formula for calculating the number of tiles is as follows:
- Calculate the crop unit size which is roughly: floor(min(width, height) / 1.5).
- Divide each dimension by the crop unit size and multiply together to get the number of
tiles.
For example, for an image of dimensions 960x540 would have a crop unit size
of 360. Divide each dimension by 360 and the number of tile is 3 \* 2 = 6.
## Tips and best practices
- Verify that images are correctly rotated.
- Use clear, non-blurry images.
- When using a single image with text, place the text prompt *after* the image part in the
`contents` array.
## What's next
This guide shows you how to upload image files and generate text outputs from image
inputs. To learn more, see the following resources:
- [Files API](https://ai.google.dev/gemini-api/docs/files): Learn more about uploading and
managing files for use with Gemini.
- [System instructions](https://ai.google.dev/gemini-api/docs/text-generation#system-
instructions): System instructions let you steer the behavior of the model based on your
specific needs and use cases.
- [File prompting strategies](https://ai.google.dev/gemini-api/docs/files#prompt-guide): The
Gemini API supports prompting with text, image, audio, and video data, also known as
multimodal prompting.
- [Safety guidance](https://ai.google.dev/gemini-api/docs/safety-guidance): Sometimes
generative AI models produce unexpected outputs, such as outputs that are inaccurate,
biased, or offensive. Post-processing and human evaluation are essential to limit the risk
of harm from such outputs.
https://ai.google.dev/gemini-api/docs/image-understanding.md.txt 14/14

10/24/25, 11:03 PM ai.google.dev/gemini-api/docs/video-understanding.md.txt
Gemini models can process videos, enabling many frontier developer use cases
that would have historically required domain specific models.
Some of Gemini's vision capabilities include the ability to:
- Describe, segment, and extract information from videos
- Answer questions about video content
- Refer to specific timestamps within a video
Gemini was built to be multimodal from the ground up and we continue to push the
frontier of what is possible. This guide shows how to use the Gemini API to
generate text responses based on video inputs.
## Video input
You can provide videos as input to Gemini in the following ways:
- [Upload a video file](https://ai.google.dev/gemini-api/docs/video-understanding#upload-
video) using the File API before making a request to `generateContent`. Use this method for
files larger than 20MB, videos longer than approximately 1 minute, or when you want to reuse
the file across multiple requests.
- [Pass inline video data](https://ai.google.dev/gemini-api/docs/video-understanding#inline-
video) with the request to `generateContent`. Use this method for smaller files (\<20MB) and
shorter durations.
- [Pass YouTube URLs](https://ai.google.dev/gemini-api/docs/video-understanding#youtube) as
part of your `generateContent` request.
### Upload a video file
You can use the [Files API](https://ai.google.dev/gemini-api/docs/files) to upload a video
file.
Always use the Files API when the total request size (including the file, text
prompt, system instructions, etc.) is larger than 20 MB, the video duration is
significant, or if you intend to use the same video in multiple prompts.
The File API accepts video file formats directly.
The following code downloads the sample video, uploads it using the File API,
waits for it to be processed, and then uses the file reference in
a `generateContent` request.
### Python
from google import genai
client = genai.Client()
myfile = client.files.upload(file="path/to/sample.mp4")
response = client.models.generate_content(
model="gemini-2.5-flash", contents=[myfile, "Summarize this video. Then create a
quiz with an answer key based on the information in this video."]
)
print(response.text)
### JavaScript
import {
GoogleGenAI,
createUserContent,
createPartFromUri,
} from "@google/genai";
https://ai.google.dev/gemini-api/docs/video-understanding.md.txt 1/10
10/24/25, 11:03 PM ai.google.dev/gemini-api/docs/video-understanding.md.txt
const ai = new GoogleGenAI({});
async function main() {
const myfile = await ai.files.upload({
file: "path/to/sample.mp4",
config: { mimeType: "video/mp4" },
});
const response = await ai.models.generateContent({
model: "gemini-2.5-flash",
contents: createUserContent([
createPartFromUri(myfile.uri, myfile.mimeType),
"Summarize this video. Then create a quiz with an answer key based on the
information in this video.",
]),
});
console.log(response.text);
}
await main();
### Go
uploadedFile, _ := client.Files.UploadFromPath(ctx, "path/to/sample.mp4", nil)
parts := []*genai.Part{
genai.NewPartFromText("Summarize this video. Then create a quiz with an answer key
based on the information in this video."),
genai.NewPartFromURI(uploadedFile.URI, uploadedFile.MIMEType),
}
contents := []*genai.Content{
genai.NewContentFromParts(parts, genai.RoleUser),
}
result, _ := client.Models.GenerateContent(
ctx,
"gemini-2.5-flash",
contents,
nil,
)
fmt.Println(result.Text())
### REST
VIDEO_PATH="path/to/sample.mp4"
MIME_TYPE=$(file -b --mime-type "${VIDEO_PATH}")
NUM_BYTES=$(wc -c < "${VIDEO_PATH}")
DISPLAY_NAME=VIDEO
tmp_header_file=upload-header.tmp
echo "Starting file upload..."
curl "https://generativelanguage.googleapis.com/upload/v1beta/files" \
-H "x-goog-api-key: $GEMINI_API_KEY" \
-D ${tmp_header_file} \
-H "X-Goog-Upload-Protocol: resumable" \
-H "X-Goog-Upload-Command: start" \
-H "X-Goog-Upload-Header-Content-Length: ${NUM_BYTES}" \
-H "X-Goog-Upload-Header-Content-Type: ${MIME_TYPE}" \
-H "Content-Type: application/json" \
-d "{'file': {'display_name': '${DISPLAY_NAME}'}}" 2> /dev/null
https://ai.google.dev/gemini-api/docs/video-understanding.md.txt 2/10
10/24/25, 11:03 PM ai.google.dev/gemini-api/docs/video-understanding.md.txt
upload_url=$(grep -i "x-goog-upload-url: " "${tmp_header_file}" | cut -d" " -f2 | tr -d
"\r")
rm "${tmp_header_file}"
echo "Uploading video data..."
curl "${upload_url}" \
-H "Content-Length: ${NUM_BYTES}" \
-H "X-Goog-Upload-Offset: 0" \
-H "X-Goog-Upload-Command: upload, finalize" \
--data-binary "@${VIDEO_PATH}" 2> /dev/null > file_info.json
file_uri=$(jq -r ".file.uri" file_info.json)
echo file_uri=$file_uri
echo "File uploaded successfully. File URI: ${file_uri}"
# --- 3. Generate content using the uploaded video file ---
echo "Generating content from video..."
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-
flash:generateContent" \
-H "x-goog-api-key: $GEMINI_API_KEY" \
-H 'Content-Type: application/json' \
-X POST \
-d '{
"contents": [{
"parts":[
{"file_data":{"mime_type": "'"${MIME_TYPE}"'", "file_uri":
"'"${file_uri}"'"}},
{"text": "Summarize this video. Then create a quiz with an answer key based on
the information in this video."}]
}]
}' 2> /dev/null > response.json
jq -r ".candidates[].content.parts[].text" response.json
To learn more about working with media files, see
[Files API](https://ai.google.dev/gemini-api/docs/files).
### Pass video data inline
Instead of uploading a video file using the File API, you can pass smaller
videos directly in the request to `generateContent`. This is suitable for
shorter videos under 20MB total request size.
Here's an example of providing inline video data:
### Python
from google import genai
from google.genai import types
# Only for videos of size <20Mb
video_file_name = "/path/to/your/video.mp4"
video_bytes = open(video_file_name, 'rb').read()
client = genai.Client()
response = client.models.generate_content(
model='models/gemini-2.5-flash',
contents=types.Content(
parts=[
types.Part(
inline_data=types.Blob(data=video_bytes, mime_type='video/mp4')
https://ai.google.dev/gemini-api/docs/video-understanding.md.txt 3/10
10/24/25, 11:03 PM ai.google.dev/gemini-api/docs/video-understanding.md.txt
),
types.Part(text='Please summarize the video in 3 sentences.')
]
)
)
### JavaScript
import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";
const ai = new GoogleGenAI({});
const base64VideoFile = fs.readFileSync("path/to/small-sample.mp4", {
encoding: "base64",
});
const contents = [
{
inlineData: {
mimeType: "video/mp4",
data: base64VideoFile,
},
},
{ text: "Please summarize the video in 3 sentences." }
];
const response = await ai.models.generateContent({
model: "gemini-2.5-flash",
contents: contents,
});
console.log(response.text);
### REST
**Note:** If you get an `Argument list too long` error, the base64 encoding of your file
might be too long for the curl command line. Use the File API method instead for larger
files.
VIDEO_PATH=/path/to/your/video.mp4
if [[ "$(base64 --version 2>&1)" = *"FreeBSD"* ]]; then
B64FLAGS="--input"
else
B64FLAGS="-w0"
fi
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-
flash:generateContent" \
-H "x-goog-api-key: $GEMINI_API_KEY" \
-H 'Content-Type: application/json' \
-X POST \
-d '{
"contents": [{
"parts":[
{
"inline_data": {
"mime_type":"video/mp4",
"data": "'$(base64 $B64FLAGS $VIDEO_PATH)'"
}
},
{"text": "Please summarize the video in 3 sentences."}
]
}]
https://ai.google.dev/gemini-api/docs/video-understanding.md.txt 4/10
10/24/25, 11:03 PM ai.google.dev/gemini-api/docs/video-understanding.md.txt
}' 2> /dev/null
### Pass YouTube URLs
| **Preview:** The YouTube URL feature is in preview and is available at no charge. Pricing
and rate limits are likely to change.
You can pass YouTube URLs directly to Gemini API as part of your `generateContent`request as
follows:
### Python
response = client.models.generate_content(
model='models/gemini-2.5-flash',
contents=types.Content(
parts=[
types.Part(
file_data=types.FileData(file_uri='https://www.youtube.com/watch?v=9hE5-
98ZeCg')
),
types.Part(text='Please summarize the video in 3 sentences.')
]
)
)
### JavaScript
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
const result = await model.generateContent([
"Please summarize the video in 3 sentences.",
{
fileData: {
fileUri: "https://www.youtube.com/watch?v=9hE5-98ZeCg",
},
},
]);
console.log(result.response.text());
### Go
package main
import (
"context"
"fmt"
"os"
"google.golang.org/genai"
)
func main() {
ctx := context.Background()
client, err := genai.NewClient(ctx, nil)
if err != nil {
log.Fatal(err)
}
}
parts := []*genai.Part{
genai.NewPartFromText("Please summarize the video in 3 sentences."),
genai.NewPartFromURI("https://www.youtube.com/watch?v=9hE5-98ZeCg","video/mp4"),
https://ai.google.dev/gemini-api/docs/video-understanding.md.txt 5/10
10/24/25, 11:03 PM ai.google.dev/gemini-api/docs/video-understanding.md.txt
contents := []*genai.Content{
genai.NewContentFromParts(parts, genai.RoleUser),
}
result, _ := client.Models.GenerateContent(
ctx,
"gemini-2.5-flash",
contents,
nil,
)
fmt.Println(result.Text())
}
### REST
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-
flash:generateContent" \
-H "x-goog-api-key: $GEMINI_API_KEY" \
-H 'Content-Type: application/json' \
-X POST \
-d '{
"contents": [{
"parts":[
{"text": "Please summarize the video in 3 sentences."},
{
"file_data": {
"file_uri": "https://www.youtube.com/watch?v=9hE5-98ZeCg"
}
}
]
}]
}' 2> /dev/null
**Limitations:**
- For the free tier, you can't upload more than 8 hours of YouTube video per day.
- For the paid tier, there is no limit based on video length.
- For models prior to Gemini 2.5, you can upload only 1 video per request. For Gemini 2.5
and later models, you can upload a maximum of 10 videos per request.
- You can only upload public videos (not private or unlisted videos).
## Refer to timestamps in the content
You can ask questions about specific points in time within the video using
timestamps of the form `MM:SS`.
### Python
prompt = "What are the examples given at 00:05 and 00:10 supposed to show us?" #
Adjusted timestamps for the NASA video
### JavaScript
const prompt = "What are the examples given at 00:05 and 00:10 supposed to show us?";
### Go
prompt := []*genai.Part{
genai.NewPartFromURI(currentVideoFile.URI, currentVideoFile.MIMEType),
// Adjusted timestamps for the NASA video
genai.NewPartFromText("What are the examples given at 00:05 and " +
https://ai.google.dev/gemini-api/docs/video-understanding.md.txt 6/10
10/24/25, 11:03 PM ai.google.dev/gemini-api/docs/video-understanding.md.txt
"00:10 supposed to show us?"),
}
### REST
PROMPT="What are the examples given at 00:05 and 00:10 supposed to show us?"
## Transcribe video and provide visual descriptions
The Gemini models can transcribe and provide visual descriptions of video
content by processing both the audio track and visual frames. For visual
descriptions, the model samples the video at a rate of **1 frame per second**.
This sampling rate may affect the level of detail in the descriptions,
particularly for videos with rapidly changing visuals.
### Python
prompt = "Transcribe the audio from this video, giving timestamps for salient events in
the video. Also provide visual descriptions."
### JavaScript
const prompt = "Transcribe the audio from this video, giving timestamps for salient
events in the video. Also provide visual descriptions.";
### Go
prompt := []*genai.Part{
genai.NewPartFromURI(currentVideoFile.URI, currentVideoFile.MIMEType),
genai.NewPartFromText("Transcribe the audio from this video, giving timestamps
for salient events in the video. Also " +
"provide visual descriptions."),
}
### REST
PROMPT="Transcribe the audio from this video, giving timestamps for salient events in
the video. Also provide visual descriptions."
## Customize video processing
You can customize video processing in the Gemini API by setting clipping
intervals or providing custom frame rate sampling.
| **Tip:** Video clipping and frames per second (FPS) are supported by all models, but the
quality is significantly higher from 2.5 series models.
### Set clipping intervals
You can clip video by specifying `videoMetadata` with start and end offsets.
### Python
from google import genai
from google.genai import types
client = genai.Client()
response = client.models.generate_content(
model='models/gemini-2.5-flash',
contents=types.Content(
parts=[
types.Part(
file_data=types.FileData(file_uri='https://www.youtube.com/watch?
v=XEzRZ35urlk'),
https://ai.google.dev/gemini-api/docs/video-understanding.md.txt 7/10
10/24/25, 11:03 PM ai.google.dev/gemini-api/docs/video-understanding.md.txt
video_metadata=types.VideoMetadata(
start_offset='1250s',
end_offset='1570s'
)
),
types.Part(text='Please summarize the video in 3 sentences.')
]
)
)
### JavaScript
import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({});
const model = 'gemini-2.5-flash';
async function main() {
const contents = [
{
role: 'user',
parts: [
{
fileData: {
fileUri: 'https://www.youtube.com/watch?v=9hE5-98ZeCg',
mimeType: 'video/*',
},
videoMetadata: {
startOffset: '40s',
endOffset: '80s',
}
},
{
},
text: 'Please summarize the video in 3 sentences.',
],
},
];
const response = await ai.models.generateContent({
model,
contents,
});
console.log(response.text)
}
await main();
### Set a custom frame rate
You can set custom frame rate sampling by passing an `fps` argument to
`videoMetadata`.
**Note:** Due to built-in per image based safety checks, the same video may get blocked at
some fps and not at others due to different extracted frames.
### Python
from google import genai
from google.genai import types
# Only for videos of size <20Mb
video_file_name = "/path/to/your/video.mp4"
https://ai.google.dev/gemini-api/docs/video-understanding.md.txt 8/10
10/24/25, 11:03 PM ai.google.dev/gemini-api/docs/video-understanding.md.txt
video_bytes = open(video_file_name, 'rb').read()
client = genai.Client()
response = client.models.generate_content(
model='models/gemini-2.5-flash',
contents=types.Content(
parts=[
types.Part(
inline_data=types.Blob(
data=video_bytes,
mime_type='video/mp4'),
video_metadata=types.VideoMetadata(fps=5)
),
types.Part(text='Please summarize the video in 3 sentences.')
]
)
)
By default 1 frame per second (FPS) is sampled from the video. You might want to
set low FPS (\< 1) for long videos. This is especially useful for mostly static
videos (e.g. lectures). If you want to capture more details in rapidly changing
visuals, consider setting a higher FPS value.
## Supported video formats
Gemini supports the following video format MIME types:
- `video/mp4`
- `video/mpeg`
- `video/mov`
- `video/avi`
- `video/x-flv`
- `video/mpg`
- `video/webm`
- `video/wmv`
- `video/3gpp`
## Technical details about videos
- **Supported models \& context** : All Gemini 2.0 and 2.5 models can process video data.
- Models with a 2M context window can process videos up to 2 hours long at default media
resolution or 6 hours long at low media resolution, while models with a 1M context window
can process videos up to 1 hour long at default media resolution or 3 hours long at low
media resolution.
- **File API processing** : When using the File API, videos are stored at 1 frame per second
(FPS) and audio is processed at 1Kbps (single channel). Timestamps are added every second.
- These rates are subject to change in the future for improvements in inference.
- You can override the 1 FPS sampling rate by [setting a custom frame rate]
(https://ai.google.dev/gemini-api/docs/video-understanding#custom-frame-rate).
- **Token calculation** : Each second of video is tokenized as follows:
- Individual frames (sampled at 1 FPS):
- If [`mediaResolution`](https://ai.google.dev/api/generate-content#MediaResolution) is
set to low, frames are tokenized at 66 tokens per frame.
- Otherwise, frames are tokenized at 258 tokens per frame.
- Audio: 32 tokens per second.
- Metadata is also included.
- Total: Approximately 300 tokens per second of video at default media resolution, or 100
tokens per second of video at low media resolution.
- **Timestamp format** : When referring to specific moments in a video within your prompt,
use the `MM:SS` format (e.g., `01:15` for 1 minute and 15 seconds).
- **Best practices** :
- Use only one video per prompt request for optimal results.
- If combining text and a single video, place the text prompt *after* the video part in
https://ai.google.dev/gemini-api/docs/video-understanding.md.txt 9/10
10/24/25, 11:03 PM ai.google.dev/gemini-api/docs/video-understanding.md.txt
the `contents` array.
- Be aware that fast action sequences might lose detail due to the 1 FPS sampling rate.
Consider slowing down such clips if necessary.
## What's next
This guide shows how to upload video files and generate text outputs from video
inputs. To learn more, see the following resources:
- [System instructions](https://ai.google.dev/gemini-api/docs/text-generation#system-
instructions): System instructions let you steer the behavior of the model based on your
specific needs and use cases.
- [Files API](https://ai.google.dev/gemini-api/docs/files): Learn more about uploading and
managing files for use with Gemini.
- [File prompting strategies](https://ai.google.dev/gemini-api/docs/files#prompt-guide): The
Gemini API supports prompting with text, image, audio, and video data, also known as
multimodal prompting.
- [Safety guidance](https://ai.google.dev/gemini-api/docs/safety-guidance): Sometimes
generative AI models produce unexpected outputs, such as outputs that are inaccurate,
biased, or offensive. Post-processing and human evaluation are essential to limit the risk
of harm from such outputs.
https://ai.google.dev/gemini-api/docs/video-understanding.md.txt 10/10
