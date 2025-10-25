### Getting Started with Chroma

Source: https://github.com/chroma-core/chroma/blob/main/docs/docs.trychroma.com/public/llms.txt

Guide to installing Chroma, creating clients, managing collections, adding documents, querying, and exploring results. Includes examples for Python and TypeScript.

```python
import chromadb

# Create a client
client = chromadb.Client()

# Create a collection
collection = client.create_collection("my_documents")

# Add documents
collection.add(
    documents=["This is document 1", "This is document 2"],
    ids=["doc1", "doc2"]
)

# Query documents
results = collection.query(
    query_texts=["This is a query"],
    n_results=2
)

print(results)
```

```typescript
import chromadb from "chromadb";

// Create a client
const client = new chromadb.Client();

// Create a collection
const collection = await client.createCollection({ name: "my_documents" });

// Add documents
await collection.add({
    documents: ["This is document 1", "This is document 2"],
    ids: ["doc1", "doc2"]
});

// Query documents
const results = await collection.query({
    queryTexts: ["This is a query"],
    nResults: 2
});

console.log(results);
```

--------------------------------

### Install Chroma using pip, poetry, or uv

Source: https://github.com/chroma-core/chroma/blob/main/docs/docs.trychroma.com/markdoc/content/docs/overview/getting-started.md

Instructions for installing the Chroma Python package using different package managers: pip, poetry, and uv. Ensures the necessary Chroma library is available for Python projects.

```terminal
pip install chromadb
```

```terminal
poetry add chromadb
```

```terminal
uv pip install chromadb
```

--------------------------------

### Install Chroma Client

Source: https://github.com/chroma-core/chroma/blob/main/docs/docs.trychroma.com/public/llms-docs-overview-getting-started.txt

Installs the ChromaDB client library using different package managers. Ensure you have the appropriate package manager installed for your environment.

```terminal
pip install chromadb
```

```terminal
poetry add chromadb
```

```terminal
uv pip install chromadb
```

```terminal
npm install chromadb @chroma-core/default-embed
```

```terminal
pnpm add chromadb @chroma-core/default-embed
```

```terminal
yarn add chromadb @chroma-core/default-embed
```

```terminal
bun add chromadb @chroma-core/default-embed
```

--------------------------------

### Perform Query Example (Python)

Source: https://github.com/chroma-core/chroma/blob/main/docs/docs.trychroma.com/markdoc/content/docs/overview/getting-started.md

Demonstrates how to set up a Chroma collection, upsert documents, and perform a query using the Python client. It initializes an in-memory client and prints the query results.

```python
import chromadb
chroma_client = chromadb.Client()

# switch `create_collection` to `get_or_create_collection` to avoid creating a new collection every time
collection = chroma_client.get_or_create_collection(name="my_collection")

# switch `add` to `upsert` to avoid adding the same documents every time
collection.upsert(
    documents=[
        "This is a document about pineapple",
        "This is a document about oranges"
    ],
    ids=["id1", "id2"]
)

results = collection.query(
    query_texts=["This is a query document about florida"], # Chroma will embed this for you
    n_results=2 # how many results to return
)

print(results)
```

--------------------------------

### Perform Query Example (TypeScript)

Source: https://github.com/chroma-core/chroma/blob/main/docs/docs.trychroma.com/markdoc/content/docs/overview/getting-started.md

Demonstrates how to set up a Chroma collection, upsert documents, and perform a query using the TypeScript client. It initializes an in-memory client and logs the query results.

```typescript
import { ChromaClient } from "chromadb";
const client = new ChromaClient();

// switch `createCollection` to `getOrCreateCollection` to avoid creating a new collection every time
const collection = await client.getOrCreateCollection({
  name: "my_collection",
});

// switch `addRecords` to `upsertRecords` to avoid adding the same documents every time
await collection.upsert({
  documents: [
    "This is a document about pineapple",
    "This is a document about oranges",
  ],
  ids: ["id1", "id2"],
});

const results = await client.query({
  queryTexts: ["This is a query document about florida"], // Chroma will embed this for you
  nResults: 2, // how many results to return
});

console.log(results)
```

--------------------------------

### Setup Local Postgres with brew

Source: https://github.com/chroma-core/chroma/blob/main/go/README.md

Commands to install, start, and stop PostgreSQL version 14 using Homebrew on macOS. This includes creating a dedicated 'chroma' user and database with superuser privileges for testing.

```bash
brew install postgresql@14
brew services start postgresql
brew services stop postgresql
psql postgres
create role chroma with login password 'chroma';
alter role chroma with superuser;
create database chroma;
```

--------------------------------

### Create a Chroma Client in Python

Source: https://github.com/chroma-core/chroma/blob/main/docs/docs.trychroma.com/markdoc/content/docs/overview/getting-started.md

Demonstrates how to instantiate a Chroma client in Python. This client is used to interact with the Chroma database for all subsequent operations.

```python
import chromadb
chroma_client = chromadb.Client()
```

--------------------------------

### Install and Run Chroma JS Examples (Browser/Node)

Source: https://github.com/chroma-core/chroma/blob/main/clients/new-js/DEVELOP.md

Commands to install dependencies, build the Chroma JS library, navigate to example directories, install example dependencies, and run the examples for browser and Node.js environments.

```bash
pnpm install
pnpm build
cd examples/browser
pnpm install
pnpm dev
```

```bash
pnpm install
pnpm build
cd examples/node
pnpm install
pnpm dev
```

--------------------------------

### Install Dependencies and Run Chatbot Demo

Source: https://github.com/chroma-core/chroma/blob/main/examples/gemini/README.md

This snippet shows the bash commands required to set up the project and run the chatbot demo. It includes installing Python dependencies, loading example data into Chroma, and starting the main application. Ensure you have an Google API key configured.

```bash
# Install dependencies
pip install -r requirements.txt

# Load the example documents into Chroma
python load_data.py

# Run the chatbot
python main.py
```

--------------------------------

### Initialize ChromaDB Client and Interact with Collections (TypeScript)

Source: https://github.com/chroma-core/chroma/blob/main/docs/docs.trychroma.com/public/llms-docs-overview-getting-started.txt

