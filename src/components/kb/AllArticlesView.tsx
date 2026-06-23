import { useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
  FolderClosed,
  Files,
  MoreHorizontal,
} from 'lucide-react';
import { LockFilled } from './LockFilled';
import type { KBArticle, ArticleStatus } from '@/types';
import { ArticleActionsMenu } from './ArticleActionsMenu';
import {
  applyArticleFilters,
  isFiltersActive,
  type ArticleFilters,
} from './article-filters';
import {
  getAllVisibleArticles,
  getFolder,
  getFolderPath,
  getUnit,
} from '@/data/mock-data';
import { useFolderVersion } from '@/state/folder-store';
import { StatusBadge } from './StatusBadge';
import { EmptyState } from './EmptyState';

interface AllArticlesViewProps {
  viewingUnitId: string;
  showArchived: boolean;
  showSubUnits: boolean;
  /** Search query lifted from the toolbar; filters by article title. */
  search: string;
  /** Status / owner / updated filters applied on top of the base query. */
  filters: ArticleFilters;
  onArticleClick?: (article: KBArticle) => void;
  onSelectFolder?: (folderId: string) => void;
  onArticleStatusChange?: (article: KBArticle, status: ArticleStatus) => void;
  onArticleMove?: (article: KBArticle) => void;
  onArticleDelete?: (article: KBArticle) => void;
}

type SortKey = 'title' | 'folder' | 'unit' | 'status' | 'updated' | 'owner';
type SortDir = 'asc' | 'desc';

const statusOrder: Record<ArticleStatus, number> = {
  published: 0,
  draft: 1,
  archived: 2,
};

const avatarColors = [
  '#006bd6', '#7c3aed', '#0891b2', '#059669', '#d97706',
  '#dc2626', '#be185d', '#4f46e5', '#0d9488', '#ca8a04',
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function timeAgo(iso: string): string {
  const now = new Date();
  const d = new Date(iso);
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays < 1) return 'today';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

function folderPathString(folderId: string): string {
  const path = getFolderPath(folderId);
  return path.map((f) => f.name).join(' › ');
}

interface Row {
  article: KBArticle;
  folderId: string;
  folderName: string;
  folderPath: string;
  unitName: string;
}

function buildRows(articles: KBArticle[]): Row[] {
  return articles.map((article) => {
    const folder = getFolder(article.folderId);
    const folderId = folder?.id ?? article.folderId;
    const unit = getUnit(article.unitId);
    return {
      article,
      folderId,
      folderName: folder?.name ?? '—',
      folderPath: folder ? folderPathString(folder.id) : '—',
      unitName: unit?.name ?? 'Unknown',
    };
  });
}

function compareRows(a: Row, b: Row, key: SortKey, dir: SortDir): number {
  const mult = dir === 'asc' ? 1 : -1;
  switch (key) {
    case 'title':
      return mult * a.article.title.localeCompare(b.article.title);
    case 'folder':
      return mult * a.folderPath.localeCompare(b.folderPath);
    case 'unit':
      return mult * a.unitName.localeCompare(b.unitName);
    case 'status':
      return (
        mult *
        (statusOrder[a.article.status] - statusOrder[b.article.status])
      );
    case 'updated':
      return (
        mult *
        (new Date(a.article.updatedAt).getTime() -
          new Date(b.article.updatedAt).getTime())
      );
    case 'owner':
      return mult * a.article.owner.name.localeCompare(b.article.owner.name);
  }
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) {
    return <ChevronsUpDown className="w-3 h-3 text-[#a8b1c2]" />;
  }
  return dir === 'asc' ? (
    <ChevronUp className="w-3 h-3 text-[#525f7a]" />
  ) : (
    <ChevronDown className="w-3 h-3 text-[#525f7a]" />
  );
}

function HeaderCell({
  label,
  sortKey,
  activeKey,
  dir,
  onSort,
  className,
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey;
  dir: SortDir;
  onSort: (k: SortKey) => void;
  className?: string;
}) {
  const active = activeKey === sortKey;
  return (
    <th
      className={`text-left text-[12px] font-medium text-[#697a9b] py-2 pr-4 ${
        className ?? ''
      }`}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className="inline-flex items-center gap-1 hover:text-[#1f242e]"
      >
        <span>{label}</span>
        <SortIcon active={active} dir={dir} />
      </button>
    </th>
  );
}

