import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "./logo.png";


export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [auth, setAuth] = useState(null);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const navigate = useNavigate();

  // SESSION ELLENŐRZÉS
  useEffect(() => {
    fetch("http://localhost/vizsga/api/session_check.php", {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => setAuth(data))
      .catch(() => setAuth({ loggedIn: false }));
  }, []);

  // LOGOUT
  const logout = async () => {

    await fetch("http://localhost/vizsga/api/logout.php", {
      credentials: "include",
    });

    setAuth({ loggedIn: false });

    setShowLogoutPopup(true);

  };

  return (
    <nav className="bg-black border-b border-gray-800">
      <div className="flex items-center justify-between px-6 py-3">

        {/* LOGÓ */}
        <Link to="/" className="flex items-center gap-3">
          <img
            src={logo}
            alt="Dupla dugattyú műhely logó"
            className="w-20 h-20 rounded-sm object-cover"
          />
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

          {/* AUTH RÉSZ */}
          {auth === null ? null : !auth.loggedIn ? (
            <div className="flex items-center gap-4">
              <Link to="/login">Bejelentkezés</Link>
              <Link
                to="/regisztracio"
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white"
              >
                Regisztráció
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">

              {/* ADMIN */}
              {auth.role === "admin" && (
                <Link
                  to="/admin"
                  className="text-red-500 font-semibold hover:underline"
                >
                  Admin felület
                </Link>
              )}

              {/* USER */}
              {auth.role === "user" && (
                <Link to="/fiok" className="hover:text-red-600">
                  Fiókom
                </Link>
              )}

              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white"
              >
                Kijelentkezés
              </button>
            </div>
          )}
        </div>

        {/* MOBIL TOGGLE */}
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
                    Admin felület
                  </Link>
                )}

                {auth.role === "user" && (
                  <Link to="/fiok" className="block px-6 py-3">
                    Fiókom
                  </Link>
                )}

                <button
                  type="button"
                  onClick={logout}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white"
                >
                  Kijelentkezés
                </button>
              </>
            )}
          </div>
        </div>
      )}
      {showLogoutPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999]">

          <div className="bg-green-600 p-8 rounded text-center max-w-sm w-full">

            <p className="text-white text-lg mb-6 font-semibold">
              Sikeres kijelentkezés
            </p>

            <button
              onClick={() => {
                setShowLogoutPopup(false);
                navigate("/");
              }}
              className="bg-black px-6 py-2 rounded text-white"
            >
              OK
            </button>

          </div>

        </div>
      )}
    </nav>
  );
}