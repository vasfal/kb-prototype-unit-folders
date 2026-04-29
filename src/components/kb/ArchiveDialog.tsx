import { Archive } from 'lucide-react';
import type { KBArticle } from '@/types';

interface ArchiveDialogProps {
  article: KBArticle;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ArchiveDialog({ article, onConfirm, onCancel }: ArchiveDialogProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-lg shadow-[0px_4px_12px_rgba(31,36,46,0.12)] w-[420px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-3">
          <div className="w-9 h-9 rounded-lg bg-[#fef3c7] flex items-center justify-center shrink-0">
            <Archive className="w-4.5 h-4.5 text-[#d97706]" />
          </div>
          <div>
            <h3 className="text-[16px] font-medium text-[#1f242e] leading-[24px]">Archive article</h3>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 pb-4">
          <p className="text-[14px] text-[#3d475c] leading-[20px] mb-2">
            Archiving <span className="font-medium text-[#1f242e]">"{article.title}"</span> will hide it from the Knowledge Base.
          </p>
          <p className="text-[14px] text-[#697a9b] leading-[20px]">
            You can restore it later from the archive.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[#edeff3]">
          <button
            onClick={onCancel}
            className="h-8 px-3 text-[14px] font-medium text-[#1f242e] border border-[#e0e4eb] rounded-lg hover:bg-[#fafbfc]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="h-8 px-3 text-[14px] font-medium text-white bg-[#d97706] rounded-lg hover:bg-[#b45309]"
          >
            Archive
          </button>
        </div>
      </div>
    </div>
  );
}
