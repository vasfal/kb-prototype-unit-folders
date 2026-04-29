# KB Prototype — Claude Code Instructions

## What this is

An interactive prototype of a Knowledge Base module for an enterprise HRM SaaS platform. The prototype demonstrates the KB feature's core user flows with realistic mock data. It is NOT a production application — there is no backend, no API, no database. All data is in-memory mock data.

## Goal

Build a working clickable prototype that a Lead Product Designer can present to stakeholders to demonstrate:
1. How KB lives inside the unit navigation (tab-based)
2. Folder tree with own folders + shared folders
3. Article lifecycle: draft → published → archived
4. Article editor with rich text
5. Visibility model (unit & sub-units, all units, current unit only)
6. Cross-unit content sharing via "Shared with you" section
7. Empty states and confirmation dialogs

## Tech stack

- React 18 + TypeScript
- Tailwind CSS + shadcn/ui (40+ components pre-installed)
- TipTap for rich text editor (install: `pnpm add @tiptap/react @tiptap/starter-kit @tiptap/extension-underline @tiptap/extension-link @tiptap/extension-placeholder @tiptap/extension-text-align @tiptap/extension-heading @tiptap/extension-image`)
- All data is in-memory, managed with React state
- No routing library needed — use simple state-based navigation

## Key files to read before working

- `docs/PRD.md` — the complete product requirements (source of truth for all behavior)
- `docs/DESIGN_SYSTEM.md` — visual design rules, references the Figma file as primary source
- `docs/UI_REFERENCE.md` — Figma link and screenshot reference for the existing HRM platform layout
- `docs/COMPONENT_MAP.md` — which components to build and their responsibilities
- `docs/MOCK_DATA.md` — the data structure and realistic content to populate the prototype
- `src/types/index.ts` — TypeScript types for the domain model

## Figma reference (primary design source)

### Platform shell layout
**Figma file:** https://www.figma.com/design/gpVOpetVBR1JleFug3U332/Layout-UI-improvements?node-id=1-108721

Defines the HRM platform shell: global sidebar, unit tree, top bar, tab bar.

### Knowledge Base module
**Figma file:** https://www.figma.com/design/KDJ0aVVR1FmAt8ohgZyd3P/Knowledge-Base?node-id=24-880

Defines the KB module layout: card grid, folder sections, article cards, toolbar. This is the primary reference for all KB-specific UI.

A reference screenshot is also available at `docs/screenshots/jobs-tab-reference.png` showing the Jobs tab layout for the platform shell pattern.

## Critical design rules

### 1. This is an enterprise SaaS UI, not a consumer app
- Clean, professional, utilitarian aesthetic
- No rounded-everything, no gradient backgrounds, no playful animations
- Tight spacing, small text sizes (13-14px for body), clear hierarchy
- The UI should look like it belongs in the same product as Jira, Confluence, or Linear

### 2. Match the HRM platform patterns
- **Platform shell:** Figma file at https://www.figma.com/design/gpVOpetVBR1JleFug3U332/Layout-UI-improvements?node-id=1-108721
- **KB module:** Figma file at https://www.figma.com/design/KDJ0aVVR1FmAt8ohgZyd3P/Knowledge-Base?node-id=24-880
- Left sidebar: icon strip (64px) + unit tree (~200px) with interactive expand/collapse
- Top breadcrumb bar with unit path (Building2 icon prefix)
- Top tab bar: Team | People management | Recruitment | Jobs | Knowledge base
- "Sub-units" toggle + view mode toggle in the KB toolbar
- "Unit settings" button in the top-right corner
- Color palette: primary #006bd6, active tab #0052a3, borders #edeff3/#e0e4eb

### 3. KB-specific layout
- **No folder tree panel** — folders are displayed as section headers in the main content area
- Articles shown in a **3-column card grid** (not a data table)
- Each folder section: colored icon (28px) + folder name + count badge + article cards
- Toolbar: search + filter + sort | sub-units toggle + grid/list view toggle + create button
- Article cards: white bg, rounded-xl, shadow, title + status badge + unit name + time ago + avatar

