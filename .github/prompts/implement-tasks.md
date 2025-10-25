## Implementation with GitHub Copilot

Use GitHub Copilot agents to implement features systematically following specifications and task lists.

### Process Overview

Execute implementation workflow using the agent-os system integrated with GitHub Copilot's @ agent pattern.

### Phase 1: Implementation Planning

Determine implementation scope and task prioritization:

```
@implementer Review tasks in agent-os/specs/[feature]/tasks.md and implement [specific task group or "all tasks"]
```

If no specific tasks are specified, the system will:
- Review available task groups in the tasks.md file
- Suggest optimal implementation order based on dependencies
- Allow selective implementation of specific task groups

### Phase 2: Feature Implementation

Execute implementation using the `@implementer` agent:

```
@implementer Implement [task group name] from agent-os/specs/[feature]/tasks.md
```

The implementer will:
- Analyze specifications, requirements, and visual assets
- Follow established codebase patterns and agent-os standards
- Implement features with proper error handling and testing
- Update task completion status in tasks.md
- Ensure integration with existing system components

### Phase 3: Implementation Verification

Once all tasks are complete, verify the implementation:

```
@implementation-verifier Verify implementation of [feature] against specification requirements
```

The verification process includes:
- End-to-end functionality testing
- Code quality and standards compliance review
- Performance validation against project targets
- Integration testing with existing components
- Documentation accuracy verification

### Project-Specific Implementation

For the AR Morning Assistant, implementation covers:

#### AR Frontend (Snap Spectacles)
- Object detection integration and calibration
- AR overlay rendering and spatial tracking
- Hand gesture recognition and interaction handling
- Demo environment optimization

#### AI Processing Services
- Gemini API integration for multimodal understanding
- ElevenLabs voice synthesis implementation
- Vapi conversation handling and context management
- Chroma vector database for learning and memory

#### Backend Services
- Express API endpoints and middleware
- External service integrations (Calendar, Health APIs)
- WebSocket real-time communication
- Error handling and fallback systems

### Implementation Standards

All implementations must follow:
- `agent-os/standards/global/coding-style.md` - Code formatting and structure
- `agent-os/standards/global/error-handling.md` - Error management patterns
- `agent-os/standards/testing/test-writing.md` - Testing requirements
- Project-specific performance targets (AR latency <100ms, demo reliability 99%+)

### Workflow Completion

Implementation is complete when:
- ✅ All tasks marked complete in tasks.md
- ✅ Full test suite passes without regressions
- ✅ End-to-end demo workflow functions properly
- ✅ Code meets all quality and performance standards
- ✅ Implementation verification report generated

**NEXT STEP** 👉 Use `@implementation-verifier` to generate final verification report.

Provide to the subagent the following:
- The path to this spec: `agent-os/specs/[this-spec]`
Instruct the subagent to do the following:
  1. Run all of its final verifications according to its built-in workflow
  2. Produce the final verification report in `agent-os/specs/[this-spec]/verifications/final-verification.md`.
