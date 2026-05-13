import type { ArticleStatus } from '@/types';

const statusStyles: Record<ArticleStatus, string> = {
  published: 'bg-[#e6f4ec] text-[#0a6e3f]',
  draft: 'bg-[#edeff3] text-[#525f7a]',
  archived: 'bg-white text-[#525f7a] border border-[#e0e4eb]',
};

const statusLabels: Record<ArticleStatus, string> = {
  published: 'Published',
  draft: 'Draft',
  archived: 'Archived',
};

/** By default Published renders nothing (card view rhythm). Pass `showPublished`
 *  on table/list views where every row needs an explicit status pill. */
export function StatusBadge({
  status,
  showPublished,
}: {
  status: ArticleStatus;
  showPublished?: boolean;
}) {
  if (status === 'published' && !showPublished) return null;
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 text-[11px] font-medium rounded-md leading-none shrink-0 ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}
