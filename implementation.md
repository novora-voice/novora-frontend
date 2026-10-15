# NOVORA — Senior Frontend Architect & Product Integration Engineer

## Mission

Redesign and implement Novora's frontend as a premium, easy-to-use voice-agent testing and evaluation platform.

The user journey is provider-first:

**Choose provider → configure agent → select or create scenario → configure evaluation rules → run test → inspect results → revisit or batch-run evaluations.**

The UI must work for nontechnical users while providing enough detail for AI engineers and developers to understand exactly what happened during a test.

The backend engineer owns provider execution, evaluation logic, database models, and API contracts. Your job is to build the frontend and integrate with the real backend.

## 1. Branch discipline

Work only on:

`feat/provider-testing-dashboard`

Inspect the existing project before changing it. Preserve working authentication, routes, API clients, and design components where possible.

Read Claude A's published API contracts before implementing dependent workflows.

Do not invent backend endpoints or change shared contracts independently. If a contract is missing, coordinate with Claude A and document the dependency.

Do not merge to main or overwrite other branches.

## 2. Brand and visual direction

Create a polished, enterprise-grade Novora dashboard using:

- Midnight `#0A0F1E`
- Deep Navy `#0B1F44`
- Royal Blue `#2563EB`
- Sky Blue `#60A5FA`
- Ice Gray `#E2E8F0`

Make the application noticeably easier on the eyes than a dense dark developer dashboard.

Use a refined light theme by default if that best fits the existing product and user needs. Preserve a complete dark theme. Both must feel intentionally designed.

Light theme:

- Background `#F8FAFC`
- Surfaces `#FFFFFF`
- Elevated surfaces `#F1F5F9`
- Primary text `#0B1F44`
- Secondary text `#64748B`
- Borders `#E2E8F0`

Dark theme:

- Background `#0A0F1E`
- Surfaces `#0B1F44`
- Elevated surfaces using carefully layered navy tones
- Primary text `#E2E8F0`
- Subtle borders `#1E293B`

Use restrained blue gradients, soft glass-like surfaces, thin borders, generous spacing, and purposeful motion.

Increase text size and improve readability. Use comfortable body text, strong headings, clear labels, readable tables, and large enough interactive targets.

Avoid excessive glow, overly dark text, tiny metadata, too many cards, and decorative icons without meaning.

Use the approved Novora logo unchanged. Use the supplied white logo as the favicon, configured correctly for the existing framework. Keep the same approved logo identity in both themes.

## 3. Application shell

Build a cohesive shell with:

- Fixed sidebar on large screens.
- Sidebar that does not scroll with the main content on large screens.
- Responsive mobile navigation.
- Page header with useful context.
- Account menu.
- Working light/dark toggle.
- Consistent page spacing and typography.
- Accessible tooltips and clear action states.

Sidebar sections:

- Overview.
- Agents.
- Evaluations.
- Scenarios.
- Integrations.
- Knowledge.
- Settings.
- Voxia — Coming in Phase 2.
- LangGraph workflows — Planned.
- Multi-tenant organizations and RBAC — Planned.

Clicking Voxia should show a branded modal explaining that the managed Voxia runtime is planned for Phase 2. Do not navigate to a fake implementation.

Mark other planned items clearly. Do not make unfinished pages appear operational.

## 4. Provider-first onboarding and evaluation wizard

Build a guided workflow that reduces confusion.

### Step 1 — Choose a provider

Show provider cards for:

- ElevenLabs.
- AssemblyAI.
- Vapi.
- Retell.

Each card should include a logo placeholder or supplied logo, a concise explanation, current connection status, and supported capabilities.

Make the differences clear:

- ElevenLabs: connect an existing configured voice agent.
- AssemblyAI: configure a supported voice-agent session using its prompt and tool configuration.
- Vapi: connect and configure a supported assistant or test target.
- Retell: connect and configure a supported agent and execution mode.

Only show capabilities confirmed by the backend.

If the provider is not connected, show a clear connection flow rather than allowing a test to fail unexpectedly.

### Step 2 — Configure the agent

Show only fields required by the selected provider.

Possible fields include:

- Agent name.
- Agent ID or configuration reference.
- System prompt, when applicable.
- Tool configuration references.
- Environment or staging selection.
- Other provider-specific settings.

