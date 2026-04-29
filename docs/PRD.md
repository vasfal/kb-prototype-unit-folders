# Knowledge Base — Product Requirements Document

**Module:** Knowledge Base (KB)  
**Platform:** HRM SaaS Platform  
**Version:** MVP (Pre-Alpha)  
**Author:** Lead Product Designer  
**Date:** March 30, 2026  
**Status:** Final — ready for engineering and prototyping  

---

## Table of contents

1. Product overview
2. Strategic context
3. Architecture decisions
4. Navigation and placement
5. Information architecture: folders and articles
6. Visibility model
7. Permission model
8. Article lifecycle
9. Folder management
10. Article management
11. Article editor
12. Media and attachments
13. Empty states
14. Validation rules and error messages
15. Data model
16. Screen inventory
17. UX specifications per screen
18. Future scope (not in MVP)

---

## 1. Product overview

### What we're building

A native Knowledge Base module inside the HRM platform that allows organizations to create, structure, and manage internal knowledge articles scoped to Business Units. Articles support rich text editing, file attachments, draft/publish/archive lifecycle, and cross-unit visibility controls.

### Why it matters

No major HRM/HRIS competitor (BambooHR, Personio, HiBob, Workday, SAP SuccessFactors, Factorial, Sage HR) offers a native, structured Knowledge Base. They either provide basic document storage (file uploads into folders) or require customers to purchase and integrate a separate tool (Confluence, Guru, Notion, Tettra). A unit-aware KB with inherited permissions is a genuine product differentiator.

### Target personas

| Persona | Role in KB | Typical actions |
|---|---|---|
| KB Editor / Admin | Creates and manages KB content for their unit | Create folders, write articles, publish, archive, set visibility |
| Employee (Viewer) | Consumes knowledge articles | Browse folders, read published articles, follow links |
| Newcomer | New employee during onboarding | Reads onboarding guides, policies, setup instructions |
| System Admin | Platform-level administrator | Has edit access to all KB spaces across all units |

### Product goals

- Fast knowledge discovery within unit context
- Structured documentation with folder hierarchy
- Controlled access through inherited unit permissions
- Content lifecycle management (draft, publish, archive)
- Scalable content architecture that grows with the organization

---

## 2. Strategic context

### Competitive landscape: HR systems

| HR System | KB capability | Limitation |
|---|---|---|
| BambooHR | Document Management tab — file uploads with folders (4 levels). No article authoring. | Documents are employee-record-scoped. No rich text, no wiki, no article concept. |
| Personio | Document storage for contracts and policies (file uploads). HR Helpdesk for Q&A. | No content creation. Static files, not living articles. |
| SAP SuccessFactors | No internal KB. Uses ServiceNow HRSD integration for knowledge delivery. | Knowledge management is outsourced. Complex, expensive. |
| Workday | No built-in KB. Relies on ServiceNow or Confluence integrations. | Same bolt-on pattern. |
| HiBob | Social feed, document storage. Integrates with Guru. | No structured KB. No article authoring. |
| Factorial | Document management with folders. | File-based only. No rich text articles. |

### Competitive landscape: dedicated KB tools

| Tool | Key pattern we adopt | Key pattern we avoid |
|---|---|---|
| Confluence | Space-per-team model, page-level restrictions | Additive permissions (most permissive wins) — too confusing |
| Notion | Block-based editor, clean UI | Infinite nesting, no lifecycle management, weak permissions |
| Guru | Scheduled content verification, flat cards | Too flat for structured documentation |
| ServiceNow KB | KB-per-department, audience-segmented answers | Over-engineered for our scale |

---

## 3. Architecture decisions

### 3.1 KB is scoped to Business Units

Each Business Unit in the platform has its own KB space. KB content is owned by the unit that created it. This follows the established platform pattern where modules (Team, People management, Recruitment, Jobs) live inside the selected unit context.

**Rationale:** The unit is already the primary organizational and navigational boundary. Users select a unit, then see unit-scoped content. KB follows this pattern exactly.

### 3.2 Folders are owned by one unit, never inherited

Each unit maintains its own independent folder tree. Sub-units do NOT automatically get parent unit folders replicated. There is no "shared folder that multiple units can write into."

Cross-unit content sharing is handled through the visibility model (section 6), not through folder inheritance.

### 3.3 Folder nesting: 2 levels maximum

The hierarchy is: Folder → Sub-folder → Article. No deeper nesting.

**Rationale:** Analysis of real HR content patterns (policies, onboarding, handbooks, process docs) shows that 2 levels covers 95%+ of organizational needs. Deeper nesting creates the "Notion effect" — content that nobody can find. BambooHR supports 4 levels but most customers use 1-2.

