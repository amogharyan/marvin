import { AudioProcessor } from "Remote Service Gateway.lspkg/Helpers/AudioProcessor";
import { DynamicAudioOutput } from "Remote Service Gateway.lspkg/Helpers/DynamicAudioOutput";
import {
  Gemini,
  GeminiLiveWebsocket,
} from "Remote Service Gateway.lspkg/HostedExternal/Gemini";
import { GeminiTypes } from "Remote Service Gateway.lspkg/HostedExternal/GeminiTypes";
import { MicrophoneRecorder } from "Remote Service Gateway.lspkg/Helpers/MicrophoneRecorder";
import { VideoController } from "Remote Service Gateway.lspkg/Helpers/VideoController";

import Event from "SpectaclesInteractionKit.lspkg/Utils/Event";
import { setTimeout } from "SpectaclesInteractionKit.lspkg/Utils/FunctionTimingUtils";

// Component type definitions
export enum ComponentType {
  Resistor = "resistor",
  OpAmp = "op_amp",
  Breadboard = "breadboard",
  Wire = "wire",
  Capacitor = "capacitor",
  Inductor = "inductor",
  Diode = "diode",
  Transistor = "transistor",
  Unknown = "unknown"
}

// Detected component interface
export interface DetectedComponent {
  type: ComponentType;
  position: { x: number; y: number };
  confidence: number;
  boundingBox?: { x: number; y: number; width: number; height: number };
  value?: string;
  pins?: string[];
  additionalInfo?: any;
}

// Breadboard hole interface
export interface BreadboardHole {
  x: number;
  y: number;
  row: number;
  column: number;
  isConnected: boolean;
  connectedHoles?: BreadboardHole[];
}

@component
export class MarvinAssistant extends BaseScriptComponent {
  @ui.separator
  @ui.label(
    "Marvin Object Recognition Assistant - Ask about objects in the scene and their relationships"
  )
  @ui.separator
  @ui.separator
  @ui.group_start("Setup")
  @input
  private websocketRequirementsObj: SceneObject;
  @input private dynamicAudioOutput: DynamicAudioOutput;
  @input private microphoneRecorder: MicrophoneRecorder;
  @ui.group_end
  @ui.separator
  @ui.group_start("Inputs")
  @input
  @widget(new TextAreaWidget())
  private instructions: string =
    "You are Marvin, a work-focused AR assistant. ONLY respond when you see a laptop or computer in the video.\n\nIMPORTANT RULES:\n- If you see a LAPTOP/COMPUTER: Say EXACTLY 'I see you're on your laptop, would you like to see your work schedule for the day?'\n- If you DON'T see a laptop: Say NOTHING. Stay completely silent.\n- NEVER mention other objects like phones, keys, food, etc.\n- ONLY respond to laptops/computers with the exact phrase above.\n\nBe brief and use ONLY the specified phrase when you see a laptop.";
  @input private haveVideoInput: boolean = true;
  @ui.group_end
  @ui.separator
  @ui.group_start("Outputs")
  @ui.label(
    '<span style="color: yellow;">⚠️ To prevent audio feedback loop in Lens Studio Editor, use headphones or manage your microphone input.</span>'
  )
  @input
  private haveAudioOutput: boolean = false;
  @input
  @showIf("haveAudioOutput", true)
  @widget(
    new ComboBoxWidget([
      new ComboBoxItem("Puck", "Puck"),
      new ComboBoxItem("Charon", "Charon"),
      new ComboBoxItem("Kore", "Kore"),
      new ComboBoxItem("Fenrir", "Fenrir"),
      new ComboBoxItem("Aoede", "Aoede"),
      new ComboBoxItem("Leda", "Leda"),
      new ComboBoxItem("Orus", "Orus"),
      new ComboBoxItem("Zephyr", "Zephyr"),
    ])
  )
  private voice: string = "Puck";
  @ui.group_end
  @ui.separator
  private audioProcessor: AudioProcessor = new AudioProcessor();
  private videoController: VideoController = new VideoController(
    4000,
    CompressionQuality.MaximumCompression, // Increased for better object detection
    EncodingType.Jpg
  );
  private GeminiLive: GeminiLiveWebsocket;

  // Video stream tracking
  private videoFrameCount: number = 0;
  private videoStreamStartTime: number = 0;
  private isAISpeaking: boolean = false;

  public updateTextEvent: Event<{ text: string; completed: boolean }> =
    new Event<{ text: string; completed: boolean }>();

  public functionCallEvent: Event<{
    name: string;
    args: any;
    callId?: string;
  }> = new Event<{
    name: string;
    args: any;
  }>();

  public componentDetectedEvent: Event<any> = new Event<any>();
  public circuitCompleteEvent: Event<any> = new Event<any>();
  public placementGuidanceEvent: Event<{ component: DetectedComponent; targetHole: BreadboardHole }> = new Event<{ component: DetectedComponent; targetHole: BreadboardHole }>();

