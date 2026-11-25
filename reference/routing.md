# Routing: models, effort and moving up

Read this at the start of a job. It is used when you give tasks a model and effort while planning, and when a result makes you change them.

## Agent call

Start each worker with the Agent tool:

- `subagent_type`: `"CSessionRouter:worker"` for a task that edits files, `"CSessionRouter:reader"` for one that only reads.
- `model`: `haiku`, `sonnet`, `opus` or `fable`.
- `effort`: `low`, `medium`, `high`, `xhigh` or `max`.
- `description`: the task title exactly as in the plan (panel.md says why).
- `prompt`: the brief (briefing.md).

Pass `model` and `effort` on every call, because the shells set neither. A worker that is continued with a message keeps the model and effort it started with. Where the Agent tool has a setting to run a worker in the background, set it, so that each result arrives when it is ready and not with the slowest of its wave. A job is not closed while a run is still out. Another plugin's specialist agent, or a built-in type (`Explore`, `web-fetch`), may be used instead when it fits the task better; set `model` and `effort` on it the same way.

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

A strong plan lets a cheaper model build. A build task whose tests are locked, and whose brief gives the files, the decisions and the command that proves it, starts on Sonnet at `medium`, unless it is risky code (checks.md) or clearly harder than a plain build: those start where the table and the paragraph above put them. The tests catch a miss, and one move up costs less than starting every such task high.

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

The reviewer is always a different model from the builder. Risky code (checks.md) uses the last column. A reviewer that a plan puts on Fable makes the job heavy, as any worker planned on Fable does (planning.md, "Heavy"), though it does not count toward the five worker tasks there.

| Built on | Normal review | Risky code review |
|---|---|---|
| Haiku | Sonnet | Opus |
| Sonnet | Opus | Fable |
| Opus | Sonnet at `high` | Fable |
| Fable | Opus at `high` | Opus at `xhigh` |

## Parallel rules

- Start a wave in one message (planning.md, "Waves").
- Never let two workers that write files touch the same files at the same time.
- Readers can run alongside anyone.
- Writers whose files do not meet can all start together, up to six agents of this job running at once, readers and checkers included, and fewer when the session allows fewer. If a start is refused because too many are running, start it when one finishes, not at once again.
- After 20 worker runs in one job (each Agent call and each worker continued by a message, readers and checkers too), ask the user, with the cost so far, before the next start or continuation, and again after each further 20. It asks about new tasks and returns only: the checks and the review of work a worker has reported, and of a run still out once it reports, run whatever the answer. On a no, nothing new starts; the job closes once the runs still out are checked, what was not built is named as not done and what failed its checks as failed, and the plan's status stays `started`, so it can be picked up.
- Workers that share one thing they all use (a dev server, a browser, a build folder): four at most, and each brief says what is shared and how to leave it.
- Every worker starts with nothing and pays to learn its task, and work in parallel reaches a usage limit sooner. Do not start a worker for what one read or one command of your own settles.
- Do not poll a running wave: its results arrive by themselves. Use the wait for work the results cannot change, such as the next briefs.
