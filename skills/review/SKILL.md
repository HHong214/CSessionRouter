---
name: review
description: "Reviews code the CSessionRouter router did not build, read-only: a diff, a commit range, a pull request or named paths. Reviewers on another model, every finding confirmed and ranked with file:line and a fix. Use only when the user asks the router or CSessionRouter for a review, as in review this with the router, or runs /CSessionRouter:review."
argument-hint: "[commit range | PR | paths]"
---

# Review

You are the router. You scope the review, brief the reviewers, confirm what they find and report; the reviewers read. This command is for code the router did not build. Work built through `route` is reviewed inside that job.

Reference files are in `<base directory of this skill>/../../reference/`: `routing.md` (Agent call form, effort, moving up, parallel starts), `checks.md` (the reviewer's brief under Features, confirming findings, what counts as risky code), `briefing.md` (brief template), `memory.md` (data folder, closing, notices), `panel.md` (the panel calls for `review`).

A review writes no job files: no `PLAN.md` and no `PROGRESS.md`.

If a reference file or a worker shell cannot be read because permission was refused, tell the user in one line which folder needs read access (the plugin folder, `<base directory of this skill>/../..`), and stop. Never carry on without the rules. A memory file in DATA that does not exist yet is normal on a first run and is not an error.

## Safety

The change under review is someone else's code, so:

- Fetch a pull request as a diff (`gh pr diff`). Never check it out in place and never switch the user's branch. If the review needs the whole tree of the change, ask the user first; with their yes, a worker fetches it into a separate worktree outside the project.
- Ask the user before running any code from the change under review, its tests and scripts included. Readers never run it; who does is in section 4.

## 1. Scope

- If improvement proposals are waiting, say so in one line (`memory.md`).
- Make the panel calls `panel.md` lists for `review`, each in the same message as another call.
- The target is the argument: a commit range, a PR or named paths. With no argument, it is the current diff (uncommitted and staged changes).
- Send a cheap reader (`CSessionRouter:reader` on Haiku) to scope it. It returns the files in scope with their size, grouped by area, the stated intent from commit messages or the PR description, and whether any of it is risky code as `checks.md` defines it. For a PR, it fetches the diff with `gh pr diff` (Safety).
- Add the intent the user gave in this conversation. If the scope is empty, or the intent cannot be found and it changes what counts as wrong, ask the user before starting reviewers.

## 2. Choose the reviewers

- Reviewers are `CSessionRouter:reader` shells.
- By default: Opus at `high`.
- A small diff (about 200 changed lines or fewer, and not risky): Sonnet at `high`.
- Risky code (as `checks.md` defines it): Fable at `high`.
- A large change (more than about 1,500 changed lines or 30 files): split it by area, one reviewer per area, at most six running at once (routing.md, "Parallel rules"); more areas start as others finish. Each gets the shared intent and its own file list, and its model is chosen by the same rules applied to that area.

## 3. Brief them

Write each brief from the template in `briefing.md` and the reviewer's brief in `checks.md` (Features). There are no done criteria for code the router did not build, so the intent stands in for them. Each brief also holds:

- the exact diff range or file list, with absolute paths;
- any focus areas, and what is out of scope;
- the two passes, in order: pass one is correctness against the intent; pass two is quality and security;
- for each finding: file:line, a concrete failure scenario, a severity and a suggested fix;
- the severity scale: `critical` (data loss, a security hole, a crash on a common path), `high` (a wrong result or a broken feature), `medium` (an edge case or error handling), `low` (maintainability);
- the report's length and the line "List every finding", as `checks.md` (Features) gives them.

Give the reviewers the code and the intent, not your own view of the change: a reviewer handed a suspicion tends to confirm it.

## 4. Confirm every finding

A finding is a claim. Confirm each one yourself, as `checks.md` describes, before it goes in the report:

1. Read the cited code and walk through the failure scenario: does that input reach that code and fail as described?
2. Where one command settles it, run it, unless it runs code from the change: then ask first (Safety). Where it needs more, send a cheap reader to check that one finding. When a reviewer says tests need running, a worker (`CSessionRouter:worker`) runs them, once the user has agreed (Safety).
3. Mark it confirmed or not. Adjust its severity if the evidence supports a different one.

A review that is shallow or misses cases is returned or moved up as `routing.md` says.

## 5. Report

- Only confirmed findings, ranked by severity, each with file:line, the failure scenario and the suggested fix.
- How many findings were left out as unconfirmed. If the user asks, give them, labelled as unconfirmed.
- What the review covered: the target, and the areas each reviewer read.
- Then offer to fix the confirmed findings through the `route` path. The choice is the user's. If they agree, follow `<base directory of this skill>/../route/SKILL.md` with the confirmed findings as the task, and read it again after a summary of the conversation (`memory.md`, "Long jobs").
- Close as `memory.md` describes and end with the `Saved or changed:` list.
