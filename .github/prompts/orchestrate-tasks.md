## Advanced Implementation Orchestration with GitHub Copilot

Use GitHub Copilot agents for sophisticated, multi-phase implementation coordination across complex specifications.

### Process Overview

Orchestrate implementation across multiple task groups using GitHub Copilot agents with strategic coordination and dependency management.

### Phase 1: Implementation Orchestration Setup

Create orchestration roadmap for complex implementations:

```
@tasks-list-creator Create orchestration plan for agent-os/specs/[feature]/tasks.md with multi-agent coordination
```

This creates strategic implementation coordination with:
- Task group dependencies and execution order
- Specialization-based agent assignments
- Integration checkpoints and validation gates
- Risk mitigation and fallback strategies

### Phase 2: Coordinated Implementation

Execute implementation using multiple specialized agents:

#### AR Frontend Development
```
@implementer Implement AR frontend tasks (Snap Spectacles integration, object detection, overlay rendering)
```

#### AI Processing Integration
```
@implementer Implement AI processing tasks (Gemini API, voice synthesis, contextual memory)
```

#### Backend Services Development
```
@implementer Implement backend tasks (Express APIs, database operations, external integrations)
```

#### System Integration
```
@implementer Implement integration tasks (WebSocket communication, error handling, performance optimization)
```

### Phase 3: Continuous Verification

Validate implementation progress at each phase:

```
@implementation-verifier Verify [completed task group] implementation before proceeding to dependent tasks
```

This ensures:
- Quality gates are maintained throughout development
- Integration issues are caught early
- Performance targets are continuously validated
- Demo requirements remain achievable

### Advanced Orchestration Features

#### Dependency Management
- **Technical Dependencies**: Foundation services before dependent features
- **Integration Dependencies**: Core APIs before consumer applications
- **Performance Dependencies**: Critical path optimization before advanced features

#### Risk Mitigation
- **Parallel Development**: Independent task groups executed simultaneously
- **Integration Checkpoints**: Regular validation of system connectivity
- **Fallback Planning**: Backup approaches for high-risk components

#### Quality Assurance
- **Continuous Testing**: Automated testing throughout implementation phases
- **Standards Compliance**: Agent-os standards enforcement at each step
- **Performance Monitoring**: Real-time validation of demo requirements

### Project-Specific Orchestration

For the AR Morning Assistant, orchestration coordinates:

1. **Foundation Phase**: Core infrastructure and API setup
2. **AR Integration Phase**: Snap Spectacles and object detection
3. **AI Services Phase**: Gemini, ElevenLabs, and Vapi integration
4. **System Integration Phase**: End-to-end workflow and data flow
5. **Demo Optimization Phase**: Performance tuning and reliability

### Orchestration Output

Creates comprehensive tracking with:
- `agent-os/specs/[feature]/orchestration.yml` - Execution roadmap
- Phase completion status and quality gates
- Integration test results and performance metrics
- Risk assessment and mitigation effectiveness

### When to Use Orchestration

Use orchestrated implementation for:
- Complex features with multiple integration points
- High-risk implementations requiring careful coordination
- Multi-developer projects with specialized expertise needs
- Demo-critical features requiring maximum reliability

**BENEFIT**: Orchestration provides systematic coordination, early issue detection, and higher success rates for complex implementations.

```yaml
task_groups:
  - name: [task-group-name]
  - name: [task-group-name]
  - name: [task-group-name]
  # Repeat for each task group found in tasks.md
```

### NEXT: Ask user to assign subagents to each task group

Next we must determine which subagents should be assigned to which task groups.  Ask the user to provide this info using the following request to user and WAIT for user's response:

```
Please specify the name of each subagent to be assigned to each task group:

1. [task-group-name]
2. [task-group-name]
3. [task-group-name]
[repeat for each task-group you've added to orchestration.yml]

Simply respond with the subagent names and corresponding task group number and I'll update orchestration.yml accordingly.
```

Using the user's responses, update `orchestration.yml` to specify those subagent names.  `orchestration.yml` should end up looking like this:

```yaml
task_groups:
  - name: [task-group-name]
    claude_code_subagent: [subagent-name]
  - name: [task-group-name]
    claude_code_subagent: [subagent-name]
  - name: [task-group-name]
    claude_code_subagent: [subagent-name]
  # Repeat for each task group found in tasks.md
```

