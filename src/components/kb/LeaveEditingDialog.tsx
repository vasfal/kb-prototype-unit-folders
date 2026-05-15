import { AlertTriangle } from 'lucide-react';

interface LeaveEditingDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
}

/** Confirmation shown when the user tries to close the modal mid-edit
 *  (X / backdrop / Escape). In-session edits that haven't been saved are
 *  lost on close; previously-saved drafts persist. Matches the styling of
 *  RestoreVersionDialog / DeleteArticleDialog. */
export function LeaveEditingDialog({ onConfirm, onCancel }: LeaveEditingDialogProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-lg shadow-[0px_4px_12px_rgba(31,36,46,0.12)] w-[440px] overflow-hidden">
        <div className="flex items-center gap-3 px-5 pt-5 pb-3">
          <div className="w-9 h-9 rounded-lg bg-[#fef3c7] flex items-center justify-center shrink-0">
            <AlertTriangle className="w-[18px] h-[18px] text-[#92400e]" />
          </div>
          <h3 className="text-[16px] font-medium text-[#1f242e] leading-[24px]">
            Leave article editing?
          </h3>
        </div>

        <div className="px-5 pb-4">
          <p className="text-[14px] text-[#3d475c] leading-[20px] mb-2">
            You haven't saved your latest changes. Any edits made in this
            session will be discarded.
          </p>
          <p className="text-[13px] text-[#697a9b] leading-[20px]">
            Previously saved drafts remain intact.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[#edeff3]">
          <button
            type="button"
            onClick={onCancel}
            className="h-8 px-3 text-[14px] font-medium text-[#1f242e] border border-[#e0e4eb] rounded-lg hover:bg-[#fafbfc]"
          >
            Stay editing
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-8 px-3 text-[14px] font-medium text-red-600 border border-[#e0e4eb] rounded-lg hover:bg-[#fef2f2]"
          >
            Leave without saving
          </button>
        </div>
      </div>
    </div>
  );
}
