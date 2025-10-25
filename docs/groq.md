# Groq Python API Library

The Groq Python library provides convenient access to the Groq REST API from any Python 3.8+ application, offering high-performance, low-latency access to large language models. The library includes type definitions for all request params and response fields, and offers both synchronous and asynchronous clients powered by httpx. It supports chat completions, embeddings, audio transcription/translation, model management, batch processing, and file operations with automatic retry logic and comprehensive error handling.

The library is generated with Stainless and follows OpenAI-compatible API patterns, making it easy to integrate Groq's ultra-fast LLM inference into existing applications. It supports streaming responses, function calling, JSON mode, and various advanced features like reasoning mode, tool calling, and RAG document integration. The client automatically manages authentication via API keys and provides both synchronous and asynchronous interfaces for flexible integration patterns.

## Chat Completions - Create Standard Completion

Generate chat completions with customizable parameters including temperature, max tokens, and stop sequences.

```python
import os
from groq import Groq

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

try:
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "You are a helpful assistant."
            },
            {
                "role": "user",
                "content": "Explain the importance of low latency LLMs"
            }
        ],
        model="mixtral-8x7b-32768",
        temperature=0.5,
        max_tokens=1024,
        top_p=1,
        stop=None,
        stream=False
    )

    # Access response content
    print(chat_completion.choices[0].message.content)

    # Access usage statistics
    print(f"Tokens used: {chat_completion.usage.total_tokens}")
    print(f"Prompt tokens: {chat_completion.usage.prompt_tokens}")
    print(f"Completion tokens: {chat_completion.usage.completion_tokens}")

except Exception as e:
    print(f"Error: {e}")
```

## Chat Completions - Streaming Response

Stream chat completions in real-time for improved user experience with incremental token delivery.

```python
from groq import Groq

client = Groq()

try:
    stream = client.chat.completions.create(
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Explain the importance of low latency LLMs"}
        ],
        model="mixtral-8x7b-32768",
        temperature=0.5,
        max_tokens=1024,
        top_p=1,
        stream=True
    )

    # Process streaming chunks
    for chunk in stream:
        delta_content = chunk.choices[0].delta.content
        if delta_content:
            print(delta_content, end="")

        # Check for completion and usage stats
        if chunk.choices[0].finish_reason:
            if chunk.x_groq and chunk.x_groq.usage:
                print(f"\n\nUsage stats: {chunk.x_groq.usage}")

except Exception as e:
    print(f"Error: {e}")
```

## Chat Completions - Function Calling with Tools

Use function calling to enable LLMs to interact with external tools and APIs.

```python
from groq import Groq
import json

client = Groq()

tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get the current weather for a location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city and state, e.g. San Francisco, CA"
                    },
                    "unit": {
                        "type": "string",
                        "enum": ["celsius", "fahrenheit"]
                    }
                },
                "required": ["location"]
            }
        }
    }
]

try:
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "user", "content": "What's the weather in San Francisco?"}
        ],
        tools=tools,
        tool_choice="auto"
    )

    # Check if model wants to call a function
    message = response.choices[0].message
    if message.tool_calls:
        for tool_call in message.tool_calls:
            function_name = tool_call.function.name
            function_args = json.loads(tool_call.function.arguments)
            print(f"Function: {function_name}")
            print(f"Arguments: {function_args}")

            # Execute function and send result back
            # function_result = get_weather(**function_args)
            # Then make another API call with the function result

except Exception as e:
    print(f"Error: {e}")
```

## Chat Completions - JSON Mode

Force the model to generate valid JSON output for structured data extraction.

```python
from groq import Groq
import json

client = Groq()

try:
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": "You are a helpful assistant that outputs in JSON."
            },
            {
                "role": "user",
                "content": "Extract the name, age, and email from: John Doe is 30 years old and his email is john@example.com"
            }
        ],
        response_format={"type": "json_object"},
        temperature=0.1
    )

    # Parse JSON response
    json_response = json.loads(response.choices[0].message.content)
    print(f"Name: {json_response.get('name')}")
    print(f"Age: {json_response.get('age')}")
    print(f"Email: {json_response.get('email')}")

except json.JSONDecodeError as e:
    print(f"JSON parsing error: {e}")
except Exception as e:
    print(f"Error: {e}")
```

## Embeddings - Create Text Embeddings

Generate vector embeddings for text input for semantic search, clustering, and similarity tasks.

