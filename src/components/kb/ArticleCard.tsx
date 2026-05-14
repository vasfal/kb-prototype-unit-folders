import { useState } from 'react';
import { FolderClosed, Lock, MoreHorizontal } from 'lucide-react';
import type { KBArticle, ArticleStatus } from '@/types';
import { getUnit } from '@/data/mock-data';
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

/** Card view — used in grid mode */
export function ArticleCard({
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

  return (
    <div
      className="group relative bg-white border border-[#edeff3] rounded-xl p-3 shadow-[0px_1px_2px_0px_rgba(31,36,46,0.05)] cursor-pointer hover:border-[#d0d5dd] transition-colors flex flex-col gap-1"
      onClick={onClick}
    >
      {/* Title + private indicator */}
      <div className="flex items-start gap-1.5">
        <p
          className={`flex-1 text-[14px] font-medium leading-[20px] line-clamp-2 ${
            isInactive ? 'text-[#697a9b]' : 'text-[#1f242e]'
          }`}
        >
          {article.title}
        </p>
        {isPrivate && (
          <span
            title="Private — only this unit can see it"
            className="shrink-0 flex items-center mt-0.5"
          >
            <Lock className="w-3.5 h-3.5 text-[#697a9b]" strokeWidth={2} />
          </span>
        )}
      </div>

      {/* Meta row: unit + status + time + avatar + actions */}
      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-1 text-[12px] text-[#525f7a] min-w-0">
          <FolderClosed className="w-3 h-3 text-[#697a9b] shrink-0" />
          <span className="truncate">{unit?.name ?? 'Unknown'}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={article.status} />
          <span className="text-[12px] text-[#697a9b]">{timeAgo(article.updatedAt)}</span>
          <div
            className="w-5 h-5 rounded-md text-white text-[9px] font-medium flex items-center justify-center shrink-0"
            style={{ backgroundColor: getAvatarColor(article.owner.name) }}
          >
            {initials}
          </div>
          {hasActions && (
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen((p) => !p);
                }}
                className={`flex items-center justify-center w-6 h-6 rounded-md hover:bg-[#edeff3] transition-colors ${
                  menuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
                title="Article actions"
              >
                <MoreHorizontal className="w-3.5 h-3.5 text-[#525f7a]" />
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
        </div>
      </div>
    </div>
  );
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
              title="Private — only this unit can see it"
              className="shrink-0 flex items-center"
            >
              <Lock className="w-3.5 h-3.5 text-[#697a9b]" strokeWidth={2} />
            </span>
          )}
        </div>
      </td>

      {/* Unit */}
      <td className="py-2.5 pr-4">
        <div className="flex items-center gap-1 text-[13px] text-[#525f7a]">
          <FolderClosed className="w-3.5 h-3.5 text-[#697a9b] shrink-0" />
          <span className="truncate">{unit?.name ?? 'Unknown'}</span>
        </div>
      </td>

      {/* Status */}
      <td className="py-2.5 pr-4">
        <StatusBadge status={article.status} showPublished />
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
