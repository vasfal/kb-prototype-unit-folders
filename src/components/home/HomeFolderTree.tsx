import { useMemo } from 'react';
import { Files } from 'lucide-react';
import type { KBFolder } from '@/types';
import { currentUserPositions, getHomeFolderSections } from '@/data/mock-data';
import { useFolderVersion } from '@/state/folder-store';
import { FolderNode, type FolderAction } from '../kb/FolderTree';

interface HomeFolderTreeProps {
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string) => void;
  isAllArticlesActive: boolean;
  onSelectAllArticles: () => void;
  onFolderAction?: (action: FolderAction, folder: KBFolder) => void;
}

/** Folder tree for the Home scope. Two sections that mirror the unit-view
 *  pattern (Own / From parent units). No "From sub-units" toggle — that
 *  drill-down belongs to the specific unit's view, not the personal Home. */
export function HomeFolderTree({
  selectedFolderId,
  onSelectFolder,
  isAllArticlesActive,
  onSelectAllArticles,
  onFolderAction,
}: HomeFolderTreeProps) {
  const version = useFolderVersion();
  const { own, parent } = useMemo(
    () => getHomeFolderSections(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );

  const positionsSet = new Set(currentUserPositions);

  return (
    <aside className="w-[260px] shrink-0 border-r border-[#edeff3] bg-white flex flex-col h-full overflow-hidden">
      {/* All articles pseudo-entry */}
      <div className="px-1.5 py-2">
        <button
          type="button"
          onClick={onSelectAllArticles}
          className={`flex items-center gap-1.5 w-full h-7 pl-2 pr-2 rounded-md select-none transition-colors ${
            isAllArticlesActive
              ? 'bg-[#ebf5ff] text-[#0052a3]'
              : 'text-[#1f242e] hover:bg-[#fafbfc]'
          }`}
        >
          <Files
            className={`w-4 h-4 shrink-0 ${
              isAllArticlesActive ? 'text-[#006bd6]' : 'text-[#697a9b]'
            }`}
          />
          <span className="text-[13px] flex-1 text-left">All articles</span>
        </button>
      </div>

      <div className="border-t border-[#edeff3]" />

      <div className="flex-1 overflow-y-auto">
        {/* My unit folders — owned by any position unit */}
        <div className="flex flex-col shrink-0">
          <div className="px-3 pt-3 pb-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wide text-[#697a9b]">
              My units folders
            </span>
          </div>
          <div className="flex flex-col px-1.5 pb-2">
            {own.length === 0 ? (
              <div className="px-2 py-2 text-[12px] text-[#697a9b] italic">
                No folders in your units yet
              </div>
            ) : (
              own.map((folder) => (
                <FolderNode
                  key={folder.id}
                  folder={folder}
                  viewingUnitId={folder.unitId}
                  selectedFolderId={selectedFolderId}
                  onSelect={onSelectFolder}
                  onAction={
                    positionsSet.has(folder.unitId) ? onFolderAction : undefined
                  }
                  depth={0}
                  showArchived={false}
                  defaultExpanded
                />
              ))
            )}
          </div>
        </div>

        <div className="border-t border-[#edeff3]" />

        {/* From parent units — parent-cascaded, deduped */}
        <div className="flex flex-col shrink-0">
          <div className="px-3 pt-3 pb-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wide text-[#697a9b]">
              From parent units
            </span>
          </div>
          <div className="flex flex-col px-1.5 pb-3">
            {parent.length === 0 ? (
              <div className="px-2 py-2 text-[12px] text-[#697a9b] italic">
                Nothing from parent units yet
              </div>
            ) : (
              parent.map((folder) => (
                <FolderNode
                  key={folder.id}
                  folder={folder}
                  viewingUnitId={folder.unitId}
                  selectedFolderId={selectedFolderId}
                  onSelect={onSelectFolder}
                  depth={0}
                  isShared
                  showArchived={false}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
