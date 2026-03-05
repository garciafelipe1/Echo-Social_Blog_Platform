import { useState, useEffect, useCallback } from 'react';
import CommentItem from './CommentItem';
import type { IComment } from '@/hooks/useComments';

interface Props {
  commentId: string;
  repliesCount: number;
  currentUser: string | undefined;
  onDeleteReply: (id: string) => Promise<void>;
  onPostReply: (commentId: string, content: string) => Promise<void>;
  submitting: boolean;
}

export default function ReplyList({
  commentId,
  repliesCount,
  currentUser,
  onDeleteReply,
  onPostReply,
  submitting,
}: Props) {
  const [replies, setReplies] = useState<IComment[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchReplies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/blog/post/comment/replies?comment_id=${encodeURIComponent(commentId)}`,
      );
      if (res.ok) {
        const data = await res.json();
        setReplies(data.results ?? data ?? []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [commentId]);

  useEffect(() => {
    if (open && replies.length === 0) {
      fetchReplies();
    }
  }, [open, fetchReplies, replies.length]);

  if (repliesCount === 0 && replies.length === 0) return null;

  return (
    <div className="ml-10 mt-1">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-xs font-medium text-violet-600 hover:underline dark:text-violet-400"
      >
        {open
          ? 'Ocultar respuestas'
          : `Ver ${repliesCount} respuesta${repliesCount !== 1 ? 's' : ''}`}
      </button>
      {open && (
        <div className="dark:border-dark-third mt-2 space-y-2 border-l-2 border-gray-100 pl-3">
          {loading ? (
            <p className="text-xs text-gray-400">Cargando...</p>
          ) : (
            replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                currentUser={currentUser}
                onDelete={onDeleteReply}
                onReply={onPostReply}
                submitting={submitting}
                isReply
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
