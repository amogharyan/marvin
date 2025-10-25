### Setup Project Directory and Install Dependencies (Bash)

Source: https://github.com/fetchai/docs/blob/main/pages/guides/fetchai-sdk/quickstart.mdx

Provides the necessary bash commands to create the project directory, change into it, and install the required Python libraries (flask, openai, fetchai) using pip.

```bash
mkdir fetchai-tarot && cd fetchai-tarot
```

```bash
pip install flask openai fetchai
```

--------------------------------

### Installing Project Dependencies with Poetry

Source: https://github.com/fetchai/docs/blob/main/pages/guides/agent-courses/introductory-course.mdx

Execute `poetry install` to read the `pyproject.toml` file and install all the specified project dependencies within the isolated Poetry environment.

```shell
poetry install
```

--------------------------------

### Installing Dependencies on MacOS (Shell)

Source: https://github.com/fetchai/docs/blob/main/pages/guides/agents/quickstart.mdx

Installs necessary build tools (automake, autoconf, libtool) on MacOS using Homebrew to resolve potential installation issues.

```Shell
brew install automake autoconf libtool
```

--------------------------------

### Installing uAgents Framework (Shell)

Source: https://github.com/fetchai/docs/blob/main/pages/guides/agents/quickstart.mdx

Installs the uagents Python package using the pip package manager.

```Shell
pip install uagents
```

--------------------------------

### Start Local Node (Shell)

Source: https://github.com/fetchai/docs/blob/main/pages/guides/fetch-network/jenesis/getting-started.mdx

This command starts a local Fetch.ai node managed by Jenesis. It can optionally take a `--profile` argument to specify which configuration profile to use from `jenesis.toml`.

```Shell
jenesis network start [--profile my_profile]
```

--------------------------------

### Install Homebrew on MacOS

Source: https://github.com/fetchai/docs/blob/main/pages/guides/agent-courses/introductory-course.mdx

Executes a shell script downloaded from GitHub to install Homebrew, a package manager for MacOS, which simplifies software installations via the command line.

```Shell
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

--------------------------------

### Install Poetry

Source: https://github.com/fetchai/docs/blob/main/pages/guides/agent-courses/introductory-course.mdx

Downloads and executes the official installation script for Poetry, a Python dependency management and packaging tool, using curl and the python3 interpreter.

```Shell
curl -sSL https://install.python-poetry.org | python3 -
```

--------------------------------

### Creating Project Directory (Shell)

Source: https://github.com/fetchai/docs/blob/main/pages/guides/agents/quickstart.mdx

Creates a new directory for the uAgent project and navigates into it using standard shell commands.

```Shell
mkdir directory_name
cd directory_name
```

--------------------------------

### Get PyEnv Help

Source: https://github.com/fetchai/docs/blob/main/pages/guides/agent-courses/introductory-course.mdx

Displays the help documentation for the PyEnv command-line tool, providing information on available commands and their usage.

```Shell
pyenv help
```

--------------------------------

### Running the Agent Script (Shell)

Source: https://github.com/fetchai/docs/blob/main/pages/guides/agents/quickstart.mdx

Executes the `interval_task.py` Python script using the Python interpreter to start the agent.

```Shell
python interval_task.py
```

--------------------------------

### Get PyEnv Help (Shell)

Source: https://github.com/fetchai/docs/blob/main/pages/guides/agents/getting-started/installing-uagent.mdx

Displays the help documentation for the PyEnv command-line tool, providing information on available commands and options.

```shell
pyenv help
```

--------------------------------

### Installing OpenAI Swarm

Source: https://github.com/fetchai/docs/blob/main/pages/guides/quickstart-with/OpenAI/integrating-with-swarm.mdx

Command to install the OpenAI Swarm library using pip directly from the GitHub repository.

```Shell
pip install git+ssh://git@github.com/openai/swarm.git
```

--------------------------------

### Installing uAgents with Poetry (Bash)

Source: https://github.com/fetchai/docs/blob/main/pages/guides/quickstart-with/langchain/creating-an-agent-with-langchain.mdx

This Bash snippet provides commands to initialize a new Poetry project and add the `uagents` library as a dependency. It assumes Poetry is already installed and configured. The first command `poetry init` sets up the project structure and `pyproject.toml` file, while `poetry add uagents` installs the `uagents` package and adds it to the project's dependencies.

```bash
poetry init
poetry add uagents
```

--------------------------------

### Running the CrewAI Example Script

Source: https://github.com/fetchai/docs/blob/main/pages/guides/quickstart-with/CrewAI/startup-idea-analyser.mdx

These shell commands provide instructions on how to execute the Python script. They include installing project dependencies using `poetry install` and running the main script `agent.py` using the Python interpreter.

```bash
poetry install
```

```bash
python agent.py
```

--------------------------------

### Install Python Version with PyEnv

Source: https://github.com/fetchai/docs/blob/main/pages/guides/agent-courses/introductory-course.mdx

Uses PyEnv to install a specific version of Python (3.10 in this example), allowing developers to work with the required Python runtime for their projects.

```Shell
pyenv install 3.10
```

--------------------------------

### Install PyEnv via Homebrew

Source: https://github.com/fetchai/docs/blob/main/pages/guides/agent-courses/introductory-course.mdx

Uses Homebrew to install PyEnv, a tool that allows managing multiple Python versions on the same system, which is essential for development flexibility.

```Shell
brew install pyenv
```

--------------------------------

### Initializing Poetry Project with Shell

Source: https://github.com/fetchai/docs/blob/main/pages/guides/agent-courses/introductory-course.mdx

Run the `poetry init` command in your project directory to initialize a new Poetry project. This command will guide you through setting up the project's metadata and dependencies in the `pyproject.toml` file.

```shell
poetry init
```

--------------------------------

### Creating New Jenesis Project (CLI)

Source: https://github.com/fetchai/docs/blob/main/pages/guides/fetch-network/jenesis/getting-started.mdx

Demonstrates the command-line interface command to create a new jenesis project directory and initialize it with a default configuration file and contracts folder. Optional arguments allow specifying a profile and network.

```Shell
jenesis new my_project [--profile my_profile] [--network network_name]
```

--------------------------------

### Building Application Docker Image with Poetry

Source: https://github.com/fetchai/docs/blob/main/pages/examples/examplestech/postgres-database-with-an-agent.mdx

This Dockerfile defines the steps to build the application's Docker image. It starts from a Python slim image, installs necessary packages and Poetry, sets the working directory, copies dependency files, installs dependencies, copies the application code, exposes port 8000, and sets the entrypoint and default command to run the application using Poetry.

```Dockerfile
FROM python:3.12-slim
ENV PATH="$PATH:/root/.local/bin"

