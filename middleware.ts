import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Set your hostnames here
const ROOT_DOMAIN = 'buyerpref.link';
const APP_DOMAIN = 'app.buyerpref.link';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const host = req.headers.get('host') || '';

  // Match /a/<agentId>/settings (with or without trailing slash)
  const m = url.pathname.match(/^\/a\/([^/]+)\/settings\/?$/);
  if (m) {
    const agentId = m[1];

    // If hit on root marketing domain, redirect to app domain with agentId
    if (host === ROOT_DOMAIN) {
      url.hostname = APP_DOMAIN;
      url.pathname = '/moved-settings';
      url.searchParams.set('agentId', agentId);
      return NextResponse.redirect(url, 307); // temporary redirect
    }

    // If hit on app domain, rewrite internally
    if (host === APP_DOMAIN) {
      url.pathname = '/moved-settings';
      url.searchParams.set('agentId', agentId);
      return NextResponse.rewrite(url);
    }
  }

  // Otherwise continue normally
  return NextResponse.next();
}

// Only run this middleware for any URL under /a/*
export const config = {
  matcher: ['/a/:path*'],
};
