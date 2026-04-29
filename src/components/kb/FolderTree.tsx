import { useState, useMemo, useEffect, useRef } from 'react';
import {
  ChevronRight,
  ChevronDown,
  FolderClosed,
  FolderOpen,
  Plus,
  MoreHorizontal,
  Pencil,
  FolderPlus,
  Archive,
  Eye,
  RotateCcw,
  Files,
} from 'lucide-react';
import type { KBFolder } from '@/types';
import {
  getOwnRootFolders,
  getSharedRootFolders,
  getSubUnitRootFolders,
  getChildFolders,
  getArticleCount,
  getFolderDepth,
  getFolder,
  getUnit,
} from '@/data/mock-data';
import { useFolderVersion } from '@/state/folder-store';

export type FolderAction =
  | 'create-sub'
  | 'rename'
  | 'change-visibility'
  | 'archive'
  | 'restore';

interface FolderTreeProps {
  unitId: string;
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string) => void;
  showArchived: boolean;
  showSubUnits: boolean;
  isAllArticlesActive: boolean;
  allArticlesCount: number;
  onSelectAllArticles: () => void;
  onCreateRootFolder?: () => void;
  onFolderAction?: (action: FolderAction, folder: KBFolder) => void;
}

interface FolderNodeProps {
  folder: KBFolder;
  viewingUnitId: string;
  selectedFolderId: string | null;
  onSelect: (id: string) => void;
  onAction?: (action: FolderAction, folder: KBFolder) => void;
  depth: number;
  isShared?: boolean;
  showArchived: boolean;
  defaultExpanded?: boolean;
}

const MAX_FOLDER_DEPTH = 2;

export function buildFolderActions(folder: KBFolder): {
  icon: React.ReactNode;
  label: string;
  action: FolderAction;
  disabled?: boolean;
  danger?: boolean;
}[] {
  if (folder.status === 'archived') {
    return [
      {
        icon: <RotateCcw className="w-3.5 h-3.5" />,
        label: 'Restore',
        action: 'restore',
      },
    ];
  }

  const canAddSubfolder = getFolderDepth(folder.id) < MAX_FOLDER_DEPTH;
  return [
    {
      icon: <FolderPlus className="w-3.5 h-3.5" />,
      label: 'Create sub-folder',
      action: 'create-sub',
      disabled: !canAddSubfolder,
    },
    { icon: <Pencil className="w-3.5 h-3.5" />, label: 'Rename', action: 'rename' },
    { icon: <Eye className="w-3.5 h-3.5" />, label: 'Change visibility', action: 'change-visibility' },
    { icon: <Archive className="w-3.5 h-3.5" />, label: 'Archive', action: 'archive', danger: true },
  ];
}