RUN apt-get update && \
    apt-get install -y curl gcc && \
    curl -sSL https://install.python-poetry.org/ | python3 -

WORKDIR /app
ADD pyproject.toml poetry.lock /app/
RUN poetry install
ADD . /app
EXPOSE 8000

ENTRYPOINT ["poetry", "run"]
CMD ["python", "main.py"]
```

--------------------------------

### Running the Search Agent (Bash)

Source: https://github.com/fetchai/docs/blob/main/pages/guides/fetchai-sdk/quickstart.mdx

This command is used to start the Fetch.ai Search Agent script. It executes the tarot_search_agent.py file using the Python interpreter, typically running it in a separate terminal window.

```bash
python tarot_search_agent.py
```

--------------------------------

### Initialize Existing Project for Local Node (Shell)

Source: https://github.com/fetchai/docs/blob/main/pages/guides/fetch-network/jenesis/getting-started.mdx

Use this command to initialize an existing directory as a Jenesis project, configuring it to connect to a local Fetch.ai node. This is an alternative to `jenesis new` when working with an existing codebase.

```Shell
jenesis init --network fetchai-localnode
```

--------------------------------

### Installing Fetch.ai uAgents Library (Bash)

Source: https://github.com/fetchai/docs/blob/main/pages/guides/quickstart-with/CrewAI/creating-an-agent-with-crewai.mdx

This snippet provides commands to initialize a Poetry project and add the `uagents` library as a dependency. It's a prerequisite for working with Fetch.ai agents.

```Bash
poetry init
poetry add uagents
```

--------------------------------

### Start FastAPI Server (Bash)

Source: https://github.com/fetchai/docs/blob/main/pages/examples/agent/on_query_example.mdx

Navigates to the source directory and starts the FastAPI application using Uvicorn, specifying the main module and app instance.

```bash
cd src
uvicorn main:app
```

--------------------------------

### Running the Tarot Agent (Bash)

Source: https://github.com/fetchai/docs/blob/main/pages/guides/fetchai-sdk/quickstart.mdx

This command is used to start the Fetch.ai Tarot Agent script. It executes the tarot_agent.py file using the Python interpreter, typically running it in a separate terminal window.

```bash
python tarot_agent.py
```

--------------------------------

### Initializing Existing Jenesis Project (CLI)

Source: https://github.com/fetchai/docs/blob/main/pages/guides/fetch-network/jenesis/getting-started.mdx

Demonstrates the command-line interface command to initialize a jenesis project within an existing directory. This command creates the `jenesis.toml` file and `contracts` folder if they don't exist, similar to `jenesis new` but without creating a new top-level directory.

```Shell
jenesis init [--profile my_profile] [--network network_name]
```

--------------------------------

### Initialize Basic Fetch.ai Agent (Python)

Source: https://github.com/fetchai/docs/blob/main/pages/guides/agent-courses/introductory-course.mdx

This Python code snippet demonstrates how to import the `Agent` and `Context` classes from `uagents`, instantiate a basic agent with a name and seed, define an asynchronous function `introduce_agent` to run on startup using `@agent.on_event("startup")`, and include the standard `if __name__ == "__main__":` block to start the agent's event loop.

```python
# Import the required classes
from uagents import Agent, Context

agent = Agent(name="alice", seed="alice recovery phrase")


# Provide your Agent with a job
@agent.on_event("startup")
async def introduce_agent(ctx: Context):
    ctx.logger.info(f"Hello, I'm agent {agent.name} and my address is {agent.address}.")


# This constructor simply ensure that only this script is running
if __name__ == "__main__":
    agent.run()
```

--------------------------------

### Default Jenesis Project Configuration (TOML)

Source: https://github.com/fetchai/docs/blob/main/pages/guides/fetch-network/jenesis/getting-started.mdx

Shows the default structure and content of the `jenesis.toml` file created by the `jenesis new` or `jenesis init` commands. It includes project metadata, default profile settings, network configuration, and an empty contracts section.

```TOML
[project]
name = "my_project"
authors = [ "Alice Tyler <alice@mail.com>"]
keyring_backend = "os"

[profile.my_profile]
default = true

[profile.my_profile.network]
name = "fetchai-testnet"
chain_id = "dorado-1"
fee_minimum_gas_price = 5000000000
fee_denomination = "atestfet"
staking_denomination = "atestfet"
url = "grpc+https://grpc-dorado.fetch.ai"
faucet_url = "https://faucet-dorado.fetch.ai"
is_local = false

[profile.my_profile.contracts]
```

--------------------------------

### Install Fetch.ai Agent Dependencies with Poetry (Bash)

Source: https://github.com/fetchai/docs/blob/main/pages/examples/agent/search-example.mdx

Adds and installs the `httpx` and `uagents` libraries as dependencies for the project using Poetry. These are required for running the agent example.

```bash
poetry add httpx uagents
```

--------------------------------

### Expected Application Output (Log)

Source: https://github.com/fetchai/docs/blob/main/pages/examples/examplestech/postgres-database-with-an-agent.mdx

This snippet shows the expected console output when running the example, demonstrating successful database connection, agent communication (data insertion and fetching), and the bureau server starting.

```Text
poetry_app | Connection successful
poetry_app | INFO:     [db_fetcher]: Hello, I'm agent db_inserter and my address is agent1qwg0h3gx2kvqmwadlg0j4r258r7amcfskx2mudz92ztjmtfdclygxrh5esu. PostgreSQL database version: PostgreSQL 16.3 (Debian 16.3-1.pgdg120+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 12.2.0-14) 12.2.0, 64-bit
poetry_app | INFO:     [db_inserter]: Received request from agent1qv470qn3vfgn3dwe5z90m8u6qvtn6chrgm4urfzdg2v9qyagln6sgnh4wwg {'employees_data': {'EmployeeID': '0', 'FirstName': 'john', 'LastName': 'wick', 'BirthDate': '29-08-1999', 'Salary': 50000}}
poetry_app | Connection successful
poetry_app | INFO:     [db_inserter]: Inserted employee data: {'EmployeeID': '0', 'FirstName': 'john', 'LastName': 'wick', 'BirthDate': '29-08-1999', 'Salary': 50000}
poetry_app | Connection successful
poetry_app | INFO:     [db_fetcher]: Retrieved all employee data: [{'EmployeeID': 0, 'FirstName': 'john', 'LastName': 'wick', 'BirthDate': '29-08-1999', 'Salary': Decimal('50000.00')}]
poetry_app | INFO:     [bureau]: Starting server on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

