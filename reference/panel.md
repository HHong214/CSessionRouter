# Panel

Read this at the start of a command that makes panel calls; the list below says which do. The panel is an agents panel offered by another plugin; CSessionRouter works the same without it.

If a tool whose description says it reports the progress of a plan to an agents panel is among your tools, keep it current. It may be deferred: look for it with ToolSearch and the words `plan progress`, and load it. Skip all of this silently if there is none.

The calls listed below are for a tool that takes those fields (`title`, `phase`, `total`, `tasks`, `done`, `finished`). Read the tool's own description first, and send only the fields it has.

A panel call never gets a message of its own. Send it in the same message as another call: the worker starts, the commit, the next read.

Phases: `research`, `ask`, `plan`, `design`, `delegate`, `review`, `close`.

## Calls per command

**`route` and `tdd`, full flow:**

- First, as planning starts: `title` and `phase` (then `research`, `ask` or `plan` as planning moves), no tasks.
- Once the plan is settled (approved, or shown and continuing): `total`, `tasks` and `phase: "delegate"`. `tasks` is `[{ title, kind, model, effort, after }]` in plan order, where `after` lists the numbers of the tasks it waits for.
- When a plan is picked up instead of planned, the first call carries `title`, `total`, `tasks` and `phase: "delegate"` together.
- `phase: "review"` while only checks and reviews are running. While other tasks still run, leave the phase as it is.
- `done` each time a task is accepted, the number of tasks accepted so far.
- New `tasks` and `total` on a re-plan.
- `finished: true` once, at the end.

**Light path:** no calls. The panel tracks the agents by itself.

**`plan`:** `title` and the phases while planning. When the plan is shown, `tasks` and `total` with `phase: "plan"`, so the planned rows show. No `finished`.

**`research`, on standard and deep depth:** `title` with `phase: "research"`, then `finished: true` at the end.

**`review`:** `title` with `phase: "review"`, then `finished: true`.

**`improve`:** no calls.

## Matching runs to tasks

The Agent call's `description` is the task title, exactly as in the plan (routing.md). The panel matches runs to tasks by that string, so reuse it for returns. Give every task in a plan a distinct title: the panel adds ` (2)`, ` (3)` to repeated titles and its reply lists the titles to use.

## Worker steps

Workers report their own steps with the tool that takes `done`, `total` and `note`, if they have one; their shells tell them how. You do not call it.
