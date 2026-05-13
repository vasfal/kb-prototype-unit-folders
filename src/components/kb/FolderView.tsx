import { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  ChevronRight,
  ChevronDown,
  Plus,
  MoreHorizontal,
  Archive,
  RotateCcw,
} from 'lucide-react';
import type { KBArticle, KBFolder } from '@/types';
import {
  getFolder,
  getChildFolders,
  getArticlesInFolder,
  getArticleCount,
  getUnit,
  getFolderDisplayStyle,
} from '@/data/mock-data';
import { ArticleRow, ArticleCard } from './ArticleCard';
import { VisibilityBadge } from './VisibilityBadge';
import { EmptyState } from './EmptyState';
import { buildFolderActions, type FolderAction } from './FolderTree';

interface FolderViewProps {
  folderId: string;
  viewingUnitId: string;
  viewMode: 'grid' | 'list';
  showArchived: boolean;
  onSelectFolder: (folderId: string) => void;
  onArticleClick?: (article: KBArticle) => void;
  onCreateArticle?: () => void;
  onFolderAction?: (action: FolderAction, folder: KBFolder) => void;
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
              ? 'text-[#d97706] hover:bg-[#fafbfc]'
              : 'text-[#1f242e] hover:bg-[#fafbfc]'
          }`}
        >
          <span
            className={
              item.disabled
                ? 'text-[#a8b1c2]'
                : item.danger
                ? 'text-[#d97706]'
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

/** Colored rounded-square icon used in folder + sub-folder headers.
 *  When `collapsed` is provided, the BookOpen icon swaps to a chevron on hover
 *  (over the parent `group`), giving a click-to-expand affordance. */
export function FolderIcon({
  color,
  size = 'md',
  dimmed,
  collapsed,
}: {
  color: string;
  size?: 'sm' | 'md';
  dimmed?: boolean;
  collapsed?: boolean;
}) {
  const sizeClasses = size === 'md' ? 'w-7 h-7' : 'w-6 h-6';
  const iconClasses = size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';
  const showChevron = collapsed !== undefined;
  return (
    <div
      className={`${sizeClasses} rounded-lg flex items-center justify-center shrink-0 ${
        dimmed ? 'opacity-60' : ''
      }`}
      style={{ backgroundColor: color }}
    >
      <BookOpen
        className={`${iconClasses} text-white ${
          showChevron ? 'block group-hover:hidden' : 'block'
        }`}
        strokeWidth={2}
      />
      {showChevron &&
        (collapsed ? (
          <ChevronRight
            className={`${iconClasses} text-white hidden group-hover:block`}
          />
        ) : (
          <ChevronDown
            className={`${iconClasses} text-white hidden group-hover:block`}
          />
        ))}
    </div>
  );
}

/** Renders a folder's articles as either a card grid or a table.
 *  Used both for the parent folder's direct articles and for each
 *  sub-folder section. `indentPx` shifts the content to the right so
 *  it aligns with a nested FolderSection's header. */
export function ArticleListBlock({
  articles,
  viewMode,
  indentPx = 0,
  onArticleClick,
}: {
  articles: KBArticle[];
  viewMode: 'grid' | 'list';
  indentPx?: number;
  onArticleClick?: (article: KBArticle) => void;
}) {
  if (articles.length === 0) return null;
  if (viewMode === 'grid') {
    return (
      <div
        className="grid grid-cols-3 gap-3 pr-4 pb-4"
        style={{ paddingLeft: 16 + indentPx }}
      >
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            onClick={() => onArticleClick?.(article)}
          />
        ))}
      </div>
    );
  }
  return (
    <div style={{ paddingLeft: indentPx }}>
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
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** A folder rendered inline as a collapsible section with its own articles.
 *  Click the icon to toggle collapse; click the name to navigate into the folder.
 *  Chevron is hidden by default and revealed on hover.
 *
 *  When `recursive` is true, the section also renders nested sub-folder sections
 *  with `depth` bumped by 1, producing the visual nesting hierarchy. */
export function FolderSection({
  folder,
  viewingUnitId,
  showArchived,
  viewMode,
  size = 'sm',
  recursive,
  search,
  depth = 0,
  onArticleClick,
  onSelectFolder,
}: {
  folder: KBFolder;
  viewingUnitId: string;
  showArchived: boolean;
  viewMode: 'grid' | 'list';
  size?: 'sm' | 'md';
  recursive?: boolean;
  search?: string;
  /** Nesting depth inside the rendering parent. 0 = first level below the
   *  selected folder; 1 = one level deeper. Controls indentation and
   *  header styling so the hierarchy is readable past 2 levels. */
  depth?: number;
  onArticleClick?: (article: KBArticle) => void;
  onSelectFolder: (folderId: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const isOwn = folder.unitId === viewingUnitId;
  const isArchived = folder.status === 'archived';
  const allArticles = getArticlesInFolder(folder.id, viewingUnitId, {
    includeArchived: showArchived && isOwn,
  });
  const trimmed = search?.trim().toLowerCase() ?? '';
  const articles = trimmed
    ? allArticles.filter((a) => a.title.toLowerCase().includes(trimmed))
    : allArticles;

  const subFolders = recursive
    ? getChildFolders(folder.id, { includeArchived: showArchived && isOwn })
    : [];

  // When searching, hide a section if neither it nor any sub-folder match.
  if (trimmed && articles.length === 0) {
    const hasSubMatch = subFolders.some((sf) =>
      getArticlesInFolder(sf.id, viewingUnitId, {
        includeArchived: showArchived && isOwn,
      }).some((a) => a.title.toLowerCase().includes(trimmed))
    );
    if (!hasSubMatch) return null;
  }

  const count = getArticleCount(folder.id, viewingUnitId);
  const displayStyle = getFolderDisplayStyle(folder.id);
  const nested = depth > 0;
  const indentPx = depth * 24;
  const titleClasses = nested
    ? 'text-[13px] font-medium leading-[18px]'
    : size === 'md'
    ? 'text-[16px] font-semibold leading-[24px]'
    : 'text-[14px] font-medium leading-[20px]';
  const titleColor = isArchived
    ? 'text-[#697a9b] line-through'
    : nested
    ? 'text-[#525f7a]'
    : 'text-[#1f242e]';
  const headerPadY = nested ? 'py-2.5' : 'py-4';
  const iconSize = nested ? 'sm' : size;

  return (
    <div className={nested ? '' : 'border-b border-[#edeff3]'}>
      <div
        className={`flex items-center gap-2 pr-4 ${headerPadY}`}
        style={{ paddingLeft: 16 + indentPx }}
      >
        <button
          type="button"
          onClick={() => setCollapsed((p) => !p)}
          className="group shrink-0"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          <FolderIcon
            color={displayStyle.color}
            size={iconSize}
            dimmed={isArchived}
            collapsed={collapsed}
          />
        </button>
        <button
          type="button"
          onClick={() => onSelectFolder(folder.id)}
          className="flex items-center gap-2 flex-1 min-w-0 text-left"
          title={`Open ${folder.name}`}
        >
          <span className={`${titleClasses} ${titleColor} truncate`}>
            {folder.name}
          </span>
          <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[12px] font-medium text-[#525f7a] bg-white border border-[#e0e4eb] rounded-lg min-w-[24px] text-center leading-[16px] shrink-0">
            {count}
          </span>
          {isArchived && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-medium text-[#525f7a] bg-[#fafbfc] border border-[#e0e4eb] rounded shrink-0">
              <Archive className="w-3 h-3" />
              Archived
            </span>
          )}
        </button>
      </div>
      {!collapsed && (
        <>
          {articles.length > 0 ? (
            <ArticleListBlock
              articles={articles}
              viewMode={viewMode}
              indentPx={indentPx}
              onArticleClick={onArticleClick}
            />
          ) : (
            !recursive && (
              <div
                className="pr-4 pb-4 text-[13px] text-[#697a9b] italic"
                style={{ paddingLeft: 16 + indentPx }}
              >
                No articles in this folder yet.
              </div>
            )
          )}
          {recursive &&
            subFolders.map((sf) => (
              <FolderSection
                key={sf.id}
                folder={sf}
                viewingUnitId={viewingUnitId}
                showArchived={showArchived}
                viewMode={viewMode}
                size="sm"
                recursive
                search={search}
                depth={depth + 1}
                onArticleClick={onArticleClick}
                onSelectFolder={onSelectFolder}
              />
            ))}
        </>
      )}
    </div>
  );
}

export function FolderView({
  folderId,
  viewingUnitId,
  viewMode,
  showArchived,
  onSelectFolder,
  onArticleClick,
  onCreateArticle,
  onFolderAction,
}: FolderViewProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const folder = getFolder(folderId);
  if (!folder) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState title="Folder not found" description="This folder may have been moved or archived." />
      </div>
    );
  }

  const isOwn = folder.unitId === viewingUnitId;
  const isArchived = folder.status === 'archived';
  const isSubFolder = folder.parentFolderId !== null;
  const sourceUnit = getUnit(folder.unitId);
  const subFolders = getChildFolders(folderId, { includeArchived: showArchived && isOwn });
  const articles = getArticlesInFolder(folderId, viewingUnitId, {
    includeArchived: showArchived && isOwn,
  });
  const totalCount = getArticleCount(folderId, viewingUnitId);
  const displayStyle = getFolderDisplayStyle(folderId);

  const isEmpty = subFolders.length === 0 && articles.length === 0;

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-white">
      {/* Folder header */}
      <div className="px-4 py-4 shrink-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCollapsed((p) => !p)}
            className="group shrink-0"
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            <FolderIcon
              color={displayStyle.color}
              size={isSubFolder ? 'sm' : 'md'}
              dimmed={isArchived}
              collapsed={collapsed}
            />
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
            <h1
              className={`${
                isSubFolder
                  ? 'text-[14px] font-medium leading-[20px]'
                  : 'text-[16px] font-semibold leading-[24px]'
              } ${
                isArchived ? 'text-[#697a9b] line-through' : 'text-[#1f242e]'
              }`}
            >
              {folder.name}
            </h1>
            <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[12px] font-medium text-[#525f7a] bg-white border border-[#e0e4eb] rounded-lg min-w-[24px] text-center leading-[16px]">
              {totalCount}
            </span>
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
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
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
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {collapsed ? null : isEmpty ? (
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
            {/* Direct articles in this folder */}
            {articles.length > 0 && (
              <div className="border-b border-[#edeff3]">
                <ArticleListBlock
                  articles={articles}
                  viewMode={viewMode}
                  onArticleClick={onArticleClick}
                />
              </div>
            )}

            {/* Sub-folders inline as collapsible sections — recursive so that
                a level-1 folder also surfaces its level-3 descendants. */}
            {subFolders.map((sf) => (
              <FolderSection
                key={sf.id}
                folder={sf}
                viewingUnitId={viewingUnitId}
                showArchived={showArchived}
                viewMode={viewMode}
                size="sm"
                recursive
                onArticleClick={onArticleClick}
                onSelectFolder={onSelectFolder}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
