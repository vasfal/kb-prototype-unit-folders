import { useMemo, useState } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  FolderClosed,
  Building2,
  MoreHorizontal,
} from 'lucide-react';
import type { KBArticle, KBFolder } from '@/types';
import {
  getAllVisibleArticles,
  getFolder,
  getFolderPath,
  getUnit,
} from '@/data/mock-data';
import { useFolderVersion } from '@/state/folder-store';
import { StatusBadge } from './StatusBadge';
import { ArticleCard } from './ArticleCard';
import { EmptyState } from './EmptyState';

interface AllArticlesViewProps {
  viewingUnitId: string;
  showArchived: boolean;
  showSubUnits: boolean;
  viewMode: 'grid' | 'list';
  /** Search query lifted from the toolbar; filters by article title. */
  search: string;
  onArticleClick?: (article: KBArticle) => void;
  onSelectFolder?: (folderId: string) => void;
}

type SortKey = 'title' | 'folder' | 'unit' | 'status' | 'updated' | 'owner';
type SortDir = 'asc' | 'desc';

function timeAgo(iso: string): string {
  const now = new Date();
  const d = new Date(iso);
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 1) return 'today';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

const avatarColors = [
  '#006bd6', '#7c3aed', '#0891b2', '#059669', '#d97706',
  '#dc2626', '#be185d', '#4f46e5', '#0d9488', '#ca8a04',
];

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

const statusOrder: Record<string, number> = { published: 0, draft: 1, archived: 2 };

function HeaderCell({
  label,
  sortKey,
  active,
  dir,
  onClick,
  className,
}: {
  label: string;
  sortKey: SortKey;
  active: SortKey;
  dir: SortDir;
  onClick: (key: SortKey) => void;
  className?: string;
}) {
  const isActive = active === sortKey;
  return (
    <th className={`text-left text-[12px] font-medium text-[#697a9b] py-2 pr-4 ${className ?? ''}`}>
      <button
        type="button"
        onClick={() => onClick(sortKey)}
        className={`inline-flex items-center gap-1 hover:text-[#1f242e] ${
          isActive ? 'text-[#1f242e]' : ''
        }`}
      >
        {label}
        {isActive ? (
          dir === 'asc' ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )
        ) : (
          <ChevronsUpDown className="w-3 h-3 opacity-40" />
        )}
      </button>
    </th>
  );
}

interface FolderSection {
  folderId: string;
  folder: KBFolder | undefined;
  path: string;
  articles: KBArticle[];
}

