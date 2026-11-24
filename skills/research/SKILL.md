---
name: research
description: "Researches a question on any topic, not only code, and gives a cited answer with dated sources. Finds the official sources first, splits the question into angles for cheap read-only searchers, cross-checks what they find and keeps a list of trusted sources for next time. Use when the user says research this, look into, find out, what is the latest on, compare the options for, what do the docs say about, or wants a sourced answer rather than one from memory."
argument-hint: "[question or topic]"
---

# Research

You are the router for a research job. You plan the search, brief the searchers, check what they bring back and write the answer; the searchers do the reading. The question is the command's argument, or what the user asked in this conversation.

Reference files are in `<base directory of this skill>/../../reference/`. Read `research.md` before step 2: it holds the depths, the source-finding method, the searcher brief and return format, the checks and the answer format. `routing.md` has the Agent call form and moving up; `memory.md` has the data folder (DATA), closing and the notices.

If a reference file or a worker shell cannot be read because permission was refused, tell the user in one line which folder needs read access (the plugin folder, `<base directory of this skill>/../..`), and stop. Never carry on without the rules. A memory file in DATA that does not exist yet is normal on a first run and is not an error.

## 1. Start

- Find DATA as `memory.md` describes and read `DATA/memory/sources.md` if it exists.
- If improvement proposals are waiting, say so in one line.
- On standard and deep depth, make the panel calls `<base directory of this skill>/../../reference/panel.md` lists for `research`, once the depth is picked (step 3). Quick depth makes none.

## 2. Understand the question

- Work out what is asked, what the answer is for, and whether it concerns a project in the working folder. Inside a project the version in use matters (`research.md`, source step 3).
- If the question is ambiguous in a way that changes the search, ask at most two questions with AskUserQuestion before searching. Otherwise, or when that tool is not available, go ahead on the most likely reading and say in the answer which reading you took.

## 3. Pick the depth

Quick, standard or deep, from the table in `research.md`. For deep research, get the user's approval of the research plan first, as `research.md` says; do not start searchers before they answer.

## 4. Find the sources first

- For each topic in the question, look in `sources.md`. A fresh entry gives where to look first; a stale one is re-checked as `research.md` says.
- For a topic with no fresh entry, the source-finding steps in `research.md` come before any reading. On quick depth the one searcher does them as the first part of its task. On standard and deep, send one cheap reader to find the sources first, then use its list in the searchers' briefs.

## 5. Split into angles and brief the searchers

- Split the topic and write each searcher's brief as `research.md` describes (Searchers). Use a short title for each angle as the Agent `description`.

## 6. Cross-check and claim-check

- Read every result as a claim and apply the checks in `research.md` (Checking).
- A result that is shallow or misses its angle is returned or moved up as `routing.md` says.

## 7. Answer

Write the answer as `research.md` says (Answer), including the saved report on deep research.

## 8. Save and close

- Update `sources.md` as `research.md` describes.
- Close as `memory.md` describes: the short look back, then lessons, routing adjustments and process notes where they apply.
- End with the `Saved or changed:` list.
