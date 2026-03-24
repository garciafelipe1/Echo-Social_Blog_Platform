/**
 * Helper for API routes that proxy to the Django backend.
 * Ensures API_URL is set and returns a proper error if the backend is unreachable.
 */

export function getBackendUrl(): string {
  const url = process.env.API_URL;
  if (!url || url === '') {
    throw new Error(
      'API_URL is not set. Add API_URL=http://127.0.0.1:7000 to frontend/.env.local and run the Django backend.',
    );
  }
  return url.replace(/\/$/, '');
}
