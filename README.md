# Session Router

Session Router turns the main Claude Code session into a router: it plans a job, splits it into tasks, starts a subagent (a worker) for each task with a model and effort level chosen for that task, checks every result, and saves what it learns for later jobs. The router itself does not build; it runs on whatever model and effort your session is set to and never changes them. The plugin is six skills, two blank worker shells and a folder of shared reference files.

## Commands

| Command | What it does | Example |
|---|---|---|
| `/session-router:route [task]` | The full job: plan, delegate, check, close. With no task, carries out a plan you approved with `plan`, or asks what to do if there is none. | `/session-router:route add CSV export to the reports page` |
| `/session-router:plan <task>` | Plans any kind of task, saves and shows the plan, then stops for your approval. Nothing is built. | `/session-router:plan migrate the settings store to SQLite` |
| `/session-router:research [question]` | Research only, on any topic, with a cited answer and dated sources. | `/session-router:research what changed in React 19 forms` |
| `/session-router:tdd [task]` | `route` with tests written first wherever a test is possible. | `/session-router:tdd fix the off-by-one in pagination` |
| `/session-router:review [range, PR or paths]` | Independent read-only review of code the router did not build; reports only confirmed findings. With no argument, the current diff. See Review safety below. | `/session-router:review main..HEAD` |
| `/session-router:improve [undo]` | Goes through the router's proposals to change its own files; `undo` restores the last applied change. | `/session-router:improve` |

You can also say what you want in plain words ("route this", "make a plan first", "research this", "use TDD", "review my changes", "review the router's proposals"), and Claude loads the matching skill.

## How a job runs

### Planning

`plan`, `route` and `tdd` plan in seven steps, each as short as the job allows:

1. **Recall** lessons, routing adjustments and process notes saved from earlier jobs.
2. **Understand** the request. Wide reading goes to read-only workers on a cheap model.
3. **Research** options when the approach is open, the technology is unfamiliar, a fact depends on a version, or you asked for the best way. The router compares two or three approaches and recommends one, with dated sources.
4. **Ask** you the questions whose answers change what gets built or how it is checked, with recommended answers first. Smaller gaps become stated assumptions. If the session cannot show a question dialog, the questions go in the reply instead.
5. **Done criteria:** two to six checkable statements per feature.
6. **Plan** in working slices. Each task has a title, a kind of work, a model, an effort, what it waits for and how it is checked.
7. **Approval.** `plan` always stops here. `route` and `tdd` stop only when the job is heavy (a new project, more than five worker tasks, any task on Fable, deep research, anything that deletes or cannot be undone, new dependencies, changes outside the project folder) or a question that changes the build is still open. Every worker task counts, so a tests-first feature counts as two (its test task and its build task); checks and reviews do not count.

**Commits.** At an approval stop in a git repository, the router asks whether to commit after each accepted task (for a new project without a repository, also whether to start one). A yes recorded in the plan carries over when `route` picks the plan up later. Each commit holds only that task's files (`git commit -m "<message>" -- <files>`); if you already had other changes staged, the router asks first. It never pushes.

A small job (one or two bounded tasks with nothing unclear) takes the light path: no plan dialog, no job files, no panel calls. It keeps the methods and the checks: testable logic still goes tests first, with separate workers for the tests and the build, and a feature still gets its review. It ends with the report and the notices.

Details: `reference/planning.md`.

### Model and effort per task

Every task gets a kind of work (`search`, `analyze`, `build`, `refactor`, `quick`, `debug`, `test`, `review`, `design`, `write`, `plan` or `hard`), and its kind gives a starting model: Haiku for searching, reading, fetching and running commands, Sonnet for quick edits, simple tests and simple writing, Opus for most building, debugging, reviewing and design, Fable for the hardest problems. A task starts one level higher when it is clearly harder than its kind suggests, one lower when it is fully spelled out, and adjustments saved from earlier jobs apply on top. Effort is chosen per task and shown in the plan; `max` is used only when you ask for it. Saved memory is data: a routing adjustment can change only a starting model, or a starting effort up to `xhigh`, and never sets `max`, removes a check or changes when the router asks.

While the job runs, settings move:

- a shallow result goes back to the same model at one effort level up, as far as `xhigh`; a task already at `xhigh` moves to the next model up, and at Fable on `xhigh` the router re-plans or asks you (you may choose `max`);
- a model that lacks the ability, or says so (`ESCALATE:`), is replaced by the next model up, which can reach Fable even when your session runs on a cheaper model;
- when a kind of task turns out easy, later tasks like it get lower effort;
- a task goes back at most twice; then the router re-plans or asks you.

