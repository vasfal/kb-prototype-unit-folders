# Component Map

This document maps every component in the prototype to its responsibility, props, and key behaviors. Read this before building any component.

## Layout components

### AppShell
**File:** `src/components/layout/AppShell.tsx`
**Responsibility:** The outermost container. Renders the global sidebar, top bar, tab bar, and content area.
**State it owns:** `selectedUnitId`
**Renders:**
- `UnitSidebar` (left, 64px global nav + ~200px unit tree)
- `TopBar` (breadcrumb + unit settings)
- `TabBar` (module tabs)
- Content area: renders `<KBRoot>` for the KB tab

### UnitSidebar
**File:** `src/components/layout/UnitSidebar.tsx`
**Props:** `unitTree`, `selectedUnitId`, `onSelectUnit`
**Responsibility:** Two-part sidebar. Left icon strip (64px) with global nav icons. Right panel (~200px) with unit tree. Shared header spans both columns with Develux branding.
**Behavior:**
- Unit tree is hardcoded from mock data
- Clicking a unit highlights it and updates the selected context
- Tree supports expand/collapse for units with children (click entire row)
- Root unit (Develux) uses Building2 icon and cannot be collapsed
- Expanded folders show FolderOpen icon, collapsed with children show FolderInput icon, leaf nodes show FolderClosed icon
- "Units" icon in the left strip is highlighted as active
- Blue "+" button at the bottom of the unit tree panel

### TopBar
**File:** `src/components/layout/TopBar.tsx`
**Props:** `unitPath: string[]`
**Responsibility:** Breadcrumb path + "Unit settings" button.
**Renders:** Building2 icon + breadcrumb segments separated by chevrons | "Unit settings" button (bordered, rounded-lg)
**Height:** 56px. Colors: breadcrumb text #697a9b (ancestors) / #3d475c (current). Border: #edeff3.

### TabBar
**File:** `src/components/layout/TabBar.tsx`
**Props:** `activeTab`
**Responsibility:** Horizontal tab bar with icons + labels.
**Tabs:** Team, People management, Recruitment, Jobs, Knowledge base
**Behavior:** Active tab has #0052a3 bottom border and text color. Inactive tabs use #697a9b.

## KB components

### KBRoot
**File:** `src/components/kb/KBRoot.tsx`
**Responsibility:** The root component for the KB tab. Renders the toolbar and all folder sections with article card grids. No folder tree panel — folders are displayed as sections in the scrollable content area.
**State it owns:**
- `showSubUnits: boolean`
- `viewMode: 'grid' | 'list'`
**Renders:**
- Toolbar: Search (220px, #fafbfc bg) | Filter icon | Sort icon | Sub-units toggle | View mode toggle (grid/list pill buttons) | "+ Create article" blue button | "..." more button
- Content: folder sections, each with a colored icon header + article card grid
**Key logic:**
- Shows all root-level folders for the current unit + shared folders from parent/other units
- Each folder section includes articles from sub-folders
- Empty state shown when no folders/articles exist

### ArticleCard
**File:** `src/components/kb/ArticleCard.tsx`
**Props:** `article: KBArticle`, `onClick?`
**Responsibility:** Individual article card in the grid.
**Renders:**
- Row 1: Article title (14px medium, #1f242e) + StatusBadge (if draft/archived)
- Row 2: Folder icon + unit name (#525f7a, 12px) | time ago (#697a9b, 12px) + owner avatar (20px rounded-md, initials)
**Styling:** White bg, #edeff3 border, rounded-xl (12px), 16px padding, subtle shadow

### FolderTree
**File:** `src/components/kb/FolderTree.tsx`
**Note:** Retained for potential list-view mode but not used in the primary card grid layout.

### FolderView
**File:** `src/components/kb/FolderView.tsx`
**Note:** Retained for potential list-view/table mode but not used in the primary card grid layout.

### ArticleView
**File:** `src/components/kb/ArticleView.tsx`
**Props:** `article`, `folderName`, `isShared`, `canEdit`, `onBack`, `onEdit`, `onArchive`, `onMove`, `onUnpublish`
**Responsibility:** Full article content display in read mode.
**Renders:**
- Back link: "← folder name"
- Title (20px bold)
- Metadata row: author avatar + name | "Updated [date]" | visibility badge | status badge
- Content: rendered HTML from article content
- Action bar (if canEdit): "Edit" button + "..." dropdown

### ArticleEditor
**File:** `src/components/kb/ArticleEditor.tsx`
**Props:** `article` (null for new), `folderId`, `folderVisibility`, `onSave`, `onPublish`, `onCancel`
**Responsibility:** Article creation and editing with TipTap rich text editor.
**Renders:**
- Title field: large borderless input
- Toolbar: formatting buttons
- Content area: TipTap editor
- Bottom bar: visibility selector | "Save draft" + "Publish" buttons

### CreateFolderDialog
**File:** `src/components/kb/CreateFolderDialog.tsx`
**Renders:** Dialog with name input + visibility dropdown + Create/Cancel buttons.

### MoveDialog
**File:** `src/components/kb/MoveDialog.tsx`
**Renders:** Dialog with folder tree picker for moving articles/folders.

### ArchiveDialog
**File:** `src/components/kb/ArchiveDialog.tsx`
**Renders:** Confirmation dialog with impact summary.

### StatusBadge
**File:** `src/components/kb/StatusBadge.tsx`
**Props:** `status: ArticleStatus`
**Renders:** Small pill badge. Draft = filled blue (#006bd6 bg, white text). Archived = outlined gray (#e0e4eb border, #525f7a text). Published renders nothing (no badge shown).

### VisibilityBadge
**File:** `src/components/kb/VisibilityBadge.tsx`
**Props:** `visibility: Visibility`
**Renders:** Badge only for non-default visibility. "All units" = blue badge with globe icon. "Current unit only" = red badge with lock icon. Default renders nothing.

### EmptyState
**File:** `src/components/kb/EmptyState.tsx`
**Props:** `title`, `description`, `action?`
**Renders:** Centered content with icon, heading, description, and optional CTA button.

## Color palette (from Figma)

| Token | Value | Usage |
|-------|-------|-------|
| Primary | #006bd6 | Buttons, toggles, active nav icons, avatar bg |
| Primary dark | #0052a3 | Active tab text & border |
| Text dark (neutral-4) | #1f242e | Headings, card titles, labels |
| Text medium (neutral-3) | #3d475c | Current breadcrumb, unit settings text |
| Text secondary (neutral-2) | #525f7a | Unit name in cards, count badges |
| Text muted (neutral-1) | #697a9b | Inactive tabs, breadcrumb ancestors, timestamps |
| Border light (neutral-2) | #edeff3 | Section borders, card borders, dividers |
| Border medium (neutral-3) | #e0e4eb | Input borders, button borders |
| Background | #fafbfc | Page background, search input bg |
| Surface | white | Cards, panels, toolbar bg |
| Selected bg | #e6f0fb | Selected unit in sidebar |
