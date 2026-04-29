---
artifact_type: ux-flows-brief
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
  - artifact_type: epic
    feature: knowledge-base
    version: 1.1
    epic_numbers: [1, 2, 3, 4, 5]
  - artifact_type: user-mental-model
    feature: knowledge-base
    version: 1.0
  - artifact_type: decision-log
    feature: knowledge-base
    version: 1.0
  - artifact_type: competitor-analysis
    feature: knowledge-base
    version: 2.0
changelog:
  - version: 1.0
    date: 2026-04-22
    author: orchestrator
    note: "Initial UX flows brief. Consolidates all screens and flows from 71+ stories across 5 epics into a single wireframing reference for the design team."
pm_action_required: false
pm_action_description: —
---

> **About this document**
>
> **What:** UX flows brief for the Knowledge Base initiative -- a complete screen inventory, persona flows, state inventory, navigation map, and design constraint summary covering all 71+ stories across 5 epics. Designed as a wireframing reference for the design team.
> **Why:** The 5 epics contain screen and flow implications scattered across 71+ stories. A designer reading each epic individually would miss cross-epic patterns, screen reuse, and navigation connections. This document consolidates everything into one wireframing brief.
> **Stage:** Delivery Preparation (7 of 8) -- Discovery: Knowledge Base

> **TL;DR**
>
> 28 distinct screens across 5 epics. Four persona flows (Andrii consumer, Maryna creator, Oksana analytics, Dmytro light consumer). The KB lives as a tab inside Unit alongside Calendar, Team, People, Recruitment. Admin view is a toggle within the KB tab. Analytics section uses 5 tabs (Overview, Articles, Acknowledgements, Content Health, Search). Key design constraints from the decision log: 3-level folder hierarchy, Draft/Published lifecycle, "Publish new version" button for versioning, soft gating in onboarding, acknowledgement dashboard built in Epic 3 and extended in Epic 4 (same screens, not duplicates).
>
> **Status:** draft -- 2026-04-22

---

# UX Flows Brief -- Knowledge Base Initiative

---

## 1. Screen Inventory

Every distinct screen/view implied by the 71+ stories across 5 epics.

