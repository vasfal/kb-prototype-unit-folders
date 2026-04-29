# Terminal-State Entities in List Views — Design Specification

**Status:** Approved
**Priority:** P3
**Author:** Product Design
**Date:** 2026-04-06

---

## Problem statement

Terminal-state entities (Archived, Terminated, Filled, Canceled, etc.) accumulate in list views and pollute the active working set. Users waste time scanning through historical entries to find active work. The problem scales linearly with company age and size — a company with 200 employees will accumulate hundreds of terminated records, filled vacancies, and archived articles over time.

Every mature HRM and project management platform solves this. Our platform currently does not.

---

## Entity lifecycle map

### Active vs. terminal classification

| Entity | Active states (operational) | Terminal states (historical) |
|---|---|---|
| Employee | Awaiting start, Employed | Terminated |
| Vacancy | Draft, Planned, Open, On hold (Paused) | Filled, Hired, Canceled |
| Job | Draft, Published | Archived |
| KB Article | Draft, Published | Archived |
| Pipeline | Draft, Published | Archived |
| Offer | Draft, In review, Approved, Sent | Signed, Rejected, Canceled, Expired |

**Principle:** Draft is always an active state. A draft entity is operationally relevant — someone is working on it. Only entities that have reached a terminal lifecycle outcome are excluded from the active scope.

### State transition diagram (simplified)

```
Draft ──→ Published ──→ Archived (terminal)
  │                        ↑
  └────────────────────────┘ (direct archive)

Draft ──→ Planned ──→ Open ──→ Filled (terminal)
                        │       Hired (terminal)
                        │       Canceled (terminal)
                        └──→ On hold ──→ Open (resume)

Awaiting start ──→ Employed ──→ Terminated (terminal)
```

---

## Proposed solution: View Scope Switcher

### Concept

Add a **scope switcher** — two independent chip-style text controls labeled **"Active"** and **"All"** — as the leftmost element in every entity list's controls bar. It defines which set of entities is visible.

- **Active** (default): Shows only entities in active/operational states
- **All**: Shows all entities regardless of status

This is a **view scope**, not a filter. Scopes define the universe of visible entities. Filters narrow within a scope. This distinction is critical for maintaining the platform principle of "no default filters on tables."

### Why "Active | All" naming

| Considered | Rejected because |
|---|---|
| Active \| Archived | "Archived" doesn't cover Terminated, Filled, Canceled, Hired, etc. |
| Active \| Inactive | "Inactive" has specific meaning in access/permissions contexts |
| Current \| History | Too vague — "Current" could mean time-based |
| Active \| Completed | Terminated employees are not "completed" |
| Include archived (toggle) | Implies the default view is incomplete — "something is hidden" |
| Active \| Archived \| All (3 options) | Adds complexity without proportional value; "Archived" label doesn't fit all entity types |

**"Active \| All"** is correct because:
- Self-explanatory across all entity types
- "Active" frames the default view as complete and self-sufficient
- "All" communicates clearly: see everything, no exclusions
- No entity-specific vocabulary needed

---

## Detailed specification

### Visual design — Bordered chip style

The scope switcher uses a **bordered chip** pattern — visually distinct from the pill-style segmented controls used for entity sub-tabs (Vacancies | Pools).

```
  ┌─Active─┐  All            Active  ┌──All──┐
  └────────┘                          └───────┘
  "Active" selected (default)     "All" selected
```

**Why not the same segmented pills as Vacancies | Pools?**

The Vacancies | Pools control and the Active | All control serve fundamentally different purposes:

| | Vacancies / Pools | Active / All |
|---|---|---|
| **What it does** | Switches between entirely different entity types with different schemas, actions, and workflows | Scopes the visibility within the same entity type |
| **Mental model** | "What am I working with?" | "How much of it do I see?" |
| **Relationship** | Siblings — parallel top-level destinations | Scope — Active/All operates *within* Vacancies |

Using the same component for both flattens this hierarchy. The bordered chip style creates a clear visual distinction: **pill segments = entity-type navigation, chips = scope control**.

**Specifications:**

