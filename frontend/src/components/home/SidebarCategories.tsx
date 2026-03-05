import Link from 'next/link';
import { ICategory } from '@/interfaces/blog/ICategory';
import { HashtagIcon } from '@heroicons/react/24/outline';

interface SidebarCategoriesProps {
  categories: ICategory[];
}

const MAX_VISIBLE = 6;

export default function SidebarCategories({ categories }: SidebarCategoriesProps) {
  const list = categories.slice(0, MAX_VISIBLE);
  if (list.length === 0) return null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-4 dark:border-dark-third dark:bg-dark-bg">
      <h3 className="text-lg font-bold text-gray-900 dark:text-dark-txt">Categorías</h3>
      <ul className="mt-3 space-y-1">
        {list.map((cat) => (
          <li key={cat.slug}>
            <Link
              href={`/blog?category=${cat.slug}`}
              className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm text-gray-700 transition-colors hover:bg-white hover:text-gray-900 dark:text-dark-txt-secondary dark:hover:bg-dark-second dark:hover:text-dark-txt"
            >
              <HashtagIcon className="h-4 w-4 shrink-0 text-gray-400 dark:text-dark-txt-secondary" />
              <span className="truncate">{cat.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
