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
      ) : (
        <div>
          <ul>
            {posts?.map((post) => (
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
