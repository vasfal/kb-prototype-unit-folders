import { useState, type DragEvent } from 'react';
import { Folder, GripVertical, Unlock } from 'lucide-react';
import { LockFilled } from './LockFilled';
import type { KBFolder } from '@/types';
import {
  getOwnRootFolders,
  getChildFolders,
  canMoveFolderUnder,
  moveFolder,
  getFolderDisplayStyle,
  getMaxAllowedVisibility,
  setFolderVisibility,
} from '@/data/mock-data';
import { useFolderVersion } from '@/state/folder-store';

interface ReorderFoldersDialogProps {
  unitId: string;
  onClose: () => void;
}

interface FlatRow {
  folder: KBFolder;
  depth: number;
}

type DropPos = 'before' | 'after' | 'inside';

/** Flatten the unit's active own folders into a DFS-ordered, indented list. */
function buildFlatRows(unitId: string): FlatRow[] {
  const rows: FlatRow[] = [];
  const walk = (folder: KBFolder, depth: number) => {
    rows.push({ folder, depth });
    getChildFolders(folder.id).forEach((c) => walk(c, depth + 1));
  };
  getOwnRootFolders(unitId).forEach((f) => walk(f, 0));
  return rows;
}

/** Siblings (active) at a given parent level, in display order. */
function siblingsOf(unitId: string, parentId: string | null): KBFolder[] {
  return parentId === null
    ? getOwnRootFolders(unitId)
    : getChildFolders(parentId);
}

