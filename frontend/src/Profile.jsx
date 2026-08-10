import { useState } from "react";
import { updateMyProfile, uploadAvatar, lockCity, unlockCity } from "./api";

export default function Profile({ user, onUserUpdate }) {
  const [name, setName] = useState(user.name || "");
  const [country, setCountry] = useState(user.country || "");
  const [city, setCity] = useState(user.city || "");
  const [faculty, setFaculty] = useState(user.faculty || "");
  const [bio, setBio] = useState(user.bio || "");
  const [interests, setInterests] = useState((user.interests || []).join(", "));
  const [message, setMessage] = useState("");

  async function handleSave(e) {
    e.preventDefault();
    setMessage("");
    try {
      const list = interests.split(",").map((s) => s.trim()).filter(Boolean);
      await updateMyProfile({ name, country, city, faculty, bio, interests: list });
      await onUserUpdate();
      setMessage("Profil spremljen.");
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function handleLock() {
    if (!city.trim()) {
      setMessage("Prvo upisi grad.");
      return;
    }
    try {
      if (city !== user.city) await updateMyProfile({ city });
      await lockCity();
      await onUserUpdate();
      setMessage("Grad zakljucan.");
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function handleUnlock() {
    try {
      await unlockCity();
      await onUserUpdate();
      setMessage("Grad otkljucan.");
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function handleAvatar(e) {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await uploadAvatar(file);
      await onUserUpdate();
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <div className="box">
      <h1>Moj profil</h1>

      <div className="post-header">
        {user.profile_image_url ? (
          <div className="avatar avatar-big"><img src={user.profile_image_url} alt="" /></div>
        ) : (
          <div className="avatar avatar-big">{user.name.charAt(0).toUpperCase()}</div>
        )}
        <label>
          Promijeni sliku
          <input type="file" accept="image/*" onChange={handleAvatar} style={{ display: "block", marginTop: 8 }} />
        </label>
      </div>

      {message && <p>{message}</p>}

      <form onSubmit={handleSave}>
        <label>Ime</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />
        <label>Drzava</label>
        <input value={country} onChange={(e) => setCountry(e.target.value)} />
        <label>Grad Erasmusa</label>
        <input value={city} onChange={(e) => setCity(e.target.value)} disabled={user.city_locked} />
        {!user.city_locked && (
          <button type="button" onClick={handleLock}>Zakljucaj grad</button>
        )}
        {user.city_locked && (
          <button type="button" onClick={handleUnlock}>Otkljucaj grad</button>
        )}
        <label>Fakultet</label>
        <input value={faculty} onChange={(e) => setFaculty(e.target.value)} />
        <label>Opis</label>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
        <label>Interesi (zarezom)</label>
        <input value={interests} onChange={(e) => setInterests(e.target.value)} />
        <button type="submit">Spremi</button>
      </form>
    </div>
  );
}
