# Briefs and reports

Read this before you write the first brief of a session, and whenever a brief is not routine.

A worker receives only the brief, the `prompt` of the Agent call. It cannot see this conversation, the plan or anything you read, so everything it needs goes in the brief, and nothing else.

## Template

```
Goal: <what should be true when the worker is done, in one or two sentences>

Context: <only what the worker needs>

Files:
- read: <absolute paths, with what to look for>
- change: <absolute paths>

Specs:
- <decisions, not options>

Skills to load: <skill names, or omit>

Constraints:
- <conventions and what must not change>
- Out of scope: <what to leave alone>

Done when:
- <checkable condition>

Verify:
- <one plain command> -> <expected outcome>

Report: <anything beyond the standard report, or omit>
```

- Give each verification as one plain command (for example `node --test`), not a chained shell line, so that the session's permission rules can match it.
- Keep a brief under a screen. A longer one usually means two tasks.
- A build task after a test task names the locked test files (methods.md).
- A review brief follows the rules in checks.md.
- For a return, list the defects (checks.md) and reuse the task title as the `description`.

## What the shells already tell every worker

So a brief does not repeat them. Every worker:

- loads the skills the brief names before starting;
- stops with `NEEDS-DECISION:` (the question, the options, its pick) when something it depends on is unclear and reading or running cannot settle it;
- returns `ESCALATE:` (why, and what it tried) when the task is beyond it at this level after a real attempt;
- reports its steps to the panel when `mcp__CPixelCrew__step` is among its tools;
- never starts other agents;
- runs the verification you asked for and pastes the tail of the real output, trying the plain form of a refused command before giving up.

A reader cannot change files, uses shell commands only to read and to run checks, and gives findings with `file:line` or URL evidence, writing "not found" where it could not confirm something.

## Report format

250 words or fewer unless the brief says otherwise:

- `Result:` done | partial | NEEDS-DECISION | ESCALATE
- `Changed:` files
- `Verified:` commands with the tail of their output
- `Notes:` assumptions made, things noticed that were out of scope

## Reading a report

- `done`: check it (checks.md). A `Verified:` line with no real output tail counts as not verified.
- `partial`: check what was done; what is missing goes back as a return (checks.md).
- `NEEDS-DECISION`: settle it from the plan's decisions if they cover it. If not, and the answer changes what gets built or how it is checked, ask the user (planning.md, step 4). Send the answer back under the same task title.
- `ESCALATE`: move to the next model up (routing.md).
