import { useEffect, useMemo, useRef, useState } from 'react';
import {
  MoreHorizontal,
  Eye,
  Calendar,
  Info,
  MessageCircle,
  Pencil,
  History,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import type { KBArticle, ArticleStatus } from '@/types';
import { EntityModal, type RightPanel } from '../shared/EntityModal';
import { VisibilityBadge } from './VisibilityBadge';
import { ArticleActionsMenu } from './ArticleActionsMenu';
import { ArticleSummaryFields, type ViewingMode } from './ArticleSummaryFields';
import { ArticleActivityPanel } from './ArticleActivityPanel';
import {
  ArticleVersionsPanel,
  type VersionSelection,
} from './ArticleVersionsPanel';
import { RestoreVersionDialog } from './RestoreVersionDialog';
import {
  LexicalArticleEditor,
  type LexicalArticleEditorApi,
} from './lexical/LexicalArticleEditor';

interface ArticleViewProps {
  article: KBArticle;
  /** 'view' = read mode (default); 'edit' = content is editable + floating bar. */
  mode?: 'view' | 'edit';
  onClose: () => void;
  onEdit?: () => void;
  onEditCancel?: () => void;
  /** Click Save in edit mode. Routes to setArticleContent (draft article)
   *  or saveDraft (published article) — the caller decides. */
  onSaveEdit?: (article: KBArticle, content: string) => void;
  /** Click Publish in edit mode. Always creates a new published version
   *  containing the current editor content and clears any pending draft. */
  onPublishEdit?: (article: KBArticle, content: string) => void;
  /** Click Discard draft. Available in edit mode when article is published
   *  with pending unpublished changes. */
  onDiscardDraft?: (article: KBArticle) => void;
  /** Click "Restore this version" while viewing an older snapshot. Receives
   *  the content of the version to restore. Caller stages it as draft and
   *  flips into edit mode. */
  onRestoreVersion?: (article: KBArticle, content: string) => void;
  onStatusChange?: (article: KBArticle, status: ArticleStatus) => void;
  onMove?: (article: KBArticle) => void;
  onDelete?: (article: KBArticle) => void;
  onChangeVisibility?: (article: KBArticle) => void;
  onTitleChange?: (article: KBArticle, title: string) => void;
  onOwnerChange?: (article: KBArticle, ownerId: string) => void;
  onFolderChange?: (article: KBArticle, folderId: string) => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function InlineTitle({
  title,
  editable,
  onChange,
}: {
  title: string;
  editable: boolean;
  onChange?: (next: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!editing) setDraft(title);
  }, [title, editing]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const commit = () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      setDraft(title);
      setEditing(false);
      return;
    }
    if (trimmed !== title) onChange?.(trimmed);
    setEditing(false);
  };

  if (editing) {
    return (
      <textarea
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            commit();
          } else if (e.key === 'Escape') {
            setDraft(title);
            setEditing(false);
          }
        }}
        rows={1}
        className="flex-1 text-[20px] font-semibold text-[#1f242e] leading-[30px] bg-white border border-[#006bd6] rounded-md px-2 py-0.5 -mx-2 -my-0.5 resize-none focus:outline-none focus:ring-1 focus:ring-[#006bd6]"
      />
    );
  }

  return (
    <h1
      onClick={editable ? () => setEditing(true) : undefined}
      className={`flex-1 text-[20px] font-semibold text-[#1f242e] leading-[30px] ${
        editable
          ? 'cursor-text rounded-md px-2 py-0.5 -mx-2 -my-0.5 hover:bg-[#fafbfc]'
          : ''
      }`}
      title={editable ? 'Click to rename' : undefined}
    >
      {title}
    </h1>
  );
}

