import { Link, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-brand-600">
            Erasmus Connect
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/" className="text-gray-600 hover:text-brand-600">
              Feed
            </Link>
            <Link to="/search" className="text-gray-600 hover:text-brand-600">
              Pretraga
            </Link>
            <Link to="/profile" className="text-gray-600 hover:text-brand-600">
              Profil
            </Link>
            <button
              onClick={logout}
              className="text-gray-500 hover:text-red-600"
            >
              Odjava
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-2xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center py-20 text-gray-500">Učitavanje...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center py-20 text-gray-500">Učitavanje...</div>;
  if (user) return <Navigate to="/" replace />;
  return children;
}
