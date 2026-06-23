import { useState, useEffect, useRef } from 'react';
import { Building2, ChevronDown, Folder, Globe2 } from 'lucide-react';
import { LockFilled } from './LockFilled';
import type { Visibility } from '@/types';
import { getMaxAllowedVisibility } from '@/data/mock-data';
import { FOLDER_COLORS, DEFAULT_FOLDER_COLOR } from './folder-icons';

export interface ParentPickerOption {
  id: string;
  label: string;
  /** 1 = root folder, 2 = sub-folder. Drives indentation in the picker. */
  depth: number;
}

interface CreateFolderDialogProps {
  /** "create" = new folder dialog; "edit" = rename and (for root) change color
   *  of an existing folder. Visibility is handled by its own dedicated dialog
   *  in both modes. */
  mode: 'create' | 'edit';
  initialName?: string;
  /** Initial color when editing — sets the active swatch in the picker. */
  initialColor?: string;
  /** Show color picker. Set true for root-folder create and root-folder edit;
   *  false for sub-folders (color inherits from the root). */
  showColorPicker?: boolean;
  /** When provided, a "Parent folder" dropdown is shown. Used for sub-folder creation. */
  parentPicker?: {
    options: ParentPickerOption[];
    initialId: string;
  };
  /** When provided, an owning-unit picker is shown. Used from the Home scope
   *  for root-folder creation, where there's no implicit current unit. */
  unitPicker?: {
    options: { id: string; label: string }[];
    initialId: string;
  };
  onConfirm: (result: {
    name: string;
    parentId: string | null;
    color?: string;
    visibility?: Visibility;
    unitId?: string;
  }) => void;
  onCancel: () => void;
}

