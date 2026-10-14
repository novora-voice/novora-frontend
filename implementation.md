assembly and vapi and retell right?
Yes, exactly. That's the approach I'd recommend for Novora.

The key is to get one complete integration working, then reuse its shared code for the other providers instead of rebuilding the platform.

The implementation plan
Get ElevenLabs working end to end first.

Connect an agent, run a test conversation, capture events, evaluate the conversation, and save a report. Verify that the entire workflow works—not just the connection.

Reuse the shared code for AssemblyAI.

Keep your scenario engine, evaluation logic, LLM judge, database models, and reporting. Adapt the provider connection and input/output handling to AssemblyAI's actual protocol.

Repeat for Vapi and Retell.

Reuse the same core, adding only the provider-specific integration code and any capability differences.

Test each provider independently.

Verify that each one can execute a test and return real evidence before marking it as supported in Novora.

What you reuse vs. what you change
Reuse across all providers

Adapt for each provider

Scenarios and test cases

Authentication and connection

Deterministic evaluation engine

Input message or audio format

LLM-as-judge

Session initialization

Database and evaluation history

Event and tool-call mapping

Reports and dashboard

Error handling and supported capabilities

One important caution: don't assume AssemblyAI, Vapi, and Retell differ only in the name of a text_input field. Verify their supported testing interfaces first. If their input methods differ, isolate that difference in the adapter.

The result is one Novora platform with multiple provider integrations—not four separate implementations.