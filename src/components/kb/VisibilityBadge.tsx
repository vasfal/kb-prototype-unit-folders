import type { Visibility } from '@/types';
import { Lock } from 'lucide-react';

/** Only renders for current_unit_only. unit_and_subunits is the default — no badge. */
export function VisibilityBadge({ visibility }: { visibility: Visibility }) {
  if (visibility === 'unit_and_subunits') return null;

  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-medium text-red-600 bg-red-50 rounded border border-red-200">
      <Lock className="w-3 h-3" />
      Current unit only
    </span>
  );
}
