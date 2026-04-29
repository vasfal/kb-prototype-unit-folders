---
artifact_type: conceptual-model
feature: knowledge-base
stage: domain-modeling
status: draft
version: 1.0
created_by: landscape-mapper
created_at: 2026-04-22
reviewed_by: —
reviewed_at: —
approved_by: —
approved_at: —
inputs:
  - artifact_type: domain-facts
    feature: knowledge-base
    version: 1.0
  - artifact_type: user-mental-model
    feature: knowledge-base
    version: 1.0
  - artifact_type: competitor-analysis
    feature: knowledge-base
    version: 2.0
  - artifact_type: market-landscape
    feature: knowledge-base
    version: 1.1
changelog:
  - version: 1.0
    date: 2026-04-22
    author: landscape-mapper
    note: Initial conceptual model built from domain facts, user mental model, competitor analysis, and market landscape.
pm_action_required: true
pm_action_description: "Review conceptual model before problem framing. This shapes all downstream design. Gate 2 decision needed."
---

> **About this document**
>
> **What:** Conceptual Model for the Knowledge Base feature -- the domain structure that Employo's KB must embody. Defines core entities, their relationships, lifecycle patterns, authority model, temporal rhythms, and governing rules. This is an information architecture map, not a database schema.
> **Why:** The conceptual model sits between the user mental model (how users think) and the system design (how the system works). It resolves ambiguities, surfaces structural tensions, and gives problem-framer and concept-architect a shared vocabulary and structural foundation. Every entity and rule here must be traceable to evidence.
> **Stage:** Domain Modeling (post-Research) -- Discovery: Knowledge Base

> **TL;DR**
>
> The KB domain contains 9 core entities organized around a Unit-scoped containment hierarchy: KB Root > KB Location (Unit-scoped) > Folder (2-level nesting) > Article > Article Version. Three cross-cutting entities -- Acknowledgement Record, Media/Attachment, and Content Review -- operate across the hierarchy. The authority model has 5 roles (Reader, Author, Publisher, Unit Admin, Org Admin) that map directly to Employo's existing permission system. Six lifecycle patterns govern articles (Draft/Published/Archived), acknowledgements (Pending/Completed/Re-ack Required), content freshness (Fresh/Aging/Stale/Expired), versions vs. revisions, folder lifecycle, and KB Location lifecycle. Eight structural tensions require PM decisions before problem framing, the most consequential being: (1) folder hierarchy vs. flat categories, (2) "Space" naming collision with Employo's existing concept, (3) version = new ack required vs. revision = no ack, and (4) Unit-inherited permissions vs. explicit KB permissions.
>
> **Status:** draft -- 2026-04-22

---

# Conceptual Model -- Knowledge Base

## 1. Core Entities and Relationships

### 1.1 Entity definitions

