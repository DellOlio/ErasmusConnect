import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

function Avatar({ user, size = "md" }) {
  const sizes = { sm: "w-8 h-8", md: "w-10 h-10", lg: "w-24 h-24" };
  if (user.profile_image_url) {
    return (
      <img
        src={user.profile_image_url}
        alt={user.name}
        className={`${sizes[size]} rounded-full object-cover`}
      />
    );
  }
  return (
    <div
      className={`${sizes[size]} rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-semibold`}
    >
      {user.name.charAt(0).toUpperCase()}
    </div>
  );
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("hr-HR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PostCard({ post, onUpdate }) {
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [liked, setLiked] = useState(post.liked_by_me);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [loadingComments, setLoadingComments] = useState(false);

  const toggleLike = async () => {
    const res = await api.toggleLike(post.id);
    setLiked(res.liked);
    setLikesCount(res.likes_count);
  };

  const loadComments = async () => {
    setLoadingComments(true);
    const data = await api.getComments(post.id);
    setComments(data);
    setLoadingComments(false);
  };

  const toggleComments = async () => {
    if (!showComments && comments.length === 0) {
      await loadComments();
    }
    setShowComments(!showComments);
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const newComment = await api.addComment(post.id, commentText.trim());
    setComments([...comments, newComment]);
    setCommentText("");
    onUpdate?.();
  };

  return (
    <article className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 flex items-center gap-3">
        <Link to={`/users/${post.author.id}`}>
          <Avatar user={post.author} />
        </Link>
        <div>
          <Link
            to={`/users/${post.author.id}`}
            className="font-semibold hover:text-brand-600"
          >
            {post.author.name}
          </Link>
          <p className="text-xs text-gray-500">{formatDate(post.created_at)}</p>
        </div>
      </div>

      <div className="px-4 pb-3">
        <p className="whitespace-pre-wrap">{post.content}</p>
      </div>

      {post.image_url && (
        <img src={post.image_url} alt="" className="w-full max-h-96 object-cover" />
      )}

      <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-4">
        <button
          onClick={toggleLike}
          className={`flex items-center gap-1 text-sm ${
            liked ? "text-red-500" : "text-gray-500 hover:text-red-500"
          }`}
        >
          {liked ? "♥" : "♡"} {likesCount}
        </button>
        <button
          onClick={toggleComments}
          className="text-sm text-gray-500 hover:text-brand-600"
        >
          💬 {post.comments_count} komentara
        </button>
      </div>

      {showComments && (
        <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
          {loadingComments ? (
            <p className="text-sm text-gray-500 py-3">Učitavanje...</p>
          ) : (
            <div className="space-y-3 py-3">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-2">
                  <Avatar user={c.author} size="sm" />
                  <div className="bg-white rounded-lg px-3 py-2 flex-1 text-sm">
                    <span className="font-semibold">{c.author.name}</span>
                    <p>{c.content}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(c.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <form onSubmit={submitComment} className="flex gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Napiši komentar..."
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700"
            >
              Pošalji
            </button>
          </form>
        </div>
      )}
    </article>
  );
}
