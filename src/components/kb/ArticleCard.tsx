import { useState } from 'react';
import { FolderClosed, MoreHorizontal } from 'lucide-react';
import { LockFilled } from './LockFilled';
import type { KBArticle, ArticleStatus } from '@/types';
import { getUnit, getFolder } from '@/data/mock-data';
import { StatusBadge } from './StatusBadge';
import { ArticleActionsMenu } from './ArticleActionsMenu';

function timeAgo(iso: string): string {
  const now = new Date();
  const d = new Date(iso);
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 1) return 'today';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

const avatarColors = [
  '#006bd6', '#7c3aed', '#0891b2', '#059669', '#d97706',
  '#dc2626', '#be185d', '#4f46e5', '#0d9488', '#ca8a04',
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

interface ArticleCardProps {
  article: KBArticle;
  onClick?: () => void;
  onStatusChange?: (article: KBArticle, status: ArticleStatus) => void;
  onMove?: (article: KBArticle) => void;
  onDelete?: (article: KBArticle) => void;
}

/** Table row view — used in list mode, matching Jobs tab pattern */
export function ArticleRow({
  article,
  onClick,
  onStatusChange,
  onMove,
  onDelete,
}: ArticleCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const unit = getUnit(article.unitId);
  const initials = article.owner.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);
  const isInactive = article.status === 'draft' || article.status === 'archived';
  const isPrivate = article.visibility === 'current_unit_only';
  const hasActions = !!(onStatusChange || onMove || onDelete);
  const folderName = getFolder(article.folderId)?.name ?? '—';

  return (
    <tr
      className="border-b border-[#edeff3] last:border-b-0 cursor-pointer hover:bg-[#fafbfc] transition-colors"
      onClick={onClick}
    >
      {/* Article title + private indicator */}
      <td className="py-2.5 pl-4 pr-4">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={`text-[13px] leading-[20px] truncate ${
              isInactive ? 'text-[#697a9b]' : 'text-[#1f242e]'
            }`}
          >
            {article.title}
          </span>
          {isPrivate && (
            <span
              title="Private — visible only to people with access to this unit’s private content"
              className="shrink-0 flex items-center"
            >
              <LockFilled
                className="w-3.5 h-3.5 text-[#697a9b]"
                strokeWidth={2}
              />
            </span>
          )}
        </div>
      </td>

      {/* Folder */}
      <td className="py-2.5 pr-4">
        <div
          className="flex items-center gap-1 text-[13px] text-[#525f7a] min-w-0"
          title={folderName}
        >
          <FolderClosed className="w-3.5 h-3.5 text-[#697a9b] shrink-0" />
          <span className="truncate">{folderName}</span>
        </div>
      </td>

      {/* Unit */}
      <td className="py-2.5 pr-4">
        <div className="flex items-center gap-1 text-[13px] text-[#525f7a]">
          <span className="truncate">{unit?.name ?? 'Unknown'}</span>
        </div>
      </td>

      {/* Status */}
      <td className="py-2.5 pr-4">
        <StatusBadge
          status={article.status}
          showPublished
          hasUnpublishedChanges={article.draftContent !== null}
        />
      </td>

      {/* Updated */}
      <td className="py-2.5 pr-4">
        <span className="text-[13px] text-[#697a9b] whitespace-nowrap">{timeAgo(article.updatedAt)}</span>
      </td>

      {/* Owner */}
      <td className="py-2.5 pr-4">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-md text-white text-[10px] font-medium flex items-center justify-center shrink-0"
            style={{ backgroundColor: getAvatarColor(article.owner.name) }}
          >
            {initials}
          </div>
          <span className="text-[13px] text-[#1f242e] truncate">{article.owner.name}</span>
        </div>
      </td>

      {/* Actions */}
      <td className="py-2.5 pr-2">
        {hasActions && (
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((p) => !p);
              }}
              className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-[#edeff3] transition-colors"
              title="Article actions"
            >
              <MoreHorizontal className="w-4 h-4 text-[#525f7a]" />
            </button>
            {menuOpen && (
              <ArticleActionsMenu
                article={article}
                onClose={() => setMenuOpen(false)}
                onStatusChange={
                  onStatusChange
                    ? (status) => onStatusChange(article, status)
                    : undefined
                }
                onMove={onMove ? () => onMove(article) : undefined}
                onDelete={onDelete ? () => onDelete(article) : undefined}
              />
            )}
          </div>
        )}
      </td>
    </tr>
  );
}
