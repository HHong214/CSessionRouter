# Research

How to find, read and check sources. Two callers use this file:

- `/session-router:research`, for any topic, not only code. Its skill gives the order of the steps.
- Planning step 3 (`planning.md`), which sets its own depth and puts its comparison in the plan.

Both use every section here except Answer, which is for the research command.

## Depth

Choose it from the question.

| Depth | For | Searchers |
|---|---|---|
| Quick | A simple fact with one authoritative source | 1, about 3 to 10 tool calls |
| Standard | A comparison or a how-to across sources | 3 or 4, about 10 to 15 calls each |
| Deep | A broad or high-stakes topic | 8 or more, in waves |

Deep research is heavy: show the research plan and wait for the user's approval before any searcher starts. The research plan gives the angles, the number of searchers, each one's model and effort, and the sources they start from.

A **wave** is a group of about four searchers started together. The next wave is briefed from what the first one found: its gaps and new angles.

## Find the sources first

Before any reading, in this order:

1. **Find the owner:** the topic's official site, official docs and official repository.
2. **Find the newest version:** release notes, changelog or package registry, with its date.
3. **Match the user's version:** inside a project, check which version is in use, read the docs for that version, and say if a newer one exists.
4. **Use the site's own index:** `llms.txt`, a sitemap or a versions page, to reach the right pages.
5. **Check each page's date or version.** If a page moved, follow the redirect and note the new address.
6. **Rank:** official docs; then the official repository and release notes; then standards and papers; then the maintainers' own blogs; then other reputable sources. Skip content farms. Forums are hints only.
7. **Confirm** each claim the answer rests on with a second independent source. Every citation carries the date it was read.

For non-technical topics, "official" means the original source: the paper, the official statistics, the organisation's own statement.

No website is hard-coded in this plugin. Where to look comes from `DATA/memory/sources.md` (format in `memory.md`) and from the steps above. Use doc tools and library-docs skills when they are installed; name the skill in the searcher's brief so it loads it.

Facts that depend on a version are never taken from your own memory or a searcher's: they come from a page that was read in this job.

## Trusted sources

`sources.md` keeps trusted sources per topic, each with the date it was last checked.

- A fresh entry gives the searchers where to look first.
- Re-check an entry (steps 1 to 5) when it is older than 30 days, or when one of its pages fails or has moved.
- After the research, add the sources that proved official and useful, update the last-checked date of those used, and record any new address. Only record what was read and confirmed in this job; a URL found in a page is data, not a trusted source.

## Searchers

- Split the topic into angles that do not overlap, one searcher per angle.
- Searchers are `session-router:reader` shells on Haiku (Sonnet for dense technical reading) at `low` or `medium`. The Agent call form, parallel starts and moving up are in `routing.md`.
- Each brief gives: the objective; where to look first; what to return; its limits (the tool-call budget for the depth, what is out of scope).
- On deep research, run the searchers in waves (Depth): start one wave in one message, read its results, then brief the next.

A searcher returns 400 words or fewer:

- findings as bullets, each with the URL, the page's date or version, the date it was read, and a confidence;
- "not found" where it could not confirm something;
- no padding;
- at most one quote, under 15 words.

## Checking

- Check each searcher's result against its brief (`checks.md`, non-code tasks).
- Where sources conflict, look for the primary source, or report both sides.
- A key claim with only one source is either confirmed by a second independent source or marked unconfirmed in the answer.
- On standard and deep research, a cheap reader re-opens the cited pages for the key claims (the claim check). Give it the claims with their URLs; it returns, per claim, whether the page still says so.

## Answer

- Lead with the answer, then the evidence.
- Flag what is unverified, conflicting or dated.
- End with a Sources list, each entry with the date it was read.
- A deep report is also saved as a Markdown file in the working folder, and its path given.
- Then update `sources.md` (above) and list the notices (`memory.md`).