function FolderActionsMenu({
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

function FolderNode({
  folder,
  viewingUnitId,
  selectedFolderId,
  onSelect,
  onAction,
  depth,
  isShared,
  showArchived,
  defaultExpanded,
}: FolderNodeProps) {
  const children = getChildFolders(folder.id, { includeArchived: showArchived });
  const [expanded, setExpanded] = useState(!!defaultExpanded);
  const [menuOpen, setMenuOpen] = useState(false);
  const isSelected = selectedFolderId === folder.id;
  const count = getArticleCount(folder.id, viewingUnitId);
  const sourceUnit = isShared ? getUnit(folder.unitId) : null;
  const isArchived = folder.status === 'archived';

  return (
    <div>
      <div
        className={`group relative flex items-center gap-1.5 h-7 pr-2 rounded-md cursor-pointer select-none transition-colors ${
          isSelected
            ? 'bg-[#ebf5ff] text-[#0052a3]'
            : isArchived
            ? 'text-[#a8b1c2] hover:bg-[#fafbfc]'
            : 'text-[#1f242e] hover:bg-[#fafbfc]'
        }`}
        style={{ paddingLeft: `${8 + depth * 14}px` }}
        onClick={() => onSelect(folder.id)}
      >
        {children.length > 0 ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((p) => !p);
            }}
            className="shrink-0 flex items-center justify-center w-4 h-4 text-[#697a9b]"
          >
            {expanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}
        <div
          className={`w-4 h-4 rounded-[3px] flex items-center justify-center shrink-0 ${
            isShared || isArchived ? 'opacity-60' : ''
          }`}
          style={{ backgroundColor: folder.color }}
        >
          <FolderClosed className="w-2.5 h-2.5 text-white" />
        </div>
        <span
          className={`text-[13px] truncate flex-1 ${isArchived ? 'italic line-through' : ''}`}
        >
          {folder.name}
        </span>
        {isArchived && (
          <span className="text-[10px] text-[#697a9b] uppercase tracking-wide shrink-0">
            archived
          </span>
        )}
        {!isArchived && count > 0 && (
          <span className="text-[11px] text-[#697a9b] tabular-nums shrink-0">
            {count}
          </span>
        )}
        {!isShared && onAction && (
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((p) => !p);
              }}
              className={`flex items-center justify-center w-5 h-5 rounded hover:bg-[#edeff3] ${
                menuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
              title="Folder actions"
            >
              <MoreHorizontal className="w-3.5 h-3.5 text-[#525f7a]" />
            </button>
            {menuOpen && (
              <FolderActionsMenu
                folder={folder}
                onAction={onAction}
                onClose={() => setMenuOpen(false)}
              />
            )}
          </div>
        )}
      </div>
      {sourceUnit && (
        <div
          className="text-[11px] text-[#697a9b] -mt-0.5 mb-0.5"
          style={{ paddingLeft: `${8 + depth * 14 + 4 + 16 + 6}px` }}
        >
          {sourceUnit.name}
        </div>
      )}
      {expanded && children.length > 0 && (
        <div className="flex flex-col">
          {children.map((child) => (
            <FolderNode
              key={child.id}
              folder={child}
              viewingUnitId={viewingUnitId}
              selectedFolderId={selectedFolderId}
              onSelect={onSelect}
              onAction={onAction}
              depth={depth + 1}
              isShared={isShared}
              showArchived={showArchived}
              defaultExpanded={defaultExpanded}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CreateFolderMenu({
  selectedOwnFolder,
  onCreateRoot,
  onCreateSub,
  onClose,
}: {
  selectedOwnFolder: KBFolder | null;
  onCreateRoot: () => void;
  onCreateSub: (parent: KBFolder) => void;
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

  const subDisabled =
    !selectedOwnFolder ||
    selectedOwnFolder.status !== 'active' ||
    getFolderDepth(selectedOwnFolder.id) >= 2;

  let subHelper: string | null = null;
  if (!selectedOwnFolder) {
    subHelper = 'Select a folder first';
  } else if (selectedOwnFolder.status !== 'active') {
    subHelper = 'Selected folder is archived';
  } else if (getFolderDepth(selectedOwnFolder.id) >= 2) {
    subHelper = 'Max depth reached';
  }

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-1 bg-white border border-[#e0e4eb] rounded-lg shadow-[0px_4px_12px_rgba(31,36,46,0.12)] z-20 py-1 min-w-[220px]"
    >
      <button
        type="button"
        onClick={() => {
          onCreateRoot();
          onClose();
        }}
        className="flex items-center gap-2 w-full px-3 py-1.5 text-[13px] text-left text-[#1f242e] hover:bg-[#fafbfc]"
      >
        <FolderClosed className="w-3.5 h-3.5 text-[#697a9b]" />
        Create folder
      </button>
      <button
        type="button"
        disabled={subDisabled}
        onClick={() => {
          if (subDisabled || !selectedOwnFolder) return;
          onCreateSub(selectedOwnFolder);
          onClose();
        }}
        className={`flex items-start gap-2 w-full px-3 py-1.5 text-[13px] text-left ${
          subDisabled
            ? 'text-[#a8b1c2] cursor-not-allowed'
            : 'text-[#1f242e] hover:bg-[#fafbfc]'
        }`}
      >
        <FolderOpen
          className={`w-3.5 h-3.5 mt-0.5 ${subDisabled ? 'text-[#a8b1c2]' : 'text-[#697a9b]'}`}
        />
        <div className="flex flex-col min-w-0">
          <span>Create sub-folder</span>
          {subHelper && (
            <span className="text-[11px] text-[#a8b1c2]">{subHelper}</span>
          )}
        </div>
      </button>
    </div>
  );
}

export function FolderTree({
  unitId,
  selectedFolderId,
  onSelectFolder,
  showArchived,
  showSubUnits,
  isAllArticlesActive,
  allArticlesCount,
  onSelectAllArticles,
  onCreateRootFolder,
  onFolderAction,
}: FolderTreeProps) {
  const version = useFolderVersion();
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const ownFolders = useMemo(
    () => getOwnRootFolders(unitId, { includeArchived: showArchived }),
    [unitId, version, showArchived]
  );
  const sharedFolders = useMemo(() => getSharedRootFolders(unitId), [unitId, version]);
  const subUnitFolders = useMemo(
    () => (showSubUnits ? getSubUnitRootFolders(unitId) : []),
    [unitId, version, showSubUnits]
  );

  // The selected folder is only valid for "create sub-folder" if it belongs to
  // the current unit (own, not shared).
  const selectedOwnFolder = useMemo(() => {
    if (!selectedFolderId) return null;
    const folder = getFolder(selectedFolderId);
    if (!folder || folder.unitId !== unitId) return null;
    return folder;
  }, [selectedFolderId, unitId, version]);

  return (
    <aside className="w-[260px] shrink-0 border-r border-[#edeff3] bg-white flex flex-col h-full overflow-hidden">
      {/* All articles pseudo-entry — height matches the right-column search toolbar */}
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
          {allArticlesCount > 0 && (
            <span className="text-[11px] text-[#697a9b] tabular-nums shrink-0">
              {allArticlesCount}
            </span>
          )}
        </button>
      </div>

      <div className="border-t border-[#edeff3]" />

      {/* Own folders section */}
      <div className="flex flex-col min-h-0">
        <div className="flex items-center justify-between px-3 pt-3 pb-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wide text-[#697a9b]">
            Own folders
          </span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setCreateMenuOpen((p) => !p)}
              className="flex items-center justify-center w-5 h-5 rounded hover:bg-[#edeff3]"
              title="Create folder"
            >
              <Plus className="w-3.5 h-3.5 text-[#525f7a]" />
            </button>
            {createMenuOpen && (
              <CreateFolderMenu
                selectedOwnFolder={selectedOwnFolder}
                onCreateRoot={() => onCreateRootFolder?.()}
                onCreateSub={(parent) => onFolderAction?.('create-sub', parent)}
                onClose={() => setCreateMenuOpen(false)}
              />
            )}
          </div>
        </div>
        <div className="flex flex-col px-1.5 pb-2 overflow-y-auto">
          {ownFolders.length === 0 ? (
            <div className="px-2 py-2 text-[12px] text-[#697a9b] italic">
              No folders yet
            </div>
          ) : (
            ownFolders.map((folder) => (
              <FolderNode
                key={folder.id}
                folder={folder}
                viewingUnitId={unitId}
                selectedFolderId={selectedFolderId}
                onSelect={onSelectFolder}
                onAction={onFolderAction}
                depth={0}
                showArchived={showArchived}
                defaultExpanded
              />
            ))
          )}
        </div>
      </div>

      <div className="border-t border-[#edeff3]" />

      {/* Shared with you */}
      <div className="flex flex-col shrink-0">
        <div className="px-3 pt-3 pb-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wide text-[#697a9b]">
            Shared with you
          </span>
        </div>
        <div className="flex flex-col px-1.5 pb-3 overflow-y-auto">
          {sharedFolders.length === 0 ? (
            <div className="px-2 py-2 text-[12px] text-[#697a9b] italic">
              Nothing shared yet
            </div>
          ) : (
            sharedFolders.map((folder) => (
              <FolderNode
                key={folder.id}
                folder={folder}
                viewingUnitId={unitId}
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

      {/* From sub-units (toggle-driven) */}
      {showSubUnits && (
        <>
          <div className="border-t border-[#edeff3]" />
          <div className="flex flex-col flex-1 min-h-0">
            <div className="px-3 pt-3 pb-1.5">
              <span className="text-[11px] font-medium uppercase tracking-wide text-[#697a9b]">
                From sub-units
              </span>
            </div>
            <div className="flex flex-col px-1.5 pb-3 overflow-y-auto">
              {subUnitFolders.length === 0 ? (
                <div className="px-2 py-2 text-[12px] text-[#697a9b] italic">
                  No sub-unit folders yet
                </div>
              ) : (
                subUnitFolders.map((folder) => (
                  <FolderNode
                    key={folder.id}
                    folder={folder}
                    viewingUnitId={unitId}
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
        </>
      )}
    </aside>
  );
}
