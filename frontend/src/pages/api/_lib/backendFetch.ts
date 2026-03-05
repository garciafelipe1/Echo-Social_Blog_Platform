/**
 * Helper for API routes that proxy to the Django backend.
 * Ensures API_URL is set and returns a proper error if the backend is unreachable.
 */

export function getBackendUrl(): string {
  const url = process.env.API_URL;
  if (!url || url === '') {
    throw new Error(
      'API_URL is not set. Add API_URL=http://localhost:8000 to .env.local and run the Django backend.',
    );
  }
  return url.replace(/\/$/, '');
}
