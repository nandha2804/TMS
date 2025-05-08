import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Get tokens from cookies
  const accessToken = request.cookies.get('token')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;
  const { pathname } = request.nextUrl;

  // Define public and protected paths
  const isPublicPath = pathname.startsWith('/auth/') || pathname === '/auth';
  const isProtectedPath = pathname.startsWith('/dashboard') ||
                         pathname.startsWith('/tasks') ||
                         pathname === '/profile';

  // Function to check if token is expired
  const isTokenExpired = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= expiryTime;
    } catch {
      return true; // If token can't be decoded, consider it expired
    }
  };

  // Function to refresh token
  const refreshAccessToken = async (refreshToken: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) throw new Error('Failed to refresh token');
      
      const data = await response.json();
      return data.access_token;
    } catch {
      return null;
    }
  };

  // Handle token refresh if needed
  if (accessToken && isTokenExpired(accessToken) && refreshToken) {
    const newToken = await refreshAccessToken(refreshToken);
    if (newToken) {
      const response = NextResponse.next();
      response.cookies.set('token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
      return response;
    }
    // If refresh failed, redirect to login
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Redirect authenticated users from public paths to dashboard
  if (isPublicPath && accessToken && !isTokenExpired(accessToken)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect unauthenticated users to login
  if (isProtectedPath && (!accessToken || isTokenExpired(accessToken))) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Handle root path redirect
  if (pathname === '/') {
    if (accessToken && !isTokenExpired(accessToken)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

// Configure paths that should trigger the middleware
export const config = {
  matcher: [
    '/',
    '/auth/:path*',
    '/dashboard/:path*',
    '/tasks/:path*',
    '/profile/:path*',
  ],
};