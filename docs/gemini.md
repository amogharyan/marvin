### Initialize Gemini AI Client with Custom Version

Source: https://github.com/gbaptista/gemini-ai/blob/main/README.md

Provides examples of initializing the Gemini AI client with a custom API version, such as 'v1beta'. This is useful for accessing newer features or specific API iterations.

```ruby
client = Gemini.new(
  credentials: {
    service: 'generative-language-api',
    api_key: ENV['GOOGLE_API_KEY'],
    version: 'v1beta'
  },
  options: { model: 'gemini-pro', server_sent_events: true }
)
```

```ruby
client = Gemini.new(
  credentials: {
    service: 'vertex-ai-api',
    file_path: 'google-credentials.json',
    region: 'us-east4',
    version: 'v1beta'
  },
  options: { model: 'gemini-pro', server_sent_events: true }
)
```

```ruby
client = Gemini.new(
  credentials: {
    service: 'vertex-ai-api',
    file_contents: File.read('google-credentials.json'),
    # file_contents: ENV['GOOGLE_CREDENTIALS_FILE_CONTENTS'],
    region: 'us-east4'
  },
  options: { model: 'gemini-pro', server_sent_events: true }
)
```

```ruby
client = Gemini.new(
  credentials: {
    service: 'vertex-ai-api',
    region: 'us-east4',
    version: 'v1beta'
  },
  options: { model: 'gemini-pro', server_sent_events: true }
)
```

--------------------------------

### Gemini AI Response Structure Example (Ruby)

Source: https://github.com/gbaptista/gemini-ai/blob/main/README.md

Provides an example of the structured response received from the Gemini AI API after a content generation request. It includes candidate information, finish reasons, and usage metadata.

```Ruby
[{'candidates'=>
  [{'content'=>{
       'role'=>'model',
       'parts'=>[{'text'=>'Hello! How may I assist you?'}]
     },
     'finishReason'=>'STOP',
     'safetyRatings'=>
     [{'category'=>'HARM_CATEGORY_HARASSMENT', 'probability'=>'NEGLIGIBLE'},
      {'category'=>'HARM_CATEGORY_HATE_SPEECH', 'probability'=>'NEGLIGIBLE'},
      {'category'=>'HARM_CATEGORY_SEXUALLY_EXPLICIT', 'probability'=>'NEGLIGIBLE'},
      {'category'=>'HARM_CATEGORY_DANGEROUS_CONTENT', 'probability'=>'NEGLIGIBLE'}]}],
   'usageMetadata'=>{
     'promptTokenCount'=>2,
     'candidatesTokenCount'=>8,
     'totalTokenCount'=>10
   }
}]
```

--------------------------------

### Initialize Gemini AI Client with API Key (Ruby)

Source: https://github.com/gbaptista/gemini-ai/blob/main/README.md

Demonstrates initializing the Gemini AI client using an API key stored in an environment variable. This method is suitable for quick setups and direct API access.

```Ruby
require 'gemini-ai'

client = Gemini.new(
  credentials: {
    service: 'generative-language-api',
    api_key: ENV['GOOGLE_API_KEY']
  },
  options: { model: 'gemini-pro', server_sent_events: true }
)
```

--------------------------------

### Development and Testing Commands

Source: https://github.com/gbaptista/gemini-ai/blob/main/README.md

Common commands for developing and testing the Gemini AI Ruby Gem, including dependency installation, code linting, running tests, and executing specific task scripts.

```bash
bundle
rubocop -A

rspec

bundle exec ruby spec/tasks/run-available-models.rb
bundle exec ruby spec/tasks/run-embed.rb
bundle exec ruby spec/tasks/run-generate.rb
bundle exec ruby spec/tasks/run-json.rb
bundle exec ruby spec/tasks/run-safety.rb
bundle exec ruby spec/tasks/run-system.rb
```

--------------------------------

### Install gemini-ai gem

Source: https://github.com/gbaptista/gemini-ai/blob/main/README.md

Installs the gemini-ai gem with a specific version using the RubyGems package manager.

```sh
gem install gemini-ai -v 4.3.0
```

--------------------------------

### Install Gemini AI Ruby Gem

Source: https://github.com/gbaptista/gemini-ai/blob/main/README.md

Shows how to add the gem to your project's Gemfile. This is the first step to using the Gemini AI Ruby Gem for interacting with Google's generative AI services.

```Ruby
gem 'gemini-ai', '~> 4.3.0'
```

--------------------------------

### Install Gemini AI Ruby Gem

Source: https://github.com/gbaptista/gemini-ai/blob/main/template.md

Installs the gemini-ai gem using the RubyGems package manager. This command fetches and installs the specified version of the gem.

```shell
gem install gemini-ai -v 4.3.0
```

--------------------------------

### Initialize Gemini AI Client with Custom Version

Source: https://github.com/gbaptista/gemini-ai/blob/main/template.md

Provides examples of initializing the Gemini AI client with a custom API version, such as 'v1beta'. This is useful for accessing newer features or specific API iterations.

