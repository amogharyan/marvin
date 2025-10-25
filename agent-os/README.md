# Agent-OS + GitHub Copilot Integration

This project uses the Agent-OS development system integrated with GitHub Copilot to provide structured, standards-compliant development workflows.

## Overview

Agent-OS provides a systematic approach to product development with specialized agents for each phase of the development lifecycle. The system is now optimized for GitHub Copilot's `@agent` pattern for seamless integration.

## Available Agents

### Product Planning
- **`@product-planner`** - Creates comprehensive product documentation including mission, roadmap, and tech stack decisions

### Specification Development
- **`@spec-initializer`** - Initializes specification folder structure and captures feature ideas
- **`@spec-shaper`** - Gathers detailed requirements through targeted research and analysis
- **`@spec-writer`** - Creates comprehensive technical specifications from requirements
- **`@spec-verifier`** - Validates specifications for completeness and feasibility

### Implementation Management
- **`@tasks-list-creator`** - Breaks down specifications into organized, actionable task lists
- **`@implementer`** - Implements features following specifications and agent-os standards
- **`@implementation-verifier`** - Verifies implementations meet quality and functionality requirements

## Quick Start Workflows

### Planning a New Product
```
@product-planner Create product documentation for [product description]
```

### Developing a New Feature
```
@spec-initializer Create specification structure for "[feature description]"
@spec-shaper Research detailed requirements for [feature]
@spec-writer Create technical specification from requirements
@tasks-list-creator Create implementation tasks for [feature]
@implementer Implement [specific task group or "all tasks"]
@implementation-verifier Verify implementation meets requirements
```

### Simplified Feature Development
```
@spec-writer Create specification for [feature description]
@implementer Implement [feature] following specification
```

## Project Structure

```
agent-os/
├── product/                    # Product documentation
│   ├── mission.md             # Product vision and strategy
│   ├── roadmap.md             # Development roadmap
│   └── tech-stack.md          # Technical architecture decisions
├── specs/                     # Feature specifications
│   └── [date-feature-name]/   # Individual feature folders
│       ├── idea.md            # Original feature concept
│       ├── spec.md            # Technical specification
│       ├── tasks.md           # Implementation tasks
│       ├── planning/          # Requirements and research
│       ├── implementation/    # Development tracking
│       └── verification/      # Testing and validation
└── standards/                 # Development standards
    ├── global/                # Core standards (coding style, conventions)
    ├── backend/               # API and database patterns
    ├── frontend/              # UI and accessibility guidelines
    └── testing/               # Testing strategies
```

## Standards Integration

All agents automatically reference and apply standards from:
- `agent-os/standards/global/` - Core development practices
- `agent-os/standards/backend/` - API design and database patterns
- `agent-os/standards/frontend/` - UI components and accessibility
- `agent-os/standards/testing/` - Testing approaches and coverage

## Project-Specific Context

This system is configured for the **Marvin AR Morning Assistant** project with:

### Technical Stack
- **AR Platform**: Snap Spectacles + Lens Studio + TypeScript
- **AI Processing**: Gemini API + ElevenLabs + Vapi integration
- **Backend**: Node.js + Express + Chroma vector database
- **DevOps**: GitHub Actions + Docker deployment

### Key Requirements
- Object detection for 5 demo objects (bowl, laptop, keys, medicine, phone)
- AR overlay latency <100ms for smooth user experience
- Voice processing <2s end-to-end for natural conversation
- 99%+ demo reliability for hackathon presentation
- 36-hour development timeline with CI/CD integration

## Advanced Features

### Orchestrated Implementation
For complex features requiring coordination across multiple specializations:
```
Use orchestrated implementation workflow for multi-phase coordination
```

### Continuous Verification
Quality gates throughout development ensure:
- Standards compliance at each implementation phase
- Integration testing and performance validation
- Demo requirements continuously verified

## Configuration

The system is configured in `agent-os/config.yml`:
- GitHub Copilot integration enabled
- Agent-OS standards as knowledge base
- Workspace context awareness
- Project-specific optimizations

## Usage Tips

1. **Start with Product Planning**: Use `@product-planner` for new projects
2. **Follow the Workflow**: Initialize → Shape → Write → Task → Implement → Verify
3. **Use Specific Context**: Provide clear feature descriptions and requirements
4. **Leverage Standards**: Agents automatically apply project standards and patterns
5. **Verify Continuously**: Use verification agents to maintain quality throughout development

## Integration with GitHub Copilot

The agent-os system enhances GitHub Copilot with:
- **Structured Workflows**: Systematic approach to feature development
- **Standards Enforcement**: Automatic application of coding and design standards
- **Context Awareness**: Project-specific knowledge and constraints
- **Quality Assurance**: Built-in verification and validation processes
- **Documentation**: Comprehensive tracking of decisions and implementations

This creates a powerful development environment that combines GitHub Copilot's AI capabilities with agent-os's systematic development methodology.
