import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "./logo.png";
import { apiUrl } from "../lib/api";
export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [auth, setAuth] = useState(null);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(apiUrl("/auth/session.php"), {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => setAuth(data))
      .catch(() => setAuth({ loggedIn: false }));
  }, []);

  const logout = async () => {
    await fetch(apiUrl("/auth/session.php"), {
      method: "DELETE",
      credentials: "include",
    });

    setAuth({ loggedIn: false });

    setShowLogoutPopup(true);

  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="bg-black border-b border-gray-800">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
        <Link to="/" className="flex items-center gap-2 sm:gap-3 min-w-0">
          <img
            src={logo}
            alt="Dupla dugattyú műhely logó"
            className="w-14 h-14 sm:w-20 sm:h-20 rounded-sm object-cover shrink-0"
          />
          <span className="text-white font-bold text-base sm:text-lg leading-tight truncate">
            Dupla dugattyú műhely
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-10">
          <ul className="flex items-center gap-6 text-gray-300">
            <li><Link to="/" className="hover:text-red-600">Főoldal</Link></li>
            <li><Link to="/szolgaltatasok" className="hover:text-red-600">Szolgáltatások</Link></li>
            <li><Link to="/idopont" className="hover:text-red-600">Időpontfoglalás</Link></li>
            <li><Link to="/kapcsolat" className="hover:text-red-600">Kapcsolat</Link></li>
          </ul>

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
              {auth.role === "admin" && (
                <Link
                  to="/admin"
                  className="text-red-500 font-semibold hover:underline"
                >
                  Admin felület
                </Link>
              )}

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

        <button
          className="text-white text-2xl md:hidden w-10 h-10 flex items-center justify-center"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Mobil menü megnyitása"
        >
          ☰
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-black border-t border-gray-800 text-gray-300">
          <ul>
            <li className="px-6 py-3"><Link to="/" onClick={closeMenu}>Főoldal</Link></li>
            <li className="px-6 py-3"><Link to="/szolgaltatasok" onClick={closeMenu}>Szolgáltatások</Link></li>
            <li className="px-6 py-3"><Link to="/idopont" onClick={closeMenu}>Időpontfoglalás</Link></li>
            <li className="px-6 py-3"><Link to="/kapcsolat" onClick={closeMenu}>Kapcsolat</Link></li>
          </ul>

          <div className="border-t border-gray-800">
            {!auth?.loggedIn ? (
              <>
                <Link to="/login" onClick={closeMenu} className="block px-6 py-3">Bejelentkezés</Link>
                <Link to="/regisztracio" onClick={closeMenu} className="block px-6 py-3 text-red-600">Regisztráció</Link>
              </>
            ) : (
              <div className="px-6 py-3 space-y-3">
                {auth.role === "admin" && (
                  <Link to="/admin" onClick={closeMenu} className="block text-red-500">
                    Admin felület
                  </Link>
                )}

                {auth.role === "user" && (
                  <Link to="/fiok" onClick={closeMenu} className="block">
                    Fiókom
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    logout();
                  }}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white w-full text-left"
                >
                  Kijelentkezés
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {showLogoutPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999]">
          <div className="bg-green-600 p-8 rounded text-center max-w-sm w-[calc(100%-1rem)] sm:w-full">

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