function AboutPanelContent({ article }: { article: KBArticle }) {
  const latestVersion = article.versions[article.versions.length - 1];
  return (
    <div className="divide-y divide-[#edeff3]">
      <PropertyRow icon={<Eye className="w-4 h-4" />} label="Visibility">
        {article.visibility === 'current_unit_only' ? (
          <VisibilityBadge visibility={article.visibility} />
        ) : (
          <span>Public</span>
        )}
      </PropertyRow>
      <PropertyRow icon={<Calendar className="w-4 h-4" />} label="Created">
        <div className="flex flex-col">
          <span>{formatDate(article.createdAt)}</span>
          <span className="text-[12px] text-[#697a9b]">by {article.createdBy.name}</span>
        </div>
      </PropertyRow>
      <PropertyRow icon={<Calendar className="w-4 h-4" />} label="Updated">
        <div className="flex flex-col">
          <span>{formatDate(article.updatedAt)}</span>
          <span className="text-[12px] text-[#697a9b]">by {article.updatedBy.name}</span>
        </div>
      </PropertyRow>
      {latestVersion && (
        <PropertyRow icon={<Calendar className="w-4 h-4" />} label="Last published">
          <div className="flex flex-col">
            <span>
              v{latestVersion.version} on {formatDate(latestVersion.publishedAt)}
            </span>
            <span className="text-[12px] text-[#697a9b]">
              by {latestVersion.publishedBy.name}
            </span>
          </div>
        </PropertyRow>
      )}
      {article.draftContent !== null && article.draftUpdatedBy && article.draftUpdatedAt && (
        <PropertyRow icon={<Calendar className="w-4 h-4" />} label="Draft updated">
          <div className="flex flex-col">
            <span>{formatDate(article.draftUpdatedAt)}</span>
            <span className="text-[12px] text-[#697a9b]">
              by {article.draftUpdatedBy.name}
            </span>
          </div>
        </PropertyRow>
      )}
    </div>
  );
}

function PropertyRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 px-4 py-2.5">
      <span className="text-[#697a9b] mt-0.5 shrink-0">{icon}</span>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[12px] text-[#697a9b] leading-[16px]">{label}</span>
        <div className="text-[13px] text-[#1f242e] leading-[20px]">{children}</div>
      </div>
    </div>
  );
}

