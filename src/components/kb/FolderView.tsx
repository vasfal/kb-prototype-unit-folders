import { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  ChevronRight,
  Lock,
  Plus,
  MoreHorizontal,
  Archive,
  RotateCcw,
} from 'lucide-react';
import type { KBArticle, KBFolder, ArticleStatus } from '@/types';
import {
  getFolder,
  getChildFolders,
  getArticlesInFolder,
  getArticleCount,
  getUnit,
  getFolderPath,
  getFolderDisplayStyle,
} from '@/data/mock-data';
import { ArticleRow, ArticleCard } from './ArticleCard';
import { VisibilityBadge } from './VisibilityBadge';
import { EmptyState } from './EmptyState';
import { buildFolderActions, type FolderAction } from './FolderTree';
import {
  applyArticleFilters,
  isFiltersActive,
  type ArticleFilters,
} from './article-filters';

interface FolderViewProps {
  folderId: string;
  viewingUnitId: string;
  viewMode: 'grid' | 'list';
  showArchived: boolean;
  filters: ArticleFilters;
  onSelectFolder: (folderId: string) => void;
  onArticleClick?: (article: KBArticle) => void;
  onCreateArticle?: () => void;
  onFolderAction?: (action: FolderAction, folder: KBFolder) => void;
  onArticleStatusChange?: (article: KBArticle, status: ArticleStatus) => void;
  onArticleMove?: (article: KBArticle) => void;
  onArticleDelete?: (article: KBArticle) => void;
}

function FolderHeaderMenu({
  folder,
  onAction,
  onClose,
}: {
  folder: KBFolder;
  onAction: (action: FolderAction, folder: KBFolder) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  const items = buildFolderActions(folder);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-1 bg-white border border-[#e0e4eb] rounded-lg shadow-[0px_4px_12px_rgba(31,36,46,0.12)] z-20 py-1 min-w-[180px]"
    >
      {items.map((item) => (
        <button
          key={item.action}
          type="button"
          disabled={item.disabled}
          onClick={() => {
            if (item.disabled) return;
            onAction(item.action, folder);
            onClose();
          }}
          className={`flex items-center gap-2 w-full px-3 py-1.5 text-[13px] text-left ${
            item.disabled
              ? 'text-[#a8b1c2] cursor-not-allowed'
              : item.danger
              ? 'text-red-600 hover:bg-[#fafbfc]'
              : 'text-[#1f242e] hover:bg-[#fafbfc]'
          }`}
        >
          <span
            className={
              item.disabled
                ? 'text-[#a8b1c2]'
                : item.danger
                ? 'text-red-600'
                : 'text-[#697a9b]'
            }
          >
            {item.icon}
          </span>
          {item.label}
        </button>
      ))}
    </div>
  );
}

/** Small colored icon used in folder tiles and breadcrumb. */
function FolderIcon({
  color,
  dimmed,
  size = 'md',
}: {
  color: string;
  dimmed?: boolean;
  size?: 'sm' | 'md';
}) {
  const box = size === 'md' ? 'w-7 h-7' : 'w-5 h-5';
  const icon = size === 'md' ? 'w-4 h-4' : 'w-3 h-3';
  return (
    <div
      className={`${box} rounded-lg flex items-center justify-center shrink-0 ${
        dimmed ? 'opacity-60' : ''
      }`}
      style={{ backgroundColor: color }}
    >
      <BookOpen className={`${icon} text-white`} strokeWidth={2} />
    </div>
  );
}

/** Articles rendered as either a 3-col card grid or a table. */
function ArticleListBlock({
  articles,
  viewMode,
  onArticleClick,
  onArticleStatusChange,
  onArticleMove,
  onArticleDelete,
}: {
  articles: KBArticle[];
  viewMode: 'grid' | 'list';
  onArticleClick?: (article: KBArticle) => void;
  onArticleStatusChange?: (article: KBArticle, status: ArticleStatus) => void;
  onArticleMove?: (article: KBArticle) => void;
  onArticleDelete?: (article: KBArticle) => void;
}) {
  if (articles.length === 0) return null;
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-3 gap-3 px-4 pb-4">
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            onClick={() => onArticleClick?.(article)}
            onStatusChange={onArticleStatusChange}
            onMove={onArticleMove}
            onDelete={onArticleDelete}
          />
        ))}
      </div>
    );
  }
  return (
    <table className="w-full table-fixed">
      <thead>
        <tr className="border-y border-[#edeff3] bg-[#fafbfc]">
          <th className="text-left text-[12px] font-medium text-[#697a9b] py-2 pl-4 pr-4">
            Article
          </th>
          <th className="text-left text-[12px] font-medium text-[#697a9b] py-2 pr-4 w-[140px]">
            Unit
          </th>
          <th className="text-left text-[12px] font-medium text-[#697a9b] py-2 pr-4 w-[100px]">
            Status
          </th>
          <th className="text-left text-[12px] font-medium text-[#697a9b] py-2 pr-4 w-[100px]">
            Updated
          </th>
          <th className="text-left text-[12px] font-medium text-[#697a9b] py-2 pr-4 w-[180px]">
            Owner
          </th>
          <th className="w-[44px] py-2 pr-2"></th>
        </tr>
      </thead>
      <tbody>
        {articles.map((article) => (
          <ArticleRow
            key={article.id}
            article={article}
            onClick={() => onArticleClick?.(article)}
            onStatusChange={onArticleStatusChange}
            onMove={onArticleMove}
            onDelete={onArticleDelete}
          />
        ))}
      </tbody>
    </table>
  );
}

