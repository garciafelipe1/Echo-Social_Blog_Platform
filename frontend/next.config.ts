/** @type {import('next').NextConfig} */

// Dominio del backend para imágenes (desde NEXT_PUBLIC_API_URL en build)
const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
let apiRemotePattern: { protocol: string; hostname: string; port?: string; pathname: string } | null = null;
if (apiUrl) {
  try {
    const url = new URL(apiUrl);
    apiRemotePattern = {
      protocol: url.protocol.replace(':', '') as 'http' | 'https',
      hostname: url.hostname,
      pathname: '/media/**',
    };
    if (url.port && !['80', '443'].includes(url.port)) {
      apiRemotePattern.port = url.port;
    } else if (apiRemotePattern.port) {
      delete apiRemotePattern.port;
    }
  } catch {
    // URL inválida, ignorar
  }
}

const nextConfig = {
  reactStrictMode: false,
  output: 'standalone',
  turbopack: {
    root: __dirname,
  },
  images: {
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      ...(apiRemotePattern ? [apiRemotePattern] : []),
      { protocol: 'http', hostname: '127.0.0.1', port: '8000', pathname: '/media/**' },
      { protocol: 'http', hostname: 'localhost', port: '7000', pathname: '/media/**' },
      { protocol: 'http', hostname: '127.0.0.1', port: '8004', pathname: '/media/**' },
      { protocol: 'http', hostname: '127.0.0.1', port: '7000', pathname: '/media/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '**' },
      { protocol: 'https', hostname: 'ui-avatars.com', pathname: '**' },
      { protocol: 'https', hostname: 'picsum.photos', pathname: '**' },
    ],
  },
};

export default nextConfig;
