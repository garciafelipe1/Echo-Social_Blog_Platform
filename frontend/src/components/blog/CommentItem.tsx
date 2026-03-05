import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import moment from 'moment';
import { TrashIcon } from '@heroicons/react/24/outline';
import { mediaUrl } from '@/utils/mediaUrl';
import type { IComment } from '@/hooks/useComments';
import ReplyList from './ReplyList';

interface Props {
  comment: IComment;
  currentUser: string | undefined;
  onDelete: (id: string) => Promise<void>;
  onReply: (commentId: string, content: string) => Promise<void>;
  submitting: boolean;
  isReply?: boolean;
}

export default function CommentItem({
  comment,
  currentUser,
  onDelete,
  onReply,
  submitting,
  isReply = false,
}: Props) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    await onReply(comment.id, replyContent.trim());
    setReplyContent('');
    setReplyOpen(false);
  };

  const isOwner = currentUser === comment.user?.username;

  return (
    <div className="flex gap-2.5">
      <Link href={`/@/${comment.user?.username}/`} className="shrink-0">
        {comment.user?.profile_picture ? (
          <Image
            width={28}
            height={28}
            alt=""
            src={mediaUrl(comment.user.profile_picture)}
            className="h-7 w-7 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-[10px] font-semibold text-gray-500 dark:bg-dark-third dark:text-dark-txt-secondary">
            {comment.user?.username?.charAt(0)?.toUpperCase() || '?'}
          </span>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <div className="rounded-lg bg-gray-50 px-3 py-2 dark:bg-dark-second">
          <div className="flex items-center gap-1.5 text-xs">
            <Link
              href={`/@/${comment.user?.username}/`}
              className="font-semibold text-gray-900 hover:underline dark:text-dark-txt"
            >
              {comment.user?.first_name || comment.user?.username}
            </Link>
            <span className="text-gray-400 dark:text-dark-txt-secondary">
              {moment(comment.created_at).fromNow(true)}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-gray-700 dark:text-dark-txt">{comment.content}</p>
        </div>

        <div className="mt-1 flex items-center gap-3 pl-3 text-[11px] text-gray-400 dark:text-dark-txt-secondary">
          {!isReply && (
            <button
              type="button"
              onClick={() => setReplyOpen(!replyOpen)}
              className="font-medium hover:text-violet-600"
            >
              Responder
            </button>
          )}
          {isOwner && (
            <button
              type="button"
              onClick={() => onDelete(comment.id)}
              className="flex items-center gap-0.5 hover:text-red-500"
            >
              <TrashIcon className="h-3 w-3" /> Eliminar
            </button>
          )}
        </div>

        {replyOpen && (
          <div className="mt-2 flex gap-2 pl-3">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Escribe una respuesta..."
              rows={1}
              className="flex-1 resize-none rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-800 outline-none transition focus:border-violet-400 dark:border-dark-third dark:bg-dark-main dark:text-dark-txt"
            />
            <button
              type="button"
              onClick={handleReply}
              disabled={!replyContent.trim() || submitting}
              className="rounded-full bg-violet-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-violet-700 disabled:opacity-40"
            >
              Enviar
            </button>
          </div>
        )}

        {!isReply && comment.replies_count > 0 && (
          <ReplyList
            commentId={comment.id}
            repliesCount={comment.replies_count}
            currentUser={currentUser}
            onDeleteReply={onDelete}
            onPostReply={onReply}
            submitting={submitting}
          />
        )}
      </div>
    </div>
  );
}