| # | Screen | Epic | Stories | Primary persona | Description |
|---|--------|------|---------|-----------------|-------------|
| S1 | KB tab (empty state) | E1 | S2 | Andrii | First view when the Unit's KB has no published content. Message: "No articles published yet." |
| S2 | KB tab (folder tree + articles) | E1, E2 | E1:S2,S3,S4; E2:S6 | Andrii | Main KB browsing view. Folder hierarchy (3 levels), articles within folders, inherited content from parent Units with "From [Parent Unit name]" indicator. Search bar at top. |
| S3 | Article reader view | E1 | S10 | Andrii | Full article reading experience: title, cover image, body (semantic HTML), author, published date, "Last reviewed" date (if stale), breadcrumb, file attachments, @mention links. |
| S4 | Article editor | E1 | S5,S6,S7,S8,S9,S11 | Maryna | Rich text editor with toolbar (H1-H3, bold, italic, lists, tables, links, etc.). Content type selector, folder location, auto-save indicator, "Publish" / "Publish new version" buttons, preview button. File upload area. @mention dropdown. |
| S5 | Article editor -- file upload dialog | E1 | S7 | Maryna | File picker within editor. Supported types: PDF, DOCX, XLSX, PPTX, PNG, JPG, GIF, SVG. 25 MB limit. Drag-and-drop area. Upload progress. |
| S6 | Article editor -- version history | E1 | S11 | Maryna | List of all versions with: version number, author, date, change summary. View previous version (read-only). Restore button with confirmation. Revision log within each version. |
| S7 | Article preview (modal or new tab) | E1 | S9 | Maryna | Read-only rendering matching S3 reader view. Accessed via "Preview" button in editor. Allows author to see exactly what employees will see before publishing. |
| S8 | KB admin view (article list) | E1 | S20 | Maryna | Table/list of all articles (Draft, Published, Archived). Columns: title, folder path, status badge, owner, version, freshness badge, last edited, published date. Filters: status, freshness, folder. Sort: title, edited date, published date, freshness. Status count header: "X Draft, Y Published, Z Archived." |
| S9 | KB admin view -- archived articles section | E1 | S14 | Maryna | Filtered view within S8 showing only archived articles with "Archived" badge. Restore to Draft action. |
| S10 | Move article to folder dialog | E1 | S4b | Maryna | Folder picker showing current Unit's folder hierarchy. Select destination (folder or KB root). Supports batch selection. |
| S11 | Folder management (create/rename/delete) | E1 | S3,S4 | Maryna | Inline or modal UI for folder operations. Create folder at any level (1-3). Rename with validation. Reorder via drag-and-drop. Delete (blocked if non-empty). Depth limit message at level 3. |
| S12 | Search results page | E2 | S1,S2 | Andrii | List of results with: article title (clickable), folder path breadcrumb, 150-char snippet with highlighted terms, result count. Paginated at 20. Mobile: single-column with adequate tap targets. |
| S13 | Admin search view | E2 | S10 | Maryna | Search within admin view across Draft, Published, Archived. Status badge per result. Filter toggle: All / Draft / Published / Archived. Synonym and multi-script support. |
| S14 | Synonym dictionary admin | E2 | S9 | Oksana | List of synonym groups. Each group shows all terms. Add/edit/delete groups. "Restore defaults" button. Accessed from KB settings. |
| S15 | Acknowledgement banner on article | E3 | S1,S2 | Andrii | Banner at bottom of article: "This article requires your acknowledgement." Button: "I have read and understood" (UA: "Ja prochytav(-la) ta zrozumiv(-la)"). After click: "Acknowledged on [date]" with green checkmark. Re-ack state: "This article has been updated. Please review and acknowledge the new version." |
| S16 | My acknowledgements page | E3 | S5,S14 | Andrii | Two lists: Pending (article title, Unit, date created, sorted oldest first) and Completed (title, Unit, date acknowledged, version). Accessible from Employo profile area. Global pending count badge in notification area. |
| S17 | Acknowledgement dashboard (operational) | E3, E4 | E3:S7; E4:S6 | Oksana | Article list with ack metrics: title, version, total audience, acknowledged count, pending count, overdue count, completion rate (percentage + progress bar). Filter: Unit, completion status. Click row to expand employee-level detail. Epic 4 adds: trend indicators, configurable thresholds, sortable by completion rate and overdue count. Single screen, built in E3, enhanced in E4. |
| S18 | Acknowledgement audit trail | E3 | S9 | Oksana | Chronological immutable event log per article. Events: ack enabled, published, ack recorded, re-ack triggered, reminder sent, ack disabled, archived. Export as CSV or PDF. |
| S19 | Acknowledgement export dialog | E3 | S10 | Oksana | Export filters: article, Unit, date range, ack status. Format: CSV or PDF. PDF header with company name and generation metadata. |
| S20 | Content freshness dashboard (operational) | E3, E4 | E3:S12; E4:S7 | Oksana | Articles grouped by freshness state: Fresh, Aging, Stale, Expired, No review date. Each group expandable. Filter: Unit, content type, freshness state. Summary: "[X]% of articles with review dates are Fresh or Aging." Epic 4 adds: owner filter, trend data, days overdue/until review column. Single screen, built in E3, enhanced in E4. |
| S21 | Review completion dialog | E3 | S11 | Maryna | Two-option dialog: "Content is still current" (marks reviewed, resets freshness) or "Content needs updating" (opens editor). Optional review notes. Review history list. |
| S22 | Analytics -- Overview tab (KB Health) | E4 | S11 | Oksana | Default landing page. Summary cards: total published, total draft, % published, % stale/expired, avg ack completion rate, total searches, zero-result rate. Each card has trend indicator vs. previous period. "Needs attention" section: top 5 expired articles, top 5 low-ack articles, top 5 failed searches. Time period selector. |
| S23 | Analytics -- Articles tab | E4 | S3 | Maryna | Sortable table: article title, folder, content type, status, total views, unique viewers, ack rate, last viewed, freshness. Filterable by Unit, content type, status, freshness, ack required, time period. Paginated at 50. |
| S24 | Analytics -- Article detail view | E4 | S4 | Maryna | Per-article: views over time chart, unique viewers metric, ack progress (if ack-required), employee ack list (Completed/Pending/Re-ack), helpfulness score (thumbs up/down ratio). Time period selector. |
| S25 | Analytics -- Search tab | E4 | S9,S10 | Oksana | Summary: total searches, unique searchers, avg results, zero-result rate. "Top searches" table: query, count, unique searchers, avg results, click-through rate. "Failed searches" table: query, count, unique searchers, last searched. "Create article" action for content gaps. Dismiss toggle. |
| S26 | Onboarding KB view | E5 | S2,S5 | Andrii (new) | Welcome banner with checklist. Three sections: "Mandatory policies" (Start here), "For your role" (dimmed but clickable with soft nudge), "General knowledge" (dimmed but clickable). Per-section progress: "X of Y completed." Persistent reminder banner for incomplete mandatory items. "Minimize for now" button. Disappears after 30 days or all complete. |
| S27 | Onboarding progress tracking (admin) | E5 | S3,S6 | Maryna | Employee list: name, Unit, hire date, days since hire, articles assigned, completed, %, status (On Track / Behind / Completed). Click row for per-article detail. Filter: Unit, status, hire date range. "Send reminder" action. Ack compliance column: compliant / overdue / in progress. |
| S28 | Bulk import wizard | E5 | S9,S10,S11,S12 | Maryna | Multi-step: (1) Upload CSV, (2) Column mapping with auto-detection and manual override, preview of first 5 rows, save mapping template, (3) Validation results with per-row errors, (4) Import summary, (5) Review imported articles with batch actions (Publish selected, Delete selected, Move to folder). Source-specific export guides (Notion, Confluence, Google Docs) accessible from help section. Desktop only. |

---

## 2. Persona Flows (step-by-step)

### 2.1 Andrii (Employee) -- Consumer flows

