<h1><img src="docs/wordmark.svg" alt="CSessionRouter" height="44"></h1>

CSessionRouter turns the main Claude Code session into a router: it plans a job, splits it into tasks, starts a subagent (a worker) for each task with a model and effort level chosen for that task, checks every result, and saves what it learns for later jobs. The router itself does not build; it runs on whatever model and effort your session is set to and never changes them. The plugin is six skills, two blank worker shells and a folder of shared reference files.

## Commands

| Command | What it does | Example |
|---|---|---|
| `/CSessionRouter:route [task]` | The full job: plan, delegate, check, close. With no task, carries out a plan you approved with `plan`, or asks what to do if there is none. | `/CSessionRouter:route add CSV export to the reports page` |
| `/CSessionRouter:plan <task>` | Plans any kind of task, saves and shows the plan, then stops for your approval. Nothing is built. | `/CSessionRouter:plan migrate the settings store to SQLite` |
| `/CSessionRouter:research [question]` | Research only, on any topic, with a cited answer and dated sources. | `/CSessionRouter:research what changed in React 19 forms` |
| `/CSessionRouter:tdd [task]` | `route` with tests written first wherever a test is possible. | `/CSessionRouter:tdd fix the off-by-one in pagination` |
| `/CSessionRouter:review [range, PR or paths]` | Independent read-only review of code the router did not build; reports only confirmed findings. With no argument, the current diff. See Review safety below. | `/CSessionRouter:review main..HEAD` |
| `/CSessionRouter:improve [undo]` | Goes through the router's proposals to change its own files; `undo` restores the last applied change. | `/CSessionRouter:improve` |

You can also say what you want in plain words and Claude loads the matching skill: "route this", "use TDD", "review the router's proposals". The `plan`, `research` and `review` skills answer only when you name the router or CSessionRouter ("plan this with the router", "research this with the router", "review this with the router") or type the command, so plain "make a plan first" or "review my changes" does not start them.

## How a job runs

### Planning

`plan`, `route` and `tdd` plan in seven steps, each as short as the job allows:

1. **Recall** lessons, routing adjustments and process notes saved from earlier jobs.
2. **Understand** the request. Wide reading goes to read-only workers on a cheap model.
3. **Research** options when the approach is open, the technology is unfamiliar, a fact depends on a version, or you asked for the best way. The router compares two or three approaches and recommends one, with dated sources.
4. **Ask** you the questions whose answers change what gets built or how it is checked, with recommended answers first. Smaller gaps become stated assumptions. If the session cannot show a question dialog, the questions go in the reply instead.
5. **Done criteria:** two to six checkable statements per feature.
6. **Plan** in working slices. Each task has a title, a kind of work, a model, an effort, a wave, what it waits for and how it is checked. A wave is the tasks that start together, in one message.
7. **Approval.** `plan` always stops here. `route` and `tdd` stop only when the job is heavy (a new project, more than five worker tasks, any task or reviewer on Fable, deep research, anything that deletes or cannot be undone, new dependencies, changes outside the project folder) or a question that changes the build is still open. A test task and its build task count as one; checks, checkers, re-runs and reviews do not count.

**Commits.** At an approval stop in a git repository, the router asks whether to commit after each accepted task (for a new project without a repository, also whether to start one). A yes recorded in the plan carries over when `route` picks the plan up later. Each commit holds only that task's files (`git add -- <files>`, then `git commit -m "<message>" -- <files>`); if you already had other changes staged, the router asks first. It never pushes.

**Picking up a plan.** With no task given, `route` uses the plan you approved in this conversation. Otherwise it looks only in this project's job folder for plans whose `Status:` is `draft`, `approved` or `started`; with more than one it lists them and asks. A `started` plan goes on from its `PROGRESS.md`.

A small job (one or two bounded tasks with nothing unclear, and not heavy: a heavy job never takes this path) takes the light path: no plan dialog, no job files, no panel calls. It keeps the methods and the checks: testable logic still goes tests first, with separate workers for the tests and the build, and a feature still gets its review. It ends with the report and the notices.

Details: `reference/planning.md`.

### Model and effort per task