Demonstrates initializing a ChromaDB client, getting or creating a collection, upserting documents with their IDs, and querying the collection for similar documents. This example uses an ephemeral client, meaning data is not persistent.

```typescript
import { ChromaClient } from "chromadb";
const client = new ChromaClient();

// switch `createCollection` to `getOrCreateCollection` to avoid creating a new collection every time
const collection = await client.getOrCreateCollection({
    name: "my_collection",
});

// switch `addRecords` to `upsertRecords` to avoid adding the same documents every time
await collection.upsert({
    documents: [
        "This is a document about pineapple",
        "This is a document about oranges",
    ],
    ids: ["id1", "id2"],
});

const results = await collection.query({
    queryTexts: "This is a query document about florida", // Chroma will embed this for you
    nResults: 2, // how many results to return
});

console.log(results);
```

--------------------------------

### Build Chroma Project with Protobuf

Source: https://github.com/chroma-core/chroma/blob/main/go/README.md

Instructions for building the Chroma project, emphasizing the need for correct Protobuf compiler (`protoc`) and Go plugins (`protoc-gen-go`, `protoc-gen-go-grpc`). It also outlines the process of downloading `protoc` and installing the Go plugins.

```bash
make build
```

--------------------------------

### Install Dependencies

Source: https://github.com/chroma-core/chroma/blob/main/examples/xai/README.md

Installs the necessary Python packages required for the xAI and Chroma example. This is a standard step before running Python scripts.

```bash
# Install dependencies
pip install -r requirements.txt
```

--------------------------------

### Run Chroma Backend and Create Client in TypeScript

Source: https://github.com/chroma-core/chroma/blob/main/docs/docs.trychroma.com/markdoc/content/docs/overview/getting-started.md

Instructions for running the Chroma backend using the CLI or Docker, and then creating a Chroma client in TypeScript. This covers both ESM and CJS module formats for client instantiation.

```terminal
chroma run --path ./getting-started
```

```terminal
docker pull chromadb/chroma
docker run -p 8000:8000 chromadb/chroma
```

```typescript
import { ChromaClient } from "chromadb";
const client = new ChromaClient();
```

```typescript
const { ChromaClient } = require("chromadb");
const client = new ChromaClient();
```

--------------------------------

### Django Management Script Setup

Source: https://github.com/chroma-core/chroma/blob/main/examples/advanced/forking.ipynb

This Python snippet is part of Django's manage.py script. It handles the initial setup and import of Django's core management functions, including error handling for cases where Django might not be installed or configured correctly.

```python
import os
import sys
from django.core.management import execute_from_command_line

try:
    from django.core.management import execute_from_command_line
except ImportError as exc:
    raise ImportError(
        "Couldn't import Django. Are you sure it's installed and "
        "available on your PYTHONPATH environment variable? Did you "
        "forget to activate a virtual environment?"
    ) from exc
```

--------------------------------

### Query a Chroma Collection for Similar Documents (Python & TypeScript)

Source: https://github.com/chroma-core/chroma/blob/main/docs/docs.trychroma.com/markdoc/content/docs/overview/getting-started.md

Provides examples of how to query a Chroma collection to find documents similar to given query texts. Chroma embeds the query text and returns the top 'n' most similar results. Both Python and TypeScript examples are included.

```python
results = collection.query(
    query_texts=["This is a query document about hawaii"], # Chroma will embed this for you
    n_results=2 # how many results to return
)
print(results)
```

```typescript
const results = await collection.query({
  queryTexts: "This is a query document about hawaii", // Chroma will embed this for you
  nResults: 2, // how many results to return
});

console.log(results);
```

--------------------------------

### Chroma Server CLI Installation and Start

Source: https://github.com/chroma-core/chroma/blob/main/docs/docs.trychroma.com/markdoc/content/docs/run-chroma/persistent-client.md

Provides instructions for installing Chroma via pip and starting a local server with data persistence using the 'chroma run' command, specifying a storage path.

```terminal
pip install chromadb
chroma run --path ./getting-started
```

--------------------------------

### Setup Virtual Environment and Install Dependencies (Bash)

Source: https://github.com/chroma-core/chroma/blob/main/DEVELOP.md

Sets up a Python virtual environment and installs project and development dependencies using pip. It also installs pre-commit hooks.

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install -r requirements_dev.txt
pre-commit install
```

--------------------------------

### Create Chroma Client

Source: https://github.com/chroma-core/chroma/blob/main/docs/docs.trychroma.com/public/llms-docs-overview-getting-started.txt

Demonstrates how to create a ChromaDB client instance. For Python, it's a direct instantiation. For TypeScript, it requires running the Chroma backend first, either via the CLI or Docker, then instantiating the client.

```python
import chromadb
chroma_client = chromadb.Client()
```

```typescript
import { ChromaClient } from "chromadb";
const client = new ChromaClient();
```

```typescript
const { ChromaClient } = require("chromadb");
const client = new ChromaClient();
```

```terminal
chroma run --path ./getting-started
```

```terminal
docker pull chromadb/chroma
docker run -p 8000:8000 chromadb/chroma
```

--------------------------------

### Install VoltAgent App with Chroma Example

Source: https://github.com/chroma-core/chroma/blob/main/docs/docs.trychroma.com/public/llms-integrations-frameworks-voltagent.txt

Command to create a new VoltAgent project pre-configured with Chroma integration. This command sets up the project structure and includes sample data and agent configurations.

```bash
npm create voltagent-app@latest -- --example with-chroma

```

```bash
yarn create voltagent-app --example=with-chroma

```

```bash
pnpm create voltagent-app --example=with-chroma