| Property | Value |
|---|---|
| **Selected chip** | |
| Background | `#e6f0fb` (selected-bg / primary-light) |
| Border | 1px solid `#b3d4f0` (primary tint) |
| Border radius | `rounded-md` (6px) |
| Text color | `#0052a3` (primary-dark) |
| Text size | 13px, Inter Medium (font-weight 500) |
| Padding | 4px 8px |
| **Unselected option** | |
| Background | transparent (no fill) |
| Border | none |
| Text color | `#697a9b` (text-muted) |
| Text size | 13px, Inter Medium (font-weight 500) |
| Padding | 4px 8px |
| **Container** | |
| No shared container | Each chip is independent — no wrapping background |
| Gap between options | 6px |
| **Interactions** | |
| Hover on unselected | Text color → `#525f7a` (text-secondary) |
| Cursor on unselected | `pointer` |
| Transition | `150ms` color and background |

**Key visual difference from pill tabs:** No shared gray container wrapping both options. Each option is independent — the selected one gets a chip appearance, the unselected one is plain text. This makes it impossible to confuse with the Vacancies | Pools segmented control.

### Placement

The scope switcher sits as the **leftmost element** in the controls bar, before Search.

**Views with entity sub-tabs (Vacancies):**

The sub-tabs (Vacancies | Pools) occupy their own row. The scope switcher, search, filter, sort, and all right-side controls (Sub-units, Create, more) share a second row below. This keeps the main controls bar layout identical across all views.

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [Vacancies | Pools]                   Sub-units [●]  [+ Create]  [...]  │  ← sub-tabs row
├──────────────────────────────────────────────────────────────────────────┤
│ [Active] All  [🔍 Search] [⊛] [⇅]                                      │  ← controls row
└──────────────────────────────────────────────────────────────────────────┘
```

**Views without entity sub-tabs (Employees, Jobs, KB, Offers, Pipelines):**

Everything on one row — scope switcher, search, filter, sort, and right-side controls.

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [Active] All  [🔍 Search] [⊛] [⇅]    Sub-units [●]  [+ Create]  [...]  │
└──────────────────────────────────────────────────────────────────────────┘
```

**Right-side controls position:** Sub-units toggle, Create button, and "..." menu always live on the same row as the scope switcher and search. When sub-tabs exist, they get their own row above. This ensures right-side controls stay at a consistent vertical position across all views — only the presence/absence of a sub-tabs row above changes.

**Per-view layouts:**

| View | Layout |
|---|---|
| **Employees** | Single row: `[Active] All` `[Search]` `[Filter]` `[Sort]` ... `[Sub-units]` `[+ Create job]` `[...]` |
| **Vacancies** | Row 1: `[Vacancies\|Pools]` ... `[Sub-units]` `[+ Create vacancy]` `[...]`<br>Row 2: `[Active] All` `[Search]` `[Filter]` `[Sort]` |
| **Jobs** | Single row: `[Active] All` `[Search]` `[Filter]` `[Sort]` ... `[Sub-units]` `[+ Create job]` `[...]` |
| **KB Articles** | Single row: `[Active] All` `[Search]` `[Filter]` `[Sort]` ... `[Sub-units]` `[⊞\|☰]` `[+ Create article]` `[...]` |
| **Offers** | Single row: `[Active] All` `[Search]` `[Filter]` `[Sort]` ... `[Sub-units]` `[+ Create offer]` `[...]` |
| **Pipelines** | Single row: `[Active] All` `[Search]` `[Filter]` `[Sort]` ... `[Sub-units]` `[+ Create pipeline]` `[...]` |

**Placement rationale:**
- Leftmost position signals it's the highest-level scoping control
- Always visible — not buried in a dropdown or filter panel
- On views with sub-tabs, the sub-tabs row only contains entity-type navigation + right-side controls — clean separation of concerns

### Behavior

#### Default state
- **"Active" is always the default** when entering any entity list view
- This is not a filter being applied — it's the natural resting state of the view

#### Scope persistence
- Scope selection persists **within a session** for each tab
- Navigating away from a tab and back retains the scope
- Switching units resets scope to "Active"
- Page refresh resets scope to "Active"

#### Interaction with other controls

| Control | Interaction with scope |
|---|---|
| **Search** | Searches within the current scope. "Active" scope + search = search active entities only |
| **Filter** | Filters apply within the current scope. Status filter in "Active" scope shows only active statuses in the dropdown |
| **Sort** | Sorts within the current scope |
| **Sub-units toggle** | Independent — controls unit depth, not status depth. Both operate simultaneously |
| **View mode toggle** | Independent — controls display format, not data scope |
| **Pagination** | Counts and pages reflect the current scope |

#### Status filter dropdown behavior
- When scope = **Active**: Status filter dropdown shows only active states for that entity type (e.g., for Employees: "Awaiting start", "Employed")
- When scope = **All**: Status filter dropdown shows all states (e.g., for Employees: "Awaiting start", "Employed", "Terminated")
- This prevents contradictory combinations (e.g., filtering for "Terminated" within "Active" scope)