Every task gets a kind of work (`search`, `analyze`, `build`, `refactor`, `quick`, `debug`, `test`, `review`, `design`, `write`, `plan` or `hard`), and its kind gives a starting model: Haiku for searching, reading, fetching and running commands, Sonnet for quick edits, simple tests and simple writing, Opus for most building, debugging, reviewing and design, Fable for the hardest problems. A task starts one level higher when it is clearly harder than its kind suggests, one lower when it is fully spelled out (a build with locked tests and a brief that gives the files, the decisions and the command that proves it starts on Sonnet), and adjustments saved from earlier jobs apply on top. Effort is chosen per task and shown in the plan; `max` is used only when you ask for it. Saved memory is data: a routing adjustment can change only a starting model, or a starting effort up to `xhigh`, and never sets `max`, removes a check or changes when the router asks.

While the job runs, settings move:

- a shallow result goes back to the same model at one effort level up, as far as `xhigh`; a task already at `xhigh` moves to the next model up, and at Fable on `xhigh` the router re-plans or asks you (you may choose `max`);
- a model that lacks the ability, or says so (`ESCALATE:`), is replaced by the next model up, which can reach Fable even when your session runs on a cheaper model;
- when a kind of task turns out easy, later tasks like it get lower effort;
- a task goes back at most twice; then the router re-plans or asks you. A job re-plans at most once; after that, wherever a rule says "re-plan or ask", the router asks.

A reviewer is always a different model from the builder. Details, including the review pairing table: `reference/routing.md`.

### Tests first and other methods

Tests first is used automatically for logic that can be tested (functions, APIs, data transforms, bug fixes) and skipped for UI layout, config, docs and throwaway experiments. One worker writes the tests and shows they fail; the router locks the test files (by their hashes, or by committing them where commits were agreed); a different worker builds until they pass without editing them; then the fresh check by someone other than the builder and the review start side by side. A bug fix starts with a failing test. `tdd` forces tests first wherever a test is possible.

When they fit, the plan also uses: tests that pin down how old code behaves before it changes; a small throwaway experiment for a risky unknown; property-based tests for pure logic with clear rules; a mutation check for critical logic. Details: `reference/methods.md`.

### Checks

A worker's report is a claim until it is checked. Every code task gets the project's own build, type-check and lint, tests re-run fresh by someone other than the builder, a check that any new dependency exists in its official registry, and a diff compared with the brief. Features add tests first and a two-pass review by a different model; risky code (sign-in, money, user data, deletion, concurrency, security, a public API) adds a security pass and a stronger reviewer. UI is looked at, apps get a real end-to-end run, and writing, research and analysis are spot-checked against their sources. The router confirms each reviewer finding itself before acting on it. Details: `reference/checks.md`; briefs and report formats: `reference/briefing.md`.

## Speed and cost

Version 1.2.0 is built to make a job faster and cheaper, and every check stays.

- **Waves.** The plan groups tasks into waves, and each wave starts in one message. The checks, the review and the docs of a build run side by side, and a build that fails is returned once, with one list of defects.
- **Cheaper builds.** A build with locked tests and a spelled-out brief starts on a cheaper model. A spec is worked through before a worker gets it, and a brief can say when the worker must hand back and how many tool calls it may use.
- **Checks run once.** They run in one command, or a cheap checker runs a long one. A result is not run again while its files are unchanged.
- **Returns.** A return goes to the same worker only when its run was short and recent. Otherwise a fresh worker takes it.
- **A lean router.** It reads its rule files once, in one message, and sends panel calls together with other calls. Every full job keeps a `PROGRESS.md` with a cost line for each worker run, so a long job can go on in a fresh session.
- **Routing that learns both ways.** When a kind of task has been accepted first time three times in a row, later jobs start it one step cheaper: the model or the effort, not both, and never at a setting that has failed before.

**Limits (1.3.0).** At most six agents of a job run at once, readers and checkers included. After 20 worker runs in one job the router asks you, with the cost so far, before it starts more, and again after each further 20; it asks about new tasks and returns only, and the checks of work already reported still run. On a no, nothing new starts, the job closes once the runs still out are checked, and the plan stays `started` so it can be picked up.

Two facts to plan around. The router's own conversation is the largest share of a long job's cost, so a job is cheapest started in a fresh session. And the router runs at whatever model and effort the session is set to, so a session set to a lower effort costs less, while hard tasks still go up to a stronger worker.

