# KB Discovery Review — Meeting Notes

**Date:** 2026-05-12
**Duration:** ~1.5 h
**Participants:** Vasyl (PM/designer, running session), Yuliana (HR stakeholder), Erik (engineering), Zhenya (built parallel prototype), Alex (built parallel prototype, advocates content types), Yan (observer)
**Source transcript:** `meet-recording/transcript_2026-05-12_kb_discovery_review.md`

> Speaker attribution in the source transcript is partial (Whisper, no diarization). Where context unambiguously names a person, the name is used. Otherwise statements are attributed to "the team."

---

## Pre-existing doc/implementation drift

These are inconsistencies between current docs (`PRD.md`, `CLAUDE.md`, `MOCK_DATA.md`, `COMPONENT_MAP.md`) and what `/src` actually ships, surfaced during Phase 1. They are noted here because several locked decisions below interact with them and resolution should be sequenced jointly.

| # | Area | Doc says | Code/mock state | Notes |
|---|---|---|---|---|
| D1 | Visibility enum | PRD §6.1 / §15.1 / §15.2 defines **three** levels: `unit_and_subunits`, `all_units`, `current_unit_only`. `CLAUDE.md` Goal §5 also lists three. | [src/types/index.ts:8](../../src/types/index.ts#L8) declares only **two**: `'unit_and_subunits' \| 'current_unit_only'`. No `all_units` token anywhere. | Drift predates this meeting. The meeting decision (D-2026-05-12-01) replaces the whole enum, so the drift is moot — but anyone reading PRD/CLAUDE.md today gets a contradictory signal. |
| D2 | Mock data — `all_units` example | `docs/MOCK_DATA.md` calls for a "Company policies" / "Benefits & perks" / "General onboarding" set with `visibility: all_units` and an "Internal — HR only" folder with `visibility: current_unit_only` to demonstrate non-sharing. | [src/data/mock-data.ts:178–231](../../src/data/mock-data.ts#L178-L231) marks every Develux-level folder as `unit_and_subunits`. The "Internal — HR only" folder is absent. | The prototype's "shared with you" section works only because cascade-down from parent is allowed. There is no live example of `all_units` or `current_unit_only` at the parent level. |
| D3 | Folder depth | PRD §3.3 caps depth at **2** (folder → sub-folder). `CLAUDE.md` and `COMPONENT_MAP.md` echo this. | [src/data/mock-data.ts:792–795](../../src/data/mock-data.ts#L792-L795) `getFolderDepth` and [getEligibleParentFolders](../../src/data/mock-data.ts#L858) enforce depth ≤ 2. | Meeting decision (D-2026-05-12-02) raises this to 3 — supersedes both PRD and code constraint. |
| D4 | Component inventory | `CLAUDE.md` file-structure block and `docs/COMPONENT_MAP.md` list `ArchiveDialog.tsx` only. | [src/components/kb/](../../src/components/kb/) ships `ArchiveDialog.tsx`, `ArchiveFolderDialog.tsx`, `ChangeVisibilityDialog.tsx`, `AllArticlesView.tsx` — three components are undocumented. | Docs lag the prototype. |
| D5 | Toolbar — scope switcher | `docs/TERMINAL_STATE_SOLUTION.md` (approved 2026-04-06) specifies an "Active \| All" bordered chip as the leftmost toolbar element on KB. | [src/components/kb/KBRoot.tsx](../../src/components/kb/KBRoot.tsx) (per `COMPONENT_MAP.md` and CLAUDE.md description) ships toolbar with search + filter + sort + sub-units + view-mode + create — **no scope chip**. | An approved design exists but is not implemented. Not raised in the meeting. Flagged for visibility. |
| D6 | What `TERMINAL_STATE_SOLUTION.md` is | Filename is opaque. | It is the design spec for the cross-platform **"Active \| All" view-scope switcher** that replaces per-table "show archived" toggles. Applies to Employees, Vacancies, Jobs, KB, Offers, Pipelines. Approved P3, dated 2026-04-06. | Documenting here per Phase-1 brief; meeting did not touch it. |

---

## Phase 2 — Transcript extraction

### 1. Headline

**The visibility model is being rewritten.** The PRD's three-tier enum (`unit_and_subunits` / `all_units` / `current_unit_only`) is replaced by a two-state **private / public** folder model with explicit per-unit sharing — including the ability to share **upward** to parent units, not only downward. Yuliana drove the discussion toward the public/private framing on the grounds that "in every unit there are two stories — an internal one and a public one." Vasyl concretized: private folders can be shared to chosen sub-units only; public folders are shared to an explicit list of units (any in the space, including parents/siblings). Per-article visibility stays out of MVP — sharing is at folder level only. This reverses PRD §6.1's enum and §6.2's "more restrictive than parent" rule for articles.

### 2. Locked decisions

> Each decision is captured here and indexed in `docs/DECISIONS.md`. The headline reversal is marked `STATUS: pending Vasyl confirmation` per the run brief; the rest are `STATUS: locked`.

**D-2026-05-12-01 — Visibility model: private/public folder with explicit unit list (replaces 3-tier enum)**
Rationale: Each unit in practice has two distinct knowledge surfaces — internal/working docs and a public face shared with selected other units. The 3-tier enum doesn't capture the most common real case ("share onboarding to HRM and its descendants only") and forces the awkward "all units" extreme. Public folders need to be shareable **upward** (e.g., HR team shares its public onboarding into the company root), not only downward — the current enum can't express that.
Why this scales: Maps to Yuliana's mental model from real HR operations; supports brand/language differences per unit; lets a unit own its KB while still surfacing public content elsewhere.

**D-2026-05-12-02 — Folder depth: 3 levels (was 2 in PRD §3.3)**
Rationale: Vasyl stated the cap "просто так" — no hard requirement at 2; 3 covers the real onboarding/handbook patterns surveyed in the prototype's mock data without inviting Notion-style infinite nesting.
Why now-only: The cap is an arbitrary safety rail; raising by one level has no architectural cost.

**D-2026-05-12-03 — Article-level visibility deferred; sharing is folder-level only in MVP**
Rationale: Per-article permission/visibility creates the "Confluence chaos" the team explicitly wants to avoid. Folder-level sharing covers 95% of stated needs. Yuliana confirmed she values this over fine-grained per-article control.
Why now-only: Keeps the data model and UI simple; per-article visibility can be layered on later without breaking the folder rule.

**D-2026-05-12-04 — KB stays unit-scoped (no space-level KB)**
Rationale: Alex's variant moved folders to the space level. Yuliana rejected on scalability/manageability grounds: an admin of 20 companies with 20 onboardings each would not be able to locate or maintain content without unit-level visibility.
Why now-only: The unit boundary is already the primary organizational and navigational primitive in the platform.

**D-2026-05-12-05 — Compliance/acknowledgement features (require_acknowledgement, next_review_date, compliance dashboard, content-types as policy/playbook/checklist, onboarding-plan integration) are out of MVP**
Rationale: Yuliana argued acknowledgement belongs in workflow/onboarding-plan modules, not in KB. The team agreed not to ship UI for it in the MVP, but to keep the schema "AI-ready" so the fields can be populated later.
Why this scales: Separates KB (storage + structure) from compliance/workflow (process), avoiding a monolithic feature.

**D-2026-05-12-06 — Content-types / categories deferred**
Rationale: Alex's concept introduced global content types (policy, playbook, checklist) as a classification layer above folders. Vasyl framed this as an optional metadata field for future analytics. Team consensus: out of MVP; can return as a flat tag if needed.
Why now-only: No MVP user journey requires it; adding it now risks scope sprawl.

**D-2026-05-12-07 — Editor library: open-source evaluation (wiki.js / BookStack / Outline) before committing to TipTap or Lexical**
Rationale: Erik flagged that an open-source KB engine may give us file/version handling for free. Lexical is already installed; TipTap is the PRD-suggested option. First story is an evaluation, not a commitment.
Why now-only: A wrong editor choice is expensive to unwind; cheap to evaluate up front.

**D-2026-05-12-08 — Two concepts max go to user interviews; Vasyl + Zhenya consolidate**
Rationale: Four concept variants surfaced (Vasyl's space-categories, Zhenya's unit-folders, Vasyl's space-level KB, Alex's). Bringing all four to external interviews dilutes signal and burns participant time.
Why now-only: Process decision for the upcoming interview round.

### 3. Conflicts with current docs

| Doc + section | Current claim | Meeting outcome | Required resolution |
|---|---|---|---|
| `PRD.md` §6.1 (Visibility property) | Three-tier enum: `unit_and_subunits` (default) / `all_units` / `current_unit_only`. | Replace with `private` / `public`, with public taking an explicit list of unit IDs (any in the space, including parents/siblings). | Rewrite §6.1 after Vasyl confirms D-2026-05-12-01. New schema needs: `folder.visibility ∈ {private, public}`; `folder.shared_with_unit_ids: string[]` (sub-units only when private, any units when public). |
| `PRD.md` §6.2 (Visibility inheritance rules) | "An article's visibility can be changed to be more restrictive than its folder, but never more permissive." | Articles do not have visibility in MVP — they always inherit folder. | Delete §6.2's article-visibility override rules; replace with "Articles inherit folder visibility; per-article visibility is post-MVP." |
| `PRD.md` §6.3 ("Shared with you" rule) | Folder appears in another unit's "Shared with you" if visibility includes that unit AND it has ≥1 visible published article. | Compatible in shape, but driven by explicit `shared_with_unit_ids` not enum semantics. | Restate using the explicit list. |
| `PRD.md` §3.3 (Folder nesting) | Max 2 levels (folder → sub-folder). | Max 3 levels. | Update copy; raise validation in editor + helpers. |
| `PRD.md` §15.1 (`kb_folder` schema) | `visibility` enum {unit_and_subunits, all_units, current_unit_only}. | Two fields: `visibility ∈ {private, public}` + `shared_with_unit_ids: UUID[]`. | Rewrite schema table. |
| `PRD.md` §15.2 (`kb_article` schema) | Article has its own `visibility` field. | Drop. Article visibility is computed from folder. | Remove `visibility` from kb_article. |
| `PRD.md` §10.7 (Change article visibility) | UX flow for changing article visibility. | Remove from MVP. | Delete section. |
| `PRD.md` §9.6 (Change folder visibility) | Dropdown with three options. | Dropdown with two options (private/public) + multi-select unit picker when public. | Rewrite UX flow. |
| `PRD.md` §14.2 (Article validation) | "Article visibility more permissive than folder" error. | Not applicable. | Remove that row. |
| `PRD.md` §1 (Product overview), §17 (UX) | Mentions cross-unit sharing via three-tier visibility throughout. | Update phrasing to private/public. | Editorial pass. |
| `CLAUDE.md` Goal item 5 | "Visibility model (unit & sub-units, all units, current unit only)" | Replace with "Visibility model (private/public folders with explicit per-unit sharing)". | Edit when PRD is updated. |
| `docs/MOCK_DATA.md` (folders Develux level) | Specifies `visibility: all_units` for several folders and a `current_unit_only` HR-internal folder. | Migrate to new model: public folders with `shared_with_unit_ids = [<every business unit>]` (or a marker); HR-internal becomes private. | Rewrite mock-data spec; will require code follow-up. |
| `src/types/index.ts:8` (already drifts from PRD) | `Visibility = 'unit_and_subunits' \| 'current_unit_only'` (also missing `all_units`). | Replace with `'private' \| 'public'` + add `sharedWithUnitIds: string[]` on `KBFolder`. | Type change cascades to mock data, helpers, dialogs. |
| `src/data/mock-data.ts` visibility logic ([folderVisibleToUnit](../../src/data/mock-data.ts#L666), [articleVisibleToUnit](../../src/data/mock-data.ts#L672), [getSharedRootFolders](../../src/data/mock-data.ts#L681)) | Cascades by descendant-set lookup. | Replace with membership check against `shared_with_unit_ids`. Allow upward sharing. | Rework visibility helpers. |

### 4. Open questions / explicitly deferred

| # | Question | Raised by | What closes it |
|---|---|---|---|
| Q1 | Should articles be allowed at KB root (no folder)? Yuliana suggested loosening the "articles must live in folders" rule (PRD §3.4); Vasyl pushed back ("users want to dump; let them — but folders impose structure"). Not closed. | Yuliana / Vasyl | Decide after the interview round (D-2026-05-12-08). If users in interviews report friction, revisit. |
| Q2 | Should KB get a top-level entry in the global left sidebar (not just the in-unit tab)? Yuliana: "if I were searching for KB, I'd never think to enter a unit first." Vasyl: maybe later; the public/private model could support a global "all KB I can see" view. | Yuliana | Product call after interviews. Tied to D-2026-05-12-01 because the global view depends on the new sharing semantics. |
| Q3 | Folder-level access by role (managers / recruiters)? Asked by Erik/Zhenya as a likely user request. Vasyl: not in MVP. | Erik / Zhenya | Out of MVP; revisit in v2 if interview signal is strong. |
| Q4 | Inheritance blocking (a parent-unit folder that does *not* propagate downward to a specific sub-unit). Vasyl: "easy to add later, not in current design." | Floor (unattributed) | Defer. Re-evaluate in v2. |
| Q5 | Editor: TipTap vs Lexical vs open-source engine (wiki.js, BookStack, Outline). Erik to research. | Erik | Erik's research story (first ticket of MVP delivery epic). |
| Q6 | How to compare two parallel prototypes (Vasyl's vs Zhenya's) using AI. Discussed as an open process question. | Yan / Vasyl | Process experiment to run with Erik. |
| Q7 | Should the prototype's article schema reserve fields for `next_review_date` / `require_acknowledgement` even though UI is post-MVP? | Yuliana / Vasyl | Vasyl to decide during PRD revision. Recommended: reserve schema-only, hide UI. |

### 5. Rejected / out of scope

| Item | Reason |
|---|---|
| **Concept V1 — Space-level shared categories, only articles unit-scoped** (Vasyl's first variant). | Forces global category management ("PeopleForce-like"); kills per-unit naming, branding, language. Rejected by Yuliana. |
| **Concept V3/V4 — KB folders live at the Space level, not in units** (Alex's variant). | No per-unit visibility; impossible to manage at scale (20 companies × 20 onboardings). Yuliana strongly opposed. |
| **Per-article visibility / per-article permissions in MVP.** | Confluence-style chaos; not needed at MVP scale. Move to v2 if interview signal demands. |
| **In-KB read-acknowledgement tracking.** | Yuliana: belongs in workflow/onboarding plan, not KB. Field reserved in schema; no UI in MVP. |
| **Compliance dashboard, freshness/review-date analytics, onboarding-plan integration, file-import, version history UI, transfer-ownership, print-to-PDF.** | Future epics. Mentioned in Vasyl's "full scope" walkthrough; explicitly not MVP. |
| **Embedded AI chat / RAG over KB content.** | Required as "AI-ready" data model only; no UI in MVP. Yuliana acknowledged the "every feature needs AI" pressure but agreed not in MVP. |
| **Carrying four concept variants into user interviews.** | Dilutes interview signal; max two. |

### 6. Action items

| Owner | Item | Target |
|---|---|---|
| Vasyl | Finish design-system documentation for agents (so the agents can produce UI in the platform's visual language). | "1–2 days" — completion gates the next concept-regeneration loop. |
| Vasyl + Zhenya | Consolidate the multi-concept output into **one or max two** concepts with the locked visibility model (D-2026-05-12-01) baked in. Refine UI. | Within ~5–7 days, before external interviews. |
| Erik | Re-tune agent orchestration: add a judge/critic layer (D-2026-05-12-A2 in AI pilot notes); experiment with per-agent base-context MD files (~1000 chars each); harden the engineering-manager agent so it actually reads current architecture. | Before next group meeting (~1 week). |
| Erik | Open-source KB engine evaluation (wiki.js / BookStack / Outline) and editor decision (TipTap vs Lexical). | First story of MVP delivery epic. |
| Vasyl + Zhenya + Erik | Sync separately to settle team collaboration setup: how prompts, agents, artifacts get shared and versioned. | Before next group meeting. |
| Vasyl | Run external user interviews on the consolidated concept(s). | After consolidation + interview-prep is done. |
| Vasyl | Update `docs/PRD.md`, `docs/MOCK_DATA.md`, `CLAUDE.md`, `src/types/index.ts` to reflect locked decisions — but only after he confirms `D-2026-05-12-01`. | Following confirmation. |

---

## Phase 3 — Change impact mapping

### Decision: D-2026-05-12-01 — Private/public folder visibility with explicit unit list

```
Files affected:
  - docs/PRD.md (§1, §3.2, §6.1, §6.2, §6.3, §6.4, §9.6, §10.7, §14.2, §15.1, §15.2, §17.1, §17.3, §17.5)
  - docs/CLAUDE.md (Goal item 5; "Critical design rules" §2 if it cites visibility)
  - docs/MOCK_DATA.md (Develux-level folder block; remove all_units; add HR-internal as private)
  - docs/COMPONENT_MAP.md (VisibilityBadge description; ChangeVisibilityDialog flow)
  - src/types/index.ts (Visibility enum; KBFolder shape; KBArticle.visibility removal)
  - src/data/mock-data.ts (every folder visibility field; folderVisibleToUnit, articleVisibleToUnit,
    getSharedRootFolders, getSubUnitRootFolders, getArticlesInFolder, hasVisiblePublishedArticle,
    getArticleCount, getAllVisibleArticles, setFolderVisibility)
  - src/components/kb/VisibilityBadge.tsx (props, two-state UI)
  - src/components/kb/ChangeVisibilityDialog.tsx (rewrite: public/private toggle + multi-select unit picker)
  - src/components/kb/ArticleEditor.tsx (drop visibility selector for articles)
  - src/components/kb/ArticleView.tsx (drop article visibility badge; show folder visibility instead)
  - src/components/kb/KBRoot.tsx (badge rendering; shared-section header semantics)
  - src/components/kb/CreateFolderDialog.tsx (visibility default + picker)
  - src/components/kb/FolderTree.tsx, FolderView.tsx (any visibility chrome)
Touch size: large
Depends on: nothing — this is the architectural root
```

### Decision: D-2026-05-12-02 — Folder depth raised to 3

```
Files affected:
  - docs/PRD.md (§3.3; §5.2 hierarchy diagram; §9.1 validation message; §9.3 move validation; §14.1 depth-limit error)
  - docs/CLAUDE.md (no explicit depth claim — verify)
  - docs/MOCK_DATA.md (consider adding a 3rd-level folder to demonstrate)
  - src/data/mock-data.ts (getFolderDepth comment + getEligibleParentFolders cap < 3)
  - src/components/kb/CreateFolderDialog.tsx (depth-limit guard)
  - src/components/kb/MoveDialog.tsx (depth-limit guard on destination)
Touch size: small
Depends on: none (independent of D-01)
```

### Decision: D-2026-05-12-03 — Article-level visibility deferred; folder-level only

```
Files affected:
  - docs/PRD.md (§6.2, §10.7, §11 editor layout in §11.6 — drop visibility selector, §14.2 row, §15.2 kb_article schema)
  - docs/COMPONENT_MAP.md (ArticleEditor props — drop folderVisibility prop's effect)
  - src/types/index.ts (KBArticle.visibility removal)
  - src/data/mock-data.ts (every article's visibility field; articleVisibleToUnit becomes folder-driven)
  - src/components/kb/ArticleEditor.tsx (remove visibility dropdown from bottom bar)
  - src/components/kb/ArticleView.tsx (visibility badge sourced from folder)
Touch size: medium
Depends on: D-2026-05-12-01 (defines what folder visibility means)
```

### Decision: D-2026-05-12-04 — KB stays unit-scoped

```
Files affected: none — this is a "do nothing different" decision relative to current implementation.
Optional doc note: docs/PRD.md §2 / §3.1 — add a short rationale paragraph citing the rejected alternative.
Touch size: small (docs-only, optional)
Depends on: none
```

### Decision: D-2026-05-12-05 — Compliance/acknowledgement out of MVP

```
Files affected:
  - docs/PRD.md (§18 Future scope — add: acknowledgement, next_review_date, compliance dashboard, content types,
    onboarding-plan integration)
  - docs/PRD.md (§15.2 kb_article — optional: reserve next_review_date, require_acknowledgement as
    nullable fields if Vasyl elects to make schema AI-ready in MVP per Q7)
Touch size: small
Depends on: none
```

### Decision: D-2026-05-12-06 — Content types deferred

```
Files affected:
  - docs/PRD.md (§18 Future scope — explicit entry for "Content types / policy/playbook/checklist classification")
Touch size: small
Depends on: none
```

### Decision: D-2026-05-12-07 — Editor library evaluation before commitment

```
Files affected:
  - docs/PRD.md (§11.1 — soften from "TipTap, Lexical, or similar" to "open-source KB engine and editor evaluation
    pending; candidates: wiki.js, BookStack, Outline; TipTap, Lexical")
  - docs/CLAUDE.md (Tech stack TipTap line — soften to "pending evaluation")
  - No /src changes — prototype keeps TipTap (or whatever ships) until research lands
Touch size: small
Depends on: none
```

### Decision: D-2026-05-12-08 — Max two concepts to interviews

```
Files affected:
  - docs/meetings/MEETING_NOTES_2026-05-12_kb_discovery_review.md (this file — action items)
  - docs/AI_PILOT_LEARNINGS.md (process learnings)
Touch size: docs-only
Depends on: none
```

### Conflict resolution: pre-existing drift D1/D2/D3/D4/D5

```
D1 (visibility enum drift): resolved by D-2026-05-12-01 once code is updated.
D2 (mock-data all_units example): resolved when MOCK_DATA.md is rewritten under D-01.
D3 (folder depth code matches PRD): resolved by D-2026-05-12-02.
D4 (undocumented components): independent of meeting — add to COMPONENT_MAP.md.
D5 (Active|All scope chip unimplemented): independent of meeting. Defer until D-01 changes settle —
  the chip lives in the toolbar, which D-01 doesn't touch, but rebuilds in the toolbar should
  not happen twice.
Touch size: small (D4) + medium (D5, separate PR)
```

---

## Phase 4 — PR sequencing

Sequencing rule of thumb the run brief asks for: one architectural decision per PR; data/types before UI; each PR independently revertable; flag any PR touching unvalidated areas.

| # | PR | Type | Scope | Depends on | Independently revertable? | User-validated? |
|---|---|---|---|---|---|---|
| 1 | **Docs: PRD + CLAUDE.md + MOCK_DATA.md rewrite for visibility model** | Docs | Apply D-2026-05-12-01, -03, -05, -06, -07; mark headline reversal STATUS pending Vasyl confirmation. No /src changes. | None | Yes — pure docs. | ❌ No — design pending interviews. **Flag.** |
| 2 | **PRD §3.3 + helpers: folder depth 3** | Docs + small code | Apply D-2026-05-12-02 to PRD and `getFolderDepth` / `getEligibleParentFolders` only. No visibility coupling. | None | Yes. | ❌ Not user-validated yet. |
| 3 | **Types: replace Visibility enum, drop KBArticle.visibility, add KBFolder.sharedWithUnitIds** | Code (types only) | Update `src/types/index.ts`. Compile errors expected and welcomed — they map the impact surface. | PR 1 (docs) | Yes, but expensive — downstream PRs depend. | n/a (mechanical). |
| 4 | **Mock data: migrate every folder/article to new visibility shape; rewrite visibility helpers** | Code | `src/data/mock-data.ts`: every folder gets `visibility: 'private' \| 'public'` + `sharedWithUnitIds: string[]`; drop `visibility` from articles. Rewrite `folderVisibleToUnit`, `articleVisibleToUnit`, `getSharedRootFolders`, `getSubUnitRootFolders`, `hasVisiblePublishedArticle`, `getArticleCount`, `getAllVisibleArticles`, `setFolderVisibility`. Add a private "HR Internal" folder + a public Develux-onboarding folder explicitly shared to Employo to exercise both axes (incl. upward share for at least one). | PR 3 | Yes — revert restores enum-driven mock. | ❌ Not user-validated. |
| 5 | **UI: VisibilityBadge + ChangeVisibilityDialog rewrite** | Code | Two-state badge (private/public) with affordance to expose shared-units list on hover/click. Dialog: public/private toggle + multi-select unit picker (only enabled when public). | PR 4 | Yes. | ❌ Not user-validated — explicit interview topic. **Flag for interview check.** |
| 6 | **UI: remove article-level visibility from editor + view** | Code | `ArticleEditor`: drop visibility selector. `ArticleView`: source visibility chrome from parent folder. `CreateFolderDialog`: default new folder to private. | PR 5 | Yes. | ❌ Not user-validated. |
| 7 | **Depth 3 enforcement in dialogs** | Code | `CreateFolderDialog`, `MoveDialog`: update depth checks. Add fixture showing 3 levels (optional). | PR 2 | Yes. | Not user-validated — minor. |
| 8 | **Docs: COMPONENT_MAP.md + CLAUDE.md catch up to current components** | Docs | Document `ArchiveFolderDialog`, `ChangeVisibilityDialog`, `AllArticlesView`. Independent of meeting. | None | Yes. | n/a. |
| 9 | **Toolbar: Active \| All scope chip** (resolves drift D5) | Code | Implement `TERMINAL_STATE_SOLUTION.md` for KB only. Out-of-meeting work; sequence after PR 6 to avoid double-toolbar churn. | PR 6 | Yes. | ✅ The pattern was approved 2026-04-06 — design-validated, not user-validated. |

**Flags for unvalidated areas:**
- PRs 1, 4, 5, 6 touch the visibility model, which is the topic the interview round is designed to validate. Recommend landing PRs 1–4 (docs + plumbing) once Vasyl confirms D-2026-05-12-01, but **holding PRs 5–6 (visible UI) until interview signal returns**, since interview feedback could move the badge UX or the picker affordances.
- PR 9 (scope chip) implements a pattern already approved in `TERMINAL_STATE_SOLUTION.md` but never tested with real users in the KB context — note explicitly that we are deferring its user validation to the same interview round.