  createGeminiLiveSession() {
    this.websocketRequirementsObj.enabled = true;
    this.dynamicAudioOutput.initialize(24000);
    this.microphoneRecorder.setSampleRate(16000);

    // Display internet connection status
    let internetStatus = global.deviceInfoSystem.isInternetAvailable()
      ? "Websocket connected"
      : "No internet";

    this.updateTextEvent.invoke({ text: internetStatus, completed: true });

    global.deviceInfoSystem.onInternetStatusChanged.add((args) => {
      internetStatus = args.isInternetAvailable
        ? "Reconnected to internete"
        : "No internet";

      this.updateTextEvent.invoke({ text: internetStatus, completed: true });
    });

    this.GeminiLive = Gemini.liveConnect();

    this.GeminiLive.onOpen.add((event) => {
      print("Connection opened");
      this.sessionSetup();
    });

    let completedTextDisplay = true;

    this.GeminiLive.onMessage.add((message) => {
      print("Received message: " + JSON.stringify(message));
      // Setup complete, begin sending data
      if (message.setupComplete) {
        message = message as GeminiTypes.Live.SetupCompleteEvent;
        print("Setup complete");
        this.setupInputs();
      }

      if (message?.serverContent) {
        message = message as GeminiTypes.Live.ServerContentEvent;
        
        // Detect when AI starts speaking - pause user audio/video input temporarily
        if (message?.serverContent?.modelTurn && !this.isAISpeaking) {
          this.isAISpeaking = true;
          print("AI started speaking - temporarily pausing audio/video processing");
          // Pause microphone to prevent echo/feedback during AI response
          this.microphoneRecorder.stopRecording();
          // Pause video to reduce context buildup during AI response
          if (this.haveVideoInput) {
            this.videoController.stopRecording();
          }
        }
        
        // Playback the audio response
        if (
          message?.serverContent?.modelTurn?.parts?.[0]?.inlineData?.mimeType?.startsWith(
            "audio/pcm"
          )
        ) {
          let b64Audio =
            message.serverContent.modelTurn.parts[0].inlineData.data;
          let audio = Base64.decode(b64Audio);
          this.dynamicAudioOutput.addAudioFrame(audio);
        }
        if (message.serverContent.interrupted) {
          this.dynamicAudioOutput.interruptAudioOutput();
          // Resume listening immediately when interrupted
          this.isAISpeaking = false;
          print("AI interrupted - resuming listening");
          this.microphoneRecorder.startRecording();
          if (this.haveVideoInput) {
            this.videoController.startRecording();
          }
        }
        // Show output transcription
        else if (message?.serverContent?.outputTranscription?.text) {
          if (completedTextDisplay) {
            this.updateTextEvent.invoke({
              text: message.serverContent.outputTranscription?.text,
              completed: true,
            });
          } else {
            this.updateTextEvent.invoke({
              text: message.serverContent.outputTranscription?.text,
              completed: false,
            });
          }
          completedTextDisplay = false;
        }

        // Show text response
        else if (message?.serverContent?.modelTurn?.parts?.[0]?.text) {
          const responseText = message.serverContent.modelTurn.parts[0].text;

          if (completedTextDisplay) {
            this.updateTextEvent.invoke({
              text: responseText,
              completed: true,
            });
          } else {
            this.updateTextEvent.invoke({
              text: responseText,
              completed: false,
            });
          }
          completedTextDisplay = false;

          // Parse response for object detection
          this.parseObjectsFromResponse(responseText);
        }

        // Determine if the response is complete
        if (message?.serverContent?.turnComplete) {
          completedTextDisplay = true;
          this.isAISpeaking = false;
          print("Turn complete - resuming listening");
          // Resume microphone and video recording after AI finishes speaking
          this.microphoneRecorder.startRecording();
          if (this.haveVideoInput) {
            this.videoController.startRecording();
          }
        }
      }

      if (message.toolCall) {
        message = message as GeminiTypes.Live.ToolCallEvent;
        print(JSON.stringify(message));
        // Handle tool calls
        message.toolCall.functionCalls.forEach((functionCall) => {
          this.functionCallEvent.invoke({
            name: functionCall.name,
            args: functionCall.args,
          });
        });
      }
    });

    this.GeminiLive.onError.add((event) => {
      print("Error: " + event);
    });

    this.GeminiLive.onClose.add((event) => {
      print("Connection closed: " + event.reason);
    });
  }

  public streamData(stream: boolean) {
    if (stream) {
      if (this.haveVideoInput) {
        this.videoFrameCount = 0;
        this.videoStreamStartTime = getTime();
        print("[VIDEO STREAM] Starting video recording and streaming to websocket");
        this.videoController.startRecording();
      }

      this.microphoneRecorder.startRecording();
    } else {
      if (this.haveVideoInput) {
        const duration = getTime() - this.videoStreamStartTime;
        const avgFPS = this.videoFrameCount / duration;
        print(`[VIDEO STREAM] Stopping video recording - Total frames: ${this.videoFrameCount}, Duration: ${duration.toFixed(2)}s, Avg FPS: ${avgFPS.toFixed(2)}`);
        this.videoController.stopRecording();
      }

      this.microphoneRecorder.stopRecording();
    }
  }

