import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Filter,
  LayoutGrid,
  List,
  BookOpen,
  Plus,
} from 'lucide-react';
import type { KBArticle, KBFolder, ArticleStatus } from '@/types';
import {
  getOwnRootFolders,
  getSharedRootFolders,
  getFolder,
  getFolderPath,
  getDescendantUnitIds,
} from '@/data/mock-data';
import { useFolderVersion } from '@/state/folder-store';
import { FolderTree, type FolderAction } from './FolderTree';
import { FolderView } from './FolderView';
import { AllArticlesView } from './AllArticlesView';
import { EmptyState } from './EmptyState';
import {
  DEFAULT_FILTERS,
  hasNonSearchFilter,
  type ArticleFilters,
} from './article-filters';
import { FilterPopover, type FilterField } from './FilterPopover';
import { FilterChips } from './FilterChips';

type ViewMode = 'folder' | 'all-articles';

interface KBRootProps {
  unitId: string;
  onArticleClick?: (article: KBArticle) => void;
  onCreateArticle?: (folderId: string) => void;
  onCreateFolder?: () => void;
  onCreateSubFolder?: (parent: KBFolder | null) => void;
  onFolderAction?: (action: FolderAction, folder: KBFolder) => void;
  onArticleStatusChange?: (article: KBArticle, status: ArticleStatus) => void;
  onArticleMove?: (article: KBArticle) => void;
  onArticleDelete?: (article: KBArticle) => void;
}

