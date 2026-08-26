/**
 * Resolves a given path taking into account NEXT_PUBLIC_BASE_PATH / BASE_PATH.
 * e.g., withBasePath('/cats/kabu/calm.jpg') => '/my-subpath/cats/kabu/calm.jpg'
 */
export function getBasePath(): string {
  const envBasePath =
    process.env.NEXT_PUBLIC_BASE_PATH ||
    (typeof window !== "undefined" && (window as unknown as { __NEXT_DATA__?: { basePath?: string } }).__NEXT_DATA__?.basePath) ||
    "";
  return envBasePath.replace(/\/$/, "");
}

export function withBasePath(path: string): string {
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }
  const basePath = getBasePath();
  if (!basePath) return path;
  if (path.startsWith(basePath)) return path;
  return `${basePath}${path}`;
}
