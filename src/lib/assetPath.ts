const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** Prefix public-folder assets when the app is built for a GitHub project page. */
export function assetPath(path: string): string {
  if (!path.startsWith('/') || path.startsWith('//') || !basePath) return path;
  return `${basePath}${path}`;
}
