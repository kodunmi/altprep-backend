// parseDateRange('2025-01-01,2025-01-31') => ['2025-01-01 00:00:00', '2025-01-31 23:59:59']
export function parseDateRange(range?: string): [string, string] | null {
  if (!range) return null;
  const parts = Array.isArray(range) ? range : String(range).split(',');
  if (parts.length !== 2) return null;
  const from = parts[0].trim();
  const to = parts[1].trim();
  // ensure timestamps for full days
  return [`${from} 00:00:00`, `${to} 23:59:59`];
}