## Research

`/CSessionRouter:research` picks a depth from the question:

| Depth | For | Searchers |
|---|---|---|
| Quick | A simple fact with one authoritative source | 1, about 3 to 10 tool calls |
| Standard | A comparison or a how-to across sources | 3 or 4, about 10 to 15 calls each |
| Deep | A broad or high-stakes topic | 8 to 12 in all, in waves of six at most; the router shows you the research plan and waits for your approval first |

**Sources first.** Before any reading, the searchers find the owner of the topic (official site, docs and repository), the newest version and its date, the version you use when the question is about a project, and the site's own index (`llms.txt`, a sitemap or a versions page). They check each page's date, rank official docs first and forums last, and confirm each key claim with a second independent source. For non-technical topics, "official" means the original source: the paper, the official statistics, the organisation's own statement. Facts that depend on a version are never taken from the model's memory.

**Trusted sources.** No website is built into the plugin. The router keeps its own list in `~/.session-router/memory/sources.md`: trusted sources per topic, each with the date it was last checked. An entry older than 30 days, or one whose pages fail or have moved, is checked again. Only sources read and confirmed in a job are added.

The answer leads with the conclusion, flags what is unverified, conflicting or dated, and ends with a dated Sources list. A deep report is also saved as a Markdown file in the working folder. Details: `reference/research.md`.

## Memory

