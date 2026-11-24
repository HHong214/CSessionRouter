# Changelog

## 1.1.0 - 2026-11-24

- Renamed to CSessionRouter. The commands are now `/CSessionRouter:route`, `plan`, `research`, `tdd`, `review` and `improve`, and the two worker types are `CSessionRouter:worker` and `CSessionRouter:reader`. The data folder keeps its older name, `~/.session-router`, so what was learned stays where it is.
- On GitHub now, by HHong214: https://github.com/HHong214/CSessionRouter. Install it with `claude plugin marketplace add https://github.com/HHong214/CSessionRouter.git`, then `claude plugin install CSessionRouter@csessionrouter`. Update it with `/plugin marketplace update csessionrouter`.
- Works with any agents panel that offers a plan-progress tool and a step-reporting tool for subagents, or with none. No other plugin is named in the rules any more.
- `improve` now works on the repository: it changes the plugin in your clone of it, never in the installed copy, makes one commit per applied proposal, and asks before it pushes.

## 1.0.0 - 2026-11-18

First version.

- `/session-router:route`: runs a full job: plans, splits the work across subagents with a model and effort chosen per task, checks every result and saves what it learns.
- `/session-router:plan`: plans any kind of task, saves and shows the plan, then stops so it can be carried out with `route`.
- `/session-router:research`: researches any topic from official, dated sources and gives a cited answer.
- `/session-router:tdd`: runs `route` with tests written first wherever a test is possible.
- `/session-router:review`: independent review of code the router did not build; reports only confirmed findings.
- `/session-router:improve`: shows the router's proposals to change its own files, applies the approved ones with a backup, and undoes the last one with `undo`.