--------------------------------

### Initializing a uAgent with Proxy in Python

Source: https://github.com/fetchai/docs/blob/main/pages/guides/agents/intermediate/agent-proxy.mdx

This snippet demonstrates how to create and configure a uAgent instance to connect to the Agentverse via a Proxy. It initializes the agent with a name, seed, and sets the `proxy` parameter to `True`. The agent's address is printed, and the agent is started if the script is run directly. This setup allows the agent to record interactions on the Agentverse Marketplace.

```Python
from uagents import Agent, Context, Model


class Message(Model):
    message: str


# Now your agent is ready to join the agentverse!
agent = Agent(
    name="alice",
    seed="your_agent_seed_phrase",
    proxy=True,
)

# Copy the address shown below
print(f"Your agent's address is: {agent.address}")

if __name__ == "__main__":
    agent.run()
```

--------------------------------

### Starting the Main Execution Function in Python

Source: https://github.com/fetchai/docs/blob/main/pages/guides/fetch-network/cosmpy/use-cases/oracles.mdx

This snippet begins the definition of the main execution function, `main()`. It starts by calling `_parse_commandline()` to get the command-line arguments, then generates a new local wallet, and finally initializes a `LedgerClient` configured for the Fetch.ai stable testnet.

```python
def main():
    """Run main."""
    args = _parse_commandline()

    wallet = LocalWallet.generate()

    ledger = LedgerClient(NetworkConfig.fetchai_stable_testnet())

```

--------------------------------

### Creating and Navigating Project Directory with Shell

Source: https://github.com/fetchai/docs/blob/main/pages/guides/agent-courses/introductory-course.mdx

Use standard shell commands to create a new directory for your project and then change the current working directory into the newly created one.

```shell
mkdir development/agent-demo
cd development/agent-demo
```

--------------------------------

### Running SenderAgent Python Script

Source: https://github.com/fetchai/docs/blob/main/pages/guides/agents/quickstart.mdx

Executes the SenderAgent Python script in a terminal window to start the sender agent process, which will register on the almanac contract and initiate communication.

```python
python SenderAgent.py
```

--------------------------------

### Running the uAgent Storage Script

Source: https://github.com/fetchai/docs/blob/main/pages/guides/agent-courses/introductory-course.mdx

Command to execute the `storage.py` script using the poetry environment.

```Shell
poetry run python storage.py
```

--------------------------------

### Create New Project for Local Node (Shell)

Source: https://github.com/fetchai/docs/blob/main/pages/guides/fetch-network/jenesis/getting-started.mdx

Use this command to create a new Jenesis project specifically configured to connect to a local Fetch.ai node instead of the default testnet. This is useful for local development and testing.

```Shell
jenesis new my_project --network fetchai-localnode
```

--------------------------------

### Running ReceiverAgent Python Script

Source: https://github.com/fetchai/docs/blob/main/pages/guides/agents/quickstart.mdx

Executes the ReceiverAgent Python script in a separate terminal window to start the receiver agent process, which will register on the almanac contract and listen for incoming messages.

```python
python ReceiverAgent.py
```

--------------------------------

### Set Global Python Version and Verify

Source: https://github.com/fetchai/docs/blob/main/pages/guides/agent-courses/introductory-course.mdx

Sets the specified Python version (3.10) as the global default using PyEnv and then lists installed versions to verify the setting was applied correctly.

```Shell
pyenv global 3.10 # this sets the global interpreter
pyenv versions # this verifies if it is set up correctly
```

--------------------------------

### Langchain Agent 1 Console Output

Source: https://github.com/fetchai/docs/blob/main/pages/guides/quickstart-with/langchain/creating-an-agent-with-langchain.mdx

Expected console output when running the first Langchain agent (`langchain_agent_one.py`). It shows the agent's address, successful manifest publication and registration, and the server start message.

```text
uAgent address agent:  agent1qv9qmj3ug83vcrg774g2quz0urmlyqlmzh6a5t3r88q3neejlrffz405p7x
INFO:     [find_in_pdf]: Manifest published successfully: Text Summarizer
INFO:     [find_in_pdf]: Registration on Almanac API successful
INFO:     [find_in_pdf]: Almanac contract registration is up to date!
INFO:     [find_in_pdf]: Starting server on http://0.0.0.0:8001 (Press CTRL+C to quit)
INFO:     [find_in_pdf]: ['0: This is a simple story about two ... ]
```

--------------------------------

### Install Python Dependencies (Shell)

Source: https://github.com/fetchai/docs/blob/main/pages/guides/agents/intermediate/search-agent.mdx

Installs the necessary Python libraries (`uagents`, `fetchai`, `openai`) using pip, which are required to run the Fetch.ai Search Agent project.

```Shell
pip install uagents fetchai openai
```

--------------------------------

### Creating Python File (Shell)

Source: https://github.com/fetchai/docs/blob/main/pages/guides/agents/quickstart.mdx

Creates an empty Python file named `interval_task.py` using OS-specific shell commands (touch for Unix-like, echo for Windows).

```Shell
touch interval_task.py
```

```Shell
echo. > interval_task.py
```

--------------------------------

### Start Jupyter Notebook with Pip - Shell

Source: https://github.com/fetchai/docs/blob/main/pages/examples/examplestech/jupyter-agent.mdx

This command starts the Jupyter notebook server when your project dependencies are managed using Pip. Ensure Jupyter is installed in your environment.