**Find answer via search:**
S2 (KB tab) --> type query in search bar --> S12 (search results) --> click result --> S3 (article reader)
- Decision point at S12: if zero results --> "No results found" message with suggestion to browse folders
- Decision point at S12: if multiple results --> scan snippets, pick best match

**Browse folders:**
S2 (KB tab) --> expand folder --> expand subfolder --> click article --> S3 (article reader)
- Inherited articles show "From [Parent Unit name]" label
- Breadcrumb at S3: Unit > Folder > Subfolder > Article

**Acknowledge article:**
S3 (article reader) --> scroll to bottom --> S15 (ack banner) --> click "I have read and understood" --> confirmation: "Acknowledged on [date]" with green checkmark
- If already acknowledged: "You acknowledged this on [date]" (no button)
- If re-ack required: "This article has been updated. Please review and acknowledge the new version." + button reappears

**Check pending acknowledgements:**
Notification badge (global) --> click --> S16 (My acknowledgements) --> see Pending list --> click article --> S3 (article reader) --> acknowledge --> S16 updates (article moves to Completed)

**Onboarding first login (new employee):**
S2 (KB tab, first 30 days) --> S26 (onboarding view with welcome banner) --> Section 1: "Mandatory policies" (Start here) --> click article --> S3 (reader) --> acknowledge if required --> "Back to onboarding" link --> S26 (progress updates) --> Section 2: "For your role" (soft nudge: "Complete mandatory reading first for the best experience") --> Section 3: "General knowledge"
- "Minimize for now" button hides for current session; reappears on next visit
- After all articles completed or 30 days passed --> S2 (standard KB view)

**Mobile experience:**
Same screens (S2, S3, S12, S15, S16, S26) with responsive layout:
- S2: folder hierarchy as accordion or drill-down
- S3: full-width reading, responsive tables (horizontal scroll), images scaled, 44x44px tap targets
- S12: single-column results, full-width search input, keyboard does not obscure results
- S15: ack button minimum 44x44px, no horizontal scroll
- S16: stacked lists
- S26: checklist items with tap-friendly size

**Rate article helpfulness (Epic 4):**
S3 (article reader) --> scroll to bottom --> "Was this article helpful?" --> thumbs up / thumbs down --> vote recorded (can change by clicking opposite, remove by clicking same)

**Access article via direct link:**
External link (Slack, email) --> S3 (article reader, if authorized)
- If no permission: "You don't have access to this article."
- If archived/deleted: "This article is no longer available."
- "Copy link" button on S3 copies URL to clipboard

---

### 2.2 Maryna (HR Admin) -- Creator flows

**Create folder structure:**
S2 (KB tab) --> toggle to admin view (S8) --> "Create folder" --> S11 (folder creation dialog) --> name folder, choose parent --> save
- Repeat for subfolders (up to 3 levels)
- Level 4 attempt: "Maximum folder depth reached."

**Write and publish article:**
S8 (admin view) --> "New article" --> S4 (editor) --> set title, content type, folder location --> write body in rich text editor --> add files (S5) --> add @mentions (S8 dropdown) --> auto-save indicator --> click "Preview" --> S7 (preview modal) --> return to editor --> click "Publish" --> article goes to Published, Version 1.0 --> visible to readers in S2

**Configure acknowledgement:**
S4 (editor) --> toggle "Requires acknowledgement" ON --> acknowledgement type: "Understanding" (default, only option in iteration 1) --> save/publish --> pending ack records created for target audience

**Edit and publish new version:**
S8 (admin view) --> click article --> S4 (editor) --> edit content --> auto-save (creates revision) --> click "Publish new version" --> confirmation dialog ("Publishing a new version will be recorded in version history. In future, this may trigger re-acknowledgement for employees. Continue?") --> optional change summary --> if ack-required: "Require re-acknowledgement for this version" checkbox (default checked) --> new version created

**View who read / did not read:**
S8 (admin view) --> navigate to Analytics section --> S17 (ack dashboard) --> select article --> expand row --> employee-level detail (Acknowledged/Pending/Overdue) --> "Send reminders to pending employees"

**Import from CSV:**
S8 (admin view) --> KB settings --> "Bulk import" --> S28 (import wizard) --> Step 1: upload CSV --> Step 2: column mapping (auto-detect + manual override, preview 5 rows, save template) --> Step 3: validation results (errors per row) --> Step 4: import summary --> Step 5: review imported articles --> batch actions: "Publish selected," "Delete selected," "Move to folder"

**Manage stale content:**
S8 (admin view) --> navigate to Analytics section --> S20 (freshness dashboard) --> filter by Stale/Expired --> click article --> S21 (review dialog) --> "Content is still current" (resets freshness) or "Content needs updating" (opens S4 editor)

**Move article to folder:**
S8 (admin view) --> select article --> "Move to folder" --> S10 (folder picker) --> select destination --> confirm
- Also available from S4 (editor)
- Batch: select multiple articles --> "Move to folder" --> S10

**Archive article:**
S8 (admin view) --> select Published article --> "Archive" --> article moves to S9 (archived section) --> no longer visible to readers
- Restore: S9 --> select article --> "Restore to Draft" --> article returns to Draft in S8

