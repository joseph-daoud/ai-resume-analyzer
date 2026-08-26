// The key used to store the token in the browser's localStorage.
// Defined once here so it never gets misspelled elsewhere.
const TOKEN_KEY = "ai_resume_token";

/**
 * Save the JWT token after a successful login.
 */
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Read the stored JWT token.
 * Returns null if the user is not logged in.
 */
export function getToken(): string | null {
  // localStorage is only available in the browser, not during server rendering.
  // This check prevents errors during Next.js's build process.
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Remove the token — used when the user logs out or the token expires.
 */
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Check whether a token exists.
 * Does NOT verify the token is still valid — just that one is stored.
 */
export function isAuthenticated(): boolean {
  return getToken() !== null;
}