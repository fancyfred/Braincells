export interface Fact {
  text: string;
  id?: number; // optional; when needed, set from array index at runtime
  /** Area within a topic (sub-grouping); if omitted, fact is in "misc". */
  area?: string;
}

/** Resolved area within a topic (defaults to "misc"). */
export function getFactArea(fact: Fact): string {
  return fact.area ?? 'misc';
}

/** Human-readable label for an area slug (e.g. "language" → "Language"). */
export function getAreaLabel(areaSlug: string): string {
  if (!areaSlug) return 'Misc';
  return areaSlug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

