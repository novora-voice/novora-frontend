# Principal AI Engineer Prompt: Upgrade Novora’s Existing Frontend to Match the New Backend Architecture

## 1. Your role

Act as a **Principal Frontend Engineer and AI Product Engineer** responsible for upgrading the existing Novora frontend to integrate correctly with the new multi-provider voice-agent testing and evaluation backend.

You are working inside an existing application. Your responsibility is to evolve the current product, not rebuild it.

Novora is an AI voice-agent testing, evaluation, and monitoring platform.

Its product promise is:

**Test. Observe. Improve.**

Users should be able to connect a voice-agent provider, select an agent, create or choose a scenario, configure deterministic and LLM-based evaluation criteria, execute a supported test, observe the actual interaction, and review an evidence-backed evaluation report.

The backend is being developed around a shared provider-neutral execution and evaluation engine with provider-specific adapters for:

- ElevenLabs
- AssemblyAI
- Vapi
- Retell

The frontend must reflect this architecture without exposing unnecessary backend complexity to users.

## 2. Core objective: Evolve the existing frontend

Before writing code, inspect the frontend I previously supplied, its current design, the repository structure, existing components, routes, API clients, authentication, state management, and styling conventions.

Also inspect the backend implementation and its actual API contracts.

Your task is to update the existing frontend so that it supports the new backend functionality while preserving the approved visual direction of the existing Novora design.

### Non-negotiable design rules

1. Preserve the existing design system, visual identity, approved logo, typography, colors, spacing, component styles, navigation, and layout unless a specific change is necessary to support the new functionality.
2. Do not redesign the application from scratch.
3. Do not replace the existing dashboard with a generic AI SaaS template.
4. Do not introduce a new design system, UI framework, or component library without a demonstrated technical need.
5. Reuse existing cards, buttons, modals, tables, tabs, dropdowns, badges, forms, charts, and other components.
6. Add new controls using the same visual language as the existing interface.
7. Do not modify unrelated screens or remove existing features.
8. Keep all existing working functionality operational.
9. Do not create decorative controls that have no functional implementation.
10. Do not fabricate metrics, provider connection states, evaluation results, or test-run activity.

**The goal is to preserve the approved design while making the product functionally complete and consistent with the new backend.**

If the supplied frontend design includes specific visual treatments or branding, treat those as the source of truth. Do not substitute a new aesthetic based on personal preference.

## 3. Repository and backend audit

Before making changes:

1. Confirm the current Git branch and inspect `git status`.
2. Identify the existing frontend framework, package manager, folder structure, routes, components, styles, and dependencies.
3. Inspect the existing provider, agent, scenario, evaluation, and report screens.
4. Identify which components and workflows already exist and which are missing.
5. Inspect the backend API routes, request and response schemas, authentication requirements, and error formats.
6. Identify the integration gaps between the existing frontend and the actual backend.
7. Check whether an API client, query library, polling mechanism, WebSocket client, or shared state solution already exists.
8. Produce a concise implementation plan before making substantial changes.

Do not infer endpoint names or payload structures from this prompt. Use the actual backend implementation and documented API contracts.

If the backend is still being developed, identify the missing contract explicitly. Do not silently invent a replacement contract or make the frontend depend on unsupported functionality.

## 4. Git branch and code preservation

You own the frontend branch:

`feat/provider-testing-dashboard`

The backend work is owned by:

`feat/provider-evaluation-engine`

Rules:

- Work only on the frontend branch.
- Do not switch branches if doing so risks losing existing work.
- Do not merge directly into `main`.
- Do not reset the repository or discard uncommitted changes.
- Do not overwrite existing components merely to make implementation easier.
- Do not modify backend implementation files.
- Coordinate integration through the actual backend API contracts.
- Keep changes focused, incremental, and reviewable.

If the current branch is incorrect, stop and report the situation rather than switching unsafely.

## 5. Provider management and the Agents page

Update the existing Agents page to support the new provider structure.

Organize providers into two categories using the existing page layout and styling.

