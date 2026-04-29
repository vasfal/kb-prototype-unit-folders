import type { ArticleStatus } from '@/types';

const statusStyles: Record<ArticleStatus, string> = {
  published: '',
  draft: 'bg-[#edeff3] text-[#525f7a]',
  archived: 'bg-white text-[#525f7a] border border-[#e0e4eb]',
};

const statusLabels: Record<ArticleStatus, string> = {
  published: '',
  draft: 'Draft',
  archived: 'Archived',
};

export function StatusBadge({ status }: { status: ArticleStatus }) {
  if (status === 'published') return null;
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 text-[11px] font-medium rounded-md leading-none shrink-0 ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}