### 4. No over-engineering
- This is a prototype for stakeholder presentation, not production code
- Simple state management (useState/useReducer at app level, pass down via props or context)
- No complex abstractions, no custom hooks unless genuinely reused 3+ times
- Inline event handlers are fine for prototype scope
- Comments are welcome for complex logic but don't over-document obvious code

## File structure

```
src/
├── types/
│   └── index.ts              # All TypeScript types
├── data/
│   └── mock-data.ts           # All mock data (units, folders, articles)
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx       # Outer shell: sidebar + top bar + content
│   │   ├── UnitSidebar.tsx    # Left sidebar with unit tree
│   │   ├── TopBar.tsx         # Breadcrumb + unit settings button
│   │   └── TabBar.tsx         # Team | People mgmt | Recruitment | Jobs | KB
│   ├── kb/
│   │   ├── KBRoot.tsx         # KB tab root — toolbar + folder sections with card grid
│   │   ├── ArticleCard.tsx    # Individual article card in the grid
│   │   ├── FolderTree.tsx     # (retained, not used in card grid layout)
│   │   ├── FolderView.tsx     # (retained, not used in card grid layout)
│   │   ├── ArticleView.tsx    # Article read mode (full content display)
│   │   ├── ArticleEditor.tsx  # Article editor with TipTap
│   │   ├── CreateFolderDialog.tsx
│   │   ├── MoveDialog.tsx     # Tree picker for moving articles/folders
│   │   ├── ArchiveDialog.tsx  # Confirmation dialog for archiving
│   │   ├── VisibilityBadge.tsx
│   │   ├── StatusBadge.tsx
│   │   └── EmptyState.tsx     # Reusable empty state component
│   └── shared/
│       └── ... (any shared UI atoms)
├── App.tsx                    # Root component
├── main.tsx                   # Entry point
└── index.css                  # Tailwind + custom styles
```

## Implementation order

Build in this sequence — each step produces a visible, testable result:

### Step 1: App shell + static navigation
- AppShell with sidebar, top bar, tab bar
- Hardcode the unit tree (Develux > Employo > Development, Product > Design, UX research; EDU > Product, Development, Marketing)
- Highlight "Employo" as selected unit
- Tab bar with KB tab active
- This step should produce the exact layout from the screenshots in docs/

### Step 2: Folder sections + card grid
- KBRoot with toolbar (search, filter, sort, sub-units, view toggle, create)
- Folder sections as content headers with colored icons and article counts
- ArticleCard grid (3-column) showing title, status badge, unit name, time ago, avatar
- StatusBadge (Draft=blue filled, Archived=gray outlined, Published=hidden) and VisibilityBadge
- Empty state when KB has no content

### Step 3: Article view (read mode)
- Full article content display with metadata header
- Back navigation to folder
- Action buttons for editors (Edit, Archive, Move via dropdown)

### Step 4: Article editor
- Install TipTap and set up the editor
- Title field + WYSIWYG content area + formatting toolbar
- Save Draft and Publish buttons
- Visibility selector
- Creating a new article from folder view

### Step 5: Dialogs and lifecycle actions
- CreateFolderDialog
- MoveDialog with tree picker
- ArchiveDialog with impact summary
- Wire up archive/restore, publish/unpublish state transitions

### Step 6: Cross-unit visibility
- Sub-units toggle behavior
- Shared folders appearing as sections alongside own folders
- Grid/list view mode toggle

## What NOT to build

- No authentication or login screen
- No real API calls or data persistence
- No search functionality
- No drag-and-drop folder reordering
- No file upload (show attachment UI but don't implement actual upload)
- No mentions (@) functionality
- No comments
- No responsive/mobile layout (desktop-only prototype)
- No dark mode
- No unit settings / permission management screens
