export function sanitiePath(path: string): string {
  return path.replace(/\/+/g, "/").replace(/^\/|\/$/g, "");
}

export function sanitizeUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

export function sanitizeUrlPath(
  url: string,
  path: string,
  params?: Record<string, string>
): string {
  return (
    sanitizeUrl(url) +
    "/" +
    sanitiePath(path) +
    (params ? "?" + new URLSearchParams(params).toString() : "")
  );
}