  private setupInputs() {
    this.audioProcessor.onAudioChunkReady.add((encodedAudioChunk) => {
      const message = {
        realtime_input: {
          media_chunks: [
            {
              mime_type: "audio/pcm",
              data: encodedAudioChunk,
            },
          ],
        },
      } as GeminiTypes.Live.RealtimeInput;
      this.GeminiLive.send(message);
    });

    // Configure the microphone
    this.microphoneRecorder.onAudioFrame.add((audioFrame) => {
      this.audioProcessor.processFrame(audioFrame);
    });

    if (this.haveVideoInput) {
      // Configure the video controller
      this.videoController.onEncodedFrame.add((encodedFrame) => {
        this.videoFrameCount++;
        const frameSize = encodedFrame.length;
        const timestamp = new Date().toISOString();
        const elapsedTime = (getTime() - this.videoStreamStartTime).toFixed(2);

        // Log every 10th frame to avoid console spam, but always log first frame
        if (this.videoFrameCount === 1 || this.videoFrameCount % 10 === 0) {
          print(`[VIDEO STREAM] Frame #${this.videoFrameCount} sent - Size: ${frameSize} bytes, Elapsed: ${elapsedTime}s, Time: ${timestamp}`);
        }

        const message = {
          realtime_input: {
            media_chunks: [
              {
                mime_type: "image/jpeg",
                data: encodedFrame,
              },
            ],
          },
        } as GeminiTypes.Live.RealtimeInput;
        this.GeminiLive.send(message);
      });
    }
  }

  public sendFunctionCallUpdate(functionName: string, args: string): void {
    const messageToSend = {
      tool_response: {
        function_responses: [
          {
            name: functionName,
            response: { content: args },
          },
        ],
      },
    } as GeminiTypes.Live.ToolResponse;

    this.GeminiLive.send(messageToSend);
  }

  private sessionSetup() {
    let generationConfig = {
      responseModalities: ["AUDIO"],
      temperature: 1,
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: this.voice,
          },
        },
      },
    } as GeminiTypes.Common.GenerationConfig;

    if (!this.haveAudioOutput) {
      generationConfig = {
        responseModalities: ["TEXT"],
      };
    }

    // Define the Snap3D tool
    const tools = [
      {
        function_declarations: [
          {
            name: "Snap3D",
            description: "Generates a 3D model based on a text prompt",
            parameters: {
              type: "object",
              properties: {
                prompt: {
                  type: "string",
                  description:
                    "The text prompt to generate a 3D model from. Cartoonish styles work best. Use 'full body' when generating characters.",
                },
              },
              required: ["prompt"],
            },
          },
        ],
      },
    ];

    // Send the session setup message
    let modelUri = `models/gemini-2.0-flash-live-preview-04-09`;
    const sessionSetupMessage = {
      setup: {
        model: modelUri,
        generation_config: generationConfig,
        system_instruction: {
          parts: [
            {
              text: this.instructions,
            },
          ],
        },
        tools: tools,
        contextWindowCompression: {
          triggerTokens: 50000,
          slidingWindow: { targetTokens: 40000 },
        },
        output_audio_transcription: {},
      },
    } as GeminiTypes.Live.Setup;
    this.GeminiLive.send(sessionSetupMessage);
  }

  public interruptAudioOutput(): void {
    if (this.dynamicAudioOutput && this.haveAudioOutput) {
      this.dynamicAudioOutput.interruptAudioOutput();
    } else {
      print("DynamicAudioOutput is not initialized.");
    }
  }

  public startAnalysis(): void {
    this.streamData(true);
    print("Started object recognition analysis");
  }

  public stopAnalysis(): void {
    this.streamData(false);
    print("Stopped object recognition analysis");
  }

  public getDetectedComponents(): any[] {
    // Return empty array for now - this would be populated by actual component detection logic
    return [];
  }

  /**
   * Send a client message to Gemini to trigger analysis
   */
  public sendClientMessage(message: string): void {
    if (!this.GeminiLive) {
      print("[MARVIN] ERROR: Gemini connection not established");
      return;
    }

    print(`[MARVIN] Sending client message: "${message}"`);

    const clientMessage = {
      client_content: {
        turns: [
          {
            role: "user",
            parts: [
              {
                text: message
              }
            ]
          }
        ],
        turn_complete: true
      }
    };

    this.GeminiLive.send(clientMessage);
  }

  /**
   * Parse Gemini's text response for LAPTOP mentions ONLY
   */
  private parseObjectsFromResponse(text: string) {
    if (!text) return;

    const lowerText = text.toLowerCase();
    print(`[OBJECT DETECTION] Parsing response: "${text.substring(0, 100)}..."`);

    // Create a position (assuming object is in front of camera)
    const defaultPosition = { x: 0, y: 0, z: 0.3 };

    // ONLY check for laptop - ignore all other objects
    if (lowerText.includes("laptop") || lowerText.includes("computer")) {
      print("[OBJECT DETECTION] Detected: LAPTOP");
      this.componentDetectedEvent.invoke({
        type: "laptop",
        position: defaultPosition,
        confidence: 0.9
      });
    }
    // All other object detection removed - laptop only!
  }
}