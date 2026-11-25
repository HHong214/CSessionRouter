# Briefs and reports

Read this before you write the first brief of a session.

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

Hand back when: <what must stop the work and come back, or omit>

Budget: <about how many tool calls, or omit>

Done when:
- <checkable condition>

Verify:
- <one plain command> -> <expected outcome>

Report: <anything beyond the standard report, or omit>
```

- Give each verification as one plain command (for example `node --test`), not a chained shell line, so that the session's permission rules can match it. Where the tool has a form that prints a summary, give that form.
- Keep a brief under a screen. A longer one usually means two tasks.
- A "Done when" for something that must hold in several places names the hardest one and why (the narrowest layout, the darkest theme, the longest text, a hidden or late-mounted parent), and a check of "everywhere" lists each place it is run.
- A build task after a test task names the locked test files (methods.md).
- When two tasks need the same new piece, or one rule is enforced partly in each, both briefs name the one task that owns it; the other task waits for it, or is told to check that part last.
- "Hand back when" holds the plan's re-planning points for this task: what the worker must not settle alone, such as a file outside its list that needs changing, a locked test that looks wrong, or a spec the code contradicts. The worker stops there with `NEEDS-DECISION:`.
- "Budget" is for a task that could sprawl: a search, a hunt for a cause, a performance fix. About 10 tool calls for a lookup, 30 for a normal task, 60 for a large one; a task that needs more is two tasks.
- When several briefs share a text (a contract, a style, a list of files), write it once to a file in the job folder (in the job's scratch folder when the job has none: checks.md, "Running the checks") and name it under `read:`. Each brief then holds only what differs.
- Every brief names its own subfolder of the job's scratch folder for what the worker writes that is not its result (checks.md, "Running the checks").
- A review brief follows the rules in checks.md.
- For a return, list the defects (checks.md) and reuse the task title as the `description`. The same worker or a fresh one: the last section below.

## What the shells already tell every worker

So a brief does not repeat them. Every worker:

- loads the skills the brief names before starting;
- stops with `NEEDS-DECISION:` (the question, the options, its pick) when something it depends on is unclear and reading or running cannot settle it;
- returns `ESCALATE:` (why, and what it tried) when the task is beyond it at this level after a real attempt;
- reports its steps to the agents panel when a tool for a subagent's own steps (it takes `done`, `total`, `note`) is among its tools;
- never starts other agents;
- runs the verification you asked for and pastes the tail of the real output, trying the plain form of a refused command before giving up;
- keeps its own context small: commands in the form that prints least, long output cut to the part it needs;
- returns `ESCALATE:` when the same failure is still there after three different attempts;
- at a budget the brief gives, finishes the step in hand and reports `partial` if the end is not in sight.

A reader cannot change files, uses shell commands only to read and to run checks, and gives findings with `file:line` or URL evidence, writing "not found" where it could not confirm something.

## Report format

250 words or fewer unless the brief says otherwise:

- `Result:` done | partial | NEEDS-DECISION | ESCALATE
- `Changed:` files
- `Verified:` commands with the tail of their output: the lines that show the result, five at most for each
- `Left:` for `partial` only: what is not done
- `Notes:` assumptions made, things noticed that were out of scope, and what the next worker on these files would need to know that the code does not show

## Reading a report

- `done`: check it (checks.md). A `Verified:` line with no real output tail counts as not verified.
- `partial`: check what was done; what is missing goes back as a return (checks.md), to the same worker or a fresh one (below).
- `NEEDS-DECISION`: settle it from the plan's decisions if they cover it. If not, and the answer changes what gets built or how it is checked, ask the user (planning.md, step 4). Send the answer back under the same task title. A locked test that looks wrong: methods.md.
- `ESCALATE`: move to the next model up (routing.md).

## A return: the same worker or a fresh one

A worker that is continued reads its whole run again at every step it takes. A fresh worker pays once to learn the task. So:

- Continue the same worker, with a message, when its run was short (about 30 tool calls or fewer and, where the session reports tokens, under about 150,000), it finished within about the last five minutes, and the fix needs what it learned. Also for a follow-up on work that only it understands, where a fresh worker would first have to relearn a large piece.
- Start a fresh worker when the run was long, when the worker has stood idle for more than about five minutes, when the task moves up a model or an effort level (routing.md), or when the return is in a new area. Its brief holds the defect list, the files, and what the first worker's report says the next one needs to know.
- A change of three lines or fewer that you can write out exactly is yours to make instead (route/SKILL.md, "Your role").
- Do not carry one worker through a whole job. Once its runs add up to a long one, its next task goes to a fresh worker.