```Shell
jupyter notebook
```

--------------------------------

### Installing Fetch Ledger Binaries - Bash

Source: https://github.com/fetchai/docs/blob/main/pages/guides/fetch-network/ledger/installation.mdx

Executes the make install command to copy the compiled fetchd binary to the user's GOBIN directory. This makes the fetchd command available system-wide for non-developer users.

```bash
make install
```

--------------------------------

### Example Agent Terminal Output (Bash)

Source: https://github.com/fetchai/docs/blob/main/pages/examples/agent/on_query_example.mdx

Displays typical console output from the running uAgents agent, including registration status, server start info, and processing of a received message.

```bash
INFO:     [Shopping Assistant]: Almanac registration is up to date!
INFO:     [Shopping Assistant]: Starting server on http://0.0.0.0:8001 (Press CTRL+C to quit)
INFO:     [Shopping Assistant]: Received message from user1fu0nqpf7mgxyms0wwvphgt8p3a7cvzfqqq6tkmxlhkr740glxzjsmzudat with question: I want to purchase a MacBook
INFO:     [Shopping Assistant]: Question: I want to purchase a MacBook
Answer: Great choice! MacBooks are known for their sleek design, impressive performance, and high-quality display. Here are some things to consider before your purchase:

1. **Model**: Apple currently offers MacBook Air and MacBook Pro. Each model comes with different sizes and specifications. The MacBook Air is a slim, lightweight machine, perfect for casual use or on-the-go work. The MacBook Pro is a more powerful machine, suitable for heavy-duty tasks like video editing, graphic design, and professional applications.

2. **Specifications**: Depending on your needs, you might need more or less power. Consider the processor speed, the amount of RAM, the size of the solid-state drive (SSD), and the type of graphics card.

3. **Budget**: Mac
```

--------------------------------

### Creating a Simple Periodic Agent (Python)

Source: https://github.com/fetchai/docs/blob/main/pages/guides/agents/quickstart.mdx

Defines a basic uAgent named 'alice' with a periodic task that logs a message every 2 seconds. It includes agent initialization and the main execution block.

```Python
from uagents import Agent, Context

# Create an agent named Alice
alice = Agent(name="alice", seed="YOUR NEW PHRASE", port=8000, endpoint=["http://localhost:8000/submit"])

# Define a periodic task for Alice
@alice.on_interval(period=2.0)
async def say_hello(ctx: Context):
    ctx.logger.info(f'hello, my name is {alice.name}')


# Run the agent
if __name__ == "__main__":
    alice.run()
```

--------------------------------

### Run Agents with Bureau - Python

Source: https://github.com/fetchai/docs/blob/main/pages/guides/agent-courses/introductory-course.mdx

Creates a `Bureau` instance, adds both the `alice` and `bob` agents to it, and starts the bureau's event loop if the script is run directly. This allows both agents to operate concurrently within the same process.

```Python
bureau = Bureau()
bureau.add(alice)
bureau.add(bob)

if __name__ == "__main__":
    bureau.run()
```

--------------------------------

### Including Protocols and Initializing Storage (Python)

Source: https://github.com/fetchai/docs/blob/main/pages/guides/agent-courses/introductory-course.mdx

Includes the previously defined `query_proto` and `book_proto` into the restaurant agent, publishing their manifests. Defines initial table availability data (`TABLES`) and stores this data in the agent's persistent storage. Includes the standard Python entry point to run the agent.

```Python
# build the restaurant agent from stock protocols and publish their details
restaurant.include(query_proto, publish_manifest=True)
restaurant.include(book_proto, publish_manifest=True)

TABLES = {
    1: TableStatus(seats=2, time_start=16, time_end=22),
    2: TableStatus(seats=4, time_start=19, time_end=21),
    3: TableStatus(seats=4, time_start=17, time_end=19),
}

for number, status in TABLES.items():
    restaurant.storage.set(number, status.dict())

if __name__ == "__main__":
    restaurant.run()
```

--------------------------------

### Running Development Server - Bash

Source: https://github.com/fetchai/docs/blob/main/DEVELOPING.md

Command to start the local development server for the project using pnpm.

```bash
pnpm dev
```

--------------------------------

### Run Fetch.ai Agent Search Script (Bash)

Source: https://github.com/fetchai/docs/blob/main/pages/examples/agent/search-example.mdx

Executes the Python script `search_agents.py` using the Python interpreter within the active environment. This starts the agent search example.

```bash
python search_agents.py
```

--------------------------------

### Setting up and Running the uAgent Bureau in Python

Source: https://github.com/fetchai/docs/blob/main/pages/examples/agent/wallet-messaging.mdx

This snippet initializes a `Bureau` instance, which acts as a container and manager for uAgents. It then adds both the 'alice' and 'bob' agents to the bureau. Finally, `bureau.run()` starts the agent execution loop, allowing the defined handlers and interval tasks to become active.

```Python
bureau = Bureau()
bureau.add(alice)
bureau.add(bob)
bureau.run()
```

--------------------------------

### Complete Second uAgent Script in Python

Source: https://github.com/fetchai/docs/blob/main/pages/guides/quickstart-with/langchain/creating-an-agent-with-langchain.mdx

Full script for the second uAgent. It defines a message model, initializes the agent with a specific port and endpoint, funds the agent, logs its address on startup, and responds to incoming messages.

```python
from uagents.setup import fund_agent_if_low
from uagents import Agent, Context, Model


class Message(Model):
    message: str


agent = Agent(
    name="agent 2",
    port=8001,
    seed="",
    endpoint=["http://127.0.0.1:8001/submit"],
)

fund_agent_if_low(agent.wallet.address())


@agent.on_event("startup")
async def start(ctx: Context):
    ctx.logger.info(f"agent address is {agent.address}")


@agent.on_message(model=Message)
async def message_handler(ctx: Context, sender: str, msg: Message):
    ctx.logger.info(f"Received message from {sender}: {msg.message}")

    await ctx.send(sender, Message(message="hello there"))


if __name__ == "__main__":
    agent.run()
```

--------------------------------

### Sample Wallet Balance Output

Source: https://github.com/fetchai/docs/blob/main/pages/guides/fetch-network/ledger/faucet.mdx