export function ReorderFoldersDialog({
  unitId,
  onClose,
}: ReorderFoldersDialogProps) {
  const version = useFolderVersion();
  const rows = buildFlatRows(unitId);
  void version; // re-render when folders change

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    id: string;
    pos: DropPos;
  } | null>(null);

  // Resolve a hovered row + vertical position into a concrete (parent, index)
  // move, or null when the move isn't allowed.
  const resolveDrop = (
    targetId: string,
    pos: DropPos
  ): { parentId: string | null; index: number } | null => {
    if (!draggingId || draggingId === targetId) return null;
    const target = rows.find((r) => r.folder.id === targetId)?.folder;
    if (!target) return null;

    if (pos === 'inside') {
      if (!canMoveFolderUnder(draggingId, targetId)) return null;
      // Append to the end of the target's children.
      const kids = siblingsOf(unitId, targetId).filter(
        (f) => f.id !== draggingId
      );
      return { parentId: targetId, index: kids.length };
    }

    const parentId = target.parentFolderId;
    if (!canMoveFolderUnder(draggingId, parentId)) return null;
    const sibs = siblingsOf(unitId, parentId).filter(
      (f) => f.id !== draggingId
    );
    const targetIdx = sibs.findIndex((f) => f.id === targetId);
    if (targetIdx === -1) return null;
    return { parentId, index: pos === 'before' ? targetIdx : targetIdx + 1 };
  };

  const handleDragOver = (e: DragEvent, row: FlatRow) => {
    if (!draggingId || draggingId === row.folder.id) return;
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    const third = rect.height / 3;
    let pos: DropPos =
      y < third ? 'before' : y > third * 2 ? 'after' : 'inside';

    // If nesting inside isn't allowed, fall back to a sibling drop.
    if (pos === 'inside' && !resolveDrop(row.folder.id, 'inside')) {
      pos = y < rect.height / 2 ? 'before' : 'after';
    }
    const ok = !!resolveDrop(row.folder.id, pos);
    e.dataTransfer.dropEffect = ok ? 'move' : 'none';
    setDropTarget(ok ? { id: row.folder.id, pos } : null);
  };

  const handleDrop = (e: DragEvent, row: FlatRow) => {
    e.preventDefault();
    if (!draggingId || !dropTarget || dropTarget.id !== row.folder.id) {
      setDropTarget(null);
      return;
    }
    const move = resolveDrop(row.folder.id, dropTarget.pos);
    if (move) moveFolder(draggingId, move.parentId, move.index);
    setDraggingId(null);
    setDropTarget(null);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-[0px_4px_12px_rgba(31,36,46,0.12)] w-[480px] max-h-[80vh] flex flex-col overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <h3 className="text-[16px] font-medium text-[#1f242e] leading-[24px]">
            Reorder folders
          </h3>
          <p className="text-[13px] text-[#697a9b] mt-1">
            Drag a folder to change its order, drop it onto another folder to
            nest it, or drop it between top-level folders to move it up.
          </p>
        </div>

        <div className="px-3 pb-3 flex-1 overflow-y-auto">
          {rows.length === 0 ? (
            <div className="px-2 py-6 text-[13px] text-[#697a9b] italic text-center">
              No folders to reorder yet.
            </div>
          ) : (
            <div className="flex flex-col">
              {rows.map((row) => {
                const isDragging = draggingId === row.folder.id;
                const indicator =
                  dropTarget?.id === row.folder.id ? dropTarget.pos : null;
                const displayStyle = getFolderDisplayStyle(row.folder.id);
                const isPrivate =
                  row.folder.visibility === 'current_unit_only';
                // A folder can't be made public if an ancestor is private.
                const lockedPrivate =
                  getMaxAllowedVisibility(row.folder.parentFolderId) ===
                  'current_unit_only';
                const visTitle = isPrivate
                  ? lockedPrivate
                    ? 'Private — the parent folder is private, so this can’t be made public'
                    : 'Private — visible only to people with access to this unit’s private content. Click to make public.'
                  : 'Public — available to everyone with access to view this unit’s knowledge base. Click to make private.';
                return (
                  <div
                    key={row.folder.id}
                    className="relative"
                    style={{ paddingLeft: row.depth * 20 }}
                  >
                    {indicator === 'before' && (
                      <div className="absolute left-0 right-0 top-0 h-0.5 bg-[#006bd6] rounded-full" />
                    )}
                    {indicator === 'after' && (
                      <div className="absolute left-0 right-0 bottom-0 h-0.5 bg-[#006bd6] rounded-full" />
                    )}
                    <div
                      draggable
                      onDragStart={(e) => {
                        setDraggingId(row.folder.id);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onDragEnd={() => {
                        setDraggingId(null);
                        setDropTarget(null);
                      }}
                      onDragOver={(e) => handleDragOver(e, row)}
                      onDrop={(e) => handleDrop(e, row)}
                      className={`group flex items-center gap-2 h-9 pr-2 rounded-md select-none cursor-grab active:cursor-grabbing transition-colors ${
                        isDragging
                          ? 'opacity-40'
                          : indicator === 'inside'
                          ? 'bg-[#ebf5ff] ring-1 ring-[#006bd6]'
                          : 'hover:bg-[#fafbfc]'
                      }`}
                    >
                      <GripVertical className="w-4 h-4 text-[#a8b1c2] shrink-0 ml-1" />
                      <Folder
                        className="w-[18px] h-[18px] shrink-0"
                        style={{
                          color: displayStyle.color,
                          fill: displayStyle.color,
                        }}
                        strokeWidth={1.5}
                      />
                      <span className="text-[13px] text-[#1f242e] truncate flex-1">
                        {row.folder.name}
                      </span>
                      <span className="relative shrink-0 mr-1 flex items-center group/lock">
                        <button
                          type="button"
                          disabled={isPrivate && lockedPrivate}
                          draggable={false}
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isPrivate && lockedPrivate) return;
                            setFolderVisibility(
                              row.folder.id,
                              isPrivate
                                ? 'unit_and_subunits'
                                : 'current_unit_only'
                            );
                          }}
                          className={`flex items-center justify-center w-6 h-6 rounded transition-colors ${
                            isPrivate && lockedPrivate
                              ? 'text-[#c1c7d0] cursor-not-allowed'
                              : 'text-[#697a9b] hover:bg-[#edeff3] hover:text-[#1f242e]'
                          }`}
                        >
                          {isPrivate ? (
                            <LockFilled className="w-3.5 h-3.5" strokeWidth={2} />
                          ) : (
                            <Unlock className="w-3.5 h-3.5" strokeWidth={2} />
                          )}
                        </button>
                        <span
                          role="tooltip"
                          className="pointer-events-none absolute right-full top-1/2 -translate-y-1/2 mr-2 z-[70] w-max max-w-[220px] px-2 py-1 rounded-md bg-[#1f242e] text-white text-[11px] leading-[15px] text-left whitespace-normal opacity-0 group-hover/lock:opacity-100 transition-opacity shadow-[0px_4px_12px_rgba(31,36,46,0.18)]"
                        >
                          {visTitle}
                        </span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[#edeff3]">
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-3 text-[14px] font-medium text-white bg-[#006bd6] rounded-lg hover:bg-[#0052a3]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
