import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";

export default function UserProfilePage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getUser(id)
      .then(setUser)
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!user) return <p className="text-gray-500">Učitavanje...</p>;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-4 mb-6">
        {user.profile_image_url ? (
          <img
            src={user.profile_image_url}
            alt={user.name}
            className="w-24 h-24 rounded-full object-cover"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-3xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-gray-500">
            {[user.city, user.country].filter(Boolean).join(", ")}
          </p>
          {user.faculty && <p className="text-sm text-gray-600">{user.faculty}</p>}
        </div>
      </div>

      {user.bio && <p className="text-gray-700 mb-4">{user.bio}</p>}

      {user.interests?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {user.interests.map((tag) => (
            <span
              key={tag}
              className="text-sm bg-brand-50 text-brand-600 px-3 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