```

--------------------------------

### Install and Run Chroma-Migrate CLI

Source: https://github.com/chroma-core/chroma/blob/main/docs/docs.trychroma.com/public/llms-docs-overview-migration.txt

This snippet provides the terminal commands to install the `chroma-migrate` package using pip and then execute the migration tool. This utility is used to migrate data from older ChromaDB configurations to the new `sqlite` based metadata storage.

```bash
pip install chroma-migrate
chroma-migrate
```

--------------------------------

### Configure Ollama for Chroma MCP Server

Source: https://github.com/chroma-core/chroma/blob/main/docs/docs.trychroma.com/markdoc/content/cloud/package-search/mcp.md

This configuration involves installing the 'ollmcp' package, creating a JSON configuration file with Chroma Cloud API key details, and then starting an Ollama MCP session.

```bash
Install the `ollmcp` package:
{% PythonInstallation packages="ollmcp" / %}
```

```json
Create an `mcp_config.json` file with the following content and your Chroma Cloud API key:
{
	"mcpServers": {
		"code-packages": {
			"type": "streamable_http",
			"url": "https://mcp.trychroma.com/package-search/v1",
			"headers": {
				"x-chroma-token": "<YOUR_CHROMA_API_KEY>"
			},
			"disabled": false
		}
	}
}
```

```bash
Start an Ollama MCP session with the path to your `mcp_config.json` file and model of choice:
ollmcp --servers-json <path/to/mcp_config.json> --model <model>
```

--------------------------------

### Create a Collection in Chroma (Python & TypeScript)

Source: https://github.com/chroma-core/chroma/blob/main/docs/docs.trychroma.com/markdoc/content/docs/overview/getting-started.md

Shows how to create a new collection within Chroma using both Python and TypeScript. Collections are used to store and organize embeddings and their associated metadata.

```python
collection = chroma_client.create_collection(name="my_collection")
```

```typescript
const collection = await client.createCollection({
  name: "my_collection",
});
```

--------------------------------

### Install ChromaDB and Dependencies with Python

Source: https://github.com/chroma-core/chroma/blob/main/examples/advanced/forking.ipynb

Installs necessary Python packages for ChromaDB, tree-sitter, and related utilities. Ensures all required libraries are available for the subsequent operations. Dependencies include chromadb, tree-sitter, numpy, and tree-sitter-language-pack.

```python
! pip install chromadb --quiet
! pip install tree-sitter --quiet
! pip install numpy --quiet
! pip install tree-sitter-language-pack --quiet
from tree_sitter import Language, Parser, Tree
from tree_sitter_language_pack import get_language, get_parser
import requests
import base64
import os
import getpass
from tqdm import tqdm
import chromadb
from chromadb.utils.embedding_functions import JinaEmbeddingFunction
from chromadb.utils.results import query_result_to_dfs
from chromadb.api.models.Collection import Collection
from chromadb.api import ClientAPI
```

--------------------------------

### Install Chroma with UV

Source: https://github.com/chroma-core/chroma/blob/main/docs/docs.trychroma.com/public/llms-guides-build-intro-to-retrieval.txt

Installs the ChromaDB client library using uv, a fast Python package installer and virtual environment manager.

```terminal
uv pip install chromadb
```

--------------------------------

### Add Documents to Collection

Source: https://github.com/chroma-core/chroma/blob/main/docs/docs.trychroma.com/public/llms-docs-overview-getting-started.txt

Adds text documents to a ChromaDB collection. Chroma automatically handles embedding and indexing. Unique string IDs are required for each document.

```python
collection.add(
    ids=["id1", "id2"],
    documents=[
        "This is a document about pineapple",
        "This is a document about oranges"
    ]
)
```

```typescript
await collection.add({
    ids: ["id1", "id2"],
    documents: [
        "This is a document about pineapple",
        "This is a document about oranges",
    ]
});
```

--------------------------------

### Metadata Filtering Example (Python)

Source: https://github.com/chroma-core/chroma/blob/main/docs/docs.trychroma.com/public/llms-docs-overview-migration.txt

Demonstrates the correct way to call the `get` method on a Chroma collection, specifically regarding metadata and ID filtering. It shows the deprecated practice of sending empty dictionaries for `where` clauses and the current supported method.

```python
collection.get(ids=["id1", "id2", "id3", ...])
```

--------------------------------

### Install ChromaDB and Supervision

Source: https://github.com/chroma-core/chroma/blob/main/examples/use_with/roboflow/embeddings.ipynb

Installs the ChromaDB Python client and the supervision library, which are required for creating a vector database and processing images, respectively. These are installed quietly using pip.

```python
!pip install chromadb supervision -q
```

--------------------------------

### Install Dependencies for Chroma Multimodal Retrieval (Python)

Source: https://github.com/chroma-core/chroma/blob/main/examples/multimodal/multimodal_retrieval.ipynb

Installs the necessary Python libraries for Chroma's multimodal capabilities, including datasets, chromadb, and open-clip-torch. This is a prerequisite for running the subsequent code examples.

```python
!pip install datasets chromadb open-clip-torch
```

--------------------------------

### Start Chroma Server with SSL Enabled

Source: https://github.com/chroma-core/chroma/blob/main/docs/cip/assets/CIP-01022024-test_self_signed.ipynb

This command starts the Chroma server using Uvicorn, enabling SSL/TLS communication with the generated certificate and key. It configures the server to listen on all interfaces and a specific port, includes proxy headers, and specifies a logging configuration file. The `--ssl-keyfile` and `--ssl-certfile` arguments are crucial for enabling SSL.

```bash
uvicorn chromadb.app:app --workers 1 --host 0.0.0.0 --port 8443 \
  --proxy-headers --log-config chromadb/log_config.yml --ssl-keyfile ./serverkey.pem --ssl-certfile ./servercert.pem
```

--------------------------------

### Chroma CLI Sample Apps

Source: https://github.com/chroma-core/chroma/blob/main/docs/docs.trychroma.com/public/llms.txt

Describes how to install and set up sample AI applications provided by Chroma using the CLI, including listing available sample applications.

```bash
# List available sample apps
chroma sample-apps list

# Install a sample app
chroma sample-apps install <app_name>
```

--------------------------------

### Launch Local Chroma Server

Source: https://github.com/chroma-core/chroma/blob/main/docs/docs.trychroma.com/public/llms-integrations-frameworks-voltagent.txt

Command to start a local Chroma server instance, which is required for the VoltAgent application to interact with the vector database. This command simplifies server setup without needing Docker or Python.

```bash
npm run chroma run