export function AllArticlesView({
  viewingUnitId,
  showArchived,
  showSubUnits,
  viewMode,
  search,
  onArticleClick,
  onSelectFolder,
}: AllArticlesViewProps) {
  const version = useFolderVersion();
  const [sortKey, setSortKey] = useState<SortKey>('updated');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [collapsedFolders, setCollapsedFolders] = useState<Set<string>>(new Set());

  const articles = useMemo(
    () =>
      getAllVisibleArticles(viewingUnitId, {
        includeArchived: showArchived,
        includeSubUnits: showSubUnits,
        search,
      }),
    // version triggers re-fetch on any KB mutation
    [viewingUnitId, showArchived, showSubUnits, search, version]
  );

  const sorted = useMemo(() => {
    const arr = [...articles];
    const dirMul = sortDir === 'asc' ? 1 : -1;
    arr.sort((a, b) => {
      switch (sortKey) {
        case 'title':
          return a.title.localeCompare(b.title) * dirMul;
        case 'folder': {
          const fa = getFolder(a.folderId)?.name ?? '';
          const fb = getFolder(b.folderId)?.name ?? '';
          return fa.localeCompare(fb) * dirMul;
        }
        case 'unit': {
          const ua = getUnit(a.unitId)?.name ?? '';
          const ub = getUnit(b.unitId)?.name ?? '';
          return ua.localeCompare(ub) * dirMul;
        }
        case 'status':
          return (statusOrder[a.status] - statusOrder[b.status]) * dirMul;
        case 'owner':
          return a.owner.name.localeCompare(b.owner.name) * dirMul;
        case 'updated':
        default:
          return (
            (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) *
            dirMul
          );
      }
    });
    return arr;
  }, [articles, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'updated' ? 'desc' : 'asc');
    }
  };

  // Group articles by folder for grid mode. Sections are sorted by folder path
  // so a sub-folder appears right after its parent.
  const sections = useMemo<FolderSection[]>(() => {
    if (viewMode !== 'grid') return [];
    const groups = new Map<string, KBArticle[]>();
    for (const a of articles) {
      const arr = groups.get(a.folderId) ?? [];
      arr.push(a);
      groups.set(a.folderId, arr);
    }
    const list: FolderSection[] = [];
    for (const [folderId, items] of groups.entries()) {
      const folder = getFolder(folderId);
      const path = folder
        ? getFolderPath(folderId)
            .map((f) => f.name)
            .join(' / ')
        : 'Unknown folder';
      items.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      list.push({ folderId, folder, path, articles: items });
    }
    list.sort((a, b) => a.path.localeCompare(b.path));
    return list;
  }, [articles, viewMode]);

  const toggleFolderCollapse = (folderId: string) => {
    setCollapsedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) next.delete(folderId);
      else next.add(folderId);
      return next;
    });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-white">
      {/* Header */}
      <div className="px-4 py-4 border-b border-[#edeff3] shrink-0">
        <h1 className="text-[20px] font-semibold text-[#1f242e] leading-[28px]">
          All articles
        </h1>
        <div className="text-[12px] text-[#697a9b] mt-0.5">
          {articles.length} article{articles.length === 1 ? '' : 's'} visible to this unit
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto">
        {sorted.length === 0 ? (
          <EmptyState
            title={search ? 'No articles match your search' : 'No articles yet'}
            description={
              search
                ? 'Try a different keyword or clear the search.'
                : 'Articles you can access in this unit and from shared content will appear here.'
            }
          />
        ) : viewMode === 'grid' ? (
          <div className="flex flex-col">
            {sections.map((section) => {
              const collapsed = collapsedFolders.has(section.folderId);
              const folderColor = section.folder?.color ?? '#697a9b';
              return (
                <div
                  key={section.folderId}
                  className="border-b border-[#edeff3] last:border-b-0"
                >
                  <button
                    type="button"
                    onClick={() => toggleFolderCollapse(section.folderId)}
                    className="flex items-center gap-2 w-full px-4 pt-4 pb-3 select-none hover:bg-[#fafbfc] transition-colors text-left"
                  >
                    <span className="flex items-center justify-center w-4 h-4 text-[#697a9b] shrink-0">
                      {collapsed ? (
                        <ChevronRight className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </span>
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                      style={{ backgroundColor: folderColor }}
                    >
                      <FolderClosed className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-[16px] font-medium text-[#1f242e] leading-[24px]">
                      {section.path}
                    </h2>
                    <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[12px] font-medium text-[#525f7a] bg-white border border-[#e0e4eb] rounded-lg min-w-[24px] text-center leading-[16px]">
                      {section.articles.length}
                    </span>
                    {section.folder && onSelectFolder && (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectFolder(section.folderId);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.stopPropagation();
                            onSelectFolder(section.folderId);
                          }
                        }}
                        className="ml-2 text-[12px] text-[#697a9b] hover:text-[#006bd6] cursor-pointer"
                      >
                        Open folder
                      </span>
                    )}
                  </button>
                  {!collapsed && (
                    <div className="grid grid-cols-3 gap-3 px-4 pb-4">
                      {section.articles.map((article) => (
                        <ArticleCard
                          key={article.id}
                          article={article}
                          onClick={() => onArticleClick?.(article)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <table className="w-full table-fixed">
            <thead>
              <tr className="border-y border-[#edeff3] bg-[#fafbfc]">
                    <HeaderCell
                      label="Title"
                      sortKey="title"
                      active={sortKey}
                      dir={sortDir}
                      onClick={handleSort}
                      className="pl-4"
                    />
                    <HeaderCell
                      label="Folder"
                      sortKey="folder"
                      active={sortKey}
                      dir={sortDir}
                      onClick={handleSort}
                      className="w-[200px]"
                    />
                    <HeaderCell
                      label="Unit"
                      sortKey="unit"
                      active={sortKey}
                      dir={sortDir}
                      onClick={handleSort}
                      className="w-[140px]"
                    />
                    <HeaderCell
                      label="Status"
                      sortKey="status"
                      active={sortKey}
                      dir={sortDir}
                      onClick={handleSort}
                      className="w-[100px]"
                    />
                    <HeaderCell
                      label="Updated"
                      sortKey="updated"
                      active={sortKey}
                      dir={sortDir}
                      onClick={handleSort}
                      className="w-[100px]"
                    />
                    <HeaderCell
                      label="Owner"
                      sortKey="owner"
                      active={sortKey}
                      dir={sortDir}
                      onClick={handleSort}
                      className="w-[180px]"
                    />
                    <th className="w-[44px] py-2 pr-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((article) => {
                    const folder = getFolder(article.folderId);
                    const unit = getUnit(article.unitId);
                    const isInactive =
                      article.status === 'draft' || article.status === 'archived';
                    const initials = article.owner.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2);
                    return (
                      <tr
                        key={article.id}
                        onClick={() => onArticleClick?.(article)}
                        className="border-b border-[#edeff3] last:border-b-0 cursor-pointer hover:bg-[#fafbfc] transition-colors"
                      >
                        <td className="py-2.5 pl-4 pr-4">
                          <span
                            className={`text-[13px] leading-[20px] ${
                              isInactive ? 'text-[#697a9b]' : 'text-[#1f242e]'
                            }`}
                          >
                            {article.title}
                          </span>
                        </td>
                        <td className="py-2.5 pr-4">
                          {folder ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectFolder?.(folder.id);
                              }}
                              className="flex items-center gap-1 text-[13px] text-[#525f7a] hover:text-[#006bd6] truncate max-w-full"
                              title={folder.name}
                            >
                              <FolderClosed className="w-3.5 h-3.5 text-[#697a9b] shrink-0" />
                              <span className="truncate">{folder.name}</span>
                            </button>
                          ) : (
                            <span className="text-[13px] text-[#697a9b]">—</span>
                          )}
                        </td>
                        <td className="py-2.5 pr-4">
                          <div className="flex items-center gap-1 text-[13px] text-[#525f7a]">
                            <Building2 className="w-3.5 h-3.5 text-[#697a9b] shrink-0" />
                            <span className="truncate">{unit?.name ?? '—'}</span>
                          </div>
                        </td>
                        <td className="py-2.5 pr-4">
                          <StatusBadge status={article.status} />
                        </td>
                        <td className="py-2.5 pr-4">
                          <span className="text-[13px] text-[#697a9b] whitespace-nowrap">
                            {timeAgo(article.updatedAt)}
                          </span>
                        </td>
                        <td className="py-2.5 pr-4">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded-md text-white text-[10px] font-medium flex items-center justify-center shrink-0"
                              style={{ backgroundColor: avatarColor(article.owner.name) }}
                            >
                              {initials}
                            </div>
                            <span className="text-[13px] text-[#1f242e] truncate">
                              {article.owner.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5">
                          <button
                            type="button"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-[#edeff3]"
                          >
                            <MoreHorizontal className="w-4 h-4 text-[#525f7a]" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
        )}
      </div>
    </div>
  );
}
