# Design System Reference

## Primary source of truth: Figma

### Platform layout
**Figma file:** https://www.figma.com/design/gpVOpetVBR1JleFug3U332/Layout-UI-improvements?node-id=1-108721

This is the live design file for the HRM platform shell (sidebar, unit tree, top bar, tab bar).

### Knowledge Base module
**Figma file:** https://www.figma.com/design/KDJ0aVVR1FmAt8ohgZyd3P/Knowledge-Base?node-id=24-880

This is the design file for the Knowledge Base module. It defines the card grid layout, folder sections, article cards, and toolbar.

**If you have Figma MCP connected**, inspect these files directly to extract exact values.

## How to use the Figma files

1. **Global sidebar** — Left icon strip (Home, Inbox, Search, Units, etc.) + unit tree panel. Active state: #006bd6 blue.
2. **Unit tree panel** — Company unit hierarchy. Selected state: #e6f0fb bg, #006bd6 text.
3. **Top bar** — Breadcrumb with Building2 icon, "Unit settings" button. Height: 56px.
4. **Tab bar** — Tabs: Team, People management, Recruitment, Jobs, Knowledge base. Active tab: #0052a3 bottom border and text.
5. **KB content area** — Card grid layout. No folder tree panel. Folders displayed as section headers with colored icons.
6. **Article cards** — White bg, #edeff3 border, rounded-xl, shadow. Title + status badge (top), unit name + time ago + avatar (bottom).
7. **Toolbar** — Search input (220px) + filter + sort | Sub-units toggle + view mode toggle (grid/list) + Create article button + more menu.
8. **Status badges** — Draft: filled blue (#006bd6 bg, white text). Archived: outlined gray (#e0e4eb border, #525f7a text). Published: no badge.

## Color palette

| Token | Value | Usage |
|-------|-------|-------|
| Primary | #006bd6 | Buttons, toggles, active nav icons, avatar bg |
| Primary dark | #0052a3 | Active tab text & border |
| Text dark (neutral-4) | #1f242e | Headings, card titles, labels |
| Text medium (neutral-3) | #3d475c | Current breadcrumb, unit settings text |
| Text secondary (neutral-2) | #525f7a | Unit name in cards, count badges |
| Text muted (neutral-1) | #697a9b | Inactive tabs, breadcrumb ancestors, timestamps |
| Border light | #edeff3 | Section borders, card borders, dividers |
| Border medium | #e0e4eb | Input borders, button borders |
| Background | #fafbfc | Page background, search input bg |
| Surface | white | Cards, panels, toolbar bg |
| Selected bg | #e6f0fb | Selected unit in sidebar |
| Orange accent | #ff9124 | Folder section icon (first) |

### Typography
- Font: Inter (system sans-serif fallback)
- Body text: 14px, font-weight 500 (medium)
- Small text / metadata: 12-13px
- Section headings: 16px, font-weight 500
- Badge text: 11-12px, font-weight 500

### Key layout dimensions
- Global sidebar icon strip: 64px wide
- Unit tree panel: ~200px wide
- Top bar height: 56px
- Tab bar: auto height, 6px vertical padding per tab item
- Article card: rounded-xl (12px), 16px padding, #edeff3 border, subtle shadow
- Folder section icon: 28px rounded-lg square with colored bg

## KB-specific patterns

### Folder sections (main content)
- Each folder displayed as a section with header + article card grid
- Section header: colored 28px icon square + folder name (16px medium) + count badge (bordered pill)
- Sections separated by bottom border (#edeff3)
- 16px padding around each section
- 12px gap between cards

### Article card grid
- 3-column grid in grid view, single column in list view
- Cards: white bg, #edeff3 border, rounded-xl, 16px padding
- Subtle shadow: 0px 1px 2px rgba(31,36,46,0.05)
- Row 1: title (14px medium, #1f242e, line-clamp-2) + status badge (if not published)
- Row 2: folder icon (12px) + unit name (12px, #525f7a) | time ago (12px, #697a9b) + avatar (20px rounded-md)

### Toolbar
- Background: white, bottom border #edeff3
- Left: Search input (220px, #fafbfc bg, #e0e4eb border, rounded-lg) + filter button + sort button
- Right: "Sub-units" label + toggle | divider (#edeff3) | grid/list view toggle (pill with shadow on active) | "+ Create article" button (#006bd6 bg) | "..." more button

### View mode toggle
- Container: #edeff3 bg, rounded-lg, 2px padding
- Active pill: white bg, shadow, rounded-md
- Icons: LayoutGrid and List (16px)

### Article view (read mode)
- Back link at top, article title (20px bold), metadata row
- Article content: max-width 720px, centered for readability

### Article editor
- Borderless title input (large), WYSIWYG toolbar, content area
- Bottom bar: visibility dropdown (left), Save Draft + Publish buttons (right)

### Visibility badges
- "All units" — blue-tinted badge with globe icon
- "Current unit only" — red/restricted-tinted badge with lock icon
- "Unit & sub-units" — no badge (default)
