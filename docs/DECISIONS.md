# Decision Log

This file is an **immutable, append-only log of locked architectural decisions** for the KB module. It is the source of truth for "what did we decide and why" — independent of `PRD.md`, which describes the current product spec and can be edited freely.

## Rules

1. **Append-only.** Never edit or delete an existing entry. If a decision is reversed or refined, add a new entry and set the older entry's `STATUS:` to `superseded by D-YYYY-MM-DD-NN`.
2. **One decision per entry.** Each entry has its own ID, date, decision statement, rationale, and (when applicable) `SUPERSEDES:` link to a doc section or prior decision.
3. **Status values:**
   - `locked` — decided and in effect
   - `pending Vasyl confirmation` — agreed by the team but awaiting product-owner sign-off (typically for reversals of prior written specs)
   - `superseded by D-…` — replaced by a later entry
4. **Cross-reference, don't restate.** If a decision changes a section of `PRD.md`, use `SUPERSEDES: PRD.md#<section>` rather than copying the old text. Keep the entry focused on the decision itself.
5. **Source attribution.** Every entry must name where the decision was made (meeting notes file, PR, async thread).

---

## D-2026-05-12-01 — Folder visibility: private/public with explicit per-unit sharing

**Date:** 2026-05-12
**Source:** [MEETING_NOTES_2026-05-12_kb_discovery_review.md](meetings/MEETING_NOTES_2026-05-12_kb_discovery_review.md) §2 / Locked decisions
**STATUS:** pending Vasyl confirmation
**SUPERSEDES:** PRD.md §6.1 (Visibility property), PRD.md §6.2 (Visibility inheritance rules), PRD.md §15.1 (`kb_folder.visibility` enum)

**Decision.** A KB folder has a two-state visibility — `private` or `public` — plus an explicit list `shared_with_unit_ids` of business-unit IDs the folder is shared into.

- A **private** folder is visible inside its owning unit. Its owner may share it **downward only** to chosen descendant sub-units (`shared_with_unit_ids ⊆ descendants(owner_unit)`).
- A **public** folder may be shared to any list of units in the space — parents, siblings, descendants, or arbitrary unrelated units (`shared_with_unit_ids ⊆ all_units`). Upward sharing is the explicit new capability the previous enum could not express.
- Articles do **not** carry their own visibility in MVP. They inherit from the folder they live in (see D-2026-05-12-03).

**Rationale.** Yuliana grounded the framing in operational reality: every unit has two distinct knowledge surfaces — an internal/working one and a public face shared with selected other units. The three-tier enum (`unit_and_subunits` / `all_units` / `current_unit_only`) cannot express the most common request ("share my onboarding to HRM and its descendants only, but not to Vechur") and cannot model upward sharing at all (HR team sharing its public docs *up* into a company-wide section). Explicit unit lists capture both axes without a flag-explosion.

**Why pending confirmation.** This is a direct reversal of a written, approved PRD section. The meeting reached consensus but the run brief reserves PRD edits for human confirmation.

---

## D-2026-05-12-02 — Folder depth: maximum 3 levels

**Date:** 2026-05-12
**Source:** [MEETING_NOTES_2026-05-12_kb_discovery_review.md](meetings/MEETING_NOTES_2026-05-12_kb_discovery_review.md) §2 / Locked decisions
**STATUS:** locked
**SUPERSEDES:** PRD.md §3.3 (Folder nesting: 2 levels maximum)

**Decision.** Folders may nest up to three levels deep: folder → sub-folder → sub-sub-folder. Articles may live at any folder level (still no orphan articles at KB root — see Q1 in meeting notes for the open question on that).

**Rationale.** Vasyl confirmed the prior "2 levels max" had no hard requirement behind it ("просто так"). Three levels cover the real onboarding/handbook patterns surveyed in the prototype's mock data while still avoiding the Notion-style nesting trap.

---

## D-2026-05-12-03 — Article-level visibility deferred; sharing is folder-level only in MVP

**Date:** 2026-05-12
**Source:** [MEETING_NOTES_2026-05-12_kb_discovery_review.md](meetings/MEETING_NOTES_2026-05-12_kb_discovery_review.md) §2 / Locked decisions
**STATUS:** locked
**SUPERSEDES:** PRD.md §6.2 (Visibility inheritance rules — per-article overrides), PRD.md §10.7 (Change article visibility), PRD.md §15.2 (`kb_article.visibility` field)

**Decision.** Articles do not have their own visibility field in MVP. Visibility is a folder concept; articles are visible wherever their folder is visible. Per-article permission/visibility moves to post-MVP and re-enters the roadmap only if user-interview signal demands it.

**Rationale.** Per-article visibility creates the "Confluence chaos" the team explicitly wants to avoid; folder-level sharing covers ~95% of stated user needs. Yuliana confirmed she values predictability over fine-grained control at this stage. The model leaves room to add per-article visibility later as an opt-in override — without breaking the folder rule.

---

## D-2026-05-12-04 — KB stays scoped to the Business Unit (no space-level KB)

