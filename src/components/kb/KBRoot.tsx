import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Filter,
  LayoutGrid,
  List,
  BookOpen,
} from 'lucide-react';
import type { KBArticle, KBFolder } from '@/types';
import {
  getOwnRootFolders,
  getSharedRootFolders,
  getAllVisibleArticles,
  getFolder,
  getDescendantUnitIds,
} from '@/data/mock-data';
import { useFolderVersion } from '@/state/folder-store';
import { FolderTree, type FolderAction } from './FolderTree';
import { FolderView } from './FolderView';
import { AllArticlesView } from './AllArticlesView';
import { EmptyState } from './EmptyState';

type ViewMode = 'folder' | 'all-articles';

interface KBRootProps {
  unitId: string;
  onArticleClick?: (article: KBArticle) => void;
  onCreateArticle?: (folderId: string) => void;
  onCreateFolder?: () => void;
  onFolderAction?: (action: FolderAction, folder: KBFolder) => void;
}

export function KBRoot({
  unitId,
  onArticleClick,
  onCreateArticle,
  onCreateFolder,
  onFolderAction,
}: KBRootProps) {
  // Archived items are visible by default; the filter popover lets users hide them.
  const [hideArchived, setHideArchived] = useState(false);
  const [showSubUnits, setShowSubUnits] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterButtonRef = useRef<HTMLDivElement>(null);
  const showArchived = !hideArchived;
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>('folder');
  const [search, setSearch] = useState('');

  const version = useFolderVersion();
  const ownFolders = useMemo(() => getOwnRootFolders(unitId), [unitId, version]);
  const sharedFolders = useMemo(() => getSharedRootFolders(unitId), [unitId, version]);
  const allArticlesCount = useMemo(
    () =>
      getAllVisibleArticles(unitId, {
        includeArchived: showArchived,
        includeSubUnits: showSubUnits,
      }).length,
    [unitId, showArchived, showSubUnits, version]
  );

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
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [filterOpen]);

  // When the unit / folder list / toggles change, clear selection if the current
  // folder is no longer visible (archived selection is OK while showArchived is on;
  // sub-unit selection is OK while showSubUnits is on).
  useEffect(() => {
    const current = selectedFolderId ? getFolder(selectedFolderId) : undefined;
    if (current) {
      const isOwn = current.unitId === unitId;
      const isShared = sharedFolders.some((f) => f.id === current.id);
      const isSubUnit =
        showSubUnits && getDescendantUnitIds(unitId).has(current.unitId);
      const archivedOk = showArchived || current.status === 'active';
      if ((isOwn || isShared || isSubUnit) && archivedOk) return;
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

  const toolbar = (
    <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-[#edeff3] shrink-0">
      <div className="flex items-center gap-3">
        <div className="relative h-7">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#697a9b]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="h-7 pl-8 pr-3 text-[14px] border border-[#e0e4eb] rounded-lg w-[220px] bg-[#fafbfc] placeholder:text-[#697a9b] focus:outline-none focus:ring-1 focus:ring-[#006bd6] focus:border-[#006bd6]"
          />
        </div>
        <div className="relative" ref={filterButtonRef}>
          <button
            type="button"
            onClick={() => setFilterOpen((p) => !p)}
            className={`relative flex items-center justify-center w-[34px] h-7 border rounded-lg transition-colors ${
              filterOpen || hideArchived
                ? 'border-[#006bd6] bg-[#ebf5ff]'
                : 'border-[#e0e4eb] hover:bg-gray-50'
            }`}
            title="Filter"
          >
            <Filter
              className={`w-4 h-4 ${
                filterOpen || hideArchived ? 'text-[#006bd6]' : 'text-[#697a9b]'
              }`}
            />
            {hideArchived && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#006bd6] ring-2 ring-white" />
            )}
          </button>
          {filterOpen && (
            <div className="absolute left-0 top-full mt-1 z-30 bg-white border border-[#e0e4eb] rounded-lg shadow-[0px_4px_12px_rgba(31,36,46,0.12)] py-1 min-w-[200px]">
              <button
                type="button"
                onClick={() => setHideArchived((p) => !p)}
                className="flex items-center justify-between gap-3 w-full px-3 py-1.5 text-[13px] text-[#1f242e] hover:bg-[#fafbfc] text-left"
              >
                <span>Hide archived</span>
                <span
                  className={`relative inline-flex h-[16px] w-[28px] shrink-0 rounded-full transition-colors ${
                    hideArchived ? 'bg-[#006bd6]' : 'bg-[#c1c7d0]'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-[12px] w-[12px] rounded-full bg-white shadow transform transition-transform ${
                      hideArchived
                        ? 'translate-x-[14px] translate-y-[2px]'
                        : 'translate-x-[2px] translate-y-[2px]'
                    }`}
                  />
                </span>
              </button>
            </div>
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
        allArticlesCount={allArticlesCount}
        onSelectAllArticles={handleSelectAllArticles}
        onCreateRootFolder={onCreateFolder}
        onFolderAction={onFolderAction}
      />

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {toolbar}

        {view === 'all-articles' ? (
          <AllArticlesView
            viewingUnitId={unitId}
            showArchived={showArchived}
            showSubUnits={showSubUnits}
            viewMode={viewMode}
            search={search}
            onArticleClick={onArticleClick}
            onSelectFolder={handleSelectFolder}
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
            onSelectFolder={handleSelectFolder}
            onArticleClick={onArticleClick}
            onCreateArticle={() => onCreateArticle?.(selectedFolderId)}
            onFolderAction={onFolderAction}
          />
        )}
      </div>
    </div>
  );
}