/** A clickable tile representing a sub-folder. Click → drill into it. */
function SubFolderTile({
  folder,
  viewingUnitId,
  onSelect,
}: {
  folder: KBFolder;
  viewingUnitId: string;
  onSelect: (id: string) => void;
}) {
  const count = getArticleCount(folder.id, viewingUnitId);
  const displayStyle = getFolderDisplayStyle(folder.id);
  const isArchived = folder.status === 'archived';
  const isPrivate = folder.visibility === 'current_unit_only';
  return (
    <button
      type="button"
      onClick={() => onSelect(folder.id)}
      className="flex items-center gap-2.5 p-3 bg-white border border-[#edeff3] rounded-xl shadow-[0px_1px_2px_0px_rgba(31,36,46,0.05)] hover:border-[#d0d5dd] transition-colors text-left min-w-0 select-none"
      title={`Open ${folder.name}`}
    >
      <FolderIcon color={displayStyle.color} dimmed={isArchived} size="md" />
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <span
            className={`text-[14px] font-medium leading-[18px] truncate ${
              isArchived ? 'text-[#697a9b] line-through' : 'text-[#1f242e]'
            }`}
          >
            {folder.name}
          </span>
          {!isArchived && isPrivate && (
            <Lock className="w-3 h-3 text-[#697a9b] shrink-0" strokeWidth={2} />
          )}
        </div>
        <span className="text-[12px] leading-[14px] text-[#697a9b]">
          {count} {count === 1 ? 'article' : 'articles'}
        </span>
      </div>
    </button>
  );
}

/** Breadcrumb showing the folder's ancestor path. Each crumb is clickable.
 *  A small folder icon (root's color) sits at the start so the section is
 *  identifiable at a glance, matching the FOLDERS tile style below. */
