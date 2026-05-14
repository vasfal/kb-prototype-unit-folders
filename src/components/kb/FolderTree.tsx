import { useState, useMemo, useEffect, useRef, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderClosed,
  FolderOpen,
  Plus,
  MoreHorizontal,
  Pencil,
  FolderPlus,
  Eye,
  Files,
  Lock,
  Trash2,
} from 'lucide-react';
import type { KBFolder } from '@/types';
import {
  getOwnRootFolders,
  getSharedRootFolders,
  getSubUnitRootFolders,
  getChildFolders,
  getFolderDepth,
  getFolder,
  getFolderDisplayStyle,
} from '@/data/mock-data';
import { useFolderVersion } from '@/state/folder-store';

export type FolderAction =
  | 'create-sub'
  | 'edit'
  | 'change-visibility'
  | 'delete'
  | 'restore';

interface FolderTreeProps {
  unitId: string;
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string) => void;
  showArchived: boolean;
  showSubUnits: boolean;
  isAllArticlesActive: boolean;
  onSelectAllArticles: () => void;
  onCreateRootFolder?: () => void;
  onCreateSubFolder?: (parent: KBFolder | null) => void;
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
  /** When set, renders a small caption (owning unit name) after the folder
   *  name. Only applied to the root row — recursive children get nothing. */
  unitCaption?: string;
}

const MAX_FOLDER_DEPTH = 3;

export function buildFolderActions(folder: KBFolder): {
  icon: React.ReactNode;
  label: string;
  action: FolderAction;
  disabled?: boolean;
  danger?: boolean;
}[] {
  const canAddSubfolder = getFolderDepth(folder.id) < MAX_FOLDER_DEPTH;
  const items: {
    icon: React.ReactNode;
    label: string;
    action: FolderAction;
    disabled?: boolean;
    danger?: boolean;
  }[] = [
    {
      icon: <FolderPlus className="w-3.5 h-3.5" />,
      label: 'Create sub-folder',
      action: 'create-sub',
      disabled: !canAddSubfolder,
    },
    { icon: <Pencil className="w-3.5 h-3.5" />, label: 'Edit', action: 'edit' },
    {
      icon: <Eye className="w-3.5 h-3.5" />,
      label: 'Change visibility',
      action: 'change-visibility',
    },
    {
      icon: <Trash2 className="w-3.5 h-3.5" />,
      label: 'Delete',
      action: 'delete',
      danger: true,
    },
  ];
  return items;
}

/** Positions a popover next to its trigger button. Returns top/left in viewport
 *  coords. Right-aligns the menu so its right edge matches the button's right
 *  edge, clamped within the viewport. */
function usePortalMenuPosition(
  anchorRef: RefObject<HTMLElement | null>,
  open: boolean,
  width: number
): { top: number; left: number } | null {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  useEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    const compute = () => {
      const el = anchorRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const margin = 6;
      const left = Math.max(
        margin,
        Math.min(rect.right - width, window.innerWidth - width - margin)
      );
      setPos({ top: rect.bottom + 4, left });
    };
    compute();
    window.addEventListener('resize', compute);
    window.addEventListener('scroll', compute, true);
    return () => {
      window.removeEventListener('resize', compute);
      window.removeEventListener('scroll', compute, true);
    };
  }, [anchorRef, open, width]);
  return pos;
}

function FolderActionsMenu({
  folder,
  onAction,
  onClose,
  anchorRef,
}: {
  folder: KBFolder;
  onAction: (action: FolderAction, folder: KBFolder) => void;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const pos = usePortalMenuPosition(anchorRef, true, 200);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        ref.current &&
        !ref.current.contains(target) &&
        anchorRef.current &&
        !anchorRef.current.contains(target)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose, anchorRef]);

  const items = buildFolderActions(folder);

  if (!pos) return null;
  return createPortal(
    <div
      ref={ref}
      style={{ top: pos.top, left: pos.left, width: 200 }}
      className="fixed bg-white border border-[#e0e4eb] rounded-lg shadow-[0px_4px_12px_rgba(31,36,46,0.12)] z-[80] py-1"
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
    </div>,
    document.body
  );
}