```python
from groq import Groq
import numpy as np

client = Groq()

try:
    # Single text embedding
    embedding_response = client.embeddings.create(
        input=["hello world"],
        model="nomic-embed-text-v1.5",
        encoding_format="float"
    )

    # Access embedding vector
    embedding_vector = embedding_response.data[0].embedding
    print(f"Embedding dimensions: {len(embedding_vector)}")
    print(f"First 5 values: {embedding_vector[:5]}")

    # Multiple text embeddings
    multi_response = client.embeddings.create(
        input=[
            "Machine learning is fascinating",
            "I love programming",
            "The weather is nice today"
        ],
        model="nomic-embed-text-v1.5"
    )

    # Calculate cosine similarity
    embeddings = [item.embedding for item in multi_response.data]
    vec1 = np.array(embeddings[0])
    vec2 = np.array(embeddings[1])
    similarity = np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))
    print(f"Similarity between first two texts: {similarity:.4f}")

    # Usage information
    print(f"Total tokens: {embedding_response.usage.total_tokens}")

except Exception as e:
    print(f"Error: {e}")
```

## Audio Transcriptions - Transcribe Audio Files

Convert audio files to text using Whisper models with language detection and timestamps.

```python
from groq import Groq
from pathlib import Path

client = Groq()

try:
    # Transcribe from file path
    with open("audio_file.mp3", "rb") as audio_file:
        transcription = client.audio.transcriptions.create(
            file=audio_file,
            model="whisper-large-v3-turbo",
            language="en",
            response_format="verbose_json",
            temperature=0.0
        )

    # Access transcription text
    print(f"Transcription: {transcription.text}")

    # Access detailed segments (if verbose_json)
    if hasattr(transcription, 'segments'):
        for segment in transcription.segments:
            print(f"[{segment['start']:.2f}s - {segment['end']:.2f}s]: {segment['text']}")

    # Alternative: Using Path object
    transcription = client.audio.transcriptions.create(
        file=Path("/path/to/audio.wav"),
        model="whisper-large-v3-turbo",
        prompt="This is a conversation about machine learning"  # Optional context
    )

except FileNotFoundError:
    print("Audio file not found")
except Exception as e:
    print(f"Error: {e}")
```

## Audio Translations - Translate Audio to English

Translate audio files from various languages to English text.

```python
from groq import Groq

client = Groq()

try:
    # Translate audio to English
    with open("spanish_audio.mp3", "rb") as audio_file:
        translation = client.audio.translations.create(
            file=audio_file,
            model="whisper-large-v3-turbo",
            response_format="text",
            temperature=0.0
        )

    # Access translation text
    print(f"Translation: {translation.text}")

    # With JSON response format for more details
    with open("french_audio.wav", "rb") as audio_file:
        translation = client.audio.translations.create(
            file=audio_file,
            model="whisper-large-v3-turbo",
            response_format="json"
        )

    print(f"Translated text: {translation.text}")
    print(f"Language detected: {translation.language}")

except Exception as e:
    print(f"Error: {e}")
```

## Models - List and Retrieve Available Models

Query available models and retrieve specific model information including capabilities and context windows.

```python
from groq import Groq

client = Groq()

try:
    # List all available models
    models = client.models.list()

    print("Available models:")
    for model in models.data:
        print(f"- {model.id}")
        print(f"  Owned by: {model.owned_by}")
        print(f"  Created: {model.created}")

    # Retrieve specific model details
    model_info = client.models.retrieve("mixtral-8x7b-32768")

    print(f"\nModel ID: {model_info.id}")
    print(f"Object type: {model_info.object}")
    print(f"Owner: {model_info.owned_by}")
    print(f"Active: {model_info.active}")
    print(f"Context window: {model_info.context_window}")

    # Filter models by capability
    chat_models = [m for m in models.data if "chat" in m.id.lower()]
    print(f"\nChat models: {[m.id for m in chat_models]}")

except Exception as e:
    print(f"Error: {e}")
```

## Batches - Create and Process Batch Requests

Submit batch processing jobs for cost-effective, asynchronous processing of large request volumes.

