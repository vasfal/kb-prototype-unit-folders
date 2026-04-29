---
artifact_type: permission-matrix
feature: knowledge-base
stage: delivery-preparation
status: draft
version: 1.0
created_by: orchestrator
created_at: 2026-04-22
reviewed_by: —
reviewed_at: —
approved_by: —
approved_at: —
inputs:
  - artifact_type: conceptual-model
    feature: knowledge-base
    version: 1.0
  - artifact_type: epic
    feature: knowledge-base
    epic_number: 1
    version: 1.1
  - artifact_type: epic
    feature: knowledge-base
    epic_number: 2
    version: 1.1
  - artifact_type: epic
    feature: knowledge-base
    epic_number: 3
    version: 1.1
  - artifact_type: epic
    feature: knowledge-base
    epic_number: 4
    version: 1.1
  - artifact_type: epic
    feature: knowledge-base
    epic_number: 5
    version: 1.1
  - artifact_type: decision-log
    feature: knowledge-base
    version: 1.0
changelog:
  - version: 1.0
    date: 2026-04-22
    author: orchestrator
    note: "Initial permission matrix. Comprehensive role x action x scope matrix for dev-team Sprint 0 and Epic 1 reference."
pm_action_required: false
pm_action_description: —
---

> **About this document**
>
> **What:** Complete role x action x scope permission matrix for the Knowledge Base feature. Covers all KB actions across all 5 epics, mapped to the 5 KB roles derived from Employo's existing permission model.
> **Why:** Dev team needs a single reference to implement permission checks across all KB stories. This matrix eliminates ambiguity about who can do what, in which scope, and under what conditions.
> **Stage:** Delivery Preparation -- Discovery: Knowledge Base

> **TL;DR**
>
> 5 roles (Reader, Author, Publisher, Unit Admin, Org Admin) mapped against 40+ KB actions across 8 action categories (Folder, Article, Content, Acknowledgement, Search, Analytics, Import, Settings). All permissions inherit from Employo's existing Unit membership and Space Settings permission model -- KB does NOT introduce a separate permission layer (Gate 2 decision). Scope is always Unit-based: own Unit only, own Unit + child Units (inherited), or all Units (org-wide). No parallel Unit sharing exists (Gate 2 decision: parent-to-child only).
>
> **Status:** draft -- 2026-04-22

---

# Permission Matrix -- Knowledge Base

## Role Definitions

KB roles are NOT separate entities. They are projections of Employo's existing permission model onto KB-specific actions.

| KB Role | Derived from (Employo permission) | Scope | Personas | Notes |
|---|---|---|---|---|
| **Reader** | Unit membership (employee belongs to the Unit) | Own Unit + inherited parent Unit content | Andrii, Dmytro | Default for all employees. Read-only access to published content in their Unit(s). |
| **Author** | Edit permission in Employo Space Settings for the Unit | Own Unit | Maryna | Can create, edit, and publish content. In iteration 1, Author = Publisher (no separate approval workflow). |
| **Publisher** | Same as Author (iteration 1) | Own Unit | Maryna | Identical to Author in iteration 1. Separated here for future iteration 2 when approval workflows are added. |
| **Unit Admin** | Unit Admin role in Employo Space Settings | Own Unit + child Units | Maryna, Dmytro | Full KB management for their Unit. Sees analytics and compliance data for their Unit. |
| **Org Admin** | Space Admin in Employo | All Units (org-wide) | Oksana, Ihor | Full KB management across ALL Units. Org-wide analytics, global settings, cross-Unit visibility. |

---

## Scope Dimensions

| Scope | Definition | Example |
|---|---|---|
| **Own Unit only** | Actions and visibility limited to the single Unit the user belongs to | Andrii in Engineering sees only Engineering KB content |
| **Own Unit + child Units (inherited)** | Content published in parent Unit is visible to child Units. Admin actions on own Unit extend to viewing data from child Units | Oksana publishes at Company level; Engineering (child) inherits visibility |
| **All Units (org-wide)** | Org Admin sees and manages content, analytics, and settings across every Unit | Oksana views compliance dashboard for all departments |
| **Global (cross-Unit settings)** | Settings that apply across the entire KB system, not scoped to any specific Unit | Synonym dictionary, default review period, overdue threshold |

---

