import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.searchUsers({ q, country, city });
      setResults(data);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSearch}
        className="bg-white rounded-xl border border-gray-200 p-4 space-y-3"
      >
        <h1 className="text-xl font-bold">Pretraga korisnika</h1>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ime..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Država..."
            className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Grad..."
            className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? "Pretražujem..." : "Pretraži"}
        </button>
      </form>

      {searched && results.length === 0 && (
        <p className="text-center text-gray-500">Nema rezultata.</p>
      )}

      <div className="space-y-3">
        {results.map((user) => (
          <Link
            key={user.id}
            to={`/users/${user.id}`}
            className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-4 hover:border-brand-300 transition"
          >
            {user.profile_image_url ? (
              <img
                src={user.profile_image_url}
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-gray-500">
                {[user.city, user.country].filter(Boolean).join(", ") || "Profil nije popunjen"}
              </p>
              {user.interests?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {user.interests.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
