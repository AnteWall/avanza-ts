export function pathId(id: string | undefined): string {
  if (id === undefined) return '';
  if (!id.trim()) throw new TypeError('ID must not be empty.');
  return `/${encodeURIComponent(id)}`;
}
