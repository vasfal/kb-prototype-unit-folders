import { useState } from 'react';
import type { KBFolder } from '@/types';
import { FOLDER_COLORS } from './folder-icons';

interface ChangeColorDialogProps {
  folder: KBFolder;
  onConfirm: (color: string) => void;
  onCancel: () => void;
}

export function ChangeColorDialog({ folder, onConfirm, onCancel }: ChangeColorDialogProps) {
  const [color, setColor] = useState<string>(folder.color);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-lg shadow-[0px_4px_12px_rgba(31,36,46,0.12)] w-[440px] overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <h3 className="text-[16px] font-medium text-[#1f242e] leading-[24px]">
            Change folder color
          </h3>
          <p className="text-[13px] text-[#697a9b] mt-1">
            Pick a color for "{folder.name}". Sub-folders inherit this color.
          </p>
        </div>

        <div className="px-5 pb-4">
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
            onClick={() => onConfirm(color)}
            disabled={color === folder.color}
            className={`h-8 px-3 text-[14px] font-medium rounded-lg ${
              color === folder.color
                ? 'text-[#697a9b] bg-[#edeff3] cursor-not-allowed'
                : 'text-white bg-[#006bd6] hover:bg-[#0052a3]'
            }`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
