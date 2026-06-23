import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  Filter,
  FolderClosed,
  Files,
  MoreHorizontal,
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
  Plus,
} from 'lucide-react';
import type { KBArticle, KBFolder, ArticleStatus } from '@/types';
import {
  currentUserPositions,
  findHomeViewingUnit,
  getDescendantUnitIds,
  getFolder,
  getFolderPath,
  getHomeArticles,
  getUnit,
} from '@/data/mock-data';
import { useFolderVersion } from '@/state/folder-store';
import {
  applyArticleFilters,
  DEFAULT_FILTERS,
  hasNonSearchFilter,
  isFiltersActive,
  type ArticleFilters,
} from '../kb/article-filters';
import { FilterPopover, type FilterField } from '../kb/FilterPopover';
import { FilterChips } from '../kb/FilterChips';
import { LockFilled } from '../kb/LockFilled';
import { ArticleActionsMenu } from '../kb/ArticleActionsMenu';
import { StatusBadge } from '../kb/StatusBadge';
import { EmptyState } from '../kb/EmptyState';
import { FolderView } from '../kb/FolderView';
import type { FolderAction } from '../kb/FolderTree';
import { HomeFolderTree } from './HomeFolderTree';

interface HomeKBViewProps {
  onArticleClick?: (article: KBArticle) => void;
  onArticleStatusChange?: (article: KBArticle, status: ArticleStatus) => void;
  onArticleMove?: (article: KBArticle) => void;
  onArticleDelete?: (article: KBArticle) => void;
  /** Triggers article-create dialog. folderId is omitted from All articles
   *  (user picks the folder in the dialog) and present when invoked from a
   *  writeable folder view. */
  onCreateArticle?: (folderId?: string) => void;
  onCreateFolder?: () => void;
  onFolderAction?: (action: FolderAction, folder: KBFolder) => void;
}

type View = 'folder' | 'all-articles';
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

interface Row {
  article: KBArticle;
  folderName: string;
  folderPath: string;
  unitName: string;
}

