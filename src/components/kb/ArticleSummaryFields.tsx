import { useEffect, useRef, useState } from 'react';
import {
  Building2,
  ChevronDown,
  Clock,
  Folder,
  Tag,
  User,
} from 'lucide-react';
import type { KBArticle, ArticleStatus } from '@/types';
import {
  contacts as allContacts,
  getFolder,
  getFolderDepth,
  getOwnFoldersInTreeOrder,
  getUnit,
} from '@/data/mock-data';

interface ArticleSummaryFieldsProps {
  article: KBArticle;
  editable: boolean;
  onStatusChange?: (status: ArticleStatus) => void;
  onOwnerChange?: (ownerId: string) => void;
  onFolderChange?: (folderId: string) => void;
}

const STATUS_OPTIONS: { value: ArticleStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

const STATUS_STYLES: Record<ArticleStatus, string> = {
  published: 'bg-[#398966] text-white',
  draft: 'bg-[#edeff3] text-[#525f7a]',
  archived: 'bg-white text-[#525f7a] border border-[#e0e4eb]',
};

const STATUS_LABELS: Record<ArticleStatus, string> = {
  published: 'Published',
  draft: 'Draft',
  archived: 'Archived',
};

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

function OwnerAvatar({ name }: { name: string }) {
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2);
  return (
    <div
      className="w-5 h-5 rounded-lg text-white text-[9px] font-medium flex items-center justify-center shrink-0"
      style={{ backgroundColor: getAvatarColor(name) }}
    >
      {initials}
    </div>
  );
}

export function ArticleSummaryFields({
  article,
  editable,
  onStatusChange,
  onOwnerChange,
  onFolderChange,
}: ArticleSummaryFieldsProps) {
  const unit = getUnit(article.unitId);
  const folder = getFolder(article.folderId);

  return (
    <div className="flex gap-6">
      <div className="flex-1 flex flex-col">
        <FieldRow icon={<Clock className="w-4 h-4" />} label="Status">
          {/* Status is editable even when the article is archived so users
              can restore via the picker. Other fields respect `editable`. */}
          <StatusPicker
            status={article.status}
            editable
            onChange={onStatusChange}
          />
        </FieldRow>
        <FieldRow icon={<Building2 className="w-4 h-4" />} label="Unit">
          <span className="text-[14px] text-[#525f7a]">{unit?.name ?? 'Unknown'}</span>
        </FieldRow>
      </div>
      <div className="flex-1 flex flex-col">
        <FieldRow icon={<User className="w-4 h-4" />} label="Owner">
          <OwnerPicker
            ownerName={article.owner.name}
            ownerId={article.owner.id}
            editable={editable}
            onChange={onOwnerChange}
          />
        </FieldRow>
        <FieldRow icon={<Tag className="w-4 h-4" />} label="Folder">
          <FolderPicker
            currentFolderId={folder?.id ?? ''}
            currentFolderName={folder?.name ?? '—'}
            unitId={article.unitId}
            editable={editable}
            onChange={onFolderChange}
          />
        </FieldRow>
      </div>
    </div>
  );
}

function FieldRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center h-10">
      <div className="flex items-center gap-2 w-[160px] shrink-0 text-[14px] text-[#3d475c]">
        <span className="text-[#697a9b]">{icon}</span>
        {label}
      </div>
      <div className="flex-1 min-w-0 text-[14px] text-[#1f242e]">{children}</div>
    </div>
  );
}

// ── Status picker ──