export function CreateFolderDialog({
  mode,
  initialName = '',
  initialColor,
  showColorPicker,
  parentPicker,
  unitPicker,
  onConfirm,
  onCancel,
}: CreateFolderDialogProps) {
  const [name, setName] = useState(initialName);
  const [parentId, setParentId] = useState(parentPicker?.initialId ?? '');
  const [unitId, setUnitId] = useState(unitPicker?.initialId ?? '');
  const [color, setColor] = useState<string>(initialColor ?? DEFAULT_FOLDER_COLOR);
  const [visibility, setVisibility] = useState<Visibility>('unit_and_subunits');
  const [error, setError] = useState('');
  const [parentPickerOpen, setParentPickerOpen] = useState(false);
  const [unitPickerOpen, setUnitPickerOpen] = useState(false);
  const parentPickerRef = useRef<HTMLDivElement>(null);
  const unitPickerRef = useRef<HTMLDivElement>(null);

  // Constraint inherited from the parent chain. For a root folder (no parent
  // picker) this is always "Public allowed". When the user picks a private
  // parent for a sub-folder, Public is disabled here.
  const parentMax = getMaxAllowedVisibility(parentId || null);
  const publicLocked = parentMax === 'current_unit_only';

  // If parent forces private, force visibility state down too.
  useEffect(() => {
    if (publicLocked && visibility === 'unit_and_subunits') {
      setVisibility('current_unit_only');
    }
  }, [publicLocked, visibility]);

  // Close the custom dropdown on outside click.
  useEffect(() => {
    if (!parentPickerOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        parentPickerRef.current &&
        !parentPickerRef.current.contains(e.target as Node)
      ) {
        setParentPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [parentPickerOpen]);

  useEffect(() => {
    if (!unitPickerOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        unitPickerRef.current &&
        !unitPickerRef.current.contains(e.target as Node)
      ) {
        setUnitPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [unitPickerOpen]);

  const selectedParent = parentPicker?.options.find((o) => o.id === parentId);
  const selectedUnit = unitPicker?.options.find((o) => o.id === unitId);

  const isEdit = mode === 'edit';
  const isSubFolder = !!parentPicker;
  const isRoot = !isEdit && !isSubFolder;
  // Color picker is shown either when explicitly requested or for a new root
  // folder (where the user picks the section color).
  const renderColorPicker = showColorPicker ?? isRoot;
  const title = isEdit
    ? 'Edit folder'
    : isSubFolder
    ? 'Create sub-folder'
    : 'Create folder';
  const description = isEdit
    ? renderColorPicker
      ? 'Rename the folder and pick a section color.'
      : 'Rename the folder. Color is inherited from the top-level folder.'
    : isSubFolder
    ? 'Pick a parent folder and give the new sub-folder a name. The sub-folder inherits color from its top-level folder.'
    : 'Add a top-level folder to organize articles in this unit.';
  const confirmLabel = isEdit ? 'Save' : 'Create';

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Folder name cannot be empty.');
      return;
    }
    if (trimmed.length > 100) {
      setError('Folder name is too long (max 100 characters).');
      return;
    }
    if (isSubFolder && !parentId) {
      setError('Please choose a parent folder.');
      return;
    }
    if (unitPicker && !unitId) {
      setError('Please choose a unit.');
      return;
    }
    // In edit mode: skip submit if nothing changed (name + color both
    // identical to initial values).
    if (
      isEdit &&
      trimmed === initialName &&
      (!renderColorPicker || color === initialColor)
    ) {
      onCancel();
      return;
    }
    onConfirm({
      name: trimmed,
      parentId: isSubFolder ? parentId : null,
      ...(renderColorPicker ? { color } : {}),
      ...(isEdit ? {} : { visibility }),
      ...(unitPicker ? { unitId } : {}),
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className={`relative bg-white rounded-lg shadow-[0px_4px_12px_rgba(31,36,46,0.12)] ${renderColorPicker ? 'w-[440px]' : 'w-[400px]'} overflow-hidden`}>
        <div className="px-5 pt-5 pb-3">
          <h3 className="text-[16px] font-medium text-[#1f242e] leading-[24px]">{title}</h3>
          <p className="text-[13px] text-[#697a9b] mt-1">{description}</p>
        </div>

        <div className="px-5 pb-4 flex flex-col gap-3">
          {unitPicker && (
            <div>
              <label className="block text-[13px] text-[#3d475c] mb-1.5">Unit</label>
              <div className="relative" ref={unitPickerRef}>
                <button
                  type="button"
                  onClick={() => setUnitPickerOpen((p) => !p)}
                  className={`w-full flex items-center justify-between h-9 pl-3 pr-2 text-[14px] border rounded-lg bg-white text-left ${
                    unitPickerOpen
                      ? 'border-[#006bd6] ring-1 ring-[#006bd6]'
                      : 'border-[#e0e4eb] hover:bg-[#fafbfc]'
                  } ${selectedUnit ? 'text-[#1f242e]' : 'text-[#697a9b]'}`}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <Building2 className="w-4 h-4 text-[#697a9b] shrink-0" />
                    <span className="truncate">
                      {selectedUnit?.label ?? 'Pick a unit'}
                    </span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#697a9b] shrink-0 transition-transform ${
                      unitPickerOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {unitPickerOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white border border-[#e0e4eb] rounded-lg shadow-[0px_4px_12px_rgba(31,36,46,0.12)] py-1 max-h-[240px] overflow-y-auto">
                    {unitPicker.options.length === 0 ? (
                      <div className="px-3 py-2 text-[13px] text-[#697a9b] italic">
                        No units available.
                      </div>
                    ) : (
                      unitPicker.options.map((opt) => {
                        const active = opt.id === unitId;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              setUnitId(opt.id);
                              setError('');
                              setUnitPickerOpen(false);
                            }}
                            className={`flex items-center gap-2 w-full px-3 text-left text-[13px] py-1.5 ${
                              active
                                ? 'bg-[#ebf5ff] text-[#0052a3]'
                                : 'text-[#1f242e] hover:bg-[#fafbfc]'
                            }`}
                          >
                            <Building2
                              className={`w-3.5 h-3.5 shrink-0 ${
                                active ? 'text-[#006bd6]' : 'text-[#697a9b]'
                              }`}
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
          )}

          {parentPicker && (
            <div>
              <label className="block text-[13px] text-[#3d475c] mb-1.5">
                Parent folder
              </label>
              <div className="relative" ref={parentPickerRef}>
                <button
                  type="button"
                  onClick={() => setParentPickerOpen((p) => !p)}
                  className={`w-full flex items-center justify-between h-9 pl-3 pr-2 text-[14px] border rounded-lg bg-white text-left ${
                    parentPickerOpen
                      ? 'border-[#006bd6] ring-1 ring-[#006bd6]'
                      : 'border-[#e0e4eb] hover:bg-[#fafbfc]'
                  } ${selectedParent ? 'text-[#1f242e]' : 'text-[#697a9b]'}`}
                >
                  <span className="truncate">
                    {selectedParent?.label ?? 'Pick a folder'}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#697a9b] shrink-0 transition-transform ${
                      parentPickerOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {parentPickerOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white border border-[#e0e4eb] rounded-lg shadow-[0px_4px_12px_rgba(31,36,46,0.12)] py-1 max-h-[240px] overflow-y-auto">
                    {parentPicker.options.length === 0 ? (
                      <div className="px-3 py-2 text-[13px] text-[#697a9b] italic">
                        No eligible folders.
                      </div>
                    ) : (
                      parentPicker.options.map((opt) => {
                        const active = opt.id === parentId;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              setParentId(opt.id);
                              setError('');
                              setParentPickerOpen(false);
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
          )}

          <div>
            <label className="block text-[13px] text-[#3d475c] mb-1.5">Folder name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit();
                if (e.key === 'Escape') onCancel();
              }}
              placeholder="e.g. Engineering handbook"
              autoFocus
              className={`w-full h-9 px-3 text-[14px] border rounded-lg bg-white text-[#1f242e] placeholder:text-[#697a9b] focus:outline-none focus:ring-1 ${
                error
                  ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
                  : 'border-[#e0e4eb] focus:ring-[#006bd6] focus:border-[#006bd6]'
              }`}
            />
          </div>

          {error && <p className="text-[12px] text-red-500 -mt-1">{error}</p>}

          {!isEdit && (
            <div>
              <label className="block text-[13px] text-[#3d475c] mb-1.5">Visibility</label>
              <div className="grid grid-cols-2 gap-2">
                <VisibilityChoice
                  label="Public"
                  description="Visible to this unit and sub-units."
                  icon={<Globe2 className="w-4 h-4" />}
                  active={visibility === 'unit_and_subunits'}
                  disabled={publicLocked}
                  disabledReason="Parent folder is private — sub-folders can't be more visible than their parent."
                  onClick={() => setVisibility('unit_and_subunits')}
                />
                <VisibilityChoice
                  label="Private"
                  description="Only this unit can see it."
                  icon={<LockFilled className="w-4 h-4" />}
                  active={visibility === 'current_unit_only'}
                  onClick={() => setVisibility('current_unit_only')}
                />
              </div>
            </div>
          )}

          {renderColorPicker && (
            <div>
              <label className="block text-[13px] text-[#3d475c] mb-1.5">Color</label>
              <div className="flex flex-wrap gap-1.5">
                {FOLDER_COLORS.map((c) => {
                  const active = c === color;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      title={c}
                      className={`w-6 h-6 rounded-md transition-transform ${
                        active
                          ? 'ring-2 ring-[#006bd6] ring-offset-1 scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  );
                })}
              </div>
            </div>
          )}
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
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function VisibilityChoice({
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
            disabled ? 'text-[#697a9b]' : active ? 'text-[#0052a3]' : 'text-[#1f242e]'
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
