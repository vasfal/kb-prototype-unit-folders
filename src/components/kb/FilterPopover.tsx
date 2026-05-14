import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, User, Tag } from 'lucide-react';
import type { ArticleStatus } from '@/types';
import { contacts as allContacts } from '@/data/mock-data';
import {
  type ArticleFilters,
  type UpdatedRange,
} from './article-filters';

export type FilterField = 'status' | 'owner' | 'updated';

interface FilterPopoverProps {
  filters: ArticleFilters;
  onChange: (next: ArticleFilters) => void;
  /** Open the popover directly on a field's value picker (e.g. from chip click). */
  initialField?: FilterField | null;
}

const STATUS_OPTIONS: { value: ArticleStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

const UPDATED_OPTIONS: { value: UpdatedRange; label: string }[] = [
  { value: 'any', label: 'Any time' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
];

const FIELD_META: Record<
  FilterField,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  status: { label: 'Status', icon: Tag },
  owner: { label: 'Owner', icon: User },
  updated: { label: 'Updated', icon: Clock },
};

export function FilterPopover({ filters, onChange, initialField }: FilterPopoverProps) {
  const [field, setField] = useState<FilterField | null>(initialField ?? null);

  // If parent updates initialField (e.g. user clicks another chip), follow it.
  useEffect(() => {
    if (initialField !== undefined) setField(initialField ?? null);
  }, [initialField]);

  const toggleStatus = (s: ArticleStatus) => {
    const next = new Set(filters.statuses);
    if (next.has(s)) next.delete(s);
    else next.add(s);
    onChange({ ...filters, statuses: next });
  };

  const toggleOwner = (id: string) => {
    const next = new Set(filters.owners);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange({ ...filters, owners: next });
  };

  const setUpdated = (u: UpdatedRange) => {
    onChange({ ...filters, updated: u });
  };

  return (
    <div className="absolute left-0 top-full mt-1 z-30 bg-white border border-[#e0e4eb] rounded-lg shadow-[0px_4px_12px_rgba(31,36,46,0.12)] w-[260px] max-h-[400px] flex flex-col">
      {field === null ? (
        <FieldList filters={filters} onPick={setField} />
      ) : (
        <FieldHeader field={field} onBack={() => setField(null)} />
      )}

      {field !== null && (
        <div className="flex-1 overflow-y-auto py-1">
          {field === 'status' &&
            STATUS_OPTIONS.map((opt) => (
              <CheckRow
                key={opt.value}
                label={opt.label}
                checked={filters.statuses.has(opt.value)}
                onToggle={() => toggleStatus(opt.value)}
              />
            ))}
          {field === 'owner' &&
            Object.values(allContacts).map((c) => (
              <CheckRow
                key={c.id}
                label={c.name}
                sub={c.role}
                checked={filters.owners.has(c.id)}
                onToggle={() => toggleOwner(c.id)}
              />
            ))}
          {field === 'updated' &&
            UPDATED_OPTIONS.map((opt) => (
              <RadioRow
                key={opt.value}
                label={opt.label}
                checked={filters.updated === opt.value}
                onSelect={() => setUpdated(opt.value)}
              />
            ))}
        </div>
      )}
    </div>
  );
}

function FieldList({
  filters,
  onPick,
}: {
  filters: ArticleFilters;
  onPick: (f: FilterField) => void;
}) {
  const fields: FilterField[] = ['status', 'owner', 'updated'];
  const isApplied = (f: FilterField) => {
    if (f === 'status') return filters.statuses.size > 0;
    if (f === 'owner') return filters.owners.size > 0;
    return filters.updated !== 'any';
  };

  return (
    <div className="flex flex-col py-1">
      <div className="px-3 pt-1.5 pb-1 text-[11px] font-medium uppercase tracking-wide text-[#697a9b]">
        Add filter
      </div>
      {fields.map((f) => {
        const meta = FIELD_META[f];
        const Icon = meta.icon;
        const applied = isApplied(f);
        return (
          <button
            key={f}
            type="button"
            onClick={() => onPick(f)}
            className="flex items-center gap-2 px-3 py-2 text-left hover:bg-[#fafbfc]"
          >
            <Icon className="w-3.5 h-3.5 text-[#697a9b] shrink-0" />
            <span className="text-[13px] text-[#1f242e] flex-1">{meta.label}</span>
            {applied && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#006bd6]" />
            )}
            <ChevronRight className="w-3.5 h-3.5 text-[#a8b1c2] shrink-0" />
          </button>
        );
      })}
    </div>
  );
}

function FieldHeader({
  field,
  onBack,
}: {
  field: FilterField;
  onBack: () => void;
}) {
  const meta = FIELD_META[field];
  const Icon = meta.icon;
  return (
    <div className="flex items-center gap-1.5 px-2 py-2 border-b border-[#edeff3] shrink-0">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center justify-center w-6 h-6 rounded hover:bg-[#fafbfc]"
        title="Back"
      >
        <ChevronLeft className="w-4 h-4 text-[#525f7a]" />
      </button>
      <Icon className="w-3.5 h-3.5 text-[#697a9b]" />
      <span className="text-[13px] font-medium text-[#1f242e]">
        {meta.label}
      </span>
    </div>
  );
}

function CheckRow({
  label,
  sub,
  checked,
  onToggle,
}: {
  label: string;
  sub?: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-2 px-3 py-1.5 text-left text-[13px] text-[#1f242e] hover:bg-[#fafbfc]"
    >
      <span
        className={`flex items-center justify-center w-3.5 h-3.5 rounded border shrink-0 ${
          checked
            ? 'bg-[#006bd6] border-[#006bd6]'
            : 'bg-white border-[#c1c7d0]'
        }`}
      >
        {checked && (
          <svg
            viewBox="0 0 12 12"
            className="w-2.5 h-2.5 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="2.5 6 5 8.5 9.5 4" />
          </svg>
        )}
      </span>
      <span className="flex flex-col min-w-0 flex-1">
        <span className="truncate">{label}</span>
        {sub && <span className="text-[11px] text-[#697a9b] truncate">{sub}</span>}
      </span>
    </button>
  );
}

function RadioRow({
  label,
  checked,
  onSelect,
}: {
  label: string;
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex items-center gap-2 px-3 py-1.5 text-left text-[13px] text-[#1f242e] hover:bg-[#fafbfc]"
    >
      <span
        className={`flex items-center justify-center w-3.5 h-3.5 rounded-full border-2 shrink-0 ${
          checked ? 'border-[#006bd6]' : 'border-[#c1c7d0]'
        }`}
      >
        {checked && <span className="block w-1.5 h-1.5 rounded-full bg-[#006bd6]" />}
      </span>
      <span className="truncate flex-1">{label}</span>
    </button>
  );
}
