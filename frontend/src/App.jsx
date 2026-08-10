import { useEffect, useState } from "react";
import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";
import * as api from "./api";
import Login from "./Login";
import Register from "./Register";
import CitySelect from "./CitySelect";
import Feed from "./Feed";
import Profile from "./Profile";
import Search from "./Search";
import UserProfile from "./UserProfile";

function Nav({ user, activeCity, onLogout }) {
  return (
    <nav>
      <Link to="/"><b>Erasmus Connect</b></Link>
      <div className="links">
        {activeCity && (
          user.city_locked ? (
            <span>{activeCity} (zakljucano)</span>
          ) : (
            <Link to="/select-city">{activeCity}</Link>
          )
        )}
        <Link to="/">Feed</Link>
        <Link to="/search">Pretraga</Link>
        <Link to="/profile">Profil</Link>
        <button className="link-btn" onClick={onLogout}>Odjava</button>
      </div>
    </nav>
  );
}

function Page({ user, activeCity, onLogout, children }) {
  return (
    <div>
      <Nav user={user} activeCity={activeCity} onLogout={onLogout} />
      <main>{children}</main>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [activeCity, setActiveCity] = useState(localStorage.getItem("activeCity") || "");
  const [ready, setReady] = useState(false);

  useEffect(function () {
    async function start() {
      const token = localStorage.getItem("token");
      if (!token) {
        setReady(true);
        return;
      }

      try {
        const profile = await api.getMyProfile();
        setUser(profile);
        if (profile.city_locked && profile.city) {
          setActiveCity(profile.city);
          localStorage.setItem("activeCity", profile.city);
        }
      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("activeCity");
      }

      setReady(true);
    }

    start();
  }, []);

  async function handleLogin(email, password) {
    const result = await api.login(email, password);
    localStorage.setItem("token", result.access_token);
    localStorage.removeItem("activeCity");
    setActiveCity("");

    const profile = await api.getMyProfile();
    setUser(profile);

    if (profile.city_locked && profile.city) {
      setActiveCity(profile.city);
      localStorage.setItem("activeCity", profile.city);
    }
  }

  async function handleRegister(name, email, password) {
    await api.register(name, email, password);
    await handleLogin(email, password);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("activeCity");
    setUser(null);
    setActiveCity("");
  }

  function handleSelectCity(city) {
    localStorage.setItem("activeCity", city);
    setActiveCity(city);
  }

  async function handleUserUpdate() {
    const profile = await api.getMyProfile();
    setUser(profile);
    if (profile.city_locked && profile.city) {
      setActiveCity(profile.city);
      localStorage.setItem("activeCity", profile.city);
    }
  }

  function hasCity() {
    if (user.city_locked && user.city) return true;
    return activeCity !== "";
  }

  if (!ready) {
    return <p style={{ textAlign: "center", marginTop: 50 }}>Ucitavanje...</p>;
  }

  function loggedInPage(renderPage) {
    if (!user) return <Navigate to="/login" replace />;
    if (!hasCity()) return <Navigate to="/select-city" replace />;
    return (
      <Page user={user} activeCity={activeCity} onLogout={handleLogout}>
        {renderPage(user)}
      </Page>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          user ? <Navigate to={hasCity() ? "/" : "/select-city"} replace /> : <Login onLogin={handleLogin} />
        } />
        <Route path="/register" element={
          user ? <Navigate to={hasCity() ? "/" : "/select-city"} replace /> : <Register onRegister={handleRegister} />
        } />
        <Route path="/select-city" element={
          !user ? <Navigate to="/login" replace /> : (
            <Page user={user} activeCity={activeCity} onLogout={handleLogout}>
              <CitySelect user={user} onSelectCity={handleSelectCity} />
            </Page>
          )
        } />
        <Route path="/" element={loggedInPage(function () {
          return <Feed activeCity={activeCity} onUserUpdate={handleUserUpdate} />;
        })} />
        <Route path="/profile" element={loggedInPage(function (u) {
          return <Profile user={u} onUserUpdate={handleUserUpdate} />;
        })} />
        <Route path="/search" element={loggedInPage(function () {
          return <Search />;
        })} />
        <Route path="/users/:id" element={loggedInPage(function () {
          return <UserProfile />;
        })} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
