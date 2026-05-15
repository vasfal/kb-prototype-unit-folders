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

/** Which version-snapshot the modal body is currently rendering. Drives the
 *  contextual chip rendered next to the Status picker so the user always
 *  knows whether they're looking at the live published version, an older
 *  snapshot, or the pending draft. */
export type ViewingMode = 'current' | 'older' | 'draft';

interface ArticleSummaryFieldsProps {
  article: KBArticle;
  editable: boolean;
  /** What the modal body is showing right now. */
  viewing?: ViewingMode;
  /** Version number when `viewing === 'older'`. */
  viewingVersion?: number;
  /** True when a draft overlay exists (independent of `viewing`). When
   *  the user is on `current` and a draft exists, a clickable "Has
   *  unpublished changes" chip surfaces it. */
  hasDraft?: boolean;
  /** Clicked on the contextual version chip — typically opens the
   *  Versions sidebar. */
  onVersionChipClick?: () => void;
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

function renderVersionChip({
  viewing,
  viewingVersion,
  hasDraft,
  status,
  onClick,
}: {
  viewing: ViewingMode;
  viewingVersion?: number;
  hasDraft: boolean;
  status: ArticleStatus;
  onClick?: () => void;
}): React.ReactNode {
  // Older or draft article-context chips are irrelevant on archived.
  if (status === 'archived') return null;

  // Looking at an older published snapshot.
  if (viewing === 'older' && viewingVersion !== undefined) {
    return (
      <ChipButton onClick={onClick} variant="neutral" title="Switch version">
        Viewing v{viewingVersion}
      </ChipButton>
    );
  }

  // Looking at the draft (unpublished changes) overlay.
  if (viewing === 'draft' && hasDraft) {
    return (
      <ChipButton onClick={onClick} variant="amber" title="Switch version">
        <span className="w-1.5 h-1.5 rounded-full bg-[#d97706]" />
        Unpublished changes
      </ChipButton>
    );
  }

  // Looking at the live published version, but a draft exists — surface
  // it in a subdued style; the active "Unpublished changes" view uses the
  // bolder amber variant.
  if (viewing === 'current' && hasDraft && status === 'published') {
    return (
      <ChipButton onClick={onClick} variant="neutral" title="View unpublished changes">
        <span className="w-1.5 h-1.5 rounded-full bg-[#697a9b]" />
        Has unpublished changes
      </ChipButton>
    );
  }

  return null;
}

function ChipButton({
  children,
  onClick,
  variant,
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant: 'amber' | 'neutral';
  title?: string;
}) {
  const variantClass =
    variant === 'amber'
      ? 'bg-[#fef3c7] text-[#92400e] hover:bg-[#fde68a]'
      : 'bg-[#edeff3] text-[#525f7a] hover:bg-[#e0e4eb]';
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-medium rounded-md leading-none whitespace-nowrap shrink-0 transition-colors ${variantClass} ${
        onClick ? 'cursor-pointer' : 'cursor-default'
      }`}
    >
      {children}
    </button>
  );
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
  viewing = 'current',
  viewingVersion,
  hasDraft,
  onVersionChipClick,
  onStatusChange,
  onOwnerChange,
  onFolderChange,
}: ArticleSummaryFieldsProps) {
  const unit = getUnit(article.unitId);
  const folder = getFolder(article.folderId);

  const chip = renderVersionChip({
    viewing,
    viewingVersion,
    hasDraft: !!hasDraft,
    status: article.status,
    onClick: onVersionChipClick,
  });

  return (
    <div className="flex gap-6">
      <div className="flex-1 flex flex-col">
        <FieldRow icon={<Clock className="w-4 h-4" />} label="Status">
          {/* Status is editable even when the article is archived so users
              can restore via the picker. Other fields respect `editable`. */}
          <div className="flex items-center gap-2">
            <StatusPicker
              status={article.status}
              editable
              onChange={onStatusChange}
            />
            {chip}
          </div>
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

  const badgeStatic = (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 text-[13px] font-medium rounded-md leading-[16px] ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );

  if (!editable || !onChange)
    return <span className="inline-block px-3">{badgeStatic}</span>;

  // Filter targets to the meaningful transitions: a draft can't be
  // archived directly, an archived article restores into a draft.
  const availableOptions = STATUS_OPTIONS.filter((opt) => {
    if (status === 'draft' && opt.value === 'archived') return false;
    if (status === 'archived' && opt.value === 'published') return false;
    return true;
  });

  // Editable: chevron sits inside the badge itself so the whole pill reads
  // as a single interactive control.
  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[13px] font-medium rounded-md leading-[16px] transition-colors ${STATUS_STYLES[status]} ${
          open ? 'ring-2 ring-[#006bd6]/30' : 'hover:brightness-95'
        }`}
        title="Change status"
      >
        {STATUS_LABELS[status]}
        <ChevronDown className="w-3 h-3 opacity-75" />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-[#e0e4eb] rounded-lg shadow-[0px_4px_12px_rgba(31,36,46,0.12)] py-1 min-w-[140px]">
          {availableOptions.map((opt) => (
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

