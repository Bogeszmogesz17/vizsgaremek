// ===============================
// NAVBAR KOMPONENS
// Mobil-first navigációs sáv
// ===============================

import { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-black border-b border-gray-800">

      {/* ===============================
          FELSŐ SÁV
         =============================== */}
      <div className="flex items-center justify-between px-4 py-3">

        {/* ---------- LOGÓ ---------- */}
        <div className="flex items-center gap-3">
          {/* Logó hely */}
          <div className="w-9 h-9 bg-red-600 rounded-sm"></div>
          <span className="text-white font-bold text-lg">
            Autószerviz
          </span>
        </div>

        {/* ---------- MENÜ (DESKTOP) ---------- */}
        <div className="hidden md:flex items-center gap-8">

          {/* Oldal linkek */}
          <ul className="flex gap-6 text-gray-300">
            <li>
              <Link to="/" className="hover:text-red-600">
                Főoldal
              </Link>
            </li>
            <li>
              <Link to="/szolgaltatasok" className="hover:text-red-600">
                Szolgáltatások
              </Link>
            </li>
            <li>
              <Link to="/idopont" className="hover:text-red-600">
                Időpontfoglalás
              </Link>
            </li>
            <li>
              <Link to="/kapcsolat" className="hover:text-red-600">
                Kapcsolat
              </Link>
            </li>
          </ul>

          {/* Auth gombok */}
          {/* Auth gombok */}
          <div className="flex items-center gap-4">
            <Link
              to="/bejelentkezes"
              className="px-3 py-2 text-gray-300 hover:text-white"
            >
              Bejelentkezés
            </Link>


            <Link
              to="/regisztracio"
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
            >
              Regisztráció
            </Link>
          </div>
        </div>

        {/* ---------- HAMBURGER (MOBIL) ---------- */}
        <button
          className="text-white text-2xl md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>

      {/* ===============================
          MOBIL MENÜ
         =============================== */}
      {menuOpen && (
        <div className="md:hidden bg-black border-t border-gray-800 text-gray-300">

          {/* Oldal linkek */}
          <ul>
            <li className="px-4 py-3 hover:bg-gray-900">
              <Link to="/" onClick={() => setMenuOpen(false)}>
                Főoldal
              </Link>
            </li>
            <li className="px-4 py-3 hover:bg-gray-900">
              <Link to="/szolgaltatasok" onClick={() => setMenuOpen(false)}>
                Szolgáltatások
              </Link>
            </li>
            <li className="px-4 py-3 hover:bg-gray-900">
              <Link to="/idopont" onClick={() => setMenuOpen(false)}>
                Időpontfoglalás
              </Link>
            </li>
            <li className="px-4 py-3 hover:bg-gray-900">
              <Link to="/kapcsolat" onClick={() => setMenuOpen(false)}>
                Kapcsolat
              </Link>
            </li>
          </ul>

          {/* Auth linkek mobilon */}
          <div className="border-t border-gray-800">
            <Link
              to="/bejelentkezes"
              className="block px-4 py-3 hover:bg-gray-900"
              onClick={() => setMenuOpen(false)}
            >
              Bejelentkezés
            </Link>
            <Link
              to="/regisztracio"
              className="block px-4 py-3 text-red-600 hover:bg-gray-900"
              onClick={() => setMenuOpen(false)}
            >
              Regisztráció
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
