// ===============================
// NAVBAR KOMPONENS
// Mobil-first navigációs sáv
// ===============================

import { useState } from "react";

export default function Navbar() {
  // -------------------------------
  // ÁLLAPOT: mobil menü nyitva/zárva
  // -------------------------------
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-black border-b border-gray-800">
      
      {/* ===============================
          FELSŐ SÁV (LOGÓ + HAMBURGER)
         =============================== */}
      <div className="flex items-center justify-between px-4 py-3">

        {/* ---------- LOGÓ HELYE ---------- */}
        <div className="flex items-center gap-3">
          {/* Ide kerül majd a valódi logó */}
          <div className="w-9 h-9 bg-red-600 rounded-sm"></div>

          <span className="text-white font-bold text-lg">
            Autószerviz
          </span>
        </div>

        {/* ---------- HAMBURGER MENÜ (MOBIL) ---------- */}
        <button
          className="text-white text-2xl md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>

        {/* ---------- MENÜ (DESKTOP) ---------- */}
        <ul className="hidden md:flex gap-6 text-gray-300">
          <li className="hover:text-red-600 cursor-pointer">Főoldal</li>
          <li className="hover:text-red-600 cursor-pointer">Szolgáltatások</li>
          <li className="hover:text-red-600 cursor-pointer">Időpontfoglalás</li>
          <li className="hover:text-red-600 cursor-pointer">Kapcsolat</li>
        </ul>
      </div>

      {/* ===============================
          MOBIL LENYÍLÓ MENÜü
         =============================== */}
      {menuOpen && (
        <ul className="md:hidden bg-black border-t border-gray-800 text-gray-300">
          <li className="px-4 py-3 hover:bg-gray-900">Főoldal</li>
          <li className="px-4 py-3 hover:bg-gray-900">Szolgáltatások</li>
          <li className="px-4 py-3 hover:bg-gray-900">Időpontfoglalás</li>
          <li className="px-4 py-3 hover:bg-gray-900">Kapcsolat</li>
        </ul>
      )}
    </nav>
  );
}
