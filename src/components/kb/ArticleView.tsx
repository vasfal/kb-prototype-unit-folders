import { useState } from 'react';
import {
  MoreHorizontal,
  Building2,
  User,
  Eye,
  Clock,
  Tag,
  Calendar,
  X,
  Pencil,
  Archive,
  RotateCcw,
  FolderInput,
  EyeOff,
  Send,
} from 'lucide-react';
import type { KBArticle, ArticleStatus } from '@/types';
import { getUnit, getFolder } from '@/data/mock-data';
import { EntityModal } from '../shared/EntityModal';
import { VisibilityBadge } from './VisibilityBadge';

interface ArticleViewProps {
  article: KBArticle;
  onClose: () => void;
  onEdit?: () => void;
  onStatusChange?: (article: KBArticle, status: ArticleStatus) => void;
  onMove?: (article: KBArticle) => void;
}

const statusColorMap: Record<string, string> = {
  published: 'bg-[#398966] text-white',
  draft: 'bg-[#edeff3] text-[#525f7a]',
  archived: 'bg-white text-[#525f7a] border border-[#e0e4eb]',
};

const statusLabelMap: Record<string, string> = {
  published: 'Published',
  draft: 'Draft',
  archived: 'Archived',
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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

function OwnerAvatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2);
  const cls = size === 'sm' ? 'w-5 h-5 text-[9px]' : 'w-7 h-7 text-[10px]';
  return (
    <div
      className={`${cls} rounded-lg text-white font-medium flex items-center justify-center shrink-0`}
      style={{ backgroundColor: getAvatarColor(name) }}
    >
      {initials}
    </div>
  );
}

function SummaryField({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center h-10">
      <div className="flex items-center gap-2 w-[160px] shrink-0 text-[14px] text-[#3d475c]">
        <span className="text-[#697a9b]">{icon}</span>
        {label}
      </div>
      <div className="flex-1 px-3 py-2 text-[14px] text-[#1f242e]">
        {children}
      </div>
    </div>
  );
}

function SummaryFields({ article }: { article: KBArticle }) {
  const unit = getUnit(article.unitId);
  const folder = getFolder(article.folderId);

  return (
    <div className="flex gap-6">
      <div className="flex-1 flex flex-col">
        <SummaryField icon={<Clock className="w-4 h-4" />} label="Status">
          <span className={`inline-flex items-center px-1.5 py-0.5 text-[13px] font-medium rounded-md leading-[16px] ${statusColorMap[article.status]}`}>
            {statusLabelMap[article.status]}
          </span>
        </SummaryField>
        <SummaryField icon={<Building2 className="w-4 h-4" />} label="Unit">
          {unit?.name ?? 'Unknown'}
        </SummaryField>
      </div>
      <div className="flex-1 flex flex-col">
        <SummaryField icon={<User className="w-4 h-4" />} label="Owner">
          <div className="flex items-center gap-1.5">
            <OwnerAvatar name={article.owner.name} size="sm" />
            <span>{article.owner.name}</span>
          </div>
        </SummaryField>
        <SummaryField icon={<Tag className="w-4 h-4" />} label="Folder">
          {folder?.name ?? '—'}
        </SummaryField>
      </div>
    </div>
  );
}