```ruby
client = Gemini.new(
  credentials: {
    service: 'generative-language-api',
    api_key: ENV['GOOGLE_API_KEY'],
    version: 'v1beta'
  },
  options: { model: 'gemini-pro', server_sent_events: true }
)
```

```ruby
client = Gemini.new(
  credentials: {
    service: 'vertex-ai-api',
    file_path: 'google-credentials.json',
    region: 'us-east4',
    version: 'v1beta'
  },
  options: { model: 'gemini-pro', server_sent_events: true }
)
```

```ruby
client = Gemini.new(
  credentials: {
    service: 'vertex-ai-api',
    file_contents: File.read('google-credentials.json'),
    # file_contents: ENV['GOOGLE_CREDENTIALS_FILE_CONTENTS'],
    region: 'us-east4'
  },
  options: { model: 'gemini-pro', server_sent_events: true }
)
```

```ruby
client = Gemini.new(
  credentials: {
    service: 'vertex-ai-api',
    region: 'us-east4',
    version: 'v1beta'
  },
  options: { model: 'gemini-pro', server_sent_events: true }
)
```

--------------------------------

### Example SSE Event from Gemini Stream (Ruby)

Source: https://github.com/gbaptista/gemini-ai/blob/main/README.md

Provides an example of a single Server-Sent Event (SSE) received during a streaming response from the Gemini API. It includes content, finish reason, and safety ratings.

```ruby
{ 'candidates' =>
  [{ 'content' => {
       'role' => 'model',
       'parts' => [{ 'text' => 'Hello! How may I assist you?' }]
     },
     'finishReason' => 'STOP',
     'safetyRatings' =>
     [{ 'category' => 'HARM_CATEGORY_HARASSMENT', 'probability' => 'NEGLIGIBLE' },
      { 'category' => 'HARM_CATEGORY_HATE_SPEECH', 'probability' => 'NEGLIGIBLE' },
      { 'category' => 'HARM_CATEGORY_SEXUALLY_EXPLICIT', 'probability' => 'NEGLIGIBLE' },
      { 'category' => 'HARM_CATEGORY_DANGEROUS_CONTENT', 'probability' => 'NEGLIGIBLE' }] }],
  'usageMetadata' => {
    'promptTokenCount' => 2,
    'candidatesTokenCount' => 8,
    'totalTokenCount' => 10
  } }
```

--------------------------------

### Development and Testing Commands

Source: https://github.com/gbaptista/gemini-ai/blob/main/template.md

Common commands for developing and testing the Gemini AI Ruby Gem, including dependency installation, code linting, running tests, and executing specific task scripts.

```bash
bundle
rubocop -A

rspec

bundle exec ruby spec/tasks/run-available-models.rb
bundle exec ruby spec/tasks/run-embed.rb
bundle exec ruby spec/tasks/run-generate.rb
bundle exec ruby spec/tasks/run-json.rb
bundle exec ruby spec/tasks/run-safety.rb
bundle exec ruby spec/tasks/run-system.rb
```

--------------------------------

### Initialize Gemini AI Client for Vision Model (Ruby)

Source: https://github.com/gbaptista/gemini-ai/blob/main/README.md

Configures the Gemini AI client to use the `gemini-pro-vision` model, specifying credentials and enabling server-sent events for real-time updates. This setup is necessary for multimodal inputs.

```ruby
client = Gemini.new(
  credentials: { service: 'vertex-ai-api', region: 'us-east4' },
  options: { model: 'gemini-pro-vision', server_sent_events: true }
)
```

--------------------------------

### Example SSE Event from Gemini Stream (Ruby)

Source: https://github.com/gbaptista/gemini-ai/blob/main/template.md

Provides an example of a single Server-Sent Event (SSE) received during a streaming response from the Gemini API. It includes content, finish reason, and safety ratings.

```ruby
{ 'candidates' =>
  [{ 'content' => {
       'role' => 'model',
       'parts' => [{ 'text' => 'Hello! How may I assist you?' }]
     },
     'finishReason' => 'STOP',
     'safetyRatings' =>
     [{ 'category' => 'HARM_CATEGORY_HARASSMENT', 'probability' => 'NEGLIGIBLE' },
      { 'category' => 'HARM_CATEGORY_HATE_SPEECH', 'probability' => 'NEGLIGIBLE' },
      { 'category' => 'HARM_CATEGORY_SEXUALLY_EXPLICIT', 'probability' => 'NEGLIGIBLE' },
      { 'category' => 'HARM_CATEGORY_DANGEROUS_CONTENT', 'probability' => 'NEGLIGIBLE' }] }],
  'usageMetadata' => {
    'promptTokenCount' => 2,
    'candidatesTokenCount' => 8,
    'totalTokenCount' => 10
  } }
```

--------------------------------

### Initialize Gemini AI Client for Vision Model (Ruby)

Source: https://github.com/gbaptista/gemini-ai/blob/main/template.md

Configures the Gemini AI client to use the `gemini-pro-vision` model, specifying credentials and enabling server-sent events for real-time updates. This setup is necessary for multimodal inputs.

