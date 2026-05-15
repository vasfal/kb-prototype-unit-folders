import type { ArticleStatus } from '@/types';

const statusStyles: Record<ArticleStatus, string> = {
  published: 'bg-[#398966] text-white',
  draft: 'bg-[#edeff3] text-[#525f7a]',
  archived: 'bg-white text-[#525f7a] border border-[#e0e4eb]',
};

const statusLabels: Record<ArticleStatus, string> = {
  published: 'Published',
  draft: 'Draft',
  archived: 'Archived',
};

interface StatusBadgeProps {
  status: ArticleStatus;
  /** By default Published renders nothing (card view rhythm). Pass this on
   *  table/list views where every row needs an explicit status pill. */
  showPublished?: boolean;
  /** When true, a small amber dot is rendered next to the pill to flag
   *  pending unpublished changes. The full-text chip lives in the article
   *  detail modal where space allows it. */
  hasUnpublishedChanges?: boolean;
}

export function StatusBadge({
  status,
  showPublished,
  hasUnpublishedChanges,
}: StatusBadgeProps) {
  const showStatusPill = status !== 'published' || showPublished;
  if (!showStatusPill && !hasUnpublishedChanges) return null;

  return (
    <span className="inline-flex items-center gap-1 shrink-0">
      {showStatusPill && (
        <span
          className={`inline-flex items-center px-1.5 py-0.5 text-[11px] font-medium rounded-md leading-none ${statusStyles[status]}`}
        >
          {statusLabels[status]}
        </span>
      )}
      {hasUnpublishedChanges && status === 'published' && (
        // Compact dot indicator — full-text chip is reserved for the
        // article detail modal, where space allows it. In dense list and
        // card views we use just the dot + tooltip to avoid layout breaks.
        <span
          title="Unpublished changes"
          className="inline-block w-2 h-2 rounded-full bg-[#d97706] shrink-0"
        />
      )}
    </span>
  );
}