```

--------------------------------

### Python: Search Code Packages with Chroma MCP

Source: https://github.com/chroma-core/chroma/blob/main/docs/docs.trychroma.com/markdoc/content/cloud/package-search/mcp.md

Connects to the Chroma MCP server to search for code packages. This example uses the `package_search_grep` tool to find the Fast Fourier Transform function in the `numpy` package from PyPI. It requires the `mcp` and `asyncio` libraries. The input is a Chroma API key, and the output is the search result and a list of available tools.

```python
import asyncio
from mcp import ClientSession
from mcp.client.streamable_http import streamablehttp_client

async def main():
    async with streamablehttp_client(
        "https://mcp.trychroma.com/package-search/v1",
        headers={"x-chroma-token": "<YOUR_CHROMA_API_KEY>"},
    ) as (
        read_stream,
        write_stream,
        _,
    ):
        async with ClientSession(read_stream, write_stream) as session:
            await session.initialize()
            tools = await session.list_tools()
            result = await session.call_tool(
                name="package_search_grep",
                arguments={
                    "package_name": "numpy",
                    "registry_name": "py_pi",
                    "pattern": "\bdef fft\b",
                },
            )
            print(f"Got result: {result}")
            print(f"Available tools: {[tool.name for tool in tools.tools]}")

asyncio.run(main())
```

--------------------------------

### Add Documents to a Chroma Collection (Python & TypeScript)

Source: https://github.com/chroma-core/chroma/blob/main/docs/docs.trychroma.com/markdoc/content/docs/overview/getting-started.md

Demonstrates how to add text documents to a Chroma collection. Chroma automatically handles embedding and indexing the provided documents. Unique string IDs are required for each document.

```python
collection.add(
    ids=["id1", "id2"],
    documents=[
        "This is a document about pineapple",
        "This is a document about oranges"
    ]
)
```

```typescript
await collection.add({
  ids: ["id1", "id2"],
  documents: [
    "This is a document about pineapple",
    "This is a document about oranges",
  ],
});
```

--------------------------------

### Streamlit Integration with Chroma for Data Visualization

Source: https://github.com/chroma-core/chroma/blob/main/docs/docs.trychroma.com/public/llms.txt

This guide introduces Streamlit and explains how to use it with Chroma. It highlights the installation process, key benefits of the integration, provides a simple example, and offers resources and tutorials for effectively combining Chroma's data capabilities with Streamlit's interactive dashboarding features.

```python
import streamlit as st
import chromadb

# Initialize ChromaDB client
# Using an ephemeral client for this example
client = chromadb.EphemeralClient()

# Create or get a collection
collection_name = "streamlit_chroma_app"
collection = client.get_or_create_collection(name=collection_name)

# Add some data to Chroma (example)
collection.add(
    documents=["Streamlit makes it easy to build apps.", "Chroma is a vector database."],
    ids=["doc1", "doc2"]
)

st.title("ChromaDB Integration with Streamlit")

st.write("This app demonstrates querying data from ChromaDB using Streamlit.")

# User input for query
query = st.text_input("Enter your query:")

if query:
    # Query ChromaDB
    results = collection.query(
        query_texts=[query],
        n_results=2
    )
    
    st.subheader("Search Results:")
    if results and results.get('documents'):
        for doc in results['documents'][0]:
            st.write(f"- {doc}")
    else:
        st.write("No results found.")

# To run this: save as app.py and run `streamlit run app.py` in your terminal.

```

--------------------------------

### Install ChromaDB or ChromaDB Client

Source: https://github.com/chroma-core/chroma/blob/main/examples/basic_functionality/auth.ipynb

Installs the necessary ChromaDB package using pip. Choose either 'chromadb' for the full package or 'chromadb-client' for just the client library.

```bash
pip install chromadb
```

```bash
pip install chromadb-client
```

--------------------------------

### Start Distributed Chroma with Tilt (Bash)

Source: https://github.com/chroma-core/chroma/blob/main/DEVELOP.md

Starts a distributed Chroma cluster using Tilt. Requires Docker and a local Kubernetes cluster. Tilt provides a dashboard for monitoring.

```bash
tilt up
```

--------------------------------

### Run Chroma Backend API

Source: https://github.com/chroma-core/chroma/blob/main/docs/docs.trychroma.com/markdoc/content/reference/chroma-reference.md

Instructions to install and run the Chroma backend API. This involves using pip to install the chromadb package, running the chroma service, and then opening the Swagger documentation in a web browser.

```bash
pip install chromadb
chroma run
open http://localhost:8000/docs
```

--------------------------------

### Start Chroma Server with Basic Authentication (Docker Compose)

Source: https://github.com/chroma-core/chroma/blob/main/examples/basic_functionality/auth.ipynb

Sets up and starts the Chroma server using Docker Compose with Basic Authentication. It requires cloning the repository, generating an htpasswd file, creating a .env file for configuration, and then running docker-compose.

```bash
export CHROMA_USER=admin
export CHROMA_PASSWORD=admin
docker run --rm --entrypoint htpasswd httpd:2 -Bbn ${CHROMA_USER} ${CHROMA_PASSWORD} > server.htpasswd
cat << EOF > .env
CHROMA_SERVER_AUTH_CREDENTIALS_FILE="/chroma/server.htpasswd"
CHROMA_SERVER_AUTH_PROVIDER="chromadb.auth.basic_authn.BasicAuthenticationServerProvider"
EOF
docker-compose up -d --build 
```

--------------------------------

### Install Chroma with Poetry

Source: https://github.com/chroma-core/chroma/blob/main/docs/docs.trychroma.com/public/llms-guides-build-intro-to-retrieval.txt

Installs the ChromaDB client library using the Poetry package manager. Poetry is a dependency management tool for Python.

```terminal
poetry add chromadb
```

--------------------------------

### Install and Run Next.js Docs

Source: https://github.com/chroma-core/chroma/blob/main/docs/docs.trychroma.com/README.md

Commands to install project dependencies and run the Next.js development server for the Chroma documentation. Assumes Yarn is the package manager.

```bash
yarn # install
yarn dev # run nextjs
```

--------------------------------

### Inspect Query Results (Python & TypeScript)

Source: https://github.com/chroma-core/chroma/blob/main/docs/docs.trychroma.com/markdoc/content/docs/overview/getting-started.md

Displays the structure of results returned from a Chroma query. The results include documents, their IDs, and similarity distances. This format is consistent across Python and TypeScript client.

```python
{
  'documents': [[
      'This is a document about pineapple',
      'This is a document about oranges'
  ]],
  'ids': [['id1', 'id2']],
  'distances': [[1.0404009819030762, 1.243080496788025]],
  'uris': None,
  'data': None,
  'metadatas': [[None, None]],
  'embeddings': None,
}
```

```typescript
{
    documents: [
        [
            'This is a document about pineapple',
            'This is a document about oranges'
        ]
    ],
    ids: [
        ['id1', 'id2']
    ],
    distances: [[1.0404009819030762, 1.243080496788025]],
    uris: null,
    data: null,
    metadatas: [[null, null]],
    embeddings: null
}
```

--------------------------------

### Streamlit Integration

Source: https://github.com/chroma-core/chroma/blob/main/docs/docs.trychroma.com/public/llms.txt

Introduction to Streamlit and how to use it with Chroma. Highlights installation, benefits, and provides an example for integrating Chroma with Streamlit.

```APIDOC
## Streamlit Integration

