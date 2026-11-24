# Checks and returns

Read this at the start of a job. It is used while planning, to write each task's check, and when a task comes back. A worker's report is a claim until these checks have run.

## Every code task

- The project's own build, type-check and lint, where they exist.
- Tests re-run fresh by someone other than the builder, the output read, more than zero tests ran.
- Every new dependency verified to exist in its official registry, and to be the intended package, before it is installed.
- The diff compared with the brief: no unrelated files.
- Locked test files unchanged (methods.md).

## Running the checks

The checks run once for each result, in the way that costs least and still shows the real outcome.

- One command where it can be one: the build, the type-check, the lint and the tests in a row, stopping at the first failure, with the output sent to a file in a scratch folder outside the project and its last lines printed. Read the counts and the result, not the whole log.
- A run that is long, or that prints a great deal, goes to a checker: a worker on Haiku at `low` that did not build the task. Its brief gives it no file to change, says this is a check run and not a review, and lists the commands, the files the task may change and the locked test files. It returns each command's exit code and the lines that show its result, any changed file that is not on the list, and whether the locked files are unchanged. It fixes nothing and judges nothing.
- Start the checks and the review in one message. Neither waits for the other.
- A slow suite is still run for every code task. Send it to a checker, so that it runs while the review does.
- Do not run again what your own run or a checker's has shown, unless the files it covers have changed since. A worker's own report never stands in for that run.

## Features, in addition

- Tests first (methods.md).
- A review by a different model (pairing in routing.md), started with the checks, in two passes: does it meet the done criteria, then is the code good.
- The reviewer's brief holds the code, the intent and the done criteria, not the builder's report, and tells it to try to prove the work wrong.
- Findings come with `file:line` and a concrete failure scenario.
- You confirm each finding yourself before acting on it.
- The failed checks and the findings you confirmed go back in one defect list, so that the task is returned once. Wait for both before you return, unless a failed check makes the review pointless.

## Risky code

Sign-in, money, user data, deletion, concurrency, anything security-sensitive, a public API: also a security and secrets pass, and the reviewer comes from the risky column of the pairing table (routing.md).

## Other kinds of work

- **UI:** look at the result yourself (preview or screenshot), or send a reader that has browser tools.
- **Apps:** a real end-to-end run, not only unit tests.
- **Non-code tasks** (writing, research, analysis): checked against the brief, with facts and sources spot-checked.

## By size

| Size | Checks |
|---|---|
| Small change: alters no behaviour (a rename that nothing outside the code sees, a config value, a typo, a comment), or fixes a bug whose cause is one known line | The every-task checks plus one regression test |
| Feature: any change that adds or changes behaviour, however small (a new function, option or rule) | Add tests first where it can be tested, and the review. This holds on the light path too |
| New project | Add slices |

## Returns

A returned task gets a precise defect list, not the task re-explained. Each defect names the `file:line`, what is wrong, and what correct looks like. Whether the return stays at the same model and effort or moves up: routing.md. Whether the same worker goes on or a fresh one starts: briefing.md. After a return, the checks run again, and the review looks at the defects raised and at what the fix changed, not at the whole task again. Its reviewer is the one the pairing gives for the model that made the fix. At most two returns per task; after that, re-plan or ask the user. A confirmed review finding goes back to a worker the same way (route/SKILL.md, section 6).
