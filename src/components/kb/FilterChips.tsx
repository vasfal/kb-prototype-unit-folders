import { X } from 'lucide-react';
import type { ArticleStatus } from '@/types';
import { contacts as allContacts } from '@/data/mock-data';
import {
  type ArticleFilters,
  type UpdatedRange,
} from './article-filters';
import type { FilterField } from './FilterPopover';

interface FilterChipsProps {
  filters: ArticleFilters;
  onChange: (next: ArticleFilters) => void;
  onEdit: (field: FilterField) => void;
}

const STATUS_LABELS: Record<ArticleStatus, string> = {
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
};

const UPDATED_LABELS: Record<UpdatedRange, string> = {
  any: 'Any time',
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
};

export function FilterChips({ filters, onChange, onEdit }: FilterChipsProps) {
  const chips: { field: FilterField; label: string; onRemove: () => void }[] = [];

  if (filters.statuses.size > 0) {
    const values = Array.from(filters.statuses)
      .map((s) => STATUS_LABELS[s])
      .join(', ');
    chips.push({
      field: 'status',
      label: `Status: ${values}`,
      onRemove: () => onChange({ ...filters, statuses: new Set() }),
    });
  }

  if (filters.owners.size > 0) {
    const idToName = new Map<string, string>();
    Object.values(allContacts).forEach((c) => idToName.set(c.id, c.name));
    const values = Array.from(filters.owners)
      .map((id) => idToName.get(id) ?? id)
      .join(', ');
    chips.push({
      field: 'owner',
      label: `Owner: ${values}`,
      onRemove: () => onChange({ ...filters, owners: new Set() }),
    });
  }

  if (filters.updated !== 'any') {
    chips.push({
      field: 'updated',
      label: `Updated: ${UPDATED_LABELS[filters.updated]}`,
      onRemove: () => onChange({ ...filters, updated: 'any' }),
    });
  }

  if (chips.length === 0) return null;

  const clearAll = () =>
    onChange({
      ...filters,
      statuses: new Set(),
      owners: new Set(),
      updated: 'any',
    });

  return (
    <div className="flex items-center flex-wrap gap-1.5 px-4 py-2 bg-white border-b border-[#edeff3] shrink-0">
      {chips.map((chip) => (
        <span
          key={chip.field}
          className="inline-flex items-center gap-1 h-6 pl-2 pr-1 text-[12px] font-medium text-[#0052a3] bg-[#ebf5ff] border border-[#b3d4f0] rounded-md max-w-[300px]"
        >
          <button
            type="button"
            onClick={() => onEdit(chip.field)}
            className="truncate hover:underline"
            title={`Edit ${chip.field} filter`}
          >
            {chip.label}
          </button>
          <button
            type="button"
            onClick={chip.onRemove}
            className="flex items-center justify-center w-4 h-4 rounded hover:bg-[#cfe5fb] shrink-0"
            title="Remove filter"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={clearAll}
        className="text-[12px] text-[#697a9b] hover:text-[#1f242e] px-2 h-6 rounded"
      >
        Clear all
      </button>
    </div>
  );
}
