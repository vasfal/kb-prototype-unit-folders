import { useMemo } from 'react';
import type { KBArticle, KBFolder } from '@/types';
import {
  getOwnRootFolders,
  getSharedRootFolders,
  getSubUnitRootFolders,
} from '@/data/mock-data';
import { useFolderVersion } from '@/state/folder-store';
import { FolderSection } from './FolderView';
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

  // All top-level folders the viewing unit can access, in display order:
  // own folders first, then shared (cascaded down from parents), then sub-unit
  // folders if the toggle is on.
  const topLevelFolders = useMemo<KBFolder[]>(() => {
    const own = getOwnRootFolders(viewingUnitId, { includeArchived: showArchived });
    const shared = getSharedRootFolders(viewingUnitId);
    const subUnits = showSubUnits ? getSubUnitRootFolders(viewingUnitId) : [];
    return [...own, ...shared, ...subUnits];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewingUnitId, showArchived, showSubUnits, version]);

  const handleSelectFolder = (folderId: string) => {
    onSelectFolder?.(folderId);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-white">
      <div className="flex-1 overflow-auto">
        {topLevelFolders.length === 0 ? (
          <EmptyState
            title="No articles yet"
            description="Articles you can access in this unit and from shared content will appear here."
          />
        ) : (
          topLevelFolders.map((folder) => (
            <FolderSection
              key={folder.id}
              folder={folder}
              viewingUnitId={viewingUnitId}
              showArchived={showArchived}
              viewMode={viewMode}
              size="md"
              recursive
              search={search}
              onArticleClick={onArticleClick}
              onSelectFolder={handleSelectFolder}
            />
          ))
        )}
      </div>
    </div>
  );
}
