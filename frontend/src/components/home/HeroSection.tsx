import Link from 'next/link';

const HERO = {
  title: 'Blog de la comunidad',
  tagline: 'Lee, escribe y descubre historias de quienes comparten contigo.',
  ctaPrimary: 'Explorar publicaciones',
  ctaSecondary: 'Ver blog',
} as const;

export default function HeroSection() {
  return (
    <header className="relative overflow-hidden border-b border-gray-200/80 bg-gradient-to-b from-gray-50/80 to-white px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
          {HERO.title}
        </h1>
        <p className="mt-4 text-lg text-gray-600 sm:text-xl">{HERO.tagline}</p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/blog"
            className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
          >
            {HERO.ctaPrimary}
          </Link>
          <Link
            href="/blog"
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            {HERO.ctaSecondary}
          </Link>
        </div>
      </div>
    </header>
  );
}