## Permission Matrix: Folder Actions

| Action | Reader | Author | Unit Admin | Org Admin | Scope | Conditions | Epic.Story |
|---|---|---|---|---|---|---|---|
| **View folder hierarchy** | Yes | Yes | Yes | Yes (all Units) | Own Unit + inherited | Only published content visible to Reader | E1.S3 |
| **Create folder (L1, L2, L3)** | No | Yes | Yes | Yes | Own Unit | Max 3 levels. Name: non-empty, unique within parent, max 100 chars | E1.S3 |
| **Rename folder** | No | Yes | Yes | Yes | Own Unit | Same validation as create | E1.S4 |
| **Reorder folders** | No | Yes | Yes | Yes | Own Unit | Drag-and-drop or explicit move. Order persists across sessions | E1.S4 |
| **Move folder** | No | Yes | Yes | Yes | Own Unit | Blocked if move would exceed 3-level depth limit | E1.S3 |
| **Delete empty folder** | No | Yes | Yes | Yes | Own Unit | Folder must be empty (no articles, no subfolders) | E1.S4 |
| **Delete non-empty folder** | No | No | No | No | — | Blocked. Must move or delete contents first | E1.S4 |

---

## Permission Matrix: Article Lifecycle Actions

| Action | Reader | Author | Unit Admin | Org Admin | Scope | Conditions | Epic.Story |
|---|---|---|---|---|---|---|---|
| **Create article (Draft)** | No | Yes | Yes | Yes | Own Unit | Created in Draft status. Owner = creator | E1.S5 |
| **Edit article** | No | Yes | Yes | Yes | Own Unit | Draft or Published. Last-save-wins for concurrent edits | E1.S6 |
| **Save revision** | No | Yes | Yes | Yes | Own Unit | Auto-save every 5s. Does NOT create new version | E1.S6, E1.S11 |
| **Publish article (Draft to Published)** | No | Yes | Yes | Yes | Own Unit | Creates Version 1.0. Requires title. Single-click (no approval) | E1.S9 |
| **Publish new version** | No | Yes | Yes | Yes | Own Unit | Creates new version (e.g., 2.0). May trigger re-ack | E1.S11 |
| **Preview article** | No | Yes | Yes | Yes | Own Unit | Read-only render matching reader view | E1.S9 |
| **View published article** | Yes | Yes | Yes | Yes (all Units) | Own Unit + inherited parent content | Article must be Published. Filtered by Unit membership | E1.S10 |
| **View draft article** | No | Yes | Yes | Yes | Own Unit | Draft badge shown. Not visible to Readers | E1.S5 |
| **View archived article** | No | Yes (in admin view) | Yes | Yes | Own Unit | Archived badge. Visible in admin view only | E1.S14 |
| **Archive article** | No | Yes (own articles) | Yes | Yes | Own Unit | Removes from reader visibility. Ack records retained | E1.S14 |
| **Restore archived article** | No | Yes (own articles) | Yes | Yes | Own Unit | Restores to Draft. Must re-publish | E1.S14 |
| **Delete article** | No | Yes (own articles) | Yes | Yes | Own Unit | Only Draft or Archived. Cascade: deletes media. Ack records retained | E1.S15 |
| **Move article to folder** | No | Yes | Yes | Yes | Own Unit | Folder picker within Unit. Batch move supported | E1.S4b |
| **View version history** | No | Yes | Yes | Yes | Own Unit | Shows all versions with author, date, change summary | E1.S11 |
| **Restore previous version** | No | Yes | Yes | Yes | Own Unit | Creates new version with restored content | E1.S11 |
| **Transfer article ownership** | No | Owner or Unit Admin | Yes | Yes | Own Unit | Target must have edit permission in the Unit | E1.S16 |

---

## Permission Matrix: Content Actions

