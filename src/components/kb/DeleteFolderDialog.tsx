import { Trash2 } from 'lucide-react';
import type { KBFolder } from '@/types';
import { getFolderImpact } from '@/data/mock-data';

interface DeleteFolderDialogProps {
  folder: KBFolder;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteFolderDialog({ folder, onConfirm, onCancel }: DeleteFolderDialogProps) {
  const { articles, subFolders } = getFolderImpact(folder.id);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-lg shadow-[0px_4px_12px_rgba(31,36,46,0.12)] w-[440px] overflow-hidden">
        <div className="flex items-center gap-3 px-5 pt-5 pb-3">
          <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
            <Trash2 className="w-[18px] h-[18px] text-red-600" />
          </div>
          <h3 className="text-[16px] font-medium text-[#1f242e] leading-[24px]">
            Delete folder
          </h3>
        </div>

        <div className="px-5 pb-4">
          <p className="text-[14px] text-[#3d475c] leading-[20px] mb-2">
            Permanently delete <span className="font-medium text-[#1f242e]">"{folder.name}"</span> and everything inside it.
          </p>
          {(articles > 0 || subFolders > 0) && (
            <p className="text-[13px] text-[#697a9b] leading-[20px] mb-2">
              This folder contains{' '}
              <span className="font-medium text-[#1f242e]">
                {articles} {articles === 1 ? 'article' : 'articles'}
              </span>
              {subFolders > 0 && (
                <>
                  {' '}and{' '}
                  <span className="font-medium text-[#1f242e]">
                    {subFolders} {subFolders === 1 ? 'sub-folder' : 'sub-folders'}
                  </span>
                </>
              )}
              . All of them will be deleted.
            </p>
          )}
          <p className="text-[13px] text-red-600 leading-[20px]">
            This action cannot be undone.
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
            className="h-8 px-3 text-[14px] font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