| # | Entity | Definition | Key attributes | Evidence |
|---|---|---|---|---|
| E1 | **Knowledge Base** | The root container for all KB content within an Employo Space. One KB instance per Employo Space. Contains all KB Locations. | Space ID, KB settings (default review cycle, default ack type, language) | Product Context (Space = top-level container); Domain Facts 2.3 (KB vs. Wiki distinction: curated, structured, controlled authoring) |
| E2 | **KB Location** | A Unit-scoped content container within the KB. Each KB Location is associated with one Employo Unit. Contains folders and articles scoped to that Unit. This is the entity that resolves the "space" naming collision -- deliberately NOT called "KB Space." | Unit ID, display name, description, visibility settings, created_at, created_by | Internal Context Section 5 (colleague recommended "space-based separation + Unit-scoped permissions"); Research Synthesis Pattern 6 (Unit-scoped content is Employo's unique advantage); Domain Facts 7 (Space terminology collision -- OPEN); Competitor precedent: Confluence = Spaces, Guru = Collections |
| E3 | **Folder** | An organizational container within a KB Location that groups related articles. Supports 2-level nesting (folder > subfolder). The primary navigation and browsing structure. | Parent (KB Location or Folder), name (unique within parent), display order, created_at, created_by | Internal Context Section 6 (2-level hierarchy: folder + subfolder = MUST; nested subfolder = COULD); Competitor Analysis: BambooHR 4-level folders, PeopleForce categories, colleague preferred 2-level nesting |
| E4 | **Article** | The atomic content unit of the KB. A self-contained piece of authored content (not an uploaded file). Has exactly one published version visible to readers at any time. Can carry acknowledgement requirements. | Title, body (rich text/semantic HTML), content_type (policy/playbook/checklist/faq/how-to), status (Draft/Published/Archived), current_version_id, owner_id, KB Location ID, Folder ID, review_date, requires_acknowledgement (boolean), ack_type (read-understood/agree-comply), language, created_at, updated_at | Domain Facts 2.1 (article lifecycle states); Domain Facts 4 (Article definition -- "atomic unit of KB content"); User Signals 5.3 (HR admin content types); Functional Checklist Layer 1 (article editor components); Research Synthesis JTBD-6 (create and maintain content) |
| E5 | **Article Version** | A numbered snapshot of an article representing a significant content change. Only one version is Published at a time. Previous versions are retained as read-only snapshots. A new version may trigger re-acknowledgement. | Version number, article_id, body_snapshot, author_id, created_at, change_summary, triggers_re_ack (boolean) | Domain Facts 2.1 (version vs. revision distinction); Competitor Analysis: PeopleForce has version history with restore; Domain Facts 2.1 ("Only one version of an article is Published at any time") |
| E6 | **Media / Attachment** | A file (image, document, PDF) attached to an article. Stored in system media storage. Lifecycle tied to the parent article. | File type, file size, article_id, storage_url, uploaded_by, uploaded_at | Internal Context Section 3 (file storage rules: delete article = delete files; edit article = keep files); Internal Context Section 1 (upload methods: file picker MUST, drag & drop COULD, paste COULD) |
| E7 | **Acknowledgement Record** | An immutable record that a specific employee acknowledged a specific article version at a specific time. The compliance artifact. Once recorded, cannot be edited or deleted (tamper-proof). Retained for employment duration + statute of limitations. | Employee ID, article_id, article_version at time of ack, timestamp, ack_type (read-understood/agree-comply), method (electronic click), IP address (optional) | Domain Facts 2.2 (minimum metadata for defensible record); Domain Facts 1.2 (acknowledgement records = personal data under GDPR, retained under legal obligation exception); Domain Facts 2.2 (tamper-proof requirement) |
| E8 | **Content Review** | A scheduled review event for an article. Tracks when articles are due for review and who is responsible. Drives content freshness tracking. | Article ID, review_date, reviewer_id (= article owner), status (Upcoming/Overdue/Completed), completed_at | Domain Facts 2.1 (12-month default review cycle; 3-6 months for high-change environments); Research Synthesis Pattern 5 (content lifecycle weakest layer); Competitor Analysis Gap 7 (only Guru has freshness tracking) |
| E9 | **User Role (KB context)** | The set of KB-specific actions a user can perform, determined by their Employo permissions. Not a separate entity but a projection of existing Employo roles onto KB actions. | Derived from Employo Space Settings > Permission Roles + Unit membership | Product Context Differentiator 2 (enterprise-grade permissions); Internal Context Section 4 (permission-consistent publishing); Functional Checklist E2 (Unit-inherited permissions) |

### 1.2 Entity relationship map

```
Knowledge Base (root, 1 per Space)
│
├── KB Location (1 per Unit; Unit-scoped)
│   │
│   ├── Folder (level 1; 0..N per KB Location)
│   │   │
│   │   ├── Folder (level 2 = subfolder; 0..N per folder)
│   │   │   └── Article (0..N per folder)
│   │   │
│   │   └── Article (0..N per folder)
│   │
│   └── Article (0..N directly in KB Location, outside folders)
│
└── [Shared content: articles visible across multiple KB Locations]

Article ──── 1:N ──── Article Version (snapshot chain)
Article ──── 1:N ──── Media / Attachment
Article ──── 1:N ──── Acknowledgement Record (per employee per version)
Article ──── 1:N ──── Content Review (scheduled events)

Acknowledgement Record ──── N:1 ──── Employee (Employo user)
Acknowledgement Record ──── N:1 ──── Article Version (specific version acknowledged)

KB Location ──── 1:1 ──── Unit (Employo org structure)
```

### 1.3 How competitors model these entities

| Entity | PeopleForce | BambooHR | Sloneek | Kenjo | Trainual | Confluence | Notion |
|---|---|---|---|---|---|---|---|
| **Root container** | Knowledge Base | Company Files | Company Wiki | Smart Docs | Library | Site | Workspace |
| **Scoped container** | (none -- single KB) | (none -- single) | (none -- single) | (none -- single) | (none -- org-wide) | Space | Workspace/Team Space |
| **Organizational unit** | Category (flat) | Folder (4 levels) | Category | Tags (dept/group) | Subject | Page tree | Page tree |
| **Content unit** | Article | File (uploaded) | Article | Document (uploaded) | Topic > Step | Page | Page > Block |
| **Version** | Version (with restore) | (none -- file replacement) | (not documented) | (none) | (not documented) | Version (with diff) | Version |
| **Attachment** | Cover image, inline | (file IS the content) | (not documented) | (file IS the content) | Video, screen rec | Attachment, macro | Block (any media) |
| **Acknowledgement** | (none) | E-signature | (none on wiki) | Read receipt | Ack + e-sig + re-ack | (add-on only) | (none) |
| **Content freshness** | (none) | (none) | (none) | (none) | (none) | (none) | (none) |

**Key observation:** No single competitor models all 9 entities. Most HR platforms have 3-5. The richest model is Trainual (Subject > Topic > Step + acknowledgement + completion tracking) but it is not an HRIS. Confluence has the richest container model (Space > Page > Child Page + versions + attachments) but lacks HR-specific entities (acknowledgement, content review, Unit scoping).

---

## 2. Lifecycle Patterns

### 2.1 Article lifecycle

```
                    ┌─────────────┐
     Create         │             │   Publish
    ────────►      │    DRAFT    │ ──────────►  PUBLISHED
                    │             │               │     │
                    └─────────────┘               │     │
                          ▲                       │     │
                          │                       │     │
                     Unpublish /              Archive│     │ Edit (creates
                     Restore to draft             │     │ new draft version)
                          │                       │     │
                          │                       ▼     │
                    ┌─────────────┐               │     │
                    │             │               │     │
                    │  ARCHIVED   │ ◄─────────────┘     │
                    │             │                      │
                    └─────────────┘                      │
                          │                              │
                     Delete (permanent)                  │
                          │                              ▼
                          ▼                     New version created;
                    ┌─────────────┐             old version retained
                    │             │             as snapshot
                    │  DELETED    │
                    │ (cascade:   │
                    │  files      │
                    │  deleted;   │
                    │  ack records│
                    │  RETAINED)  │
                    └─────────────┘
```

| State | Visible to readers | Visible to authors/admins | Searchable | Can be acknowledged |
|---|---|---|---|---|
| **Draft** | No | Yes | No (reader search) / Yes (admin search) | No |
| **Published** | Yes (per Unit permissions) | Yes | Yes | Yes |
| **Archived** | No | Yes | Yes (admin search only) | No |
| **Deleted** | No | No (content destroyed) | No | No (ack records retained) |

**Iteration 1 scope boundary:** Research Synthesis proposed simplifying to 3 states (Draft, Published, Archived) for iteration 1. The "In Review" state (awaiting approval before publishing) requires multi-step approval workflow, which is out of scope for iteration 1. This means any user with edit permission can publish directly -- no editorial gating.

**Evidence:** Domain Facts 2.1 (5-state standard lifecycle); Internal Context Section 4 (publishing = edit permission); Research Synthesis scope boundary (iteration 1: Draft/Published article lifecycle).

### 2.2 Acknowledgement lifecycle

```
    Article published with          Employee views          Content updated
    ack requirement                 and acknowledges        (new version, major)
           │                              │                        │
           ▼                              ▼                        ▼
     ┌──────────┐               ┌──────────────┐          ┌──────────────────┐
     │          │   Employee    │              │  Version  │                  │
     │ PENDING  │ ──confirms──►│  COMPLETED   │──change──►│ RE-ACK REQUIRED  │
     │          │               │              │           │                  │
     └──────────┘               └──────────────┘          └──────────────────┘
           ▲                                                      │
           │                                                      │
           └──────────── Employee re-acknowledges ◄───────────────┘
                         (new ack record created)
```

| State | Meaning | Trigger | Employee action required |
|---|---|---|---|
| **Pending** | Employee has been assigned to acknowledge an article but has not yet done so | Article published with ack requirement; employee is in target audience (Unit membership) | Yes -- read article, click "I have read and understood" |
| **Completed** | Employee has acknowledged the specific article version | Employee clicked acknowledgement | No |
| **Re-ack Required** | Article has been updated (new version) and employee must re-acknowledge the new version | Author publishes a new major version with re-ack trigger enabled | Yes -- re-read and re-acknowledge |

**Design constraints from domain facts:**
- Acknowledgement type defaults to level 2: "I have read and understood" (Domain Facts 2.2)
- Acknowledgement record is immutable once created (Domain Facts 2.2: tamper-proof)
- Re-ack is triggered only on **version** changes (major), NOT **revision** changes (minor) (Domain Facts 2.1: version vs. revision distinction)
- Minimum record: employee ID + article version + timestamp + ack type (Domain Facts 2.2)
- GDPR retention: employment duration + statute of limitations (3-6 years) (Domain Facts 1.2)

**Evidence:** Domain Facts 2.2 (acknowledgement rules); Competitor Analysis Gap 1 (0/23 have KB-article-level ack) and Gap 8 (only Rippling/Trainual handle re-ack); Functional Checklist E11.

### 2.3 Content freshness lifecycle

```
    Article published          Time passes          Review date          Review date
    (review date set)          (approaching)        reached              passed + no review
           │                        │                    │                      │
           ▼                        ▼                    ▼                      ▼
     ┌──────────┐           ┌──────────────┐    ┌──────────────┐      ┌──────────────┐
     │          │           │              │    │              │      │              │
     │  FRESH   │──────────►│   AGING      │───►│    STALE     │─────►│   EXPIRED    │
     │          │           │ (approaching  │    │ (review date │      │ (significantly│
     │          │           │  review date) │    │  reached)    │      │  past due)   │
     └──────────┘           └──────────────┘    └──────────────┘      └──────────────┘
           ▲                                           │                      │
           │                                           │                      │
           └─────── Owner reviews and confirms ◄───────┘──────────────────────┘
                    (new review date set)
```

| State | Definition | Visible to | Action expected |
|---|---|---|---|
| **Fresh** | Review date is >30 days away | No indicator needed | None |
| **Aging** | Review date is within 30 days | Author/admin: warning indicator | Owner should plan review |
| **Stale** | Review date has passed, no review completed | Author/admin: alert; Readers: "Last reviewed: [date]" | Owner must review and confirm or update |
| **Expired** | Review date passed by >30 days (configurable threshold) | Author/admin: critical alert; Oksana dashboard | Escalate to Unit Admin; consider archival |

**Evidence:** Domain Facts 2.1 (12-month default, 3-6 months for compliance content); Competitor Analysis Gap 7 (only Guru has freshness tracking); Functional Checklist 3.4, 3.10, 7.8; Market Landscape addendum (AI freshness detection as future capability).

### 2.4 Version vs. Revision

This distinction is critical because it determines whether re-acknowledgement is triggered.

| Dimension | Version (major) | Revision (minor) |
|---|---|---|
| **Definition** | Significant content change: new policy terms, structural rewrite, substantive update | Minor edit: typo fix, formatting, link update, clarification |
| **Creates new snapshot** | Yes -- new version number (e.g., 1.0 > 2.0) | No -- edit tracked in history within current version |
| **Triggers re-ack** | Yes (if article requires acknowledgement and author enables re-ack) | No |
| **Visible to readers** | Readers see new version; previous version hidden | Readers see updated content; no version change notice |
| **Author action** | Explicit: author chooses "Publish as new version" | Implicit: author saves edit |

**OPEN QUESTION (Domain Facts 8, Q6):** Should the version vs. revision distinction be author-controlled (author chooses when to publish a new version) or system-determined (based on change magnitude)? Author-controlled is simpler and used by Helpjuice, Document360, and KnowledgeOwl. System-determined is more consistent but harder to implement. This is a PM decision.

**Evidence:** Domain Facts 2.1 (version vs. revision definition); Helpjuice, Document360, Desk365 documentation on versions and revisions.

---

## 3. Authority and Ownership Model

### 3.1 KB roles (projected from Employo permissions)

KB does NOT introduce a separate permission system. Instead, it projects Employo's existing permission model onto KB-specific actions.

| KB Role | Derived from | KB actions | Personas |
|---|---|---|---|
| **Reader** | Unit membership (employee belongs to the Unit) | View published articles in their Unit's KB Location; search within accessible KB Locations; acknowledge articles; view own acknowledgement status | Andrii, Dmytro |
| **Author** | Unit edit permission | All Reader actions + create articles (Draft), edit articles, upload media, publish articles, create/manage folders, set review dates, configure acknowledgement requirements | Maryna (designated authors) |
| **Publisher** | Same as Author (iteration 1; separate Publisher role in future with approval workflows) | Same as Author -- in iteration 1, edit permission = publish permission | Maryna |
| **Unit Admin** | Unit admin role in Employo Space Settings | All Author actions + manage KB Location settings, view Unit-scoped analytics, manage content review assignments, archive/delete articles | Maryna, Dmytro (for their Unit) |
| **Org Admin** | Space Admin in Employo | All Unit Admin actions across ALL KB Locations + org-wide analytics, global KB settings, cross-Unit content sharing | Oksana, Ihor |

**Key design principle:** "Only users with edit permission can publish articles or create folders" (Internal Context Section 4). This is not a new permission -- it uses Employo's existing permission model. KB inherits, it does not invent.

**Evidence:** Internal Context Section 4 (permission-consistent publishing); Product Context Differentiator 2 (enterprise-grade permissions, Unit-scoped); Functional Checklist E2 (Unit-inherited permissions), E3 (permission-consistent publishing); Domain Facts 6 (authority boundaries table).

### 3.2 Authority matrix

| Action | Reader | Author | Unit Admin | Org Admin | Conditions |
|---|---|---|---|---|---|
| View published article | Yes (own Unit + shared) | Yes | Yes | Yes (all Units) | Article must be Published; user must have access to the article's KB Location |
| Search KB | Yes (own Unit scope) | Yes | Yes | Yes (all Units) | Search results filtered by user's Unit membership |
| Acknowledge article | Yes | Yes | Yes | Yes | Article must be Published and require acknowledgement; ack recorded against current version |
| Create article (Draft) | No | Yes | Yes | Yes | Created in user's authorized KB Location |
| Edit article | No | Yes (own articles + Unit articles) | Yes | Yes | Article must be in Draft or Published state |
| Publish article | No | Yes | Yes | Yes | Article must be in Draft state (or re-publish after edit) |
| Create folder | No | Yes | Yes | Yes | Folder name unique within parent; non-empty; within length limits (Internal Context Section 8) |
| Delete article | No | Yes (own articles) | Yes | Yes | Cascade: deletes attached media. Ack records retained. (Internal Context Section 3) |
| Archive article | No | Yes (own articles) | Yes | Yes | Removes from reader visibility; retains in system |
| View ack reports (own Unit) | No | No | Yes | Yes | Unit-scoped analytics |
| View ack reports (all Units) | No | No | No | Yes | Org-wide analytics for Oksana |
| View own ack status | Yes | Yes | Yes | Yes | Employee sees their own pending/completed acknowledgements |
| Configure KB Location settings | No | No | Yes | Yes | Review cycle defaults, ack settings |
| Share article cross-Unit | No | No | Yes (propose) | Yes (approve) | Single article, multiple KB Location visibility flags -- not content duplication |
| Set article review date | No | Yes (as article owner) | Yes | Yes | Review date set at publication; owner notified on approach/expiry |
| Request right to erasure | Yes (for own data) | Yes | Yes | Yes | GDPR Art. 17; organization responds within 1 month; ack records likely exempt under Art. 17(3)(b) |

**Evidence:** Domain Facts 6 (authority boundaries); Internal Context Section 4 (publishing permission); Internal Context Section 8 (folder creation validation); Domain Facts 1.1 (GDPR right to erasure); Product Context (Unit-scoped permissions).

---

## 4. Temporal Model

| Pattern | Description | Frequency | Design implications |
|---|---|---|---|
| **Onboarding burst** | New employee joins -> must be familiarized with mandatory policies (Art. 29 KZpP) + receive role-specific KB content. Creates spike of article views and ack requests in first 1-5 days. | Per hire (continuous for growing companies) | KB must support pre-assignment of required articles before Day 1 (Functional Checklist E5: candidate-to-employee KB transition). Ack deadline tracking per employee. Integration with onboarding workflow. |
| **Policy change wave** | Policy updated -> new version published -> all affected employees must re-acknowledge. For 500-person company, creates 500 ack requests simultaneously. | Monthly (updates), quarterly (reviews), annually (handbook) | System must handle bulk ack operations. Reminder system for non-completers. Progress tracking (X of Y completed). Oksana dashboard shows acknowledgement wave status. |
| **Content review cycle** | Articles have review dates. Owner receives notification when review date approaches. Overdue articles flagged as stale. | Annual default; quarterly for compliance content | Review date set at publication. Approaching/overdue notifications to article owner. Stale content visible on Oksana's freshness dashboard. Configurable per KB Location. |
| **Regulatory change trigger** | Labor law change, GDPR enforcement action, or HQ policy change requires KB content update. | Unpredictable; 2-4 times/year for mid-market | Version management tracks which regulatory change prompted which content update. Re-ack workflow triggered by version change. |
| **Electronic labor book deadline (2026)** | Ukrainian employers must digitize labor records by June 10, 2026. Creates market-wide urgency for digital HR document management. | One-time event, June 2026 | Timing advantage for Employo's KB launch -- coincides with broader HR digitization push. |
| **Seasonal content patterns** | Annual handbook review (Jan-Feb), benefits enrollment (Oct-Nov), performance review policies (Q4/Q1), summer leave policies (May-Jun). | Annual cycle | Content review dates should align with seasonal patterns. Templates for common seasonal content. |

**Evidence:** Domain Facts 5 (temporal patterns); Domain Facts 1.4 (Art. 29 KZpP -- familiarization before work); Research Synthesis JTBD-5 (onboarding); Functional Checklist E5 (candidate-to-employee transition).

---

## 5. Rules and Constraints

### 5.1 Content rules

| Rule | Source | Enforced how | Exception |
|---|---|---|---|
| **Only one version Published at any time.** Previous versions retained as snapshots. | Domain Facts 2.1 | System: publishing new version automatically unpublishes previous | None -- this is absolute. Brief window during transition must be atomic. |
| **Every article must have an assigned owner.** Owner is responsible for accuracy, review, and updates. | Domain Facts 2.1 (content ownership) | System: owner = creator by default; ownership transferable | When owner leaves organization, ownership must be reassigned. System should flag unowned articles. |
| **Folder name must be unique within parent, non-empty, and within length limits.** | Internal Context Section 8 (folder validation rules) | System: validation on folder creation/rename | None |
| **Delete article = cascade delete all attached media.** | Internal Context Section 3 | System: cascade deletion | Acknowledgement records are NOT cascade-deleted -- they are retained. |
| **Edit article = attached files persist unless manually removed.** | Internal Context Section 3 | System: files remain on edit | Author can manually remove individual files. |
| **Content minimization: articles should not contain unnecessary personal data.** | Domain Facts 1.1 (GDPR Art. 5(1)(c) data minimization) | Convention: article templates guide authors. @Mentions create personal data that must be justified. | @Mentions are permitted but create GDPR obligations (right to erasure for mentioned employees). |
| **KB is a curated KB, not an open wiki.** Limited authors, formal publishing, editorial control. | Domain Facts 2.3 (KB vs. Wiki distinction) | System: only users with edit permission can create/publish. Readers cannot edit. | HR-admin content (playbooks, checklists) may have more collaborative editing within the HR team, leaning wiki-like. |

### 5.2 Acknowledgement rules

| Rule | Source | Enforced how | Exception |
|---|---|---|---|
| **Acknowledgement is NOT consent.** Employees cannot "opt out" of policy acknowledgement. | Domain Facts 2.2 | System: no "I disagree" option. Default text: "I have read and understood." | If level 3 ("I agree to comply") is used, employee refusal should be logged, not blocked. |
| **Re-ack triggered on version change, NOT revision change.** | Domain Facts 2.1 (version vs. revision); Domain Facts 2.2 (re-ack rules) | System: author chooses "Publish as new version" to trigger re-ack | Author can publish new version without triggering re-ack (e.g., if change is version-level but not ack-relevant). |
| **Ack record is immutable.** Once recorded, cannot be edited or deleted. | Domain Facts 2.2 (tamper-proof) | System: append-only ack records. No edit/delete API. | GDPR right to erasure may require deletion in edge cases, but Art. 17(3)(b) legal obligation exception likely protects most ack records. |
| **Minimum ack metadata: employee ID, article version, timestamp, ack type.** | Domain Facts 2.2 | System: automatic capture on acknowledgement action | IP address is optional and creates additional GDPR obligations. |
| **Retention: employment duration + statute of limitations (3-6 years).** | Domain Facts 1.2 | System: configurable retention period per customer. Auto-deletion or archival after expiry. | Customer may set shorter or longer periods based on jurisdiction. |

### 5.3 Permission rules

| Rule | Source | Enforced how | Exception |
|---|---|---|---|
| **KB content visibility inherits from Unit membership.** Employee in Unit A sees Unit A's KB Location. Employee NOT in Unit A does not. | Product Context (Unit architecture); Functional Checklist E1, E2 | System: article visibility filtered by user's Unit membership at query time | Cross-Unit sharing: an article can be explicitly shared to additional KB Locations (not duplicated -- single source with multi-Unit visibility flags). |
| **Cross-Unit content sharing requires explicit action.** Content is Unit-scoped by default. | Domain Facts 3.2 (cross-Unit content sharing) | System: sharing is opt-in, not automatic. Source Unit retains ownership. | Company-wide policies (published from parent Unit) should be inheritable by child Units. This is the content inheritance pattern (Domain Facts 2.3). |
| **Parent Unit content is visible to child Units by default.** A company-wide policy published from the top-level Unit should be visible to all sub-Units. | Domain Facts 2.3 (content inheritance in multi-unit architectures) | System: inheritance follows Unit hierarchy. Sub-Units can have overriding versions. | Override creates complexity: sub-Unit's version takes precedence. Ack tracking must distinguish which version each employee saw. |
| **Permission-aware search.** Search results filtered by user's Unit membership. | Domain Facts 3.1 (RAG architecture: permission-aware retrieval) | System: search query includes user's Unit context as filter. Must work for keyword search (iteration 1) and future semantic search (iteration 2). | Org Admin sees search results across all Units. |

### 5.4 Regulatory rules

| Rule | Source | Enforced how | Exception |
|---|---|---|---|
| **GDPR: Legitimate interest, not consent, for policy distribution.** | Domain Facts 1.1 | Documentation: Employo documents LIA (Legitimate Interest Assessment) for KB processing. No consent collection UI needed. | If a customer's legal counsel requires consent for specific content types, the system should not prevent it -- but it should not be the default. |
| **GDPR: KB content and ack records stored in EU datacenters.** | Domain Facts 1.1 (EU data residency) | Infrastructure: Employo's Frankfurt architecture satisfies this by default. | Non-EU customers may have different requirements. Architecture should support configurable data residency. |
| **KZpP Art. 29: Familiarize employees with internal rules before work begins.** | Domain Facts 1.4 | System: supports pre-Day-1 article assignment via onboarding integration. Ack recorded per employee per article version. | Hazardous conditions content requires signature-level ack (QES/Diia.Signature). This is iteration 2+. |
| **EU AI Act Art. 50: AI responses must disclose AI involvement (from Aug 2026).** | Domain Facts 1.3 | System: iteration 2 AI chatbot must label responses as "AI-generated." | Iteration 1 has no AI chatbot -- not applicable yet. But architecture must support this from day 1. |
| **RAG-ready content structure from day 1.** | Domain Facts 3.1 (structured metadata mandatory for RAG) | System: article metadata schema designed for iteration 2 consumption. Semantic HTML output from editor. | Not a regulatory rule but an architectural constraint with iteration 2 dependency. |

---

## 6. Structural Tensions

These are modeling decisions that cannot be resolved by evidence alone -- they require PM judgment. Each tension is surfaced with options, trade-offs, and relevant evidence. **No recommendations are made** -- this is the landscape-mapper's map, not a proposal.

### Tension 1: Folder hierarchy (deep, flexible) vs. Categories (flat, simple)

| Dimension | Detail |
|---|---|
| **The tension** | How should articles be organized within a KB Location? The colleague's notes analyzed two models and preferred the simpler one. |
| **Option A: Folder hierarchy (2-3 levels)** | Folder > Subfolder > Article. Flexible nesting. Supports complex organizations. BambooHR uses 4 levels. Colleague's Example 1: "nice, but looks complicated." |
| **Option B: Flat categories + articles** | Category > Article. One level of organization. Simpler navigation. PeopleForce uses this. Colleague's Example 2: "nice and looks easier." |
| **Option C: Colleague's hybrid** | KB Location (Unit-scoped) > Folder (level 1) > Subfolder (level 2, MUST) > Nested subfolder (level 3, COULD) > Article. Unit scoping at the container level, 2-level nesting within. |
| **Trade-offs** | Deep hierarchy: more organizational power, harder to navigate, more permissions complexity. Flat categories: simpler UX, but may not accommodate large content volumes. Hybrid: balances both but adds implementation complexity. |
| **Affected entity** | Folder (E3) -- its depth and relationship to KB Location |
| **Evidence** | Internal Context Section 6 (both models described, colleague preferred Option C); Competitor Analysis (BambooHR 4 levels, PeopleForce flat categories, Freshservice 3-6 levels); User Mental Model 1.1 (Andrii never browses folders -- search-first); User Mental Model 1.2 (Maryna wants flexible organization) |
| **What problem-framer needs to know** | Andrii does not care (he searches, not browses). Maryna cares (she organizes). Dmytro does not care (he searches). Oksana does not care (she views dashboards). The folder structure serves the Author persona primarily. |

### Tension 2: "Space" naming collision

| Dimension | Detail |
|---|---|
| **The tension** | Employo uses "Space" for top-level organizational containers (multi-Space architecture). The KB needs Unit-scoped content containers. Using "Space" for both creates ambiguity. |
| **Option A: "KB Space"** | Disambiguate with prefix. "Create a new KB Space" vs. "Switch to another Space." Pro: familiar (Confluence uses Spaces). Con: still confusing -- two kinds of Spaces. |
| **Option B: "Library"** | Each Unit gets a "Library." "Open the Engineering Library." Pro: distinct, intuitive. Con: "Library" often implies books/documents, not articles. |
| **Option C: "Knowledge Area"** | Each Unit gets a "Knowledge Area." Pro: descriptive. Con: verbose. "Open the Engineering Knowledge Area" is long. |
| **Option D: "KB Section"** | Neutral term. Pro: simple. Con: "Section" is generic, may conflict with other UI elements. |
| **Option E: Keep "Space" and rely on context** | "Knowledge Base > HRM Space" vs. "Switch Space > Develux." Pro: no new terminology. Con: cognitive load for power users who manage both. |
| **Affected entity** | KB Location (E2) -- its display name and terminology throughout UI, docs, API |
| **Evidence** | Domain Facts 7 ("Space" terminology collision -- OPEN); Product Context (Space = top-level container); Internal Context Section 5 (colleague used "space"); Competitor precedent: Confluence = Spaces, Notion = Workspaces, Guru = Collections |

### Tension 3: Version = new ack required vs. Revision = no ack

| Dimension | Detail |
|---|---|
| **The tension** | When an author edits an article, when does the system trigger re-acknowledgement? The domain has a clear conceptual distinction (version vs. revision) but the boundary is ambiguous in practice. |
| **Option A: Author-controlled** | Author explicitly chooses "Publish as new version" (triggers re-ack) vs. "Save edit" (revision, no re-ack). Simpler to implement. Relies on human judgment. Used by Helpjuice, Document360, KnowledgeOwl. |
| **Option B: System-determined** | System analyzes change magnitude (word count delta, structural change, key term changes) and auto-classifies as version or revision. More consistent but harder to implement. Risk of false positives (trivial edit classified as version). |
| **Option C: Author-controlled with system suggestion** | System suggests "This looks like a major change -- publish as new version?" but author decides. Balances consistency with simplicity. |
| **Trade-offs** | Option A: risk of authors never triggering re-ack (compliance gap) or always triggering it (ack fatigue). Option B: risk of false positives. Option C: adds UI complexity. |
| **Affected entities** | Article Version (E5), Acknowledgement Record (E7) |
| **Evidence** | Domain Facts 2.1 (version vs. revision distinction); Domain Facts 8, Q6 (open question: author-controlled or system-determined?); Competitor Analysis: Rippling auto re-sends on update, Trainual has re-ack trigger -- both are author-initiated |

### Tension 4: Unit-inherited permissions vs. explicit KB permissions

| Dimension | Detail |
|---|---|
| **The tension** | Should KB permissions be 100% derived from Employo's existing Unit permissions, or should KB have its own permission layer? |
| **Option A: Pure inheritance** | KB visibility = Unit membership. KB editing = Unit edit permission. No KB-specific permissions. Simplest model. Matches colleague's recommendation and Product Context (permission-consistent). |
| **Option B: KB permissions as extension** | Inherit Unit permissions as default, but allow KB-specific overrides (e.g., grant Author role to a non-Unit-admin for specific KB content). More flexible. Adds complexity. |
| **Option C: Separate KB permissions** | KB has its own permission model independent of Unit permissions. Maximum flexibility. Maximum complexity. Contradicts Employo's "permissions plug in, not reinvent" principle. |
| **Trade-offs** | Option A: simple, consistent, but inflexible (can't grant KB authoring without granting Unit edit access). Option B: flexible, but adds a permissions layer to maintain. Option C: maximally flexible, but contradicts Employo architecture and creates maintenance burden. |
| **Affected entities** | User Role in KB context (E9), KB Location (E2) |
| **Evidence** | Product Context Differentiator 2 (enterprise-grade permissions, Unit-scoped); Internal Context Section 4 (edit permission = publish permission); Functional Checklist E2 (Unit-inherited permissions); Domain Facts 6 (authority boundaries) |

### Tension 5: Cross-Unit content sharing model

| Dimension | Detail |
|---|---|
| **The tension** | When content must be visible across multiple Units (company-wide policy), how is this modeled? |
| **Option A: Content inheritance from parent Unit** | Parent Unit publishes company-wide article. Child Units automatically see it. Sub-Unit can have an overriding local version. Single source of truth with hierarchical inheritance. |
| **Option B: Explicit cross-Unit sharing** | Author explicitly shares an article with additional KB Locations. No hierarchy -- any Unit can share to any other. Single article with multi-Unit visibility flags. |
| **Option C: "Company" KB Location** | A special KB Location that is not tied to any Unit but visible to all employees. Company-wide policies live here. Unit-specific policies live in Unit KB Locations. |
| **Trade-offs** | Option A: natural for hierarchical orgs but complex (what happens when parent updates and child has override?). Option B: flexible but manual (HR admin must explicitly share each article). Option C: simple but introduces a non-Unit entity (breaks the "everything is Unit-scoped" model). |
| **Affected entities** | KB Location (E2), Article (E4) |
| **Evidence** | Domain Facts 2.3 (content inheritance: parent publishes, child inherits); Domain Facts 3.2 (cross-Unit sharing requires explicit permissions, single source of truth); Internal Context Section 5 (colleague analyzed 3 decentralization approaches) |

### Tension 6: Content type taxonomy -- structured or freeform?

| Dimension | Detail |
|---|---|
| **The tension** | Should articles have a mandatory content type (policy, playbook, checklist, FAQ, how-to) or should this be freeform/tag-based? |
| **Option A: Structured content types** | Article must be assigned a type from a predefined list. Enables type-specific templates, type-based search filtering, and type-aware analytics. |
| **Option B: Freeform tags** | Article has optional tags. No enforced taxonomy. More flexible. Tags are user-defined. |
| **Option C: Structured types + freeform tags** | Mandatory type (from predefined list) + optional tags. Combines structure with flexibility. |
| **Trade-offs** | Option A: enables richer features (templates per type, analytics by type) but may feel restrictive. Option B: maximum flexibility but loses structural benefits. Option C: best of both but more UI complexity. |
| **Affected entity** | Article (E4) -- content_type attribute |
| **Evidence** | User Signals 5.3 (HR admin content types: policies, playbooks, templates, checklists, FAQ, how-to); User Mental Model 1.2 (Maryna organizes by content type); Market Landscape use case taxonomy (#1-8); Competitor approaches: Kenjo uses tags, PeopleForce uses categories, Trainual uses Subject > Topic > Step hierarchy |

### Tension 7: Article-level ack vs. section-level ack

| Dimension | Detail |
|---|---|
| **The tension** | Should acknowledgement be at the article level (entire article) or at the section level (specific sections within a long article)? |
| **Option A: Article-level ack (entire article)** | Employee acknowledges the whole article. Simpler. One ack record per employee per article version. |
| **Option B: Section-level ack** | Long policy articles may have sections. Employee could acknowledge individual sections (e.g., "Safety procedures" section of the Company Handbook). Finer granularity but much more complex. |
| **Trade-offs** | Option A: simpler implementation, simpler UX, simpler audit trail. Option B: more granular tracking, but significantly more complex (section = versioned entity? section-level ack records?). |
| **Recommendation evidence** | All 14/23 competitors with acknowledgement use document-level or article-level ack. None use section-level. Domain Facts 2.2 describes minimum metadata at article level. Article-level is the market standard. Section-level would be an Employo innovation with no precedent. |
| **Affected entities** | Acknowledgement Record (E7), Article (E4) |

### Tension 8: HR-admin KB (internal) vs. Employee KB (employee-facing) -- single system or dual?

| Dimension | Detail |
|---|---|
| **The tension** | PM described two audiences: employee-facing KB (policies, FAQ) and HR-admin KB (playbooks, templates, checklists). Should these be one system with audience-based visibility, or two separate systems? |
| **Option A: Single KB with audience-based content** | One KB system. Some articles are employee-facing, some are HR-only. Visibility controlled by permissions (HR-only KB Location, or HR-only folder). Simpler architecture. |
| **Option B: Dual KB systems** | Separate "Employee KB" and "HR Playbook" systems with different UIs, different navigation, different content models. More tailored UX per audience but more to build and maintain. |
| **Option C: Single system, multiple KB Locations** | HR team has their own KB Location (scoped to HR Unit) that is invisible to non-HR employees. Employee-facing content lives in per-Unit KB Locations visible to all. This naturally flows from Unit-scoped architecture. |
| **Trade-offs** | Option A and C are architecturally identical -- the Unit model handles it. Option B creates two products to maintain. The PM's "two-part" description is a use-case distinction, not an architecture requirement. |
| **Affected entity** | KB Location (E2), KB Root (E1) |
| **Evidence** | Discovery Intake: PM described "two-part" scope (employee-facing + HR-admin). Domain Facts 2.3 (KB vs. Wiki: employee-facing KB is curated; HR-admin content may lean wiki-like). Product Context (Unit architecture handles audience scoping naturally). |

---

## 7. How Competitors Model Key Structures (Comparison)

### 7.1 Container hierarchy comparison

| Competitor | Level 0 | Level 1 | Level 2 | Level 3+ | Scoping mechanism |
|---|---|---|---|---|---|
| **PeopleForce** | Knowledge Base | Category | Subcategory | -- | Department targeting (manual per article) |
| **BambooHR** | Company Files | Folder | Subfolder | Subfolder (4 levels) | Folder permissions (padlock) |
| **Sloneek** | Company Wiki | Category | -- | -- | Permissions (unspecified) |
| **Kenjo** | Smart Docs | (flat) | -- | -- | Tags (department/group) |
| **Trainual** | Library | Subject | Topic | Step | Role/team/location assignment |
| **Confluence** | Site | Space | Page | Child page (unlimited) | Space + page permissions |
| **Notion** | Workspace | Page | Subpage | Subpage (unlimited) | Manual permissions |
| **Guru** | Platform | Collection | Board | Card | Permission inheritance |
| **Employo (proposed)** | Knowledge Base | KB Location (Unit) | Folder | Subfolder (2 levels) | Unit membership (automatic) |

**Observation:** Employo's proposed model is unique in two ways: (1) the scoping container (KB Location) is tied to organizational structure (Unit), not manual permissions; (2) the scoping is automatic (Unit membership determines visibility), not configured per-article.

### 7.2 Acknowledgement model comparison

| Competitor | Ack on what | Ack type | Re-ack on update | Tracking | Reminders |
|---|---|---|---|---|---|
| **BambooHR** | Uploaded PDF | E-signature | Manual re-send | Status reports | Via workflows |
| **HiBob** | Uploaded doc | Read approval OR e-signature | Not documented | Requests area | Not documented |
| **Kenjo** | Uploaded doc | "I confirm I have read" (lightweight) | Not documented | Read status + export | Yes (to non-readers) |
| **Breathe HR** | Uploaded doc | "Read and understood" (lightweight) | Not documented | Read tracking | Yes (read reminders) |
| **Rippling** | Uploaded policy | E-signature | Auto re-send on update | Who has/hasn't signed | Via Workflow Automator |
| **Trainual** | Authored content (Step) | Ack + e-sig + completion | Yes (re-ack on content update) | Completion percentages | Dynamic assignment |
| **Employo (proposed)** | Authored KB article | "I have read and understood" (level 2) | Yes (on new version, author-triggered) | Per-employee per-version per-Unit | Configurable reminders |

**Observation:** Employo's proposed model is closest to Trainual's (acknowledgement on authored content with re-ack) but embedded in an HRIS with Unit-scoped tracking. The key differentiators vs. all competitors: (1) ack on structured articles (not uploaded PDFs), (2) Unit-scoped tracking, (3) version-specific ack records.

---

## 8. Employo-Specific Modeling Decisions (Surfaced as Questions)

These are decisions that flow from Employo's unique architecture and must be resolved before problem framing.

| # | Decision | Options | Dependencies | Who decides |
|---|---|---|---|---|
| 1 | **KB Location = 1:1 with Unit, or 1:N?** | (a) Each Unit gets exactly one KB Location. (b) A Unit can have multiple KB Locations (e.g., "Engineering KB" + "Engineering Legal KB"). | Affects permissions model (Option a: simpler; Option b: more flexible). | PM |
| 2 | **Company-wide content: parent Unit inheritance or special "All" location?** | (a) Parent Unit publishes, child Units inherit automatically. (b) Dedicated "Company" KB Location visible to all. (c) Author explicitly shares to all Units. | Affects content governance (who controls company-wide content?). Option (a) requires clear Unit hierarchy. | PM + Oksana |
| 3 | **Articles outside folders: allowed or required to be in a folder?** | (a) Articles can exist directly in a KB Location (no folder). (b) Articles must be in a folder. | Option (a): simpler for small content sets. Option (b): enforces organization from day 1. | PM / UX |
| 4 | **What term replaces "Space" for KB Location?** | Library, Knowledge Area, KB Section, KB Space, or keep "Space." | Affects all UI labels, documentation, API naming. | PM / UX (Domain Facts 8, Q7) |
| 5 | **Default acknowledgement level?** | (a) Level 2: "I have read and understood" (standard). (b) Configurable per article. (c) Configurable per KB Location. | Level 2 is the domain default (Domain Facts 2.2). Level 3 ("I agree to comply") is optional for high-stakes policies. | PM + Legal counsel |
| 6 | **Version vs. revision: author-controlled or system-suggested?** | See Tension 3 above. | Affects re-ack trigger reliability. | PM (Domain Facts 8, Q6) |
| 7 | **Content review cycle: global default or per-KB-Location?** | (a) Global default (12 months) with per-article override. (b) Per-KB-Location default with per-article override. | Compliance-heavy Units (Legal) may need shorter cycles than general Units. | PM / Oksana |
| 8 | **Ack records: visible to the employee or HR-only?** | (a) Employee can see their own ack history ("I acknowledged Expense Policy v2.0 on 2026-03-15"). (b) Ack records are HR/admin-only. | Option (a) supports employee self-service and transparency. Option (b) is simpler but less empowering. | PM / UX |

---

## 9. Research Notes

### Built from

1. **Domain Facts v1.0** -- regulatory requirements (GDPR, KZpP, EU AI Act), business rules (lifecycle, acknowledgement, organization), technical constraints (RAG, search, Unit-scoping), terminology
2. **User Mental Model v1.0** -- how personas categorize, terminology gaps, expectations, assumptions, tensions
3. **Competitor Analysis v2.0** -- 23 products, architecture patterns (A through F), feature matrix, gap analysis
4. **Market Landscape v1.1** -- archetypes, trends, segmentation, functional components enrichment (93 components)
5. **Research Synthesis v1.0** -- JTBD map, pain clusters, patterns, competitive signals
6. **Internal Context v1.0** -- colleague's UX research notes (hierarchy models, decentralization approaches, publishing workflow, file storage rules)
7. **Functional Components Checklist v1.2** -- 93 components across 8 layers, Employo-specific components (E1-E12)
8. **Product Context** -- Unit architecture, permissions, personas, wedges, terminology
9. **Product Cluster Registry** -- cluster structure, cross-cluster dependencies

### Confidence assessment

**Overall confidence: MEDIUM-HIGH**

**Supporting factors:**
- Entity model grounded in domain facts with regulatory backing (GDPR, KZpP)
- Lifecycle patterns validated across multiple KB platform documentation sources (Microsoft, Salesforce, PHPKB, ServiceNow)
- Authority model flows directly from Employo's existing permission architecture (not invented)
- Competitor comparison covers 23 products across 7 container/content models
- 93-component functional decomposition ensures no capability area is missed
- Colleague's internal notes provide product-level architecture preferences

**Limiting factors:**
- **No user interviews.** Entity names, lifecycle expectations, and authority assumptions have not been validated with actual users.
- **Content volume unknown.** We do not know how many articles a typical Employo customer would maintain (Domain Facts 8, Q5). This affects whether the hierarchy model is adequate.
- **Cross-Unit sharing model is theoretical.** No competitor has Unit-scoped content to study. Employo's sharing model is novel and untested.
- **Re-ack behavior is modeled but not validated.** How employees will respond to re-ack requests (compliance fatigue? timely completion?) is unknown without user research.

### Open questions for problem-framer

1. Is the 2-level folder nesting sufficient for the largest expected content sets, or will customers need 3+ levels?
2. Should the "In Review" state (approval workflow) be included in iteration 1 scope, or is Author = Publisher acceptable?
3. How should the system handle Unit restructuring (merge, split, delete) and its impact on KB content and ack records?
4. Should KB analytics (Layer 7) be a separate dashboard or integrated into Employo's existing analytics/reporting module?
5. What is the migration path from Notion/Confluence -- is bulk import (CSV) sufficient, or is richer import needed?
