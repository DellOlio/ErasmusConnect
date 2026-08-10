import { useState } from "react";
import { Link } from "react-router-dom";

export default function Register({ onRegister }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await onRegister(name, email, password);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="box center-box">
      <h1>Erasmus Connect</h1>
      <p>Registracija</p>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <label>Ime</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required />
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label>Lozinka</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        <button type="submit">Registracija</button>
      </form>
      <p>Imas racun? <Link to="/login">Prijava</Link></p>
    </div>
  );
}
