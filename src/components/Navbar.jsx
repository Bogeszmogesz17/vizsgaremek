import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [auth, setAuth] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost/vizsga/api/session_check.php", {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => setAuth(data))
      .catch(() => setAuth({ loggedIn: false }));
  }, []);

  const logout = async () => {
    await fetch("http://localhost/vizsga/api/logout.php", {
      credentials: "include",
    });
    setAuth({ loggedIn: false });
    navigate("/");
  };

  return (
    <nav className="bg-black border-b border-gray-800">
      <div className="flex items-center justify-between px-6 py-3">

        {/* LOGÓ */}
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-red-600 rounded-sm"></div>
          <span className="text-white font-bold text-lg">
            Dupla dugattyú műhely
          </span>
        </Link>

        {/* DESKTOP MENÜ */}
        <div className="hidden md:flex items-center gap-10">
          <ul className="flex items-center gap-6 text-gray-300">
            <li><Link to="/" className="hover:text-red-600">Főoldal</Link></li>
            <li><Link to="/szolgaltatasok" className="hover:text-red-600">Szolgáltatások</Link></li>
            <li><Link to="/idopont" className="hover:text-red-600">Időpontfoglalás</Link></li>
            <li><Link to="/kapcsolat" className="hover:text-red-600">Kapcsolat</Link></li>
          </ul>

          {/* AUTH */}
          {auth === null ? null : !auth.loggedIn ? (
            <div className="flex items-center gap-4">
              <Link to="/login" className="hover:text-white">
                Bejelentkezés
              </Link>
              <Link
                to="/regisztracio"
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white"
              >
                Regisztráció
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">

              {/* 👑 ADMIN GOMB */}
              {auth.role === "admin" && (
                <Link
                  to="/admin"
                  className="text-red-500 font-semibold hover:underline"
                >
                  Admin
                </Link>
              )}

              <Link to="/fiok" className="hover:text-red-600">
                Fiókom
              </Link>

              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white"
              >
                Kijelentkezés
              </button>
            </div>
          )}
        </div>

        {/* MOBIL HAMBURGER */}
        <button
          className="text-white text-2xl md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>

      {/* MOBIL MENÜ */}
      {menuOpen && (
        <div className="md:hidden bg-black border-t border-gray-800 text-gray-300">
          <ul>
            <li className="px-6 py-3"><Link to="/" onClick={() => setMenuOpen(false)}>Főoldal</Link></li>
            <li className="px-6 py-3"><Link to="/szolgaltatasok" onClick={() => setMenuOpen(false)}>Szolgáltatások</Link></li>
            <li className="px-6 py-3"><Link to="/idopont" onClick={() => setMenuOpen(false)}>Időpontfoglalás</Link></li>
            <li className="px-6 py-3"><Link to="/kapcsolat" onClick={() => setMenuOpen(false)}>Kapcsolat</Link></li>
          </ul>

          <div className="border-t border-gray-800">
            {!auth?.loggedIn ? (
              <>
                <Link to="/login" className="block px-6 py-3">Bejelentkezés</Link>
                <Link to="/regisztracio" className="block px-6 py-3 text-red-600">Regisztráció</Link>
              </>
            ) : (
              <>
                {auth.role === "admin" && (
                  <Link to="/admin" className="block px-6 py-3 text-red-500">
                    Admin
                  </Link>
                )}
                <Link to="/fiok" className="block px-6 py-3">Fiókom</Link>
                <button
                  onClick={logout}
                  className="block w-full text-left px-6 py-3 text-red-600"
                >
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
