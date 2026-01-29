import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [auth, setAuth] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost/vizsga/api/session_check.php", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => setAuth(data));
  }, []);

  const logout = async () => {
    await fetch("http://localhost/vizsga/api/logout.php", {
      credentials: "include"
    });
    setAuth({ loggedIn: false });
    navigate("/");
  };

  return (
    <nav className="bg-black border-b border-gray-800">
      <div className="flex items-center justify-between px-4 py-3">

        {/* LOGÓ */}
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-red-600 rounded-sm"></div>
          <span className="text-white font-bold text-lg">
            Autószerviz
          </span>
        </Link>

        {/* DESKTOP */}
        <div className="hidden md:flex items-center gap-8">
          <ul className="flex gap-6 text-gray-300">
            <li><Link to="/" className="hover:text-red-600">Főoldal</Link></li>
            <li><Link to="/szolgaltatasok" className="hover:text-red-600">Szolgáltatások</Link></li>
            <li><Link to="/idopont" className="hover:text-red-600">Időpontfoglalás</Link></li>
            <li><Link to="/kapcsolat" className="hover:text-red-600">Kapcsolat</Link></li>
          </ul>

          {/* AUTH */}
          {auth === null ? null : !auth.loggedIn ? (
            <div className="flex gap-4">
              <Link to="/login">Bejelentkezés</Link>
              <Link to="/regisztracio" className="bg-red-600 px-4 py-2 rounded">
                Regisztráció
              </Link>
            </div>
          ) : (
            <div className="flex gap-4 items-center">
              {auth.role === "admin" && (
                <Link to="/admin" className="text-red-500">Admin</Link>
              )}
              <Link to="/fiok">Fiókom</Link>
              <button
                onClick={logout}
                className="bg-red-600 px-4 py-2 rounded"
              >
                Kijelentkezés
              </button>
            </div>
          )}
        </div>

        {/* HAMBURGER */}
        <button
          className="text-white text-2xl md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>

      {/* MOBIL */}
      {menuOpen && (
        <div className="md:hidden bg-black border-t border-gray-800 text-gray-300">
          <ul>
            <li className="px-4 py-3"><Link to="/" onClick={() => setMenuOpen(false)}>Főoldal</Link></li>
            <li className="px-4 py-3"><Link to="/szolgaltatasok" onClick={() => setMenuOpen(false)}>Szolgáltatások</Link></li>
            <li className="px-4 py-3"><Link to="/idopont" onClick={() => setMenuOpen(false)}>Időpontfoglalás</Link></li>
            <li className="px-4 py-3"><Link to="/kapcsolat" onClick={() => setMenuOpen(false)}>Kapcsolat</Link></li>
          </ul>

          <div className="border-t border-gray-800">
            {!auth?.loggedIn ? (
              <>
                <Link to="/login" className="block px-4 py-3">Bejelentkezés</Link>
                <Link to="/regisztracio" className="block px-4 py-3 text-red-600">Regisztráció</Link>
              </>
            ) : (
              <>
                <Link to="/fiok" className="block px-4 py-3">Fiókom</Link>
                <button onClick={logout} className="block w-full text-left px-4 py-3 text-red-600">
                  Kijelentkezés
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
