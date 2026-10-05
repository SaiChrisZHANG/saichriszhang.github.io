/** Keep every internal link valid for both a user site and a project site. */
export function url(path: string): string {
  if (/^(?:[a-z]+:|\/\/|#)/i.test(path)) return path;
  return `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}
