import { useState } from 'react';
import { FolderClosed, ChevronRight, ChevronDown } from 'lucide-react';
import type { KBArticle, KBFolder } from '@/types';
import { getOwnRootFolders, getChildFolders } from '@/data/mock-data';

interface MoveDialogProps {
  article: KBArticle;
  onConfirm: (folderId: string) => void;
  onCancel: () => void;
}

function FolderNode({
  folder,
  selectedId,
  onSelect,
  depth = 0,
}: {
  folder: KBFolder;
  selectedId: string;
  onSelect: (id: string) => void;
  depth?: number;
}) {
  const children = getChildFolders(folder.id);
  const [expanded, setExpanded] = useState(true);
  const isSelected = selectedId === folder.id;

  return (
    <div>
      <button
        type="button"
        onClick={() => onSelect(folder.id)}
        className={`flex items-center gap-2 w-full px-3 py-1.5 text-[14px] rounded-md transition-colors ${
          isSelected
            ? 'bg-[#ebf5ff] border border-[#d6eaff] text-[#1f242e]'
            : 'text-[#1f242e] hover:bg-[#fafbfc]'
        }`}
        style={{ paddingLeft: `${12 + depth * 20}px` }}
      >
        {children.length > 0 ? (
          <span
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((p) => !p);
            }}
            className="shrink-0 text-[#697a9b]"
          >
            {expanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </span>
        ) : (
          <span className="w-3.5 shrink-0" />
        )}
        <div
          className="w-5 h-5 rounded flex items-center justify-center shrink-0"
          style={{ backgroundColor: folder.color }}
        >
          <FolderClosed className="w-3 h-3 text-white" />
        </div>
        <span className="truncate">{folder.name}</span>
      </button>
      {expanded &&
        children.map((child) => (
          <FolderNode
            key={child.id}
            folder={child}
            selectedId={selectedId}
            onSelect={onSelect}
            depth={depth + 1}
          />
        ))}
    </div>
  );
}

export function MoveDialog({ article, onConfirm, onCancel }: MoveDialogProps) {
  const [selectedId, setSelectedId] = useState(article.folderId);
  // Move within the current unit only (per PRD §10.3).
  const rootFolders = getOwnRootFolders(article.unitId);
  const isSameFolder = selectedId === article.folderId;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-lg shadow-[0px_4px_12px_rgba(31,36,46,0.12)] w-[400px] overflow-hidden flex flex-col max-h-[70vh]">
        <div className="px-5 pt-5 pb-3 shrink-0">
          <h3 className="text-[16px] font-medium text-[#1f242e] leading-[24px]">
            Move article
          </h3>
          <p className="text-[13px] text-[#697a9b] mt-1">
            Select a destination folder for "{article.title}"
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-2 min-h-0">
          <div className="flex flex-col gap-0.5">
            {rootFolders.map((f) => (
              <FolderNode
                key={f.id}
                folder={f}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[#edeff3] shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="h-8 px-3 text-[14px] font-medium text-[#1f242e] border border-[#e0e4eb] rounded-lg hover:bg-[#fafbfc]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(selectedId)}
            disabled={isSameFolder}
            className={`h-8 px-3 text-[14px] font-medium rounded-lg ${
              isSameFolder
                ? 'text-[#697a9b] bg-[#edeff3] cursor-not-allowed'
                : 'text-white bg-[#006bd6] hover:bg-[#0052a3]'
            }`}
          >
            Move
          </button>
        </div>
      </div>
    </div>
  );
}
