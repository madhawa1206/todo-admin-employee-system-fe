import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { HiMenu, HiX } from 'react-icons/hi';

export default function Header() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <header className="bg-indigo-600 text-white py-4 shadow">
      <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">
          <Link to="/">Task Tracker</Link>
        </h1>

        <nav className="hidden md:flex space-x-4 text-sm items-center">
          <Link to="/" className="hover:underline">
            Dashboard
          </Link>
          <Link to="/tasks" className="hover:underline">
            Tasks
          </Link>
          {user?.role === 'admin' && (
            <>
              <Link to="/users" className="hover:underline">
                Users
              </Link>
              <Link to="/analytics" className="hover:underline">
                Analytics
              </Link>
            </>
          )}
          <button onClick={handleLogout} className="hover:underline">
            Logout
          </button>
        </nav>

        <button className="md:hidden text-white text-2xl focus:outline-none" onClick={toggleMenu}>
          {menuOpen ? <HiX /> : <HiMenu />}
        </button>
      </div>
      {menuOpen && (
        <div className="md:hidden px-4 mt-2 space-y-2 text-sm bg-indigo-700 pb-4">
          <Link to="/" className="block hover:underline" onClick={() => setMenuOpen(false)}>
            Dashboard
          </Link>
          <Link to="/tasks" className="block hover:underline" onClick={() => setMenuOpen(false)}>
            Tasks
          </Link>
          {user?.role === 'admin' && (
            <>
              <Link
                to="/users"
                className="block hover:underline"
                onClick={() => setMenuOpen(false)}
              >
                Users
              </Link>
              <Link
                to="/analytics"
                className="block hover:underline"
                onClick={() => setMenuOpen(false)}
              >
                Analytics
              </Link>
            </>
          )}
          <button onClick={handleLogout} className="block hover:underline mt-2">
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