### Voice Providers

- ElevenLabs
- AssemblyAI

### Infrastructure Providers

- Vapi
- Retell

These categories are product organization labels. Do not imply that infrastructure providers cannot support voice-agent execution.

Each provider entry should reuse the existing card or row design and show relevant information supported by the backend, such as:

- Provider name and logo, where available.
- Provider category.
- Connection status.
- Number of configured agents, if available.
- Available capabilities.
- Relevant setup or configuration actions.

Use the actual backend connection state. Distinguish clearly between:

- Not configured.
- Configured but not verified.
- Connected and verified.
- Connection error.

Do not mark a provider as connected simply because credentials have been entered.

### Provider configuration

Allow users to configure the necessary provider credentials and settings through the existing UI patterns.

Requirements:

- Send credentials directly to the backend over the existing secure API flow.
- Never persist secret tokens in browser local storage or session storage.
- Never expose saved credentials in API responses.
- Mask secrets when displaying configuration state.
- Provide meaningful validation and error messages.
- Include a connection verification action only when the backend supports it.
- Display supported capabilities based on the backend response.

Do not build four independent frontend applications. All providers should use shared components and a common configuration pattern, with provider-specific fields rendered when necessary.

## 6. Agent selection and configuration

Users must be able to select or configure the agent they want to test.

The workflow should support:

1. Select a provider.
2. Retrieve available agents when the provider supports agent discovery.
3. Select an existing agent or enter its required agent ID.
4. Validate the configuration.
5. Display the selected provider and agent clearly.
6. Continue to scenario selection.

Use provider-specific forms only where the configuration genuinely differs.

Do not assume all providers support agent discovery or expose identical agent properties.

If a provider requires a manually supplied agent ID, provide a clearly labelled field and validate it through the backend where possible.

Persist configuration using the existing backend contract. Do not treat a locally selected agent as a successfully configured backend resource until the backend confirms it.

## 7. Evaluation workflow

Implement the workflow around the following sequence:

**Provider → Agent → Scenario → Evaluation criteria → Test execution → Results**

Use the existing routing, page structure, and component conventions wherever possible. Reuse existing screens rather than introducing duplicate screens that perform the same job.

The user should always understand:

- Which provider is being tested.
- Which agent is selected.
- Which scenario is being used.
- Which criteria will be evaluated.
- Whether the test is ready to run.
- What execution mode is being used.
- What the test is currently doing.
- Where the results will appear.

Prevent users from starting a run when required configuration or scenario data is missing.

Display actionable validation errors instead of silently disabling controls.

## 8. Scenarios and test-case management

Integrate the existing Scenarios page, or extend the appropriate existing screen, to support the backend scenario model.

Initial scenario templates:

### Customer Support & Receptionist

Test intent recognition, information collection, policy compliance, tool usage, resolution, escalation, and appropriate conversation closure.

### Incident Response

Test incident identification, severity assessment, information collection, procedural compliance, authorized tool usage, escalation, and confirmation of next steps.

### Language Practitioner

Test target-language consistency, proficiency-level alignment, correction quality, exercise delivery, and achievement of the configured learning objective.

### Scenario creation

Users must be able to:

- Select an existing template.
- Customize a template.
- Create a scenario from scratch.
- Name the scenario and describe its business goal.
- Define expected behavior.
- Define prohibited behavior.
- Configure initial test input and conversation turns.
- Define expected tool activity where supported.
- Configure timeouts and execution limits.
- Save and retrieve scenarios.
- Edit and duplicate scenarios when supported by the backend.

Support custom JSON where the backend provides this functionality.

Use a structured editor or an existing code editor component if one is already available. Validate JSON locally for immediate feedback and rely on the backend for authoritative schema validation.

Display validation errors near the relevant fields.

When the backend provides scenario versions or snapshots, display version information where useful. Historical evaluation reports must remain tied to the scenario and rubric versions used during the run.

Do not duplicate the scenario-management implementation across provider-specific pages.

## 9. User-defined deterministic rules