export function FolderNode({
  folder,
  viewingUnitId,
  selectedFolderId,
  onSelect,
  onAction,
  depth,
  isShared,
  showArchived,
  defaultExpanded,
  unitCaption,
}: FolderNodeProps) {
  const children = getChildFolders(folder.id, { includeArchived: showArchived });
  const [expanded, setExpanded] = useState(!!defaultExpanded);
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const isSelected = selectedFolderId === folder.id;
  const isArchived = folder.status === 'archived';
  const isPrivate = folder.visibility === 'current_unit_only';
  const displayStyle = getFolderDisplayStyle(folder.id);

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
        <Folder
          className={`w-[18px] h-[18px] shrink-0 ${
            isShared || isArchived ? 'opacity-60' : ''
          }`}
          style={{ color: displayStyle.color, fill: displayStyle.color }}
          strokeWidth={1.5}
        />
        <span
          className={`text-[13px] truncate flex-1 ${isArchived ? 'italic line-through' : ''}`}
        >
          {folder.name}
        </span>
        {unitCaption && (
          <span className="text-[11px] text-[#697a9b] truncate shrink-0 max-w-[80px]">
            {unitCaption}
          </span>
        )}
        {isArchived && (
          <span className="text-[10px] text-[#697a9b] uppercase tracking-wide shrink-0">
            archived
          </span>
        )}
        {!isArchived && isPrivate && (
          <span
            title="Private — only this unit can see it"
            className="shrink-0 flex items-center"
          >
            <Lock
              className="w-3.5 h-3.5 text-[#697a9b]"
              strokeWidth={2}
              aria-label="Private"
            />
          </span>
        )}
        {!isShared && onAction && (
          <div className="shrink-0">
            <button
              ref={triggerRef}
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
                anchorRef={triggerRef}
              />
            )}
          </div>
        )}
      </div>
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
  anchorRef,
}: {
  selectedOwnFolder: KBFolder | null;
  onCreateRoot: () => void;
  onCreateSub: (parent: KBFolder | null) => void;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const pos = usePortalMenuPosition(anchorRef, true, 220);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        ref.current &&
        !ref.current.contains(target) &&
        anchorRef.current &&
        !anchorRef.current.contains(target)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose, anchorRef]);

  // Pre-select the currently selected folder only if it can serve as a parent;
  // otherwise the dialog's dropdown will fall back to the first eligible folder.
  const preselect =
    selectedOwnFolder &&
    selectedOwnFolder.status === 'active' &&
    getFolderDepth(selectedOwnFolder.id) < MAX_FOLDER_DEPTH
      ? selectedOwnFolder
      : null;

  if (!pos) return null;
  return createPortal(
    <div
      ref={ref}
      style={{ top: pos.top, left: pos.left, width: 220 }}
      className="fixed bg-white border border-[#e0e4eb] rounded-lg shadow-[0px_4px_12px_rgba(31,36,46,0.12)] z-[80] py-1"
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
        onClick={() => {
          onCreateSub(preselect);
          onClose();
        }}
        className="flex items-center gap-2 w-full px-3 py-1.5 text-[13px] text-left text-[#1f242e] hover:bg-[#fafbfc]"
      >
        <FolderOpen className="w-3.5 h-3.5 text-[#697a9b]" />
        Create sub-folder
      </button>
    </div>,
    document.body
  );
}

export function FolderTree({
  unitId,
  selectedFolderId,
  onSelectFolder,
  showArchived,
  showSubUnits,
  isAllArticlesActive,
  onSelectAllArticles,
  onCreateRootFolder,
  onCreateSubFolder,
  onFolderAction,
}: FolderTreeProps) {
  const version = useFolderVersion();
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const createTriggerRef = useRef<HTMLButtonElement>(null);
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
        </button>
      </div>

      <div className="border-t border-[#edeff3]" />

      {/* Own folders section */}
      <div className="flex flex-col min-h-0">
        <div className="flex items-center justify-between px-3 pt-3 pb-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wide text-[#697a9b]">
            Own folders
          </span>
          <div>
            <button
              ref={createTriggerRef}
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
                onCreateSub={(parent) => onCreateSubFolder?.(parent)}
                onClose={() => setCreateMenuOpen(false)}
                anchorRef={createTriggerRef}
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

      {/* From parent units (cascade down from ancestor units) */}
      <div className="flex flex-col shrink-0">
        <div className="px-3 pt-3 pb-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wide text-[#697a9b]">
            From parent units
          </span>
        </div>
        <div className="flex flex-col px-1.5 pb-3 overflow-y-auto">
          {sharedFolders.length === 0 ? (
            <div className="px-2 py-2 text-[12px] text-[#697a9b] italic">
              Nothing from parent units yet
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