This is an example of the output received when checking the wallet balance using the fetchd query command.

```text
balances:
- amount: "<balance>"
  denom: atestfet
pagination:
  next_key: null
  total: "0"
```

--------------------------------

### Remove Existing Fetchd Network Data

Source: https://github.com/fetchai/docs/blob/main/pages/guides/fetch-network/ledger/single-node-testnet.mdx

Cleans up any local files from a previous fetchd network installation to ensure a clean start for a new network setup.

```Shell
rm -Rf ~/.fetchd
```

--------------------------------

### Setup and Run Fetch.ai Bureau with Agents

Source: https://github.com/fetchai/docs/blob/main/pages/guides/agents/advanced/message-verification.mdx

Initializes a Fetch.ai Bureau, adds the 'alice' and 'bob' agents to it, and starts the bureau's execution loop when the script is run directly.

```Python
bureau = Bureau()
bureau.add(alice)
bureau.add(bob)

if __name__ == "__main__":
    bureau.run()
```

--------------------------------

### Initialize Tarot Agent Flask App (Python)

Source: https://github.com/fetchai/docs/blob/main/pages/guides/fetchai-sdk/quickstart.mdx

Imports necessary libraries for the Flask app, Fetch.ai SDK communication, crypto, and registration, initializes the Flask app and OpenAI client, and checks for the AGENTVERSE_KEY environment variable.

```python
import json
from flask import Flask, request
from fetchai.communication import (
    send_message_to_agent, parse_message_from_agent
)
from fetchai.crypto import Identity
from fetchai.registration import register_with_agentverse
import os
import sys
from openai import OpenAI

client = OpenAI()

app = Flask(__name__)

AGENTVERSE_KEY = os.environ.get('AGENTVERSE_KEY', "")
if AGENTVERSE_KEY == "":
    sys.exit("Environment variable AGENTVERSE_KEY not defined")

# You wouldn't normally want to expose the registration logic like this,
```

--------------------------------

### Simple OpenAI Swarm Agent Interaction

Source: https://github.com/fetchai/docs/blob/main/pages/guides/quickstart-with/OpenAI/integrating-with-swarm.mdx

Demonstrates a basic interaction using the OpenAI Swarm library, showing how to create agents, define functions for agent transfer, and run a conversation simulation.

```Python
from swarm import Swarm, Agent

client = Swarm()

def transfer_to_agent_b():
    return agent_b

agent_a = Agent(
    name="Agent A",
    instructions="You are a helpful agent.",
    functions=[transfer_to_agent_b],
)

agent_b = Agent(
    name="Agent B",
    instructions="Only speak in Haikus.",
)

response = client.run(
    agent=agent_a,
    messages=[{"role": "user", "content": "I want to talk to agent B."}],
)

print(response.messages[-1]["content"])
```

--------------------------------

### Registering Agents via HTTP (Bash)

Source: https://github.com/fetchai/docs/blob/main/pages/guides/fetchai-sdk/quickstart.mdx

These curl commands send GET requests to the /register endpoints of the running Tarot Agent (port 5000) and Search Agent (port 5002). This action initiates the agent registration process with the Agentverse as implemented in their respective /register endpoint handlers.

```bash
curl --location '127.0.0.1:5000/register'
curl --location '127.0.0.1:5002/register'
```

--------------------------------

### Setup and Run Bureau

Source: https://github.com/fetchai/docs/blob/main/pages/guides/agents/intermediate/send-tokens.mdx

Initializes a Bureau instance, adds both Alice and Bob agents to it, and starts the Bureau's event loop, allowing the agents to run and communicate.

```python
bureau = Bureau()
bureau.add(alice)
bureau.add(bob)

if __name__ == "__main__":
    bureau.run()
```

--------------------------------

### Run the First Agent Script

Source: https://github.com/fetchai/docs/blob/main/pages/guides/agents/getting-started/create-a-uagent.mdx

Execute the Python script `first_agent.py` from the command line to start the agent. Ensure your virtual environment is activated before running.

```Shell
python first_agent.py
```

--------------------------------

### Create Project Directory (Shell)

Source: https://github.com/fetchai/docs/blob/main/pages/guides/agents/getting-started/installing-uagent.mdx

Creates a new directory to house your agent project files. Replace `directory_name` with your desired name.

```Shell
mkdir directory_name
```

--------------------------------

### Installing Dependencies - Bash

Source: https://github.com/fetchai/docs/blob/main/DEVELOPING.md

Command to install project dependencies using the pnpm package manager.

```bash
pnpm install
```

--------------------------------

### Create New Python File (Shell/CMD)

Source: https://github.com/fetchai/docs/blob/main/pages/guides/agent-courses/introductory-course.mdx

Provides command-line instructions to create a new empty Python file named `duo_agent.py` on different operating systems (macOS, Windows, Ubuntu).

```Shell
touch duo_agent.py
```

```CMD
echo. > duo_agent.py
```

```Shell
touch duo_agent.py
```

--------------------------------

### Export Required Environment Variables (Bash)

Source: https://github.com/fetchai/docs/blob/main/pages/guides/fetchai-sdk/quickstart.mdx

Instructions to set the OPENAI_API_KEY and AGENTVERSE_KEY environment variables, which are necessary for the agent to function.

```bash
export OPENAI_API_KEY="your_api_key_from_openai.com"
```

```bash
export AGENTVERSE_KEY="your_api_key_from_agentverse.ai"
```

--------------------------------

### Sending Periodic Table Queries (Python)

Source: https://github.com/fetchai/docs/blob/main/pages/guides/agent-courses/introductory-course.mdx

Defines the parameters for the table query, specifying the number of guests, start time, and duration. Sets up an `on_interval` function that runs periodically (every 3.0 seconds) and sends the defined `QueryTableRequest` to the restaurant agent's address if the task has not been marked as completed in storage.

```python
table_query = QueryTableRequest(
    guests=3,
    time_start=19,
    duration=2,
)


@user.on_interval(period=3.0, messages=QueryTableRequest)
async def interval(ctx: Context):
    completed = ctx.storage.get("completed")

    if not completed:
        await ctx.send(RESTAURANT_ADDRESS, table_query)
```

--------------------------------

### Handle Agent Startup Event in Python

