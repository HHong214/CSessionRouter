# Checks and returns

Read this while planning, to write each task's check, and again before you check the first returned task. A worker's report is a claim until these checks have run.

## Every code task

- The project's own build, type-check and lint, where they exist.
- Tests re-run fresh by someone other than the builder, the output read, more than zero tests ran.
- Every new dependency verified to exist in its official registry, and to be the intended package, before it is installed.
- The diff compared with the brief: no unrelated files.
- Locked test files unchanged (methods.md).

## Features, in addition

- Tests first (methods.md).
- Then a review by a different model (pairing in routing.md), in two passes: does it meet the done criteria, then is the code good.
- The reviewer's brief holds the code, the intent and the done criteria, not the builder's report, and tells it to try to prove the work wrong.
- Findings come with `file:line` and a concrete failure scenario.
- You confirm each finding yourself before acting on it.

## Risky code

Sign-in, money, user data, deletion, concurrency, anything security-sensitive, a public API: also a security and secrets pass, and the reviewer comes from the risky column of the pairing table (routing.md).

## Other kinds of work

- **UI:** look at the result yourself (preview or screenshot), or send a reader that has browser tools.
- **Apps:** a real end-to-end run, not only unit tests.
- **Non-code tasks** (writing, research, analysis): checked against the brief, with facts and sources spot-checked.

## By size

| Size | Checks |
|---|---|
| Small change: alters no behaviour (a rename, a config value, a typo, a comment), or fixes a bug whose cause is one known line | The every-task checks plus one regression test |
| Feature: any change that adds or changes behaviour, however small (a new function, option or rule) | Add tests first where it can be tested, and the review. This holds on the light path too |
| New project | Add slices and a `PROGRESS.md` in the job folder, updated after each accepted task |

## Returns

A returned task gets a precise defect list, not the task re-explained. Each defect names the `file:line`, what is wrong, and what correct looks like. Whether the return goes to the same model at more effort or to the next model up: routing.md. At most two returns per task; after that, re-plan or ask the user. A confirmed review finding goes back to a worker the same way (route/SKILL.md, section 6).
