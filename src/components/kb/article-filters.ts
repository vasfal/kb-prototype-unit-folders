import type { ArticleStatus, KBArticle } from '@/types';

export type UpdatedRange = 'any' | '7d' | '30d' | '90d';

export interface ArticleFilters {
  /** Lowercased substring matched against article title. Empty = no search. */
  search: string;
  /** Statuses to include. Empty set means "everything" (treat as no filter). */
  statuses: Set<ArticleStatus>;
  /** Contact IDs of owners to include. Empty set = all owners. */
  owners: Set<string>;
  /** Time window matched against `updatedAt`. */
  updated: UpdatedRange;
}

export const DEFAULT_FILTERS: ArticleFilters = {
  search: '',
  // Empty = no status narrowing (show all). User can opt-in by checking values.
  statuses: new Set<ArticleStatus>(),
  owners: new Set<string>(),
  updated: 'any',
};

const DAY_MS = 86_400_000;
const RANGE_DAYS: Record<UpdatedRange, number | null> = {
  any: null,
  '7d': 7,
  '30d': 30,
  '90d': 90,
};

/** Whether filters meaningfully narrow the result set. Used to mark the filter
 *  button as "active" so the user knows something is filtering content. */
export function isFiltersActive(filters: ArticleFilters): boolean {
  if (filters.search.trim() !== '') return true;
  if (filters.statuses.size > 0) return true;
  if (filters.owners.size > 0) return true;
  if (filters.updated !== 'any') return true;
  return false;
}

/** Excludes `search` from the "active" check — used by the filter button which
 *  has its own visual paired with the search input. */
export function hasNonSearchFilter(filters: ArticleFilters): boolean {
  if (filters.statuses.size > 0) return true;
  if (filters.owners.size > 0) return true;
  if (filters.updated !== 'any') return true;
  return false;
}

/** Apply search + status + owner + updated filters to an article array.
 *  Search matches title (case-insensitive substring). Empty status set is
 *  treated as "match everything" defensively. */
export function applyArticleFilters(
  articles: KBArticle[],
  filters: ArticleFilters
): KBArticle[] {
  const q = filters.search.trim().toLowerCase();
  const days = RANGE_DAYS[filters.updated];
  const cutoff = days === null ? null : Date.now() - days * DAY_MS;
  return articles.filter((a) => {
    if (q && !a.title.toLowerCase().includes(q)) return false;
    if (filters.statuses.size > 0 && !filters.statuses.has(a.status)) return false;
    if (filters.owners.size > 0 && !filters.owners.has(a.owner.id)) return false;
    if (cutoff !== null && new Date(a.updatedAt).getTime() < cutoff) return false;
    return true;
  });
}
