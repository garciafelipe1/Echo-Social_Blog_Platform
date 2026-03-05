import { useSelector } from 'react-redux';
import Link from 'next/link';
import { RootState } from '@/redux/reducers';
import useComments from '@/hooks/useComments';
import CommentComposer from './CommentComposer';
import CommentItem from './CommentItem';

interface Props {
  slug: string;
}

export default function CommentSection({ slug }: Props) {
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const {
    comments,
    loading,
    submitting,
    hasMore,
    loadMore,
    postComment,
    postReply,
    deleteComment,
  } = useComments({ slug });

  return (
    <section id="comments" className="dark:border-dark-third mt-8 border-t border-gray-100 pt-6">
      <h2 className="dark:text-dark-txt mb-4 text-lg font-bold text-gray-900">Comentarios</h2>

      {isAuthenticated ? (
        <div className="mb-6">
          <CommentComposer onSubmit={postComment} submitting={submitting} />
        </div>
      ) : (
        <p className="dark:text-dark-txt-secondary mb-6 text-sm text-gray-400">
          <Link href="/login" className="text-violet-600 hover:underline dark:text-violet-400">
            Inicia sesion
          </Link>{' '}
          para dejar un comentario.
        </p>
      )}

      {loading && comments.length === 0 ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex animate-pulse gap-3">
              <div className="dark:bg-dark-third h-7 w-7 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="dark:bg-dark-third h-3 w-24 rounded bg-gray-200" />
                <div className="dark:bg-dark-second h-10 rounded-lg bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="dark:text-dark-txt-secondary text-sm text-gray-400">
          Aun no hay comentarios. Se el primero.
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUser={user?.username}
              onDelete={deleteComment}
              onReply={postReply}
              submitting={submitting}
            />
          ))}
          {hasMore && (
            <button
              type="button"
              onClick={loadMore}
              disabled={loading}
              className="text-sm font-medium text-violet-600 hover:underline disabled:opacity-50 dark:text-violet-400"
            >
              {loading ? 'Cargando...' : 'Cargar mas comentarios'}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