### Description
This page introduces Streamlit and describes how to use it effectively with Chroma. It highlights the installation process, key benefits, provides a simple example, and offers resources and tutorials for integrating Chroma with Streamlit applications.

### Method
N/A (Informational Documentation)

### Endpoint
N/A (Informational Documentation)

### Parameters
N/A

### Request Example
N/A

### Response
N/A
```

--------------------------------

### Start Chroma Server with Basic Authentication (Command Line)

Source: https://github.com/chroma-core/chroma/blob/main/examples/basic_functionality/auth.ipynb

Starts the Chroma server using uvicorn with Basic Authentication configured. It generates an htpasswd file and sets environment variables for authentication credentials and provider.

```bash
export CHROMA_USER=admin
export CHROMA_PASSWORD=admin
docker run --rm --entrypoint htpasswd httpd:2 -Bbn ${CHROMA_USER} ${CHROMA_PASSWORD} > server.htpasswd
CHROMA_SERVER_AUTHN_CREDENTIALS_FILE="./server.htpasswd"
CHROMA_SERVER_AUTHN_PROVIDER="chromadb.auth.basic_authn.BasicAuthenticationServerProvider"
uvicorn chromadb.app:app --workers 1 --host 0.0.0.0 --port 8000  --proxy-headers --log-config log_config.yml
```

--------------------------------

### Install Chroma CLI

Source: https://github.com/chroma-core/chroma/blob/main/docs/docs.trychroma.com/public/llms.txt

Instructions for installing the Chroma CLI using various package managers for Python and JavaScript, as well as standalone installation options.

```bash
# Using pip
pip install chromadb

# Using pipx
pipx install chromadb

# Using npm
npm install chromadb

# Using yarn
yarn add chromadb

# Using cURL (Linux/macOS)
curl -fsSL https://install.chroma.run | sh

# Using iex (Windows)
irm https://psg0.github.io/chroma-cli/install.ps1 | iex
```

--------------------------------

### Python Example: Initializing and Processing Repository with Chroma

Source: https://github.com/chroma-core/chroma/blob/main/examples/advanced/forking.ipynb

This Python snippet demonstrates the practical application of the previously defined classes and functions. It initializes a `CodeChunker` for Python code, sets up a `GitHubRepoProcessor` using environment variables for authentication, and then calls `process_repo_files` to generate code chunks from the repository. This serves as a concise example of the workflow for ingesting and preparing code for analysis or storage in a vector database.

```python
import os

# Assuming CodeChunker and GitHubRepoProcessor are defined and imported
# from your_module import CodeChunker, GitHubRepoProcessor

# Placeholder for REPO_OWNER and REPO_NAME if not defined elsewhere
# REPO_OWNER = "some_owner"
# REPO_NAME = "some_repo"

chunker = CodeChunker(language="python", max_chunk_size=500)
gh_processor = GitHubRepoProcessor(REPO_OWNER, REPO_NAME, os.environ["GITHUB_API_KEY"])
chunks = process_repo_files(chunker=chunker, github_processor=gh_processor, branch="main")

```

--------------------------------

### ChromaDB HTTP Client and Collection Management (Python)

Source: https://github.com/chroma-core/chroma/blob/main/examples/advanced/forking.ipynb

This snippet demonstrates how to establish an HTTP connection to ChromaDB using `chromadb.HttpClient` and configure SSL, host, tenant, database, and authentication headers. It also shows how to get or create a collection with a specified embedding function.

```python
client = chromadb.HttpClient(
  ssl=True,
  host='api.trychroma.com',
  tenant='fc152910-6412-4b6b-b67a-4eb229ef50ce',
  database='Example Demo',
  headers={
    'x-chroma-token': os.environ["CHROMA_API_KEY"]
  }
)
  

main_collection = client.get_or_create_collection(
  name=f"{REPO_OWNER}_{REPO_NAME}_{EXISTING_BRANCH}",
  configuration={
    "embedding_function": JinaEmbeddingFunction(
      model_name="jina-embeddings-v2-base-code"
    )
  }
)
```

--------------------------------

### Query Collection

Source: https://github.com/chroma-core/chroma/blob/main/docs/docs.trychroma.com/public/llms-docs-overview-getting-started.txt

Queries a ChromaDB collection using text inputs to find the most semantically similar documents. Chroma embeds the query text automatically. The `n_results` parameter specifies the number of results to return.

```python
results = collection.query(
    query_texts=["This is a query document about hawaii"], # Chroma will embed this for you
    n_results=2 # how many results to return
)
print(results)
```

```typescript
const results = await collection.query({
    queryTexts: "This is a query document about hawaii", // Chroma will embed this for you
    nResults: 2, // how many results to return
});