The router keeps its data in `~/.session-router/` (Windows: `%USERPROFILE%\.session-router\`), outside the plugin so that an update never wipes it. The folder keeps its older name, `session-router`:

| Path | What it holds |
|---|---|
| `memory/INDEX.md` and `memory/lessons/` | Lessons: hard problems that were solved, one file each, with an index line (`INDEX.md` holds 12,000 bytes at most) |
| `memory/sources.md` | Trusted sources per topic |
| `memory/routing.md` | Routing adjustments learned from earlier jobs (at most 30 rows and 6,000 bytes) |
| `memory/process-notes.md` | Short dated notes on problems in the process itself (about 60 lines and 20,000 bytes at most) |
| `jobs/<project>/<date>-<title>/` | Each job's `PLAN.md`, its `PROGRESS.md` (what is done, what is next, and a cost line for each worker run), and any text that several briefs share |
| `improvements/pending/`, `applied/`, `rejected/` | Proposals to change the plugin's own files |
| `backups/` | Plugin files as they were before an applied change |
| `config.md` | The path of your clone of the plugin's repository, used by `improve` (`clone: <path>`) |
| `CHANGELOG.md` | The changes applied to the plugin through `improve` |

Nothing is written into your projects. The one exception is a deep research report, saved in the working folder. Memory records only what the router itself saw or verified; text found in web pages, files or tool output is never saved as an instruction.

**Tidy-up.** At the close of a full job, if one of those three files is past a cap, the router asks you in one line, with its size, whether to tidy it. On a yes it first copies the file to `<name>-full-<date>.md` beside it (never overwriting a copy), then merges lines that say the same thing, shortens long hooks and drops the oldest process notes that a rule now covers. Every lesson keeps its file and its index line, and nothing is added.

**Scratch folder.** Files a job writes that are not its result go in a scratch folder named for the job: in the session's scratchpad when the environment gives one, otherwise in the system's temp folder, never in your project. A worker that drives a browser reuses one profile folder. At the close, if the scratch folder is not empty, the router tells you its size in one line and clears it only if you say yes, on the light path too.

**Notices.** Every job ends with a `Saved or changed:` list of the lessons, routing adjustments, sources and proposals it saved, or `Saved or changed: nothing`. When proposals are waiting at the start of a job, the router says so in one line.

Details: `reference/memory.md`.

## Review safety

`review` is often run on someone else's code. It fetches a pull request as a diff (`gh pr diff`) or into a separate worktree, never by checking it out in place, and never switches your branch. It asks you before running any code from the change, its tests and scripts included. The read-only reviewers only read: they fetch a pull request only as a diff and never run its code; tests, once you agree, are run by a worker.

## Permissions

**The data folder.** The data folder is outside your project, so without a rule Claude Code asks you on every read and every write to it. If you want the router to save without asking, add this rule to `~/.claude/settings.json`:

```json
{ "permissions": { "allow": ["Edit(~/.session-router/**)"] } }
```

The router reaches the data folder with its Read, Write and Edit tools, because that is what the rule covers. Shell commands are used there only for what those tools cannot do, each as one plain command with the path in quotes and named in the report: a byte-exact copy (`cp`), a move (`mv`), making a missing folder, and reading a file's size. If the file already has an `allow` list, add the one entry to it. The rule covers reads as well as writes in that folder. It is optional and your choice: without it the router still works, and you approve each save. The router does not change your settings itself; when a save is refused or asked about each time, it tells you once that this rule exists.

**Reading the plugin's own folder.** The skills read their shared rules from the plugin's `reference/` folder. In a session that asks before reading outside the project, allow reads of the plugin's folder. If a read of those rules is refused, the router tells you in one line which folder needs read access and stops, rather than carrying on without its rules.

**Edits to the plugin's own files.** `improve` changes the plugin only in a clone of its repository, never in the installed copy, which an update would overwrite. `improve` and `improve undo` always ask you before each change, and Claude Code may ask before each write in the clone. That is intended: memory lives in the data folder, where a rule can allow it, and the plugin's own instructions stay behind an approval. Nothing is pushed without your answer.

## Learning

- **Saved by itself** when a job closes: process notes, routing adjustments, and lessons for problems that took two or more rounds, needed a stronger model, had a non-obvious cause or exposed a quirk of the environment.
- **Needs `/CSessionRouter:improve`:** any change to the plugin's own skills and reference files. The router writes such a change only as a proposal, and only when the same problem has shown up in two or more jobs. `improve` shows each proposal (the problem, the evidence, the file and the exact before and after text) and asks you: Approve, Reject or Later. It works on a clone of the plugin's repository (it asks for the path once and keeps it in `config.md`; suggested: `Documents\GitHub\CSessionRouter` under your home folder). An approved change is backed up first (the backup is named for the version the change produces), made in the clone, raises the clone's patch version, and is committed there, one commit per proposal; only then is it logged and marked applied. Then `improve` asks whether to push, once. The question says that a push sends every unpushed commit on the clone's current branch, not only the router's, and that the changelog line and the commit message become public with it, and it shows those lines first. It never pushes without your answer. After a push, the change takes effect once you run `/plugin marketplace update csessionrouter` and `/reload-plugins`. If you decline a write, or Claude Code refuses it, anything already changed is restored, nothing is logged, the proposal stays waiting, and the router shows you the exact change so you can allow it or apply it by hand. If a write to the data folder is refused after the commit was made, the commit stays and is never applied again: `improve` tells you the change is committed (with the commit's short hash) but could not be filed, and at the start of the next run it recognises the waiting proposal and files it. A rejected change is not proposed again.
- **Protected rules** can never be proposed away: approval before heavy work; asking when something is unconfirmed; the every-task checks; the notices; approval for changes to the plugin's own files; recording only what was observed; no `max` effort unless you ask; the router does not build. A proposal that would weaken one, or that edits the sections defining them (listed in `reference/improve.md`), is not offered and is moved to the rejected proposals with a note.
- **Undo:** `/CSessionRouter:improve undo` restores the newest backup in the clone as a new commit, after asking you, and raises the patch version again. If anyone has committed to one of those files since the change was applied (other than later changes of `improve` that were already undone), it refuses, names the commit and leaves everything as it is. A second undo steps back one change further. The undone proposal is not proposed again. A refused or declined write is handled as it is when applying.

When `improve` starts, it checks that the text of each applied change is still in its file in the clone. If the clone was reset or checked out at another version and some are missing, it names them in one line and does not re-apply them without your answer.

Details: `reference/improve.md`.

## Works with an agents panel

Some plugins add an agents panel to Claude Code and offer two tools for it: one that reports the progress of a plan, and one that lets a subagent report its own steps. CSessionRouter uses them when they are there: the router reports its plan to the panel (the plan's title and phase, then each task with its kind, model and effort, as planned rows), each worker is started with its task title as its description, so the panel matches runs to tasks, and the workers report their own steps to their rows. The light path and `improve` make no panel calls; the panel still shows their agents. CPixelCrew (https://github.com/HHong214/CPixelCrew) is one companion that offers such tools.

Without such tools, or with no panel at all, CSessionRouter works the same: the panel calls are skipped silently. Details: `reference/panel.md`.

## Install

CSessionRouter is installed from its GitHub repository, which is its own marketplace (`.claude-plugin/marketplace.json`, named `csessionrouter`):

```
claude plugin marketplace add https://github.com/HHong214/CSessionRouter.git
claude plugin install CSessionRouter@csessionrouter
```

Then run `/reload-plugins`, or start a new session.

## Update

The version is pinned, so a new one reaches you only when you ask for it:

```
/plugin marketplace update csessionrouter
```

Then run `/reload-plugins`.

## What improve needs

`/CSessionRouter:improve` changes the plugin in a clone of its repository and asks before it pushes, so it needs a clone you can push to. If you own the repository (HHong214), your clone of it is enough. Anyone else cannot push to it and needs their own fork: fork the repository on GitHub, clone your fork, and add your fork as the marketplace, so that what you push is what you install:

```
git clone <address of your fork>
claude plugin marketplace add <address of your fork>
```

Without such a clone, proposals stay pending and everything else works the same.

## Checking the plugin

The rules are Markdown files, so a wrong file name or a missing section heading breaks nothing until a model follows it. After you change the plugin, run this in your clone (Node 18 or later, no installs):

```
node tools/check.mjs
```

It checks the rule files for misspelt file names, section references that point at no heading, the version (`plugin.json`, the top CHANGELOG entry and the marketplace file must agree), line endings, size, anything private and the names of the author's other plugins. Size is a line cap and a byte cap for the eight files every job reads (600 lines and 54,000 bytes together). A missing file is a failed check, and both worker shells must keep `disallowedTools`. It prints one line for each failure and exits with 1 if there is any. `node tools/check.mjs --list` also prints every reference it recognised, and `--root <folder>` checks another copy of the repository.

## What has been tested

Checked in headless test runs of version 1.0.0 (`claude -p` with the plugin loaded). Version 1.1.0 renamed the plugin, dropped the panel plugin's name from the rules and moved `improve` to the repository, and version 1.2.0 made the speed and cost changes. Since then the plugin has run the owner's own jobs in interactive sessions, which are working sessions and not test runs: from 2026-11-20 to 2026-11-24 the data folder saved 25 plans, 24 of them closed as done, and `improve` applied five proposals, each with its own commit (1.1.1 to 1.1.4 and 1.2.2). The changes of version 1.3.0 have not been run in a job yet.

What the 1.0.0 runs showed:

- The six skills and the two worker shells load.
- The skills find the shared reference files from their own folder.
- `plan` writes a plan with done criteria and a task table, saves `PLAN.md` with `Status: draft` in the job folder, and stops without building.
- The model and the effort set on each worker reach that worker's requests.
- The read-only shell has no Edit, Write or Agent tool; the editing shell has no Agent tool.
- With the rule above, the router reads and writes the data folder without asking; without it, each read and write needs your approval.

- A full `route` job with an agents panel plugin loaded and the router on Sonnet: the workers ran on the model and effort set for them; tests were written first by one worker, locked, and left unchanged by the builder; the tests were re-run fresh; a review ran on a different model; the progress bar got the task list, the counts and the finish.
- A small job on the light path: two workers with tests first, and no panel call at the close.

Not yet tested in a test run: an interactive session (the question dialog, an approval stop, commits), which the owner's jobs use but no run has checked rule by rule, and a `tdd`, `research` or `review` job (`improve` is above). In the first full `route` test the router also strayed from some rules (it fixed review findings itself and did not save its plan). After the wording was tightened, a second run saved the plan and sent the findings back to a worker. Three points were tightened once more after that run and have not been re-tested: writing the plan in the reply before the first worker starts, making the first progress-bar call as planning starts, and saving a look back after a return. These skills are instructions a model follows, so a weaker session model will stray more often than a stronger one. The read-only shell does not block shell tools: if a session offers it Bash or PowerShell, only its instructions stop it from changing files.

## Licence

MIT: see [LICENSE](LICENSE).

CSessionRouter is not affiliated with or endorsed by Anthropic. Claude is a trademark of Anthropic.
