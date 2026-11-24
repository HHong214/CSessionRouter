# Changelog

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