**Delete article:**
S9 (archived section) --> select Draft or Archived article --> "Delete" --> confirmation: "Permanently delete '[title]'? This will remove the article and all attached files. This action cannot be undone. Compliance records (if any) will be retained." --> permanently removed

**Transfer ownership:**
S4 (editor) or S8 (admin view) --> article settings --> "Transfer ownership" --> select user with edit permission --> immediate transfer

**Set review date:**
S4 (editor) --> article settings --> "Next review date" date picker --> save --> freshness tracking begins

**Manage onboarding articles:**
S8 (admin view) --> KB settings or article editor --> flag "Mandatory for onboarding" --> select target Units --> reorder mandatory articles (drag-and-drop) --> view summary of mandatory articles per Unit

**Track onboarding progress:**
Analytics section --> S27 (onboarding progress) --> see employee list with completion % --> filter by Behind status --> click employee --> per-article detail --> "Send reminder"

---

### 2.3 Oksana (HR Director) -- Analytics flows

**View ack compliance dashboard:**
KB tab --> toggle admin view --> Analytics section --> "Acknowledgements" tab --> S17 (ack dashboard)
- Filter by Unit, completion status
- Expand article row for employee-level detail
- Epic 4 adds trend indicators, overdue sorting

**Export compliance report:**
S17 (ack dashboard) --> "Export" --> S19 (export dialog) --> select filters (article, Unit, date range, status) --> choose format (CSV or PDF) --> download
- PDF includes header: "Acknowledgement Report -- [Company] -- Generated on [date]"

**View audit trail:**
S8 (admin view) --> select article --> "Audit trail" tab --> S18 --> chronological event log --> export as CSV or PDF

**View content health:**
Analytics section --> "Content Health" tab --> S20 (freshness dashboard)
- Grouped by freshness state with counts
- Filter by Unit, content type, owner (Epic 4)
- Summary: "[X]% of articles are Fresh or Aging"

**View search analytics:**
Analytics section --> "Search" tab --> S25 --> summary metrics (total searches, zero-result rate) --> "Top searches" table --> "Failed searches" table --> "Create article" action for content gaps

**View KB health overview:**
Analytics section --> "Overview" tab (default) --> S22 --> summary cards with trends --> "Needs attention" section --> click items to navigate to relevant detail views

**Export analytics data (CSV):**
Any analytics table (S17, S20, S23, S25) --> "Export CSV" --> CSV with current filters and time period applied

**View onboarding compliance:**
Analytics section --> S27 --> filter by "Overdue" --> see employees past compliance deadline --> drill into per-employee detail

---

### 2.4 Dmytro (Manager) -- Light consumer

**Browse team KB:**
Unit view --> KB tab --> S2 (folder tree + articles, scoped to his Unit) --> browse folders relevant to his team

**Read team policies:**
S2 --> click article --> S3 (reader view) --> read --> optionally acknowledge if required

**Share article with team member:**
S3 (reader view) --> "Copy link" --> paste in Slack/email --> team member clicks link --> S3 (if authorized)

**Search for procedure:**
S2 --> type query (e.g., "termination procedure") --> S12 (results, scoped to his Units) --> click result --> S3

---

## 3. State Inventory

For each screen, all possible states the designer must account for.

### S1 -- KB tab (empty state)
- **Empty:** "No articles published yet. HR admins can create content here." (for readers) or admin-specific empty state with "Create first article" CTA
- **No Unit assigned:** "Contact your HR admin to be assigned to a team." No articles, folders, or search available

### S2 -- KB tab (folder tree + articles)
- **Normal:** Folders with article counts, articles with title and content type badge
- **Loading:** Skeleton or spinner while content loads
- **With inherited content:** "From [Parent Unit name]" section/indicator on inherited articles
- **Admin toggle visible:** Users with edit permission see admin toggle
- **New Unit, no KB content:** "Your team's Knowledge Base is being set up. Company-wide articles are available below." (E5 S7)

### S3 -- Article reader view
- **Normal:** Full article with all metadata
- **Stale:** "Last reviewed: [Month Year]" indicator (neutral gray text) near metadata
- **Archived/deleted while open:** On refresh: "This article is no longer available."
- **With ack required (not yet acked):** S15 banner with button at bottom
- **With ack completed:** "You acknowledged this on [date]"
- **With re-ack required:** Updated banner: "This article has been updated. Please review and acknowledge the new version."
- **With helpfulness vote (E4):** "Was this article helpful?" with thumbs up/down
- **With cover image:** Cover image rendered at top
- **Without cover image:** Body starts directly after title
- **With file attachments:** Attachment list at bottom with file icons, names, sizes
- **Mobile:** Responsive layout, horizontal table scroll, scaled images, 44x44px tap targets

