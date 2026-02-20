const PUBLIC_EXACT_PATHS = new Set(["/auth/login", "/auth/callback", "/favicon.ico"]);
const PUBLIC_PREFIX_PATHS = ["/_next"];

function isStaticAssetPath(pathname: string): boolean {
  return /\.[a-z0-9]+$/i.test(pathname);
}

export function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT_PATHS.has(pathname)) {
    return true;
  }

  if (PUBLIC_PREFIX_PATHS.some((prefix) => pathname.startsWith(`${prefix}/`))) {
    return true;
  }

  return isStaticAssetPath(pathname);
}

export function isAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function normalizeNextPath(value: string | null | undefined): string {
  if (!value) {
    return "/";
  }

  try {
    const url = new URL(value, "http://local.test");
    if (url.origin !== "http://local.test") {
      return "/";
    }

    if (!url.pathname.startsWith("/") || url.pathname.startsWith("//")) {
      return "/";
    }

    return `${url.pathname}${url.search}`;
  } catch {
    return "/";
  }
}

export function buildLoginRedirect(pathname: string, search: string): string {
  const next = normalizeNextPath(`${pathname}${search}`);
  return `/auth/login?next=${encodeURIComponent(next)}`;
}
