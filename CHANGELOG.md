# Changelog

## 1.2.1 - 2026-11-24

- The commit after an accepted task now adds the task's files first. A commit by path alone fails on files git does not know yet, so a task that made a new file could not be committed as the rule was written.

## 1.2.0 - 2026-11-24

- Tasks are planned in waves and each wave starts in one message. The checks, the review and the docs of a build run side by side, and a build is returned once, with one list.
- A build with locked tests and a spelled-out brief starts on a cheaper model. A brief can name when the worker hands back and a budget of tool calls, and a spec is worked through before a worker gets it.
- Checks run once: in one command, or by a cheap checker for a long run. A result is not run again while its files are unchanged.
- A return goes to the same worker only when its run was short and recent, and otherwise to a fresh one.
- The router reads its rule files once, in one message, sends panel calls with other calls, and keeps a `PROGRESS.md` for every full job with a cost line for each worker run. A long job can go on in a fresh session from it.
- Routing adjustments now also step down, after three first-time passes in a row.
- A test task and its build task count as one when a job's size is judged.
- Workers keep their output short, stop after three attempts at the same failure, and say what is left on a partial result.
- `tools/check.mjs` checks the rule files: paths, section names, version, line endings, size, nothing private, and none of the author's other plugins named.

## 1.1.4 - 2026-11-24

- For anything that moves, changes over time or follows changing inputs, the first test brief also asks for tests of the changes, the first moment and an empty or cleared state. (proposal `20261123-first-test-brief-pins-the-changes`)

## 1.1.3 - 2026-11-24

- Before tests are locked, the router reads their edge cases against the contract and works each expected value, and the test worker type-checks its tests against the stated signatures. (proposal `20261122-read-tests-before-lock`)

## 1.1.2 - 2026-11-24

- When two tasks need the same new piece, or one rule is enforced partly in each, both briefs name the one task that owns it. (proposal `20261122-one-owner-for-a-shared-piece`)

## 1.1.1 - 2026-11-24

- A "Done when" for something that must hold in several places names the hardest place and why, and a check of "everywhere" lists each place it is run. (proposal `20261122-done-when-names-the-hardest-case`)

## 1.1.0 - 2026-11-24

- Renamed to CSessionRouter. The commands are now `/CSessionRouter:route`, `plan`, `research`, `tdd`, `review` and `improve`, and the two worker types are `CSessionRouter:worker` and `CSessionRouter:reader`. The data folder keeps its older name, `~/.session-router`, so what was learned stays where it is.
- On GitHub now, by HHong214: https://github.com/HHong214/CSessionRouter. Install it with `claude plugin marketplace add https://github.com/HHong214/CSessionRouter.git`, then `claude plugin install CSessionRouter@csessionrouter`. Update it with `/plugin marketplace update csessionrouter`.
- Works with any agents panel that offers a plan-progress tool and a step-reporting tool for subagents, or with none. No other plugin is named in the rules any more.
- `improve` now works on the repository: it changes the plugin in your clone of it, never in the installed copy, makes one commit per applied proposal, and asks before it pushes.
- `improve` is stricter at its edges. If a write to the data folder is refused after the commit was made, it says the change is committed (with the commit's short hash) but could not be filed, never applies it again, and files it at the start of the next run. The push question says that a push sends every unpushed commit on the clone's current branch and that the changelog line and the commit message become public, and shows those lines. Undo refuses when someone has committed to the file since the change was applied.
- The agents panel is optional everywhere: the panel calls are made only if a tool that takes those fields is there, and only the fields it has are sent.
- The README says what `improve` needs: a clone you can push to, which for anyone but the repository's owner is their own fork.

## 1.0.0 - 2026-11-18

First version.

- `/session-router:route`: runs a full job: plans, splits the work across subagents with a model and effort chosen per task, checks every result and saves what it learns.
- `/session-router:plan`: plans any kind of task, saves and shows the plan, then stops so it can be carried out with `route`.
- `/session-router:research`: researches any topic from official, dated sources and gives a cited answer.
- `/session-router:tdd`: runs `route` with tests written first wherever a test is possible.
- `/session-router:review`: independent review of code the router did not build; reports only confirmed findings.
- `/session-router:improve`: shows the router's proposals to change its own files, applies the approved ones with a backup, and undoes the last one with `undo`.
