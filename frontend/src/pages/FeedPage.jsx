import { useEffect, useState } from "react";
import { api } from "../api";
import PostCard from "../components/PostCard";

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  const loadPosts = () => {
    api
      .getPosts()
      .then(setPosts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(loadPosts, []);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setPosting(true);
    setError("");
    try {
      await api.createPost(content.trim(), image);
      setContent("");
      setImage(null);
      setPreview(null);
      loadPosts();
    } catch (err) {
      setError(err.message);
    } finally {
      setPosting(false);
    }
  };

  if (loading) return <p className="text-center text-gray-500">Učitavanje feeda...</p>;

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-200 p-4 space-y-3"
      >
        <h2 className="font-semibold text-lg">Nova objava</h2>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Podijeli svoje iskustvo Erasmusa..."
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
        />
        {preview && (
          <img src={preview} alt="Preview" className="rounded-lg max-h-48 object-cover" />
        )}
        <div className="flex items-center justify-between">
          <label className="cursor-pointer text-sm text-brand-600 hover:text-brand-700">
            📷 Dodaj sliku
            <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
          </label>
          <button
            type="submit"
            disabled={posting || !content.trim()}
            className="px-5 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
          >
            {posting ? "Objavljujem..." : "Objavi"}
          </button>
        </div>
      </form>

      {posts.length === 0 ? (
        <p className="text-center text-gray-500 py-10">
          Još nema objava. Budi prvi koji će nešto podijeliti!
        </p>
      ) : (
        posts.map((post) => (
          <PostCard key={post.id} post={post} onUpdate={loadPosts} />
        ))
      )}
    </div>
  );
}