function StatusPicker({
  status,
  editable,
  onChange,
}: {
  status: ArticleStatus;
  editable: boolean;
  onChange?: (s: ArticleStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const badge = (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 text-[13px] font-medium rounded-md leading-[16px] ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );

  if (!editable || !onChange) return <span className="inline-block px-3">{badge}</span>;

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md hover:bg-[#fafbfc] ${
          open ? 'bg-[#fafbfc]' : ''
        }`}
        title="Change status"
      >
        {badge}
        <ChevronDown className="w-3 h-3 text-[#697a9b]" />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-[#e0e4eb] rounded-lg shadow-[0px_4px_12px_rgba(31,36,46,0.12)] py-1 min-w-[140px]">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`flex items-center w-full px-3 py-1.5 text-left text-[13px] hover:bg-[#fafbfc] ${
                opt.value === status
                  ? 'text-[#0052a3] bg-[#ebf5ff]'
                  : 'text-[#1f242e]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Owner picker ──

function OwnerPicker({
  ownerName,
  ownerId,
  editable,
  onChange,
}: {
  ownerName: string;
  ownerId: string;
  editable: boolean;
  onChange?: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const display = (
    <span className="flex items-center gap-1.5">
      <OwnerAvatar name={ownerName} />
      <span className="truncate">{ownerName}</span>
    </span>
  );

  if (!editable || !onChange) return <span className="inline-block px-3">{display}</span>;

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-[#fafbfc] ${
          open ? 'bg-[#fafbfc]' : ''
        }`}
        title="Reassign owner"
      >
        {display}
        <ChevronDown className="w-3 h-3 text-[#697a9b]" />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-[#e0e4eb] rounded-lg shadow-[0px_4px_12px_rgba(31,36,46,0.12)] py-1 min-w-[220px] max-h-[260px] overflow-y-auto">
          {Object.values(allContacts).map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                onChange(c.id);
                setOpen(false);
              }}
              className={`flex items-center gap-2 w-full px-3 py-1.5 text-left text-[13px] hover:bg-[#fafbfc] ${
                c.id === ownerId
                  ? 'text-[#0052a3] bg-[#ebf5ff]'
                  : 'text-[#1f242e]'
              }`}
            >
              <OwnerAvatar name={c.name} />
              <span className="flex flex-col min-w-0">
                <span className="truncate">{c.name}</span>
                {c.role && (
                  <span className="text-[11px] text-[#697a9b] truncate">{c.role}</span>
                )}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Folder picker ──

function FolderPicker({
  currentFolderId,
  currentFolderName,
  unitId,
  editable,
  onChange,
}: {
  currentFolderId: string;
  currentFolderName: string;
  unitId: string;
  editable: boolean;
  onChange?: (folderId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const display = <span className="truncate">{currentFolderName}</span>;
  if (!editable || !onChange) return <span className="inline-block px-3">{display}</span>;

  const options = getOwnFoldersInTreeOrder(unitId).map((f) => ({
    id: f.id,
    label: f.name,
    depth: getFolderDepth(f.id),
  }));

  return (
    <div className="relative inline-block max-w-full" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-[#fafbfc] max-w-full ${
          open ? 'bg-[#fafbfc]' : ''
        }`}
        title="Move to another folder"
      >
        <Folder className="w-3.5 h-3.5 text-[#697a9b] shrink-0" />
        {display}
        <ChevronDown className="w-3 h-3 text-[#697a9b] shrink-0" />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-[#e0e4eb] rounded-lg shadow-[0px_4px_12px_rgba(31,36,46,0.12)] py-1 min-w-[240px] max-h-[260px] overflow-y-auto">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-[13px] text-[#697a9b] italic">
              No folders in this unit.
            </div>
          ) : (
            options.map((opt) => {
              const active = opt.id === currentFolderId;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    if (!active) onChange(opt.id);
                    setOpen(false);
                  }}
                  className={`flex items-center gap-2 w-full text-left text-[13px] py-1.5 pr-3 ${
                    active
                      ? 'bg-[#ebf5ff] text-[#0052a3]'
                      : 'text-[#1f242e] hover:bg-[#fafbfc]'
                  }`}
                  style={{ paddingLeft: 12 + (opt.depth - 1) * 16 }}
                >
                  <Folder
                    className={`w-3.5 h-3.5 shrink-0 ${
                      active ? 'text-[#006bd6]' : 'text-[#697a9b]'
                    }`}
                    strokeWidth={1.75}
                  />
                  <span className="truncate">{opt.label}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