function Breadcrumb({
  folder,
  onSelectFolder,
}: {
  folder: KBFolder;
  onSelectFolder: (id: string) => void;
}) {
  const path = getFolderPath(folder.id);
  const displayStyle = getFolderDisplayStyle(folder.id);
  const isArchived = folder.status === 'archived';
  return (
    <nav className="flex items-center gap-1.5 text-[13px] min-w-0 flex-1">
      <FolderIcon color={displayStyle.color} dimmed={isArchived} size="sm" />
      {path.map((node, i) => {
        const isLast = i === path.length - 1;
        return (
          <span key={node.id} className="flex items-center gap-1 min-w-0">
            {i > 0 && (
              <ChevronRight className="w-3.5 h-3.5 text-[#a8b1c2] shrink-0" />
            )}
            {isLast ? (
              <span className="text-[#1f242e] font-medium truncate">
                {node.name}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onSelectFolder(node.id)}
                className="text-[#525f7a] hover:text-[#0052a3] truncate"
              >
                {node.name}
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export function FolderView({
  folderId,
  viewingUnitId,
  viewMode,
  showArchived,
  filters,
  onSelectFolder,
  onArticleClick,
  onCreateArticle,
  onFolderAction,
  onArticleStatusChange,
  onArticleMove,
  onArticleDelete,
}: FolderViewProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const folder = getFolder(folderId);
  if (!folder) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          title="Folder not found"
          description="This folder may have been moved or archived."
        />
      </div>
    );
  }

  const isOwn = folder.unitId === viewingUnitId;
  const isArchived = folder.status === 'archived';
  const sourceUnit = getUnit(folder.unitId);
  const subFolders = getChildFolders(folderId, {
    includeArchived: showArchived && isOwn,
  });
  const allArticles = getArticlesInFolder(folderId, viewingUnitId, {
    includeArchived: showArchived && isOwn,
  });
  const articles = applyArticleFilters(allArticles, filters);
  const hiddenByFilters =
    isFiltersActive(filters) && allArticles.length > 0 && articles.length === 0;

  // True emptiness ignores filters — there's genuinely no content here.
  const isEmpty =
    subFolders.length === 0 && allArticles.length === 0;

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-white">
      {/* Breadcrumb bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#edeff3] shrink-0">
        <Breadcrumb folder={folder} onSelectFolder={onSelectFolder} />
        <div className="flex items-center gap-1.5 shrink-0">
          <VisibilityBadge visibility={folder.visibility} />
          {isArchived && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-medium text-[#525f7a] bg-[#fafbfc] border border-[#e0e4eb] rounded">
              <Archive className="w-3 h-3" />
              Archived
            </span>
          )}
          {!isOwn && sourceUnit && (
            <span className="inline-flex items-center px-1.5 py-0.5 text-[11px] font-medium text-[#525f7a] bg-[#fafbfc] border border-[#e0e4eb] rounded">
              Shared from {sourceUnit.name}
            </span>
          )}
          {isOwn && isArchived && onFolderAction && (
            <button
              type="button"
              onClick={() => onFolderAction('restore', folder)}
              className="flex items-center gap-1.5 h-7 px-2 text-[13px] font-medium text-[#1f242e] border border-[#e0e4eb] rounded-lg hover:bg-[#fafbfc]"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#525f7a]" />
              Restore folder
            </button>
          )}
          {isOwn && !isArchived && onFolderAction && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((p) => !p)}
                className="flex items-center justify-center w-7 h-7 border border-[#e0e4eb] rounded-lg hover:bg-[#fafbfc]"
                title="Folder actions"
              >
                <MoreHorizontal className="w-4 h-4 text-[#525f7a]" />
              </button>
              {menuOpen && (
                <FolderHeaderMenu
                  folder={folder}
                  onAction={onFolderAction}
                  onClose={() => setMenuOpen(false)}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {isEmpty ? (
          <EmptyState
            title={
              isArchived
                ? 'This archived folder is empty'
                : isOwn
                ? 'This folder is empty'
                : 'Nothing to show here'
            }
            description={
              isArchived
                ? 'Restore this folder to start adding articles again.'
                : isOwn
                ? 'Create an article to add content to this folder.'
                : 'No published articles are visible to your unit yet.'
            }
            action={
              !isArchived && isOwn ? (
                <button
                  type="button"
                  onClick={onCreateArticle}
                  className="flex items-center gap-2 px-3 py-1.5 text-[14px] font-medium text-white bg-[#006bd6] rounded-lg hover:bg-[#0052a3]"
                >
                  <Plus className="w-4 h-4" />
                  Create article
                </button>
              ) : undefined
            }
          />
        ) : (
          <>
            {subFolders.length > 0 && (
              <section className="px-4 pt-4 pb-4 border-b border-[#edeff3]">
                <h2 className="text-[11px] font-medium uppercase tracking-wide text-[#697a9b] mb-2">
                  Folders · {subFolders.length}
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  {subFolders.map((sf) => (
                    <SubFolderTile
                      key={sf.id}
                      folder={sf}
                      viewingUnitId={viewingUnitId}
                      onSelect={onSelectFolder}
                    />
                  ))}
                </div>
              </section>
            )}

            {articles.length > 0 ? (
              <section className="pt-4">
                <h2 className="text-[11px] font-medium uppercase tracking-wide text-[#697a9b] mb-2 px-4">
                  Articles · {articles.length}
                </h2>
                <ArticleListBlock
                  articles={articles}
                  viewMode={viewMode}
                  onArticleClick={onArticleClick}
                  onArticleStatusChange={onArticleStatusChange}
                  onArticleMove={onArticleMove}
                  onArticleDelete={onArticleDelete}
                />
              </section>
            ) : (
              hiddenByFilters && (
                <div className="px-4 py-6 text-[13px] text-[#697a9b] italic text-center">
                  No articles match the current filters.
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}
