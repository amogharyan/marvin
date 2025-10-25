## Task Creation with GitHub Copilot

Use GitHub Copilot agents to break down specifications into organized implementation tasks.

### Process Overview

Transform technical specifications into strategic task lists using the agent-os workflow with GitHub Copilot.

### Phase 1: Task List Creation

Use the `@tasks-list-creator` agent to create organized implementation tasks:

```
@tasks-list-creator Create implementation tasks for [feature] specification, organizing by [AR development, AI integration, backend services]
```

The tasks-list-creator will:
- Analyze spec.md and requirements.md for complete context
- Break down specifications into manageable, actionable tasks
- Group tasks by specialization and technical dependencies
- Create strategic ordering for efficient implementation
- Provide effort estimates and milestone planning

### Required Context

The agent needs access to:
- `agent-os/specs/[feature]/spec.md` - Technical specification
- `agent-os/specs/[feature]/planning/requirements.md` - Business requirements
- `agent-os/specs/[feature]/planning/visuals/` - Design assets (if available)

If these files don't exist, create them first:
```
@spec-shaper Research requirements for [feature]
@spec-writer Create technical specification from requirements
```

### Integration with Project Architecture

For the AR Morning Assistant, tasks are automatically organized by:
- **AR Frontend Tasks**: Snap Spectacles integration, object detection, UI overlays
- **AI Processing Tasks**: Gemini API integration, voice synthesis, context memory
- **Backend Tasks**: Express APIs, database operations, external integrations
- **DevOps Tasks**: CI/CD setup, deployment configuration, monitoring

### Task Organization Patterns

Tasks are strategically grouped by:
- **Technical Dependencies**: Foundation → Core Features → Integration → Polish
- **Specialization Areas**: AR development, AI services, backend APIs, frontend UI
- **Project Phases**: Setup → Implementation → Testing → Verification
- **Risk Mitigation**: Critical path items prioritized for demo reliability

### Output Structure

Creates `agent-os/specs/[feature]/tasks.md` with:
- Strategic task groupings by specialization
- Clear dependency chains and execution order
- Effort estimates (XS: 1 day, S: 2-3 days, M: 1 week, L: 2 weeks, XL: 3+ weeks)
- Acceptance criteria for each task

✅ Tasks list created: `agent-os/specs/[feature]/tasks.md`

**NEXT STEP** 👉 Use `@implementer` to start building, or `@implementation-verifier` for orchestrated development workflow.