For example, after this step, the `orchestration.yml` file might look like this (exact names will vary):

```yaml
task_groups:
  - name: authentication-system
    claude_code_subagent: backend-specialist
  - name: user-dashboard
    claude_code_subagent: frontend-specialist
  - name: api-endpoints
    claude_code_subagent: backend-specialist
```

### NEXT: Ask user to assign standards to each task group

Next we must determine which standards should guide the implementation of each task group.  Ask the user to provide this info using the following request to user and WAIT for user's response:

```
Please specify the standard(s) that should be used to guide the implementation of each task group:

1. [task-group-name]
2. [task-group-name]
3. [task-group-name]
[repeat for each task-group you've added to orchestration.yml]

For each task group number, you can specify any combination of the following:

"all" to include all of your standards
"global/*" to include all of the files inside of standards/global
"frontend/css.md" to include the css.md standard file
"none" to include no standards for this task group.
```

Using the user's responses, update `orchestration.yml` to specify those standards for each task group.  `orchestration.yml` should end up having AT LEAST the following information added to it:

```yaml
task_groups:
  - name: [task-group-name]
    standards:
      - [users' 1st response for this task group]
      - [users' 2nd response for this task group]
      - [users' 3rd response for this task group]
      # Repeat for all standards that the user specified for this task group
  - name: [task-group-name]
    standards:
      - [users' 1st response for this task group]
      - [users' 2nd response for this task group]
      # Repeat for all standards that the user specified for this task group
  # Repeat for each task group found in tasks.md
```

For example, after this step, the `orchestration.yml` file might look like this (exact names will vary):

```yaml
task_groups:
  - name: authentication-system
    standards:
      - all
  - name: user-dashboard
    standards:
      - global/*
      - frontend/components.md
      - frontend/css.md
  - name: task-group-with-no-standards
  - name: api-endpoints
    standards:
      - backend/*
      - global/error-handling.md
```

Note: If the `use_claude_code_subagents` flag is enabled, the final `orchestration.yml` would include BOTH `claude_code_subagent` assignments AND `standards` for each task group.

### NEXT: Delegate task groups implementations to assigned subagents

Loop through each task group in `agent-os/specs/[this-spec]/tasks.md` and delegate its implementation to the assigned subagent specified in `orchestration.yml`.

For each delegation, provide the subagent with:
- The task group (including the parent task and all sub-tasks)
- The spec file: `agent-os/specs/[this-spec]/spec.md`
- Instruct subagent to:
  - Perform their implementation
  - Check off the task and sub-task(s) in `agent-os/specs/[this-spec]/tasks.md`

In addition to the above items, also instruct the subagent to closely adhere to the user's standards & preferences as specified in the following files.  To build the list of file references to give to the subagent, follow these instructions:

#### Compile Implementation Standards

Use the following logic to compile a list of file references to standards that should guide implementation:

##### Steps to Compile Standards List

1. Find the current task group in `orchestration.yml`
2. Check the list of `standards` specified for this task group in `orchestration.yml`
3. Compile the list of file references to those standards, one file reference per line, using this logic for determining which files to include:
   a. If the value for `standards` is simply `all`, then include every single file, folder, sub-folder and files within sub-folders in your list of files.
   b. If the item under standards ends with "*" then it means that all files within this folder or sub-folder should be included. For example, `frontend/*` means include all files and sub-folders and their files located inside of `agent-os/standards/frontend/`.
   c. If a file ends in `.md` then it means this is one specific file you must include in your list of files. For example `backend/api.md` means you must include the file located at `agent-os/standards/backend/api.md`.
   d. De-duplicate files in your list of file references.

##### Output Format

The compiled list of standards should look something like this, where each file reference is on its own line and begins with `@`. The exact list of files will vary:

```
@agent-os/standards/global/coding-style.md
@agent-os/standards/global/conventions.md
@agent-os/standards/global/tech-stack.md
@agent-os/standards/backend/api/authentication.md
@agent-os/standards/backend/api/endpoints.md
@agent-os/standards/backend/api/responses.md
@agent-os/standards/frontend/css.md
@agent-os/standards/frontend/responsive.md
```


Provide all of the above to the subagent when delegating tasks for it to implement.