function ArticleTableRow({
  row,
  onArticleClick,
  onSelectFolder,
  onStatusChange,
  onMove,
  onDelete,
}: {
  row: Row;
  onArticleClick?: (article: KBArticle) => void;
  onSelectFolder?: (folderId: string) => void;
  onStatusChange?: (article: KBArticle, status: ArticleStatus) => void;
  onMove?: (article: KBArticle) => void;
  onDelete?: (article: KBArticle) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { article, folderId, folderName, folderPath, unitName } = row;
  const initials = article.owner.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);
  const isInactive =
    article.status === 'draft' || article.status === 'archived';
  const isPrivate = article.visibility === 'current_unit_only';
  return (
    <tr
      className="group/row border-b border-[#edeff3] last:border-b-0 cursor-pointer hover:bg-[#fafbfc] transition-colors"
      onClick={() => onArticleClick?.(article)}
    >
      <td className="py-2.5 pl-4 pr-4 sticky left-0 z-[1] bg-white group-hover/row:bg-[#fafbfc] shadow-[1px_0_0_0_#edeff3]">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={`text-[13px] leading-[20px] truncate ${
              isInactive ? 'text-[#697a9b]' : 'text-[#1f242e]'
            }`}
          >
            {article.title}
          </span>
          {isPrivate && (
            <span
              title="Private — visible only to people with access to this unit’s private content"
              className="shrink-0 flex items-center"
            >
              <LockFilled
                className="w-3.5 h-3.5 text-[#697a9b]"
                strokeWidth={2}
              />
            </span>
          )}
        </div>
      </td>
      <td className="py-2.5 pr-4">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelectFolder?.(folderId);
          }}
          className="flex items-center gap-1 text-[13px] text-[#525f7a] hover:text-[#0052a3] min-w-0"
          title={folderPath}
        >
          <FolderClosed className="w-3.5 h-3.5 text-[#697a9b] shrink-0" />
          <span className="truncate">{folderName}</span>
        </button>
      </td>
      <td className="py-2.5 pr-4">
        <div className="flex items-center gap-1 text-[13px] text-[#525f7a]">
          <span className="truncate">{unitName}</span>
        </div>
      </td>
      <td className="py-2.5 pr-4">
        <StatusBadge
          status={article.status}
          showPublished
          hasUnpublishedChanges={article.draftContent !== null}
        />
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
            style={{ backgroundColor: getAvatarColor(article.owner.name) }}
          >
            {initials}
          </div>
          <span className="text-[13px] text-[#1f242e] truncate">
            {article.owner.name}
          </span>
        </div>
      </td>
      <td className="relative py-2.5 pr-2 sticky right-0 z-[1] bg-white group-hover/row:bg-[#fafbfc] shadow-[-1px_0_0_0_#edeff3]">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((p) => !p);
          }}
          className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-[#edeff3] transition-colors"
          title="Article actions"
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
          />
        )}
      </td>
    </tr>
  );
}

export function AllArticlesView({
  viewingUnitId,
  showArchived,
  showSubUnits,
  search,
  filters,
  onArticleClick,
  onSelectFolder,
  onArticleStatusChange,
  onArticleMove,
  onArticleDelete,
}: AllArticlesViewProps) {
  const version = useFolderVersion();
  const [sortKey, setSortKey] = useState<SortKey>('updated');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const articles = useMemo(
    () => {
      const base = getAllVisibleArticles(viewingUnitId, {
        includeArchived: showArchived,
        includeSubUnits: showSubUnits,
        search,
      });
      return applyArticleFilters(base, filters);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [viewingUnitId, showArchived, showSubUnits, search, filters, version]
  );

  const rows = useMemo(() => {
    const built = buildRows(articles);
    built.sort((a, b) => compareRows(a, b, sortKey, sortDir));
    return built;
  }, [articles, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'updated' ? 'desc' : 'asc');
    }
  };

  const viewingUnit = getUnit(viewingUnitId);
  const totalLabel = `${rows.length} ${rows.length === 1 ? 'article' : 'articles'}`;

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-white">
      {/* Breadcrumb bar — mirrors the folder view: unit › All articles + count */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#edeff3] shrink-0">
        <nav className="flex items-center gap-1.5 text-[13px] min-w-0 flex-1">
          {viewingUnit && (
            <>
              <FolderClosed
                className="w-4 h-4 text-[#697a9b] shrink-0"
                strokeWidth={1.75}
              />
              <span className="text-[#525f7a] truncate">
                {viewingUnit.name}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-[#a8b1c2] shrink-0" />
            </>
          )}
          <Files className="w-4 h-4 text-[#697a9b] shrink-0" />
          <span className="text-[#1f242e] font-medium truncate">
            All articles
          </span>
        </nav>
        <span className="text-[13px] text-[#697a9b] shrink-0">{totalLabel}</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {rows.length === 0 ? (
          isFiltersActive(filters) ? (
            <EmptyState
              title="No matching articles"
              description="No articles match the current filters. Adjust the filters or clear them to see more."
            />
          ) : (
            <EmptyState
              title="No articles yet"
              description="Articles you can access in this unit and from shared content will appear here."
            />
          )
        ) : (
          <table className="w-full min-w-[1100px]">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-[#edeff3] bg-[#fafbfc]">
                <HeaderCell
                  label="Article"
                  sortKey="title"
                  activeKey={sortKey}
                  dir={sortDir}
                  onSort={handleSort}
                  className="pl-4 w-[280px] min-w-[280px] sticky left-0 z-[2] bg-[#fafbfc] shadow-[1px_0_0_0_#edeff3]"
                />
                <HeaderCell
                  label="Folder"
                  sortKey="folder"
                  activeKey={sortKey}
                  dir={sortDir}
                  onSort={handleSort}
                  className="w-[260px] min-w-[260px]"
                />
                <HeaderCell
                  label="Unit"
                  sortKey="unit"
                  activeKey={sortKey}
                  dir={sortDir}
                  onSort={handleSort}
                  className="w-[140px] min-w-[140px]"
                />
                <HeaderCell
                  label="Status"
                  sortKey="status"
                  activeKey={sortKey}
                  dir={sortDir}
                  onSort={handleSort}
                  className="w-[100px] min-w-[100px]"
                />
                <HeaderCell
                  label="Updated"
                  sortKey="updated"
                  activeKey={sortKey}
                  dir={sortDir}
                  onSort={handleSort}
                  className="w-[100px] min-w-[100px]"
                />
                <HeaderCell
                  label="Owner"
                  sortKey="owner"
                  activeKey={sortKey}
                  dir={sortDir}
                  onSort={handleSort}
                  className="w-[180px] min-w-[180px]"
                />
                <th className="w-[44px] min-w-[44px] py-2 pr-2 sticky right-0 z-[2] bg-[#fafbfc] shadow-[-1px_0_0_0_#edeff3]"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <ArticleTableRow
                  key={r.article.id}
                  row={r}
                  onArticleClick={onArticleClick}
                  onSelectFolder={onSelectFolder}
                  onStatusChange={onArticleStatusChange}
                  onMove={onArticleMove}
                  onDelete={onArticleDelete}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
