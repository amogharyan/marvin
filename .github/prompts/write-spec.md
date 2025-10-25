## Specification Writing with GitHub Copilot

Use GitHub Copilot agents to create comprehensive technical specifications.

### Process Overview

Transform feature ideas into detailed technical specifications using the agent-os workflow integrated with GitHub Copilot.

### Phase 1: Specification Creation

Use the `@spec-writer` agent to create detailed technical specifications:

```
@spec-writer Create technical specification for [feature] based on requirements in agent-os/specs/[spec-folder]/planning/requirements.md
```

The spec-writer will:
- Analyze existing codebase patterns for reusability
- Design API interfaces and data models  
- Define system integration points
- Create detailed implementation guidance
- Ensure alignment with agent-os standards

### Integration with Project Context

For the AR Morning Assistant project, specifications automatically consider:
- **Snap Spectacles Platform**: Object detection, spatial tracking, AR overlays
- **AI Processing**: Gemini API integration, voice synthesis, contextual memory
- **Backend Services**: Express APIs, Chroma vector database, external integrations
- **Demo Requirements**: Performance targets, reliability, 2-minute demo flow

### Next Steps

Once specification is complete:

```
@tasks-list-creator Create implementation tasks for [feature] specification
```

Your specification is ready for task planning and implementation!

✅ Spec document created in `agent-os/specs/[feature]/spec.md`

**NEXT STEP** 👉 Use `@tasks-list-creator` to generate your implementation tasks.
