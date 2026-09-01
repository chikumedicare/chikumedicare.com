/**
 * Capitalizes the first letter of each word in a string (Title Case)
 */
export function toTitleCase(str?: string | null): string {
  if (!str) return '';
  return str.replace(/\b([a-z])/g, (match) => match.toUpperCase());
}

export const capitalizeWords = toTitleCase;
