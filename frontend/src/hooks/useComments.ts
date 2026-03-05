import { useState, useCallback, useEffect } from 'react';

export interface CommentUser {
  username: string;
  first_name: string;
  last_name: string;
  profile_picture: string | null;
}

export interface IComment {
  id: string;
  user: CommentUser;
  post: string;
  post_title: string;
  parent: string | null;
  content: string;
  created_at: string;
  update_at: string;
  is_active: boolean;
  replies_count: number;
}

interface UseCommentsOptions {
  slug: string;
}

export default function useComments({ slug }: UseCommentsOptions) {
  const [comments, setComments] = useState<IComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  const fetchComments = useCallback(
    async (pageNum: number, append = false) => {
      if (!slug) return;
      setLoading(true);
      try {
        const res = await fetch(
          `/api/blog/post/comments?slug=${encodeURIComponent(slug)}&p=${pageNum}&page_size=10`,
        );
        if (res.ok) {
          const data = await res.json();
          const results: IComment[] = data.results ?? data ?? [];
          setComments((prev) => (append ? [...prev, ...results] : results));
          setHasMore(!!data.next);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    },
    [slug],
  );

  useEffect(() => {
    fetchComments(1);
  }, [fetchComments]);

  const loadMore = useCallback(() => {
    const next = page + 1;
    setPage(next);
    fetchComments(next, true);
  }, [page, fetchComments]);

  const postComment = useCallback(
    async (content: string) => {
      if (!slug || !content.trim()) return;
      setSubmitting(true);
      try {
        const res = await fetch('/api/blog/post/comment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ post_slug: slug, content }),
        });
        if (res.ok) {
          setPage(1);
          await fetchComments(1);
        }
      } catch {
        // silent
      } finally {
        setSubmitting(false);
      }
    },
    [slug, fetchComments],
  );

  const postReply = useCallback(
    async (commentId: string, content: string) => {
      if (!commentId || !content.trim()) return;
      setSubmitting(true);
      try {
        const res = await fetch('/api/blog/post/comment/reply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ comment_id: commentId, content }),
        });
        if (res.ok) {
          setPage(1);
          await fetchComments(1);
        }
      } catch {
        // silent
      } finally {
        setSubmitting(false);
      }
    },
    [fetchComments],
  );

  const deleteComment = useCallback(async (commentId: string) => {
    try {
      const res = await fetch(`/api/blog/post/comment?comment_id=${commentId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      }
    } catch {
      // silent
    }
  }, []);

  const refetch = useCallback(() => {
    setPage(1);
    fetchComments(1);
  }, [fetchComments]);

  return {
    comments,
    loading,
    submitting,
    hasMore,
    loadMore,
    postComment,
    postReply,
    deleteComment,
    refetch,
  };
}