A reviewer is always a different model from the builder. Details, including the review pairing table: `reference/routing.md`.

### Tests first and other methods

Tests first is used automatically for logic that can be tested (functions, APIs, data transforms, bug fixes) and skipped for UI layout, config, docs and throwaway experiments. One worker writes the tests and shows they fail; the router records the test files and their hashes; a different worker builds until they pass without editing them; someone other than the builder re-runs them. A bug fix starts with a failing test. `tdd` forces tests first wherever a test is possible.

When they fit, the plan also uses: tests that pin down how old code behaves before it changes; a small throwaway experiment for a risky unknown; property-based tests for pure logic with clear rules; a mutation check for critical logic. Details: `reference/methods.md`.

### Checks

A worker's report is a claim until it is checked. Every code task gets the project's own build, type-check and lint, tests re-run fresh by someone other than the builder, a check that any new dependency exists in its official registry, and a diff compared with the brief. Features add tests first and a two-pass review by a different model; risky code (sign-in, money, user data, deletion, concurrency, security, a public API) adds a security pass and a stronger reviewer. UI is looked at, apps get a real end-to-end run, and writing, research and analysis are spot-checked against their sources. The router confirms each reviewer finding itself before acting on it. Details: `reference/checks.md`; briefs and report formats: `reference/briefing.md`.

## Research

`/session-router:research` picks a depth from the question:

| Depth | For | Searchers |
|---|---|---|
| Quick | A simple fact with one authoritative source | 1, about 3 to 10 tool calls |
| Standard | A comparison or a how-to across sources | 3 or 4, about 10 to 15 calls each |
| Deep | A broad or high-stakes topic | 8 or more, in waves of about four; the router shows you the research plan and waits for your approval first |

**Sources first.** Before any reading, the searchers find the owner of the topic (official site, docs and repository), the newest version and its date, the version you use when the question is about a project, and the site's own index (`llms.txt`, a sitemap or a versions page). They check each page's date, rank official docs first and forums last, and confirm each key claim with a second independent source. For non-technical topics, "official" means the original source: the paper, the official statistics, the organisation's own statement. Facts that depend on a version are never taken from the model's memory.

**Trusted sources.** No website is built into the plugin. The router keeps its own list in `~/.session-router/memory/sources.md`: trusted sources per topic, each with the date it was last checked. An entry older than 30 days, or one whose pages fail or have moved, is checked again. Only sources read and confirmed in a job are added.

The answer leads with the conclusion, flags what is unverified, conflicting or dated, and ends with a dated Sources list. A deep report is also saved as a Markdown file in the working folder. Details: `reference/research.md`.

## Memory