### 3.4 Articles must live inside folders

No root-level (orphan) articles. Every article belongs to a folder. This enforces organizational discipline from the start.

### 3.5 Archive instead of hard delete

All content removal uses Archive status. Archived content is hidden from active views but preserved in the system. Editors can restore archived content. No hard delete in MVP.

### 3.6 Draft status included in MVP

New articles start as Draft. Publishing requires explicit action. This prevents half-written content from being visible to viewers.

### 3.7 Entity ownership follows platform pattern

All entities (folders, articles) have `owner`, `created_by`, `created_at`, `updated_by`, `updated_at`. Owner is creator by default but can be reassigned. This matches existing platform conventions.

---

## 4. Navigation and placement

### 4.1 Tab placement

KB appears as a tab in the unit's top tab bar, alongside existing tabs:

```
Team | People management | Recruitment | Jobs | KB
```

**Tab label:** "KB" — short, fits the tab bar rhythm, universally understood. The full name "Knowledge base" appears as the page heading inside the tab content area.

### 4.2 Breadcrumb structure

Always visible at the top of the content area:

```
Unit name > Knowledge base > Folder name > Sub-folder name > Article title
```

Clicking any breadcrumb segment navigates to that level.

### 4.3 Page structure inside KB tab

```
┌─────────────────────────────────────────────────────────────┐
│  Breadcrumb: Develux > Employo > Knowledge base             │
│                                                             │
│  ┌──────────────┐  ┌────────────────────────────────────┐   │
│  │ Folder tree  │  │ Main content area                  │   │
│  │              │  │                                    │   │
│  │ OWN FOLDERS  │  │ (folder contents / article view /  │   │
│  │ ▾ Dev handbook│  │  article editor / empty state)    │   │
│  │   Getting... │  │                                    │   │
│  │   Tools...   │  │                                    │   │
│  │ ▸ QA process │  │                                    │   │
│  │              │  │                                    │   │
│  │ ─────────── │  │                                    │   │
│  │ SHARED       │  │                                    │   │
│  │ ▸ Onboarding │  │                                    │   │
│  │   Develux    │  │                                    │   │
│  │ ▸ Policies   │  │                                    │   │
│  │   Develux    │  │                                    │   │
│  └──────────────┘  └────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 4.4 "Show sub-units" toggle

When the "Show sub-units" toggle is ON (existing platform control in the top-right area), the article list in the main content area includes articles from sub-units. Sub-unit articles appear with:
- A "Unit" column showing the source unit name
- A subtle background tint to distinguish them from current unit's own articles

This follows the exact pattern established in the Jobs tab (visible in existing UI). The sidebar folder tree does NOT change — it continues showing only the current unit's own folders and shared folders.

---

## 5. Information architecture: folders and articles

### 5.1 Folder tree — two sections

The KB sidebar folder tree is divided into two sections:

**Section 1: Own folders (top)**
- Folders created by and owned by the current unit
- Fully editable: create, rename, move, archive, create articles inside
- Displayed with standard folder icons
- Context menu shows all CRUD actions

**Section 2: Shared with you (bottom, below divider)**
- Folders from other units whose visibility includes the current unit
- Read-only: user can browse and read articles but cannot create, edit, move, or delete
- Displayed with a subtle visual treatment (lighter text, dashed border, or muted icon)
- Each folder shows the source unit name as a small label (e.g., "Develux")
- No context menu for management actions
- Only published articles are visible in shared folders (no drafts)

### 5.2 Folder hierarchy

```
KB (unit-level container, not a visible entity)
├── Folder (level 1) — top-level section
│   ├── Sub-folder (level 2) — one level of nesting
│   │   ├── Article
│   │   └── Article
│   └── Article
├── Folder (level 1)
│   └── Article
└── ...
```

### 5.3 Folder ordering

Folders within the same parent are displayed in alphabetical order. If folders use numeric prefixes in their names (e.g., "01. Getting started", "02. Tools"), they are ordered by those prefixes.

Future scope: manual drag-and-drop reordering.

### 5.4 Article placement

Articles can exist at any folder level (inside a top-level folder or inside a sub-folder). Articles cannot exist at the KB root level — they must be inside a folder.

---

## 6. Visibility model

### 6.1 Visibility property

Both folders and articles have a `visibility` property that controls which units can discover and view the content.

| Visibility level | Behavior | Use case |
|---|---|---|
| **Unit & sub-units** (default) | Visible to the owning unit and all its direct and indirect sub-units. Parent units cannot see it unless they navigate to the child unit. | Unit-specific content that should cascade down. E.g., department handbook. |
| **All units** | Visible to every unit in the company space. Appears in the "Shared with you" section of every unit's KB. | Company-wide policies, benefits info, general onboarding. |
| **Current unit only** | Visible only to the owning unit. Sub-units and parent units cannot see it. | Sensitive unit-internal content. E.g., HR investigation procedures. |

### 6.2 Visibility inheritance rules

- Articles inherit their folder's visibility by default when created
- An article's visibility can be changed by an editor to be **more restrictive** than its folder, but never **more permissive**
  - Folder is "All units" → article can be "All units", "Unit & sub-units", or "Current unit only"
  - Folder is "Unit & sub-units" → article can be "Unit & sub-units" or "Current unit only"
  - Folder is "Current unit only" → article can only be "Current unit only"
- Changing a folder's visibility does NOT retroactively change its articles' visibility. Existing articles keep their current setting. New articles inherit the folder's current visibility.

### 6.3 Visibility and "Shared with you"

A folder appears in another unit's "Shared with you" section if:
1. The folder's visibility includes that unit, AND
2. The folder contains at least one published article whose visibility also includes that unit

Empty shared folders (no published articles visible to the viewing unit) are not shown.

### 6.4 Visibility interaction with permissions

A user must have BOTH:
- Visibility access (the content's visibility includes their unit), AND
- At least View permission on the KB of the unit that owns the content

If either condition fails, the content is not shown.

---

## 7. Permission model

### 7.1 KB permission levels

KB introduces one new permission type to the existing unit permission system:

| Level | See KB tab | Read published articles | See drafts | Create/edit/publish articles | Manage folders | Archive/restore |
|---|---|---|---|---|---|---|
| **None** | No | No | No | No | No | No |
| **View** | Yes | Yes | No | No | No | No |
| **Edit** | Yes | Yes | Yes | Yes | Yes | Yes |

### 7.2 Permission assignment

- Permissions are assigned at the unit level through existing Unit Settings
- KB permission is a new field added to the unit permission configuration
- Permissions follow existing unit permission inheritance patterns:
  - System Admin → Edit access on all KB spaces everywhere
  - Unit Admin → Edit access on their unit's KB
  - Other users → based on their assigned KB permission level for that unit

### 7.3 Permission resolution for shared content

When a user views content from another unit (via "Shared with you"):
- Their permission on the **owning unit's** KB determines what they can do
- Typically they have View permission on the parent/sibling unit, which means read-only
- Edit permission on another unit's KB would allow editing that unit's articles (admin scenario)

### 7.4 Permission scope for MVP

- Unit-level KB permissions only
- No folder-level permission overrides
- No article-level permission overrides
- No separate "Commenter" role

---

## 8. Article lifecycle

### 8.1 Status definitions

| Status | Visible to viewers | Visible to editors | Editable | In sidebar/search | Can transition to |
|---|---|---|---|---|---|
| **Draft** | No | Yes, marked with "Draft" badge | Yes | Yes (editors only, with badge) | Published |
| **Published** | Yes | Yes | Yes (edit in-place) | Yes | Draft (unpublish), Archived |
| **Archived** | No | Yes (in archive filter/section) | No (must restore first) | Hidden from main nav. Visible when "Show archived" filter is active. | Draft (restore) |

### 8.2 Status transitions

```
[Create new article] → Draft
Draft → Published (action: "Publish")
Published → Draft (action: "Unpublish" / "Revert to draft")
Published → Archived (action: "Archive")
Archived → Draft (action: "Restore")
```

### 8.3 Publish validation

An article can only be published if:
- Title is not empty
- Content is not empty (contains at least one non-whitespace character)

If validation fails, the system displays an inline error message and prevents publishing.

### 8.4 Edit behavior

- Editing a published article updates it in-place. There is no separate "draft of a published article" concept in MVP.
- While editing, the article remains published and visible to viewers with its last-saved content.
- The editor sees unsaved changes. Navigating away triggers an "unsaved changes" warning.

---

## 9. Folder management

### 9.1 Create folder

**Access:** Editors only. Viewers do not see the "Create folder" action.

**Entry points:**
- "+" button or "Create folder" action in the sidebar header
- Context menu on an existing folder → "Create sub-folder" (only if depth limit allows)

**Flow:**
1. User triggers "Create folder" action
2. Inline input appears in the sidebar tree at the target location (or a small dialog)
3. User enters folder name
4. User clicks "Create" or presses Enter
5. System validates:
   - Name is not empty
   - Name is unique within the same parent folder in this unit
   - Name does not exceed 100 characters
   - Depth limit not exceeded (max 2 levels: folder → sub-folder)
6. If valid → folder is created with default visibility (Unit & sub-units)
7. Success notification appears briefly

**Validation messages:**
- "Folder name cannot be empty."
- "A folder with this name already exists in this location."
- "Folder name is too long (max 100 characters)."
- "Maximum folder depth reached. You cannot create a sub-folder here."

### 9.2 Rename folder

**Access:** Editors only.

**Flow:**
1. User selects "Rename" from folder context menu
2. Folder name becomes editable inline
3. User edits the name and confirms (Enter or click away)
4. System validates same rules as create (non-empty, unique, length)
5. If valid → name is updated
6. Success notification

### 9.3 Move folder

**Access:** Editors only. MVP scope: move within the same unit only.

**Flow:**
1. User selects "Move" from folder context menu
2. A tree picker dialog appears showing the current unit's folder structure
3. User selects a destination (root level or inside another folder, respecting depth limit)
4. System validates:
   - Folder cannot be moved into itself
   - Folder cannot be moved into one of its own sub-folders
   - Destination exists
   - Move would not exceed depth limit
5. If valid → folder moves with all its contents (sub-folders and articles)
6. Success notification

### 9.4 Archive folder

**Access:** Editors only.

**Behavior:**
- The folder and ALL its contents (articles, sub-folders, articles in sub-folders) are archived together
- Archived folders disappear from the active sidebar tree
- Archived folders are accessible through "Show archived" filter (editors only)
- Archived content can be restored

**Flow:**
1. User selects "Archive" from folder context menu
2. Confirmation dialog appears:
   - "Archiving this folder will also archive all articles and sub-folders inside it. You can restore them later. Are you sure?"
   - If folder contains N articles and M sub-folders, show counts: "This folder contains N articles and M sub-folders."
3. User confirms
4. System archives the folder and all contents
5. Success notification

### 9.5 Restore folder

**Access:** Editors only. Available from the archive view.

**Behavior:**
- Folder and all its contents are restored to Draft status
- Folder reappears in the sidebar tree at its original location
- If the original parent no longer exists, folder is restored to root level

### 9.6 Change folder visibility

**Access:** Editors only.

**Entry point:** Folder settings or context menu → "Visibility"

**Flow:**
1. User selects visibility option from dropdown: Unit & sub-units (default), All units, Current unit only
2. System updates the folder's visibility
3. If changing to a more restrictive visibility: system warns if any articles inside have a broader visibility than the new folder setting (those articles will become more visible than their folder, which is allowed but worth noting)
4. New articles created in this folder will inherit the new visibility setting

---

## 10. Article management

### 10.1 Create article

**Access:** Editors only.

**Entry points:**
- "Create article" button in the main content area (when viewing a folder)
- "+" button or "New article" action in the sidebar (creates in currently selected folder)

**Flow:**
1. User triggers "Create article" action from within a folder context
2. Article editor opens with:
   - Empty title field (focused)
   - Empty content area
   - Status: Draft (shown as badge)
   - Visibility: inherited from parent folder (shown as selector)
3. User writes title and content
4. User clicks "Save draft" → article is saved as Draft
5. User clicks "Publish" → validation runs, if passes → article status changes to Published

### 10.2 Edit article

**Access:** Editors only. Viewers see the article in read mode without edit controls.

**Flow:**
1. User opens an article and clicks "Edit" button
2. Article switches to editor mode
3. User makes changes
4. User clicks "Save" → changes are saved, article retains its current status
5. If article was Published, changes are immediately visible to viewers

**Unsaved changes warning:** If the user navigates away with unsaved changes, a confirmation dialog appears: "You have unsaved changes. Leave without saving?"

### 10.3 Move article

**Access:** Editors only. MVP: move within the same unit only.

**Flow:**
1. User selects "Move" from article actions (button or context menu)
2. Tree picker dialog appears showing the current unit's folder structure
3. User selects destination folder
4. User confirms
5. System validates:
   - Destination folder exists
   - Article is not already in the selected folder
6. If valid → article is moved
7. Breadcrumb updates to reflect new location
8. Success notification

### 10.4 Archive article

**Access:** Editors only.

**Flow:**
1. User selects "Archive" from article actions
2. Confirmation dialog: "Archiving this article will hide it from the Knowledge Base. You can restore it later."
3. User confirms
4. Article status changes to Archived
5. Article disappears from active folder view
6. Success notification
7. User is redirected to the parent folder view

### 10.5 Restore article

**Access:** Editors only. Available from archive view.

**Behavior:** Article is restored to Draft status. User must explicitly re-publish.

### 10.6 Unpublish article

**Access:** Editors only.

**Behavior:** Reverts a published article to Draft status. Article becomes invisible to viewers immediately.

### 10.7 Change article visibility

**Access:** Editors only.

**Constraint:** Article visibility cannot be more permissive than its parent folder's visibility (see section 6.2).

---

## 11. Article editor

### 11.1 Editor type

WYSIWYG block-based editor. Not markdown. HR users and general employees are the primary authors — they need a visual editing experience.

Recommended library for prototype: TipTap, Lexical, or similar block-based rich text editor.

### 11.2 Formatting features

| Feature | Priority | Notes |
|---|---|---|
| Bold | MUST | |
| Italic | MUST | |
| Underline | MUST | Primarily for link styling |
| Strikethrough | SHOULD | |
| Headings (H1, H2, H3) | MUST | |
| Text sizes (Small, Regular, Large) | SHOULD | Alternative to headings for non-structural emphasis |
| Text color (basic palette) | SHOULD | Limited palette: 6-8 colors |
| Bullet list | MUST | |
| Numbered list | MUST | |
| Left alignment (default) | MUST | |
| Center alignment | MUST | |
| Right alignment | SHOULD | |
| Hyperlinks | MUST | Insert, edit, remove, open in new tab |
| Inline images | MUST | Upload from device, auto-scale to article width |
| File attachments | MUST | Appear as clickable file links |
| Mentions (@) | SHOULD | Reference users, trigger notification |

### 11.3 Not in MVP editor

Tables, dividers/separators, emoji picker, nested lists, collapsible/toggle sections, drag & drop upload (use file picker instead), video embed, code blocks, block quotes, callout blocks.

### 11.4 Copy/paste behavior

When a user pastes content into the editor:
- Pasted text is inserted at the cursor position
- Supported formatting (bold, italic, lists, links, headings) is preserved
- Unsupported formatting is stripped (colors, custom fonts, tables, etc. are simplified)
- Images pasted from clipboard: SHOULD support in future, not required for MVP
- If content cannot be processed, display inline error: "Some formatting was removed because it's not supported."

### 11.5 Link insertion

**Flow:**
1. User selects text (or places cursor)
2. User clicks link button in toolbar (or uses Ctrl/Cmd+K)
3. Input appears for URL entry
4. User enters URL and confirms
5. System validates: URL is not empty
6. Link is inserted as a clickable hyperlink, visually distinct (underlined, different color)
7. Clicking a link in read mode opens it in a new browser tab

**Link editing:** Click an existing link → popover shows URL with options to edit URL, copy link, or remove link.

### 11.6 Editor layout

```
┌─────────────────────────────────────────────────────────┐
│ ← Back to folder    [Status badge: Draft]    [Actions ▾]│
├─────────────────────────────────────────────────────────┤
│ Title: [Large text input field]                         │
├─────────────────────────────────────────────────────────┤
│ Toolbar: B I U S | H1 H2 H3 | • 1. | ← ≡ → | 🔗 📎 @ │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ [Content editing area]                                  │
│                                                         │
│                                                         │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ Visibility: [Unit & sub-units ▾]                        │
│                                                         │
│ [Save draft]                        [Publish]           │
└─────────────────────────────────────────────────────────┘
```

**Actions dropdown** (top right, for existing articles): Move, Change visibility, Unpublish (if published), Archive.

---

## 12. Media and attachments

### 12.1 Supported formats

| Type | Formats | Display | Priority |
|---|---|---|---|
| Images | JPG, JPEG, PNG | Inline within article content, auto-scaled to fit article width | MUST |
| Documents | PDF | Clickable file link showing file name, icon, and size | MUST |

### 12.2 Upload mechanism

**Primary method:** Upload from device via file picker dialog (MUST).

**Flow:**
1. User clicks attachment/image button in toolbar
2. System opens native file picker
3. User selects file
4. System validates:
   - File format is supported
   - File size does not exceed 10 MB
   - Attachment count does not exceed 5 per article
5. If valid:
   - Images are inserted inline at cursor position
   - Documents appear as file link blocks
   - Upload progress indicator shown during upload
6. If invalid → error message shown, file not uploaded

**Error messages:**
- "File format not supported. Supported formats: JPG, PNG, PDF."
- "File size exceeds the 10 MB limit."
- "Maximum of 5 attachments per article reached."

### 12.3 File storage rules

- Uploaded files are stored in system media storage
- Each file is associated with its article
- Files remain accessible as long as the article exists
- When an article is archived: files are preserved (accessible if article is restored)
- When editing: previously uploaded files remain unless manually removed by the editor
- Removing a file from the article content deletes it from storage

### 12.4 Image display

- Inline images auto-scale to fit the article content width
- No manual resize in MVP
- No alignment options for images in MVP (always left-aligned, full-width)

### 12.5 Storage limits

| Limit | Value |
|---|---|
| Max file size per attachment | 10 MB |
| Max attachments per article | 5 |
| Max storage per KB space (unit) | 50 MB |

---

## 13. Empty states

### 13.1 Empty KB (no folders yet)

**Shown when:** User opens KB tab for a unit that has no folders and no shared content.

**Content:**
- Illustration or icon (document/folder icon)
- Heading: "No knowledge base content yet"
- For editors: "Create your first folder to start organizing knowledge for this unit."
- CTA button: "+ Create folder"
- For viewers: "This unit's knowledge base is empty. Check back later or contact your team lead."

### 13.2 Empty folder (no articles)

**Content:**
- Heading: "This folder is empty"
- For editors: "Create an article to add content to this folder."
- CTA button: "+ Create article"
- For viewers: "No articles in this folder yet."

### 13.3 No KB permission

**Shown when:** User's KB permission for this unit is "None."

**Content:**
- Heading: "You don't have access to this Knowledge Base"
- Body: "Contact your unit administrator to request access."
- No CTA buttons.

### 13.4 No search results (future)

Reserved for when search is implemented.

### 13.5 Archive section empty

**Shown when:** Editor opens archive filter and no archived content exists.

**Content:**
- Heading: "No archived content"
- Body: "Archived articles and folders will appear here."

---

## 14. Validation rules and error messages

### 14.1 Folder validation

| Rule | Error message |
|---|---|
| Name is empty | "Folder name cannot be empty." |
| Name exceeds 100 characters | "Folder name is too long (max 100 characters)." |
| Name is not unique within parent | "A folder with this name already exists in this location." |
| Depth limit exceeded | "Maximum folder depth reached. You cannot create a sub-folder here." |
| Move into itself | "A folder cannot be moved into itself." |
| Move into own sub-folder | "A folder cannot be moved into one of its sub-folders." |

### 14.2 Article validation

| Rule | Error message |
|---|---|
| Publish with empty title | "Please add a title before publishing." |
| Publish with empty content | "Please add content before publishing." |
| Title exceeds 200 characters | "Title is too long (max 200 characters)." |
| Article visibility more permissive than folder | "Article visibility cannot be broader than its folder's visibility." |
| Move to same folder | "The article is already in this folder." |

### 14.3 Upload validation

| Rule | Error message |
|---|---|
| Unsupported file format | "File format not supported. Supported formats: JPG, PNG, PDF." |
| File too large | "File size exceeds the 10 MB limit." |
| Too many attachments | "Maximum of 5 attachments per article reached." |
| Upload failure | "Upload failed. Please try again." |

### 14.4 Notification patterns

- **Success notifications:** Appear as a toast at the top-right, auto-dismiss after 4 seconds. Examples: "Article published", "Folder created", "Article moved to [folder name]."
- **Error notifications:** Appear inline near the relevant field or as a toast that requires dismissal. Do not auto-dismiss for validation errors.
- **Confirmation dialogs:** Used for destructive actions only (archive folder with contents, archive article). Include impact summary (what will be affected). Two buttons: "Cancel" (secondary) and "Archive" (primary, caution-styled).

---

## 15. Data model

### 15.1 kb_folder

| Field | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| unit_id | FK → business_unit | NOT NULL | Owning unit |
| parent_folder_id | FK → kb_folder | NULLABLE | NULL = top-level folder |
| name | string(100) | NOT NULL | |
| visibility | enum | NOT NULL, default: 'unit_and_subunits' | Values: unit_and_subunits, all_units, current_unit_only |
| status | enum | NOT NULL, default: 'active' | Values: active, archived |
| sort_order | integer | NOT NULL, default: 0 | For future manual ordering |
| owner_id | FK → contact | NOT NULL | Creator by default, reassignable |
| created_by | FK → contact | NOT NULL | |
| created_at | timestamp | NOT NULL | |
| updated_by | FK → contact | NOT NULL | |
| updated_at | timestamp | NOT NULL | |

**Constraints:**
- UNIQUE(unit_id, parent_folder_id, name) — no duplicate names within same parent in same unit
- Max depth: application-level enforcement (parent_folder_id of parent must have parent_folder_id = NULL)

### 15.2 kb_article

| Field | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| kb_folder_id | FK → kb_folder | NOT NULL | Article must belong to a folder |
| unit_id | FK → business_unit | NOT NULL | Denormalized for query performance |
| title | string(200) | NOT NULL | |
| content | JSONB / rich text | | Block-based editor format |
| status | enum | NOT NULL, default: 'draft' | Values: draft, published, archived |
| visibility | enum | NOT NULL, default: inherited from folder | Values: unit_and_subunits, all_units, current_unit_only |
| owner_id | FK → contact | NOT NULL | |
| created_by | FK → contact | NOT NULL | |
| created_at | timestamp | NOT NULL | |
| updated_by | FK → contact | NOT NULL | |
| updated_at | timestamp | NOT NULL | |
| published_at | timestamp | NULLABLE | Set when first published, updated on re-publish |

### 15.3 kb_attachment

| Field | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| kb_article_id | FK → kb_article | NOT NULL | |
| file_name | string(255) | NOT NULL | Original upload name |
| file_type | string(50) | NOT NULL | MIME type |
| file_size | integer | NOT NULL | Bytes |
| storage_path | string(500) | NOT NULL | Internal storage reference |
| created_by | FK → contact | NOT NULL | |
| created_at | timestamp | NOT NULL | |

---

## 16. Screen inventory

| # | Screen | Description | Entry point | Priority |
|---|---|---|---|---|
| 1 | KB Home | Left panel: folder tree (own + shared). Main area: welcome state or selected folder contents. | Click "KB" tab in unit navigation | MUST |
| 2 | Folder view | Article list within selected folder. Shows article title, status badge, updated date, owner. Sub-folders listed above articles. | Click a folder in sidebar tree | MUST |
| 3 | Article view (read mode) | Full article content. Header: title, status badge, author avatar + name, last updated, visibility indicator. Action buttons for editors. | Click an article title in folder view | MUST |
| 4 | Article editor | WYSIWYG editor with title field, formatting toolbar, content area, visibility selector, save/publish buttons. | "Create article" or "Edit" button | MUST |
| 5 | Create folder dialog | Inline input in sidebar tree or small modal. Name field + visibility selector. | "+ Create folder" button or context menu | MUST |
| 6 | Move dialog (article/folder) | Tree picker showing current unit's folder structure. Select destination + confirm. | "Move" action in context menu or article actions | MUST |
| 7 | Archive confirmation dialog | Warning text with impact summary. Cancel + Archive buttons. | "Archive" action on article or folder | MUST |
| 8 | Empty states | KB empty, folder empty, no permission. Each with appropriate messaging and CTA. | Automatic when relevant condition is true | MUST |
| 9 | Archived content view | Filter toggle or separate section showing archived articles/folders. Restore action available. | Toggle "Show archived" filter (editors only) | SHOULD |
| 10 | KB permission settings | Table of unit permission groups with KB permission level dropdown. Inside Unit Settings. | Unit settings → Permissions | SHOULD |

---

## 17. UX specifications per screen

### 17.1 KB Home (Screen 1)

**Layout:** Two-panel. Left panel (240-280px wide, collapsible) contains the folder tree. Right panel (remaining width) contains the main content area.

**Left panel (folder tree):**
- Section header: unit name's KB label or just a "Folders" heading
- Own folders: displayed as an expandable tree with folder icons. Clicking a folder selects it and shows its contents in the main area. Context menu (right-click or "..." button) with: Rename, Move, Create sub-folder (if depth allows), Change visibility, Archive.
- Divider line
- "Shared with you" section header (muted text, smaller size)
- Shared folders: displayed with muted styling, each showing source unit name. Click to browse. No context menu for management actions.
- "+ Create folder" button at the top or bottom of the own folders section (editors only)

**Right panel (main content area):**
- When no folder is selected: show KB welcome / empty state
- When a folder is selected: show folder view (screen 2)
- When an article is selected: show article view (screen 3) or editor (screen 4)

**Top area (above both panels):**
- Breadcrumb navigation
- "Show sub-units" toggle (follows existing platform placement)

### 17.2 Folder view (Screen 2)

**Header:** Folder name as heading. Visibility badge if not default. "Create article" button (editors only).

**Content:**
- If folder has sub-folders: show them first as clickable cards or list items with folder icon, name, and article count
- Below sub-folders: article list as a table or structured list

**Article list columns:**
- Title (clickable, navigates to article view)
- Status (badge: Published = green, Draft = amber — visible to editors only)
- Last updated (relative date: "2 days ago" or absolute date)
- Owner (avatar + name)
- Actions ("..." menu with: Edit, Move, Archive — editors only)

**When "Show sub-units" is ON:** Article list includes a "Unit" column showing the source unit. Sub-unit articles appear with a tinted background row.

### 17.3 Article view — read mode (Screen 3)

**Header area:**
- "← Back to [folder name]" link
- Article title (large heading)
- Metadata row: Author avatar + name | Last updated: [date] | Visibility badge (if not default)
- Status badge (Draft/Archived — only shown to editors for non-published states)
- Action buttons (editors only): "Edit" (primary), "..." menu with: Move, Change visibility, Unpublish, Archive

**Content area:**
- Rendered article content with all formatting
- Inline images displayed at full article width
- File attachments shown as file link blocks (icon + name + size, clickable to open/download)

**Shared content indicator:** If viewing an article from a shared folder (another unit), show a subtle banner: "This article belongs to [Unit name]'s Knowledge Base."

### 17.4 Article editor (Screen 4)

See section 11.6 for layout specification.

**Behavior:**
- Title field: large text input, auto-focused on create, placeholder "Article title"
- Content area: WYSIWYG editor with toolbar
- Toolbar: formatting controls as specified in section 11.2
- Bottom bar: visibility selector (dropdown) + "Save draft" button (secondary) + "Publish" button (primary)
- For existing published articles: bottom bar shows "Save" (primary) instead of "Save draft" + "Publish"
- Auto-save: SHOULD implement auto-save for drafts every 30 seconds (optional for MVP)
- Unsaved changes: warn on navigation away

### 17.5 Create folder dialog (Screen 5)

**Option A — Inline creation (preferred):**
- A new editable text field appears in the sidebar tree at the appropriate position
- User types the name and presses Enter to create, Escape to cancel
- Visibility defaults to "Unit & sub-units" — can be changed afterward via context menu

**Option B — Small modal (acceptable alternative):**
- Modal with: name text field, visibility dropdown, Create + Cancel buttons
- Max width: 400px

### 17.6 Move dialog (Screen 6)

**Modal content:**
- Heading: "Move [article/folder name]"
- Tree view showing the current unit's folder structure (own folders only, not shared)
- Current location is shown but not selectable (grayed out)
- Invalid destinations are disabled (e.g., folder can't move into itself)
- "Move here" button (primary) + "Cancel" button

### 17.7 Archive confirmation dialog (Screen 7)

**Modal content:**
- Heading: "Archive [article/folder name]?"
- Body: Impact description
  - For articles: "This article will be hidden from the Knowledge Base. You can restore it later."
  - For folders: "This folder and all its contents will be archived. This includes [N] articles and [M] sub-folders. You can restore them later."
- Buttons: "Cancel" (secondary) + "Archive" (caution-styled primary)

---

## 18. Future scope (not in MVP)

The following capabilities are explicitly excluded from MVP and may be considered in future versions:

### Content structure
- Tags / labels for article categorization
- Smart categories (auto-grouping by tags or metadata)
- Article templates
- Manual folder reordering (drag & drop)
- 3rd level of folder nesting
- Articles at KB root level (outside folders)

### Article lifecycle
- Versioning (track and restore previous versions)
- Workflow / Approvals (review stage before publication)
- Scheduled publishing
- Content verification reminders (Guru-style "is this still accurate?" prompts)

### Editor capabilities
- Tables (add/delete/resize rows and columns)
- Dividers / separators
- Emoji picker
- Nested lists
- Collapsible / toggle sections
- Block quotes and callouts
- Code blocks
- Drag & drop file upload
- Image paste from clipboard
- Image resize and alignment
- Video embed (YouTube, Loom, Google Drive)

### Search and discovery
- Full-text search within KB
- Global search integration (search across all units' KB content the user has access to)
- Search result highlighting
- Recently viewed articles
- Popular/trending articles

### Cross-module integration
- Linking KB articles from onboarding checklists
- Linking KB articles from employee profiles
- KB article suggestions in context (e.g., during onboarding, show relevant KB articles)

### Permissions
- Folder-level permission overrides
- Article-level permission overrides
- "Commenter" role (view + add comments)
- Comments on articles
- Role-based permissions (e.g., "All Managers can edit")

### Export and migration
- Download article as PDF
- Export KB structure
- Import from Confluence / Notion / Google Docs

### Analytics
- Article view counts
- Most viewed articles
- Stale content reports (articles not updated in X months)

### Navigation
- Cross-unit KB dashboard (aggregation view showing all articles the user can access)
- Favorites / bookmarked articles
- "Recently edited by me" quick access

---

*End of document.*