For providers with existing agents, offer supported discovery or agent-ID entry.

For AssemblyAI, provide an intuitive prompt editor and supported tool configuration form.

Validate inputs and explain unfamiliar terms in plain language.

### Step 3 — Choose a scenario

Provide scenario templates:

1. Customer Support & Receptionist.
2. Incident Response.
3. Language Practitioner.

Allow custom scenarios where supported.

Each template should have a short description, example business goal, and suggested evaluation criteria.

Make it easy to choose a template and then customize it.

### Step 4 — Configure evaluation criteria

Separate deterministic checks from LLM-as-judge criteria visually.

For each deterministic rule, display:

- Rule name.
- What it checks.
- Expected behavior.
- Configuration controls.
- Severity.
- Whether the rule is enabled.

For each LLM judge rubric, display:

- Evaluation objective.
- Rubric description.
- Expected behavior.
- Scoring or result configuration supported by the backend.
- Whether the criterion is enabled.

Provide a readable summary of the criteria before the test begins.

Avoid making users write complex JSON. Use forms and guided controls wherever possible.

### Step 5 — Run the test

Display the selected provider, agent, scenario, and enabled checks.

Before execution, validate that a provider and usable agent configuration have been selected.

If no provider or integration is configured, show a branded modal explaining that the user must connect one before evaluating. Provide a direct action to open Integrations or return to provider selection.

For real calls that may contact phone numbers or incur charges, require explicit confirmation and make the execution mode clear.

Show actual execution progress, errors, and completion status.

Do not fabricate live event streams or simulate successful runs.

### Step 6 — Inspect the report

On completion, take the user to the real evaluation report.

Provide actions to rerun the test, edit the scenario, view history, or add it to a supported batch run.

## 5. Integrations directory

Create a dedicated Integrations page.

Organize provider cards by category:

- Voice-agent platforms.
- Voice and transcription infrastructure.
- Telephony and calling.
- Business tools.

Include ElevenLabs, AssemblyAI, Vapi, and Retell.

Make room for additional providers and business integrations without hardcoding the entire page into one component.

Each card should show:

- Provider logo.
- Provider name and purpose.
- Connection status from the backend.
- Supported operations.
- Configure or Connect action.
- Test connection action when supported.
- Clear recovery guidance when disconnected or invalid.

Use distinct but consistent status treatments for connected, not connected, error, pending, and unsupported capabilities.

A click must perform a real supported action. Do not display “Connected” simply because a user opened the provider page.

## 6. Developer configuration pages

Create a clear developer configuration experience for provider credentials and agent settings.

The UI should tell developers which configuration values are required, where they belong, and how to configure them securely.

Provide masked credential inputs and server-side validation. Never expose secret values after saving.

For platform-operator configuration, display a checklist of required environment variables and whether the backend reports them as configured, without exposing the values.

Do not attempt to write secrets into the server's `.env` file from the browser.

Keep the distinction between:

- Platform operator credentials.
- User-owned provider credentials.
- Agent identifiers and non-secret configuration.
- Optional LLM judge configuration.
- Database and queue infrastructure configuration.

Do not require every user to supply Novora's internal PostgreSQL or infrastructure credentials. Those belong to the platform deployment. Users should supply only credentials required for their own integrations, according to the supported configuration model.

If the backend lacks secure user credential storage, show the configuration as awaiting backend support rather than storing secrets in local storage.

## 7. Overview dashboard

Create a beautiful monitoring dashboard that answers:

**Are our voice agents behaving as expected and meeting the business goals we configured?**

Include, where actual backend data exists:

- Connected providers.
- Configured agents.
- Total evaluations.
- Pass, fail, and inconclusive counts.
- Recent evaluation activity.
- Agent performance.
- Recent provider errors.
- Scenarios with repeated failures.
- Recent batches and their progress.

Use larger, readable typography and restrained visualizations.

Metrics must come from real API responses. Use a clean empty state when no data exists.

Never fabricate operational data, success rates, provider statuses, or AI-generated insights.

## 8. Agents page

Show configured agents with:

- Name.
- Provider.
- Agent type.
- Configuration status.
- Recent evaluation.
- Recent activity.
- Available actions.

