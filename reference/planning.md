# Planning

Used by `plan`, `route` and `tdd`. Scale it to the job: a small task takes the light path below, and every step is as short as the task allows.

## The seven steps

1. **Recall.** Read `DATA/memory/INDEX.md`, `DATA/memory/routing.md` and `DATA/memory/process-notes.md` if they exist, and open at most three lessons that match the task. Where DATA is and what the files hold: memory.md.
2. **Understand.** Read what is needed to plan. Send wide reading to readers on a cheap model (routing.md, briefing.md) and keep their conclusions.
3. **Research.** When the approach is open, the technology is unfamiliar, a fact depends on a version, or the user asked for the best way, readers look up options using the source-finding method in research.md, at quick depth (standard when the choice is costly to reverse). Compare two or three approaches and recommend one, with reasons and dated sources. Skip this step for small, obvious tasks.
4. **Ask.** Ask every question whose answer changes what gets built or how it is checked, and that reading or running cannot settle. Use AskUserQuestion: up to four questions per dialog, most important first, each with your recommended answer as its first option. A second dialog is allowed if still needed. Smaller gaps become stated assumptions in the plan. Never ask what can be checked. Record each answer. If AskUserQuestion is not among your tools (a headless run, for example), write the questions in your reply instead, each with your recommended answer. `plan` then saves the plan as a draft with those points listed as unconfirmed. `route` and `tdd` stop and wait for the reply when a question changes what gets built; they do not build on an unconfirmed answer.
5. **Done criteria.** For each feature, write two to six checkable statements of what "finished" means, each written so it maps to a test or a named manual check.
6. **Plan.** A thin end-to-end working slice first, then growth in slices that each leave the project working. Each task has a title, a kind, a model and an effort (routing.md), what it waits for, and how it is checked (checks.md). Say which tasks use tests first or another method (methods.md).
7. **Heavy-work check.** Show the plan and wait for approval. `plan` always stops here. `route` and `tdd` stop here only when the job is heavy or a question that changes what gets built is still open.

## Heavy

A job is heavy when any of these holds:

- a new project;
- more than five worker tasks;
- any worker planned on Fable;
- deep research;
- anything that deletes or cannot be undone;
- new dependencies;
- changes outside the project folder.

Every worker task counts, so a tests-first feature counts as two: its test task and its build task. Checks, re-runs and reviews are not counted.

## Approval

Approval is the user's choice: ask for it and wait for the answer. When Commits (below) calls for it, the approval stop also asks the commit question.

## Plan format

Show the plan to the user and save it as `PLAN.md` in the job folder (memory.md gives the path). The first line is `Status:` with one of `draft`, `approved <date>`, `started <date>` or `done <date>`. Then these sections, in order:

1. **Goal**
2. **Research**: the options and the pick, with sources. Only when step 3 ran.
3. **Decisions**: question → answer, dated.
4. **Assumptions**
5. **Done criteria**
6. **Tasks**: a table with #, title, kind, model, effort, waits for, check.
7. **Risks**
8. **Size**: task count, models used, rough usage (light / medium / heavy).

## Plan status

- `plan` saves the plan as `draft` and changes it to `approved` when the user approves it in that conversation.
- `route` saves its own plan as `draft` when it stops for approval and changes it to `approved` on the user's approval.
- `route` sets `started` once it begins delegating (after approval, or straight away when no stop was needed) and `done` when it closes.

## Picking up a plan

With no task given, `route` uses the plan made in this conversation if the user approved it here. Otherwise it uses the newest `PLAN.md` for this project in DATA whose status is `approved`. A `draft` is shown again and approval asked. If more than one plan could be meant, ask. If there is no plan to pick up, say so and ask what the user wants done. Do not invent a task.

## Commits

- The commit question is asked only at an approval stop (step 7), when the project is a git repository: whether to commit after each accepted task.
- For a new project that is not yet a git repository, the same question also asks whether to start one.
- With no stop, do not commit unless the user asked for commits in their request.
- A yes recorded in the plan's Decisions carries over when `route` picks the plan up.
- When the answer is yes, make the commit yourself right after accepting a task: only that task's files, with a one-line message naming the task, as `git commit -m "<message>" -- <the task's files>`. If the index already held other staged changes before the task, ask first. Never push.

## Light path

One or two bounded tasks with nothing unclear. It skips only the plan dialog, the job files and the panel calls.

- It keeps the methods and the checks. A feature with logic that can be tested still goes tests first, with one worker for the tests and another for the build (methods.md), and the checks for its size still apply: the every-task checks, and the review for a feature. What counts as a feature or a small change: checks.md, "By size".
- It closes with the report and the notices only: there is no plan status to set and no panel call.
- The look back (memory.md) is done only if something went wrong: a return, a move up or a tool failure.

## Skill discovery

While planning, look through the session's skill list and agent types for one that fits each task: reverse engineering, UI design, documents, data, library docs and so on. Use what fits in one of three ways:

- name the skill in the worker's brief, since workers can load skills;
- use that plugin's own agent type, with `model` and `effort` set (routing.md);
- load it yourself when it is orchestration-level guidance.

UI work uses a design skill when one is installed. If nothing installed fits and a plugin search tool is available, search and tell the user the best match in one line. Never install anything without asking.