### S4 -- Article editor
- **New article (empty):** Blank title, blank body, content type "Other" default, "Publish" button
- **Draft article:** Title filled, body content, "Draft" badge, "Publish" enabled
- **Published article (editing):** Revision mode, "Publish new version" button available, auto-save indicator
- **Auto-saving:** "Saving..." indicator
- **Auto-save failed:** "Save failed -- retrying..." with retry count. After 3 failures: "Changes could not be saved. Please check your connection."
- **All changes saved:** "All changes saved" indicator
- **Concurrent editing warning:** "[User name] is editing this article. Your changes may overwrite theirs."
- **Unsaved changes + navigate away:** Confirmation dialog: "You have unsaved changes. Leave without saving?" with "Leave" and "Stay" buttons
- **Title missing on publish attempt:** "Publish" disabled with tooltip: "Add a title before publishing"
- **Mobile (768px+):** Simplified toolbar

### S5 -- File upload dialog
- **Normal:** File picker area with drag-and-drop zone
- **Uploading:** Progress indicator per file
- **File type rejected:** "This file type is not supported. Supported types: PDF, DOCX, XLSX, PPTX, PNG, JPG, GIF, SVG."
- **File too large:** "File size exceeds 25 MB limit."
- **Too many simultaneous:** "You can upload up to 10 files at a time."
- **Attachment limit reached:** "This article has reached the maximum of 20 attachments."

### S6 -- Version history
- **Normal:** List of versions with metadata
- **Viewing previous version:** Read-only content view
- **Restore confirmation:** "Restore version [N]? This will create a new version with that content."
- **Empty (first version, no history):** Single entry: "Version 1.0 -- Published [date]"

### S8 -- KB admin view
- **Normal:** Table with articles and status counts
- **Empty:** "No articles created yet. Start by creating your first article."
- **With "Owner inactive" articles:** Highlighted rows
- **Filtered (no results):** "No articles match the selected filters."

### S12 -- Search results
- **Normal:** Ranked results with snippets and highlighted terms
- **Zero results:** "No results found for '[query]'. Try different keywords or browse the folder list."
- **Loading:** Skeleton/spinner
- **Mobile:** Single-column, full-width input

### S15 -- Acknowledgement banner
- **Pending (first time):** "This article requires your acknowledgement." + button
- **Pending (re-ack):** "This article has been updated. Please review and acknowledge the new version." + button
- **Completed:** "Acknowledged on [date]" + green checkmark
- **Not ack-required:** No banner shown

### S16 -- My acknowledgements
- **Has pending items:** Pending list (sorted oldest first) + Completed list
- **No pending items:** No badge shown; Pending section: "All caught up -- no pending acknowledgements."
- **Empty (no ack-required articles):** "No acknowledgements assigned to you."

### S17 -- Acknowledgement dashboard
- **Normal:** Articles with ack metrics, expand for employee detail
- **No ack-required articles:** "No articles currently require acknowledgement."
- **100% completion on all articles:** All progress bars full (green)
- **With overdue items:** Warning indicators on overdue counts
- **Reminder sent within 24h:** "Send reminders" button disabled: "A reminder was sent less than 24 hours ago ([timestamp])."

### S20 -- Content freshness dashboard
- **Normal:** Articles grouped by freshness state
- **All Fresh:** "All articles are up to date. Next review due: [date]."
- **No review dates set:** All articles in "No review date" section with warning

### S22 -- Analytics overview
- **Normal:** Summary cards with trends and "Needs attention" items
- **New deployment (no data):** "Your Knowledge Base analytics will appear here once articles are published and employees start using the KB."
- **Insufficient trend data:** Trend indicator shows "Not enough data"

### S25 -- Search analytics
- **Normal:** Top searches and failed searches tables
- **No search events:** "No searches recorded yet. Search analytics will appear here once employees start using KB search."
- **No failed searches:** "No failed searches recorded. Your KB is covering employee queries well."

### S26 -- Onboarding KB view
- **Full (all three sections populated):** Mandatory + Role-specific + General with progress indicators
- **No mandatory articles:** Sections 2 and 3 immediately accessible, no gating
- **No role-specific articles (section 2 empty):** Section 2 hidden, jumps from Mandatory to General
- **All mandatory completed:** Banner removed from sections 2 and 3
- **Minimized for session:** Onboarding view hidden; returns on next visit
- **After 30 days or all complete:** Standard KB view (S2) replaces onboarding view
- **No Unit assigned:** "Contact your HR admin to be assigned to a team."

### S27 -- Onboarding progress tracking
- **Normal:** Employee list with progress metrics
- **No employees in onboarding window:** "No employees currently in their onboarding period. New hires will appear here automatically."
- **Behind employees:** Warning indicator highlighting

### S28 -- Bulk import wizard
- **Mobile user:** "Bulk import is available on desktop only. Please switch to a larger screen."
- **Malformed CSV:** "The CSV file could not be parsed. Check that all rows have the same number of columns and that quoted fields are properly closed."
- **Non-UTF-8 encoding:** "The file does not appear to be UTF-8 encoded. Please re-save the file as UTF-8 and try again."
- **Empty CSV (header only):** "The CSV file contains no article data. Please check the file and try again."
- **Zero auto-mappings:** "No columns were auto-detected. Please map at least Title to proceed."
- **Duplicate title warning:** "Article '[title]' already exists. Import as new article? (Will create a duplicate.)"
- **Import complete:** "X articles imported successfully. Y rows skipped due to errors." + downloadable error report

---

## 4. Navigation Map