Source: https://github.com/fetchai/docs/blob/main/pages/guides/agent-courses/introductory-course.mdx

This snippet shows how to use the `@agent.on_event("startup")` decorator to define a function that runs when the agent starts. The function uses the `Context` object to access the agent's name and address and logs them.

```python
# Import the required classes
from uagents import Agent, Context

agent = Agent(name="alice", seed="alice recovery phrase")


# Provide your Agent with a job
@agent.on_event("startup")
async def introduce_agent(ctx: Context):
    ctx.logger.info(f"Hello, I'm agent {agent.name} and my address is {agent.address}.")


# This constructor simply ensure that only this script is running
if __name__ == "__main__":
    agent.run()
```

--------------------------------

### Complete REST Endpoint Example Agent - uAgents Python

Source: https://github.com/fetchai/docs/blob/main/pages/guides/agents/intermediate/rest-endpoints.mdx

This comprehensive example demonstrates a uAgent configured with both a GET and a POST REST endpoint. It includes necessary imports, defines simple Request and Response models, initializes the agent with a port and endpoint, and implements the handlers for the `/rest/get` and `/rest/post` routes.

```Python
import time
from typing import Any, Dict

from uagents import Agent, Context, Model

class Request(Model):
    text: str

class Response(Model):
    timestamp: int
    text: str
    agent_address: str

# You can also use empty models to represent empty request/response bodies
class EmptyMessage(Model):
    pass

agent = Agent(name="Rest API", seed="your_seed_phrase", port=8000, endpoint=["http://localhost:8000/submit"])

@agent.on_rest_get("/rest/get", Response)
async def handle_get(ctx: Context) -> Dict[str, Any]:
    ctx.logger.info("Received GET request")
    return {
        "timestamp": int(time.time()),
        "text": "Hello from the GET handler!",
        "agent_address": ctx.agent.address,
    }

@agent.on_rest_post("/rest/post", Request, Response)
async def handle_post(ctx: Context, req: Request) -> Response:
    ctx.logger.info("Received POST request")
    return Response(
        text=f"Received: {req.text}",
        agent_address=ctx.agent.address,
        timestamp=int(time.time()),
    )

if __name__ == "__main__":
    agent.run()
```

--------------------------------

### Create Agent File (Windows Shell)

Source: https://github.com/fetchai/docs/blob/main/pages/guides/agent-courses/introductory-course.mdx

Use the `echo.` command with redirection in the shell to create an empty Python file named `alice_agent.py` for your agent code on Windows systems.

```shell
echo. > alice_agent.py
```

--------------------------------

### Defining Startup Event and Running Agent (Python)

Source: https://github.com/fetchai/docs/blob/main/pages/guides/agents/getting-started/create-a-uagent.mdx

Defines an asynchronous function `introduce_agent` that is triggered by the `@agent.on_event("startup")` decorator when the agent starts. The function uses the agent's context logger to print a message including the agent's name and address. The `if __name__ == "__main__": agent.run()` block is the standard entry point to start the agent's execution loop.

```python
@agent.on_event("startup")
async def introduce_agent(ctx: Context):
    ctx.logger.info(f"Hello, I'm agent {agent.name} and my address is {agent.address}.")

if __name__ == "__main__":
    agent.run()
```

--------------------------------

### View Local Node Logs (Shell)

Source: https://github.com/fetchai/docs/blob/main/pages/guides/fetch-network/jenesis/getting-started.mdx

This command displays the logs from the currently running local Fetch.ai node managed by Jenesis. It can optionally take a `--profile` argument to specify which configuration profile's logs to view.

```Shell
jenesis network logs [--profile my_profile]
```

--------------------------------

### Triggering Agent Search via HTTP (Bash)

Source: https://github.com/fetchai/docs/blob/main/pages/guides/fetchai-sdk/quickstart.mdx

This curl command sends a GET request to the /search endpoint of the running Search Agent on port 5002. This action triggers the agent's search functionality, causing it to query the Agentverse for other agents and send them messages.

```bash
curl --location '127.0.0.1:5002/search'
```

--------------------------------

### Defining and Running a Basic CrewAI Agent and Task (Python)

Source: https://github.com/fetchai/docs/blob/main/pages/guides/quickstart-with/CrewAI/creating-an-agent-with-crewai.mdx

This snippet demonstrates how to set up a simple CrewAI workflow. It defines an Agent with a specific role and goal, a Task for the agent to perform, and then instantiates and runs a Crew with these components. It requires crewai, crewai_tools, and API keys for OpenAI and Serper.

```Python
import
os
from crewai import Agent, Task, Crew, Process
from crewai_tools import SerperDevTool

os.environ["OPENAI_API_KEY"] = "YOUR_API_KEY"
os.environ["SERPER_API_KEY"] = "Your Key"  # serper.dev API key

search_tool = SerperDevTool()

# Define your agents with roles and goals
researcher = Agent(
    role='Senior Research Analyst',
    goal='Uncover cutting-edge developments in AI and data science',
    backstory="""You work at a leading tech think tank.
  Your expertise lies in identifying emerging trends.
  You have a knack for dissecting complex data and presenting actionable insights.""",
    verbose=True,
    allow_delegation=False,
    tools=[search_tool]
)

# Create tasks for your agents
task1 = Task(
    description="""Conduct a comprehensive analysis of the latest advancements in AI in 2024.
  Identify key trends, breakthrough technologies, and potential industry impacts.""",
    expected_output="Full analysis report in bullet points",
    agent=researcher
)

# Instantiate your crew with a sequential process
crew = Crew(
    agents=[researcher, ],
    tasks=[task1, ],
    verbose=True,
    process=Process.sequential
)

# Get your crew to work!
result = crew.kickoff()

print("######################")
print(result)
```

--------------------------------

### Initializing a uAgent Instance (Python)

Source: https://github.com/fetchai/docs/blob/main/pages/guides/quickstart-with/langchain/creating-an-agent-with-langchain.mdx

This code demonstrates how to create an instance of the `Agent` class, configuring its name, port for local communication, seed for wallet generation, and endpoint for the built-in REST API. The seed is crucial for generating the agent's unique identity.