console.log(results);
```

--------------------------------

### Install Streamlit

Source: https://github.com/chroma-core/chroma/blob/main/docs/docs.trychroma.com/markdoc/content/integrations/frameworks/streamlit.md

Installs the Streamlit library using pip. This is the first step to begin building web applications with Streamlit.

```bash
pip install streamlit
```

--------------------------------

### Install and Run ChromaDB Migration CLI

Source: https://github.com/chroma-core/chroma/blob/main/docs/docs.trychroma.com/markdoc/content/docs/overview/migration.md

Provides instructions for installing the `chroma-migrate` package using pip and then running the migration utility from the command line. This tool is used to migrate data to the new SQLite-based storage format.

```bash
pip install chroma-migrate
chroma-migrate

```

--------------------------------

### Old Basic Auth Server Configuration Example (YAML)

Source: https://github.com/chroma-core/chroma/blob/main/docs/docs.trychroma.com/markdoc/content/docs/overview/migration.md

This snippet provides an example of the previous server configuration for Basic authentication. It includes settings for credentials, credential files, and providers.

```yaml
CHROMA_SERVER_AUTH_CREDENTIALS="admin:admin"
CHROMA_SERVER_AUTH_CREDENTIALS_FILE="./example_file"
CHROMA_SERVER_AUTH_CREDENTIALS_PROVIDER="chromadb.auth.providers.HtpasswdConfigurationServerAuthCredentialsProvider"
CHROMA_SERVER_AUTH_PROVIDER="chromadb.auth.basic.BasicAuthServerProvider"
```

--------------------------------

### OpenLIT Integration

Source: https://github.com/chroma-core/chroma/blob/main/docs/docs.trychroma.com/public/llms.txt

Introduction to OpenLIT, an LLM Application Observability tool with OpenTelemetry auto-instrumentation for Chroma. Provides installation and visualization guides.

```APIDOC
## OpenLIT Integration

### Description
This page introduces OpenLIT, an LLM Application Observability tool that offers OpenTelemetry auto-instrumentation for Chroma. It provides a guide for installing and initializing OpenLIT, as well as visualizing LLM Observability data.

### Method
N/A (Informational Documentation)

### Endpoint
N/A (Informational Documentation)

### Parameters
N/A

### Request Example
N/A

### Response
N/A
```

--------------------------------

### Install Chroma Thin-Client using uv

Source: https://github.com/chroma-core/chroma/blob/main/docs/docs.trychroma.com/public/llms-guides-deploy-python-thin-client.txt

Installs the `chromadb-client` package using the `uv` package installer. This method provides a fast and efficient way to add the lightweight Chroma HTTP client to your Python project.

```terminal
uv pip install chromadb-client
```

--------------------------------

### Haystack Integration with Chroma Document Store

Source: https://github.com/chroma-core/chroma/blob/main/docs/docs.trychroma.com/public/llms.txt

This guide details the integration of the Haystack LLM framework with Chroma, allowing users to store documents in a ChromaDocumentStore. It provides installation instructions and code examples for writing documents into Chroma and building RAG pipelines, facilitating efficient document retrieval and question answering.

```python
from haystack.document_stores import ChromaDocumentStore
from haystack.nodes import TextConverter, PDFToTextConverter, DocxConverter
from haystack.pipelines import Pipeline
from haystack.components.retrievers import InMemoryEmbeddingRetriever
from haystack.components.generators import OpenAIGenerator

# Initialize ChromaDocumentStore
document_store = ChromaDocumentStore(
    collection_name="haystack_chroma_docs",
    persist_directory=".", # Optional: specify a directory to persist data
    recreate=True # Set to False if you want to reuse existing data
)

# Example: Convert and write documents
converter = TextConverter()
document = converter.convert(file_path="my_document.txt")
document_store.write_documents([document])

# You can also use other converters like PDFToTextConverter or DocxConverter
# pdf_converter = PDFToTextConverter()
# pdf_document = pdf_converter.convert(file_path="my_document.pdf")
# document_store.write_documents([pdf_document])

# Initialize a pipeline with Chroma as the document store
pipeline = Pipeline()

# Retriever component (assuming embeddings are already in Chroma)
retriever = InMemoryEmbeddingRetriever(document_store=document_store)

# Generator component (e.g., using OpenAI)
# generator = OpenAIGenerator(model="gpt-3.5-turbo")

# Add components to the pipeline (example structure)
# pipeline.add_node(component=retriever, name="Retriever", inputs=["Query"])
# pipeline.add_node(component=generator, name="Generator", inputs=["Retriever"])

# Run the pipeline (example)
# result = pipeline.run(queries=["What is the content of the document?"])
# print(result)

```

--------------------------------

### Install ChromaDB and Cohere Libraries

Source: https://github.com/chroma-core/chroma/blob/main/examples/use_with/cohere/cohere_python.ipynb

Installs necessary Python packages for ChromaDB, Cohere embeddings, Pillow, datasets, and matplotlib. These are essential for running the subsequent examples.

```python
! pip install chromadb --quiet
! pip install cohere --quiet
! pip install Pillow --quiet
! pip install datasets --quiet
! pip install matplotlib --quiet
```

--------------------------------

### Apply Atlas Postgres Schema Migrations

Source: https://github.com/chroma-core/chroma/blob/main/go/README.md

Commands to apply database schema migrations for the Chroma project using Atlas. It includes diffing the current state against the desired schema and applying the changes to a development PostgreSQL database.

```bash
atlas migrate diff --env dev
atlas --env dev migrate apply --url "postgres://chroma:chroma@localhost:5432/chroma?sslmode=disable"
```

--------------------------------

### Basic ChromaDB Client Usage (JavaScript)

Source: https://github.com/chroma-core/chroma/blob/main/clients/js/packages/chromadb-client/README.md

A foundational JavaScript example demonstrating how to initialize the ChromaDB client, create a collection, add documents with embeddings and metadata, and perform a query.

```javascript
import { ChromaClient } from "chromadb-client";

// Initialize the client
const chroma = new ChromaClient({ path: "http://localhost:8000" });

// Create a collection
const collection = await chroma.createCollection({ name: "my-collection" });