| Action | Reader | Author | Unit Admin | Org Admin | Scope | Conditions | Epic.Story |
|---|---|---|---|---|---|---|---|
| **Upload file attachment** | No | Yes | Yes | Yes | Own Unit | Max 25MB per file. Max 10 simultaneous. Max 20 per article | E1.S7 |
| **Insert inline image** | No | Yes | Yes | Yes | Own Unit | PNG, JPG, GIF, SVG. Rendered inline in body | E1.S7 |
| **Set cover image** | No | Yes | Yes | Yes | Own Unit | Appears at top of reader view | E1.S7 |
| **Remove attachment** | No | Yes | Yes | Yes | Own Unit | Manual removal. Persists on edit unless explicitly removed | E1.S7 |
| **Download attachment** | Yes | Yes | Yes | Yes | Own Unit + inherited | Any user who can view the article can download its attachments | E1.S10 |
| **@Mention user** | No | Yes | Yes | Yes | Own Unit | Dropdown search against Employo user directory. Creates GDPR personal data | E1.S8 |
| **Set review date** | No | Yes (as owner) | Yes | Yes | Own Unit | Optional. Default: 12 months from publish (configurable) | E1.S17 |
| **Mark as reviewed** | No | Yes (as owner) | Yes | Yes | Own Unit | Resets freshness to Fresh. Sets new review date | E3.S11 |
| **Set content type** | No | Yes | Yes | Yes | Own Unit | Optional. Values: Policy, Playbook, Checklist, FAQ, How-to, Other | E1.S5 |
| **Set language** | No | Yes | Yes | Yes | Own Unit | Default: "uk". Can set to "en" | E1.S19 |
| **Vote helpfulness** | Yes | Yes | Yes | Yes | Own Unit + inherited | Thumbs up/down per article version. One vote per user per version | E4.S13 |

---

## Permission Matrix: Acknowledgement Actions

| Action | Reader | Author | Unit Admin | Org Admin | Scope | Conditions | Epic.Story |
|---|---|---|---|---|---|---|---|
| **Acknowledge article** | Yes | Yes | Yes | Yes | Own Unit + inherited | Article must be Published, ack-required, current version. Irreversible | E3.S2 |
| **Configure ack requirement** | No | Yes | Yes | Yes | Own Unit | Toggle on/off per article. Default: off | E3.S1 |
| **Trigger re-acknowledgement** | No | Yes | Yes | Yes | Own Unit | Checkbox during "Publish new version". Default: checked | E3.S6 |
| **View own ack status** | Yes | Yes | Yes | Yes | Own (personal) | "My acknowledgements" page: Pending + Completed lists | E3.S5 |
| **View ack dashboard (own Unit)** | No | No | Yes | Yes | Own Unit | Per-article metrics: total, acknowledged, pending, overdue, completion % | E3.S7 |
| **View ack dashboard (all Units)** | No | No | No | Yes | All Units | Org-wide acknowledgement data | E3.S7 |
| **Send ack reminders** | No | Yes | Yes | Yes | Own Unit | Manual trigger. 24h minimum interval. Via Employo Inbox | E3.S8 |
| **View audit trail** | No | No | Yes | Yes | Own Unit | Chronological, immutable event log per article | E3.S9 |
| **Export ack report (CSV/PDF)** | No | No | Yes | Yes | Own Unit (Unit Admin) / All Units (Org Admin) | Filterable by article, Unit, date range, status | E3.S10 |
| **Configure ack overdue threshold** | No | No | No | Yes | Global | Default: 14 days. Configurable at KB level | E3.S7 |

---

## Permission Matrix: Search Actions

| Action | Reader | Author | Unit Admin | Org Admin | Scope | Conditions | Epic.Story |
|---|---|---|---|---|---|---|---|
| **Search published articles** | Yes | Yes | Yes | Yes (all Units) | Own Unit + inherited parent content | Results filtered by Unit membership. No cross-Unit leakage | E2.S1 |
| **Search drafts and archived** | No | Yes | Yes | Yes | Own Unit (edit-perm Units) | Admin search only. Filterable by status | E2.S10 |
| **Browse folder hierarchy** | Yes | Yes | Yes | Yes | Own Unit + inherited | Only published content visible to Reader | E2.S6 |
| **Access article via direct link** | Yes (if in Unit) | Yes | Yes | Yes | Own Unit + inherited | Permission check on access. "Access denied" if not in Unit | E2.S7 |
| **Copy article link** | Yes | Yes | Yes | Yes | Own Unit + inherited | Copies permanent URL to clipboard | E2.S7 |

---

## Permission Matrix: Analytics Actions

