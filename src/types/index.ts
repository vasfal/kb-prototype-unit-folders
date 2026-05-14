// KB Prototype — Domain Types
// Source of truth: docs/PRD.md section 15 (Data Model)

// === Enums ===

export type ArticleStatus = 'draft' | 'published' | 'archived';

export type Visibility = 'unit_and_subunits' | 'current_unit_only';

export type KBPermission = 'none' | 'view' | 'edit';

export type FolderStatus = 'active' | 'archived';

// === Core entities ===

export interface Contact {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role?: string;
}

export interface BusinessUnit {
  id: string;
  name: string;
  parentId: string | null;
  icon?: string; // emoji or icon name
  children?: BusinessUnit[];
}

/** Folders are owned by a single unit. Each unit maintains its own independent folder tree.
 *  `color` is meaningful only on root (level-1) folders; sub-folders inherit
 *  their root ancestor's color at render time via `getFolderDisplayStyle`. */
export interface KBFolder {
  id: string;
  unitId: string; // owning unit
  parentFolderId: string | null; // null = top-level folder within the owning unit
  name: string;
  color: string; // hex color — set on root, copied to sub-folders on create
  visibility: Visibility;
  status: FolderStatus;
  sortOrder: number;
  owner: Contact;
  createdBy: Contact;
  createdAt: string; // ISO date string
  updatedBy: Contact;
  updatedAt: string;
}

export interface KBArticle {
  id: string;
  folderId: string;
  unitId: string;
  title: string;
  content: string; // HTML string from TipTap editor
  status: ArticleStatus;
  visibility: Visibility;
  owner: Contact;
  createdBy: Contact;
  createdAt: string;
  updatedBy: Contact;
  updatedAt: string;
  publishedAt: string | null;
}

export interface KBAttachment {
  id: string;
  articleId: string;
  fileName: string;
  fileType: string; // MIME type
  fileSize: number; // bytes
  createdBy: Contact;
  createdAt: string;
}

// === Activity / comments ===

export type ArticleActivityKind =
  | 'created'
  | 'status_changed'
  | 'owner_changed'
  | 'folder_moved'
  | 'title_renamed'
  | 'content_updated'
  | 'comment';

/** Append-only log of things that happened to an article. Used by the
 *  Activity sidebar — both system events and user-authored comments share
 *  the same stream, distinguished by `kind`. */
export interface ArticleActivity {
  id: string;
  articleId: string;
  actor: Contact;
  timestamp: string;
  kind: ArticleActivityKind;
  data: {
    fromStatus?: ArticleStatus;
    toStatus?: ArticleStatus;
    fromOwner?: string;
    toOwner?: string;
    fromFolder?: string;
    toFolder?: string;
    fromTitle?: string;
    toTitle?: string;
    /** Body text for `kind: 'comment'`. */
    comment?: string;
  };
}

// === UI State types ===

export type KBViewMode = 'folder-list' | 'article-view' | 'article-editor';

export type StatusFilter = 'all' | 'published' | 'draft' | 'archived';

export type AppTab = 'team' | 'people' | 'recruitment' | 'jobs' | 'kb';

// === Helper types ===

/** Folder with computed children for tree rendering */
export interface FolderTreeNode extends KBFolder {
  children: FolderTreeNode[];
  articleCount: number;
}

/** Unit with resolved path for breadcrumbs */
export interface UnitWithPath extends BusinessUnit {
  path: BusinessUnit[]; // ancestors from root to this unit
}