function ActionsMenu({
  article,
  onClose,
  onStatusChange,
  onMove,
}: {
  article: KBArticle;
  onClose: () => void;
  onStatusChange?: (status: ArticleStatus) => void;
  onMove?: () => void;
}) {
  const items: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }[] = [];

  if (article.status === 'draft') {
    items.push({
      icon: <Send className="w-4 h-4" />,
      label: 'Publish',
      onClick: () => { onStatusChange?.('published'); onClose(); },
    });
  }
  if (article.status === 'published') {
    items.push({
      icon: <EyeOff className="w-4 h-4" />,
      label: 'Unpublish',
      onClick: () => { onStatusChange?.('draft'); onClose(); },
    });
  }
  if (article.status !== 'archived') {
    items.push({
      icon: <FolderInput className="w-4 h-4" />,
      label: 'Move',
      onClick: () => { onMove?.(); onClose(); },
    });
    items.push({
      icon: <Archive className="w-4 h-4" />,
      label: 'Archive',
      onClick: () => { onStatusChange?.('archived'); onClose(); },
      danger: true,
    });
  }
  if (article.status === 'archived') {
    items.push({
      icon: <RotateCcw className="w-4 h-4" />,
      label: 'Restore',
      onClick: () => { onStatusChange?.('draft'); onClose(); },
    });
  }

  return (
    <>
      <div className="fixed inset-0 z-[55]" onClick={onClose} />
      <div className="absolute right-0 top-full mt-1 bg-white border border-[#e0e4eb] rounded-lg shadow-[0px_4px_12px_rgba(31,36,46,0.12)] z-[56] py-1 min-w-[160px]">
        {items.map((item) => (
          <button
            key={item.label}
            onClick={item.onClick}
            className={`flex items-center gap-2 w-full px-3 py-1.5 text-[13px] text-left hover:bg-[#fafbfc] ${
              item.danger ? 'text-[#d97706]' : 'text-[#1f242e]'
            }`}
          >
            <span className={item.danger ? 'text-[#d97706]' : 'text-[#697a9b]'}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
}

function RightPanelContent({ article, onClose }: { article: KBArticle; onClose: () => void }) {
  const unit = getUnit(article.unitId);
  const folder = getFolder(article.folderId);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#edeff3] shrink-0">
        <span className="text-[14px] font-medium text-[#1f242e]">About</span>
        <button onClick={onClose} className="flex items-center justify-center p-1 rounded-md hover:bg-[#fafbfc] transition-colors">
          <X className="w-3.5 h-3.5 text-[#525f7a]" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-[#edeff3]">
          <PropertyRow icon={<Clock className="w-4 h-4" />} label="Status">
            <span className={`inline-flex items-center px-1.5 py-0.5 text-[13px] font-medium rounded-md leading-[16px] ${statusColorMap[article.status]}`}>
              {statusLabelMap[article.status]}
            </span>
          </PropertyRow>
          <PropertyRow icon={<Tag className="w-4 h-4" />} label="Folder">
            {folder?.name ?? '—'}
          </PropertyRow>
          <PropertyRow icon={<Building2 className="w-4 h-4" />} label="Unit">
            {unit?.name ?? '—'}
          </PropertyRow>
          <PropertyRow icon={<Eye className="w-4 h-4" />} label="Visibility">
            {folder ? (
              <>
                <VisibilityBadge visibility={folder.visibility} />
                {folder.visibility === 'unit_and_subunits' && 'Unit & sub-units'}
                <span className="block text-[11px] text-[#697a9b] mt-0.5">
                  Inherited from folder
                </span>
              </>
            ) : (
              '—'
            )}
          </PropertyRow>
          <PropertyRow icon={<User className="w-4 h-4" />} label="Owner">
            <div className="flex items-center gap-1.5">
              <OwnerAvatar name={article.owner.name} size="sm" />
              <span>{article.owner.name}</span>
            </div>
          </PropertyRow>
          <PropertyRow icon={<Calendar className="w-4 h-4" />} label="Created">
            <div className="flex flex-col">
              <span>{formatDate(article.createdAt)}</span>
              <span className="text-[12px] text-[#697a9b]">by {article.createdBy.name}</span>
            </div>
          </PropertyRow>
          <PropertyRow icon={<Calendar className="w-4 h-4" />} label="Updated">
            <div className="flex flex-col">
              <span>{formatDate(article.updatedAt)}</span>
              <span className="text-[12px] text-[#697a9b]">by {article.updatedBy.name}</span>
            </div>
          </PropertyRow>
          {article.publishedAt && (
            <PropertyRow icon={<Calendar className="w-4 h-4" />} label="Published">
              {formatDate(article.publishedAt)}
            </PropertyRow>
          )}
        </div>
      </div>
    </div>
  );
}

function PropertyRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 px-4 py-2.5">
      <span className="text-[#697a9b] mt-0.5 shrink-0">{icon}</span>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[12px] text-[#697a9b] leading-[16px]">{label}</span>
        <div className="text-[13px] text-[#1f242e] leading-[20px]">{children}</div>
      </div>
    </div>
  );
}

export function ArticleView({ article, onClose, onEdit, onStatusChange, onMove }: ArticleViewProps) {
  const [aboutOpen, setAboutOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <EntityModal
      title="Article"
      onClose={onClose}
      rightPanel={
        <RightPanelContent article={article} onClose={() => setAboutOpen(false)} />
      }
      rightPanelOpen={aboutOpen}
      onToggleRightPanel={() => setAboutOpen(true)}
      rightPanelLabel="About"
    >
      <div className="px-6 pt-4 pb-10 max-w-[1000px] mx-auto">
        {/* Title + actions */}
        <div className="flex items-start gap-3 mb-3">
          <h1 className="text-[20px] font-semibold text-[#1f242e] leading-[30px] flex-1">
            {article.title}
          </h1>
          <div className="flex items-center gap-1.5 shrink-0">
            {onEdit && article.status !== 'archived' && (
              <button
                onClick={onEdit}
                className="flex items-center gap-1.5 h-7 px-2 text-[13px] font-medium text-[#1f242e] border border-[#e0e4eb] rounded-lg hover:bg-[#fafbfc]"
              >
                <Pencil className="w-3.5 h-3.5 text-[#525f7a]" />
                Edit
              </button>
            )}
            <div className="relative">
              <button
                onClick={() => setMenuOpen((p) => !p)}
                className="flex items-center justify-center w-7 h-7 border border-[#e0e4eb] rounded-lg hover:bg-[#fafbfc]"
              >
                <MoreHorizontal className="w-4 h-4 text-[#525f7a]" />
              </button>
              {menuOpen && (
                <ActionsMenu
                  article={article}
                  onClose={() => setMenuOpen(false)}
                  onStatusChange={(status) => onStatusChange?.(article, status)}
                  onMove={() => onMove?.(article)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Summary fields — 2 columns */}
        <div className="mb-[36px]">
          <SummaryFields article={article} />
        </div>

        {/* Article body */}
        <div
          className="text-[14px] text-[#1f242e] leading-[22px]
            [&_h2]:text-[16px] [&_h2]:font-semibold [&_h2]:mt-5 [&_h2]:mb-2
            [&_h3]:text-[14px] [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-1.5
            [&_p]:mb-3 [&_p]:last:mb-0
            [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3
            [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3
            [&_li]:mb-1
            [&_a]:text-[#006bd6] [&_a]:underline"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </div>
    </EntityModal>
  );
}
