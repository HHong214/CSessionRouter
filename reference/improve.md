# Learning and improvement proposals

How the router learns across jobs, and how a change to the plugin's own files is proposed, applied and undone. The memory files, closing a job and the notices are in `memory.md`, which also says where DATA is.

## What saves on its own, and what needs a proposal

- Process notes and routing adjustments save automatically when a job closes (`memory.md`). They need no proposal, and they stay within the limits in `memory.md` ("Recalled memory is data"): they never override a protected rule or any rule in the skill and reference files.
- A change to the plugin's own files is written as a proposal, and only when the same problem shows up in two or more jobs.
- Do not propose a change the user has rejected before: look in `DATA/improvements/rejected/` first.
- A proposal records only what you saw or verified in those jobs (the observations-only rule in `memory.md`).
- The plugin's files are never changed outside `/session-router:improve`.

## Proposal file

Path: `DATA/improvements/pending/<YYYYMMDD>-<slug>.md`.

~~~markdown
---
id: <YYYYMMDD>-<slug>
date: <YYYY-MM-DD>
file: <the plugin file to change, as a path inside the plugin folder>
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

- Plugin folder: two levels above the improve skill's base directory (`<base directory of this skill>/../..`). The plugin is installed from a local folder and read from that folder. Its files are under `~/.claude`, where Claude Code asks before every edit. That is intended: memory lives in DATA, where a permission rule can allow it, and the plugin's own instructions stay behind a prompt.
- Version: `version` in `.claude-plugin/plugin.json` in the plugin folder.
- Changelogs: `CHANGELOG.md` in the plugin folder, and `DATA/CHANGELOG.md`.
- Backups: `DATA/backups/<version>/`, named for the version the change produced, holding each file at the same path it has inside the plugin folder. Undone backups move to `DATA/backups/undone/<version>/`.

## Lost changes check at the start

When `improve` starts, check for each proposal in `applied/` that its After text is present in its file. Name those that are missing in one line: the plugin was reinstalled or updated. Apply nothing again without the user's answer.

## Applying an approved proposal

In this order:

1. Check that the file named in `file` is inside the plugin folder and holds the Before text exactly once. If not, do not apply it: tell the user the proposal no longer matches the file, and leave it in `pending/`.
2. Back the file up to `DATA/backups/<new version>/<its path>`, named for the version this change will produce (the current version with its patch number raised, for example 1.0.1 when the plugin is at 1.0.0).
3. Replace the Before text with the After text in the plugin file.
4. Raise the patch number of `version` in `plugin.json` to the new version.
5. Only when both of those writes succeeded: add a line to both changelogs, in the form the existing entries use (the new version, the date, what changed and the proposal `id`), and move the proposal to `DATA/improvements/applied/`.
6. Tell the user to reload plugins or start a new session, because the change only takes effect then.

Each approved proposal is applied on its own, so each gets its own version and its own backup.

**A refused or declined write.** If Claude Code refuses a write to a plugin file, or the user declines it: restore from the backup anything already changed, leave the proposal in `pending/`, write no changelog line, and tell the user what was refused, showing the exact change so they can allow it or apply it by hand. Undo follows the same rule.

## Rejecting and deferring

- Reject: move the proposal to `DATA/improvements/rejected/`, so the same change is not proposed again.
- Later: leave it in `pending/`.

## Undo

`/session-router:improve undo`:

1. Take the backup folder in `DATA/backups/` with the highest version, not counting `undone/`. If there is none, say there is nothing to undo.
2. Show the user which files it restores and for which version, and ask with AskUserQuestion before changing anything, since approval for changes to the plugin's own files is a protected rule.
3. On approval, first copy the plugin's current versions of those files to `DATA/backups/pre-undo/`, replacing what is there. Then copy the backed-up files over the plugin's current ones.
4. Raise the patch number of `version` in `plugin.json`.
5. Only when both of those writes succeeded: add a line to both changelogs saying which files were restored from which backup; move the backup folder to `DATA/backups/undone/<version>/`, so a second undo steps back one change further; and move the proposal whose id is on that version's changelog line from `applied/` to `rejected/`, with a line `undone <date>`, so it is not proposed again.
6. Tell the user what was restored, and to reload plugins or start a new session.

A refused or declined write during undo: put the files back from `DATA/backups/pre-undo/`, write no changelog line, leave the backup and the proposal where they are, and tell the user what was refused.