#### Counts and pagination
- Total record count reflects the current scope
- Example: 500 employees total, 420 active → "Active" scope shows "420 employees", "All" scope shows "500 employees"
- Pagination operates within the scoped set

### Empty states

**Active scope is empty (all entities are terminal):**
```
┌─────────────────────────────────────┐
│                                     │
│         [illustration]              │
│                                     │
│    No active [entity type]          │
│                                     │
│    Switch to "All" to view          │
│    archived items.                  │
│                                     │
│    [+ Create entity type]           │
│                                     │
└─────────────────────────────────────┘
```

The empty state message adapts per entity type:
- KB: "No active articles. Switch to All to view archived articles."
- Employees: "No active employees. Switch to All to view terminated records."
- Vacancies: "No active vacancies. Switch to All to view filled and canceled vacancies."

**All scope is empty (no entities exist at all):**
Standard empty state — "No [entity type] yet. Create your first [entity type]."

---

## Per-view specification

### Employees (table view)

**Active scope shows:** Awaiting start, Employed
**All scope adds:** Terminated

Table layout unchanged. The Status column continues to show colored badges. The only difference is which rows appear.

### Vacancies (card view)

**Active scope shows:** Draft, Planned, Open, On hold (Paused)
**All scope adds:** Filled, Hired, Canceled

Card layout unchanged. Terminal-state cards show the same layout as active ones — the status badge communicates the state. The scope switcher sits on the controls row below the "Vacancies | Pools" sub-tabs row.

### Jobs (table view)

**Active scope shows:** Draft, Published
**All scope adds:** Archived

### KB Articles (card grid view)

**Active scope shows:** Draft, Published
**All scope adds:** Archived

In the card grid view, folder sections only appear if they contain articles within the current scope. A folder with only archived articles disappears from the Active scope. Switching to All reveals it.

**Folder section count badges** reflect the scoped article count within that folder.

### Offers (table view)

**Active scope shows:** Draft, In review, Approved, Sent
**All scope adds:** Signed, Rejected, Canceled, Expired

### Pipelines (table view)

**Active scope shows:** Draft, Published
**All scope adds:** Archived

---

## Edge cases

### 1. Entity moves to terminal state while user is viewing list
If a colleague archives an article while the user has the "Active" scope open, the article disappears on next data refresh. No special handling needed — this is correct and expected behavior for a scope.

### 2. User creates a new entity
New entities start as Draft (active state). They always appear in the "Active" scope. No scope switching needed.

### 3. Entity restored from terminal state
When an archived article is restored (→ Draft), it reappears in the "Active" scope. If the user is in "All" scope, the status badge updates. No navigation change needed.

### 4. Sub-units toggle + scope interaction
Both controls are independent and compose naturally:
- Active scope + Sub-units ON = active entities from this unit and sub-units
- Active scope + Sub-units OFF = active entities from this unit only
- All scope + Sub-units ON = all entities from this unit and sub-units
- All scope + Sub-units OFF = all entities from this unit only

### 5. KB folder sections with mixed content
A folder containing 3 published + 2 archived articles:
- Active scope: folder header shows count "3", displays 3 cards
- All scope: folder header shows count "5", displays 5 cards

A folder containing only archived articles:
- Active scope: folder section is hidden entirely
- All scope: folder section appears with its articles

### 6. Deep linking
For future URL-based state persistence, the scope could be represented as `?scope=all` (only when deviating from default). The absence of the parameter implies "Active" scope.

### 7. Bulk actions
If the platform supports bulk actions (select multiple → archive/delete), the scope switcher does not affect bulk action availability. Bulk actions operate on selected items within the current scope.

### 8. Export/download
Data export should reflect the current scope unless the user explicitly chooses "Export all."

---

## Why not alternative approaches

### Why not segmented pill tabs (same as Vacancies | Pools)?
Using the same `tabs-pills-light` component for both Vacancies/Pools and Active/All creates semantic confusion. Both controls look identical but serve fundamentally different purposes — entity-type navigation vs. status scoping. The bordered chip style creates a clear visual hierarchy: pill segments = entity-type navigation, chips = scope control within a view.

### Why not underline text tabs?
Considered as an option. Clean visual differentiation, but risks confusion with the main tab bar (Team, People management, Recruitment, Jobs) which also uses underlined text. The chip style is more self-contained and less likely to be mistaken for navigation.

