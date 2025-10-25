Apollo.io
707 online
24k

22.7k


Toggle theme













































Chroma
Chroma is the open-source AI application database. Chroma makes it easy to build LLM apps by making knowledge, facts, and skills pluggable for LLMs.

New to Chroma? Check out the getting started guide

Chroma Computer
Chroma gives you everything you need for retrieval:

Store embeddings and their metadata
Vector search
Full-text search
Document storage
Metadata filtering
Multi-modal retrieval
Chroma runs as a server and provides Python and JavaScript/TypeScript client SDKs. Check out the Colab demo (yes, it can run in a Jupyter notebook).

Chroma is licensed under Apache 2.0

Python
In Python, Chroma can run in a python script or as a server. Install Chroma with


pip install chromadb
JavaScript/TypeScript
In JavaScript and TypeScript, use the Chroma JS/TS Client to connect to a Chroma server. Install Chroma with your favorite package manager:


npm install chromadb @chroma-core/default-embed
Continue with the full getting started guide.

Language Clients#
Language	Client
Python	chromadb (by Chroma)
Javascript	chromadb (by Chroma)
Ruby	from @mariochavez
Java	from @t_azarov
Java	from @locxngo (Java 17+, ChromaAPI V2)
Go	from @t_azarov
C#/.NET	from @cincuranet, @ssone95, @microsoft
Rust	from @Anush008
Elixir	from @3zcurdia
Dart	from @davidmigloz
PHP	from @CodeWithKyrian, from @pari
PHP (Laravel)	from @HelgeSverre
Clojure	from @levand
R	from @cynkra
C++	from @BlackyDrum
We welcome contributions for other languages!

Getting Started

Edit this page on GitHub

Ask this Page

On this page
Chroma
Python
JavaScript/TypeScript
Language Clients
Introduction - Chroma Docs

Apollo.io
707 online
24k

22.7k


Toggle theme













































Getting Started
Chroma is an AI-native open-source vector database. It comes with everything you need to get started built-in, and runs on your machine.


For production, Chroma offers Chroma Cloud - a fast, scalable, and serverless database-as-a-service. Get started in 30 seconds - $5 in free credits included.

1. Install

pip install chromadb
2. Create a Chroma Client

import chromadb
chroma_client = chromadb.Client()
3. Create a collection
Collections are where you'll store your embeddings, documents, and any additional metadata. Collections index your embeddings and documents, and enable efficient retrieval and filtering. You can create a collection with a name:


collection = chroma_client.create_collection(name="my_collection")
4. Add some text documents to the collection
Chroma will store your text and handle embedding and indexing automatically. You can also customize the embedding model. You must provide unique string IDs for your documents.


collection.add(
    ids=["id1", "id2"],
    documents=[
        "This is a document about pineapple",
        "This is a document about oranges"
    ]
)
5. Query the collection
You can query the collection with a list of query texts, and Chroma will return the n most similar results. It's that easy!


results = collection.query(
    query_texts=["This is a query document about hawaii"], # Chroma will embed this for you
    n_results=2 # how many results to return
)
print(results)
If n_results is not provided, Chroma will return 10 results by default. Here we only added 2 documents, so we set n_results=2.

6. Inspect Results
From the above - you can see that our query about hawaii is semantically most similar to the document about pineapple.


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
7. Try it out yourself
What if we tried querying with "This is a document about florida"? Here is a full example.


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
Next steps#
In this guide we used Chroma's ephemeral client for simplicity. It starts a Chroma server in-memory, so any data you ingest will be lost when your program terminates. You can use the persistent client or run Chroma in client-server mode if you need data persistence.

Learn how to Deploy Chroma to a server
Join Chroma's Discord Community to ask questions and get help
Follow Chroma on X (@trychroma) for updates
Introduction

Architecture

Edit this page on GitHub

Ask this Page

On this page
Getting Started
1. Install
2. Create a Chroma Client
3. Create a collection
4. Add some text documents to the collection
5. Query the collection
6. Inspect Results
7. Try it out yourself
Next steps
Next steps
Getting Started - Chroma Docs

Apollo.io
707 online
24k

22.7k


Toggle theme













































Architecture
Chroma is designed with a modular architecture that prioritizes performance and ease of use. It scales seamlessly from local development to large-scale production, while exposing a consistent API across all deployment modes.

Chroma delegates, as much as possible, problems of data durability to trusted sub-systems such as SQLite and Cloud Object Storage, focusing the system design on core problems of data management and information retrieval.

Deployment Modes#
Chroma runs wherever you need it to, supporting you in everything from local experimentation, to large scale production workloads.

Local: as an embedded library - great for prototyping and experimentation.
Single Node: as a single-node server - great for small to medium scale workloads of < 10M records in a handful of collections.
Distributed: as a scalable distributed system - great for large scale production workloads, supporting millions of collections.
You can use Chroma Cloud, which is a managed offering of distributed Chroma.

Core Components#
Regardless of deployment mode, Chroma is composed of five core components. Each plays a distinct role in the system and operates over the shared Chroma data model.

Chroma System architecture
The Gateway
The entrypoint for all client traffic.

Exposes a consistent API across all modes.
Handles authentication, rate-limiting, quota management, and request validation.
Routes requests to downstream services.
The Log
Chroma’s write-ahead log.

All writes are recorded here before acknowledgment to clients.
Ensures atomicity across multi-record writes.
Provides durability and replay in distributed deployments.
The Query Executor
Responsible for all read operations.

Vector similarity, full-text and metadata search.
Maintains a combination of in-memory and on-disk indexes, and coordinates with the Log to serve consistent results.
The Compactor
A service that periodically builds and maintains indexes.

Reads from the Log and builds updated vector / full-text / metadata indexes.
Writes materialized index data to shared storage.
Updates the System Database with metadata about new index versions.
The System Database
Chroma’s internal catalog.

Tracks tenants, collections, and their metadata.
In distributed mode, also manages cluster state (e.g., query/compactor node membership).
Backed by a SQL database.
Storage & Runtime#
These components operate differently depending on the deployment mode, particularly in how they use storage and the runtime they operate in.

In Local and Single Node mode, all components share a process and use the local filesystem for durability.
In Distributed mode, components are deployed as independent services.
The log and built indexes are stored in cloud object storage.
The system catalog is backed by a SQL database.
All services use local SSDs as caches to reduce object storage latency and cost.
Request Sequences#
Read Path
Chroma System Read Path
Request arrives at the gateway, where it is authenticated, checked against quota limits, rate limited and transformed into a logical plan.
This logical plan is routed to the relevant query executor. In distributed Chroma, a rendezvous hash on the collection id is used to route the query to the correct nodes and provide cache coherence.
The query executor transforms the logical plan into a physical plan for execution, reads from its storage layer, and performs the query. The query executor pulls data from the log to ensure a consistent read.
The request is returned to the gateway and subsequently to the client.
Write Path
Chroma System Write Path
Request arrives at the gateway, where it is authenticated, checked against quota limits, rate limited and then transformed into a log of operations.
The log of operations is forwarded to the write-ahead-log for persistence.
After being persisted by the write-ahead-log, the gateway acknowledges the write.
The compactor periodically pulls from the write-ahead-log and builds new index versions from the accumulated writes. These indexes are optimized for read performance and include vector, full-text, and metadata indexes.
Once new index versions are built, they are written to storage and registered in the system database.
Tradeoffs#
Distributed Chroma is built on object storage in order to ensure the durability of your data and to deliver low costs. Object storage has extremely high throughput, easily capable of saturating a single nodes network bandwidth, but this comes at the cost of a relatively high latency floor of ~10-20ms.

In order to reduce the overhead of this latency floor, Distributed Chroma aggressively leverage SSD caching. When you first query a collection, a subset of the data needed to answer the query will be read selectively from object storage, incurring a cold-start latency penalty. In the background, the SSD cache will be loaded with the data for the collection. After the collection is fully warm, queries will be served entirely from SSD.

Getting Started

Data Model

Edit this page on GitHub

Ask this Page

On this page
Architecture
Deployment Modes
Core Components
The Gateway
The Log
The Query Executor
The Compactor
The System Database
Storage & Runtime
Request Sequences
Read Path
Write Path
Tradeoffs
Architecture - Chroma Docs

Apollo.io
707 online
24k

22.7k


Toggle theme













































Chroma Data Model
Chroma’s data model is designed to balance simplicity, flexibility, and scalability. It introduces a few core abstractions—Tenants, Databases, and Collections—that allow you to organize, retrieve, and manage data efficiently across environments and use cases.

Collections
A collection is the fundamental unit of storage and querying in Chroma. Each collection contains a set of items, where each item consists of:

An ID uniquely identifying the item
An embedding vector
Optional metadata (key-value pairs)
A document that belongs to the provided embedding
Collections are independently indexed and are optimized for fast retrieval using vector similarity, full-text search, and metadata filtering. In distributed deployments, collections can be sharded or migrated across nodes as needed; the system transparently manages paging them in and out of memory based on access patterns.

Databases
Collections are grouped into databases, which serve as a logical namespace. This is useful for organizing collections by purpose—for example, separating environments like "staging" and "production", or grouping applications under a common schema.

Each database contains multiple collections, and each collection name must be unique within a database.

Tenants
At the top level of the model is the tenant, which represents a single user, team, or account. Tenants provide complete isolation. No data or metadata, is shared across tenants. All access control, quota enforcement, and billing are scoped to the tenant level.

Architecture

Roadmap

Edit this page on GitHub

Ask this Page

On this page
Chroma Data Model
Collections
Databases
Tenants
Data Model - Chroma Docs

Apollo.io
707 online
24k

22.7k


Toggle theme













































Roadmap
The goal of this doc is to align core and community efforts for the project and to share what's in store for this year!

What is the core Chroma team working on right now?#
Extending the search and retrieval capabilities for Chroma Cloud. Email us your feedback and ideas.
What did the Chroma team just complete?#
Features like:

Chroma 1.0.0 - a complete rewrite of Chroma in Rust, giving users up to x4 performance boost.
A rewrite of our JS/TS client, with better DX and many quality of life improvements.
Persistent collection configuration on the server, unlocking many new features. For example, you no longer need to provide your embedding function on every get_collection.
The new Chroma CLI that lets you browse your collections locally, manage your Chroma Cloud DBs, and more!
Chroma Cloud!
Package Search MCP - Allow your coding agent to search and understand the source code of thousands of dependencies from npm, pypi and crates.
What will Chroma prioritize over the next 6mo?#
Areas we will invest in

Not an exhaustive list, but these are some of the core team’s biggest priorities over the coming few months. Use caution when contributing in these areas and please check-in with the core team first.