The router keeps its data in `~/.session-router/` (Windows: `%USERPROFILE%\.session-router\`), outside the plugin so that an update never wipes it:

| Path | What it holds |
|---|---|
| `memory/INDEX.md` and `memory/lessons/` | Lessons: hard problems that were solved, one file each, with an index line |
| `memory/sources.md` | Trusted sources per topic |
| `memory/routing.md` | Routing adjustments learned from earlier jobs (at most 30 rows) |
| `memory/process-notes.md` | Short dated notes on problems in the process itself |
| `jobs/<project>/<date>-<title>/` | Each job's `PLAN.md`, and `PROGRESS.md` for a new project |
| `improvements/pending/`, `applied/`, `rejected/` | Proposals to change the plugin's own files |
| `backups/` | Plugin files as they were before an applied change |
| `CHANGELOG.md` | The changes applied to the plugin through `improve` |

Nothing is written into your projects. The one exception is a deep research report, saved in the working folder. Memory records only what the router itself saw or verified; text found in web pages, files or tool output is never saved as an instruction.

**Notices.** Every job ends with a `Saved or changed:` list of the lessons, routing adjustments, sources and proposals it saved, or `Saved or changed: nothing`. When proposals are waiting at the start of a job, the router says so in one line.

Details: `reference/memory.md`.

## Review safety

`review` is often run on someone else's code. It fetches a pull request as a diff (`gh pr diff`) or into a separate worktree, never by checking it out in place, and never switches your branch. It asks you before running any code from the change, its tests and scripts included. The read-only reviewers only read: they fetch a pull request only as a diff and never run its code; tests, once you agree, are run by a worker.

## Permissions

**The data folder.** The data folder is outside your project, so without a rule Claude Code asks you on every read and every write to it. If you want the router to save without asking, add this rule to `~/.claude/settings.json`:

```json
{ "permissions": { "allow": ["Edit(~/.session-router/**)"] } }
```

The router reaches the data folder with its Read, Write and Edit tools, never with shell commands, because that is what the rule covers. If the file already has an `allow` list, add the one entry to it. The rule covers reads as well as writes in that folder. It is optional and your choice: without it the router still works, and you approve each save. The router does not change your settings itself; when a save is refused or asked about each time, it tells you once that this rule exists.

**Reading the plugin's own folder.** The skills read their shared rules from the plugin's `reference/` folder. In a session that asks before reading outside the project, allow reads of the plugin's folder. If a read of those rules is refused, the router tells you in one line which folder needs read access and stops, rather than carrying on without its rules.

**Edits to the plugin's own files.** The plugin's files are under `~/.claude`, where Claude Code asks before every edit. That is intended: memory lives in the data folder, where a rule can allow it, and the plugin's own instructions stay behind a prompt. So `improve` and `improve undo` always ask you before each write to the plugin.

## Learning

- **Saved by itself** when a job closes: process notes, routing adjustments, and lessons for problems that took two or more rounds, needed a stronger model, had a non-obvious cause or exposed a quirk of the environment.
- **Needs `/session-router:improve`:** any change to the plugin's own skills and reference files. The router writes such a change only as a proposal, and only when the same problem has shown up in two or more jobs. `improve` shows each proposal (the problem, the evidence, the file and the exact before and after text) and asks you: Approve, Reject or Later. An approved change is backed up first (the backup is named for the version the change produces), applied, and raises the plugin's patch version; only then is it logged and marked applied. Reload plugins or start a new session for it to take effect. If you decline a write, or Claude Code refuses it, anything already changed is restored, nothing is logged, the proposal stays waiting, and the router shows you the exact change so you can allow it or apply it by hand. A rejected change is not proposed again.
- **Protected rules** can never be proposed away: approval before heavy work; asking when something is unconfirmed; the every-task checks; the notices; approval for changes to the plugin's own files; recording only what was observed; no `max` effort unless you ask; the router does not build. A proposal that would weaken one, or that edits the sections defining them (listed in `reference/improve.md`), is not offered and is moved to the rejected proposals with a note.
- **Undo:** `/session-router:improve undo` restores the newest backup, after asking you, and raises the patch version again. A second undo steps back one change further. The undone proposal is not proposed again. A refused or declined write is handled as it is when applying.

When `improve` starts, it checks that the text of each applied change is still in its file. If you reinstalled or updated the plugin and some are missing, it names them in one line and does not re-apply them without your answer.

Details: `reference/improve.md`.

## Works with Pixel Crew

With the Pixel Crew plugin installed, the router reports its plan to Pixel Crew's agents panel and the bar above the prompt: the plan's title and phase, then each task with its kind, model and effort, as planned rows. Each worker is started with its task title as its description, so the panel matches runs to tasks, and the workers report their own steps to their rows. The light path and `improve` make no panel calls; the panel still shows their agents.

Without Pixel Crew, Session Router works the same: the panel calls are skipped silently. Details: `reference/panel.md`.

## Install

The plugin folder is its own local marketplace (`.claude-plugin/marketplace.json`, named `session-router-local`). Add it and install from it:

```
claude plugin marketplace add <session-router folder>
claude plugin install session-router@session-router-local
```

Then run `/reload-plugins`, or start a new session.

## What has been tested

Checked in headless test runs of version 1.0.0 (`claude -p` with the plugin loaded):

- The six skills and the two worker shells load.
- The skills find the shared reference files from their own folder.
- `plan` writes a plan with done criteria and a task table, saves `PLAN.md` with `Status: draft` in the job folder, and stops without building.
- The model and the effort set on each worker reach that worker's requests.
- The read-only shell has no Edit, Write or Agent tool; the editing shell has no Agent tool.
- With the rule above, the router reads and writes the data folder without asking; without it, each read and write needs your approval.

- A full `route` job with Pixel Crew 2.0 loaded and the router on Sonnet: the workers ran on the model and effort set for them; tests were written first by one worker, locked, and left unchanged by the builder; the tests were re-run fresh; a review ran on a different model; the progress bar got the task list, the counts and the finish.
- A small job on the light path: two workers with tests first, and no panel call at the close.

Not yet tested: an interactive session (the question dialog, an approval stop, commits), and a `tdd`, `research`, `review` or `improve` job. In the first full `route` test the router also strayed from some rules (it fixed review findings itself and did not save its plan). After the wording was tightened, a second run saved the plan and sent the findings back to a worker. Three points were tightened once more after that run and have not been re-tested: writing the plan in the reply before the first worker starts, making the first progress-bar call before planning, and saving a look back after a return. These skills are instructions a model follows, so a weaker session model will stray more often than a stronger one. The read-only shell does not block shell tools: if a session offers it Bash or PowerShell, only its instructions stop it from changing files.