Provide a guided create-agent flow and a detail page for each agent where supported.

Make the relationship between an agent and its scenarios and evaluations clear.

## 9. Scenarios page

Build a dedicated scenario directory.

Support:

- Search and filtering.
- Template selection.
- Create scenario.
- Edit scenario.
- View scenario criteria.
- Run an evaluation.
- View related evaluations.
- Duplicate scenarios where supported.

Show deterministic rules and LLM judge rubrics in separate, understandable sections.

Provide sensible empty states and example guidance without inserting fabricated saved records into the production database.

## 10. Evaluations and batch execution

Create a dedicated Evaluations page.

Users must be able to:

- View all previous evaluations.
- Filter by provider, scenario, status, and time where supported.
- Open detailed reports.
- Rerun a single evaluation.
- Select multiple tests and start a batch.
- View batch progress and individual case outcomes.
- Inspect failed and inconclusive runs.
- Compare runs where the backend supports meaningful comparison.

Show the relationship between each evaluation and its own provider, agent configuration, scenario, deterministic criteria, and LLM judge rubric.

Do not merge evaluation configurations across scenarios accidentally.

A batch must display partial failures honestly. Do not mark an entire batch successful because some cases passed.

## 11. Detailed evaluation report

Create a readable, evidence-first report page.

Display:

- Overall result.
- Provider and agent.
- Scenario.
- Timestamp and execution duration where available.
- Deterministic checks.
- LLM judge results.
- Final aggregated result.
- Conversation transcript.
- Tool-call timeline.
- Tool arguments and outcomes, with sensitive information redacted.
- Evidence references.
- Failed criteria.
- Warnings and inconclusive results.
- Previous runs or comparison links where supported.

Clearly separate the agent's claims from verified actions.

For example, if the agent says it completed a refund but there is no trusted confirmation from the payment integration, the report must not show that the refund was verified.

Use collapsible sections to keep detailed evidence accessible without overwhelming the page.

## 12. Monitoring and event timeline

When the backend provides live or persisted events, show them in a clear timeline.

Distinguish:

- User messages.
- Agent responses.
- Tool calls.
- Tool results.
- Interruptions.
- Guardrail events.
- Provider errors.
- Evaluation events.

Do not expose private chain-of-thought. Show observable events and permitted explanations only.

Use polling, server-sent events, or WebSockets according to the existing backend implementation. Do not introduce a pretend live stream.

## 13. Database and API integration

Use the actual backend API contracts.

Build or reuse a typed API client. Handle authentication, errors, loading states, pagination, and mutation invalidation consistently.

Keep provider-specific logic out of shared components.

Persist all saved scenarios, criteria, integrations, and evaluation history through the backend.

Do not use browser local storage as a replacement for relational persistence.

If an endpoint does not exist yet, coordinate with Claude A. Do not invent an endpoint and assume it works.

## 14. Modular frontend architecture

Keep every source file below 200 lines. Prefer smaller, focused modules.

Separate:

- Routes and page composition.
- UI components.
- Feature components.
- API clients.
- Types.
- Hooks.
- Forms and validation.
- Provider-specific presentation.
- Theme tokens.
- Utilities.
- Tests.

Use the existing framework and libraries wherever practical.

Avoid giant page components, repeated API logic, excessive icon use, duplicated forms, and unnecessary dependencies.

Use consistent accessible icons, field labels, validation, and feedback components.

## 15. Testing and definition of done

Test the critical journey:

1. Log in.
2. Connect or select a provider.
3. Configure an agent.
4. Select a scenario.
5. Configure deterministic and LLM judge criteria.
6. Run an actual supported evaluation.
7. Inspect the persisted evidence-backed report.
8. Rerun an evaluation.
9. Run a batch.
10. Reopen the evaluation history.

Also verify responsive layouts, light/dark mode, the white logo favicon, accessibility, loading states, error states, and planned-feature modals.

Run linting, type checks, relevant tests, and a production build. Report actual results.

The finished UI must be beautiful, readable, honest about provider capabilities, and connected to real backend functionality.

Do not replace incomplete backend operations with fake success states. Do not claim live monitoring, provider connectivity, or evaluation execution works until verified.

Deliver a concise summary of pages changed, API contracts consumed, test results, and remaining blockers.