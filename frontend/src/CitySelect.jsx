import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCities } from "./api";

const GRADOVI = [
  "Barcelona", "Berlin", "Budapest", "Lisbon", "Madrid",
  "Paris", "Prague", "Rome", "Vienna", "Zagreb",
];

export default function CitySelect({ user, onSelectCity }) {
  const navigate = useNavigate();
  const [cities, setCities] = useState(GRADOVI);
  const [selected, setSelected] = useState("");
  const [custom, setCustom] = useState("");

  useEffect(function () {
    if (user.city_locked && user.city) {
      navigate("/");
      return;
    }

    getCities().then(function (existing) {
      const all = [...new Set([...GRADOVI, ...existing])].sort();
      setCities(all);
      if (user.city) setSelected(user.city);
    });
  }, [user, navigate]);

  function handleSubmit(e) {
    e.preventDefault();
    const city = (custom.trim() || selected).trim();
    if (!city) return;
    onSelectCity(city);
    navigate("/");
  }

  return (
    <div className="box">
      <h1>Odaberi grad</h1>
      <p>Feed prikazuje objave za taj grad.</p>
      <form onSubmit={handleSubmit}>
        <div>
          {cities.map(function (city) {
            return (
              <button
                key={city}
                type="button"
                className={"city-btn" + (selected === city && !custom ? " selected" : "")}
                onClick={function () { setSelected(city); setCustom(""); }}
              >
                {city}
              </button>
            );
          })}
        </div>
        <label>Ili upisi grad:</label>
        <input
          value={custom}
          onChange={function (e) { setCustom(e.target.value); setSelected(""); }}
          placeholder="npr. Valencia"
        />
        <button type="submit" disabled={!custom.trim() && !selected}>Nastavi</button>
      </form>
    </div>
  );
}
