import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    name: "",
    country: "",
    city: "",
    faculty: "",
    bio: "",
    interests: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        country: user.country || "",
        city: user.city || "",
        faculty: user.faculty || "",
        bio: user.bio || "",
        interests: (user.interests || []).join(", "),
      });
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await api.updateMe({
        name: form.name,
        country: form.country,
        city: form.city,
        faculty: form.faculty,
        bio: form.bio,
        interests: form.interests
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      await refreshUser();
      setMessage("Profil spremljen!");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await api.uploadAvatar(file);
      await refreshUser();
    } catch (err) {
      setMessage(err.message);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h1 className="text-xl font-bold mb-6">Moj profil</h1>

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
        <label className="cursor-pointer px-4 py-2 border border-brand-600 text-brand-600 rounded-lg text-sm hover:bg-brand-50">
          Promijeni sliku
          <input type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
        </label>
      </div>

      {message && (
        <p className={`mb-4 text-sm ${message.includes("spremljen") ? "text-green-600" : "text-red-600"}`}>
          {message}
        </p>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <Field label="Ime" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        <Field label="Država" value={form.country} onChange={(v) => setForm({ ...form, country: v })} />
        <Field label="Grad Erasmusa" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
        <Field label="Fakultet" value={form.faculty} onChange={(v) => setForm({ ...form, faculty: v })} />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kratki opis</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <Field
          label="Interesi (odvojeni zarezom)"
          value={form.interests}
          onChange={(v) => setForm({ ...form, interests: v })}
        />
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50"
        >
          {saving ? "Spremanje..." : "Spremi profil"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
      />
    </div>
  );
}