How KB screens connect to each other and to existing Employo navigation.

### 4.1 KB tab placement within Employo

```
Employo Navigation
|
+-- Units
|   +-- [Unit Name]
|       +-- Team (existing tab)
|       +-- Calendar (existing tab)
|       +-- People (existing tab)
|       +-- Recruitment (existing tab)
|       +-- Knowledge Base (NEW tab) ---------> S2 (reader view) or S1 (empty state)
|                                                  |
|                                                  +-- [Admin toggle] ------> S8 (admin view)
|                                                  |                            |
|                                                  |                            +-- Analytics Section
|                                                  |                            |     +-- Overview tab (S22)
|                                                  |                            |     +-- Articles tab (S23)
|                                                  |                            |     +-- Acknowledgements tab (S17)
|                                                  |                            |     +-- Content Health tab (S20)
|                                                  |                            |     +-- Search tab (S25)
|                                                  |                            |
|                                                  |                            +-- KB Settings
|                                                  |                                  +-- Synonym dictionary (S14)
|                                                  |                                  +-- Bulk import (S28)
|                                                  |                                  +-- Default review period
|                                                  |                                  +-- Onboarding articles config
|                                                  |
|                                                  +-- Search bar -------> S12 (results)
|                                                  +-- Folder tree -------> S3 (article reader)
|
+-- Inbox / Notifications
|   +-- Pending ack badge (global) ---------> S16 (My acknowledgements)
|   +-- @Mention notifications
|   +-- New article publish notifications
|   +-- Freshness alert notifications
|   +-- Re-ack notifications
|   +-- Reminder notifications
|
+-- Profile area
    +-- My acknowledgements ---------> S16
```

### 4.2 Key navigation rules

1. **KB tab lives inside Unit** -- alongside Calendar, Team, People, Recruitment. Same tab navigation pattern.
2. **Admin toggle within KB tab** -- users with edit permission see a toggle to switch between "what employees see" (S2) and "what I need to manage" (S8). No separate admin section.
3. **Analytics section within KB admin view** -- 5 tabs: Overview (S22, default landing), Articles (S23), Acknowledgements (S17), Content Health (S20), Search (S25). Mobile: horizontally scrollable tab bar.
4. **Global ack badge in notification area** -- single badge across all Units, not per-Unit. Clicking navigates to S16 (My acknowledgements).
5. **"My acknowledgements" in Employo profile area** -- accessible from profile since it aggregates across all Units, not within a specific Unit's KB tab.
6. **Breadcrumb on article reader** -- Unit > Folder > Subfolder > Article title. Each segment clickable, navigates to that level.
7. **"Back to onboarding" link** -- on article reader (S3) when accessed from onboarding view (S26), a contextual back link returns to S26.
8. **Direct link access** -- every published article has a permanent URL using immutable article ID. "Copy link" button on S3.

### 4.3 Screen-to-screen transitions

| From | Action | To |
|------|--------|----|
| S2 (KB tab) | Click article | S3 (reader) |
| S2 (KB tab) | Type search query | S12 (results) |
| S2 (KB tab) | Toggle admin | S8 (admin view) |
| S3 (reader) | Click breadcrumb | S2 (specific folder level) |
| S3 (reader) | Click @mention | Employo user profile (existing) |
| S3 (reader) | Click ack button | S15 state change (inline) |
| S3 (reader) | Click "Copy link" | Clipboard + toast: "Link copied" |
| S8 (admin view) | Click article title | S4 (editor) |
| S8 (admin view) | Click "New article" | S4 (editor, empty) |
| S8 (admin view) | Navigate to Analytics | S22 (overview, default) |
| S4 (editor) | Click "Preview" | S7 (preview modal/tab) |
| S4 (editor) | Click "Publish" | S8 (article now Published) |
| S4 (editor) | Click "Publish new version" | Confirmation dialog then S8 |
| S4 (editor) | Click "Move to folder" | S10 (folder picker) |
| S12 (results) | Click result | S3 (reader) |
| S16 (my acks) | Click article | S3 (reader) |
| S17 (ack dashboard) | Click article row | Expand employee detail |
| S17 (ack dashboard) | Click "Export" | S19 (export dialog) |
| S20 (freshness) | Click article | S4 (editor) or S21 (review dialog) |
| S22 (overview) | Click "Needs attention" item | S17, S20, or S25 (relevant detail) |
| S23 (articles tab) | Click article | S24 (article detail) |
| S26 (onboarding) | Click article | S3 (reader with "Back to onboarding" link) |
| S27 (onboarding tracking) | Click employee | Per-article detail view |
| S28 (import wizard) | Complete import | Import review view with batch actions |
| Notification badge | Click | S16 (my acks) |
| Direct link (external) | Click | S3 (reader, if authorized) |

---

## 5. Key Design Decisions Already Made (from Decision Log)

These decisions are finalized and constrain the design. The designer should treat them as requirements, not options.