```python
from groq import Groq
import json
import time

client = Groq()

try:
    # Step 1: Prepare batch input file (JSONL format)
    batch_requests = [
        {
            "custom_id": "request-1",
            "method": "POST",
            "url": "/v1/chat/completions",
            "body": {
                "model": "mixtral-8x7b-32768",
                "messages": [{"role": "user", "content": "What is 2+2?"}]
            }
        },
        {
            "custom_id": "request-2",
            "method": "POST",
            "url": "/v1/chat/completions",
            "body": {
                "model": "mixtral-8x7b-32768",
                "messages": [{"role": "user", "content": "What is the capital of France?"}]
            }
        }
    ]

    # Write to JSONL file
    with open("batch_input.jsonl", "w") as f:
        for request in batch_requests:
            f.write(json.dumps(request) + "\n")

    # Step 2: Upload the file
    with open("batch_input.jsonl", "rb") as file:
        file_response = client.files.create(
            file=file,
            purpose="batch"
        )

    print(f"File uploaded: {file_response.id}")

    # Step 3: Create batch job
    batch = client.batches.create(
        input_file_id=file_response.id,
        endpoint="/v1/chat/completions",
        completion_window="24h",
        metadata={"description": "My batch job"}
    )

    print(f"Batch created: {batch.id}")
    print(f"Status: {batch.status}")

    # Step 4: Monitor batch status
    while batch.status not in ["completed", "failed", "cancelled"]:
        time.sleep(10)
        batch = client.batches.retrieve(batch.id)
        print(f"Status: {batch.status}, Progress: {batch.request_counts}")

    # Step 5: Retrieve results
    if batch.status == "completed":
        print(f"Output file ID: {batch.output_file_id}")
        output_content = client.files.content(batch.output_file_id)
        print(f"Results: {output_content.content}")

    # List all batches
    batches = client.batches.list()
    for b in batches.data:
        print(f"Batch {b.id}: {b.status}")

except Exception as e:
    print(f"Error: {e}")
```

## Files - Upload and Manage Files

Upload, list, retrieve, and delete files for use with batch processing.

```python
from groq import Groq
from pathlib import Path

client = Groq()

try:
    # Upload a file
    with open("data.jsonl", "rb") as file:
        uploaded_file = client.files.create(
            file=file,
            purpose="batch"
        )

    print(f"File ID: {uploaded_file.id}")
    print(f"Filename: {uploaded_file.filename}")
    print(f"Bytes: {uploaded_file.bytes}")
    print(f"Purpose: {uploaded_file.purpose}")
    print(f"Created at: {uploaded_file.created_at}")

    # List all files
    files = client.files.list()
    print("\nAll files:")
    for file in files.data:
        print(f"- {file.id}: {file.filename} ({file.bytes} bytes)")

    # Get file info
    file_info = client.files.info(uploaded_file.id)
    print(f"\nFile status: {file_info.status}")

    # Retrieve file content
    file_content = client.files.content(uploaded_file.id)
    print(f"Content preview: {file_content.content[:100]}")

    # Delete a file
    delete_response = client.files.delete(uploaded_file.id)
    print(f"\nFile deleted: {delete_response.deleted}")
    print(f"Deleted ID: {delete_response.id}")

except FileNotFoundError:
    print("File not found")
except Exception as e:
    print(f"Error: {e}")
```

## Error Handling - Comprehensive Exception Management

Handle various API errors with specific exception types for robust error recovery.

```python
import groq
from groq import Groq

client = Groq()

try:
    response = client.chat.completions.create(
        messages=[
            {"role": "user", "content": "Hello!"}
        ],
        model="mixtral-8x7b-32768",
        max_tokens=100
    )
    print(response.choices[0].message.content)

except groq.APIConnectionError as e:
    print(f"Connection error: The server could not be reached")
    print(f"Underlying cause: {e.__cause__}")

except groq.RateLimitError as e:
    print(f"Rate limit exceeded (429): Back off and retry")
    print(f"Status: {e.status_code}")
    print(f"Response: {e.response}")

except groq.AuthenticationError as e:
    print(f"Authentication failed (401): Check your API key")

except groq.PermissionDeniedError as e:
    print(f"Permission denied (403): Insufficient permissions")

except groq.NotFoundError as e:
    print(f"Resource not found (404)")

except groq.UnprocessableEntityError as e:
    print(f"Invalid request (422): Check your parameters")

except groq.InternalServerError as e:
    print(f"Server error (500+): Retry the request")

except groq.APIStatusError as e:
    print(f"API error: {e.status_code}")
    print(f"Response: {e.response}")

except groq.APIError as e:
    print(f"General API error: {e}")
```

## Async Client - Asynchronous API Calls

Use async/await for concurrent operations and improved performance in async applications.