The evaluation configuration interface must allow users to define deterministic rules.

Add an **Add Deterministic Rule** action using the existing button styles and component conventions.

Users should be able to configure supported rule types, such as:

- Required phrase or information.
- Prohibited phrase or behavior.
- Required question.
- Required information collection.
- Expected or forbidden tool call.
- Tool argument validation.
- Tool-call ordering.
- Required escalation.
- Confirmation before a sensitive action.
- Required closing statement.
- Maximum conversation turns or duration.
- Required completion behavior.

The exact supported rule types must come from the backend contract.

Use structured forms that change according to the selected rule type. For example, a required-phrase rule should expose the phrase to check for, while a tool-call rule should expose the relevant tool and any supported argument constraints.

Requirements:

- Validate required fields.
- Provide helpful descriptions and examples.
- Allow users to add and remove rules.
- Support editing existing rules.
- Save rules through the backend.
- Display saved rules when reopening a scenario.
- Clearly identify invalid configurations.
- Avoid arbitrary code execution or free-form executable expressions.

Do not hardcode rules that the backend does not support.

## 10. User-defined LLM evaluation criteria

Add an **Add LLM Evaluation** action alongside the deterministic-rule configuration, following the existing UI design.

Users should be able to define evaluation criteria in plain English.

Examples:

- Did the agent correctly understand the user's request?
- Did the agent collect all required information before proceeding?
- Did the agent follow the configured business policy?
- Did the agent resolve the request or escalate appropriately?
- Did the agent explain the next steps clearly?
- Did the language practitioner provide corrections appropriate to the learner's proficiency level?

Each criterion should support the fields defined by the backend, such as:

- Criterion name.
- Natural-language description.
- Expected outcome.
- Severity or importance, if supported.
- Required evidence, if supported.
- Enabled or disabled status.

Allow users to add, edit, and remove criteria and persist them with the scenario.

The interface should explain the difference between deterministic rules and LLM evaluations:

- **Deterministic rules** check explicit conditions against observed evidence.
- **LLM evaluations** assess contextual or semantic behavior using the configured evaluation rubric.

Do not expose hidden reasoning or chain-of-thought. Display concise explanations and evidence-backed verdicts returned by the backend.

## 11. Test execution and Ghost Caller experience

Novora should provide a clear way to initiate a test conversation with the selected agent.

Build on the existing evaluation interface rather than creating an unrelated testing product.

The user should be able to:

1. Select the configured provider and agent.
2. Select or create a scenario.
3. Review the initial test input and evaluation criteria.
4. Start the test.
5. Observe supported execution progress.
6. Inspect conversation events and transcript evidence when available.
7. View the final evaluation report.

### Execution mode must be explicit

Different providers may support different execution methods.

The frontend must distinguish between:

- A real voice-agent conversation test.
- A provider-supported simulated or text-input conversation.
- An audio-based conversation test.
- A direct webhook or integration contract test.

Only show execution modes that the backend confirms are supported.

A successful webhook request must not be presented as proof that a complete voice-agent conversation was tested.

If a provider requires audio input, the interface must reflect the actual supported workflow rather than pretending that a text-only test is equivalent.

### Run lifecycle

Render the real execution state returned by the backend, using its actual lifecycle values.

Provide understandable UI states for:

- Pending.
- Preparing the test.
- Connecting to the provider.
- Running the conversation.
- Processing events.
- Evaluating deterministic rules.
- Running LLM evaluation.
- Completed.
- Failed.
- Timed out.
- Cancelled, where supported.
- Partially completed.

These are presentation examples, not instructions to invent new backend statuses. Map the actual backend states to clear UI labels.

For long-running evaluations, use the existing polling, streaming, or real-time event infrastructure if available. Respect backend status and retry guidance.

Do not simulate progress percentages or display success before the backend confirms it.

## 12. Conversation transcript and evidence viewer

When the backend returns conversation events or transcripts, display them in a readable timeline using the existing design system.

Where supported, show:

- User messages.
- Agent responses.
- Timestamps.
- Tool calls.
- Tool arguments, with appropriate redaction.
- Tool results.
- Session and lifecycle events.
- Errors and interruptions.
- Relevant event sequence information.

Differentiate user speech, agent speech, and tool activity using existing visual patterns or small additions consistent with the approved design.

Allow users to inspect the evidence associated with an evaluation criterion.

When the backend provides event references, clicking an evidence reference should take the user to the relevant transcript segment or event.

Do not fabricate missing transcript entries, tool results, timestamps, or provider events.

If the provider does not supply a particular type of evidence, display a clear unavailable or unsupported state rather than rendering invented content.

Protect sensitive transcript content according to the existing authorization and data-handling rules.

## 13. Evaluation results and reports

Update the existing evaluation results or report screens to display the new backend result structure.

The report should distinguish four independent concepts:

1. **Execution status** — whether the test actually ran successfully.
2. **Deterministic results** — whether explicit rules passed or failed.
3. **LLM evaluation results** — whether semantic criteria passed, failed, or could not be assessed.
4. **Aggregate outcome** — the final status calculated by the backend's documented aggregation policy.

Do not collapse these into one unexplained score.

### Report content

Display the fields available from the backend, including:

- Provider and agent.
- Scenario and version.
- Execution mode.
- Run ID and timestamps.
- Execution status.
- Deterministic results.
- LLM evaluation results.
- Overall outcome.
- Evaluation warnings and errors.
- Transcript or event timeline.
- Evidence references.
- Model information, where appropriate.
- Relevant execution metadata.

Each deterministic criterion should show its status, concise explanation, and supporting evidence.

Each LLM criterion should show its verdict, concise explanation, and evidence references returned by the backend.

Use the backend's supported statuses, including `PASS`, `FAIL`, and `INCONCLUSIVE`, where applicable.

A critical deterministic failure must not be hidden by a favorable LLM score. The frontend should display the separate results faithfully and use the aggregate outcome supplied by the backend.

If the LLM judge fails, show that the LLM evaluation could not be completed. Preserve and display any valid deterministic results.

Do not display a green success state merely because an execution finished. A completed execution can still have a failed evaluation.

### Historical reports

Connect the evaluation history interface to persisted backend records.

Support available filters such as:

- Provider.
- Agent.
- Scenario.
- Run status.
- Outcome.
- Date range.

Allow users to open previous reports, inspect evidence, and rerun evaluations if the backend supports these operations.

Historical reports must display the results and configuration snapshot belonging to the original run, not silently substitute the latest scenario settings.

## 14. Overview dashboard

Preserve the existing dashboard layout and visual identity.

Update its data integration so the dashboard reflects actual backend information where available.

Potential metrics include:

- Total evaluation runs.
- Successful executions.
- Passed evaluations.
- Failed evaluations.
- Inconclusive evaluations.
- Configured providers.
- Recent evaluation activity.
- Recent failures requiring attention.

Only show metrics that can be calculated reliably from backend data.

Clearly distinguish execution success from evaluation success.

Use the existing charts, cards, and activity components. Do not introduce additional charts or redesign the dashboard without a functional requirement.

If an endpoint is unavailable, show a suitable empty, unavailable, or loading state rather than placeholder metrics that look real.

## 15. API integration and frontend data handling

Build on the current API client and data-fetching conventions.

Inspect the actual backend routes before connecting screens.

The frontend should support the equivalent operations where implemented:

- List providers and capabilities.
- Configure and verify provider connections.
- Retrieve agents or validate an agent ID.
- Create, retrieve, update, and duplicate scenarios.
- Manage deterministic rules.
- Manage LLM evaluation criteria.
- Start evaluation runs.
- Retrieve execution status and progress.
- Retrieve conversation events and transcripts.
- Retrieve criterion results.
- Retrieve aggregate reports.
- Browse evaluation history.
- Rerun evaluations.
- View batch progress and partial failures, if supported.

Requirements:

