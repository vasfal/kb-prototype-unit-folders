import { useEffect, useMemo, useRef, useState } from 'react';
import { Building2, ChevronDown, Folder, Globe2, Lock } from 'lucide-react';
import type { KBFolder, Visibility } from '@/types';
import {
  getFolder,
  getFolderDepth,
  getMaxAllowedVisibility,
  getOwnFoldersInTreeOrder,
  getUnit,
} from '@/data/mock-data';

interface CreateArticleDialogProps {
  unitId: string;
  /** Pre-selected folder if user triggered create from inside a folder. */
  initialFolderId?: string;
  onConfirm: (data: {
    title: string;
    folderId: string;
    visibility: Visibility;
  }) => void;
  onCancel: () => void;
}

interface FolderOption {
  id: string;
  label: string;
  depth: number;
}

export function CreateArticleDialog({
  unitId,
  initialFolderId,
  onConfirm,
  onCancel,
}: CreateArticleDialogProps) {
  const unit = getUnit(unitId);

  const folderOptions: FolderOption[] = useMemo(() => {
    return getOwnFoldersInTreeOrder(unitId).map((f) => ({
      id: f.id,
      label: f.name,
      depth: getFolderDepth(f.id),
    }));
  }, [unitId]);

  const defaultFolderId =
    initialFolderId && folderOptions.find((o) => o.id === initialFolderId)
      ? initialFolderId
      : folderOptions[0]?.id ?? '';
  const defaultFolder: KBFolder | undefined = defaultFolderId
    ? getFolder(defaultFolderId)
    : undefined;

  const [title, setTitle] = useState('');
  const [folderId, setFolderId] = useState(defaultFolderId);
  const [visibility, setVisibility] = useState<Visibility>(
    defaultFolder?.visibility ?? 'unit_and_subunits'
  );
  const [error, setError] = useState('');
  const [folderPickerOpen, setFolderPickerOpen] = useState(false);
  const folderPickerRef = useRef<HTMLDivElement>(null);

  // Constraint inherited from the selected folder. Articles can never be more
  // visible than the folder they live in. Recomputes when folder changes.
  const folderMax: Visibility = folderId
    ? (() => {
        const f = getFolder(folderId);
        if (!f) return 'unit_and_subunits';
        // The folder itself can be private even if its parent chain is public —
        // walk including the folder's own visibility.
        if (f.visibility === 'current_unit_only') return 'current_unit_only';
        return getMaxAllowedVisibility(f.parentFolderId);
      })()
    : 'unit_and_subunits';
  const publicLocked = folderMax === 'current_unit_only';

  // When the folder switches to a private chain, force visibility down.
  useEffect(() => {
    if (publicLocked && visibility === 'unit_and_subunits') {
      setVisibility('current_unit_only');
    }
  }, [publicLocked, visibility]);

  // Close folder dropdown on outside click.
  useEffect(() => {
    if (!folderPickerOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        folderPickerRef.current &&
        !folderPickerRef.current.contains(e.target as Node)
      ) {
        setFolderPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [folderPickerOpen]);

  const selectedFolder = folderOptions.find((o) => o.id === folderId);

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (!trimmed) {
      setError('Article title cannot be empty.');
      return;
    }
    if (trimmed.length > 200) {
      setError('Title is too long (max 200 characters).');
      return;
    }
    if (!folderId) {
      setError('Please pick a folder.');
      return;
    }
    onConfirm({ title: trimmed, folderId, visibility });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-lg shadow-[0px_4px_12px_rgba(31,36,46,0.12)] w-[440px] overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <h3 className="text-[16px] font-medium text-[#1f242e] leading-[24px]">
            New article
          </h3>
          <p className="text-[13px] text-[#697a9b] mt-1">
            Start a draft. You can edit content and publish from the next screen.
          </p>
        </div>

        <div className="px-5 pb-4 flex flex-col gap-3">
          {/* Title */}
          <div>
            <label className="block text-[13px] text-[#3d475c] mb-1.5">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit();
                if (e.key === 'Escape') onCancel();
              }}
              placeholder="e.g. Release process"
              autoFocus
              className={`w-full h-9 px-3 text-[14px] border rounded-lg bg-white text-[#1f242e] placeholder:text-[#697a9b] focus:outline-none focus:ring-1 ${
                error
                  ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
                  : 'border-[#e0e4eb] focus:ring-[#006bd6] focus:border-[#006bd6]'
              }`}
            />
          </div>

          {/* Folder picker */}
          <div>
            <label className="block text-[13px] text-[#3d475c] mb-1.5">Folder</label>
            <div className="relative" ref={folderPickerRef}>
              <button
                type="button"
                onClick={() => setFolderPickerOpen((p) => !p)}
                className={`w-full flex items-center justify-between h-9 pl-3 pr-2 text-[14px] border rounded-lg bg-white text-left ${
                  folderPickerOpen
                    ? 'border-[#006bd6] ring-1 ring-[#006bd6]'
                    : 'border-[#e0e4eb] hover:bg-[#fafbfc]'
                } ${selectedFolder ? 'text-[#1f242e]' : 'text-[#697a9b]'}`}
              >
                <span className="truncate">
                  {selectedFolder?.label ?? 'Pick a folder'}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-[#697a9b] shrink-0 transition-transform ${
                    folderPickerOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {folderPickerOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white border border-[#e0e4eb] rounded-lg shadow-[0px_4px_12px_rgba(31,36,46,0.12)] py-1 max-h-[240px] overflow-y-auto">
                  {folderOptions.length === 0 ? (
                    <div className="px-3 py-2 text-[13px] text-[#697a9b] italic">
                      No folders in this unit yet.
                    </div>
                  ) : (
                    folderOptions.map((opt) => {
                      const active = opt.id === folderId;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setFolderId(opt.id);
                            setError('');
                            setFolderPickerOpen(false);
                          }}
                          className={`flex items-center gap-2 w-full text-left text-[13px] py-1.5 pr-3 ${
                            active
                              ? 'bg-[#ebf5ff] text-[#0052a3]'
                              : 'text-[#1f242e] hover:bg-[#fafbfc]'
                          }`}
                          style={{ paddingLeft: 12 + (opt.depth - 1) * 16 }}
                        >
                          <Folder
                            className={`w-3.5 h-3.5 shrink-0 ${
                              active ? 'text-[#006bd6]' : 'text-[#697a9b]'
                            }`}
                            strokeWidth={1.75}
                          />
                          <span className="truncate">{opt.label}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-[13px] text-[#3d475c] mb-1.5">
              Visibility
            </label>
            <div className="grid grid-cols-2 gap-2">
              <VisibilityOption
                label="Public"
                description="Visible to this unit and sub-units."
                icon={<Globe2 className="w-4 h-4" />}
                active={visibility === 'unit_and_subunits'}
                disabled={publicLocked}
                disabledReason="The selected folder (or its parent) is private — articles inside can't be more visible than the folder."
                onClick={() => setVisibility('unit_and_subunits')}
              />
              <VisibilityOption
                label="Private"
                description="Only this unit can see it."
                icon={<Lock className="w-4 h-4" />}
                active={visibility === 'current_unit_only'}
                onClick={() => setVisibility('current_unit_only')}
              />
            </div>
          </div>

          {/* Current unit (readonly) */}
          <div>
            <label className="block text-[13px] text-[#3d475c] mb-1.5">Unit</label>
            <div className="flex items-center gap-2 h-9 px-3 text-[14px] border border-[#e0e4eb] rounded-lg bg-[#fafbfc] text-[#525f7a]">
              <Building2 className="w-4 h-4 text-[#697a9b] shrink-0" />
              <span className="truncate">{unit?.name ?? 'Unknown'}</span>
            </div>
          </div>

          {error && <p className="text-[12px] text-red-500 -mt-1">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[#edeff3]">
          <button
            type="button"
            onClick={onCancel}
            className="h-8 px-3 text-[14px] font-medium text-[#1f242e] border border-[#e0e4eb] rounded-lg hover:bg-[#fafbfc]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="h-8 px-3 text-[14px] font-medium text-white bg-[#006bd6] rounded-lg hover:bg-[#0052a3]"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

function VisibilityOption({
  label,
  description,
  icon,
  active,
  disabled,
  disabledReason,
  onClick,
}: {
  label: string;
  description: string;
  icon: React.ReactNode;
  active: boolean;
  disabled?: boolean;
  disabledReason?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={disabled ? disabledReason : undefined}
      className={`flex items-start gap-2 p-2.5 border rounded-lg text-left transition-colors ${
        disabled
          ? 'border-[#edeff3] bg-[#fafbfc] opacity-50 cursor-not-allowed'
          : active
          ? 'border-[#006bd6] bg-[#ebf5ff]'
          : 'border-[#e0e4eb] hover:bg-[#fafbfc]'
      }`}
    >
      <span
        className={`mt-0.5 ${
          disabled ? 'text-[#a8b1c2]' : active ? 'text-[#006bd6]' : 'text-[#697a9b]'
        }`}
      >
        {icon}
      </span>
      <span className="flex flex-col min-w-0">
        <span
          className={`text-[13px] font-medium leading-[18px] ${
            disabled
              ? 'text-[#697a9b]'
              : active
              ? 'text-[#0052a3]'
              : 'text-[#1f242e]'
          }`}
        >
          {label}
        </span>
        <span className="text-[11px] text-[#697a9b] leading-[14px]">
          {disabled && disabledReason ? disabledReason : description}
        </span>
      </span>
    </button>
  );
}