// Add documents to the collection
await collection.add({
  ids: ["id1", "id2"],
  embeddings: [
    [1.1, 2.3, 3.2],
    [4.5, 6.9, 4.4],
  ],
  metadatas: [{ source: "doc1" }, { source: "doc2" }],
  documents: ["Document 1 content", "Document 2 content"],
});

// Query the collection
const results = await collection.query({
  queryEmbeddings: [1.1, 2.3, 3.2],
  nResults: 2,
});
```

--------------------------------

### Install Requirements in Python

Source: https://github.com/chroma-core/chroma/blob/main/sample_apps/generative_benchmarking/compare.ipynb

Installs necessary packages specified in the requirements.txt file using pip. This is a crucial first step before running any other code in the project.

```python
%pip install -r requirements.txt

```

--------------------------------

### Initialize InstructorEmbeddingFunction (Default)

Source: https://github.com/chroma-core/chroma/blob/main/docs/docs.trychroma.com/markdoc/content/integrations/embedding-models/instructor.md

Initializes the InstructorEmbeddingFunction using the default base model and CPU device. This is a simple way to get started with Instructor embeddings in ChromaDB.

```python
import chromadb.utils.embedding_functions as embedding_functions
ef = embedding_functions.InstructorEmbeddingFunction()
```

--------------------------------

### ChromaDB Client and Collection Management in Python

Source: https://github.com/chroma-core/chroma/blob/main/examples/basic_functionality/test_get_collection_by_id.ipynb

This snippet shows how to initialize a persistent ChromaDB client, get or create a collection, and retrieve collection details like ID, tenant, and database. It assumes the 'chromadb' library is installed.

```python
import chromadb

client = chromadb.PersistentClient()

col = client.get_or_create_collection('test_collection')
print(col)


col1=client.get_collection(id=col.id)

print(col1.tenant)
assert col1.id == col.id

assert col1.tenant == col.tenant
assert col1.name == col.name
assert col1.database == col.database
print(col1.database)
```

--------------------------------

### Remove Chroma Data Directory

Source: https://github.com/chroma-core/chroma/blob/main/examples/xai/README.md

Deletes the Chroma data directory to reset the example or remove previously inserted documents. This is useful for starting fresh.

```bash
rm -rf chroma_data
```

--------------------------------

### Python List Collections Example

Source: https://github.com/chroma-core/chroma/blob/main/docs/docs.trychroma.com/markdoc/content/docs/overview/migration.md

Provides an example of how to use `list_collections` and `get_collection` in Python, particularly when collections might have been created with custom embedding functions. This addresses changes in `list_collections` behavior starting from v0.6.0.

```python
collection_names = client.list_collections()
ef = OpenAIEmbeddingFunction(...)
collections = [
	client.get_collection(name=name, embedding_function=ef)
	for name in collection_names
]
```

--------------------------------

### Chroma CLI: Browse Collection Examples

Source: https://github.com/chroma-core/chroma/blob/main/docs/docs.trychroma.com/markdoc/content/docs/cli/browse.md

Demonstrates various ways to use the `chroma browse` command for different scenarios, including browsing collections in the cloud, with a specific database, on a local server using the default configuration, specifying a custom host, or providing a local data path.

```Terminal
chroma browse my-collection
```

```Terminal
chroma browse my-collection --db my-db
```

```Terminal
chroma browse my-local-collection --local
```

```Terminal
chroma browse my-local-collection --host http://localhost:8050
```

```Terminal
chroma browse my-local-collection --path ~/Developer/my-app/chroma
```

--------------------------------

### Set Postgres Environment Variables

Source: https://github.com/chroma-core/chroma/blob/main/go/README.md

Environment variables required by certain tests, such as record_log_service_test.go, to connect to a local PostgreSQL instance.

```bash
export POSTGRES_HOST=localhost
export POSTGRES_PORT=5432
```

--------------------------------

### Old Token Auth Client Configuration Example (YAML)

Source: https://github.com/chroma-core/chroma/blob/main/docs/docs.trychroma.com/markdoc/content/docs/overview/migration.md

This snippet shows an example of the previous client configuration for Token authentication. It includes settings for the authentication provider and credentials.

```yaml
CHROMA_CLIENT_AUTH_PROVIDER="chromadb.auth.token.TokenAuthClientProvider"
CHROMA_CLIENT_AUTH_CREDENTIALS="admin:admin"
```

--------------------------------

### Run VoltAgent Application

Source: https://github.com/chroma-core/chroma/blob/main/docs/docs.trychroma.com/public/llms-integrations-frameworks-voltagent.txt

Command to start the VoltAgent application in development mode. This command initiates the server, loads sample data, and makes the AI agents available for interaction.

```bash
npm run dev

```

--------------------------------

### Install ChromaDB Client

Source: https://github.com/chroma-core/chroma/blob/main/README.md

Provides installation instructions for the ChromaDB client for Python and JavaScript. It also shows how to run Chroma in client-server mode.

```bash
pip install chromadb # python client
# for javascript, npm install chromadb!
# for client-server mode, chroma run --path /chroma_db_path
```

--------------------------------

### Install ChromaDB Client and Dependencies

Source: https://github.com/chroma-core/chroma/blob/main/clients/js/packages/chromadb-client/README.md

Instructions for installing the ChromaDB client and optional embedding libraries using npm, pnpm, or yarn. This highlights the flexibility in choosing embedding providers.

```bash
# npm
npm install chromadb-client

# pnpm
pnpm add chromadb-client

# yarn
yarn add chromadb-client
```

```bash
# For OpenAI embeddings
npm install chromadb-client openai

# For default embeddings
npm install chromadb-client chromadb-default-embed

