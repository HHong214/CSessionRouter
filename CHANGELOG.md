# Changelog

## 1.0.0 - 2026-11-18

First version.

- `/session-router:route`: runs a full job: plans, splits the work across subagents with a model and effort chosen per task, checks every result and saves what it learns.
- `/session-router:plan`: plans any kind of task, saves and shows the plan, then stops so it can be carried out with `route`.
- `/session-router:research`: researches any topic from official, dated sources and gives a cited answer.
- `/session-router:tdd`: runs `route` with tests written first wherever a test is possible.
- `/session-router:review`: independent review of code the router did not build; reports only confirmed findings.
- `/session-router:improve`: shows the router's proposals to change its own files, applies the approved ones with a backup, and undoes the last one with `undo`.