| # | Decision | Source | Implication for design |
|---|----------|--------|----------------------|
| 1 | KB = tab inside Unit | Gate 2 Decision #2 | Not a standalone module. Tab alongside Calendar, Team, People, Recruitment. Same navigation pattern. |
| 2 | 3-level folder hierarchy | Gate 2 Decision #4 | Folder tree supports 3 levels. Level 4 creation blocked with message. Folder picker (S10) shows 3 levels. |
| 3 | Draft/Published lifecycle (no "In Review") | Gate 1 Scope | Two statuses only. No approval workflow. Author = Publisher. Single click to publish. |
| 4 | "Publish new version" button (not auto-version) | Gate 2 Decision #5 | Saves = revisions (silent, readers see updated content). "Publish new version" = explicit version (triggers re-ack). Two distinct buttons needed. |
| 5 | Parent-to-child inheritance only | Gate 2 Decision #6 | No parallel sharing. Inherited articles show "From [Parent Unit name]". Read-only from child perspective. |
| 6 | One KB, permissions-based separation | Gate 2 Decision #7 | No separate "HR admin KB." Admin content separated by permission roles. Admin toggle on KB tab. |
| 7 | Article-level acknowledgement (not section-level) | Gate 2 Decision #8 | One ack button per article. Bottom of article (scroll-to-reach). No section-level tracking. |
| 8 | "Understanding" level acknowledgement only | Gate 2 Decision #3 | Button text: "I have read and understood" (UA: "Ja prochytav(-la) ta zrozumiv(-la)"). NOT "I agree." No other types in iteration 1. |
| 9 | Soft gating in onboarding | E5 v1.1 fix | Sections 2 and 3 dimmed but clickable with soft nudge. Not locked. Recommended order, not enforced. |
| 10 | Dashboards: E3 builds, E4 extends | E3 v1.1, E4 v1.1 | Ack dashboard and freshness dashboard are single screens built in E3 and enhanced in E4. Not two separate screens. |
| 11 | Admin view lives within KB tab | E1 Open Question resolved | "Admin view" toggle visible to users with edit permission. Same KB tab, not a separate section. |
| 12 | Permissions inherited from Employo | Gate 2 | No separate KB permission page. Read = Unit membership. Write = edit permission in Space Settings. |
| 13 | Concurrent editing: last save wins | E1 S6 | No real-time collaboration. Warning shown if another user is editing. No merge. |
| 14 | Auto-save every 5 seconds of inactivity | E1 S6 | Debounced auto-save. Creates revision, not version. Browser local storage as fallback on failure. |
| 15 | Mobile responsive (not separate mobile app) | Scope | Same layouts, responsive. Not a dedicated mobile KB app. 320px minimum for reader, 768px minimum for editor. |

---

## 6. Open Design Questions

Questions the designer needs to answer before wireframing. These are not resolved in the epics or decision log.

### Navigation and layout

1. **Folder tree: left sidebar or inline?**
   - Option A: Left sidebar showing full folder tree, right area showing article list for selected folder (Confluence pattern)
   - Option B: Inline expandable tree (accordion) with articles appearing below each folder (BambooHR pattern)
   - Consideration: Mobile behavior differs significantly. Sidebar requires collapse/overlay on mobile. Inline works more naturally.

2. **Article list: card view or list view or both?**
   - Cards show more preview content but fewer items per screen
   - List is denser, better for scanning large article counts
   - Admin view (S8) likely best as list/table. Reader view (S2) could be either.

3. **Articles outside folders: before or after folders in KB view?**
   - Flagged as open question in Epic 1. Designer owns this decision.

### Editor

4. **Editor: full-page or split-pane with preview?**
   - Full-page: simpler, more writing space. Preview via separate button (S7).
   - Split-pane: live preview alongside editing. More complex, more context.
   - Consideration: depends on engine selection (Story 1). Engine's editor may dictate approach.

5. **Editor toolbar: fixed at top or floating?**
   - Fixed: always visible, predictable
   - Floating: appears near cursor/selection, saves vertical space

### Acknowledgement

6. **Ack button placement: exactly where at bottom?**
   - After article body, before file attachments?
   - After everything (body + attachments)?
   - Sticky/floating at bottom of viewport while scrolling?
   - Consideration: button must be at bottom to encourage scrolling through content. Should not be sticky (defeats the "scroll to reach" intent).

### Mobile

7. **Mobile: responsive same layout or simplified mobile layout?**
   - Responsive: same HTML, CSS adapts. Simpler to build, consistent.
   - Simplified: different component set for mobile. Better UX, more work.
   - Consideration: Employo's existing pattern should dictate this. Use whatever pattern Calendar, Team, People tabs use.

### Onboarding

8. **Onboarding three-section view: tabs, accordion, or stacked sections?**
   - Tabs: one section visible at a time. Cleaner but hides progress.
   - Accordion: all sections visible, expandable. Shows progress at a glance.
   - Stacked: all sections visible, scrollable. Most information density.

### Analytics

9. **Analytics charts: which chart types for "views over time" (S24)?**
   - Line chart: shows trends over time. Standard for time-series.
   - Bar chart: easier to read discrete periods (daily/weekly counts).
   - Consideration: depends on Employo's charting library (flagged as open question in E4).

