export function getPublicApiBase() {
  return process.env.NEXT_PUBLIC_BACKEND_URL?.trim().replace(/\/$/, "") ?? "";
}

export function buildPublicApiUrl(pathname: string) {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const base = getPublicApiBase();

  return base ? `${base}${normalizedPath}` : normalizedPath;
}
