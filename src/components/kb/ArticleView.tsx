import { useEffect, useRef, useState } from 'react';
import {
  MoreHorizontal,
  Eye,
  Calendar,
  Info,
  MessageCircle,
  Pencil,
} from 'lucide-react';
import type { KBArticle, ArticleStatus } from '@/types';
import { EntityModal, type RightPanel } from '../shared/EntityModal';
import { VisibilityBadge } from './VisibilityBadge';
import { ArticleActionsMenu } from './ArticleActionsMenu';
import { ArticleSummaryFields } from './ArticleSummaryFields';
import { ArticleActivityPanel } from './ArticleActivityPanel';
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
  /** Called when user clicks Save in the floating bar; receives the new content
   *  HTML. Parent persists it (status, title etc. preserved). */
  onEditSave?: (article: KBArticle, content: string) => void;
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

  // Keep draft in sync if the article changes from outside.
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
      {article.publishedAt && (
        <PropertyRow icon={<Calendar className="w-4 h-4" />} label="Published">
          {formatDate(article.publishedAt)}
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
  onEditSave,
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

  // Imperative handle for the Lexical editor. We need to pull HTML out for
  // save and push it back in for cancel/revert.
  const editorApiRef = useRef<LexicalArticleEditorApi | null>(null);

  // When entering edit mode after a save, snap the editor back to the
  // persisted content (avoids stale draft from a previous edit session).
  useEffect(() => {
    if (isEditing && editorApiRef.current) {
      editorApiRef.current.setHtml(article.content);
    }
    // Only re-sync on mode flip / article id change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, article.id]);

  const handleCancelEdit = () => {
    editorApiRef.current?.setHtml(article.content);
    onEditCancel?.();
  };

  const handleSaveEdit = () => {
    const html = editorApiRef.current?.getHtml() ?? article.content;
    onEditSave?.(article, html);
  };

  const rightPanels: RightPanel[] = [
    {
      id: 'about',
      label: 'About',
      icon: <Info className="w-4 h-4" />,
      content: <AboutPanelContent article={article} />,
    },
    {
      id: 'activity',
      label: 'Activity',
      icon: <MessageCircle className="w-4 h-4" />,
      content: <ArticleActivityPanel articleId={article.id} />,
    },
  ];

  return (
    <EntityModal
      title={isEditing ? 'Editing article' : 'Article'}
      onClose={onClose}
      rightPanels={rightPanels}
    >
      <div className="relative min-h-full">
        {/* Sticky title bar (full width so it masks scrolling content) */}
        <div className="sticky top-0 z-20 bg-white">
          <div className="max-w-[1000px] mx-auto px-6 pt-4 pb-3 flex items-start gap-3">
            <InlineTitle
              title={article.title}
              editable={summaryEditable}
              onChange={(next) => onTitleChange?.(article, next)}
            />
            <div className="flex items-center gap-1.5 shrink-0">
              <VisibilityBadge visibility={article.visibility} />
              {onEdit && !isArchived && !isEditing && (
                <button
                  onClick={onEdit}
                  className="flex items-center gap-1.5 h-7 px-2 text-[13px] font-medium text-[#1f242e] border border-[#e0e4eb] rounded-lg hover:bg-[#fafbfc]"
                >
                  <Pencil className="w-3.5 h-3.5 text-[#525f7a]" />
                  Edit
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
            mode because the toolbar provides its own visual separation. */}
        <div
          className={`max-w-[1000px] mx-auto px-6 ${
            isEditing ? 'mb-3' : 'mb-[36px]'
          }`}
        >
          <ArticleSummaryFields
            article={article}
            editable={summaryEditable}
            onStatusChange={(status) => onStatusChange?.(article, status)}
            onOwnerChange={(ownerId) => onOwnerChange?.(article, ownerId)}
            onFolderChange={(folderId) => onFolderChange?.(article, folderId)}
          />
        </div>

        {/* Article body — Lexical rendering. The editor renders its own
            toolbar when `showToolbar`; in edit mode we pass sticky classes so
            the toolbar pins flush under the sticky title. */}
        <div
          className={`max-w-[1000px] mx-auto px-6 ${
            isEditing ? 'pb-32' : 'pb-10'
          }`}
        >
          <LexicalArticleEditor
            ref={editorApiRef}
            initialHtml={article.content}
            editable={isEditing}
            showToolbar={isEditing}
            toolbarClassName={
              isEditing
                ? 'sticky top-[58px] z-10 bg-white -mx-6 mb-3'
                : undefined
            }
          />
        </div>

        {/* Floating action bar when editing */}
        {isEditing && (
          <div className="sticky bottom-4 z-30 flex justify-center pointer-events-none px-6">
            <div className="pointer-events-auto inline-flex items-center gap-3 bg-white border border-[#e0e4eb] rounded-lg shadow-[0px_4px_12px_rgba(31,36,46,0.16)] pl-4 pr-2 py-1.5">
              <span className="text-[13px] font-medium text-[#525f7a]">
                Editing article
              </span>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="h-7 px-3 text-[13px] font-medium text-[#1f242e] border border-[#e0e4eb] rounded-lg hover:bg-[#fafbfc]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="h-7 px-3 text-[13px] font-medium text-white bg-[#006bd6] rounded-lg hover:bg-[#0052a3]"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </EntityModal>
  );
}
