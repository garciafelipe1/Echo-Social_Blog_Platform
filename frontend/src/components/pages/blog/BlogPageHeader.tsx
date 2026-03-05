import { ICategory } from '@/interfaces/blog/ICategory';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface Props {
  categories: ICategory[];
  activeCategory: string;
  onCategoryChange: (slug: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function BlogPageHeader({
  categories,
  activeCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
}: Props) {
  return (
    <header className="sticky top-0 z-20 border-b border-gray-200/80 bg-white/80 backdrop-blur-xl dark:border-dark-third dark:bg-dark-main/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top row: title + search */}
        <div className="flex items-center justify-between gap-4 py-4">
          <h1 className="text-lg font-bold tracking-tight text-gray-900 dark:text-dark-txt">
            Explorar
          </h1>
          <div className="relative max-w-xs flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar publicaciones..."
              className="w-full rounded-full bg-gray-100 py-2 pl-9 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-violet-500/30 dark:bg-dark-second dark:text-dark-txt dark:placeholder:text-dark-txt-secondary dark:focus:bg-dark-third"
            />
          </div>
        </div>

        {/* Category pills */}
        <nav className="-mb-px flex gap-1 overflow-x-auto pb-0 scrollbar-none" aria-label="Categorias">
          <button
            type="button"
            onClick={() => onCategoryChange('')}
            className={`shrink-0 rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${
              activeCategory === ''
                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-dark-second dark:text-dark-txt-secondary dark:hover:bg-dark-third'
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => onCategoryChange(cat.slug)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${
                activeCategory === cat.slug
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-dark-second dark:text-dark-txt-secondary dark:hover:bg-dark-third'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </nav>
        <div className="h-3" />
      </div>
    </header>
  );
}
