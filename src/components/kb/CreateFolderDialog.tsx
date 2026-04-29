import { useState } from 'react';

export interface ParentPickerOption {
  id: string;
  label: string;
}

interface CreateFolderDialogProps {
  /** "create" creates a new folder; "rename" updates an existing one. */
  mode: 'create' | 'rename';
  initialName?: string;
  /** When provided, a "Parent folder" dropdown is shown. Used for sub-folder creation. */
  parentPicker?: {
    options: ParentPickerOption[];
    initialId: string;
  };
  onConfirm: (result: { name: string; parentId: string | null }) => void;
  onCancel: () => void;
}

export function CreateFolderDialog({
  mode,
  initialName = '',
  parentPicker,
  onConfirm,
  onCancel,
}: CreateFolderDialogProps) {
  const [name, setName] = useState(initialName);
  const [parentId, setParentId] = useState(parentPicker?.initialId ?? '');
  const [error, setError] = useState('');

  const isRename = mode === 'rename';
  const isSubFolder = !!parentPicker;
  const title = isRename
    ? 'Rename folder'
    : isSubFolder
    ? 'Create sub-folder'
    : 'Create folder';
  const description = isRename
    ? 'Enter a new name for this folder.'
    : isSubFolder
    ? 'Pick a parent folder and give the new sub-folder a name.'
    : 'Add a new folder to organize articles in this unit.';
  const confirmLabel = isRename ? 'Rename' : 'Create';

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
    if (isRename && trimmed === initialName) {
      onCancel();
      return;
    }
    onConfirm({
      name: trimmed,
      parentId: isSubFolder ? parentId : null,
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-lg shadow-[0px_4px_12px_rgba(31,36,46,0.12)] w-[400px] overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <h3 className="text-[16px] font-medium text-[#1f242e] leading-[24px]">{title}</h3>
          <p className="text-[13px] text-[#697a9b] mt-1">{description}</p>
        </div>

        <div className="px-5 pb-4 flex flex-col gap-3">
          {parentPicker && (
            <div>
              <label className="block text-[13px] text-[#3d475c] mb-1.5">
                Parent folder
              </label>
              <select
                value={parentId}
                onChange={(e) => {
                  setParentId(e.target.value);
                  setError('');
                }}
                className="w-full h-9 px-2 text-[14px] border border-[#e0e4eb] rounded-lg bg-white text-[#1f242e] focus:outline-none focus:ring-1 focus:ring-[#006bd6] focus:border-[#006bd6]"
              >
                {parentPicker.options.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
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
