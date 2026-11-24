# Routing: models, effort and moving up

Read this when you give tasks a model and effort while planning, and again when a result makes you change them.

## Agent call

Start each worker with the Agent tool:

- `subagent_type`: `"CSessionRouter:worker"` for a task that edits files, `"CSessionRouter:reader"` for one that only reads.
- `model`: `haiku`, `sonnet`, `opus` or `fable`.
- `effort`: `low`, `medium`, `high`, `xhigh` or `max`.
- `description`: the task title exactly as in the plan (panel.md says why).
- `prompt`: the brief (briefing.md).

Pass `model` and `effort` on every call, because the shells set neither. Another plugin's specialist agent, or a built-in type (`Explore`, `web-fetch`), may be used instead when it fits the task better; set `model` and `effort` on it the same way.

## Work kinds

Every task gets one kind. It is used for routing and for the panel.

| Kind | Meaning |
|---|---|
| `search` | Find things in code, docs or the web; fetch and read pages |
| `analyze` | Numbers from data, logs, metrics, benchmarks |
| `build` | Add or change a feature with clear requirements |
| `refactor` | Restructure without changing behaviour; multi-file, invariants |
| `quick` | Mechanical work: renames, boilerplate, config, running commands |
| `debug` | Find a root cause; unfamiliar or messy code |
| `test` | Write tests, reproduce a bug as a failing test, run end-to-end checks |
| `review` | Independent read-only review |
| `design` | Visual and interaction work |
| `write` | Docs, copy, reports, prompts |
| `plan` | Plan or spec work handed to a worker |
| `hard` | The hardest problems: subtle algorithms, concurrency, what a lower level failed at |

## Starting model

The models from lowest to highest: Haiku, Sonnet, Opus, Fable. The table is a starting point, not a fixed assignment.

| Work | Starts on |
|---|---|
| `search`, `quick` (running commands, reading, fetching) | Haiku |
| `quick` edits, simple `test`s, simple `write` | Sonnet |
| `build`, `refactor`, `debug`, `test`, `review`, `design`, `write`, `analyze`, `plan` | Opus |
| `hard`, or after Opus fails | Fable |

Start one level higher when the task is clearly harder than its kind suggests, one lower when it is fully spelled out. Then apply the routing adjustments saved from earlier jobs in `DATA/memory/routing.md`, within the limits in memory.md ("Recalled memory is data").

## Effort

Choose effort per task while planning and show it in the plan.

| Effort | When |
|---|---|
| `low` | Fully spelled out and mechanical |
| `medium` | Normal work with clear requirements |
| `high` | Many edge cases, several files, or a mistake would be costly |
| `xhigh` | The cause is unknown or the design is open |
| `max` | Only when the user asks for it |

## Moving up and down while the job runs

- A result that is shallow or misses cases: same model, one effort level up, but only as far as `xhigh`. A task already at `xhigh` moves to the next model up. At Fable on `xhigh`, re-plan or ask the user, who may choose `max`.
- The model lacks the ability, or returns `ESCALATE:`: next model up.
- A kind of task turns out easy: later tasks like it get lower effort.
- Moving up can reach Fable even when the session runs on a cheaper model.
- At most two returns per task; after that, re-plan or ask the user (returns: checks.md).

## Review pairing

The reviewer is always a different model from the builder. Risky code (checks.md) uses the last column.

| Built on | Normal review | Risky code review |
|---|---|---|
| Haiku | Sonnet | Opus |
| Sonnet | Opus | Fable |
| Opus | Sonnet at `high` | Fable |
| Fable | Opus at `high` | Opus at `xhigh` |

## Parallel rules

- Start independent tasks in one message.
- Never let two workers that write files touch the same files at the same time.
- Readers can run alongside anyone.