```Python
agent = Agent(
    name="agent",
    port=8000,
    seed="",
    endpoint=["http://127.0.0.1:8000/submit"],
)
```

--------------------------------

### Executing FetchAI Agent Example

Source: https://github.com/fetchai/docs/blob/main/pages/examples/agent/agents-cleaning-demo.mdx

Instructions on how to set up and run the cleaner and user agents for the FetchAI example.

```Shell
poetry install
python cleaner.py
python user.py
```

--------------------------------

### Clone uAgents Source Code (Git)

Source: https://github.com/fetchai/docs/blob/main/pages/guides/agents/getting-started/installing-uagent.mdx

Clones the uAgents source code repository from GitHub and navigates into the newly created directory. Requires Git to be installed.

```Shell
git clone https://github.com/fetchai/uAgents.git
cd uAgents
```

--------------------------------

### Creating the Python script file

Source: https://github.com/fetchai/docs/blob/main/pages/guides/agent-courses/introductory-course.mdx

Commands to create an empty Python file named `almanac_registration.py` on different operating systems where the agent code will be placed.

```Shell
touch almanac_registration.py
```

```Shell
echo. > almanac_registration.py
```

--------------------------------

### Initializing Swarm Agents in Python

Source: https://github.com/fetchai/docs/blob/main/pages/guides/quickstart-with/OpenAI/integrating-with-swarm.mdx

This snippet demonstrates how to initialize two instances of the `SwarmAgent` class. Each agent is given a unique name and specific instructions defining its role or purpose within the swarm.

```Python
swarm_agent_c = SwarmAgent(
    name="Agent C",
    instructions=helpful,
)

swarm_agent_d = SwarmAgent(
    name="Question generator",
    instructions="Create a random question to ask someone about any animal"
)
```

--------------------------------

### Initializing Wallet and Ledger Client (Python)

Source: https://github.com/fetchai/docs/blob/main/pages/guides/fetch-network/cosmpy/use-cases/wallet-top-up.mdx

Starts the main execution function `main`. It first calls `_parse_commandline` to get the script arguments, then generates a new local wallet using `LocalWallet.generate()`, retrieves the authorization address from the parsed arguments, and initializes a `LedgerClient` connected to the Fetch.ai stable testnet.

```python
def main():
    """Run main."""
    args = _parse_commandline()

    wallet = LocalWallet.generate()

    authz_address = args.authz_address

    ledger = LedgerClient(NetworkConfig.fetchai_stable_testnet())

```

--------------------------------

### Creating the Storage Script File

Source: https://github.com/fetchai/docs/blob/main/pages/guides/agent-courses/introductory-course.mdx

Commands to create an empty Python file named `storage.py` on different operating systems to hold the agent script.

```Shell
touch storage.py
```

```Shell
echo. > storage.py
```

--------------------------------

### Install uAgents Library (Pip)

Source: https://github.com/fetchai/docs/blob/main/pages/guides/agents/getting-started/installing-uagent.mdx

Installs the Fetch.ai uagents library using the pip package manager. This downloads the necessary files from PyPI.

```Shell
pip install uagents
```

--------------------------------

### Complete Restaurant Agent Script (Python)

Source: https://github.com/fetchai/docs/blob/main/pages/guides/agent-courses/introductory-course.mdx

The complete script for the restaurant agent. It imports necessary classes and protocols, initializes the agent with network details, includes the booking and query protocols, sets up initial table availability data in storage, and runs the agent.

```Python
from protocols.book import book_proto
from protocols.query import TableStatus, query_proto
from uagents import Agent

restaurant = Agent(
    name="restaurant",
    port=8001,
    seed="restaurant recovery phrase",
    endpoint={
        "http://127.0.0.1:8001/submit": {},
    },
)

# build the restaurant agent from stock protocols and publish their details
restaurant.include(query_proto, publish_manifest=True)
restaurant.include(book_proto, publish_manifest=True)

TABLES = {
    1: TableStatus(seats=2, time_start=16, time_end=22),
    2: TableStatus(seats=4, time_start=19, time_end=21),
    3: TableStatus(seats=4, time_start=17, time_end=19),
}

for number, status in TABLES.items():
    restaurant.storage.set(number, status.dict())

if __name__ == "__main__":
    restaurant.run()
```

--------------------------------

### Create Agent File (Mac/Ubuntu Shell)

Source: https://github.com/fetchai/docs/blob/main/pages/guides/agent-courses/introductory-course.mdx

Use the `touch` command in the shell to create an empty Python file named `alice_agent.py` for your agent code on macOS or Ubuntu systems.

```shell
touch alice_agent.py
```

--------------------------------

### Initializing uAgent for PDF Request (Agent One) - Python

Source: https://github.com/fetchai/docs/blob/main/pages/guides/quickstart-with/langchain/creating-an-agent-with-langchain.mdx

This agent initializes a uAgent instance, defines models for sending PDF path/question requests and receiving document responses. It sends a `DocumentUnderstanding` message on startup and logs the received `DocumentsResponse`.

```Python
from uagents import Agent, Context, Protocol, Model
from ai_engine import UAgentResponse, UAgentResponseType
from typing import List


class DocumentUnderstanding(Model):
    pdf_path: str
    question: str


class DocumentsResponse(Model):
    learnings: List


agent = Agent(
    name="find_in_pdf",
    seed="",
    port=8001,
    endpoint=["http://127.0.0.1:8001/submit"]
)

print("uAgent address: ", agent.address)
summary_protocol = Protocol("Text Summarizer")

RECIPIENT_PDF_AGENT = ""


@agent.on_event("startup")
async def on_startup(ctx: Context):
    await ctx.send(RECIPIENT_PDF_AGENT,
                   DocumentUnderstanding(pdf_path="../a-little-story.pdf", question="What's the synopsis?"))


@agent.on_message(model=DocumentsResponse)
async def document_load(ctx: Context, sender: str, msg: DocumentsResponse):
    ctx.logger.info(msg.learnings)


agent.include(summary_protocol, publish_manifest=True)
agent.run()
```

--------------------------------

### Verifying Fetch Ledger Installation Path - Bash

Source: https://github.com/fetchai/docs/blob/main/pages/guides/fetch-network/ledger/installation.mdx

