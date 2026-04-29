# KB Prototype

Interactive prototype for the Knowledge Base module of the HRM platform.

## Purpose

Stakeholder presentation prototype demonstrating the KB feature's core user flows: folder navigation, article lifecycle (draft → published → archived), rich text editing, and cross-unit content visibility.

## Tech stack

- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- TipTap (rich text editor)

## Setup

```bash
# Install TipTap (not included in base setup)
pnpm add @tiptap/react @tiptap/starter-kit @tiptap/extension-underline @tiptap/extension-link @tiptap/extension-placeholder @tiptap/extension-text-align @tiptap/extension-heading @tiptap/extension-image @tiptap/extension-strike

# Run dev server
pnpm dev
```

## Project structure

```
docs/               # Product requirements and design specs
  PRD.md            # Complete product requirements document
  DESIGN_SYSTEM.md  # Visual design rules
  COMPONENT_MAP.md  # Component responsibilities and props
  MOCK_DATA.md      # Mock data specification
  SCREENSHOTS.md    # Reference screenshot descriptions
  screenshots/      # Reference screenshots from existing HRM platform

src/
  types/index.ts    # TypeScript domain types
  data/mock-data.ts # In-memory mock data
  components/
    layout/         # App shell, sidebar, top bar, tab bar
    kb/             # All KB-specific components
    shared/         # Reusable UI atoms
```

## Key documentation

- **CLAUDE.md** — Instructions for Claude Code (implementation guide, build order, what to build and what to skip)
- **docs/PRD.md** — Source of truth for all feature behavior
- **docs/COMPONENT_MAP.md** — Component architecture with props and responsibilities

## Build order

1. App shell + static navigation (match existing HRM layout)
2. Folder tree + folder view
3. Article view (read mode)
4. Article editor (TipTap)
5. Dialogs and lifecycle actions
6. Cross-unit visibility
