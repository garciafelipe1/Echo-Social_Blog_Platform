import { IPostsList } from '@/interfaces/blog/IPost';
import PostCard from './PostCard';
import LoadingPostCard from '@/components/loaders/LoaderPostCard';
import BlogDemoTools from './BlogDemoTools';

interface ComponentProps {
  posts: IPostsList[];
  title?: string;
  description?: string;
  loading: boolean;
  /** Llamar después de generar posts de prueba para refrescar la lista */
  onRefetchAfterGenerate?: () => void;
}

export default function PostList({
  posts,
  loading,
  title = 'Todas las publicaciones',
  description = 'Las últimas publicaciones de la comunidad.',
  onRefetchAfterGenerate,
}: ComponentProps) {
  if (loading) {
    return (
      <div className="dark:bg-dark-main bg-gray-50/50 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="dark:text-dark-txt text-xl font-semibold text-gray-900">{title}</h2>
            <p className="dark:text-dark-txt-secondary mt-1 text-gray-600">{description}</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <LoadingPostCard key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dark:bg-dark-main bg-gray-50/50 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="dark:text-dark-txt text-xl font-semibold text-gray-900">{title}</h2>
            <p className="dark:text-dark-txt-secondary mt-1 text-gray-600">{description}</p>
          </div>
        </div>

        {onRefetchAfterGenerate && (
          <div className="mb-8">
            <BlogDemoTools onRefetchAfterGenerate={onRefetchAfterGenerate} />
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2">
          {posts.length === 0 ? (
            <div className="dark:border-dark-third dark:bg-dark-bg col-span-full rounded-2xl border border-gray-200 bg-white py-16 text-center">
              <p className="dark:text-dark-txt-secondary text-gray-500">
                Aún no hay publicaciones. ¡Sé el primero en publicar!
              </p>
              <p className="dark:text-dark-txt-secondary mt-2 text-sm text-gray-400">
                Usa las herramientas de desarrollo más abajo para generar datos de prueba.
              </p>
            </div>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
      </div>
    </div>
  );
}