```ruby
client = Gemini.new(
  credentials: { service: 'vertex-ai-api', region: 'us-east4' },
  options: { model: 'gemini-pro-vision', server_sent_events: true }
)
```

--------------------------------

### Configure Gemini AI with Application Default Credentials

Source: https://github.com/gbaptista/gemini-ai/blob/main/README.md

Shows how to configure the Gemini AI client using Application Default Credentials (ADC). This method omits explicit API keys or file paths, relying on the environment's default setup.

```ruby
{ 
  service: 'vertex-ai-api',
  region: 'us-east4'
}
```

--------------------------------

### Count Tokens in Ruby

Source: https://github.com/gbaptista/gemini-ai/blob/main/README.md

Illustrates how to count tokens for a given request using the Gemini AI API in Ruby. Provides examples of expected output for Generative Language and Vertex AI APIs.

```ruby
client.count_tokens(
  { contents: { role: 'user', parts: { text: 'hi!' } } }
)
```

--------------------------------

### Initialize Gemini Client for Video Processing (Ruby)

Source: https://github.com/gbaptista/gemini-ai/blob/main/README.md

Initializes the Gemini client specifically for the 'gemini-pro-vision' model, enabling Server-Sent Events for streaming responses. This setup is crucial for handling multimodal inputs like video.

```ruby
client = Gemini.new(
  credentials: { service: 'vertex-ai-api', region: 'us-east4' },
  options: { model: 'gemini-pro-vision', server_sent_events: true }
)
```

--------------------------------

### Count Tokens in Ruby

Source: https://github.com/gbaptista/gemini-ai/blob/main/template.md

Illustrates how to count tokens for a given request using the Gemini AI API in Ruby. Provides examples of expected output for Generative Language and Vertex AI APIs.

```ruby
client.count_tokens(
  { contents: { role: 'user', parts: { text: 'hi!' } } }
)
```

--------------------------------

### Gemini Video Processing Result Example (Ruby)

Source: https://github.com/gbaptista/gemini-ai/blob/main/README.md

Illustrates the structure of the response received from the Gemini API after processing video content. The output includes the model's textual description and safety ratings.

```ruby
[{"candidates"=>
   [{"content"=>
      {"role"=>"model",
       "parts"=>
        [{"text"=>
           " A white and gold cup is being filled with coffee. The coffee is dark and rich. The cup is sitting on a black surface. The background is blurred"}]}, 
     "safetyRatings"=>
      [{"category"=>"HARM_CATEGORY_HARASSMENT", "probability"=>"NEGLIGIBLE"}, 
       {"category"=>"HARM_CATEGORY_HATE_SPEECH", "probability"=>"NEGLIGIBLE"}, 
       {"category"=>"HARM_CATEGORY_SEXUALLY_EXPLICIT", "probability"=>"NEGLIGIBLE"}, 
       {"category"=>"HARM_CATEGORY_DANGEROUS_CONTENT", "probability"=>"NEGLIGIBLE"}]}],
  "usageMetadata"=>{"promptTokenCount"=>1037, "candidatesTokenCount"=>31, "totalTokenCount"=>1068}}, 
 {"candidates"=>
   [{"content"=>{"role"=>"model", "parts"=>[{"text"=>"."}]}, 
     "finishReason"=>"STOP", 
     "safetyRatings"=>
      [{"category"=>"HARM_CATEGORY_HARASSMENT", "probability"=>"NEGLIGIBLE"}, 
       {"category"=>"HARM_CATEGORY_HATE_SPEECH", "probability"=>"NEGLIGIBLE"}, 
       {"category"=>"HARM_CATEGORY_SEXUALLY_EXPLICIT", "probability"=>"NEGLIGIBLE"}, 
       {"category"=>"HARM_CATEGORY_DANGEROUS_CONTENT", "probability"=>"NEGLIGIBLE"}]}],
  "usageMetadata"=>{"promptTokenCount"=>1037, "candidatesTokenCount"=>32, "totalTokenCount"=>1069}}]
```

--------------------------------

### Generate Gemini Content (Ruby)

Source: https://github.com/gbaptista/gemini-ai/blob/main/README.md

Provides an example of generating content using the client's generate_content method. This method returns the complete response after the model has finished processing. Note that this method is currently supported by the generative-language-api service, not vertex-ai-api.

```ruby
result = client.generate_content(
  { contents: { role: 'user', parts: { text: 'hi!' } } }
)
```

--------------------------------

### Initialize Gemini Client for Video Processing (Ruby)

Source: https://github.com/gbaptista/gemini-ai/blob/main/template.md

Initializes the Gemini client specifically for the 'gemini-pro-vision' model, enabling Server-Sent Events for streaming responses. This setup is crucial for handling multimodal inputs like video.

```ruby
client = Gemini.new(
  credentials: { service: 'vertex-ai-api', region: 'us-east4' },
  options: { model: 'gemini-pro-vision', server_sent_events: true }
)
```

--------------------------------