- Use the actual backend request and response schemas.
- Centralize API calls where the existing architecture supports it.
- Reuse existing authentication and authorization mechanisms.
- Handle loading, empty, success, and error states consistently.
- Validate user input before submission where appropriate.
- Handle expired sessions and authorization failures.
- Prevent duplicate submissions while a request is in progress.
- Avoid unnecessary repeated requests.
- Invalidate or refresh relevant cached data after mutations.
- Use cancellation and cleanup for asynchronous operations where appropriate.
- Display backend error messages in a useful, user-friendly format.
- Do not leak stack traces, credentials, or internal secrets into the UI.

Do not bypass the backend by implementing provider execution directly in the browser.

Provider API credentials and LLM credentials must remain server-side.

## 16. Loading, empty, and error states

Every new or modified data-driven component must handle realistic states.

Examples:

- No providers configured.
- No agents available.
- Missing agent ID.
- Invalid provider credentials.
- No scenarios created.
- No evaluation criteria configured.
- Scenario validation failed.
- Test is still running.
- Provider connection failed.
- Provider does not support the requested execution mode.
- Transcript unavailable.
- LLM judge unavailable.
- Evaluation completed with failures.
- Evaluation completed with inconclusive criteria.
- Historical report not found.
- User is not authorized to access the resource.

Use the existing alert, toast, inline validation, empty-state, and loading components wherever possible.

Error messages should explain what happened and what the user can do next.

Do not hide errors, display success after failed requests, or turn a missing backend capability into a frontend-only success.

## 17. Security and data integrity

Follow the existing application's security model.

- Never expose provider credentials or Hugging Face tokens in the browser.
- Never store provider secrets in local storage or session storage.
- Do not send credentials to third-party endpoints directly from frontend code.
- Respect workspace and user authorization enforced by the backend.
- Avoid rendering untrusted provider output as executable HTML.
- Treat transcripts and tool results as untrusted content.
- Avoid logging sensitive data to the browser console.
- Do not hardcode production API keys.
- Use the existing environment-variable conventions for public frontend configuration.
- Do not bypass backend validation or permission checks.
- Avoid displaying stale cached results as if they were current.
- Do not permit unauthorized access to reports or transcripts.

## 18. Component and code quality

Keep the implementation aligned with the existing stack and code style.

- Reuse existing components and hooks.
- Create shared components for repeated provider and evaluation patterns.
- Separate API logic from presentation logic.
- Use the existing TypeScript types and validation conventions.
- Keep components focused and reasonably small.
- Avoid giant page components and duplicated provider-specific workflows.
- Add or update shared types to match the real backend schemas.
- Avoid unnecessary dependencies.
- Preserve responsive behavior and accessibility.
- Provide labels, keyboard navigation, and appropriate focus behavior for new controls.
- Maintain existing routes and deep-link behavior unless a change is required and documented.
- Do not rewrite the application merely to conform to a preferred folder structure.

For new or materially modified source files, aim to remain under 200 lines where reasonably achievable. Split components into cohesive modules rather than compressing code unnaturally. Do not fragment simple components unnecessarily just to meet a line count.

## 19. Testing requirements

Do not finish after the UI renders.

Inspect the existing test framework and add or update tests using the repository's conventions.

### Component tests

Test:

- Provider categories and configuration states.
- Agent selection and validation.
- Scenario selection and creation.
- Adding, editing, and removing deterministic rules.
- Adding, editing, and removing LLM criteria.
- Form validation and submission errors.
- Execution-state rendering.
- Transcript and evidence display.
- Report status rendering.
- Loading, empty, and error states.

### API integration tests

Mock the actual API contracts and verify:

- Correct request payloads.
- Correct response parsing.
- Provider configuration errors.
- Scenario validation errors.
- Run creation and progress retrieval.
- Deterministic and LLM result rendering.
- Report retrieval.
- Authentication and authorization failures.
- Partial or unavailable evaluation results.

### End-to-end tests

Verify the complete frontend workflow against a test backend or appropriate mocks:

1. Open the Agents page.
2. Select a provider.
3. Configure or select an agent.
4. Select or create a scenario.
5. Configure deterministic rules.
6. Configure LLM evaluation criteria.
7. Start a supported test.
8. Observe the actual returned run status.
9. Inspect transcript evidence when available.
10. Review the deterministic and LLM results.
11. Open the saved report from evaluation history.

Verify that an unsuccessful backend request never produces a false success state.

Use mocks for ordinary automated tests. Live provider tests should be opt-in and must not trigger unauthorized production actions or unnecessary costs.

Run the existing lint, type-check, unit-test, build, and relevant end-to-end commands. Report actual outcomes rather than assuming they passed.

## 20. Implementation sequence

Work in the following order.

### Stage 1 — Audit

- Inspect the current frontend and approved design.
- Inspect backend routes and schemas.
- Identify existing functionality and integration gaps.
- Confirm branch and working-tree status.
- Produce a focused implementation plan.

### Stage 2 — API contracts and shared types

- Align frontend types with the backend.
- Update or extend the existing API client.
- Establish consistent error handling and loading behavior.
- Avoid implementing unsupported endpoints.

### Stage 3 — Provider and agent integration

- Update the Agents page with Voice Providers and Infrastructure Providers.
- Implement provider configuration and connection states.
- Implement agent selection and validation.
- Preserve the existing design.

### Stage 4 — Scenario and evaluation configuration

- Integrate scenario templates and custom scenarios.
- Add deterministic-rule configuration.
- Add LLM evaluation criteria.
- Implement validation and persistence.

### Stage 5 — Test execution

- Implement the supported Ghost Caller workflow.
- Display the correct execution mode.
- Integrate real run lifecycle and progress.
- Handle errors, timeouts, and incomplete runs.

### Stage 6 — Evidence and reports

- Display normalized conversation events and transcripts.
- Connect evaluation criteria to supporting evidence.
- Separate execution, deterministic, LLM, and aggregate outcomes.
- Connect report history and rerun actions where supported.

### Stage 7 — Verification and hardening

- Run tests, lint, type checks, and production build.
- Verify responsive behavior.
- Check authentication and sensitive-data handling.
- Confirm no existing working feature was unintentionally broken.
- Document any backend gaps that prevent a complete workflow.

Complete and validate each stage incrementally. Do not make one enormous change that is difficult to debug or review.

## 21. Definition of done

The frontend update is complete when:

- The existing approved Novora design remains recognizable and consistent.
- The Agents page reflects the new provider categories.
- Provider configuration reflects actual backend connection states.
- Users can select or configure supported agents.
- Scenario management reflects the backend's actual capabilities.
- Users can configure supported deterministic rules.
- Users can configure LLM evaluation criteria.
- The test workflow uses actual backend API contracts.
- The interface distinguishes voice-agent testing from direct webhook testing.
- Execution status is based on real backend responses.
- Conversation events and evidence are displayed accurately.
- Deterministic and LLM evaluation results remain distinct.
- Reports and evaluation history are connected to persisted backend records.
- Loading, empty, failure, and partial-result states are implemented.
- Existing working features remain operational.
- The application passes the applicable checks that were actually run.
- Unsupported features are identified honestly instead of simulated.

## 22. Final engineering report

When finished, report:

1. What existed before the changes.
2. What you changed and why.
3. Files created and modified.
4. How the frontend maps to the actual backend API contracts.
5. Provider and agent workflows implemented.
6. Scenario and evaluation-configuration functionality implemented.
7. Test execution and report workflows implemented.
8. Automated tests, lint, type-check, and build results, including commands.
9. Any existing functionality that required repair.
10. Any backend endpoints or capabilities that remain unavailable.
11. Any known limitations and recommended next steps.

Clearly distinguish between implemented, tested, mocked-only, and blocked functionality.

**Start by auditing the existing frontend and backend contracts. Preserve the approved design, make only the necessary functional changes, and verify the complete user workflow before declaring the frontend integration finished.**