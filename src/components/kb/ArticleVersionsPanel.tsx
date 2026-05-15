import type { KBArticle } from '@/types';

export type VersionSelection = 'draft' | number;

interface ArticleVersionsPanelProps {
  article: KBArticle;
  selection: VersionSelection;
  onSelect: (next: VersionSelection) => void;
  /** When false, rows render as static labels — useful in edit mode where
   *  switching versions would conflict with the in-progress draft. */
  interactive?: boolean;
}

function timeAgo(iso: string): string {
  const now = new Date();
  const d = new Date(iso);
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffDays < 1) {
    const diffHours = Math.floor(diffMs / 3_600_000);
    if (diffHours < 1) {
      const diffMins = Math.max(1, Math.floor(diffMs / 60_000));
      return `${diffMins}m ago`;
    }
    return `${diffHours}h ago`;
  }
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Entry row in the Versions panel. Highlighted when active. Renders as a
 *  div in non-interactive mode so it can't be clicked or focused. */
function VersionRow({
  active,
  dotClass,
  title,
  subtitle,
  onClick,
  interactive,
}: {
  active: boolean;
  dotClass: string;
  title: React.ReactNode;
  subtitle: string;
  onClick: () => void;
  interactive: boolean;
}) {
  const body = (
    <>
      <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${dotClass}`} />
      <div className="flex flex-col min-w-0">
        <span
          className={`text-[13px] leading-[18px] truncate ${
            active ? 'text-[#0052a3] font-medium' : 'text-[#1f242e]'
          }`}
        >
          {title}
        </span>
        <span className="text-[12px] text-[#697a9b] truncate">{subtitle}</span>
      </div>
    </>
  );
  const baseClass = `flex items-start gap-2.5 w-full px-4 py-2.5 text-left ${
    active ? 'bg-[#ebf5ff]' : ''
  }`;
  if (!interactive) {
    return (
      <div
        className={`${baseClass} ${
          active ? '' : 'opacity-60'
        } cursor-default select-none`}
      >
        {body}
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseClass} transition-colors ${active ? '' : 'hover:bg-[#fafbfc]'}`}
    >
      {body}
    </button>
  );
}

export function ArticleVersionsPanel({
  article,
  selection,
  onSelect,
  interactive = true,
}: ArticleVersionsPanelProps) {
  const hasDraft = article.draftContent !== null;
  const versions = article.versions;
  const latestVersion = versions.length > 0
    ? versions[versions.length - 1].version
    : null;

  // Special case: never-published draft article. Show a single "Draft" row.
  if (versions.length === 0) {
    return (
      <div className="divide-y divide-[#edeff3]">
        <VersionRow
          active={true}
          dotClass="bg-[#697a9b]"
          title="Draft"
          subtitle="Not yet published"
          onClick={() => onSelect('draft')}
          interactive={interactive}
        />
      </div>
    );
  }

  return (
    <div className="divide-y divide-[#edeff3]">
      {hasDraft && (
        <VersionRow
          active={selection === 'draft'}
          dotClass="bg-[#d97706]"
          title="Unpublished changes"
          subtitle={
            article.draftUpdatedBy && article.draftUpdatedAt
              ? `Edited by ${article.draftUpdatedBy.name} · ${timeAgo(
                  article.draftUpdatedAt
                )}`
              : 'Pending changes'
          }
          onClick={() => onSelect('draft')}
          interactive={interactive}
        />
      )}
      {versions
        .slice()
        .reverse()
        .map((v) => {
          const isCurrent = v.version === latestVersion;
          return (
            <VersionRow
              key={v.version}
              active={selection === v.version}
              dotClass={isCurrent ? 'bg-[#0a6e3f]' : 'bg-[#a8b1c2]'}
              title={
                isCurrent ? (
                  <>
                    Published v{v.version}
                    <span className="text-[11px] text-[#697a9b] font-normal ml-1">
                      (current)
                    </span>
                  </>
                ) : (
                  `Published v${v.version}`
                )
              }
              subtitle={`by ${v.publishedBy.name} · ${formatDate(v.publishedAt)}`}
              onClick={() => onSelect(v.version)}
              interactive={interactive}
            />
          );
        })}
    </div>
  );
}