export function KBRoot({
  unitId,
  onArticleClick,
  onCreateArticle,
  onCreateFolder,
  onCreateSubFolder,
  onFolderAction,
  onArticleStatusChange,
  onArticleMove,
  onArticleDelete,
}: KBRootProps) {
  const [showSubUnits, setShowSubUnits] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterFocus, setFilterFocus] = useState<FilterField | null>(null);
  const filterButtonRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>('folder');
  const [filters, setFilters] = useState<ArticleFilters>(DEFAULT_FILTERS);
  const search = filters.search;
  const filterActive = hasNonSearchFilter(filters);

  const handleChipEdit = (field: FilterField) => {
    setFilterFocus(field);
    setFilterOpen(true);
  };
  // Archived articles are filtered post-query; keep folder traversal inclusive
  // so a status filter that *includes* archived can still surface them.
  const showArchived = filters.statuses.size === 0 || filters.statuses.has('archived');

  const version = useFolderVersion();
  const ownFolders = useMemo(() => getOwnRootFolders(unitId), [unitId, version]);
  const sharedFolders = useMemo(() => getSharedRootFolders(unitId), [unitId, version]);

  const handleSelectFolder = (folderId: string) => {
    setSelectedFolderId(folderId);
    setView('folder');
  };
  const handleSelectAllArticles = () => {
    setView('all-articles');
  };

  // Close filter popover when clicking outside.
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

  // When the unit / folder list / toggles change, clear selection if the current
  // folder is no longer reachable. Reachability is checked against the folder's
  // root ancestor — a sub-folder of a shared/sub-unit root is still valid.
  useEffect(() => {
    const current = selectedFolderId ? getFolder(selectedFolderId) : undefined;
    if (current) {
      const rootId = getFolderPath(current.id)[0]?.id;
      const isOwn = current.unitId === unitId;
      const isSharedRoot = !!rootId && sharedFolders.some((f) => f.id === rootId);
      const isSubUnit =
        showSubUnits && getDescendantUnitIds(unitId).has(current.unitId);
      const archivedOk = showArchived || current.status === 'active';
      if ((isOwn || isSharedRoot || isSubUnit) && archivedOk) return;
    }
    setSelectedFolderId(ownFolders[0]?.id ?? sharedFolders[0]?.id ?? null);
  }, [
    unitId,
    ownFolders,
    sharedFolders,
    selectedFolderId,
    version,
    showArchived,
    showSubUnits,
  ]);

  const hasAnyContent = ownFolders.length > 0 || sharedFolders.length > 0;

  // "Create article" is only relevant when a writeable own folder is selected.
  const selectedFolder = selectedFolderId ? getFolder(selectedFolderId) : null;
  const canCreateArticle =
    view === 'folder' &&
    !!selectedFolder &&
    selectedFolder.unitId === unitId &&
    selectedFolder.status === 'active';

  const toolbar = (
    <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-[#edeff3] shrink-0">
      <div className="flex items-center gap-3">
        <div className="relative h-7">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#697a9b]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
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
        <label
          className="flex items-center gap-2 cursor-pointer select-none"
          title={
            showSubUnits
              ? 'Hide folders from sub-units'
              : 'Show folders from sub-units'
          }
        >
          <span className="text-[13px] text-[#1f242e]">Sub-units</span>
          <button
            type="button"
            role="switch"
            aria-checked={showSubUnits}
            onClick={() => setShowSubUnits((p) => !p)}
            className={`relative inline-flex h-[18px] w-[34px] shrink-0 cursor-pointer rounded-full transition-colors ${
              showSubUnits ? 'bg-[#006bd6]' : 'bg-[#c1c7d0]'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-[14px] w-[14px] rounded-full bg-white shadow transform transition-transform ${
                showSubUnits
                  ? 'translate-x-[16px] translate-y-[2px]'
                  : 'translate-x-[2px] translate-y-[2px]'
              }`}
            />
          </button>
        </label>

        <div className="w-px h-5 bg-[#edeff3]" />

        <div className="flex items-center bg-[#edeff3] rounded-lg p-[2px] h-7">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`flex items-center justify-center w-6 h-6 rounded-md transition-all ${
              viewMode === 'grid'
                ? 'bg-white shadow-[0px_1px_3px_0px_rgba(31,36,46,0.1),0px_1px_2px_-1px_rgba(31,36,46,0.1)]'
                : ''
            }`}
          >
            <LayoutGrid className="w-4 h-4 text-[#1f242e]" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`flex items-center justify-center w-6 h-6 rounded-md transition-all ${
              viewMode === 'list'
                ? 'bg-white shadow-[0px_1px_3px_0px_rgba(31,36,46,0.1),0px_1px_2px_-1px_rgba(31,36,46,0.1)]'
                : ''
            }`}
          >
            <List className="w-4 h-4 text-[#1f242e]" />
          </button>
        </div>

        {canCreateArticle && (
          <button
            type="button"
            onClick={() => onCreateArticle?.(selectedFolderId!)}
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
      <FolderTree
        unitId={unitId}
        selectedFolderId={view === 'folder' ? selectedFolderId : null}
        onSelectFolder={handleSelectFolder}
        showArchived={showArchived}
        showSubUnits={showSubUnits}
        isAllArticlesActive={view === 'all-articles'}
        onSelectAllArticles={handleSelectAllArticles}
        onCreateRootFolder={onCreateFolder}
        onCreateSubFolder={onCreateSubFolder}
        onFolderAction={onFolderAction}
      />

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {toolbar}
        <FilterChips
          filters={filters}
          onChange={setFilters}
          onEdit={handleChipEdit}
        />

        {view === 'all-articles' ? (
          <AllArticlesView
            viewingUnitId={unitId}
            showArchived={showArchived}
            showSubUnits={showSubUnits}
            viewMode={viewMode}
            search={search}
            filters={filters}
            onArticleClick={onArticleClick}
            onSelectFolder={handleSelectFolder}
            onArticleStatusChange={onArticleStatusChange}
            onArticleMove={onArticleMove}
            onArticleDelete={onArticleDelete}
          />
        ) : !hasAnyContent ? (
          <div className="flex-1 flex items-center justify-center bg-white">
            <EmptyState
              title="No knowledge base content yet"
              description="Create your first folder to start organizing knowledge for this unit."
              action={
                <button
                  type="button"
                  onClick={onCreateFolder}
                  className="flex items-center gap-2 px-3 py-1.5 text-[14px] font-medium text-white bg-[#006bd6] rounded-lg hover:bg-[#0052a3]"
                >
                  <BookOpen className="w-4 h-4" />
                  Create folder
                </button>
              }
            />
          </div>
        ) : !selectedFolderId ? (
          <div className="flex-1 flex items-center justify-center bg-white">
            <EmptyState
              title="Select a folder"
              description="Pick a folder from the left panel to see its contents."
            />
          </div>
        ) : (
          <FolderView
            folderId={selectedFolderId}
            viewingUnitId={unitId}
            viewMode={viewMode}
            showArchived={showArchived}
            filters={filters}
            onSelectFolder={handleSelectFolder}
            onArticleClick={onArticleClick}
            onCreateArticle={() => onCreateArticle?.(selectedFolderId)}
            onFolderAction={onFolderAction}
            onArticleStatusChange={onArticleStatusChange}
            onArticleMove={onArticleMove}
            onArticleDelete={onArticleDelete}
          />
        )}
      </div>
    </div>
  );
}
