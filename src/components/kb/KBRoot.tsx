import { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  LayoutGrid,
  List,
  BookOpen,
  Archive,
  RotateCcw,
} from 'lucide-react';
import type { KBArticle, KBFolder } from '@/types';
import {
  getOwnRootFolders,
  getSharedRootFolders,
  getFolder,
  getDescendantUnitIds,
  resetKbState,
} from '@/data/mock-data';
import { useFolderVersion } from '@/state/folder-store';
import { FolderTree, type FolderAction } from './FolderTree';
import { FolderView } from './FolderView';
import { EmptyState } from './EmptyState';

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
  const [showArchived, setShowArchived] = useState(false);
  const [showSubUnits, setShowSubUnits] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  const version = useFolderVersion();
  const ownFolders = useMemo(() => getOwnRootFolders(unitId), [unitId, version]);
  const sharedFolders = useMemo(() => getSharedRootFolders(unitId), [unitId, version]);

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

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-[#edeff3] shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative h-7">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#697a9b]" />
            <input
              type="text"
              placeholder="Search"
              className="h-7 pl-8 pr-3 text-[14px] border border-[#e0e4eb] rounded-lg w-[220px] bg-[#fafbfc] placeholder:text-[#697a9b] focus:outline-none focus:ring-1 focus:ring-[#006bd6] focus:border-[#006bd6]"
            />
          </div>
          <button
            type="button"
            className="flex items-center justify-center w-[34px] h-7 border border-[#e0e4eb] rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-4 h-4 text-[#697a9b]" />
          </button>
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

          <button
            type="button"
            onClick={() => setShowArchived((p) => !p)}
            className={`flex items-center gap-1.5 h-7 px-2 text-[13px] rounded-lg border transition-colors ${
              showArchived
                ? 'border-[#006bd6] bg-[#ebf5ff] text-[#0052a3]'
                : 'border-[#e0e4eb] text-[#1f242e] hover:bg-[#fafbfc]'
            }`}
            title={showArchived ? 'Hide archived' : 'Show archived'}
          >
            <Archive className="w-3.5 h-3.5" />
            {showArchived ? 'Hide archived' : 'Show archived'}
          </button>

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

          <div className="w-px h-5 bg-[#edeff3]" />

          <button
            type="button"
            onClick={() => {
              if (window.confirm('Reset KB to demo defaults? Local changes will be lost.')) {
                resetKbState();
              }
            }}
            className="flex items-center gap-1.5 h-7 px-2 text-[12px] text-[#697a9b] rounded-lg hover:bg-[#fafbfc] hover:text-[#1f242e]"
            title="Reset to defaults (clears localStorage)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset demo
          </button>
        </div>
      </div>

      {/* Main two-panel layout */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        <FolderTree
          unitId={unitId}
          selectedFolderId={selectedFolderId}
          onSelectFolder={setSelectedFolderId}
          showArchived={showArchived}
          showSubUnits={showSubUnits}
          onCreateRootFolder={onCreateFolder}
          onFolderAction={onFolderAction}
        />

        {!hasAnyContent ? (
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
            onSelectFolder={setSelectedFolderId}
            onArticleClick={onArticleClick}
            onCreateArticle={() => onCreateArticle?.(selectedFolderId)}
            onFolderAction={onFolderAction}
          />
        )}
      </div>
    </div>
  );
}
