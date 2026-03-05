import { IPostsList } from '@/interfaces/blog/IPost';
import { ICategory } from '@/interfaces/blog/ICategory';
import FeedSidebar from './FeedSidebar';
import SidebarCategories from './SidebarCategories';
import SidebarAuthors from './SidebarAuthors';
import Link from 'next/link';

interface FeedRightSidebarProps {
  featuredPosts: IPostsList[];
  latestPosts: IPostsList[];
  categories: ICategory[];
}

export default function FeedRightSidebar({
  featuredPosts,
  latestPosts,
  categories,
}: FeedRightSidebarProps) {
  return (
    <div className="space-y-4">
      {featuredPosts.length > 0 && <FeedSidebar posts={featuredPosts} />}
      <SidebarCategories categories={categories} />
      <SidebarAuthors posts={latestPosts} />

      {/* Mini footer */}
      <nav className="dark:text-dark-txt-secondary flex flex-wrap gap-x-3 gap-y-1 px-4 text-xs text-gray-400">
        <Link href="/contact" className="dark:hover:text-dark-txt hover:text-gray-600">
          Contacto
        </Link>
        <Link href="/blog" className="dark:hover:text-dark-txt hover:text-gray-600">
          Blog
        </Link>
        <span>&copy; {new Date().getFullYear()} Echo</span>
      </nav>
    </div>
  );
}