Uses the which command to locate the installed fetchd binary in the system's PATH. This command confirms whether the installation was successful and shows the path to the executable.

```bash
which fetchd
```

--------------------------------

### Complete uAgent Implementation (Python)

Source: https://github.com/fetchai/docs/blob/main/pages/guides/quickstart-with/langchain/creating-an-agent-with-langchain.mdx

This snippet shows the full code for a simple uAgent that sends a "hello there" message every 2 seconds to a predefined address and logs any incoming messages it receives. It includes agent initialization, message model definition, interval handler, message handler, and the main execution block.

```Python
from uagents import Agent, Context, Model
from uagents.setup import fund_agent_if_low


class Message(Model):
    message: str


RECIPIENT_ADDRESS = "agent1qf4au6rzaauxhy2jze6v85rspgvredx9m42p0e0cukz0hv4dh2sqjuhujpp"

agent = Agent(
    name="agent",
    port=8000,
    seed="",
    endpoint=["http://127.0.0.1:8000/submit"],
)

fund_agent_if_low(agent.wallet.address())


@agent.on_interval(period=2.0)
async def send_message(ctx: Context):
    await ctx.send(RECIPIENT_ADDRESS, Message(message="hello there"))


@agent.on_message(model=Message)
async def message_handler(ctx: Context, sender: str, msg: Message):
    ctx.logger.info(f"Received message from {sender}: {msg.message}")


if __name__ == "__main__":
    agent.run()
```

--------------------------------

### Example Environment Variables (.env)

Source: https://github.com/fetchai/docs/blob/main/pages/examples/examplestech/postgres-database-with-an-agent.mdx

This snippet provides an example .env file structure, listing the environment variables (DB_USER, DB_PASSWORD, DB_NAME) that must be set to configure the database connection for the application.

```dotenv
DB_USER=
DB_PASSWORD=
DB_NAME=
```

--------------------------------

### Handling Startup Event in Research Asking uAgent

Source: https://github.com/fetchai/docs/blob/main/pages/guides/quickstart-with/CrewAI/creating-an-agent-with-crewai.mdx

This asynchronous function is triggered when the 'research_asking_agent' starts. It logs the agent's details and sends an initial CityRequestModel message with the default city to a predefined target agent address.

```Python
@research_asking_agent.on_event("startup")
async def on_startup(ctx: Context):
    """
    Triggered when the agent starts up.

    What it does:
    - Logs the agent's name and address.
    - Sends a message to the target agent with the default city (e.g., 'London').

    Parameters:
    - ctx: Context, provides the execution context for logging and messaging.

    Returns:
    - None: Sends the message to the target agent asynchronously.
    """
    ctx.logger.info(
        f"Hello, I'm {research_asking_agent.name}, and my address is {research_asking_agent.address}."
    )

    await ctx.send(TARGET_AGENT_ADDRESS, CityRequestModel(city=DEFAULT_CITY))
```

--------------------------------

### Install uAgents Library (Windows Pip)

Source: https://github.com/fetchai/docs/blob/main/pages/guides/agents/getting-started/installing-uagent.mdx

Installs the uagents library using pip on a Windows system. This command downloads and installs the package and its dependencies. Requires Python and pip to be in the system PATH.

```Shell
pip install uagents
```

--------------------------------

### Running Senior Research Analyst uAgent

Source: https://github.com/fetchai/docs/blob/main/pages/guides/quickstart-with/CrewAI/creating-an-agent-with-crewai.mdx

This block ensures the Senior Research Analyst agent starts and runs its event loop indefinitely when the script is executed directly. It enables the agent to listen for messages and handle events.

```Python
if __name__ == "__main__":
    """
    Starts the communication agent and begins listening for messages.

    What it does:
    - Runs the agent, enabling it to send/receive messages and handle events.

    Returns:
    - None: Runs the agent loop indefinitely.
    """
    senior_research_analyst_agent.run()
```

--------------------------------

### Install Source Dependencies (Poetry)

Source: https://github.com/fetchai/docs/blob/main/pages/guides/agents/getting-started/installing-uagent.mdx

Installs the project dependencies listed in the `poetry.lock` or `pyproject.toml` file using the Poetry package manager. Requires Poetry to be installed.

```Shell
poetry install
```

--------------------------------

### Example Environment Variable Configuration for Gemini API

Source: https://github.com/fetchai/docs/blob/main/pages/guides/quickstart-with/CrewAI/startup-idea-analyser.mdx

This snippet shows an example configuration for the `.env` file, specifying the required environment variable `GEMINI_API_KEY` needed to authenticate with the Gemini API for the LLM used in the application.

```env
GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"
```

--------------------------------

### Starting fetchd Node with Seed Peers (Bash)

Source: https://github.com/fetchai/docs/blob/main/pages/guides/fetch-network/ledger/joining-testnet.mdx

Starts the `fetchd` node and connects it to the network by specifying a list of seed peer addresses for initial peer discovery.

```bash
fetchd start --p2p.seeds=<network seed peers>
```

--------------------------------

### Running Research Asking uAgent

Source: https://github.com/fetchai/docs/blob/main/pages/guides/quickstart-with/CrewAI/creating-an-agent-with-crewai.mdx

This block ensures the Research Asking agent starts and runs its event loop indefinitely when the script is executed directly. It enables the agent to send messages on startup and listen for incoming research reports.

```Python
if __name__ == "__main__":
    """
    Starts the research analyst agent and begins listening for events.

    What it does:
    - Runs the agent, enabling it to send/receive messages and handle events.

    Returns:
    - None: Runs the agent loop indefinitely.
    """
    research_asking_agent.run()
```

--------------------------------

### Verify uAgents Installation (Pip)

Source: https://github.com/fetchai/docs/blob/main/pages/guides/agents/getting-started/installing-uagent.mdx

Checks the installed version and details of the uagents library using pip, confirming successful installation.

```Shell
pip show uagents
```

--------------------------------

### Create Python File (Windows)

Source: https://github.com/fetchai/docs/blob/main/pages/guides/agent-courses/introductory-course.mdx

Creates an empty file named `agent_communication.py` using the `echo` command with redirection, commonly used on Windows systems. This prepares the file for adding agent code.

```Shell
echo. > agent_communication.py
```