function buildRows(articles: KBArticle[]): Row[] {
  return articles.map((article) => {
    const folder = getFolder(article.folderId);
    const folderPath = folder
      ? getFolderPath(folder.id).map((f) => f.name).join(' › ')
      : '—';
    const unit = getUnit(article.unitId);
    return {
      article,
      folderName: folder?.name ?? '—',
      folderPath,
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
      return mult * (statusOrder[a.article.status] - statusOrder[b.article.status]);
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
  if (!active) return <ChevronsUpDown className="w-3 h-3 text-[#a8b1c2]" />;
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
  onArticleClick?: (a: KBArticle) => void;
  onSelectFolder?: (folderId: string) => void;
  onStatusChange?: (a: KBArticle, s: ArticleStatus) => void;
  onMove?: (a: KBArticle) => void;
  onDelete?: (a: KBArticle) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { article, folderName, folderPath, unitName } = row;
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
            onSelectFolder?.(article.folderId);
          }}
          className="flex items-center gap-1 text-[13px] text-[#525f7a] hover:text-[#0052a3] min-w-0"
          title={folderPath}
        >
          <FolderClosed className="w-3.5 h-3.5 text-[#697a9b] shrink-0" />
          <span className="truncate">{folderName}</span>
        </button>
      </td>
      <td className="py-2.5 pr-4">
        <span className="text-[13px] text-[#525f7a] truncate">{unitName}</span>
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

function AllArticlesPanel({
  filters,
  showArchived,
  onArticleClick,
  onSelectFolder,
  onStatusChange,
  onMove,
  onDelete,
}: {
  filters: ArticleFilters;
  showArchived: boolean;
  onArticleClick?: (a: KBArticle) => void;
  onSelectFolder?: (folderId: string) => void;
  onStatusChange?: (a: KBArticle, s: ArticleStatus) => void;
  onMove?: (a: KBArticle) => void;
  onDelete?: (a: KBArticle) => void;
}) {
  const version = useFolderVersion();
  const [sortKey, setSortKey] = useState<SortKey>('updated');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const articles = useMemo(
    () => {
      const base = getHomeArticles({
        includeArchived: showArchived,
        search: filters.search,
      });
      return applyArticleFilters(base, filters);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filters, showArchived, version]
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

  const positionNames = currentUserPositions
    .map((id) => getUnit(id)?.name ?? id)
    .join(' · ');
  const totalLabel = `${rows.length} ${rows.length === 1 ? 'article' : 'articles'}`;

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-white">
      {/* Breadcrumb bar — mirrors the folder view: My knowledge base + count */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#edeff3] shrink-0">
        <nav className="flex items-center gap-1.5 text-[13px] min-w-0 flex-1">
          <Files className="w-4 h-4 text-[#697a9b] shrink-0" />
          <span
            className="text-[#1f242e] font-medium truncate"
            title={`Aggregated from every unit where you hold a position: ${positionNames}`}
          >
            My knowledge base
          </span>
        </nav>
        <span className="text-[13px] text-[#697a9b] shrink-0">{totalLabel}</span>
      </div>

      <div className="flex-1 overflow-auto">
        {rows.length === 0 ? (
          isFiltersActive(filters) ? (
            <EmptyState
              title="No matching articles"
              description="No articles match the current filters. Adjust the filters or clear them to see more."
            />
          ) : (
            <EmptyState
              title="No articles accessible"
              description="You'll see articles here from every unit where you hold a position."
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
                  className="w-[160px] min-w-[160px]"
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
                  onStatusChange={onStatusChange}
                  onMove={onMove}
                  onDelete={onDelete}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export function HomeKBView({
  onArticleClick,
  onArticleStatusChange,
  onArticleMove,
  onArticleDelete,
  onCreateArticle,
  onCreateFolder,
  onFolderAction,
}: HomeKBViewProps) {
  const version = useFolderVersion();
  const [filters, setFilters] = useState<ArticleFilters>(DEFAULT_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterFocus, setFilterFocus] = useState<FilterField | null>(null);
  const filterButtonRef = useRef<HTMLDivElement>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [view, setView] = useState<View>('all-articles');

  const filterActive = hasNonSearchFilter(filters);
  const showArchived =
    filters.statuses.size === 0 || filters.statuses.has('archived');

  useEffect(() => {
    if (!filterOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (
        filterButtonRef.current &&
        !filterButtonRef.current.contains(e.target as Node)
      ) {
        setFilterOpen(false);
        setFilterFocus(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [filterOpen]);

  // If the selected folder is removed (deleted from another path), fall back.
  useEffect(() => {
    if (view !== 'folder' || !selectedFolderId) return;
    if (!getFolder(selectedFolderId)) {
      setSelectedFolderId(null);
      setView('all-articles');
    }
  }, [version, selectedFolderId, view]);

  const handleSelectFolder = (folderId: string) => {
    setSelectedFolderId(folderId);
    setView('folder');
  };
  const handleSelectAllArticles = () => {
    setView('all-articles');
  };

  const selectedFolder =
    view === 'folder' && selectedFolderId ? getFolder(selectedFolderId) : null;
  const viewingUnitForFolder = selectedFolder
    ? findHomeViewingUnit(selectedFolder)
    : currentUserPositions[0];

  // Cascade rights — same rule as the unit-scope view: user can create only
  // in folders owned by a position unit or any of its descendants. "From
  // parent units" folders are read-only here (mirrors the unit-scope behavior
  // where shared roots don't expose a Create article button).
  const canCreateInSelectedFolder = (() => {
    if (!selectedFolder || selectedFolder.status !== 'active') return false;
    if (currentUserPositions.includes(selectedFolder.unitId)) return true;
    return currentUserPositions.some((pos) =>
      getDescendantUnitIds(pos).has(selectedFolder.unitId)
    );
  })();
  const canCreateArticle =
    !!onCreateArticle &&
    (view === 'all-articles' || canCreateInSelectedFolder);

  const toolbar = (
    <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-[#edeff3] shrink-0">
      <div className="flex items-center gap-3">
        <div className="relative h-7">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#697a9b]" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) =>
              setFilters((f) => ({ ...f, search: e.target.value }))
            }
            placeholder="Search"
            className="h-7 pl-8 pr-3 text-[14px] border border-[#e0e4eb] rounded-lg w-[220px] bg-[#fafbfc] placeholder:text-[#697a9b] focus:outline-none focus:ring-1 focus:ring-[#006bd6] focus:border-[#006bd6]"
          />
        </div>
        <div className="relative" ref={filterButtonRef}>
          <button
            type="button"
            onClick={() => {
              setFilterFocus(null);
              setFilterOpen((p) => !p);
            }}
            className={`relative flex items-center justify-center w-[34px] h-7 border rounded-lg transition-colors ${
              filterOpen || filterActive
                ? 'border-[#006bd6] bg-[#ebf5ff]'
                : 'border-[#e0e4eb] hover:bg-gray-50'
            }`}
            title="Filter"
          >
            <Filter
              className={`w-4 h-4 ${
                filterOpen || filterActive ? 'text-[#006bd6]' : 'text-[#697a9b]'
              }`}
            />
            {filterActive && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#006bd6] ring-2 ring-white" />
            )}
          </button>
          {filterOpen && (
            <FilterPopover
              filters={filters}
              onChange={setFilters}
              initialField={filterFocus}
            />
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {canCreateArticle && (
          <button
            type="button"
            onClick={() => {
              // Preselect folder only when viewing a writeable folder. From
              // All articles the dialog asks the user to pick one.
              const folderId =
                view === 'folder' && canCreateInSelectedFolder
                  ? selectedFolderId ?? undefined
                  : undefined;
              onCreateArticle?.(folderId);
            }}
            className="flex items-center gap-1.5 h-7 px-2 text-[13px] font-medium text-white bg-[#006bd6] rounded-lg hover:bg-[#0052a3]"
          >
            <Plus className="w-4 h-4" />
            Create article
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex min-h-0 overflow-hidden">
      <HomeFolderTree
        selectedFolderId={view === 'folder' ? selectedFolderId : null}
        onSelectFolder={handleSelectFolder}
        isAllArticlesActive={view === 'all-articles'}
        onSelectAllArticles={handleSelectAllArticles}
        onCreateRootFolder={onCreateFolder}
        onFolderAction={onFolderAction}
      />

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {toolbar}
        <FilterChips
          filters={filters}
          onChange={setFilters}
          onEdit={(field) => {
            setFilterFocus(field);
            setFilterOpen(true);
          }}
        />

        {view === 'all-articles' ? (
          <AllArticlesPanel
            filters={filters}
            showArchived={showArchived}
            onArticleClick={onArticleClick}
            onSelectFolder={handleSelectFolder}
            onStatusChange={onArticleStatusChange}
            onMove={onArticleMove}
            onDelete={onArticleDelete}
          />
        ) : selectedFolder ? (
          <FolderView
            folderId={selectedFolder.id}
            viewingUnitId={viewingUnitForFolder}
            showArchived={showArchived}
            filters={filters}
            onSelectFolder={handleSelectFolder}
            onArticleClick={onArticleClick}
            onCreateArticle={
              onCreateArticle
                ? () => onCreateArticle(selectedFolder.id)
                : undefined
            }
            onArticleStatusChange={onArticleStatusChange}
            onArticleMove={onArticleMove}
            onArticleDelete={onArticleDelete}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white">
            <EmptyState
              title="Select a folder"
              description="Pick a folder from the left or open All articles."
            />
          </div>
        )}
      </div>
    </div>
  );
}