| Action | Reader | Author | Unit Admin | Org Admin | Scope | Conditions | Epic.Story |
|---|---|---|---|---|---|---|---|
| **View article analytics list** | No | Yes | Yes | Yes | Own Unit (edit-perm Units) | Sortable table: views, unique viewers, ack rate, freshness | E4.S3 |
| **View per-article analytics** | No | Yes | Yes | Yes | Own Unit | Views over time, ack progress, helpfulness | E4.S4 |
| **View per-Unit dashboard** | No | No | Yes (own Unit) | Yes (all Units) | Own Unit / All Units | Summary: articles, views, active readers, ack rate, stale count | E4.S5 |
| **View KB health overview** | No | No | Yes (own Unit) | Yes (all Units) | Own Unit / All Units | Summary cards, "Needs attention" section, trend indicators | E4.S11 |
| **View search analytics** | No | No | Yes (own Unit) | Yes (all Units) | Own Unit / All Units | Top searches, failed searches, click-through rate | E4.S9 |
| **View content freshness dashboard** | No | No | Yes (own Unit) | Yes (all Units) | Own Unit / All Units | Articles by freshness state. Built in E3, enhanced in E4 | E3.S12, E4.S7 |
| **Export analytics CSV** | No | No | Yes (own Unit) | Yes (all Units) | Own Unit / All Units | Respects current filters. UTF-8 with BOM. Max 10K rows sync | E4.S12 |
| **Dismiss failed search entry** | No | Yes | Yes | Yes | Own Unit | Mark as "not actionable". Reversible via toggle | E4.S10 |

---

## Permission Matrix: Import Actions

| Action | Reader | Author | Unit Admin | Org Admin | Scope | Conditions | Epic.Story |
|---|---|---|---|---|---|---|---|
| **Bulk CSV import** | No | Yes | Yes | Yes | Own Unit | Max 10MB, max 500 rows. Creates Draft articles | E5.S9 |
| **Use import mapping wizard** | No | Yes | Yes | Yes | Own Unit | Desktop only. Map CSV columns to Employo fields | E5.S10 |
| **Save mapping template** | No | Yes | Yes | Yes | Global (per org) | Reusable across imports. Visible to all with import permission | E5.S10 |
| **Batch publish imported articles** | No | Yes | Yes | Yes | Own Unit | Confirmation required. Triggers ack records if ack-required | E5.S12 |
| **Batch delete imported articles** | No | Yes | Yes | Yes | Own Unit | Confirmation with count. Permanent | E5.S12 |
| **View import history** | No | Yes | Yes | Yes | Own Unit | Import date, file name, article count, imported_by | E5.S12 |

---

## Permission Matrix: Settings Actions

| Action | Reader | Author | Unit Admin | Org Admin | Scope | Conditions | Epic.Story |
|---|---|---|---|---|---|---|---|
| **Configure default review period** | No | No | No | Yes | Global | Default: 12 months. Applies to new articles unless overridden | E3.S11 |
| **Configure ack overdue threshold** | No | No | No | Yes | Global | Default: 14 days. Single source of truth for E3 and E4 | E3.S7 |
| **Manage synonym dictionary** | No | No | No | Yes | Global | Add, edit, remove synonym groups. Shared across all Units | E2.S9 |
| **Restore default synonyms** | No | No | No | Yes | Global | Re-adds default groups without affecting custom additions | E2.S9 |
| **Configure IP capture for ack** | No | No | No | Yes | Global (customer level) | Default: OFF per GDPR. Opt-in per customer | E3.S4 |
| **Configure ack retention period** | No | No | No | Yes | Global (customer level) | Default: employment + 6 years. Min: employment + 3 years | E3.S4 |
| **Configure onboarding ack deadline** | No | No | Yes (own Unit) | Yes | Own Unit / Global | Default: Day 5. Configurable per Unit | E5.S6 |
| **Flag article as mandatory for onboarding** | No | Yes | Yes | Yes | Own Unit + child Units | Independent of ack requirement | E5.S1 |
| **Reorder onboarding articles** | No | Yes | Yes | Yes | Own Unit | Drag-and-drop or number-based | E5.S1 |

---

## Edge Cases

### Edge Case 1: Reader in Unit A sees content in Unit B?

**Answer: No.** There is NO parallel sharing between Units (Gate 2 decision). A Reader in Unit A sees:
- Published articles in Unit A's KB
- Published articles inherited from Unit A's parent Units (up the hierarchy)
- Nothing from Unit B, Unit C, or any non-ancestor Unit