### Why not a dot indicator?
Minimal and lightweight, but may be too subtle for discoverability. The dot indicator lacks the affordance that tells users "this is clickable and switchable." The chip with a visible background/border provides stronger interaction cues.

### Why not separate navigation destinations (like Linear)?
Linear uses Active / Backlog / All as sidebar navigation items — effectively different pages. This would require navigation architecture changes across the entire platform, new pages/routes for each entity type, and sidebar changes. The controls bar scope switcher achieves the same functional result with zero navigation architecture changes.

### Why not a "Show archived" toggle?
A toggle implies the default view is incomplete — something is hidden that you need to "turn on." This conflicts with the "no default filters" principle. It also doesn't scale well:
- "Show archived" works for KB/Jobs but not for Employees ("Show terminated"?)
- Would need entity-specific labels
- Toggle framing is psychologically different from scope framing

### Why not default status filters?
Directly violates the "no default filters on tables" principle. Filters imply the user needs to actively manage their filter state. A scope is a higher-level abstraction that doesn't carry the same cognitive overhead.

### Why not automatic time-based hiding (like Jira Kanban)?
- Arbitrary — why 2 weeks? Why not 1? Why not 4?
- Not user-controllable
- Creates confusion when items "disappear" without user action
- Doesn't work for entities that stay terminal indefinitely (terminated employees)

### Why not a dedicated "Archive" tab in the tab bar?
- Would need a separate tab for each entity type's terminal states
- Tab bar is already crowded (Team, People management, Recruitment, Jobs, Knowledge base)
- Archives span multiple entity types — doesn't map cleanly to a single tab

---

## Implementation notes

### Data layer
No backend changes required. The scope switcher is a client-side filter applied to the entity list query. The API may already support status-based filtering — the scope simply pre-configures it.

If the API does not support status-based filtering:
- For small datasets (<1000): client-side filtering is acceptable
- For large datasets: add a `status_scope=active|all` query parameter

### Component architecture
The scope switcher is a **shared component** used across all entity list views. It accepts:
- `scope: 'active' | 'all'` — current state
- `onScopeChange: (scope) => void` — callback
- Entity-type-specific active/terminal state mappings are defined in a config object, not hardcoded in the component

### Accessibility
- Scope switcher uses `role="tablist"` with `role="tab"` for each option
- `aria-selected="true"` on the active scope
- Keyboard: arrow keys to switch, Enter/Space to activate
- Screen reader announcement: "View scope: Active selected" / "View scope: All selected"

---

## Figma reference

**Design file:** https://www.figma.com/design/KDJ0aVVR1FmAt8ohgZyd3P/Knowledge-Base?node-id=57-12872

The toolbar frame at node `57:12872` shows the selected approach: bordered chip style scope switcher on the controls row, below the Vacancies | Pools sub-tabs row.

---

## Open questions

1. **Should scope persist across sessions (localStorage)?** Current proposal: no — reset on page refresh. Reasoning: "Active" is the correct default 99% of the time. Users who need "All" are doing a specific task and will switch manually.

2. **Should we show the terminal count as a badge on "All"?** e.g., `All (80)` to indicate how many terminal items exist. This could encourage discovery but also adds visual noise. Recommendation: defer — start without counts and evaluate.

3. **Should the scope switcher appear on entity detail views?** e.g., when viewing an archived article, should there be an indication of scope? Current proposal: no — the scope only affects list views. The article view shows the entity regardless of scope.

4. **Mobile behavior?** Out of scope for this platform (desktop-only), but the chip pattern would work at any width.

---

## Summary

| Aspect | Decision |
|---|---|
| **Pattern** | Bordered chip (independent chips, no shared container) |
| **Labels** | "Active" \| "All" |
| **Default** | Active |
| **Placement** | Leftmost element in controls bar, before Search |
| **Visual style** | Selected: `#e6f0fb` fill + `#b3d4f0` border + `#0052a3` text. Unselected: plain text `#697a9b`. Visually distinct from pill-style sub-tabs. |
| **Toolbar layout** | Views with sub-tabs: sub-tabs get own row, controls row below. Views without: single row. Right-side controls always on the controls row. |
| **Scope of change** | Controls bar only — no navigation, layout, or data model changes |
| **Applies to** | All entity list views (Employees, Vacancies, Jobs, KB, Offers, Pipelines) |
| **Interaction** | Independent of Search, Filter, Sort, Sub-units, View mode |
| **Persistence** | Per-session, per-tab. Resets on unit change or page refresh |