```python
import asyncio
from groq import AsyncGroq

async def main():
    client = AsyncGroq()

    try:
        # Single async request
        chat_completion = await client.chat.completions.create(
            messages=[
                {"role": "user", "content": "Explain quantum computing"}
            ],
            model="llama-3.3-70b-versatile"
        )
        print(chat_completion.choices[0].message.content)

        # Multiple concurrent requests
        tasks = [
            client.chat.completions.create(
                messages=[{"role": "user", "content": f"What is {i}+{i}?"}],
                model="mixtral-8x7b-32768"
            )
            for i in range(5)
        ]

        results = await asyncio.gather(*tasks)
        for i, result in enumerate(results):
            print(f"Result {i}: {result.choices[0].message.content}")

        # Async streaming
        stream = await client.chat.completions.create(
            messages=[{"role": "user", "content": "Write a poem"}],
            model="llama-3.1-8b-instant",
            stream=True
        )

        async for chunk in stream:
            if chunk.choices[0].delta.content:
                print(chunk.choices[0].delta.content, end="")

    except Exception as e:
        print(f"Error: {e}")

asyncio.run(main())
```

## Advanced Configuration - Retries, Timeouts, and Custom HTTP

Configure client behavior with custom timeouts, retry logic, and HTTP client settings.

```python
import httpx
from groq import Groq, DefaultHttpxClient

# Configure retries and timeouts
client = Groq(
    api_key="your-api-key",
    max_retries=5,  # Retry up to 5 times on failures
    timeout=30.0,   # 30 second timeout
)

# Granular timeout control
client = Groq(
    timeout=httpx.Timeout(
        connect=5.0,   # Connection timeout
        read=10.0,     # Read timeout
        write=5.0,     # Write timeout
        pool=5.0       # Pool timeout
    )
)

# Custom HTTP client with proxy
client = Groq(
    base_url="https://custom-endpoint.example.com",
    http_client=DefaultHttpxClient(
        proxy="http://proxy.example.com:8080",
        transport=httpx.HTTPTransport(local_address="0.0.0.0")
    )
)

# Per-request timeout override
try:
    response = client.with_options(timeout=5.0).chat.completions.create(
        messages=[{"role": "user", "content": "Quick question"}],
        model="mixtral-8x7b-32768"
    )
    print(response.choices[0].message.content)

except TimeoutError:
    print("Request timed out")

# Context manager for automatic cleanup
with Groq() as client:
    response = client.chat.completions.create(
        messages=[{"role": "user", "content": "Hello"}],
        model="mixtral-8x7b-32768"
    )
    print(response.choices[0].message.content)
# HTTP client is automatically closed
```

## Raw Response Access - Headers and Metadata

Access raw HTTP response data including headers, status codes, and custom metadata.

```python
from groq import Groq

client = Groq()

# Access raw response with headers
response = client.chat.completions.with_raw_response.create(
    messages=[
        {"role": "user", "content": "Hello!"}
    ],
    model="mixtral-8x7b-32768"
)

# Access response headers
print(f"Request ID: {response.headers.get('x-request-id')}")
print(f"Rate limit remaining: {response.headers.get('x-ratelimit-remaining')}")
print(f"Content type: {response.headers.get('content-type')}")

# Parse the actual response object
completion = response.parse()
print(f"Completion ID: {completion.id}")
print(f"Content: {completion.choices[0].message.content}")

# Streaming response with raw access
with client.chat.completions.with_streaming_response.create(
    messages=[{"role": "user", "content": "Tell me a story"}],
    model="mixtral-8x7b-32768"
) as response:
    print(f"Response headers: {response.headers}")

    # Iterate over streaming lines
    for line in response.iter_lines():
        print(line)
```

## Summary

The Groq Python library serves as a comprehensive SDK for integrating ultra-fast LLM inference into Python applications, supporting standard and streaming chat completions, embeddings generation, audio transcription/translation, and batch processing operations. Primary use cases include building conversational AI agents, semantic search systems, voice-to-text applications, and high-throughput batch processing pipelines. The library's low-latency infrastructure makes it particularly suitable for real-time applications requiring sub-second response times.

Integration patterns include synchronous clients for simple scripts and APIs, asynchronous clients for concurrent operations in web servers, streaming for real-time user interfaces, function calling for agent-based systems, and batch processing for cost-effective large-scale operations. The library provides extensive error handling, automatic retries, configurable timeouts, and support for custom HTTP clients, making it production-ready for enterprise applications. All APIs follow OpenAI-compatible patterns, enabling easy migration and interoperability with existing OpenAI-based codebases.