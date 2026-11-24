# Panel

Read this at the start of a command that makes panel calls; the list below says which do. The panel belongs to the Pixel Crew plugin; Session Router works the same without it.

If `mcp__CPixelCrew__progress` is among your tools, keep it current. It may be deferred: load it with ToolSearch `select:mcp__CPixelCrew__progress`. Skip all of this silently if it is absent.

Phases: `research`, `ask`, `plan`, `design`, `delegate`, `review`, `close`.

## Calls per command

**`route` and `tdd`, full flow:**

- First, before planning step 1: `title` and `phase` (then `research`, `ask` or `plan` as planning moves), no tasks.
- Once the plan is settled (approved, or shown and continuing): `total`, `tasks` and `phase: "delegate"`. `tasks` is `[{ title, kind, model, effort, after }]` in plan order, where `after` lists the numbers of the tasks it waits for.
- When a plan is picked up instead of planned, the first call carries `title`, `total`, `tasks` and `phase: "delegate"` together.
- `phase: "review"` while results are being checked.
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

Workers report their own steps with `mcp__CPixelCrew__step`; their shells tell them how. You do not call it.
