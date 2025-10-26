# Marvin AR Morning Assistant

A revolutionary AR-powered morning assistant built for Snap Spectacles that transforms your daily routine with intelligent, contextual guidance.

## 📋 Project Overview

**Timeline:** 36-Hour MLH Hackathon  
**Team Size:** 4 Developers  
**Target Platform:** Snap Spectacles (2024)  
**Architecture:** Supabase-Focused Integration

### Core Features
- **Real-time Object Recognition** - Identifies 5 demo objects (bowl, laptop, keys, medicine, phone)
- **Gemini Live WebSocket** - Direct real-time visual understanding and natural language processing
- **Voice Synthesis** - ElevenLabs Conversational AI Platform for natural voice interactions
- **Adaptive Learning** - Letta Cloud for stateful memory + Chroma vector embeddings
- **AR Overlays** - Contextual information displayed in real-world space with <100ms latency

## 🏗️ Architecture

This is a Lens Studio project with Supabase Edge Functions backend:

```
marvin/
├── marvin-main/              # Dev 1: Lens Studio (AR + Gemini WebSocket + InternetModule)
│   └── Assets/Scripts/       # TypeScript components for Spectacles
├── snap-cloud/               # Dev 2: Supabase Edge Functions (AI processing)
│   └── functions/            # ai-coordination, letta-sync, voice-synthesis
├── supabase/                 # Dev 3: Supabase Backend (Database + Realtime + Storage)
│   └── migrations/           # Database schema and RLS policies
├── __tests__/                # Dev 4: Integration Tests (TDD framework)
└── docs/                     # API documentation
```

### Developer Responsibilities

| Developer | Focus | Key Deliverables |
|-----------|-------|------------------|
| **Dev 1** | Lens Studio AR | Object detection, AR overlays, Gemini WebSocket, InternetModule HTTP |
| **Dev 2** | Edge Functions | Fix mocks, add Letta/ElevenLabs/Chroma integration |
| **Dev 3** | Supabase Backend | Database schema, RLS policies, Realtime, Storage |
| **Dev 4** | TDD & DevOps | Testing framework, integration tests, CI/CD, merges |

## 📚 Documentation

### Essential Documents
- **[prd.md](prd.md)** - Complete Product Requirements Document with system architecture
- **[tasklist.md](tasklist.md)** - Detailed task breakdown by developer (36-hour timeline)
- **[INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)** - Step-by-step integration instructions
- **[ARCHITECTURE_UPDATED.md](ARCHITECTURE_UPDATED.md)** - System architecture deep dive

### API References
- **[docs/snap.md](docs/snap.md)** - Snap Spectacles API reference
- **[docs/gemini.md](docs/gemini.md)** - Gemini Live API integration guide
- **[docs/elevenlabs.md](docs/elevenlabs.md)** - ElevenLabs voice synthesis
- **[docs/chroma.md](docs/chroma.md)** - Chroma vector database

## 🚀 Quick Start

### Prerequisites
- Lens Studio 5.15.0+
- Git with LFS: `brew install git-lfs && git lfs install`
- Node.js 20 LTS
- Supabase CLI: `npm install -g supabase`
- Spectacles (2024) device with OS v5.64+

### Installation

**⚠️ IMPORTANT: Must clone with Git LFS (do not download ZIP)**

```bash
# Install Git LFS first
brew install git-lfs
git lfs install

# Clone repository
git clone https://github.com/amogharyan/marvin.git
cd marvin

# Install dependencies
npm install

# Initialize Supabase
cd snap-cloud
supabase init
supabase start
```

### Setup by Developer

**Dev 1: Lens Studio**
```bash
# Open Lens Studio project
open marvin-main/Marvin.esproj

# Install required packages in Lens Studio:
# - Remote Service Gateway Token Generator
# - SpectaclesInteractionKit.lspkg
# - SupabaseClient.lspkg (from Supabase example)
# - Internet Module.internetModule (from Supabase example)

# Set Device Type to "Spectacles (2024)" in Preview Panel
```

**Dev 2: Edge Functions**
```bash
cd snap-cloud

# Create Edge Functions
supabase functions new ai-coordination
supabase functions new letta-sync
supabase functions new voice-synthesis

# Set secrets
supabase secrets set GEMINI_API_KEY=your_key_here
supabase secrets set ELEVENLABS_API_KEY=your_key_here
supabase secrets set LETTA_API_KEY=your_key_here

# Deploy
supabase functions deploy
```

