/** Palette used when creating a top-level folder. Sub-folders inherit color
 *  from their root ancestor at render time (see getFolderDisplayStyle). */
export const FOLDER_COLORS = [
  '#006bd6',
  '#16a34a',
  '#7c3aed',
  '#ff9124',
  '#e11d48',
  '#0891b2',
  '#d97706',
] as const;

export const DEFAULT_FOLDER_COLOR: string = FOLDER_COLORS[0];