### Stream Generate Content

Source: https://github.com/gbaptista/gemini-ai/blob/main/README.md

Example of calling the `stream_generate_content` method on a Gemini AI client. This method is used to receive content generation results as a stream of events, allowing for real-time processing of responses.

```ruby
require 'gemini-ai'

# Assuming 'client' is already initialized as shown above

response = client.stream_generate_content("What is a large language model?")

response.each do |chunk|
  print chunk.text
end
```

--------------------------------

### Gemini Video Processing Result Example (Ruby)

Source: https://github.com/gbaptista/gemini-ai/blob/main/template.md

Illustrates the structure of the response received from the Gemini API after processing video content. The output includes the model's textual description and safety ratings.

```ruby
[{"candidates"=>
   [{"content"=>
      {"role"=>"model",
       "parts"=>
        [{"text"=>
           " A white and gold cup is being filled with coffee. The coffee is dark and rich. The cup is sitting on a black surface. The background is blurred"}]}, 
     "safetyRatings"=>
      [{"category"=>"HARM_CATEGORY_HARASSMENT", "probability"=>"NEGLIGIBLE"}, 
       {"category"=>"HARM_CATEGORY_HATE_SPEECH", "probability"=>"NEGLIGIBLE"}, 
       {"category"=>"HARM_CATEGORY_SEXUALLY_EXPLICIT", "probability"=>"NEGLIGIBLE"}, 
       {"category"=>"HARM_CATEGORY_DANGEROUS_CONTENT", "probability"=>"NEGLIGIBLE"}]}],
  "usageMetadata"=>{"promptTokenCount"=>1037, "candidatesTokenCount"=>31, "totalTokenCount"=>1068}}, 
 {"candidates"=>
   [{"content"=>{"role"=>"model", "parts"=>[{"text"=>"."}]}, 
     "finishReason"=>"STOP", 
     "safetyRatings"=>
      [{"category"=>"HARM_CATEGORY_HARASSMENT", "probability"=>"NEGLIGIBLE"}, 
       {"category"=>"HARM_CATEGORY_HATE_SPEECH", "probability"=>"NEGLIGIBLE"}, 
       {"category"=>"HARM_CATEGORY_SEXUALLY_EXPLICIT", "probability"=>"NEGLIGIBLE"}, 
       {"category"=>"HARM_CATEGORY_DANGEROUS_CONTENT", "probability"=>"NEGLIGIBLE"}]}],
  "usageMetadata"=>{"promptTokenCount"=>1037, "candidatesTokenCount"=>32, "totalTokenCount"=>1069}}]
```

--------------------------------

### Configure Gemini AI with Application Default Credentials

Source: https://github.com/gbaptista/gemini-ai/blob/main/template.md

Shows how to configure the Gemini AI client using Application Default Credentials (ADC). This method omits explicit API keys or file paths, relying on the environment's default setup.

```ruby
{ 
  service: 'vertex-ai-api',
  region: 'us-east4'
}
```

--------------------------------

### Stream Generate Content

Source: https://github.com/gbaptista/gemini-ai/blob/main/template.md

Example of calling the `stream_generate_content` method on a Gemini AI client. This method is used to receive content generation results as a stream of events, allowing for real-time processing of responses.

```ruby
require 'gemini-ai'

# Assuming 'client' is already initialized as shown above

response = client.stream_generate_content("What is a large language model?")

response.each do |chunk|
  print chunk.text
end
```

--------------------------------

### Stream Generate Content

Source: https://github.com/gbaptista/gemini-ai/blob/main/template.md

Example of streaming content generation using the Gemini AI client. It sends a user prompt and receives a streamed response, including content, finish reason, safety ratings, and usage metadata.

```ruby
result = client.stream_generate_content({
  contents: { role: 'user', parts: { text: 'hi!' } }
})
```

--------------------------------

### Vertex AI Service Account Credentials JSON Structure

Source: https://github.com/gbaptista/gemini-ai/blob/main/README.md

Example JSON structure for service account credentials used for authenticating with the Vertex AI API. This file contains sensitive information like private keys and client emails, required for programmatic access.