export function ArticleView({
  article,
  mode = 'view',
  onClose,
  onEdit,
  onEditCancel,
  onSaveEdit,
  onPublishEdit,
  onDiscardDraft,
  onRestoreVersion,
  onStatusChange,
  onMove,
  onDelete,
  onChangeVisibility,
  onTitleChange,
  onOwnerChange,
  onFolderChange,
}: ArticleViewProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isArchived = article.status === 'archived';
  const summaryEditable = !isArchived;
  const isEditing = mode === 'edit';
  const hasDraft = article.draftContent !== null;
  const latestVersion = article.versions[article.versions.length - 1] ?? null;
  const hasHistory = article.versions.length > 0;

  // Which version is the user previewing in view mode. In edit mode the
  // editor always shows the draft baseline (draftContent ?? content)
  // regardless of this selection.
  const initialSelection: VersionSelection =
    hasDraft ? 'draft' : latestVersion ? latestVersion.version : 'draft';
  const [versionSelection, setVersionSelection] =
    useState<VersionSelection>(initialSelection);
  const [activeRightPanelId, setActiveRightPanelId] = useState<string | null>(
    null
  );
  // Version that the user wants to restore, waiting on the confirmation
  // dialog. Null when the dialog is closed.
  const [pendingRestoreVersion, setPendingRestoreVersion] =
    useState<number | null>(null);

  // When opening a different article OR when the article's state shifts
  // (e.g. publish clears the draft), recompute the default selection so the
  // user lands on a sensible version.
  useEffect(() => {
    setVersionSelection(
      hasDraft ? 'draft' : latestVersion ? latestVersion.version : 'draft'
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article.id, hasDraft, latestVersion?.version]);

  // Resolve which HTML to render.
  const selectedContent = useMemo(() => {
    if (versionSelection === 'draft') {
      return article.draftContent ?? article.content;
    }
    const v = article.versions.find((vv) => vv.version === versionSelection);
    return v?.content ?? article.content;
  }, [versionSelection, article]);

  // The editor's source-of-truth content. In view mode it follows the
  // version selection so the user sees what they pick. In edit mode it
  // snaps to the draft baseline — edits always build on top of the
  // pending draft (or, for a never-published article, the live content).
  const editorContent = isEditing
    ? article.draftContent ?? article.content
    : selectedContent;

  const editorApiRef = useRef<LexicalArticleEditorApi | null>(null);

  // Keep the editor's HTML in sync with whatever the user wants to see:
  // when they switch versions, when they enter edit mode, or when a new
  // article opens.
  useEffect(() => {
    if (editorApiRef.current) {
      editorApiRef.current.setHtml(editorContent);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorContent]);

  const handleCancelEdit = () => {
    editorApiRef.current?.setHtml(article.draftContent ?? article.content);
    onEditCancel?.();
  };

  const handleSaveEdit = () => {
    const html = editorApiRef.current?.getHtml() ?? article.content;
    onSaveEdit?.(article, html);
    // After saving, land on the draft entry — that's the version the user
    // just touched, so reading it back is the most useful default.
    setVersionSelection('draft');
  };

  const handlePublishEdit = () => {
    const html = editorApiRef.current?.getHtml() ?? article.content;
    onPublishEdit?.(article, html);
  };

  const handleDiscardDraft = () => {
    onDiscardDraft?.(article);
  };

  // Resolve the viewing mode from the selection. 'current' covers two cases:
  // looking at the latest published snapshot, and the in-progress-only state
  // of a never-published article (where the draft IS the only content and
  // matches what would-be readers see).
  let viewing: ViewingMode = 'current';
  let viewingVersion: number | undefined;
  if (versionSelection === 'draft') {
    viewing = hasDraft ? 'draft' : 'current';
  } else if (latestVersion && versionSelection === latestVersion.version) {
    viewing = 'current';
  } else {
    viewing = 'older';
    viewingVersion = versionSelection;
  }

  const handleRestoreVersion = () => {
    if (viewing !== 'older' || viewingVersion === undefined) return;
    const v = article.versions.find((vv) => vv.version === viewingVersion);
    if (!v) return;
    // Confirm-and-overwrite path: open the custom dialog when a draft is
    // already pending. Otherwise restore directly.
    if (article.draftContent !== null) {
      setPendingRestoreVersion(viewingVersion);
      return;
    }
    onRestoreVersion?.(article, v.content);
  };

  const confirmRestoreVersion = () => {
    if (pendingRestoreVersion === null) return;
    const v = article.versions.find((vv) => vv.version === pendingRestoreVersion);
    setPendingRestoreVersion(null);
    if (v) onRestoreVersion?.(article, v.content);
  };

  const rightPanels: RightPanel[] = [
    {
      id: 'activity',
      label: 'Activity',
      icon: <MessageCircle className="w-4 h-4" />,
      content: <ArticleActivityPanel articleId={article.id} />,
    },
    {
      id: 'versions',
      label: 'Versions',
      icon: <History className="w-4 h-4" />,
      content: (
        <ArticleVersionsPanel
          article={article}
          // In edit mode the editor is bound to the draft baseline — pin the
          // highlight to the draft entry so the sidebar reflects reality.
          selection={isEditing ? 'draft' : versionSelection}
          onSelect={setVersionSelection}
          interactive={!isEditing}
        />
      ),
    },
    {
      id: 'about',
      label: 'About',
      icon: <Info className="w-4 h-4" />,
      content: <AboutPanelContent article={article} />,
    },
  ];

  // Title in the modal header.
  let modalTitle = 'Article';
  if (isEditing) {
    modalTitle = hasHistory ? 'Editing changes' : 'Editing article';
  }

  // Floating-bar copy.

  return (
    <EntityModal
      title={modalTitle}
      onClose={onClose}
      rightPanels={rightPanels}
      activeRightPanelId={activeRightPanelId}
      onChangeActiveRightPanel={setActiveRightPanelId}
    >
      <div className="relative flex flex-col min-h-full">
        {/* Sticky title bar (full width so it masks scrolling content) */}
        <div className="sticky top-0 z-20 bg-white">
          <div className="max-w-[1000px] mx-auto px-6 pt-4 pb-3 flex items-start gap-3">
            <InlineTitle
              title={article.title}
              editable={summaryEditable}
              onChange={(next) => onTitleChange?.(article, next)}
            />
            <div className="flex items-center gap-3 shrink-0">
              <VisibilityBadge visibility={article.visibility} />
              {!isArchived && !isEditing && viewing === 'older' && onRestoreVersion && (
                <button
                  onClick={handleRestoreVersion}
                  className="flex items-center gap-1.5 h-7 px-2 text-[13px] font-medium text-[#1f242e] border border-[#e0e4eb] rounded-lg hover:bg-[#fafbfc]"
                  title="Stage this version's content as a new draft"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#525f7a]" />
                  Restore this version
                </button>
              )}
              {onEdit && !isArchived && !isEditing && viewing !== 'older' && (
                <button
                  onClick={onEdit}
                  className="flex items-center gap-1.5 h-7 px-2 text-[13px] font-medium text-[#1f242e] border border-[#e0e4eb] rounded-lg hover:bg-[#fafbfc]"
                >
                  <Pencil className="w-3.5 h-3.5 text-[#525f7a]" />
                  Edit
                </button>
              )}
              {!isEditing &&
                viewing !== 'older' &&
                (article.status === 'draft' || viewing === 'draft') &&
                onStatusChange &&
                onPublishEdit && (
                  <button
                    onClick={() => {
                      // For never-published articles, publish the article
                      // body. For published articles with a draft, publish
                      // the draft content as the next version.
                      if (article.status === 'draft') {
                        onStatusChange(article, 'published');
                      } else {
                        onPublishEdit(
                          article,
                          article.draftContent ?? article.content
                        );
                      }
                    }}
                    className="flex items-center gap-1.5 h-7 px-2 text-[13px] font-medium text-white bg-[#006bd6] rounded-lg hover:bg-[#0052a3]"
                  >
                    {article.status === 'draft' ? 'Publish' : 'Publish changes'}
                  </button>
                )}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((p) => !p)}
                  className="flex items-center justify-center w-7 h-7 border border-[#e0e4eb] rounded-lg hover:bg-[#fafbfc]"
                >
                  <MoreHorizontal className="w-4 h-4 text-[#525f7a]" />
                </button>
                {menuOpen && (
                  <ArticleActionsMenu
                    article={article}
                    onClose={() => setMenuOpen(false)}
                    onStatusChange={(status) => onStatusChange?.(article, status)}
                    onMove={() => onMove?.(article)}
                    onDelete={() => onDelete?.(article)}
                    onDiscardDraft={
                      onDiscardDraft && hasDraft && !isEditing
                        ? () => onDiscardDraft(article)
                        : undefined
                    }
                    onChangeVisibility={
                      onChangeVisibility
                        ? () => onChangeVisibility(article)
                        : undefined
                    }
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Summary — scrolls away under the sticky title. Tighter gap in edit
            mode because the toolbar provides its own visual separation.
            Wrapped so `mx-auto` centers within the flex-column wrapper
            (a direct flex-col child stretches and breaks centering). */}
        <div>
        <div
          className={`max-w-[1000px] mx-auto px-6 ${
            !isEditing && viewing !== 'current' ? 'mb-3' : isEditing ? 'mb-3' : 'mb-[36px]'
          }`}
        >
          <ArticleSummaryFields
            article={article}
            editable={summaryEditable}
            viewing={viewing}
            viewingVersion={viewingVersion}
            hasDraft={hasDraft}
            onVersionChipClick={() => {
              // From the current-published preview, jump to the draft so
              // the user sees what's pending. Other view modes already
              // sit on a non-current version; just surface the sidebar.
              if (viewing === 'current' && hasDraft) {
                setVersionSelection('draft');
              }
              setActiveRightPanelId('versions');
            }}
            onStatusChange={(status) => onStatusChange?.(article, status)}
            onOwnerChange={(ownerId) => onOwnerChange?.(article, ownerId)}
            onFolderChange={(folderId) => onFolderChange?.(article, folderId)}
          />
        </div>
        </div>

        {/* Sticky banner when previewing a non-current version. Pinned just
            under the title bar so it stays visible while the user scrolls
            through the body content. */}
        {!isEditing && viewing !== 'current' && (
          <div className="sticky top-[58px] z-15 bg-white">
            <div className="max-w-[1000px] mx-auto px-6 pb-3">
              <div className="flex items-center gap-2 px-3 py-2 text-[13px] text-[#92400e] bg-[#fef3c7] border border-[#fcd34d] rounded-md">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span className="flex-1">
                  {viewing === 'draft'
                    ? 'Previewing unpublished changes — readers see the current published version.'
                    : `Viewing an older published version (v${viewingVersion}).`}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setVersionSelection(
                      hasDraft ? 'draft' : latestVersion?.version ?? 'draft'
                    )
                  }
                  className="text-[12px] font-medium text-[#92400e] hover:underline shrink-0"
                >
                  {viewing === 'draft' || !hasDraft ? 'View current' : 'View draft'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Article body — Lexical rendering. Outer wrapper carries `grow` so
            empty content still stretches the body down to the bottom of the
            viewport (anchors the sticky floating bar). Inner wrapper handles
            the centered max-width + padding. */}
        <div className="grow">
          <div
            className={`max-w-[1000px] mx-auto px-6 h-full ${
              isEditing ? 'pb-32' : 'pb-10'
            } ${
              !isEditing && viewing === 'older'
                ? 'border-l-[3px] border-[#a8b1c2]'
                : ''
            }`}
          >
            <LexicalArticleEditor
              ref={editorApiRef}
              initialHtml={editorContent}
              editable={isEditing}
              showToolbar={isEditing}
              toolbarClassName={
                isEditing
                  ? 'sticky top-[58px] z-10 bg-white -mx-6 mb-3'
                  : undefined
              }
            />
          </div>
        </div>

        {/* Floating action bar when editing */}
        {isEditing && (
          <div className="sticky bottom-4 z-30 flex justify-center pointer-events-none px-6">
            <div className="pointer-events-auto inline-flex items-center gap-2 bg-white border border-[#e0e4eb] rounded-lg shadow-[0px_4px_12px_rgba(31,36,46,0.16)] px-2 py-1.5">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="h-7 px-3 text-[13px] font-medium text-[#1f242e] border border-[#e0e4eb] rounded-lg hover:bg-[#fafbfc]"
              >
                Cancel
              </button>
              {hasDraft && onDiscardDraft && (
                <button
                  type="button"
                  onClick={handleDiscardDraft}
                  className="h-7 px-3 text-[13px] font-medium text-red-600 border border-[#e0e4eb] rounded-lg hover:bg-[#fef2f2]"
                >
                  Discard changes
                </button>
              )}
              <button
                type="button"
                onClick={handleSaveEdit}
                className="h-7 px-3 text-[13px] font-medium text-[#1f242e] border border-[#e0e4eb] rounded-lg hover:bg-[#fafbfc]"
              >
                Save changes
              </button>
              <button
                type="button"
                onClick={handlePublishEdit}
                className="h-7 px-3 text-[13px] font-medium text-white bg-[#006bd6] rounded-lg hover:bg-[#0052a3]"
              >
                Publish changes
              </button>
            </div>
          </div>
        )}
      </div>
      {pendingRestoreVersion !== null && (
        <RestoreVersionDialog
          version={pendingRestoreVersion}
          onConfirm={confirmRestoreVersion}
          onCancel={() => setPendingRestoreVersion(null)}
        />
      )}
    </EntityModal>
  );
}
