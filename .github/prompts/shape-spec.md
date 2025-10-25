## Specification Shaping with GitHub Copilot

Use GitHub Copilot agents to shape and plan feature scope through systematic requirements research.

### Process Overview

Transform initial feature ideas into well-defined requirements through targeted research and analysis using the agent-os workflow.

### Phase 1: Specification Initialization

Start by creating the specification structure:

```
@spec-initializer Create specification structure for "[feature description]"
```

The spec-initializer will:
- Create organized folder structure in `agent-os/specs/[date-feature-name]/`
- Capture the raw feature idea exactly as provided
- Set up implementation and verification tracking frameworks
- Prepare structure for requirements research

### Phase 2: Requirements Research

Conduct comprehensive requirements gathering:

```
@spec-shaper Research detailed requirements for [feature], focusing on [specific aspects like user experience, technical constraints, integration points]
```

The spec-shaper will:
- Ask targeted clarifying questions about functionality and scope
- Request relevant visual assets, mockups, and design references
- Analyze product context and roadmap alignment
- Identify opportunities for code reuse and pattern consistency
- Document comprehensive requirements with acceptance criteria

### Phase 3: Requirements Validation

Ensure requirements completeness and accuracy:

```
@spec-verifier Review requirements for [feature] to ensure completeness and feasibility
```

The verification process validates:
- Requirements accurately reflect user needs and business objectives
- Technical approach is feasible within project constraints
- Integration points with existing systems are well-defined
- Success criteria and acceptance tests are clear

### Integration with Project Context

For the AR Morning Assistant, specification shaping considers:

#### Technical Constraints
- Snap Spectacles platform capabilities and limitations
- AR rendering performance requirements (<100ms latency)
- Demo environment reliability and consistency needs

#### Integration Requirements
- Gemini API for multimodal AI processing
- ElevenLabs voice synthesis and Vapi conversation handling
- Chroma vector database for contextual memory and learning
- External APIs (Google Calendar, Health services)

#### User Experience Requirements
- Hands-free AR interaction patterns
- Contextual assistance based on object recognition
- Natural voice conversation and feedback
- Adaptive learning and personalization

### Output Structure

Creates organized requirements documentation in:
- `agent-os/specs/[feature]/idea.md` - Original feature concept
- `agent-os/specs/[feature]/planning/requirements.md` - Detailed requirements
- `agent-os/specs/[feature]/planning/visuals/` - Design assets and references

### Quality Gates

Requirements are ready for specification writing when:
- ✅ Functional requirements clearly defined with acceptance criteria
- ✅ Technical constraints and integration points documented
- ✅ User experience flows and interaction patterns specified
- ✅ Performance targets and quality requirements established
- ✅ Success metrics and validation approaches defined

**NEXT STEP** 👉 Use `@spec-writer` to create detailed technical specification from requirements.

The spec-researcher will give you several separate responses that you MUST show to the user. These include:
1. Numbered clarifying questions along with a request for visual assets (show these to user, wait for user's response)
2. Follow-up questions if needed (based on user's answers and provided visuals)

**IMPORTANT**:
- Display these questions to the user and wait for their response
- The spec-researcher may ask you to relay follow-up questions that you must present to user

### PHASE 3: Inform the user

After all steps complete, inform the user:

```
Spec shaping is complete!

✅ Spec folder created: `[spec-path]`
✅ Requirements gathered
✅ Visual assets: [Found X files / No files provided]

NEXT STEP 👉 Run `/write-spec` to generate the detailed specification document.
```