**Dev 3: Database**
```bash
cd snap-cloud

# Create and run migrations
supabase migration new initial_schema
# Edit migration file, then:
supabase db push

# Set up Realtime
# (See INTEGRATION_GUIDE.md for detailed schema)
```

**Dev 4: Testing**
```bash
# Install test dependencies
npm install --save-dev jest ts-jest @types/jest

# Run tests
npm test

# Set up CI/CD
# (GitHub Actions workflows already in .github/workflows/)
```

## 🎯 Development Workflow

### Phase 1: Foundation (Hours 0-8)
All developers work in parallel:
- Dev 1: Object detection + AR overlays + Gemini WebSocket
- Dev 2: Create Edge Functions structure + fix mocks
- Dev 3: Database schema + RLS policies
- Dev 4: Write failing tests (TDD)

**Hour 8 Checkpoint:** All devs merge to `develop` branch

### Phase 2: Integration (Hours 8-16)
- Dev 1: Add InternetModule HTTP calls to Edge Functions
- Dev 2: Integrate real APIs (Gemini, ElevenLabs, Letta, Chroma)
- Dev 3: Realtime subscriptions + Storage buckets
- Dev 4: Integration testing

**Hour 16 Checkpoint:** Full integration working end-to-end

### Phase 3: Demo Polish (Hours 16-36)
- Hours 16-24: Advanced features + demo optimization
- Hours 24-30: Testing + refinement + rehearsal
- Hours 30-36: Final preparation + backup systems

See **[tasklist.md](tasklist.md)** for complete hour-by-hour breakdown.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run integration tests
npm run test:integration

# Check TypeScript compilation
npm run type-check

# Lint code
npm run lint
```

## 📦 Project Structure
  ```
  
  To upgrade:

  ```sh
  brew upgrade supabase
  ```
</details>

<details>
  <summary><b>Windows</b></summary>

  Available via [Scoop](https://scoop.sh). To install:

  ```powershell
  scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
  scoop install supabase
  ```

  To upgrade:

  ```powershell
  scoop update supabase
  ```
</details>

<details>
  <summary><b>Linux</b></summary>

  Available via [Homebrew](https://brew.sh) and Linux packages.

  #### via Homebrew

  To install:

  ```sh
  brew install supabase/tap/supabase
  ```

  To upgrade:

  ```sh
  brew upgrade supabase
  ```

  #### via Linux packages

  Linux packages are provided in [Releases](https://github.com/supabase/cli/releases). To install, download the `.apk`/`.deb`/`.rpm`/`.pkg.tar.zst` file depending on your package manager and run the respective commands.

  ```sh
  sudo apk add --allow-untrusted <...>.apk
  ```

  ```sh
  sudo dpkg -i <...>.deb
  ```

  ```sh
  sudo rpm -i <...>.rpm
  ```

  ```sh
  sudo pacman -U <...>.pkg.tar.zst
  ```
</details>

<details>
  <summary><b>Other Platforms</b></summary>

  You can also install the CLI via [go modules](https://go.dev/ref/mod#go-install) without the help of package managers.

  ```sh
  go install github.com/supabase/cli@latest
  ```

  Add a symlink to the binary in `$PATH` for easier access:

  ```sh
  ln -s "$(go env GOPATH)/bin/cli" /usr/bin/supabase
  ```

  This works on other non-standard Linux distros.
</details>

<details>
  <summary><b>Community Maintained Packages</b></summary>

  Available via [pkgx](https://pkgx.sh/). Package script [here](https://github.com/pkgxdev/pantry/blob/main/projects/supabase.com/cli/package.yml).
  To install in your working directory:

  ```bash
  pkgx install supabase
  ```

  Available via [Nixpkgs](https://nixos.org/). Package script [here](https://github.com/NixOS/nixpkgs/blob/master/pkgs/development/tools/supabase-cli/default.nix).
</details>

### Run the CLI

```bash
supabase bootstrap
```

Or using npx:

```bash
npx supabase bootstrap
```

The bootstrap command will guide you through the process of setting up a Supabase project using one of the [starter](https://github.com/supabase-community/supabase-samples/blob/main/samples.json) templates.

## Docs

Command & config reference can be found [here](https://supabase.com/docs/reference/cli/about).

## Breaking changes

We follow semantic versioning for changes that directly impact CLI commands, flags, and configurations.

However, due to dependencies on other service images, we cannot guarantee that schema migrations, seed.sql, and generated types will always work for the same CLI major version. If you need such guarantees, we encourage you to pin a specific version of CLI in package.json.

## Developing

To run from source:

```sh
# Go >= 1.22
go run . help
```
