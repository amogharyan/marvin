## Product Planning with GitHub Copilot

Use GitHub Copilot agents to plan and document your product comprehensively.

### Process Overview

This workflow creates complete product documentation using the agent-os system integrated with GitHub Copilot's @ agent pattern.

### Phase 1: Product Planning

Use the `@product-planner` agent to create comprehensive product documentation:

```
@product-planner Create product documentation for [product description], including mission, roadmap, and technical stack decisions.
```

The product-planner will:
- Analyze product requirements and user personas
- Create `agent-os/product/mission.md` with vision and strategy
- Generate `agent-os/product/roadmap.md` with prioritized features
- Document `agent-os/product/tech-stack.md` with all technical decisions

### Phase 2: Technical Specifications

Once product documentation is complete, proceed with feature specifications:

```
@spec-initializer Create specification structure for [feature name]
@spec-shaper Research detailed requirements for [feature]
@spec-writer Create technical specification from requirements
@tasks-list-creator Break down specification into implementation tasks
```

### Phase 3: Implementation & Verification

Execute development workflow with verification:

```
@implementer Implement [specific task group] from specification
@implementation-verifier Verify implementation meets specification requirements
```

### Integration with Agent-OS Standards

All agents automatically reference and apply:
- `agent-os/standards/global/` - Core development standards
- `agent-os/standards/backend/` - API and database patterns  
- `agent-os/standards/frontend/` - UI and accessibility guidelines
- `agent-os/standards/testing/` - Testing strategies and coverage

### Project-Specific Context

For the AR Morning Assistant project, agents understand:
- Snap Spectacles platform requirements and constraints
- Gemini API integration for multimodal AI processing
- ElevenLabs voice synthesis and Vapi conversation handling
- Chroma vector database for contextual memory
- Demo environment requirements and performance targets

Your product planning is complete when you have:
- ✅ Product mission document with clear vision
- ✅ Development roadmap with prioritized features  
- ✅ Technical stack documentation
- ✅ Integration with existing agent-os standards

✅ Product mission: `agent-os/product/mission.md`
✅ Product roadmap: `agent-os/product/roadmap.md`
✅ Product tech stack: `agent-os/product/tech-stack.md`

NEXT STEP 👉 Run `/shape-spec` or `/write-spec` to start work on a feature!
```
