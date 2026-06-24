"use client";

export interface SessionUser {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar_url: string;
  isAuthenticated: boolean;
  bio?: string;
  location?: string;
  stats?: {
    albums_logged: number;
    reviews_written: number;
    followers: number;
    following: number;
  };
  favorite_albums?: string[];
}

export const SESSION_KEY = "activeSession";

/**
 * Clears the active session from localStorage and dispatches a session change event,
 * then redirects the user to the login page using Next.js router.
 */
export function handleLogout(router?: { push: (href: string) => void }) {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SESSION_KEY);
    // Dispatch custom event to notify other components (e.g. Navbar) in real-time
    window.dispatchEvent(new Event("sessionChanged"));
  }
  if (router) {
    router.push("/login");
  } else if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}
