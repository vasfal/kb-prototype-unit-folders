import { RotateCcw } from 'lucide-react';

interface RestoreVersionDialogProps {
  /** Version number being restored. */
  version: number;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Confirmation dialog when restoring an older version would overwrite an
 *  existing unpublished draft. Matches the styling of DeleteArticleDialog /
 *  DeleteFolderDialog. */
export function RestoreVersionDialog({
  version,
  onConfirm,
  onCancel,
}: RestoreVersionDialogProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-lg shadow-[0px_4px_12px_rgba(31,36,46,0.12)] w-[440px] overflow-hidden">
        <div className="flex items-center gap-3 px-5 pt-5 pb-3">
          <div className="w-9 h-9 rounded-lg bg-[#fef3c7] flex items-center justify-center shrink-0">
            <RotateCcw className="w-[18px] h-[18px] text-[#92400e]" />
          </div>
          <h3 className="text-[16px] font-medium text-[#1f242e] leading-[24px]">
            Restore version v{version}
          </h3>
        </div>

        <div className="px-5 pb-4">
          <p className="text-[14px] text-[#3d475c] leading-[20px] mb-2">
            This will replace your current{' '}
            <span className="font-medium text-[#1f242e]">unpublished changes</span>{' '}
            with the contents of v{version}.
          </p>
          <p className="text-[13px] text-[#92400e] leading-[20px]">
            Your pending draft will be lost.
          </p>
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
            onClick={onConfirm}
            className="h-8 px-3 text-[14px] font-medium text-white bg-[#006bd6] rounded-lg hover:bg-[#0052a3]"
          >
            Restore v{version}
          </button>
        </div>
      </div>
    </div>
  );
}
