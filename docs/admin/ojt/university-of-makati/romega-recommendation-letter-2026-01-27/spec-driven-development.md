# Romega - University of Makati Spec-Driven Development Plan

> Source-backed implementation plan generated from all approved project reference files in `ref/original/` and PDF extracts in `ref/extracted/`.

## Goal
Preserve the recommendation-letter context as an administrative reference, not a product or engineering roadmap.

## Source Inputs
| Source | Type | Title | Words/Pages | SHA-256 |
| --- | --- | --- | --- | --- |
| PDFs/Recommendation Letters/University of Makati Recommendation Letter - Romega Solutions - 2026-01-27.pdf | administrative-reference | CLP-QF-06 Rev. 5 UNIVERSITY OF MAKATI | 352 words, 1 pages | ad86a7987ccc |

## Non-Negotiable Rules
- Do not start implementation from this spec without checking `source-coverage.md` and `conflicts-and-gaps.md`.
- Every implemented recommendation must have evidence: command output, browser check, live URL check, screenshot, test, log, or repo diff.
- Do not treat source recommendations as complete until they are mapped to acceptance criteria in the target repo.
- Preserve the current source archive; source docs are references, not files to mutate during product implementation.

## Workstreams
### 1. Product and UX
- Use `product-context.md` to lock the user, problem, positioning, and workflow.
- Implement only the highest-value loop first: Preserve the recommendation-letter context as an administrative reference, not a product or engineering roadmap.
- Avoid broad additions that conflict with the source risks.

### 2. Execution Roadmap
- Follow `execution-roadmap.md` phase order.
- Each phase must produce verifiable evidence before the next phase expands scope.
- Blocked external proof must be recorded as blocked, not skipped.

### 3. SEO and Performance
- No SEO/performance source was available for this project in the approved archive; do not invent one.

### 4. Documentation and Evidence
- Keep an implementation log in the target repo or project workspace when execution begins.
- Update public docs/runbooks only when behavior, commands, env requirements, public workflow, or deployment flow changes.

## Acceptance Criteria
- All relevant source suggestions in `all-suggestions.md` have one of these statuses in the implementation tracker: implemented, intentionally deferred, blocked, not applicable.
- Product direction and scope conflicts in `conflicts-and-gaps.md` are resolved before code execution.
- Any SEO/performance claims are backed by current measurement, not source assumptions.
- Any external proof requirement has concrete evidence or a clearly named blocker.

## Suggested First Pass
1. Keep the document as a reference artifact only.
2. Record date, parties, purpose, and likely workflow context.
3. Do not create software/product execution tasks from this source.
