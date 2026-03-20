import { IPostsList } from '@/interfaces/blog/IPost';
import ListPostCard from './ListPostCard';
import Button from '@/components/Button';
import LoadingMoon from '@/components/loaders/LoadingMoon';
import ListPostCardLoading from '@/components/loaders/ListPostCardLoading';

interface ComponentsProps {
  posts: IPostsList[];
  loading?: boolean;
  loadingMore?: boolean;
  loadMore?: any;
  nextUrl?: string | undefined;
  handleDelete?: (slug: string) => Promise<void>;
  loadingDelete: boolean;
}

export default function ListPosts({
  posts,
  loadingMore,
  loadMore,
  nextUrl,
  loading,
  handleDelete,
  loadingDelete,
}: ComponentsProps) {
  return (
    <div>
      {loading ? (
        <ListPostCardLoading />
      ) : !posts?.length ? (
        <div className="dark:border-dark-third dark:bg-dark-bg rounded-2xl border border-gray-200 bg-white py-12 text-center">
          <p className="dark:text-dark-txt-secondary text-gray-500">Aún no hay publicaciones.</p>
          <p className="dark:text-dark-txt-secondary mt-1 text-sm text-gray-400">
            Cuando publiques algo, aparecerá aquí.
          </p>
        </div>
      ) : (
        <div>
          <ul>
            {posts.map((post) => (
              <ListPostCard
                key={post.id}
                post={post}
                handleDelete={handleDelete}
                loadingDelete={loadingDelete}
              />
            ))}
          </ul>
          {nextUrl && (
            <Button disabled={loadingMore} onClick={loadMore} className="mt-6">
              {loadingMore ? <LoadingMoon /> : 'Load more'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

ListPosts.defaultProps = {
  loadingMore: false,
  loadMore: null,
  nextUrl: undefined,
  handleDelete: null,
  loadingDelete: false,
};