# For Cohere embeddings
npm install chromadb-client cohere-ai
```

--------------------------------

### Install Python Dependencies

Source: https://github.com/chroma-core/chroma/blob/main/examples/chat_with_your_documents/README.md

Installs the required Python packages for the project using pip. It reads dependencies from a requirements.txt file.

```bash
pip install -r requirements.txt
```

--------------------------------

### Initialize ChromaDB Client (HTTP Client)

Source: https://github.com/chroma-core/chroma/blob/main/docs/docs.trychroma.com/public/llms-docs-overview-migration.txt

This snippet demonstrates the modern way to initialize a ChromaDB client using `HttpClient`, specifying the host and port. This is a more direct approach compared to the previous method using `chromadb.Client` with settings.

```python
import chromadb
client = chromadb.HttpClient(host="localhost", port="8000")
```

--------------------------------

### Python Persistent Client Setup

Source: https://github.com/chroma-core/chroma/blob/main/docs/docs.trychroma.com/markdoc/content/docs/run-chroma/persistent-client.md

Demonstrates how to initialize a persistent Chroma client in Python, specifying a path for database storage. Data is automatically persisted and loaded on startup.

```python
import chromadb

client = chromadb.PersistentClient(path="/path/to/save/to")
```

--------------------------------

### Import ChromaDB in Node.js

Source: https://github.com/chroma-core/chroma/blob/main/clients/js/examples/node/README.md

Demonstrates how to import the ChromaDB library in a Node.js environment. It covers both the bundled package, which includes all embedding libraries, and the client package, which utilizes peer dependencies for a leaner setup.

```javascript
const chroma = require("chromadb");
```

```javascript
const chroma = require("chromadb-client");
```

--------------------------------

### Start Chroma Server

Source: https://github.com/chroma-core/chroma/blob/main/docs/docs.trychroma.com/markdoc/content/docs/run-chroma/client-server.md

Command to start the Chroma server in client-server mode. It requires a path to store the database. This is the initial step before clients can connect.

```bash
chroma run --path /db_path
```

--------------------------------

### Install Protobuf for MacOS (Bash)

Source: https://github.com/chroma-core/chroma/blob/main/DEVELOP.md

Installs the protobuf compiler on macOS using Homebrew. This is a prerequisite for building the project.

```bash
brew install protobuf
```

--------------------------------

### Set xAI API Key

Source: https://github.com/chroma-core/chroma/blob/main/examples/xai/README.md

This command sets the xAI API key as an environment variable. This is a prerequisite for running the xAI-dependent examples.

```bash
export XAI_API_KEY=[Your API key goes here]
```

--------------------------------

### Configure Claude Desktop for Chroma MCP Server

Source: https://github.com/chroma-core/chroma/blob/main/docs/docs.trychroma.com/markdoc/content/cloud/package-search/mcp.md

This JSON configuration adds the Chroma MCP package search server to Claude Desktop. It specifies the command to run ('npx mcp-remote'), the server URL, and uses an environment variable for the Chroma API key.

```json
{
    "mcpServers": {
      "package-search": {
        "command": "npx",
        "args": ["mcp-remote", "https://mcp.trychroma.com/package-search/v1", "--header", "x-chroma-token: ${X_CHROMA_TOKEN}"],
        "env": {
          "X_CHROMA_TOKEN": "<YOUR_CHROMA_API_KEY>"
        }
      }
    }
}
```

--------------------------------

### Run VoltAgent Application

Source: https://github.com/chroma-core/chroma/blob/main/docs/docs.trychroma.com/markdoc/content/integrations/frameworks/voltagent.md

Command to start the VoltAgent application in development mode. This will initialize the knowledge base and agents.

```Terminal
npm run dev
```

--------------------------------

### Install Streamlit and Chroma Connection

Source: https://github.com/chroma-core/chroma/blob/main/docs/docs.trychroma.com/public/llms-integrations-frameworks-streamlit.txt

Installs the Streamlit library for building web apps and the `streamlit-chromadb-connection` package to integrate with ChromaDB. The latter utilizes Streamlit's `st.connection` for seamless data access.

```bash
pip install streamlit
pip install streamlit-chromadb-connection
```

--------------------------------

### Haystack Integration

Source: https://github.com/chroma-core/chroma/blob/main/docs/docs.trychroma.com/public/llms.txt

Documentation for integrating the Haystack LLM framework with Chroma. Details installation and provides code examples for using Chroma with Haystack for document storage and RAG pipelines.

```APIDOC
## Haystack Integration

### Description
This page details the integration of the open-source Haystack LLM framework with Chroma. It includes instructions for installation and provides code examples for writing documents into a Chroma Document Store and building Retrieval-Augmented Generation (RAG) pipelines.

### Method
N/A (Informational Documentation)

### Endpoint
N/A (Informational Documentation)

### Parameters
N/A

### Request Example
N/A

### Response
N/A
```

--------------------------------

### Initialize Django Blog Module

Source: https://github.com/chroma-core/chroma/blob/main/examples/advanced/forking.ipynb

This snippet is from the __init__.py file in the blog module of a Django application. It is typically used to make the module a Python package and can optionally contain initialization code.

```python
 
```

--------------------------------

### OpenLIT Integration for Chroma Observability

Source: https://github.com/chroma-core/chroma/blob/main/docs/docs.trychroma.com/public/llms.txt

This guide introduces OpenLIT, an LLM Application Observability tool featuring OpenTelemetry auto-instrumentation for Chroma. It provides instructions for installing and initializing OpenLIT, along with steps for visualizing LLM observability data to monitor and debug Chroma-based applications.

```python
from openlit import OpenLit
from chromadb.api import Client

# Initialize ChromaDB client
chroma_client: Client = chromadb.Client()

# Initialize OpenLit with your Chroma client
# Replace "my_app_name" with your application's name
openlit_client = OpenLit(client=chroma_client, app_name="my_chroma_app")

# Use the OpenLit-wrapped client for Chroma operations
collection_name = "openlit_collection"
collection = openlit_client.get_or_create_collection(name=collection_name)

# Example operations will now be traced by OpenLIT
collection.add(
    documents=["This is a document for observability."],
    ids=["obs_doc1"]
)

results = collection.query(
    query_texts=["observability test"],
    n_results=1
)

print("Operations performed. Check your OpenTelemetry dashboard for traces.")

# To visualize data, you would typically configure an OpenTelemetry exporter
# (e.g., OTLP exporter) and send traces to a backend like Jaeger or Grafana.

```