**Date:** 2026-05-12
**Source:** [MEETING_NOTES_2026-05-12_kb_discovery_review.md](meetings/MEETING_NOTES_2026-05-12_kb_discovery_review.md) §2 / Locked decisions
**STATUS:** locked

**Decision.** KB folders are owned by Business Units, not by the Space. A "space-level KB" variant (folders existing independent of a unit, with per-folder unit-visibility) was considered and rejected. Cross-unit sharing happens via the public-folder mechanism in D-2026-05-12-01, not by relocating KB above the unit.

**Rationale.** Alex's variant moved folders to the space level. Yuliana rejected it on scalability and admin-ergonomics grounds: an admin of 20 companies with 20 onboardings each cannot locate or maintain content without unit-level visibility framing. The unit is already the primary organizational and navigational primitive in the platform; KB inherits that.

A separate open question (Q2 in meeting notes) — whether to add a global sidebar entry that surfaces all KB content a user can access — is **not** the same as space-level KB ownership. It is a discovery surface, not a data-model change.

---

## D-2026-05-12-05 — Compliance/acknowledgement features deferred to post-MVP

**Date:** 2026-05-12
**Source:** [MEETING_NOTES_2026-05-12_kb_discovery_review.md](meetings/MEETING_NOTES_2026-05-12_kb_discovery_review.md) §2 / Locked decisions
**STATUS:** locked

**Decision.** The following are explicitly **out of MVP**:

- `require_acknowledgement` flag and read-receipt tracking
- `next_review_date` / freshness reminders
- Compliance dashboard (per-employee acknowledgement status, overdue reviews)
- Onboarding-plan integration (auto-deliver tagged articles during onboarding)
- File import from prior systems
- Version history UI (the schema may evolve to record versions; no UI in MVP)
- Print to PDF / export
- Transfer ownership UI (the field stays; no dedicated flow)
- Analytics

The MVP data model **may** reserve nullable schema fields for `require_acknowledgement` and `next_review_date` to keep the model AI-ready (Q7 in meeting notes is whether to do so). No UI in MVP either way.

**Rationale.** Yuliana made the case that acknowledgement is workflow, not KB — it belongs in the onboarding-plan and compliance modules, with KB as the content source. Bundling it into KB MVP would expand scope beyond the team's testing capacity for the upcoming interview round.

---

## D-2026-05-12-06 — Content-types / categories classification deferred

**Date:** 2026-05-12
**Source:** [MEETING_NOTES_2026-05-12_kb_discovery_review.md](meetings/MEETING_NOTES_2026-05-12_kb_discovery_review.md) §2 / Locked decisions
**STATUS:** locked

**Decision.** Article-level content types (policy / playbook / checklist / FAQ / etc.) and global categories above folders are **not** in MVP. If they return, the simplest available shape is a flat optional tag on the article, not a hierarchy.

**Rationale.** Alex's concept introduced content types as a classification layer above folders so the system could "understand" article meaning (for analytics, AI assistants, and acknowledgement targeting). The team agreed the concept has merit but the use cases driving it (compliance delivery, AI chat) are themselves out of MVP — adding the classification layer now is premature.

---

## D-2026-05-12-07 — Editor / KB engine: open-source evaluation before commitment

**Date:** 2026-05-12
**Source:** [MEETING_NOTES_2026-05-12_kb_discovery_review.md](meetings/MEETING_NOTES_2026-05-12_kb_discovery_review.md) §2 / Locked decisions
**STATUS:** locked
**SUPERSEDES (softens):** PRD.md §11.1 ("Recommended library for prototype: TipTap, Lexical, or similar"), CLAUDE.md Tech stack

**Decision.** The first MVP delivery story is a research spike on open-source KB engines and editors: wiki.js, BookStack, Outline (engine candidates), TipTap, Lexical (editor candidates). The prototype continues to use whatever it ships with today, but the production choice is deferred until research lands. Erik owns the spike.

**Rationale.** Erik flagged that an open-source KB engine could provide file handling, versioning, and search "for free," reducing scope. Locking in TipTap or Lexical before that evaluation risks rework. Cost of the spike (days) is far less than the cost of unwinding a wrong choice.

---

## D-2026-05-12-08 — Carry at most two concepts into the user-interview round

**Date:** 2026-05-12
**Source:** [MEETING_NOTES_2026-05-12_kb_discovery_review.md](meetings/MEETING_NOTES_2026-05-12_kb_discovery_review.md) §2 / Locked decisions
**STATUS:** locked

**Decision.** The user-interview round will test at most two concept variants. Four surfaced in the meeting (space-categories, unit-folders, space-level KB, Alex's variant); Vasyl and Zhenya consolidate to one (preferred) or two before interviews.

**Rationale.** Bringing four variants dilutes interview signal and burns participant time. Two leaves room for an A/B comparison where it matters most — the visibility/sharing UX — without overloading respondents.

---

*End of log. Append new entries below this line with the next available `D-YYYY-MM-DD-NN` ID.*
