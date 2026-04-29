import { FolderClosed, MoreHorizontal } from 'lucide-react';
import type { KBArticle } from '@/types';
import { getUnit } from '@/data/mock-data';
import { StatusBadge } from './StatusBadge';

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
}

/** Card view — used in grid mode */
export function ArticleCard({ article, onClick }: ArticleCardProps) {
  const unit = getUnit(article.unitId);
  const initials = article.owner.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);
  const isInactive = article.status === 'draft' || article.status === 'archived';

  return (
    <div
      className="bg-white border border-[#edeff3] rounded-xl p-3 shadow-[0px_1px_2px_0px_rgba(31,36,46,0.05)] cursor-pointer hover:border-[#d0d5dd] transition-colors flex flex-col gap-1"
      onClick={onClick}
    >
      {/* Title */}
      <p className={`text-[14px] font-medium leading-[20px] line-clamp-2 ${isInactive ? 'text-[#697a9b]' : 'text-[#1f242e]'}`}>
        {article.title}
      </p>

      {/* Meta row: unit + status + time + avatar */}
      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-1 text-[12px] text-[#525f7a]">
          <FolderClosed className="w-3 h-3 text-[#697a9b]" />
          <span>{unit?.name ?? 'Unknown'}</span>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={article.status} />
          <span className="text-[12px] text-[#697a9b]">{timeAgo(article.updatedAt)}</span>
          <div
            className="w-5 h-5 rounded-md text-white text-[9px] font-medium flex items-center justify-center shrink-0"
            style={{ backgroundColor: getAvatarColor(article.owner.name) }}
          >
            {initials}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Table row view — used in list mode, matching Jobs tab pattern */
export function ArticleRow({ article, onClick }: ArticleCardProps) {
  const unit = getUnit(article.unitId);
  const initials = article.owner.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);
  const isInactive = article.status === 'draft' || article.status === 'archived';

  return (
    <tr
      className="border-b border-[#edeff3] last:border-b-0 cursor-pointer hover:bg-[#fafbfc] transition-colors"
      onClick={onClick}
    >
      {/* Article title */}
      <td className="py-2.5 pl-4 pr-4">
        <span className={`text-[13px] leading-[20px] ${isInactive ? 'text-[#697a9b]' : 'text-[#1f242e]'}`}>
          {article.title}
        </span>
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
        <StatusBadge status={article.status} />
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
      <td className="py-2.5">
        <button className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-[#edeff3] transition-colors">
          <MoreHorizontal className="w-4 h-4 text-[#525f7a]" />
        </button>
      </td>
    </tr>
  );
}
