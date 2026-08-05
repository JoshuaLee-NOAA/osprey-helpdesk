import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define matching route groups that require authentication
const isProtectedRoute = createRouteMatcher([
  "/portal(.*)",
  "/dashboard(.*)",
  "/api/agent/resume(.*)", // IT Admin actions route protection
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    auth().protect(); // Enforce user auth. Redirects unauthenticated users to sign-in.
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.[\\w]+$|_next/image|favicon.ico).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