10. **Analytics mobile: card-based layout for tables?**
    - E4 S14 specifies card-based layout on mobile for table rows. How should this look?
    - Which fields are shown on the card vs. hidden?

### Search

11. **Search bar: always visible or expandable?**
    - Always visible at top of KB view (E2 specifies "prominently placed")
    - Consider: global Employo search exists. How does KB-specific search relate to it?

12. **Search results page: same page or overlay?**
    - Full page navigation (S2 --> S12 as separate page)
    - Overlay/drawer within the KB tab
    - Consideration: affects "Back to browsing" navigation

### Import

13. **Import mapping wizard: stepper or single scrollable page?**
    - Stepper: clear progression through steps. Standard for wizards.
    - Single page: all context visible. More overwhelming.

---

## Appendix A: Story-to-Screen Cross-Reference

For each epic and story, which screen(s) it affects.

### Epic 1 -- Content Foundation (20 stories)
| Story | Screen(s) |
|-------|-----------|
| S1 (Engine evaluation) | No UI |
| S1b (Permission API spike) | No UI |
| S2 (KB tab) | S1, S2 |
| S3 (Folders) | S2, S11 |
| S4 (Folder management) | S11 |
| S4b (Move article to folder) | S10 |
| S5 (Article creation) | S4 |
| S6 (Rich text editor) | S4 |
| S7 (File uploads) | S4, S5 |
| S8 (@Mentions) | S4, S3 |
| S9 (Publishing) | S4 |
| S10 (Reader view) | S3 |
| S11 (Versioning) | S4, S6 |
| S12 (Unit-scoped visibility) | S2 |
| S13 (Content inheritance) | S2 |
| S14 (Archival) | S8, S9 |
| S15 (Deletion) | S8, S9 |
| S16 (Ownership) | S4, S8 |
| S17 (Freshness indicators) | S4, S8, S3 |
| S18 (Permissions) | S2 (access control, no dedicated screen) |
| S19 (RAG metadata) | No UI (backend) |
| S20 (Admin view) | S8 |

### Epic 2 -- Search + Discovery (11 stories)
| Story | Screen(s) |
|-------|-----------|
| S1 (Keyword search) | S2 (search bar), S12 |
| S2 (Results page) | S12 |
| S3 (Synonym dictionary) | No UI for readers; S14 for admin |
| S4 (Multi-script) | S12 |
| S5 (Permission-aware results) | S12 |
| S6 (Browse hierarchy) | S2 |
| S7 (Direct links) | S3 |
| S8 (Email notifications) | No KB screen (Employo Inbox) |
| S9 (Synonym admin) | S14 |
| S10 (Admin search) | S13 |
| S11 (Search logging) | No UI (backend) |

### Epic 3 -- Compliance Layer (14 stories)
| Story | Screen(s) |
|-------|-----------|
| S1 (Ack config) | S4 |
| S2 (Ack action) | S3, S15 |
| S3 (Immutable record) | No UI (backend) |
| S4 (GDPR storage) | No UI (backend) |
| S5 (Ack status tracking) | S16 |
| S6 (Re-ack) | S3, S15, S16 |
| S7 (Ack dashboard) | S17 |
| S8 (Reminders) | S17 |
| S9 (Audit trail) | S18 |
| S10 (Ack export) | S19 |
| S11 (Review management) | S21, S4 |
| S12 (Freshness dashboard) | S20 |
| S13 (Stale indicator for readers) | S3 |
| S14 (Pending ack badge) | S16, Notification area |

### Epic 4 -- Analytics + Measurement (14 stories)
| Story | Screen(s) |
|-------|-----------|
| S1 (Event infrastructure) | No UI (backend) |
| S2 (View tracking) | S24 |
| S3 (Article analytics list) | S23 |
| S4 (Article detail) | S24 |
| S5 (Per-Unit dashboard) | S23 (filtered) |
| S6 (Ack rates enhancement) | S17 (extends) |
| S7 (Freshness enhancement) | S20 (extends) |
| S8 (Search tracking) | No UI (backend) |
| S9 (Search dashboard) | S25 |
| S10 (Failed search tracking) | S25 |
| S11 (KB health overview) | S22 |
| S12 (Export CSV) | All analytics screens |
| S13 (Helpfulness voting) | S3 |
| S14 (Mobile analytics) | S22, S23, S17, S20, S25 (responsive) |

### Epic 5 -- Onboarding + Migration (12 stories)
| Story | Screen(s) |
|-------|-----------|
| S1 (Mandatory article assignment) | S4, S8 (settings) |
| S2 (Onboarding KB view) | S26 |
| S3 (Onboarding progress tracking) | S27 |
| S4 (Onboarding module integration) | No KB screen (Onboarding module) |
| S5 (Knowledge path) | S26 |
| S6 (Onboarding ack tracking) | S27 |
| S7 (Auto-access) | S2 (access logic, no dedicated screen) |
| S8 (Candidate-to-employee transition) | No KB screen (Recruitment module) |
| S9 (Bulk import CSV) | S28 |
| S10 (Mapping wizard) | S28 |
| S11 (Export guides) | S28 (help section) |
| S12 (Import review + batch publish) | S28 (review step) |
