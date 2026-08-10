import { useState } from "react";
import { Link } from "react-router-dom";
import { searchUsers } from "./api";

export default function Search() {
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [results, setResults] = useState([]);
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const data = await searchUsers(name, country, city);
    setResults(data);
    setDone(true);
  }

  return (
    <div>
      <div className="box">
        <h1>Pretraga</h1>
        <form onSubmit={handleSubmit}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ime" />
          <div className="grid-2">
            <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Drzava" />
            <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Grad" />
          </div>
          <button type="submit">Trazi</button>
        </form>
      </div>

      {done && results.length === 0 && <p>Nema rezultata.</p>}

      {results.map(function (u) {
        return (
          <Link key={u.id} to={"/users/" + u.id} className="user-row">
            {u.profile_image_url ? (
              <div className="avatar"><img src={u.profile_image_url} alt="" /></div>
            ) : (
              <div className="avatar">{u.name.charAt(0).toUpperCase()}</div>
            )}
            <div>
              <b>{u.name}</b>
              <div>{u.city}{u.country ? ", " + u.country : ""}</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