Workflow: Building tools for answer questions like: what embedding model should I use? And how should I chunk up my documents?
Visualization: Building visualization tool to give developers greater intuition embedding spaces
Query Planner: Building tools to enable per-query and post-query transforms
Developer experience: Adding more features to our CLI
Easier Data Sharing: Working on formats for serialization and easier data sharing of embedding Collections
Improving recall: Fine-tuning embedding transforms through human feedback
Analytical horsepower: Clustering, deduplication, classification and more
What areas are great for community contributions?#
This is where you have a lot more free reign to contribute (without having to sync with us first)!

If you're unsure about your contribution idea, feel free to chat with us (@chroma) in the #general channel on our Discord! We'd love to support you however we can.

Example Templates
We can always use more integrations with the rest of the AI ecosystem. Please let us know if you're working on one and need help!

Other great starting points for Chroma:

Google Colab
For those integrations we do have, like LangChain and LlamaIndex, we do always want more tutorials, demos, workshops, videos, and podcasts (we've done some pods on our blog).

Example Datasets
It doesn’t make sense for developers to embed the same information over and over again with the same embedding model.

We'd like suggestions for:

"small" (<100 rows)
"medium" (<5MB)
"large" (>1GB)
datasets for people to stress test Chroma in a variety of scenarios.

Embeddings Comparison
Chroma does ship with Sentence Transformers by default for embeddings, but we are otherwise unopinionated about what embeddings you use. Having a library of information that has been embedded with many models, alongside example query sets would make it much easier for empirical work to be done on the effectiveness of various models across different domains.

Preliminary reading on Embeddings
Huggingface Benchmark of a bunch of Embeddings
notable issues with GPT3 Embeddings and alternatives to consider
Experimental Algorithms
If you have a research background, we welcome contributions in the following areas:

Projections (t-sne, UMAP, the new hotness, the one you just wrote) and Lightweight visualization
Clustering (HDBSCAN, PCA)
Deduplication
Multimodal (CLIP)
Fine-tuning manifold with human feedback eg
Expanded vector search (MMR, Polytope)
Your research
Please reach out and talk to us before you get too far in your projects so that we can offer technical guidance/align on roadmap.

Data Model

Contributing

Edit this page on GitHub

Ask this Page

On this page
Roadmap
What is the core Chroma team working on right now?
What did the Chroma team just complete?
What will Chroma prioritize over the next 6mo?
What areas are great for community contributions?
Example Templates
Example Datasets
Embeddings Comparison
Experimental Algorithms
Roadmap - Chroma Docs

Apollo.io
707 online
24k

22.7k


Toggle theme













































Contributing
We welcome all contributions, bug reports, bug fixes, documentation improvements, enhancements, and ideas.

Getting Started#
Here are some helpful links to get you started with contributing to Chroma

The Chroma codebase is hosted on Github
Issues are tracked on Github Issues. Please report any issues you find there making sure to fill out the correct form for the type of issue you are reporting.
In order to run Chroma locally you can follow the Development Instructions.
If you want to contribute and aren't sure where to get started you can search for issues with the Good first issue tag or take a look at our Roadmap.
The Chroma documentation (including this page!) is hosted on Github as well. If you find any issues with the documentation please report them on the Github Issues page for the documentation.
Contributing Code and Ideas#
Pull Requests
In order to submit a change to Chroma please submit a Pull Request against Chroma or the documentation. The pull request will be reviewed by the Chroma team and if approved, will be merged into the repository. We will do our best to review pull requests in a timely manner but please be patient as we are a small team. We will work to integrate your proposed changes as quickly as possible if they align with the goals of the project. We ask that you label your pull request with a title prefix that indicates the type of change you are proposing. The following prefixes are used:

ENH: Enhancement, new functionality
BUG: Bug fix
DOC: Additions/updates to documentation
TST: Additions/updates to tests
BLD: Updates to the build process/scripts
PERF: Performance improvement
TYP: Type annotations
CLN: Code cleanup
CHORE: Maintenance and other tasks that do not modify source or test files
CIPs
Chroma Improvement Proposals or CIPs (pronounced "Chips") are the way to propose new features or large changes to Chroma. If you plan to make a large change to Chroma please submit a CIP first so that the core Chroma team as well as the community can discuss the proposed change and provide feedback. A CIP should provide a concise technical specification of the feature and a rationale for why it is needed. The CIP should be submitted as a pull request to the CIPs folder. The CIP will be reviewed by the Chroma team and if approved will be merged into the repository. To learn more about writing a CIP you can read the guide. CIPs are not required for small changes such as bug fixes or documentation updates.

A CIP starts in the "Proposed" state, then moves to "Under Review" once the Chroma team has reviewed it and is considering it for implementation. Once the CIP is approved it will move to the "Accepted" state and the implementation can begin. Once the implementation is complete the CIP will move to the "Implemented" state. If the CIP is not approved it will move to the "Rejected" state. If the CIP is withdrawn by the author it will move to the "Withdrawn" state.

Discord
For less fleshed out ideas you want to discuss with the community, you can join our Discord and chat with us in the #feature-ideas channel. We are always happy to discuss new ideas and features with the community.

Roadmap

Telemetry

Edit this page on GitHub

Ask this Page

On this page
Contributing
Getting Started
Contributing Code and Ideas
Pull Requests
CIPs
Discord
Contributing - Chroma Docs

Apollo.io
707 online
24k

22.7k


Toggle theme













































Telemetry
Chroma contains a telemetry feature that collects anonymous usage information.

Why?
We use this information to help us understand how Chroma is used, to help us prioritize work on new features and bug fixes, and to help us improve Chroma’s performance and stability.

Opting out
If you prefer to opt out of telemetry, you can do this in two ways.

In Client Code
Set anonymized_telemetry to False in your client's settings:


from chromadb.config import Settings
client = chromadb.Client(Settings(anonymized_telemetry=False))
# or if using PersistentClient
client = chromadb.PersistentClient(path="/path/to/save/to", settings=Settings(anonymized_telemetry=False))
In Chroma's Backend Server Using Environment Variables
Set ANONYMIZED_TELEMETRY to False in your shell or server environment.

If you are running Chroma on your local computer with docker-compose you can set this value in an .env file placed in the same directory as the docker-compose.yml file:

ANONYMIZED_TELEMETRY=False
What do you track?
We will only track usage details that help us make product decisions, specifically:

Chroma version and environment details (e.g. OS, Python version, is it running in a container, or in a jupyter notebook)
Usage of embedding functions that ship with Chroma and aggregated usage of custom embeddings (we collect no information about the custom embeddings themselves)
Client interactions with our hosted Chroma Cloud service.
Collection commands. We track the anonymized uuid of a collection as well as the number of items
add
update
query
get
delete
We do not collect personally-identifiable or sensitive information, such as: usernames, hostnames, file names, environment variables, or hostnames of systems being tested.

To view the list of events we track, you may reference the code

Where is telemetry information stored?
We use Posthog to store and visualize telemetry data.

Posthog is an open source platform for product analytics. Learn more about Posthog on posthog.com or github.com/posthog

Contributing

Migration

Edit this page on GitHub

Ask this Page

On this page
Telemetry
Why?
Opting out
In Client Code
In Chroma's Backend Server Using Environment Variables
What do you track?
Where is telemetry information stored?
Telemetry - Chroma Docs

Apollo.io
707 online
24k

22.7k


Toggle theme













































Migration
Schema and data format changes are a necessary evil of evolving software. We take changes seriously and make them infrequently and only when necessary.

Chroma's commitment is whenever schema or data format change, we will provide a seamless and easy-to-use migration tool to move to the new schema/format.

Specifically we will announce schema changes on:

Discord (#migrations channel)
Github (here)
Email listserv Sign up
We will aim to provide:

a description of the change and the rationale for the change.
a CLI migration tool you can run
a video walkthrough of using the tool
Migration Log#
v1.0.0 - March 1, 2025
In this release, we've rewritten much of Chroma in Rust. Performance has significantly improved across the board.

Breaking changes

Chroma no longer provides built-in authentication implementations.

list_collections now reverts back to returning Collection objects.

Chroma in-process changes

This section is applicable to you if you use Chroma via


import chromadb

client = chromadb.Client()
# or
client = chromadb.EphemeralClient()
# or
client = chromadb.PersistentClient()
The new Rust implementation ignores these settings:

chroma_server_nofile
chroma_server_thread_pool_size
chroma_memory_limit_bytes
chroma_segment_cache_policy
Chroma CLI changes

This section is applicable to you if you run a Chroma server using the CLI (chroma run).

Settings that you may have previously provided to the server using environment variables, like CHROMA_SERVER_CORS_ALLOW_ORIGINS or CHROMA_OTEL_COLLECTION_ENDPOINT, are now provided using a configuration file. For example:


chroma run --config ./config.yaml
Check out a full sample configuration file here.

Chroma in Docker changes

This section is applicable to you if you run Chroma using a Docker container.

Settings that you previously provided to the container using environment variables, like CHROMA_SERVER_CORS_ALLOW_ORIGINS or CHROMA_OTEL_COLLECTION_ENDPOINT, are now provided to the container using a configuration file. See the Docker documentation for more information.

The default data location in the container has changed from /chroma/chroma to /data. For example, if you previously started the container with:


docker run -p 8000:8000 -v ./chroma:/chroma/chroma chroma-core/chroma
you should now start it with:


docker run -p 8000:8000 -v ./chroma:/data chroma-core/chroma
v0.6.0 - December 30, 2024
Previously, list_collections returned a list of Collection objects. This could lead to some errors if any of your collections were created with a custom embedding function (i.e. not the default). So moving forward, list_collections will only return collections names.

For example, if you created all your collections with the OpenAIEmbeddingFunction , this is how you will use list_collections and get_collection correctly:


collection_names = client.list_collections()
ef = OpenAIEmbeddingFunction(...)
collections = [
	client.get_collection(name=name, embedding_function=ef)
	for name in collection_names
]
In the future, we plan on supporting embedding function persistence, so list_collections can return properly configured Collection objects, and you won’t need to supply the correct embedding function to get_collection.

Additionally, we have dropped support for Python 3.8

v0.5.17 - October 30, 2024
We no longer support sending empty lists or dictionaries for metadata filtering, ID filtering, etc. For example,


collection.get(
	ids=["id1", "id2", "id3", ...],
	where={}
)
is not supported. Instead, use:


collection.get(ids=["id1", "id2", "id3", ...])
v0.5.12 - October 8, 2024
The operators $ne (not equal) and $nin (not in) in where clauses have been updated:

Previously: They only matched records that had the specified key.
Now: They also match records that don't have the specified key at all.
In other words, $ne and $nin now match the complement set of records (the exact opposite) that $eq (equals) and $in (in) would match, respectively.

The $not_contains operator in the where_document clause has also been updated:

Previously: It only matched records that had a document field.
Now: It also matches records that don't have a document field at all.
In other words, $not_contains now matches the exact opposite set of records that $contains would match.

RateLimitingProvider is now deprecated and replaced by RateLimitEnforcer. This new interface allows you to wrap server calls with rate limiting logic. The default SimpleRateLimitEnforcer implementation allows all requests, but you can create custom implementations for more advanced rate limiting strategies.

v0.5.11 - September 26, 2024
The results returned by collection.get() is now ordered by internal ids. Whereas previously, the results were ordered by user provided ids, although this behavior was not explicitly documented. We would like to make the change because using user provided ids may not be ideal for performance in hosted Chroma, and we hope to propagate the change to local Chroma for consistency of behavior. In general, newer documents in Chroma has larger internal ids.

A subsequent change in behavior is limit and offset, which depends on the order of returned results. For example, if you have a collection named coll of documents with ids ["3", "2", "1", "0"] inserted in this order, then previously coll.get(limit=2, offset=2)["ids"] gives you ["2", "3"], while currently this will give you ["1", "0"].

We have also modified the behavior of client.get_or_create. Previously, if a collection already existed and the metadata argument was provided, the existing collection's metadata would be overwritten with the new values. This has now changed. If the collection already exists, get_or_create will simply return the existing collection with the specified name, and any additional arguments—including metadata—will be ignored.

Finally, the embeddings returned from collection.get(), collection.query(), and collection.peek() are now represented as 2-dimensional NumPy arrays instead of Python lists. When adding embeddings, you can still use either a Python list or a NumPy array. If your request returns multiple embeddings, the result will be a Python list containing 2-dimensional NumPy arrays. This change is part of our effort to enhance performance in Local Chroma by using NumPy arrays for internal representation of embeddings.

v0.5.6 - September 16, 2024
Chroma internally uses a write-ahead log. In all versions prior to v0.5.6, this log was never pruned. This resulted in the data directory being much larger than it needed to be, as well as the directory size not decreasing by the expected amount after deleting a collection.

In v0.5.6 the write-ahead log is pruned automatically. However, this is not enabled by default for existing databases. After upgrading, you should run chroma utils vacuum once to reduce your database size and enable continuous pruning. See the CLI reference for more details.

This does not need to be run regularly and does not need to be run on new databases created with v0.5.6 or later.

v0.5.1 - June 7, 2024
On the Python client, the max_batch_size property was removed. It wasn't previously documented, but if you were reading it, you should now use get_max_batch_size().

The first time this is run, it makes a HTTP request. We made this a method to make it more clear that it's potentially a blocking operation.

Auth overhaul - April 20, 2024
If you are not using Chroma's built-in auth system, you do not need to take any action.

This release overhauls and simplifies our authentication and authorization systems. If you are you using Chroma's built-in auth system, you will need to update your configuration and any code you wrote to implement your own authentication or authorization providers. This change is mostly to pay down some of Chroma's technical debt and make future changes easier, but it also changes and simplifies user configuration. If you are not using Chroma's built-in auth system, you do not need to take any action.

Previously, Chroma's authentication and authorization relied on many objects with many configuration options, including:

chroma_server_auth_provider
chroma_server_auth_configuration_provider
chroma_server_auth_credentials_provider
chroma_client_auth_credentials_provider
chroma_client_auth_protocol_adapter
and others.

We have consolidated these into three classes:

ClientAuthProvider
ServerAuthenticationProvider
ServerAuthorizationProvider
ClientAuthProviders are now responsible for their own configuration and credential management. Credentials can be given to them with the chroma_client_auth_credentials setting. The value for chroma_client_auth_credentials depends on the ServerAuthenticationProvider; for TokenAuthenticationServerProvider it should just be the token, and for BasicAuthenticationServerProvider it should be username:password.

ServerAuthenticationProviders are responsible for turning a request's authorization information into a UserIdentity containing any information necessary to make an authorization decision. They are now responsible for their own configuration and credential management. Configured via the chroma_server_authn_credentials and chroma_server_authn_credentials_file settings.

ServerAuthorizationProviders are responsible for turning information about the request and the UserIdentity which issued the request into an authorization decision. Configured via the chroma_server_authz_config and chroma_server_authz_config_file settings.

Either _authn_credentials or authn_credentials_file can be set, never both. Same for authz_config and authz_config_file. The value of the config (or data in the config file) will depend on your authn and authz providers. See here for more information.

The two auth systems Chroma ships with are Basic and Token. We have a small migration guide for each.

Basic
If you're using Token auth, your server configuration might look like:


CHROMA_SERVER_AUTH_CREDENTIALS="admin:admin"
CHROMA_SERVER_AUTH_CREDENTIALS_FILE="./example_file"
CHROMA_SERVER_AUTH_CREDENTIALS_PROVIDER="chromadb.auth.providers.HtpasswdConfigurationServerAuthCredentialsProvider"
CHROMA_SERVER_AUTH_PROVIDER="chromadb.auth.basic.BasicAuthServerProvider"
Note: Only one of AUTH_CREDENTIALS and AUTH_CREDENTIALS_FILE can be set, but this guide shows how to migrate both.

And your corresponding client configation:


CHROMA_CLIENT_AUTH_PROVIDER="chromadb.auth.token.TokenAuthClientProvider"
CHROMA_CLIENT_AUTH_CREDENTIALS="admin:admin"
To migrate to the new server configuration, simply change it to:


CHROMA_SERVER_AUTHN_PROVIDER="chromadb.auth.token_authn.TokenAuthenticationServerProvider"
CHROMA_SERVER_AUTHN_CREDENTIALS="test-token"
CHROMA_SERVER_AUTHN_CREDENTIALS_FILE="./example_file"
New client configuration:


CHROMA_CLIENT_AUTH_CREDENTIALS="test-token"
CHROMA_CLIENT_AUTH_PROVIDER="chromadb.auth.basic_authn.BasicAuthClientProvider"
Token
If you're using Token auth, your server configuration might look like:


CHROMA_SERVER_AUTH_CREDENTIALS="test-token"
CHROMA_SERVER_AUTH_CREDENTIALS_FILE="./example_file"
CHROMA_SERVER_AUTH_CREDENTIALS_PROVIDER="chromadb.auth.token.TokenConfigServerAuthCredentialsProvider"
CHROMA_SERVER_AUTH_PROVIDER="chromadb.auth.token.TokenAuthServerProvider"
CHROMA_SERVER_AUTH_TOKEN_TRANSPORT_HEADER="AUTHORIZATION"
Note: Only one of AUTH_CREDENTIALS and AUTH_CREDENTIALS_FILE can be set, but this guide shows how to migrate both.

And your corresponding client configation:


CHROMA_CLIENT_AUTH_PROVIDER="chromadb.auth.token.TokenAuthClientProvider"
CHROMA_CLIENT_AUTH_CREDENTIALS="test-token"
CHROMA_CLIENT_AUTH_TOKEN_TRANSPORT_HEADER="AUTHORIZATION"
To migrate to the new server configuration, simply change it to:


CHROMA_SERVER_AUTHN_PROVIDER="chromadb.auth.token_authn.TokenAuthenticationServerProvider"
CHROMA_SERVER_AUTHN_CREDENTIALS="test-token"
CHROMA_SERVER_AUTHN_CREDENTIALS_FILE="./example_file"
CHROMA_AUTH_TOKEN_TRANSPORT_HEADER="AUTHORIZATION"
New client configuration:


CHROMA_CLIENT_AUTH_CREDENTIALS="test-token"
CHROMA_CLIENT_AUTH_PROVIDER="chromadb.auth.token_authn.TokenAuthClientProvider"
CHROMA_AUTH_TOKEN_TRANSPORT_HEADER="AUTHORIZATION"
Reference of changed configuration values
Overall config
chroma_client_auth_token_transport_header: renamed to chroma_auth_token_transport_header.
chroma_server_auth_token_transport_header: renamed to chroma_auth_token_transport_header.
Client config
chroma_client_auth_credentials_provider: deleted. Functionality is now in chroma_client_auth_provider.
chroma_client_auth_protocol_adapter: deleted. Functionality is now in chroma_client_auth_provider.
chroma_client_auth_credentials_file: deleted. Functionality is now in chroma_client_auth_credentials.
These changes also apply to the Typescript client.
Server authn
chroma_server_auth_provider: Renamed to chroma_server_authn_provider.
chroma_server_auth_configuration_provider: deleted. Functionality is now in chroma_server_authn_provider.
chroma_server_auth_credentials_provider: deleted. Functionality is now in chroma_server_authn_provider.
chroma_server_auth_credentials_file: renamed to chroma_server_authn_credentials_file.
chroma_server_auth_credentials: renamed to chroma_server_authn_credentials.
chroma_server_auth_configuration_file: renamed to chroma_server_authn_configuration_file.
Server authz
chroma_server_authz_ignore_paths: deleted. Functionality is now in chroma_server_auth_ignore_paths.
To see the full changes, you can read the PR or reach out to the Chroma team on Discord.

Migration to 0.4.16 - November 7, 2023
This release adds support for multi-modal embeddings, with an accompanying change to the definitions of EmbeddingFunction. This change mainly affects users who have implemented their own EmbeddingFunction classes. If you are using Chroma's built-in embedding functions, you do not need to take any action.

EmbeddingFunction

Previously, EmbeddingFunctions were defined as:


class EmbeddingFunction(Protocol):
    def __call__(self, texts: Documents) -> Embeddings:
        ...
After this update, EmbeddingFunctions are defined as:


Embeddable = Union[Documents, Images]
D = TypeVar("D", bound=Embeddable, contravariant=True)

class EmbeddingFunction(Protocol[D]):
    def __call__(self, input: D) -> Embeddings:
        ...
The key differences are:

EmbeddingFunction is now generic, and takes a type parameter D which is a subtype of Embeddable. This allows us to define EmbeddingFunctions which can embed multiple modalities.
__call__ now takes a single argument, input, to support data of any type D. The texts argument has been removed.
Migration from >0.4.0 to 0.4.0 - July 17, 2023
What's new in this version?

New easy way to create clients
Changed storage method
.persist() removed, .reset() no longer on by default
New Clients


### in-memory ephemeral client

# before
import chromadb
client = chromadb.Client()

# after
import chromadb
client = chromadb.EphemeralClient()


### persistent client

# before
import chromadb
from chromadb.config import Settings
client = chromadb.Client(Settings(
    chroma_db_impl="duckdb+parquet",
    persist_directory="/path/to/persist/directory" # Optional, defaults to .chromadb/ in the current directory
))

# after
import chromadb
client = chromadb.PersistentClient(path="/path/to/persist/directory")


### http client (to talk to server backend)

# before
import chromadb
from chromadb.config import Settings
client = chromadb.Client(Settings(chroma_api_impl="rest",
                                        chroma_server_host="localhost",
                                        chroma_server_http_port="8000"
                                    ))

# after
import chromadb
client = chromadb.HttpClient(host="localhost", port="8000")

You can still also access the underlying .Client() method. If you want to turn off telemetry, all clients support custom settings:


import chromadb
from chromadb.config import Settings
client = chromadb.PersistentClient(
    path="/path/to/persist/directory",
    settings=Settings(anonymized_telemetry=False))
New data layout

This version of Chroma drops duckdb and clickhouse in favor of sqlite for metadata storage. This means migrating data over. We have created a migration CLI utility to do this.

If you upgrade to 0.4.0 and try to access data stored in the old way, you will see this error message

You are using a deprecated configuration of Chroma. Please pip install chroma-migrate and run chroma-migrate to upgrade your configuration. See https://docs.trychroma.com/deployment/migration for more information or join our discord at https://discord.gg/MMeYNTmh3x for help!

Here is how to install and use the CLI:


pip install chroma-migrate
chroma-migrate


If you need any help with this migration, please reach out! We are on Discord ready to help.

Persist & Reset

.persist() was in the old version of Chroma because writes were only flushed when forced to. Chroma 0.4.0 saves all writes to disk instantly and so persist is no longer needed.

.reset(), which resets the entire database, used to by enabled-by-default which felt wrong. 0.4.0 has it disabled-by-default. You can enable it again by passing allow_reset=True to a Settings object. For example:


import chromadb
from chromadb.config import Settings
client = chromadb.PersistentClient(path="./path/to/chroma", settings=Settings(allow_reset=True))
Telemetry

Troubleshooting

Edit this page on GitHub

Ask this Page

On this page
Migration
Migration Log
v1.0.0 - March 1, 2025
v0.6.0 - December 30, 2024
v0.5.17 - October 30, 2024
v0.5.12 - October 8, 2024
v0.5.11 - September 26, 2024
v0.5.6 - September 16, 2024
v0.5.1 - June 7, 2024
Auth overhaul - April 20, 2024
Basic
Token
Reference of changed configuration values
Migration to 0.4.16 - November 7, 2023
Migration from >0.4.0 to 0.4.0 - July 17, 2023
Migration - Chroma Docs

Apollo.io
707 online
24k

22.7k


Toggle theme













































Troubleshooting
This page is a list of common gotchas or issues and how to fix them.

If you don't see your problem listed here, please also search the Github Issues.

Chroma JS-Client failures on NextJS projects#
Our default embedding function uses @huggingface/transformers, which depends on binaries that NextJS fails to bundle. If you are running into this issue, you can wrap your nextConfig (in next.config.ts) with the withChroma plugin, which will add the required settings to overcome the bundling issues.


import type { NextConfig } from "next";
import { withChroma } from "chromadb";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withChroma(nextConfig);
Cannot return the results in a contiguous 2D array. Probably ef or M is too small#
This error happens when the HNSW index fails to retrieve the requested number of results for a query, given its structure and your data. he way to resolve this is to either decrease the number of results you request from a query (n_result), or increase the HNSW parameters M, ef_construction, and ef_search. You can read more about HNSW configurations here.

Using .get or .query, embeddings say None
This is actually not an error. Embeddings are quite large and heavy to send back. Most application don't use the underlying embeddings and so, by default, chroma does not send them back.

To send them back: add include=["embeddings", "documents", "metadatas", "distances"] to your query to return all information.

For example:


results = collection.query(
    query_texts="hello",
    n_results=1,
    include=["embeddings", "documents", "metadatas", "distances"],
)
We may change None to something else to more clearly communicate why they were not returned.

Build error when running pip install chromadb
If you encounter an error like this during setup

Failed to build hnswlib
ERROR: Could not build wheels for hnswlib, which is required to install pyproject.toml-based projects
Try these few tips from the community:

If you get the error: clang: error: the clang compiler does not support '-march=native', set this ENV variable, export HNSWLIB_NO_NATIVE=1
If on Mac, install/update xcode dev tools, xcode-select --install
If on Windows, try these steps
SQLite#
Chroma requires SQLite > 3.35, if you encounter issues with having too low of a SQLite version please try the following.

Install the latest version of Python 3.10, sometimes lower versions of python are bundled with older versions of SQLite.
If you are on a Linux system, you can install pysqlite3-binary, pip install pysqlite3-binary and then override the default sqlite3 library before running Chroma with the steps here. Alternatively you can compile SQLite from scratch and replace the library in your python installation with the latest version as documented here.
If you are on Windows, you can manually download the latest version of SQLite from https://www.sqlite.org/download.html and replace the DLL in your python installation's DLLs folder with the latest version. You can find your python installation path by running os.path.dirname(sys.executable) in python.
If you are using a Debian based Docker container, older Debian versions do not have an up to date SQLite, please use bookworm or higher.
Illegal instruction (core dumped)#
If you encounter an error like this during setup and are using Docker - you may have built the library on a machine with a different CPU architecture than the one you are running it on. Try rebuilding the Docker image on the machine you are running it on.

My data directory is too large#
If you were using Chroma prior to v0.5.6, you may be able to significantly shrink your database by vacuuming it. After vacuuming once, automatic pruning (a new feature in v0.5.6) is enabled and will keep your database size in check.

Migration

About

Edit this page on GitHub

Ask this Page

On this page
Troubleshooting
Chroma JS-Client failures on NextJS projects
Cannot return the results in a contiguous 2D array. Probably ef or M is too small
Using .get or .query, embeddings say
Build error when running
SQLite
Illegal instruction (core dumped)
My data directory is too large
Troubleshooting - Chroma Docs

Apollo.io
707 online
24k

22.7k


Toggle theme













































About
We are hiring software engineers and applied research scientists. View open roles

Who we are#
Chroma as a project is coordinated by a small team of full-time employees who work at a company also called Chroma.

We work in the sunny Mission District in San Francisco.

Chroma was co-founded by Jeff Huber (left, CEO) and Anton Troynikov (right, now Advisor).



Our commitment to open source#
Chroma is a company that builds the open-source project also called Chroma.

We are committed to building open source software because we believe in the flourishing of humanity that will be unlocked through the democratization of robust, safe, and aligned AI systems. These tools need to be available to a new developer just starting in ML as well as the organizations that scale ML to millions (and billions) of users. Open source is about expanding the horizon of what’s possible.

Chroma is a commercial open source company. What does that mean? We believe that organizing financially sustainable teams of people to work to manage, push and integrate the project enriches the health of the project and the community.

It is important that our values around this are very clear!

We are committed to building Chroma as a ubiquitous open source standard
A successful Chroma-based commercial product is essential for the success of the technology, and is a win-win for everyone. Simply put, many organizations will not adopt Chroma without the option of a commercially hosted solution; and the project must be backed by a company with a viable business model. We want to build an awesome project and an awesome business.
We will decide what we provide exclusively in the commercial product based on clear, consistent criteria.
What code will be open source? As a general rule, any feature which an individual developer would find useful will be 100% open source forever. This approach, popularized by Gitlab, is called buyer-based open source. We believe that this is essential to accomplishing our mission.

Currently we don’t have any specific plans to monetize Chroma, we are working on a hosted service that will be launched as a free technical preview to make it easier for developers to get going. We are 100% focused on building valuable open source software with the community and for the community.

Our investors#
Chroma raised an $18M seed round led by Astasia Myers from Quiet Capital. Joining the round are angels including Naval Ravikant, Max and Jack Altman, Jordan Tigani (Motherduck), Guillermo Rauch (Vercel), Akshay Kothari (Notion), Amjad Masad (Replit), Spencer Kimball (CockroachDB), and other founders and leaders from ScienceIO, Gumroad, MongoDB, Scale, Hugging Face, Jasper and more.

chroma-investors

Chroma raised a pre-seed in May 2022, led by Anthony Goldbloom (Kaggle) from AIX Ventures, James Cham from Bloomberg Beta, and Nat Friedman and Daniel Gross (AI Grant).

We're excited to work with a deep set of investors and enterpreneurs who have invested in and built some of the most successful open-source projects in the world.

Troubleshooting

Ephemeral Client

Edit this page on GitHub

Ask this Page

On this page
About
Who we are
Our commitment to open source
Our investors
About - Chroma Docs

Apollo.io
707 online
24k

22.7k


Toggle theme













































Ephemeral Client
In Python, you can run a Chroma server in-memory and connect to it with the ephemeral client:


import chromadb

client = chromadb.EphemeralClient()
The EphemeralClient() method starts a Chroma server in-memory and also returns a client with which you can connect to it.

This is a great tool for experimenting with different embedding functions and retrieval techniques in a Python notebook, for example. If you don't need data persistence, the ephemeral client is a good choice for getting up and running with Chroma.

About

Persistent Client

Edit this page on GitHub

Ask this Page

On this page
Ephemeral Client
Ephemeral Client - Chroma Docs

Apollo.io
707 online
24k

22.7k


Toggle theme













































Persistent Client
You can configure Chroma to save and load the database from your local machine, using the PersistentClient.

Data will be persisted automatically and loaded on start (if it exists).


import chromadb

client = chromadb.PersistentClient(path="/path/to/save/to")
The path is where Chroma will store its database files on disk, and load them on start. If you don't provide a path, the default is .chroma

The client object has a few useful convenience methods.

heartbeat() - returns a nanosecond heartbeat. Useful for making sure the client remains connected.
reset() - empties and completely resets the database. ⚠️ This is destructive and not reversible.

client.heartbeat()
client.reset()
Ephemeral Client

Client-Server Mode

Edit this page on GitHub

Ask this Page

On this page
Persistent Client
Persistent Client - Chroma Docs

Apollo.io
707 online
24k

22.7k


Toggle theme













































Running Chroma in Client-Server Mode
Chroma can also be configured to run in client/server mode. In this mode, the Chroma client connects to a Chroma server running in a separate process.

To start the Chroma server, run the following command:


chroma run --path /db_path
Then use the Chroma HttpClient to connect to the server:


import chromadb

chroma_client = chromadb.HttpClient(host='localhost', port=8000)
That's it! Chroma's API will run in client-server mode with just this change.

Chroma also provides the async HTTP client. The behaviors and method signatures are identical to the synchronous client, but all methods that would block are now async. To use it, call AsyncHttpClient instead:


import asyncio
import chromadb

async def main():
    client = await chromadb.AsyncHttpClient()

    collection = await client.create_collection(name="my_collection")
    await collection.add(
        documents=["hello world"],
        ids=["id1"]
    )

asyncio.run(main())
If you deploy your Chroma server, you can also use our http-only package.

Persistent Client

Cloud Client

Edit this page on GitHub

Ask this Page

On this page
Running Chroma in Client-Server Mode
Client-Server Mode - Chroma Docs

Apollo.io
707 online
24k

22.7k


Toggle theme













































Cloud Client
You can use the CloudClient to create a client connecting to Chroma Cloud.


client = CloudClient(
    tenant='Tenant ID',
    database='Database name',
    api_key='Chroma Cloud API key'
)
The CloudClient can be instantiated just with the API key argument. In which case, we will resolve the tenant and DB from Chroma Cloud. Note our auto-resolution will work only if the provided API key is scoped to a single DB.

If you set the CHROMA_API_KEY, CHROMA_TENANT, and the CHROMA_DATABASE environment variables, you can simply instantiate a CloudClient with no arguments:


client = CloudClient()
Client-Server Mode

Manage Collections

Edit this page on GitHub

Ask this Page

On this page
Cloud Client
Cloud Client - Chroma Docs

Apollo.io
707 online
24k

22.7k


Toggle theme













































Managing Chroma Collections
Chroma lets you manage collections of embeddings, using the collection primitive. Collections are the fundamental unit of storage and querying in Chroma.

Creating Collections#
Chroma collections are created with a name. Collection names are used in the url, so there are a few restrictions on them:

The length of the name must be between 3 and 512 characters.
The name must start and end with a lowercase letter or a digit, and it can contain dots, dashes, and underscores in between.
The name must not contain two consecutive dots.
The name must not be a valid IP address.

collection = client.create_collection(name="my_collection")
Note that collection names must be unique inside a Chroma database. If you try to create a collection with a name of an existing one, you will see an exception.

Embedding Functions
When you add documents to a collection, Chroma will embed them for you by using the collection's embedding function. Chroma will use sentence transformer embedding function as a default.

Chroma also offers various embedding function, which you can provide upon creating a collection. For example, you can create a collection using the OpenAIEmbeddingFunction:

Install the openai package:


pip install openai
Create your collection with the OpenAIEmbeddingFunction:


import os
from chromadb.utils.embedding_functions import OpenAIEmbeddingFunction

collection = client.create_collection(
    name="my_collection",
    embedding_function=OpenAIEmbeddingFunction(
        api_key=os.getenv("OPENAI_API_KEY"),
        model_name="text-embedding-3-small"
    )
)
Instead of having Chroma embed documents, you can also provide embeddings directly when adding data to a collection. In this case, your collection will not have an embedding function set, and you will be responsible for providing embeddings directly when adding data and querying.


collection = client.create_collection(
    name="my_collection",
    embedding_function=None
)
Collection Metadata
When creating collections, you can pass the optional metadata argument to add a mapping of metadata key-value pairs to your collections. This can be useful for adding general about the collection like creation time, description of the data stored in the collection, and more.


from datetime import datetime

collection = client.create_collection(
    name="my_collection",
    embedding_function=emb_fn,
    metadata={
        "description": "my first Chroma collection",
        "created": str(datetime.now())
    }
)
Getting Collections#
There are several ways to get a collection after it was created.

The get_collection function will get a collection from Chroma by name. It returns a Collection object with name, metadata, configuration, and embedding_function.


collection = client.get_collection(name="my-collection")
The get_or_create_collection function behaves similarly, but will create the collection if it doesn't exist. You can pass to it the same arguments create_collection expects, and the client will ignore them if the collection already exists.


collection = client.get_or_create_collection(
    name="my-collection",
    metadata={"description": "..."}
)
The list_collections function returns the collections you have in your Chroma database. The collections will be ordered by creation time from oldest to newest.


collections = client.list_collections()
By default, list_collections returns up to 100 collections. If you have more than 100 collections, or need to get only a subset of your collections, you can use the limit and offset arguments:


first_collections_batch = client.list_collections(limit=100) # get the first 100 collections
second_collections_batch = client.list_collections(limit=100, offset=100) # get the next 100 collections
collections_subset = client.list_collections(limit=20, offset=50) # get 20 collections starting from the 50th
Current versions of Chroma store the embedding function you used to create a collection on the server, so the client can resolve it for you on subsequent "get" operations. If you are running an older version of the Chroma client or server (<1.1.13), you will need to provide the same embedding function you used to create a collection when using get_collection:


collection = client.get_collection(
    name='my-collection',
    embedding_function=ef
)
Modifying Collections#
After a collection is created, you can modify its name, metadata and elements of its index configuration with the modify method:


collection.modify(
   name="new-name",
   metadata={"description": "new description"}
)
Deleting Collections#
You can delete a collection by name. This action will delete a collection, all of its embeddings, and associated documents and records' metadata.

Deleting collections is destructive and not reversible


client.delete_collection(name="my-collection")
Convenience Methods#
Collections also offer a few useful convenience methods:

count - returns the number of records in the collection.
peek - returns the first 10 records in the collection.

collection.count()
collection.peek()
Cloud Client

Add Data

Edit this page on GitHub

Ask this Page

On this page
Managing Chroma Collections
Creating Collections
Embedding Functions
Collection Metadata
Getting Collections
Modifying Collections
Deleting Collections
Convenience Methods
Manage Collections - Chroma Docs

Apollo.io
707 online
24k

22.7k


Toggle theme













































Adding Data to Chroma Collections
Add data to a Chroma collection with the .add method. It takes a list of unique string ids, and a list of documents. Chroma will embed these documents for you using the collection's embedding function. It will also store the documents themselves. You can optionally provide a metadata dictionary for each document you add.


collection.add(
    ids=["id1", "id2", "id3", ...],
    documents=["lorem ipsum...", "doc2", "doc3", ...],
    metadatas=[{"chapter": 3, "verse": 16}, {"chapter": 3, "verse": 5}, {"chapter": 29, "verse": 11}, ...],
)
If you add a record with an ID that already exists in the collection, it will be ignored and no exception will be raised. This means that if a batch add operation fails, you can safely run it again.

Alternatively, you can supply a list of document-associated embeddings directly, and Chroma will store the associated documents without embedding them itself. Note that in this case there will be no guarantee that the embedding is mapped to the document associated with it.


collection.add(
    ids=["id1", "id2", "id3", ...],
    embeddings=[[1.1, 2.3, 3.2], [4.5, 6.9, 4.4], [1.1, 2.3, 3.2], ...],
    documents=["doc1", "doc2", "doc3", ...],
    metadatas=[{"chapter": 3, "verse": 16}, {"chapter": 3, "verse": 5}, {"chapter": 29, "verse": 11}, ...],

)
If the supplied embeddings are not the same dimension as the embeddings already indexed in the collection, an exception will be raised.

You can also store documents elsewhere, and just supply a list of embeddings and metadata to Chroma. You can use the ids to associate the embeddings with your documents stored elsewhere.


collection.add(
    embeddings=[[1.1, 2.3, 3.2], [4.5, 6.9, 4.4], [1.1, 2.3, 3.2], ...],
    metadatas=[{"chapter": 3, "verse": 16}, {"chapter": 3, "verse": 5}, {"chapter": 29, "verse": 11}, ...],
    ids=["id1", "id2", "id3", ...]
)
Manage Collections

Update Data

Edit this page on GitHub

Ask this Page

On this page
Adding Data to Chroma Collections
Add Data - Chroma Docs

Apollo.io
707 online
24k

22.7k


Toggle theme













































Updating Data in Chroma Collections
Any property of records in a collection can be updated with .update:


collection.update(
    ids=["id1", "id2", "id3", ...],
    embeddings=[[1.1, 2.3, 3.2], [4.5, 6.9, 4.4], [1.1, 2.3, 3.2], ...],
    metadatas=[{"chapter": 3, "verse": 16}, {"chapter": 3, "verse": 5}, {"chapter": 29, "verse": 11}, ...],
    documents=["doc1", "doc2", "doc3", ...],
)
If an id is not found in the collection, an error will be logged and the update will be ignored. If documents are supplied without corresponding embeddings, the embeddings will be recomputed with the collection's embedding function.

If the supplied embeddings are not the same dimension as the collection, an exception will be raised.

Chroma also supports an upsert operation, which updates existing items, or adds them if they don't yet exist.


collection.upsert(
    ids=["id1", "id2", "id3", ...],
    embeddings=[[1.1, 2.3, 3.2], [4.5, 6.9, 4.4], [1.1, 2.3, 3.2], ...],
    metadatas=[{"chapter": 3, "verse": 16}, {"chapter": 3, "verse": 5}, {"chapter": 29, "verse": 11}, ...],
    documents=["doc1", "doc2", "doc3", ...],
)
If an id is not present in the collection, the corresponding items will be created as per add. Items with existing ids will be updated as per update.

Add Data

Delete Data

Edit this page on GitHub

Ask this Page

On this page
Updating Data in Chroma Collections
Update Data - Chroma Docs

Apollo.io
707 online
24k

22.7k


Toggle theme













































Deleting Data from Chroma Collections
Chroma supports deleting items from a collection by id using .delete. The embeddings, documents, and metadata associated with each item will be deleted.

Naturally, this is a destructive operation, and cannot be undone.


collection.delete(
    ids=["id1", "id2", "id3",...],
)
.delete also supports the where filter. If no ids are supplied, it will delete all items in the collection that match the where filter.


collection.delete(
    ids=["id1", "id2", "id3",...],
	where={"chapter": "20"}
)
Update Data

Configure

Edit this page on GitHub

Ask this Page

On this page
Deleting Data from Chroma Collections
Delete Data - Chroma Docs

Apollo.io
707 online
24k

22.7k


Toggle theme













































Configuring Chroma Collections
Chroma collections have a configuration that determines how their embeddings index is constructed and used. We use default values for these index configurations that should give you great performance for most use cases out-of-the-box.

The embedding function you choose to use in your collection also affects its index construction, and is included in the configuration.

When you create a collection, you can customize these index configuration values for different data, accuracy and performance requirements. Some query-time configurations can also be customized after the collection's creation using the .modify function.

HNSW Index Configuration#
In Single Node Chroma collections, we use an HNSW (Hierarchical Navigable Small World) index to perform approximate nearest neighbor (ANN) search.

What is an HNSW index?
The HNSW index parameters include:

space defines the distance function of the embedding space, and hence how similarity is defined. The default is l2 (squared L2 norm), and other possible values are cosine (cosine similarity), and ip (inner product).
Distance	parameter	Equation	Intuition
Squared L2	l2	
d
=
∑
(
A
i
−
B
i
)
2
d=∑(A 
i
​
 −B 
i
​
 ) 
2
 	measures absolute geometric distance between vectors, making it suitable when you want true spatial proximity.
Inner product	ip	
d
=
1.0
−
∑
(
A
i
×
B
i
)
d=1.0−∑(A 
i
​
 ×B 
i
​
 )	focuses on vector alignment and magnitude, often used for recommendation systems where larger values indicate stronger preferences
Cosine similarity	cosine	
d
=
1.0
−
∑
(
A
i
×
B
i
)
∑
(
A
i
2
)
⋅
∑
(
B
i
2
)
d=1.0− 
∑(A 
i
2
​
 )
​
 ⋅ 
∑(B 
i
2
​
 )
​
 
∑(A 
i
​
 ×B 
i
​
 )
​
 	measures only the angle between vectors (ignoring magnitude), making it ideal for text embeddings or cases where you care about direction rather than scale
You should make sure that the space you choose is supported by your collection's embedding function. Every Chroma embedding function specifies its default space and a list of supported spaces.

ef_construction determines the size of the candidate list used to select neighbors during index creation. A higher value improves index quality at the cost of more memory and time, while a lower value speeds up construction with reduced accuracy. The default value is 100.
ef_search determines the size of the dynamic candidate list used while searching for the nearest neighbors. A higher value improves recall and accuracy by exploring more potential neighbors but increases query time and computational cost, while a lower value results in faster but less accurate searches. The default value is 100. This field can be modified after creation.
max_neighbors is the maximum number of neighbors (connections) that each node in the graph can have during the construction of the index. A higher value results in a denser graph, leading to better recall and accuracy during searches but increases memory usage and construction time. A lower value creates a sparser graph, reducing memory usage and construction time but at the cost of lower search accuracy and recall. The default value is 16.
num_threads specifies the number of threads to use during index construction or search operations. The default value is multiprocessing.cpu_count() (available CPU cores). This field can be modified after creation.
batch_size controls the number of vectors to process in each batch during index operations. The default value is 100. This field can be modified after creation.
sync_threshold determines when to synchronize the index with persistent storage. The default value is 1000. This field can be modified after creation.
resize_factor controls how much the index grows when it needs to be resized. The default value is 1.2. This field can be modified after creation.
For example, here we create a collection with customized values for space and ef_construction:


collection = client.create_collection(
    name="my-collection",
    embedding_function=OpenAIEmbeddingFunction(model_name="text-embedding-3-small"),
    configuration={
        "hnsw": {
            "space": "cosine",
            "ef_construction": 200
        }
    }
)
Fine-Tuning HNSW Parameters
In the context of approximate nearest neighbors search, recall refers to how many of the true nearest neighbors were retrieved.

Increasing ef_search normally improves recall, but slows down query time. Similarly, increasing ef_construction improves recall, but increases the memory usage and runtime when creating the index.

Choosing the right values for your HNSW parameters depends on your data, embedding function, and requirements for recall, and performance. You may need to experiment with different construction and search values to find the values that meet your requirements.

For example, for a dataset with 50,000 embeddings of 2048 dimensions, generated by


embeddings = np.random.randn(50000, 2048).astype(np.float32).tolist()
we set up two Chroma collections:

The first is configured with ef_search: 10. When querying using a specific embedding from the set (with id = 1), the query takes 0.00529 seconds, and we get back embeddings with distances:
[3629.019775390625, 3666.576904296875, 3684.57080078125]
The second collection is configured with ef_search: 100 and ef_construction: 1000. When issuing the same query, this time it takes 0.00753 seconds (about 42% slower), but with better results as measured by their distance:
[0.0, 3620.593994140625, 3623.275390625]
In this example, when querying with the test embedding (id=1), the first collection failed to find the embedding itself, despite it being in the collection (where it should have appeared as a result with a distance of 0.0). The second collection, while slightly slower, successfully found the query embedding itself (shown by the 0.0 distance) and returned closer neighbors overall, demonstrating better accuracy at the cost of performance.

Embedding Function Configuration#
The embedding function you choose when creating a collection, along with the parameters you instantiate it with, is persisted in the collection's configuration. This allows us to reconstruct it correctly when you use collection across different clients.

You can set your embedding function as an argument to the "create" methods, or directly in the configuration:

Install the openai and cohere packages:


pip install openai cohere
Creating collections with embedding function and custom configuration:


import os
from chromadb.utils.embedding_functions import OpenAIEmbeddingFunction, CohereEmbeddingFunction

# Using the `embedding_function` argument
openai_collection = client.create_collection(
    name="my_openai_collection",
    embedding_function=OpenAIEmbeddingFunction(
        model_name="text-embedding-3-small"
    ),
    configuration={"hnsw": {"space": "cosine"}}
)

# Setting `embedding_function` in the collection's `configuration`
cohere_collection = client.get_or_create_collection(
    name="my_cohere_collection",
    configuration={
        "embedding_function": CohereEmbeddingFunction(
            model_name="embed-english-light-v2.0",
            truncate="NONE"
        ),
        "hnsw": {"space": "cosine"}
    }
)
Note: Many embedding functions require API keys to interface with the third party embeddings providers. The Chroma embedding functions will automatically look for the standard environment variable used to store a provider's API key. For example, the Chroma OpenAIEmbeddingFunction will set its api_key argument to the value of the OPENAI_API_KEY environment variable if it is set.

If your API key is stored in an environment variable with a non-standard name, you can configure your embedding function to use your custom environment variable by setting the api_key_env_var argument. In order for the embedding function to operate correctly, you will have to set this variable in every environment where you use your collection.


cohere_ef = CohereEmbeddingFunction(
    api_key_env_var="MY_CUSTOM_COHERE_API_KEY",
    model_name="embed-english-light-v2.0",
    truncate="NONE",
)
Delete Data

Query And Get

Edit this page on GitHub

Ask this Page

On this page
Configuring Chroma Collections
HNSW Index Configuration
Fine-Tuning HNSW Parameters
SPANN Index Configuration
Embedding Function Configuration
Configure - Chroma Docs

Apollo.io
707 online
24k

22.7k


Toggle theme













































Query and Get Data from Chroma Collections
New Search API Available: Chroma Cloud users can now use the powerful Search API for advanced hybrid search capabilities with better filtering, ranking, and batch operations.

You can query a Chroma collection to run a similarity search using the .query method:


collection.query(
    query_texts=["thus spake zarathustra", "the oracle speaks"]
)
Chroma will use the collection's embedding function to embed your text queries, and use the output to run a vector similarity search against your collection.

Instead of provided query_texts, you can provide query embeddings directly. You will be required to do so if you also added embeddings directly to your collection, instead of using its embedding function. If the provided query embeddings are not of the same dimensions as those in your collection, an exception will be raised.


collection.query(
    query_embeddings=[[11.1, 12.1, 13.1],[1.1, 2.3, 3.2], ...]
)
By default, Chroma will return 10 results per input query. You can modify this number using the n_results argument:


collection.query(
    query_embeddings=[[11.1, 12.1, 13.1],[1.1, 2.3, 3.2], ...],
    n_results=5
)
The ids argument lets you constrain the search only to records with the IDs from the provided list:


collection.query(
    query_embeddings=[[11.1, 12.1, 13.1],[1.1, 2.3, 3.2], ...],
    n_results=5,
    ids=["id1", "id2"]
)
You can also retrieve records from a collection by using the .get method. It supports the following arguments:

ids - get records with IDs from this list. If not provided, the first 100 records will be retrieved, in the order of their addition to the collection.
limit - the number of records to retrieve. The default value is 100.
offset - The offset to start returning results from. Useful for paging results with limit. The default value is 0.

collection.get(ids=["id1", "ids2", ...])
Both query and get have the where argument for metadata filtering and where_document for full-text search and regex:


collection.query(
    query_embeddings=[[11.1, 12.1, 13.1],[1.1, 2.3, 3.2], ...],
    n_results=5,
    where={"page": 10}, # query records with metadata field 'page' equal to 10
    where_document={"$contains": "search string"} # query records with the search string in the records' document
)
Results Shape#
Chroma returns .query and .get results in columnar form. You will get a results object containing lists of ids, embeddings, documents, and metadatas of the records that matched your .query or get requests. Embeddings are returned as 2D-numpy arrays.


class QueryResult(TypedDict):
    ids: List[IDs]
    embeddings: Optional[List[Embeddings]],
    documents: Optional[List[List[Document]]]
    metadatas: Optional[List[List[Metadata]]]
    distances: Optional[List[List[float]]]
    included: Include

class GetResult(TypedDict):
    ids: List[ID]
    embeddings: Optional[Embeddings],
    documents: Optional[List[Document]],
    metadatas: Optional[List[Metadata]]
    included: Include
.query results also contain a list of distances. These are the distances of each of the results from your input queries. .query results are also indexed by each of your input queries. For example, results["ids"][0] contains the list of records IDs for the results of the first input query.


results = collection.query(query_texts=["first query", "second query"])
Choosing Which Data is Returned#
By default, .query and .get always return the documents and metadatas. You can use the include argument to modify what gets returned. ids are always returned:


collection.query(query_texts=["my query"]) # 'ids', 'documents', and 'metadatas' are returned

collection.get(include=["documents"]) # Only 'ids' and 'documents' are returned

collection.query(
    query_texts=["my query"],
    include=["documents", "metadatas", "embeddings"]
) # 'ids', 'documents', 'metadatas', and 'embeddings' are returned
Configure

Metadata Filtering

Edit this page on GitHub

Ask this Page

On this page
Query and Get Data from Chroma Collections
Results Shape
Choosing Which Data is Returned
Results Shape
Choosing Which Data is Returned
Query and Get - Chroma Docs

Apollo.io
707 online
24k

22.7k


Toggle theme













































Metadata Filtering
The where argument in get and query is used to filter records by their metadata. For example, in this query operation, Chroma will only query records that have the page metadata field with the value 10:


collection.query(
    query_texts=["first query", "second query"],
    where={"page": 10}
)
In order to filter on metadata, you must supply a where filter dictionary to the query. The dictionary must have the following structure:


{
    "metadata_field": {
        <Operator>: <Value>
    }
}
Using the $eq operator is equivalent to using the metadata field directly in your where filter.


{
    "metadata_field": "search_string"
}

# is equivalent to

{
    "metadata_field": {
        "$eq": "search_string"
    }
}
For example, here we query all records whose page metadata field is greater than 10:


collection.query(
    query_texts=["first query", "second query"],
    where={"page": { "$gt": 10 }}
)
Using Logical Operators#
You can also use the logical operators $and and $or to combine multiple filters.

An $and operator will return results that match all the filters in the list.


{
    "$and": [
        {
            "metadata_field": {
                <Operator>: <Value>
            }
        },
        {
            "metadata_field": {
                <Operator>: <Value>
            }
        }
    ]
}
For example, here we query all records whose page metadata field is between 5 and 10:


collection.query(
    query_texts=["first query", "second query"],
    where={
        "$and": [
            {"page": {"$gte": 5 }},
            {"page": {"$lte": 10 }},
        ]
    }
)
An $or operator will return results that match any of the filters in the list.


{
    "or": [
        {
            "metadata_field": {
                <Operator>: <Value>
            }
        },
        {
            "metadata_field": {
                <Operator>: <Value>
            }
        }
    ]
}
For example, here we get all records whose color metadata field is red or blue:


collection.get(
    where={
        "or": [
            {"color": "red"},
            {"color": "blue"},
        ]
    }
)
Using Inclusion Operators#
The following inclusion operators are supported:

$in - a value is in predefined list (string, int, float, bool)
$nin - a value is not in predefined list (string, int, float, bool)
An $in operator will return results where the metadata attribute is part of a provided list:


{
  "metadata_field": {
    "$in": ["value1", "value2", "value3"]
  }
}
An $nin operator will return results where the metadata attribute is not part of a provided list (or the attribute's key is not present):


{
  "metadata_field": {
    "$nin": ["value1", "value2", "value3"]
  }
}
For example, here we get all records whose author metadata field is in a list of possible values:


collection.get(
    where={
       "author": {"$in": ["Rowling", "Fitzgerald", "Herbert"]}
    }
)
Combining with Document Search#
.get and .query can handle metadata filtering combined with document search:


collection.query(
    query_texts=["doc10", "thus spake zarathustra", ...],
    n_results=10,
    where={"metadata_field": "is_equal_to_this"},
    where_document={"$contains":"search_string"}
)
Query And Get

Full Text Search and Regex

Edit this page on GitHub

Ask this Page

On this page
Metadata Filtering
Using Logical Operators
Using Inclusion Operators
Combining with Document Search
Metadata Filtering - Chroma Docs

Apollo.io
696 online
24k

22.7k


Toggle theme













































Full Text Search and Regex
The where_document argument in get and query is used to filter records based on their document content.

We support full-text search with the $contains and $not_contains operators. We also support regular expression pattern matching with the $regex and $not_regex operators.

For example, here we get all records whose document contains a search string:


collection.get(
   where_document={"$contains": "search string"}
)
Note: Full-text search is case-sensitive.

Here we get all records whose documents matches the regex pattern for an email address:


collection.get(
   where_document={
       "$regex": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
   }
)
Using Logical Operators#
You can also use the logical operators $and and $or to combine multiple filters.

An $and operator will return results that match all the filters in the list:


collection.query(
    query_texts=["query1", "query2"],
    where_document={
        "$and": [
            {"$contains": "search_string_1"},
            {"$regex": "[a-z]+"},
        ]
    }
)
An $or operator will return results that match any of the filters in the list:


collection.query(
    query_texts=["query1", "query2"],
    where_document={
        "$or": [
            {"$contains": "search_string_1"},
            {"$not_contains": "search_string_2"},
        ]
    }
)
Combining with Metadata Filtering#
.get and .query can handle where_document search combined with metadata filtering:


collection.query(
    query_texts=["doc10", "thus spake zarathustra", ...],
    n_results=10,
    where={"metadata_field": "is_equal_to_this"},
    where_document={"$contains":"search_string"}
)
Metadata Filtering

Embedding Functions

Edit this page on GitHub

Ask this Page

On this page
Full Text Search and Regex
Using Logical Operators
Combining with Metadata Filtering
Using Logical Operators
Combining with Metadata Filtering
FTS and Regex - Chroma Docs

Apollo.io
707 online
24k

22.7k


Toggle theme













































Embedding Functions
Embeddings are the way to represent any kind of data, making them the perfect fit for working with all kinds of AI-powered tools and algorithms. They can represent text, images, and soon audio and video. Chroma collections index embeddings to enable efficient similarity search on the data they represent. There are many options for creating embeddings, whether locally using an installed library, or by calling an API.

Chroma provides lightweight wrappers around popular embedding providers, making it easy to use them in your apps. You can set an embedding function when you create a Chroma collection, to be automatically used when adding and querying data, or you can call them directly yourself.

Python	Typescript
Cloudflare Workers AI	✓	✓
Cohere	✓	✓
Google Generative AI	✓	✓
Hugging Face	✓	-
Hugging Face Embedding Server	✓	✓
Instructor	✓	-
Jina AI	✓	✓
Mistral	✓	✓
Morph	✓	✓
OpenAI	✓	✓
Together AI	✓	✓
For TypeScript users, Chroma provides packages for a number of embedding model providers. The Chromadb python package ships will all embedding functions included.

Provider	Embedding Function Package
All (installs all packages)	@chroma-core/all
Cloudflare Workers AI	@chroma-core/cloudflare-worker-ai
Cohere	@chroma-core/cohere
Google Gemini	@chroma-core/google-gemini
Hugging Face Server	@chroma-core/huggingface-server
Jina	@chroma-core/jina
Mistral	@chroma-core/mistral
Morph	@chroma-core/morph
Ollama	@chroma-core/ollama
OpenAI	@chroma-core/openai
Together AI	@chroma-core/together-ai
Voyage AI	@chroma-core/voyageai
We welcome pull requests to add new Embedding Functions to the community.

Default: all-MiniLM-L6-v2#
Chroma's default embedding function uses the Sentence Transformers all-MiniLM-L6-v2 model to create embeddings. This embedding model can create sentence and document embeddings that can be used for a wide variety of tasks. This embedding function runs locally on your machine, and may require you download the model files (this will happen automatically).

If you don't specify an embedding function when creating a collection, Chroma will set it to be the DefaultEmbeddingFunction:


collection = client.create_collection(name="my_collection")
Using Embedding Functions#
Embedding functions can be linked to a collection and used whenever you call add, update, upsert or query.


# Set your OPENAI_API_KEY environment variable
from chromadb.utils.embedding_functions import OpenAIEmbeddingFunction

collection = client.create_collection(
    name="my_collection",
    embedding_function=OpenAIEmbeddingFunction(
        model_name="text-embedding-3-small"
    )
)

# Chroma will use OpenAIEmbeddingFunction to embed your documents
collection.add(
    ids=["id1", "id2"],
    documents=["doc1", "doc2"]
)
You can also use embedding functions directly which can be handy for debugging.


from chromadb.utils.embedding_functions import DefaultEmbeddingFunction

default_ef = DefaultEmbeddingFunction()
embeddings = default_ef(["foo"])
print(embeddings) # [[0.05035809800028801, 0.0626462921500206, -0.061827320605516434...]]

collection.query(query_embeddings=embeddings)
Custom Embedding Functions#
You can create your own embedding function to use with Chroma; it just needs to implement EmbeddingFunction.


from chromadb import Documents, EmbeddingFunction, Embeddings

class MyEmbeddingFunction(EmbeddingFunction):
    def __call__(self, input: Documents) -> Embeddings:
        # embed the documents somehow
        return embeddings
We welcome contributions! If you create an embedding function that you think would be useful to others, please consider submitting a pull request.

Full Text Search and Regex

Multimodal

Edit this page on GitHub

Ask this Page

On this page
Embedding Functions
Default: all-MiniLM-L6-v2
Using Embedding Functions
Custom Embedding Functions
Embedding Functions - Chroma Docs

Apollo.io
707 online
24k

22.7k


Toggle theme













































Multimodal
Multimodal support is currently available only in Python. Javascript/Typescript support coming soon!

You can create multimodal Chroma collections; these are collections which can store, and can be queried by, multiple modalities of data.

Try it out in Colab

Multi-modal Embedding Functions#
Chroma supports multi-modal embedding functions, which can be used to embed data from multiple modalities into a single embedding space.

Chroma ships with the OpenCLIP embedding function built in, which supports both text and images.


from chromadb.utils.embedding_functions import OpenCLIPEmbeddingFunction
embedding_function = OpenCLIPEmbeddingFunction()
Adding Multimodal Data and Data Loaders#
You can add embedded data of modalities different from text directly to Chroma. For now images are supported:


collection.add(
    ids=['id1', 'id2', 'id3'],
    images=[[1.0, 1.1, 2.1, ...], ...] # A list of numpy arrays representing images
)
Unlike with text documents, which are stored in Chroma, we will not store your original images, or data of other modalities. Instead, for each of your multimodal records you can specify a URI where the original format is stored, and a data loader. For each URI you add, Chroma will use the data loader to retrieve the original data, embed it, and store the embedding.

For example, Chroma ships with a data loader, ImageLoader, for loading images from a local filesystem. We can create a collection set up with the ImageLoader:


import chromadb
from chromadb.utils.data_loaders import ImageLoader
from chromadb.utils.embedding_functions import OpenCLIPEmbeddingFunction

client = chromadb.Client()

data_loader = ImageLoader()
embedding_function = OpenCLIPEmbeddingFunction()

collection = client.create_collection(
    name='multimodal_collection',
    embedding_function=embedding_function,
    data_loader=data_loader
)
Now, we can use the .add method to add records to this collection. The collection's data loader will grab the images using the URIs, embed them using the OpenCLIPEmbeddingFunction, and store the embeddings in Chroma.


collection.add(
    ids=["id1", "id2"],
    uris=["path/to/file/1", "path/to/file/2"]
)
If the embedding function you use is multi-modal (like OpenCLIPEmbeddingFunction), you can also add text to the same collection:


collection.add(
    ids=["id3", "id4"],
    documents=["This is a document", "This is another document"]
)
Querying#
You can query a multi-modal collection with any of the modalities that it supports. For example, you can query with images:


results = collection.query(
    query_images=[...] # A list of numpy arrays representing images
)
Or with text:


results = collection.query(
    query_texts=["This is a query document", "This is another query document"]
)
If a data loader is set for the collection, you can also query with URIs which reference data stored elsewhere of the supported modalities:


results = collection.query(
    query_uris=[...] # A list of strings representing URIs to data
)
Additionally, if a data loader is set for the collection, and URIs are available, you can include the data in the results:


results = collection.query(
    query_images=[...], # # list of numpy arrays representing images
    include=['data']
)
This will automatically call the data loader for any available URIs, and include the data in the results. uris are also available as an include field.

Updating#
You can update a multi-modal collection by specifying the data modality, in the same way as add. For now, images are supported:


collection.update(
    ids=['id1', 'id2', 'id3'],
    images=[...] # A list of numpy arrays representing images
)
Note that a given entry with a specific ID can only have one associated modality at a time. Updates will over-write the existing modality, so for example, an entry which originally has corresponding text and updated with an image, will no longer have that text after an update with images.

Embedding Functions

Installing the CLI

Edit this page on GitHub

Ask this Page

On this page
Multimodal
Multi-modal Embedding Functions
Adding Multimodal Data and Data Loaders
Querying
Updating
Multimodal Embedding - Chroma Docs

Apollo.io
696 online
24k

22.7k


Toggle theme













































Installing the Chroma CLI
The Chroma CLI lets you run a Chroma server locally on your machine, install sample apps, browse your collections, interact with your Chroma Cloud DBs, and much more!

When you install our Python or JavaScript package globally, you will automatically get the Chroma CLI.

If you don't use one of our packages, you can still install the CLI as a standalone program with cURL (or iex on Windows).

Python#
You can install Chroma using pip:


pip install chromadb
If you're machine does not allow for global pip installs, you can get the Chroma CLI with pipx:


pipx install chromadb
JavaScript#

yarn global add chromadb
Install Globally#

curl -sSL https://raw.githubusercontent.com/chroma-core/chroma/main/rust/cli/install/install.sh | bash
Multimodal

Browse Collections

Edit this page on GitHub

Ask this Page

On this page
Installing the Chroma CLI
Python
JavaScript
Install Globally
Installing the CLI - Chroma Docs

Apollo.io
707 online
24k

22.7k


Toggle theme













































Browsing Collections
You can use the Chroma CLI to inspect your collections with an in-terminal UI. The CLI supports browsing collections from DBs on Chroma Cloud or a local Chroma server.


chroma browse [collection_name] [--local]
Arguments
collection_name - The name of the collection you want to browse. This is a required argument.
db_name - The name of the Chroma Cloud DB with the collection you want to browse. If not provided, the CLI will prompt you to select a DB from those available on your active profile. For local Chroma, the CLI uses the default_database.
local - Instructs the CLI to find your collection on a local Chroma server at http://localhost:8000. If your local Chroma server is available on a different hostname, use the host argument instead.
host - The host of your local Chroma server. This argument conflicts with path.
path - The path of your local Chroma data. If provided, the CLI will use the data path to start a local Chroma server at an available port for browsing. This argument conflicts with host.
theme - The theme of your terminal (light or dark). Optimizes the UI colors for your terminal's theme. You only need to provide this argument once, and the CLI will persist it in ~/.chroma/config.json.

chroma browse my-collection
The Collection Browser UI
Main View
The main view of the Collection Browser shows you a tabular view of your data with record IDs, documents, and metadata. You can navigate the table using arrows, and expand each cell with Return. Only 100 records are loaded initially, and the next batch will load as you scroll down the table.

cli-browse

Search
You can enter the query editor by hitting s on the main view. This form allows you to submit .get() queries on your collection. You can edit the form by hitting e to enter edit mode, use space to toggle the metadata operator, and Esc to quit editing mode. To submit a query use Return.

The query editor persists your edits after you submit. You can clear it by hitting c. When viewing the results you can hit s to get back to the query editor, or Esc to get back to the main view.

cli-browse

Installing the CLI

Copy Collections

Edit this page on GitHub

Ask this Page

On this page
Browsing Collections
Arguments
The Collection Browser UI
Main View
Search
Browse Collections - Chroma Docs

Apollo.io
696 online
24k

22.7k


Toggle theme













































Copy Chroma Collections
Using the Chroma CLI, you can copy collections from a local Chroma server to Chroma Cloud and vice versa.


chroma copy --from-local collections [collection names]
Arguments
collections - Space separated list of the names of the collections you want to copy. Conflicts with all.
all - Instructs the CLI to copy all collections from the source DB.
from-local - Sets the copy source to a local Chroma server. By default, the CLI will try to find it at localhost:8000. If you have a different setup, use path or host.
from-cloud - Sets the copy source to a DB on Chroma Cloud.
to-local - Sets the copy target to a local Chroma server. By default, the CLI will try to find it at localhost:8000. If you have a different setup, use path or host.
to-cloud - Sets the copy target to a DB on Chroma Cloud.
db - The name of the Chroma Cloud DB with the collections you want to copy. If not provided, the CLI will prompt you to select a DB from those available on your active profile.
host - The host of your local Chroma server. This argument conflicts with path.
path - The path of your local Chroma data. If provided, the CLI will use the data path to start a local Chroma server at an available port for browsing. This argument conflicts with host.
Copy from Local to Chroma Cloud

chroma copy --from-local collections col-1 col-2
Copy from Chroma Cloud to Local

chroma copy --from-cloud collections col-1 col-2
Quotas
You may run into quota limitations when copying local collections to Chroma Cloud, for example if the size of your metadata values on records is too large. If the CLI notifies you that a quota has been exceeded, you can request an increase on the Chroma Cloud dashboard. Click "Settings" on your active profile's team, and then choose the "Quotas" tab.

Browse Collections

DB Management

Edit this page on GitHub

Ask this Page

On this page
Copy Chroma Collections
Arguments
Copy from Local to Chroma Cloud
Copy from Chroma Cloud to Local
Quotas
Copy Collections - Chroma Docs

Apollo.io
696 online
24k

22.7k


Toggle theme













































DB Management on Chroma Cloud
The Chroma CLI lets you interact with your Chroma Cloud databases for your active profile.

Connect
The connect command will output a connection code snippet for your Chroma Cloud database in Python or JS/TS. If you don't provide the name or language the CLI will prompt you to choose your preferences. The name argument is always assumed to be the first, so you don't need to include the --name flag.

The output code snippet will already have the API key of your profile set for the client construction.


chroma db connect [db_name] [--language python/JS/TS]
The connect command can also add Chroma environment variables (CHROMA_API_KEY, CHROMA_TENANT, and CHROMA_DATABASE) to a .env file in your current working directory. It will create a .env file for you if it doesn't exist:


chroma db connect [db_name] --env-file
If you prefer to simply output these variables to your terminal use:


chroma db connect [db_name] --env-vars
Setting these environment variables will allow you to concisely instantiate the CloudClient with no arguments.

Create
The create command lets you create a database on Chroma Cloud. It has the name argument, which is the name of the DB you want to create. If you don't provide it, the CLI will prompt you to choose a name.

If a DB with your provided name already exists, the CLI will error.


chroma db create my-new-db
Delete
The delete command deletes a Chroma Cloud DB. Use this command with caution as deleting a DB cannot be undone. The CLI will ask you to confirm that you want to delete the DB with the name you provided.


chroma db delete my-db
List
The list command lists all the DBs you have under your current profile.


chroma db list
Copy Collections

Install Sample Apps

Edit this page on GitHub

Ask this Page

On this page
DB Management on Chroma Cloud
Connect
Create
Delete
List
DB Management - Chroma Docs

Apollo.io
696 online
24k

22.7k


Toggle theme













































Sample Apps
This CLI command is available on Chroma 1.0.4 and later.

The Chroma team regularly releases sample AI applications powered by Chroma, which you can use to learn about retrieval, building with AI, and as a jumping-off board for your own projects.

The CLI makes it easy to install and set up the Chroma sample apps on your local machine with the chroma install command.

To install a sample app simply run


chroma install [app_name]
The CLI will walk you through any particular customization you can make, and setting up your environment.

To see a full list of available sample app, use the list argument:


chroma install --list
DB Management

Login

Edit this page on GitHub

Ask this Page

On this page
Sample Apps
Sample Apps - Chroma Docs

Apollo.io
696 online
24k

22.7k


Toggle theme













































Authenticating with Chroma Cloud
The Chroma CLI allows you to perform various operations with your Chroma Cloud account. These include DB management, collection copying and browsing, and many more to come in the future.

Use the login command, to authenticate the CLI with your Chroma Cloud account, to enable these features.

First, in your browser create a Chroma Cloud account or login into your existing account.

Then, in your terminal, run


chroma login
The CLI will open a browser window verifying that the authentication was successful. If so, you should see the following:

cli-login-success

Back in the CLI, you will be prompted to select the team you want to authenticate with. Each team login gets its own profile in the CLI. Profiles persist the API key and tenant ID for the team you log-in with. You can find all your profiles in .chroma/credentials under your home directory. By default, the name of the profile is the same name of the team you logged-in with. However, the CLI will let you edit that name during the login, or later using the chroma profile rename command.

Upon your first login, the first created profile will be automatically set as your "active" profile.

On subsequent logins, the CLI will instruct you how to switch to a new profile you added (using the chroma profile use command).

Install Sample Apps

Profile Management

Edit this page on GitHub

Ask this Page

On this page
Authenticating with Chroma Cloud
Login - Chroma Docs

Apollo.io
696 online
24k

22.7k


Toggle theme













































Profile Management
A profile in the Chroma CLI persists the credentials (API key and tenant ID) for authenticating with Chroma Cloud.

Each time you use the login command, the CLI will create a profile for the team you logged in with. All profiles are saved in the .chroma/credentials file in your home directory.

The CLI also keeps track of your "active" profile in .chroma/config.json. This is the profile that will be used for all CLI commands with Chroma Cloud. For example, if you logged into your "staging" team on Chroma Cloud, and set it as your active profile. Later, when you use the chroma db create my-db command, you will see my-db created under your "staging" team.

The profile command lets you manage your profiles.

Delete
Deletes a profile. The CLI will ask you to confirm if you are trying to delete your active profile. If this is the case, be sure to use the profile use command to set a new active profile, otherwise all future Chrom Cloud CLI commands will fail.


chroma profile delete [profile_name]
List
Lists all your available profiles


chroma profile list
Show
Outputs the name of your active profile


chroma profile show
Rename
Rename a profile


chroma profile rename [old_name] [new_name]
Use
Set a new profile as the active profile


chroma profile use [profile_name]
Login

Run a Chroma Server

Edit this page on GitHub

Ask this Page

On this page
Profile Management
Delete
List
Show
Rename
Use
Profile Management - Chroma Docs

Apollo.io
696 online
24k

22.7k


Toggle theme













































Running a Chroma Server
The Chroma CLI lets you run a Chroma server locally with the chroma run command:


chroma run --path [/path/to/persist/data]
Your Chroma server will persist its data in the path you provide after the path argument. By default, it will save data to the chroma directory.

You can further customize how your Chroma server runs with these arguments:

host - defines the hostname where your server runs. By default, this is localhost.
port - the port your Chroma server will use to listen for requests from clients. By default the port is 8000.
config_path - instead of providing path, host, and port, you can provide a configuration file with these definitions and more. You can find an example here.
Connecting to your Chroma Server#
With your Chroma server running, you can connect to it with the HttpClient:


import chromadb

chroma_client = chromadb.HttpClient(host='localhost', port=8000)
Profile Management

Update the CLI

Edit this page on GitHub

Ask this Page

On this page
Running a Chroma Server
Connecting to your Chroma Server
Run a Chroma Server - Chroma Docs

Apollo.io
696 online
24k

22.7k


Toggle theme













































Update
The chroma update command wil inform you if you should update your CLI installation.

If you run the CLI via our Python or JavaScript packages, the update command will inform you if a new chromadb version is availble. When you update your chromadb package, you will also get the latest version of the CLI bundled with it.

Run a Chroma Server

Vacuum

Edit this page on GitHub

Ask this Page

On this page
Update
Update the CLI - Chroma Docs

Apollo.io
696 online
24k

22.7k


Toggle theme













































Vacuuming
Vacuuming shrinks and optimizes your database.

Vacuuming after upgrading from a version of Chroma below v0.5.6 will greatly reduce the size of your database and enable continuous database pruning. A warning is logged during server startup if this is necessary.

In most other cases, vacuuming is unnecessary. It does not need to be run regularly.

Vacuuming blocks all reads and writes to your database while it's running, so we recommend shutting down your Chroma server before vacuuming (although it's not strictly required).

To vacuum your database, run:


chroma utils vacuum --path <your-data-directory>
For large databases, expect this to take up to a few minutes.

Update the CLI

Edit this page on GitHub

Ask this Page

On this page
Vacuuming
Vacuum - Chroma Docs