### Edge Case 2: Author sees content in parent Unit?

**Answer: Read-only inherited content.** An Author in Unit A (child of Company) sees:
- Company-level articles inherited into Unit A's KB (read-only, with "From [Company]" indicator)
- Can edit and publish articles in Unit A's KB
- Cannot edit parent Unit's articles from the child Unit view

### Edge Case 3: Employee has roles in multiple Units?

**Answer: Each Unit's KB is independent.** If Andrii belongs to Unit A (as Reader) and Unit B (as Reader):
- Each Unit's KB tab shows only that Unit's content + inherited parent content
- Content does NOT bleed between Unit A and Unit B
- "My acknowledgements" page aggregates pending acks across ALL Units
- Search within a Unit's KB tab is scoped to that Unit
- The pending ack badge in global navigation is a single count across all Units

If Andrii has edit permission in Unit A but only read permission in Unit B:
- Unit A KB: sees Drafts, can create/edit/publish
- Unit B KB: sees only Published articles, no edit actions

### Edge Case 4: Unit Admin sees child Unit content?

**Answer: Yes, for analytics and dashboards. No, for content editing.**
- Unit Admin sees analytics data for their Unit + child Units (E4 dashboards)
- Unit Admin sees ack dashboard data for their Unit + child Units (E3.S7)
- Unit Admin CANNOT edit articles in child Units -- they can only edit articles in their own Unit
- Inherited articles from parent Units are read-only in child Unit views

### Edge Case 5: What happens when an employee's Unit membership changes?

**Answer: KB access updates immediately** (E1.S12 AC 4):
- New Unit's KB content becomes visible
- Old Unit's KB content becomes invisible (unless the employee remains a member of both)
- Completed ack records are retained (immutable)
- Pending ack records for inherited articles from the old parent are cancelled (E3 edge case)

### Edge Case 6: Deactivated employee (leaves organization)?

**Answer:** (E1.S16, E3 edge cases):
- Cannot access KB (account deactivated)
- @Mentions still display their name but are no longer clickable
- Articles they owned are flagged "Owner inactive" -- notification sent to Unit Admin
- Completed ack records are retained for configured retention period
- Pending ack records are retained with status "Employee deactivated -- not acknowledged"
- Pending acks excluded from active dashboard counts and completion rate denominators

### Edge Case 7: Org Admin managing all Units?

**Answer:** Org Admin has unrestricted KB access:
- Can view, create, edit, publish, archive, delete articles in ANY Unit
- Sees analytics, ack dashboards, and freshness dashboards across ALL Units
- Can manage global KB settings (synonym dictionary, default review period, overdue threshold)
- Can export compliance reports for any Unit or org-wide

### Edge Case 8: Article inherited from parent, acknowledged, then parent archives it?

**Answer:** (E1.S13 AC 4, E3 resolved open question):
- Archived article disappears from all child Units' KB views
- Pending ack records for that article are cancelled
- Completed ack records are retained (immutable)
- Cancellation logged in audit trail

---

## Implementation Notes for Dev Team

1. **No separate KB permission model.** All permission checks resolve to two questions:
   - "Is this user a member of this Unit?" (read access)
   - "Does this user have edit permission in this Unit?" (write access)
   These map to existing Employo APIs validated in Sprint 0 Spike 1b.

2. **Permission check happens at Employo's API layer, NOT in the engine.** The open-source engine's permission model must be fully disabled or bypassed (Sprint 0 Spike 1). Employo proxies all requests through its API with an admin API key.

3. **Unit membership is the ONLY access control mechanism.** There are no per-article ACLs, no per-folder permissions, and no KB-specific permission roles. If a user is in the Unit, they see all published content in that Unit's KB.

4. **Inherited content is read-only.** Articles inherited from parent Units cannot be edited from child Unit views. Only the parent Unit's editors can modify them.

5. **Search results are permission-filtered at query time** using Unit IDs as filterable attributes in Meilisearch (or equivalent). Post-retrieval filtering is NOT sufficient -- it leaks information through result counts.

6. **Ack records are append-only.** No UPDATE or DELETE operations at the application or database level. Enforce via database-level row security or trigger (Sprint 0 prerequisite for E3.S3).
