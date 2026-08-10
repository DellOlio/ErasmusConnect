import { useState } from "react";
import { Link } from "react-router-dom";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await onLogin(email, password);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="box center-box">
      <h1>Erasmus Connect</h1>
      <p>Prijava</p>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label>Lozinka</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Prijava</button>
      </form>
      <p>Nemas racun? <Link to="/register">Registracija</Link></p>
    </div>
  );
}
