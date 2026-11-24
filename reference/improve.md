# Learning and improvement proposals

How the router learns across jobs, and how a change to the plugin's own files is proposed, applied and undone. The memory files, closing a job and the notices are in `memory.md`, which also says where DATA is.

## What saves on its own, and what needs a proposal

- Process notes and routing adjustments save automatically when a job closes (`memory.md`). They need no proposal, and they stay within the limits in `memory.md` ("Recalled memory is data"): they never override a protected rule or any rule in the skill and reference files.
- A change to the plugin's own files is written as a proposal, and only when the same problem shows up in two or more jobs.
- Do not propose a change the user has rejected before: look in `DATA/improvements/rejected/` first.
- A proposal records only what you saw or verified in those jobs (the observations-only rule in `memory.md`).
- The plugin's files are never changed outside `/CSessionRouter:improve`.

## Proposal file

Path: `DATA/improvements/pending/<YYYYMMDD>-<slug>.md`.

~~~markdown
---
id: <YYYYMMDD>-<slug>
date: <YYYY-MM-DD>
file: <the plugin file to change, as a path inside the plugin's repository (the same path as in the installed plugin)>
---

## Problem
<what goes wrong, in a sentence or two>

## Evidence
<the jobs and dates where it showed up>

## Change
Before:
```
<the exact current text>
```
After:
```
<the exact new text>
```

## Risk
<what could get worse>
~~~

## Protected rules

These can never be proposed away:

- approval before heavy work;
- asking when something is unconfirmed;
- the every-task checks;
- the notices;
- approval for changes to the plugin's own files;
- the observations-only rule;
- no `max` effort unless the user asks;
- the router does not build.

These sections define or guard the protected rules:

- `skills/route/SKILL.md`: "Your role";
- `reference/planning.md`: "Heavy", "Approval" and "Commits";
- `reference/checks.md`: "Every code task";
- `reference/routing.md`: "Effort" and "Moving up and down while the job runs";
- `reference/memory.md`: "Observations only" and "Notices";
- anything in `reference/improve.md` or `skills/improve/SKILL.md`;
- the two agent shells, `agents/worker.md` and `agents/reader.md`.

A waiting proposal is not offered when it would remove or weaken a protected rule, or when its `file` and Before text fall in any of these sections. Tell the user which rule or section it touches, and move the file to `rejected/` with a note naming it.

## Where things are

- Installed plugin: two levels above the improve skill's base directory (`<base directory of this skill>/../..`). The plugin is installed from GitHub (`claude plugin marketplace add https://github.com/HHong214/CSessionRouter.git`). Its files are read from there and never changed: an update of the installed copy would overwrite the change.
- Clone: the plugin's files are changed only in a clone of its repository. Its path is kept in `DATA/config.md`, as a line `clone: <path>`. If `config.md` or the line is missing, or the folder is not a git repository whose `.claude-plugin/plugin.json` names this plugin (`CSessionRouter`), ask the user for the path with AskUserQuestion (in your reply if that tool is not available) and save it in `DATA/config.md`. Suggest `Documents\GitHub\CSessionRouter` under the user's home. If they have no clone yet, tell them to make one with `git clone https://github.com/HHong214/CSessionRouter.git`, and stop. "The plugin's files", below, are the files in the clone.
- Version: `version` in `.claude-plugin/plugin.json` in the clone.
- Changelogs: `CHANGELOG.md` in the clone, and `DATA/CHANGELOG.md`.
- Backups: `DATA/backups/<version>/`, named for the version the change produced, holding each file at the same path it has inside the clone. Undone backups move to `DATA/backups/undone/<version>/`.

Run git commands in the clone with `git -C <clone>`. Memory lives in DATA, where a permission rule can allow it, and the plugin's own instructions stay behind an approval: Claude Code may also ask before each write in the clone. That is intended.

## Lost changes check at the start

When `improve` starts, check for each proposal in `applied/` that its After text is present in its file in the clone. Name those that are missing in one line: the clone was reset or checked out at another version. Apply nothing again without the user's answer.

Then check each proposal in `pending/` the other way round: if its After text is already in its file in the clone and the clone has a commit with the message `Improve <id>` (`git -C <clone> log --format=%h --grep="^Improve <id>$"`), the change was committed but could not be filed (step 7 of applying). Tell the user in one line, with the commit's short hash, and then file it: add its line from the clone's `CHANGELOG.md` (the one that names its `id`) to `DATA/CHANGELOG.md` and move the proposal to `applied/`. Never apply it again. If the clone has no such commit or line, tell the user and leave the proposal in `pending/`.

## Applying an approved proposal

In this order:

1. Find the clone (Where things are). Check that the file named in `file` is inside it and holds the Before text exactly once, and that the file, `.claude-plugin/plugin.json` and `CHANGELOG.md` have no uncommitted changes in the clone (`git -C <clone> status --short`). If not, do not apply it: tell the user the proposal no longer matches the file, or which of the three files has changes of their own, and leave it in `pending/`.
2. Back the file up to `DATA/backups/<new version>/<its path>`, named for the version this change will produce (the current version with its patch number raised, for example 1.1.1 when the plugin is at 1.1.0).
3. Replace the Before text with the After text in the clone's file.
4. Raise the patch number of `version` in the clone's `.claude-plugin/plugin.json` to the new version.
5. Only when both of those writes succeeded: add a line to the clone's `CHANGELOG.md`, in the form the existing entries use (the new version, the date, what changed and the proposal `id`).
6. Commit in the clone, with only those three files and a one-line message that names the proposal's `id`: `git -C <clone> commit -m "Improve <id>" -- <file> .claude-plugin/plugin.json CHANGELOG.md`. One commit per proposal.
7. Only when the commit succeeded: add the same line to `DATA/CHANGELOG.md` and move the proposal to `DATA/improvements/applied/`. If either of those writes is refused or declined, the commit stays and the proposal is never applied again: tell the user the change is committed, with the commit's short hash (`git -C <clone> rev-parse --short HEAD`), but could not be filed, and show the changelog line and the move so they can allow them or do them by hand. The proposal stays in `pending/` until it is filed; the lost changes check recognises it at the start of the next run and files it.
8. Ask the user whether to push, with AskUserQuestion (in your reply if that tool is not available), once, when the run's proposals are applied: one question covers every commit made in the run, and it is the only push question of the run (the skill's report asks it here, not a second time). In the question, tell the user that a push sends every unpushed commit on the clone's current branch, not only the router's (list them with `git -C <clone> log --oneline @{upstream}..`; if the branch has no upstream, say so), and that the changelog line and the commit message of each commit made in the run become public with it, and show those lines so they can read them first. Never push without that answer. On yes, push the clone's current branch with `git -C <clone> push`; if the push fails, say why and leave the commits in the clone. After a push, tell the user the change takes effect after `/plugin marketplace update csessionrouter` and `/reload-plugins`. Without a push, tell them the change is committed in the clone only and the installed plugin stays as it is until it is pushed and updated.

Each approved proposal is applied on its own, so each gets its own version, its own backup and its own commit.

**A refused or declined write.** If Claude Code refuses a write to a plugin file in the clone, or a commit, or the user declines it: restore from the backup anything already changed (the file from its backup; `plugin.json` and `CHANGELOG.md`, which were clean, with `git -C <clone> restore -- .claude-plugin/plugin.json CHANGELOG.md`), leave the proposal in `pending/`, write no changelog line in DATA, and tell the user what was refused, showing the exact change so they can allow it or apply it by hand. Undo follows the same rule. A refusal after the commit succeeded is different: nothing is restored, because the change is committed; step 7 says what happens.

## Rejecting and deferring

- Reject: move the proposal to `DATA/improvements/rejected/`, so the same change is not proposed again.
- Later: leave it in `pending/`.

## Undo

`/CSessionRouter:improve undo`:

1. Find the clone (Where things are). Take the backup folder in `DATA/backups/` with the highest version, not counting `undone/`. If there is none, say there is nothing to undo. If the files it holds, or `.claude-plugin/plugin.json` or `CHANGELOG.md`, have uncommitted changes in the clone, say so and stop. Then, for each file the backup holds, check that it has no commit in the clone since the commit that applied the change (the commit with the message `Improve <id>`, the id being on that version's line in the clone's `CHANGELOG.md`): list them with `git -C <clone> log --oneline <that commit>..HEAD -- <file>`. The only commits allowed in that list are this flow's own later ones: the `Improve <id>` commit of a later version that is now in `DATA/backups/undone/`, and its `Undo <version>` commit. If any other commit is listed, someone has edited the file since: refuse, say which commit (its short hash and message), and leave everything as it is. Do the same if the applying commit cannot be found.
2. Show the user which files it restores and for which version, and ask with AskUserQuestion before changing anything, since approval for changes to the plugin's own files is a protected rule.
3. On approval, first copy the clone's current versions of those files to `DATA/backups/pre-undo/`, replacing what is there. Then copy the backed-up files over the clone's current ones.
4. Raise the patch number of `version` in the clone's `.claude-plugin/plugin.json`.
5. Only when both of those writes succeeded: add a line to the clone's `CHANGELOG.md` saying which files were restored from which backup, and commit in the clone, with those files, `plugin.json` and `CHANGELOG.md`, a one-line message naming the version undone: `git -C <clone> commit -m "Undo <version>" -- <files>`. The undo is a new commit that restores the files; nothing in the clone's history is rewritten.
6. Only when the commit succeeded: add the same line to `DATA/CHANGELOG.md`; move the backup folder to `DATA/backups/undone/<version>/`, so a second undo steps back one change further; and move the proposal whose id is on that version's changelog line from `applied/` to `rejected/`, with a line `undone <date>`, so it is not proposed again.
7. Tell the user what was restored, then ask whether to push, as in step 8 of applying a proposal, with the same warning and the same lines shown. Never push without that answer. After a push, tell them the change takes effect after `/plugin marketplace update csessionrouter` and `/reload-plugins`.

A refused or declined write during undo: put the files back from `DATA/backups/pre-undo/` (and `plugin.json` and `CHANGELOG.md` with `git -C <clone> restore`), write no changelog line in DATA, leave the backup and the proposal where they are, and tell the user what was refused.
