---
name: tdd
description: "Runs the full CSessionRouter job with tests written first wherever a test is possible: one worker writes failing tests from the done criteria, the tests are locked, a different worker builds until they pass, and someone other than the builder re-runs them while the review runs. Use when the user says use TDD, test-driven, tests first, write the tests first, red green refactor, or fix this bug with a failing test first."
argument-hint: "[task]"
---

# TDD

This is the `route` job with one change: tests first is forced on every task where a test is possible, not only where `methods.md` would choose it.

## How to run it

Read `<base directory of this skill>/../route/SKILL.md` and follow it from start to finish, with the change below. Paths in it of the form `<base directory of this skill>/../../reference/<file>` resolve to the same reference folder from this skill's base directory, so read them from here.

If a reference file or a worker shell cannot be read because permission was refused, tell the user in one line which folder needs read access (the plugin folder, `<base directory of this skill>/../..`), and stop. Never carry on without the rules. A memory file in DATA that does not exist yet is normal on a first run and is not an error.

## The one change

- When you plan (`planning.md`, step 6), mark tests first on every task where a test can be written. The usual skips in `methods.md` (UI layout, config, docs, throwaway experiments) apply only where no test is possible.
- The plan says which tasks are tests first, as it does in `route`.
- When you pick up a plan approved earlier (`route`, section 1), re-mark every task where a test is possible as tests first, save the plan again with a dated line in its Decisions, and tell the user which tasks changed. If re-marking makes the job heavy (planning.md, "Heavy") or changes its task count, show the plan again and wait for approval. Otherwise continue.

## What you must not skip

For every tests-first task, run the tests-first sequence in `<base directory of this skill>/../../reference/methods.md` in full, and the bug-fix rule there for bugs. In short, by step:

1. The failing tests are written by one worker and shown to fail for the right reason.
2. The test files and their hashes are recorded; where commits were agreed, committing the test files is the lock.
3. A different worker builds; it does not edit the test files.
4. Someone other than the builder re-runs the tests fresh, and the hashes are unchanged.
5. The review starts together with that check; neither waits for the other. A refactor it asks for goes back as a return, with the tests green.

Everything else, including the approval check, the checks, closing and the notices, is as `route` describes.
