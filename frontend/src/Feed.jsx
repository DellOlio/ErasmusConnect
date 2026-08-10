import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPosts, createPost, toggleLike, getComments, addComment } from "./api";

function UserAvatar({ user }) {
  if (user.profile_image_url) {
    return (
      <div className="avatar">
        <img src={user.profile_image_url} alt={user.name} />
      </div>
    );
  }
  return <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>;
}

function Post({ post, onUpdate }) {
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [liked, setLiked] = useState(post.liked_by_me);
  const [likesCount, setLikesCount] = useState(post.likes_count);

  async function handleLike() {
    const result = await toggleLike(post.id);
    setLiked(result.liked);
    setLikesCount(result.likes_count);
  }

  async function handleComments() {
    if (!showComments && comments.length === 0) {
      const data = await getComments(post.id);
      setComments(data);
    }
    setShowComments(!showComments);
  }

  async function handleCommentSubmit(e) {
    e.preventDefault();
    if (!commentText.trim()) return;
    const newComment = await addComment(post.id, commentText.trim());
    setComments(comments.concat([newComment]));
    setCommentText("");
    onUpdate();
  }

  return (
    <div className="post">
      <div className="post-header">
        <Link to={"/users/" + post.author.id}><UserAvatar user={post.author} /></Link>
        <div>
          <Link to={"/users/" + post.author.id}><b>{post.author.name}</b></Link>
          <div style={{ fontSize: 12, color: "#666" }}>{new Date(post.created_at).toLocaleString("hr-HR")}</div>
        </div>
      </div>
      <p>{post.content}</p>
      {post.image_url && <img src={post.image_url} alt="" className="post-image" />}
      <p>
        <button type="button" className="link-btn" onClick={handleLike}>
          {liked ? "Svidja mi se" : "Like"} ({likesCount})
        </button>
        {" | "}
        <button type="button" className="link-btn" onClick={handleComments}>
          Komentari ({post.comments_count})
        </button>
      </p>
      {showComments && (
        <div className="comments">
          {comments.map(function (c) {
            return (
              <div key={c.id} className="comment">
                <b>{c.author.name}</b>: {c.content}
              </div>
            );
          })}
          <form onSubmit={handleCommentSubmit}>
            <input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Komentar..." />
            <button type="submit">Posalji</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function Feed({ activeCity, onUserUpdate }) {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");

  async function loadPosts() {
    const data = await getPosts(activeCity);
    setPosts(data);
  }

  useEffect(function () {
    loadPosts();
  }, [activeCity]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!content.trim()) return;
    setError("");
    try {
      await createPost(content.trim(), activeCity, image);
      setContent("");
      setImage(null);
      await onUserUpdate();
      await loadPosts();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="info">Feed za grad: <b>{activeCity}</b></div>

      <div className="box">
        <h2>Nova objava</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={3} placeholder="Tekst objave..." />
          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0] || null)} />
          <button type="submit">Objavi</button>
        </form>
      </div>

      {posts.length === 0 ? (
        <p>Nema objava za ovaj grad.</p>
      ) : (
        posts.map(function (post) {
          return <Post key={post.id} post={post} onUpdate={loadPosts} />;
        })
      )}
    </div>
  );
}