```json
{
  "type": "service_account",
  "project_id": "YOUR_PROJECT_ID",
  "private_key_id": "a00...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "PROJECT_ID@PROJECT_ID.iam.gserviceaccount.com",
  "client_id": "000...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

--------------------------------

### Generate Gemini Content (Ruby)

Source: https://github.com/gbaptista/gemini-ai/blob/main/template.md

Provides an example of generating content using the client's generate_content method. This method returns the complete response after the model has finished processing. Note that this method is currently supported by the generative-language-api service, not vertex-ai-api.

```ruby
result = client.generate_content(
  { contents: { role: 'user', parts: { text: 'hi!' } } }
)
```

--------------------------------

### Vertex AI Service Account Credentials JSON Structure

Source: https://github.com/gbaptista/gemini-ai/blob/main/template.md

Example JSON structure for service account credentials used for authenticating with the Vertex AI API. This file contains sensitive information like private keys and client emails, required for programmatic access.

```json
{
  "type": "service_account",
  "project_id": "YOUR_PROJECT_ID",
  "private_key_id": "a00...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "PROJECT_ID@PROJECT_ID.iam.gserviceaccount.com",
  "client_id": "000...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

--------------------------------

### README Generation and Live Preview

Source: https://github.com/gbaptista/gemini-ai/blob/main/README.md

Instructions for setting up tools and executing commands to automatically generate or update the README file and preview Markdown content live.

```bash
# Install Babashka
curl -s https://raw.githubusercontent.com/babashka/babashka/master/install | sudo bash

# Update README using Babashka task
bb tasks/generate-readme.clj

# Watch for template changes and regenerate README
sudo pacman -S inotify-tools # Arch / Manjaro
sudo apt-get install inotify-tools # Debian / Ubuntu / Raspberry Pi OS
sudo dnf install inotify-tools # Fedora / CentOS / RHEL

while inotifywait -e modify template.md; do bb tasks/generate-readme.clj; done

# Install Markdown Live Preview
pip install -U markdown_live_preview

# Start Markdown Live Preview server
mlp README.md -p 8076
```

--------------------------------

### Initialize Gemini AI Client

Source: https://github.com/gbaptista/gemini-ai/blob/main/README.md

Demonstrates how to create a Gemini AI client instance in Ruby using different authentication methods. This includes API keys, service account files, file contents, and application default credentials, along with specifying the model and region.

```ruby
require 'gemini-ai'

# With an API key
client = Gemini.new(
  credentials: {
    service: 'generative-language-api',
    api_key: ENV['GOOGLE_API_KEY']
  },
  options: { model: 'gemini-pro', server_sent_events: true }
)
```

```ruby
require 'gemini-ai'

# With a Service Account Credentials File
client = Gemini.new(
  credentials: {
    service: 'vertex-ai-api',
    file_path: 'google-credentials.json',
    region: 'us-east4'
  },
  options: { model: 'gemini-pro', server_sent_events: true }
)
```

```ruby
require 'gemini-ai'

# With the Service Account Credentials File contents
client = Gemini.new(
  credentials: {
    service: 'vertex-ai-api',
    file_contents: File.read('google-credentials.json'),
    # file_contents: ENV['GOOGLE_CREDENTIALS_FILE_CONTENTS'],
    region: 'us-east4'
  },
  options: { model: 'gemini-pro', server_sent_events: true }
)
```

```ruby
require 'gemini-ai'

# With Application Default Credentials
client = Gemini.new(
  credentials: {
    service: 'vertex-ai-api',
    region: 'us-east4'
  },
  options: { model: 'gemini-pro', server_sent_events: true }
)
```

--------------------------------

### Publishing to RubyGems

Source: https://github.com/gbaptista/gemini-ai/blob/main/README.md

Steps required to build, sign in, and push the Gemini AI Ruby Gem to the RubyGems repository.

```bash
gem build gemini-ai.gemspec

gem signin

gem push gemini-ai-4.3.0.gem
```

--------------------------------

### Configure Gemini AI with API Key

Source: https://github.com/gbaptista/gemini-ai/blob/main/README.md

Demonstrates how to configure the Gemini AI client using an API key. It shows both direct key usage and best practices with environment variables for security.

```ruby
{ 
  service: 'generative-language-api',
  api_key: 'GOOGLE_API_KEY'
}
```

```ruby
{ 
  service: 'generative-language-api',
  api_key: ENV['GOOGLE_API_KEY']
}
```

--------------------------------

### Initialize Gemini AI Client with Service Account File Contents (Ruby)

Source: https://github.com/gbaptista/gemini-ai/blob/main/README.md

Shows how to initialize the Gemini AI client by providing the service account credentials directly as file contents. This offers flexibility when credentials are not stored in a physical file.

```Ruby
require 'gemini-ai'

client = Gemini.new(
  credentials: {
    service: 'vertex-ai-api',
    file_contents: File.read('google-credentials.json'),
    # file_contents: ENV['GOOGLE_CREDENTIALS_FILE_CONTENTS'],
    region: 'us-east4'
  },
  options: { model: 'gemini-pro', server_sent_events: true }
)
```

--------------------------------

### README Generation and Live Preview

Source: https://github.com/gbaptista/gemini-ai/blob/main/template.md

Instructions for setting up tools and executing commands to automatically generate or update the README file and preview Markdown content live.

```bash
# Install Babashka
curl -s https://raw.githubusercontent.com/babashka/babashka/master/install | sudo bash

# Update README using Babashka task
bb tasks/generate-readme.clj

# Watch for template changes and regenerate README
sudo pacman -S inotify-tools # Arch / Manjaro
sudo apt-get install inotify-tools # Debian / Ubuntu / Raspberry Pi OS
sudo dnf install inotify-tools # Fedora / CentOS / RHEL

while inotifywait -e modify template.md; do bb tasks/generate-readme.clj; done

# Install Markdown Live Preview
pip install -U markdown_live_preview

# Start Markdown Live Preview server
mlp README.md -p 8076
```

--------------------------------

### Initialize Gemini AI Client with Application Default Credentials (Ruby)

Source: https://github.com/gbaptista/gemini-ai/blob/main/README.md

Demonstrates initializing the Gemini AI client using Application Default Credentials (ADC). This method automatically finds credentials in the environment, simplifying authentication in various deployment scenarios.

```Ruby
require 'gemini-ai'

client = Gemini.new(
  credentials: {
    service: 'vertex-ai-api',
    region: 'us-east4'
  },
  options: { model: 'gemini-pro', server_sent_events: true }
)
```

--------------------------------

### Initialize Gemini AI Client with Service Account File (Ruby)

Source: https://github.com/gbaptista/gemini-ai/blob/main/README.md

Illustrates initializing the Gemini AI client using a service account credentials file path. This is a common method for authenticating with Google Cloud services.

```Ruby
require 'gemini-ai'

client = Gemini.new(
  credentials: {
    service: 'vertex-ai-api',
    file_path: 'google-credentials.json',
    region: 'us-east4'
  },
  options: { model: 'gemini-pro', server_sent_events: true }
)
```

--------------------------------

### Initialize Gemini AI Client with Global Endpoint

Source: https://github.com/gbaptista/gemini-ai/blob/main/README.md

Demonstrates how to initialize the Gemini AI client using the global endpoint, which can be beneficial for certain deployment scenarios or when region-specific routing is not required.

```ruby
Gemini.new(credentials: { region: 'global' })
```

--------------------------------

### Publishing to RubyGems

Source: https://github.com/gbaptista/gemini-ai/blob/main/template.md

Steps required to build, sign in, and push the Gemini AI Ruby Gem to the RubyGems repository.

```bash
gem build gemini-ai.gemspec

gem signin

gem push gemini-ai-4.3.0.gem
```

--------------------------------

### Initialize Gemini AI Client

Source: https://github.com/gbaptista/gemini-ai/blob/main/template.md

Demonstrates how to create a Gemini AI client instance in Ruby using different authentication methods. This includes API keys, service account files, file contents, and application default credentials, along with specifying the model and region.

```ruby
require 'gemini-ai'

# With an API key
client = Gemini.new(
  credentials: {
    service: 'generative-language-api',
    api_key: ENV['GOOGLE_API_KEY']
  },
  options: { model: 'gemini-pro', server_sent_events: true }
)
```

```ruby
require 'gemini-ai'

# With a Service Account Credentials File
client = Gemini.new(
  credentials: {
    service: 'vertex-ai-api',
    file_path: 'google-credentials.json',
    region: 'us-east4'
  },
  options: { model: 'gemini-pro', server_sent_events: true }
)
```

```ruby
require 'gemini-ai'

# With the Service Account Credentials File contents
client = Gemini.new(
  credentials: {
    service: 'vertex-ai-api',
    file_contents: File.read('google-credentials.json'),
    # file_contents: ENV['GOOGLE_CREDENTIALS_FILE_CONTENTS'],
    region: 'us-east4'
  },
  options: { model: 'gemini-pro', server_sent_events: true }
)
```

```ruby
require 'gemini-ai'

# With Application Default Credentials
client = Gemini.new(
  credentials: {
    service: 'vertex-ai-api',
    region: 'us-east4'
  },
  options: { model: 'gemini-pro', server_sent_events: true }
)
```

--------------------------------

### Configure Gemini AI with API Key

Source: https://github.com/gbaptista/gemini-ai/blob/main/template.md

Demonstrates how to configure the Gemini AI client using an API key. It shows both direct key usage and best practices with environment variables for security.

```ruby
{ 
  service: 'generative-language-api',
  api_key: 'GOOGLE_API_KEY'
}
```

```ruby
{ 
  service: 'generative-language-api',
  api_key: ENV['GOOGLE_API_KEY']
}
```

--------------------------------

### Stream Text Content Generation with Gemini AI (Ruby)

Source: https://github.com/gbaptista/gemini-ai/blob/main/README.md

Demonstrates how to stream content generation using the Gemini AI client with a simple text prompt. It shows the basic structure for sending a user message and receiving a streamed response.

```ruby
result = client.stream_generate_content({
  contents: { role: 'user', parts: { text: 'hi!' } }
})
```

--------------------------------

### Connection Configuration: Adapter and Timeout Options

Source: https://github.com/gbaptista/gemini-ai/blob/main/README.md

Shows how to configure the gem's connection settings, specifically changing the Faraday adapter and setting request timeouts. This allows for customization of network behavior.

```ruby
require 'faraday/net_http'

client = Gemini.new(
  credentials: { service: 'vertex-ai-api', region: 'us-east4' },
  options: {
    model: 'gemini-pro',
    connection: { adapter: :net_http }
  }
)
```

```ruby
client = Gemini.new(
  credentials: { service: 'vertex-ai-api', region: 'us-east4' },
  options: {
    model: 'gemini-pro',
    connection: { request: { timeout: 5 } }
  }
)
```

```ruby
client = Gemini.new(
  credentials: { service: 'vertex-ai-api', region: 'us-east4' },
  options: {
    model: 'gemini-pro',
    connection: {
      request: {
        timeout: 5,
        open_timeout: 5,
        read_timeout: 5,
        write_timeout: 5
      }
    }
  }
)
```

--------------------------------

### Initialize Gemini AI Client

Source: https://github.com/gbaptista/gemini-ai/blob/main/template.md

Demonstrates various ways to initialize the Gemini AI client in Ruby. It covers authentication using API keys, service account files, file contents, and application default credentials, along with specifying the model and server-sent events option.

```ruby
require 'gemini-ai'

# With an API key
client = Gemini.new(
  credentials: {
    service: 'generative-language-api',
    api_key: ENV['GOOGLE_API_KEY']
  },
  options: { model: 'gemini-pro', server_sent_events: true }
)

# With a Service Account Credentials File
client = Gemini.new(
  credentials: {
    service: 'vertex-ai-api',
    file_path: 'google-credentials.json',
    region: 'us-east4'
  },
  options: { model: 'gemini-pro', server_sent_events: true }
)

# With the Service Account Credentials File contents
client = Gemini.new(
  credentials: {
    service: 'vertex-ai-api',
    file_contents: File.read('google-credentials.json'),
    # file_contents: ENV['GOOGLE_CREDENTIALS_FILE_CONTENTS'],
    region: 'us-east4'
  },
  options: { model: 'gemini-pro', server_sent_events: true }
)

# With Application Default Credentials
client = Gemini.new(
  credentials: {
    service: 'vertex-ai-api',
    region: 'us-east4'
  },
  options: { model: 'gemini-pro', server_sent_events: true }
)
```

--------------------------------

### Set System Instructions in Ruby

Source: https://github.com/gbaptista/gemini-ai/blob/main/README.md

Shows how to provide system instructions to Gemini AI models in Ruby to influence their behavior and persona. Supports single or multiple instruction parts.

```ruby
client.stream_generate_content(
  { contents: { role: 'user', parts: { text: 'Hi! Who are you?' } },
    system_instruction: { role: 'user', parts: { text: 'Your name is Neko.' } } }
)
```

```ruby
client.stream_generate_content(
  { contents: { role: 'user', parts: { text: 'Hi! Who are you?' } },
    system_instruction: {
      role: 'user', parts: [
        { text: 'You are a cat.' },
        { text: 'Your name is Neko.' }
      ]
    } }
)
```

--------------------------------

### Initialize Application Default Credentials

Source: https://github.com/gbaptista/gemini-ai/blob/main/README.md

Command to log in and set up Application Default Credentials (ADC) for local development. This allows applications to automatically discover credentials without needing a service account JSON file.

```sh
gcloud auth application-default login
```

--------------------------------

### Configure Gemini AI with Service Account File

Source: https://github.com/gbaptista/gemini-ai/blob/main/README.md

Illustrates configuring the Gemini AI client with a service account JSON file. It covers specifying the file path or directly providing file contents, including using environment variables for credentials.

```ruby
{ 
  service: 'vertex-ai-api',
  file_path: 'google-credentials.json',
  region: 'us-east4'
}
```

```ruby
{ 
  service: 'vertex-ai-api',
  file_contents: File.read('google-credentials.json'),
  region: 'us-east4'
}
```

```ruby
{ 
  service: 'vertex-ai-api',
  file_contents: ENV['GOOGLE_CREDENTIALS_FILE_CONTENTS'],
  region: 'us-east4'
}
```

--------------------------------

### Stream Gemini AI Content Generation (Ruby)

Source: https://github.com/gbaptista/gemini-ai/blob/main/README.md

Illustrates how to stream content generation from the Gemini AI model. It sends a user prompt and receives a streamed response, allowing for real-time display of generated text.

```Ruby
result = client.stream_generate_content({
  contents: { role: 'user', parts: { text: 'hi!' } }
})
```

--------------------------------

### Initialize Gemini AI Client with Global Endpoint

Source: https://github.com/gbaptista/gemini-ai/blob/main/template.md

Demonstrates how to initialize the Gemini AI client using the global endpoint, which can be beneficial for certain deployment scenarios or when region-specific routing is not required.

```ruby
Gemini.new(credentials: { region: 'global' })
```

--------------------------------

### Direct API Request: Stream Generate Content

Source: https://github.com/gbaptista/gemini-ai/blob/main/README.md

Demonstrates how to make direct API requests using the `client.request` method for streaming content generation. Covers both Generative Language API and Vertex AI API endpoints.

```ruby
# Generative Language API
result = client.request(
  'models/gemini-pro:streamGenerateContent',
  { contents: { role: 'user', parts: { text: 'hi!' } } },
  request_method: 'POST',
  server_sent_events: true
)
```

```ruby
# Vertex AI API
result = client.request(
  'publishers/google/models/gemini-pro:streamGenerateContent',
  { contents: { role: 'user', parts: { text: 'hi!' } } },
  request_method: 'POST',
  server_sent_events: true
)
```

--------------------------------

### Request JSON Responses in Ruby

Source: https://github.com/gbaptista/gemini-ai/blob/main/README.md

Demonstrates how to request responses in JSON format from the Gemini AI API using Ruby. Includes code for making the request and parsing the JSON output.

```ruby
require 'json'

result = client.stream_generate_content(
  {
    contents: {
      role: 'user',
      parts: {
        text: 'List 3 random colors.'
      }
    },
    generation_config: {
      response_mime_type: 'application/json'
    }

  }
)

json_string = result
              .map { |response| response.dig('candidates', 0, 'content', 'parts') }
              .map { |parts| parts.map { |part| part['text'] }.join }
              .join

puts JSON.parse(json_string).inspect
```

--------------------------------

### Initialize Application Default Credentials

Source: https://github.com/gbaptista/gemini-ai/blob/main/template.md

Command to log in and set up Application Default Credentials (ADC) for local development. This allows applications to automatically discover credentials without needing a service account JSON file.

```sh
gcloud auth application-default login
```

--------------------------------

### Configure Gemini AI with Service Account File

Source: https://github.com/gbaptista/gemini-ai/blob/main/template.md

Illustrates configuring the Gemini AI client with a service account JSON file. It covers specifying the file path or directly providing file contents, including using environment variables for credentials.

```ruby
{ 
  service: 'vertex-ai-api',
  file_path: 'google-credentials.json',
  region: 'us-east4'
}
```

```ruby
{ 
  service: 'vertex-ai-api',
  file_contents: File.read('google-credentials.json'),
  region: 'us-east4'
}
```

```ruby
{ 
  service: 'vertex-ai-api',
  file_contents: ENV['GOOGLE_CREDENTIALS_FILE_CONTENTS'],
  region: 'us-east4'
}
```

--------------------------------

### Stream Text Content Generation with Gemini AI (Ruby)

Source: https://github.com/gbaptista/gemini-ai/blob/main/template.md

Demonstrates how to stream content generation using the Gemini AI client with a simple text prompt. It shows the basic structure for sending a user message and receiving a streamed response.

```ruby
result = client.stream_generate_content({
  contents: { role: 'user', parts: { text: 'hi!' } }
})
```

--------------------------------

### Connection Configuration: Adapter and Timeout Options

Source: https://github.com/gbaptista/gemini-ai/blob/main/template.md

Shows how to configure the gem's connection settings, specifically changing the Faraday adapter and setting request timeouts. This allows for customization of network behavior.

```ruby
require 'faraday/net_http'

client = Gemini.new(
  credentials: { service: 'vertex-ai-api', region: 'us-east4' },
  options: {
    model: 'gemini-pro',
    connection: { adapter: :net_http }
  }
)
```

```ruby
client = Gemini.new(
  credentials: { service: 'vertex-ai-api', region: 'us-east4' },
  options: {
    model: 'gemini-pro',
    connection: { request: { timeout: 5 } }
  }
)
```

```ruby
client = Gemini.new(
  credentials: { service: 'vertex-ai-api', region: 'us-east4' },
  options: {
    model: 'gemini-pro',
    connection: {
      request: {
        timeout: 5,
        open_timeout: 5,
        read_timeout: 5,
        write_timeout: 5
      }
    }
  }
)
```

--------------------------------

### Set System Instructions in Ruby

Source: https://github.com/gbaptista/gemini-ai/blob/main/template.md

Shows how to provide system instructions to Gemini AI models in Ruby to influence their behavior and persona. Supports single or multiple instruction parts.

```ruby
client.stream_generate_content(
  { contents: { role: 'user', parts: { text: 'Hi! Who are you?' } },
    system_instruction: { role: 'user', parts: { text: 'Your name is Neko.' } } }
)
```

```ruby
client.stream_generate_content(
  { contents: { role: 'user', parts: { text: 'Hi! Who are you?' } },
    system_instruction: {
      role: 'user', parts: [
        { text: 'You are a cat.' },
        { text: 'Your name is Neko.' }
      ]
    } }
)
```

--------------------------------

### Gemini SSE vs. Generate Content Behavior (APIDOC)

Source: https://github.com/gbaptista/gemini-ai/blob/main/README.md

Explains the difference in behavior between streaming methods (like `stream_generate_content`) and non-streaming methods (like `generate_content`) when Server-Sent Events (SSE) is enabled. Non-streaming methods, even with SSE, deliver the full response in a single event.

```APIDOC
API Behavior Explanation:

Server-Sent Events (SSE) vs. generate_content:

- SSE enables the underlying transport mechanism for streaming.
- Streaming methods (e.g., `stream_generate_content`) utilize SSE to deliver partial results as they become available, often through multiple events.
- Non-streaming methods (e.g., `generate_content`), even when SSE is enabled on the client or request, will still return the complete response in a single event because the method itself is not designed for incremental output.
- This distinction is important for managing expectations regarding how data is received when using different Gemini API methods.
```