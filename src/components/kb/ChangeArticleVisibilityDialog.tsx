import { useState } from 'react';
import { Globe2 } from 'lucide-react';
import { LockFilled } from './LockFilled';
import type { KBArticle, Visibility } from '@/types';
import { getFolder, getMaxAllowedVisibility } from '@/data/mock-data';

interface ChangeArticleVisibilityDialogProps {
  article: KBArticle;
  onConfirm: (visibility: Visibility) => void;
  onCancel: () => void;
}

const options: {
  value: Visibility;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    value: 'unit_and_subunits',
    label: 'Public',
    description: 'Visible to this unit and all sub-units.',
    icon: <Globe2 className="w-4 h-4" />,
  },
  {
    value: 'current_unit_only',
    label: 'Private',
    description: 'Only people in this unit can see it.',
    icon: <LockFilled className="w-4 h-4" />,
  },
];

export function ChangeArticleVisibilityDialog({
  article,
  onConfirm,
  onCancel,
}: ChangeArticleVisibilityDialogProps) {
  const [selected, setSelected] = useState<Visibility>(article.visibility);

  // Public option is locked if the folder chain (folder + ancestors) is
  // private. Articles can never be more visible than their folder.
  const folder = getFolder(article.folderId);
  const folderEffectiveMax: Visibility = folder
    ? folder.visibility === 'current_unit_only'
      ? 'current_unit_only'
      : getMaxAllowedVisibility(folder.parentFolderId)
    : 'unit_and_subunits';
  const publicLocked = folderEffectiveMax === 'current_unit_only';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-lg shadow-[0px_4px_12px_rgba(31,36,46,0.12)] w-[440px] overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <h3 className="text-[16px] font-medium text-[#1f242e] leading-[24px]">
            Change article visibility
          </h3>
          <p className="text-[13px] text-[#697a9b] mt-1">
            Choose who can see "{article.title}".
          </p>
        </div>

        <div className="px-3 pb-4 flex flex-col gap-1">
          {options.map((opt) => {
            const active = selected === opt.value;
            const isPublic = opt.value === 'unit_and_subunits';
            const disabled = isPublic && publicLocked;
            const tooltip = disabled
              ? "The folder (or its parent) is private — articles can't be more visible than the folder."
              : undefined;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={disabled ? undefined : () => setSelected(opt.value)}
                disabled={disabled}
                title={tooltip}
                className={`flex items-start gap-3 px-3 py-2.5 rounded-lg border text-left transition-colors ${
                  disabled
                    ? 'border-[#edeff3] bg-[#fafbfc] opacity-50 cursor-not-allowed'
                    : active
                    ? 'border-[#006bd6] bg-[#ebf5ff]'
                    : 'border-[#e0e4eb] hover:bg-[#fafbfc]'
                }`}
              >
                <span
                  className={`mt-0.5 ${
                    disabled
                      ? 'text-[#a8b1c2]'
                      : active
                      ? 'text-[#006bd6]'
                      : 'text-[#697a9b]'
                  }`}
                >
                  {opt.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-[14px] font-medium leading-[20px] ${
                      disabled
                        ? 'text-[#697a9b]'
                        : active
                        ? 'text-[#0052a3]'
                        : 'text-[#1f242e]'
                    }`}
                  >
                    {opt.label}
                  </div>
                  <div className="text-[12px] text-[#697a9b] leading-[16px]">
                    {disabled && tooltip ? tooltip : opt.description}
                  </div>
                </div>
                <span
                  className={`mt-1.5 w-3.5 h-3.5 rounded-full border-2 shrink-0 ${
                    disabled
                      ? 'border-[#c1c7d0]'
                      : active
                      ? 'border-[#006bd6] bg-[#006bd6]'
                      : 'border-[#c1c7d0]'
                  }`}
                >
                  {active && !disabled && (
                    <span className="block w-full h-full rounded-full ring-2 ring-white" />
                  )}
                </span>
              </button>
            );
          })}
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
            onClick={() => onConfirm(selected)}
            disabled={selected === article.visibility}
            className={`h-8 px-3 text-[14px] font-medium rounded-lg ${
              selected === article.visibility
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
