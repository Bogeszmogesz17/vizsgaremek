// ===============================
// REGISZTRÁCIÓS OLDAL
// ===============================

import { Link } from "react-router-dom";

export default function Register() {
  return (
    <div className="max-w-md mx-auto bg-gray-900 p-6 rounded-lg">

      {/* ---------- CÍM ---------- */}
      <h1 className="text-3xl font-bold text-red-600 text-center">
        Regisztráció
      </h1>

      {/* ---------- ŰRLAP ---------- */}
      <form className="mt-6 space-y-4">

        {/* NÉV */}
        <input
          type="text"
          placeholder="Teljes név"
          className="w-full p-3 rounded bg-black border border-gray-700 text-white"
        />

        {/* EMAIL */}
        <input
          type="email"
          placeholder="E-mail cím"
          className="w-full p-3 rounded bg-black border border-gray-700 text-white"
        />

        {/* JELSZÓ */}
        <input
          type="password"
          placeholder="Jelszó"
          className="w-full p-3 rounded bg-black border border-gray-700 text-white"
        />

        {/* GOMB */}
        <button
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold p-3 rounded transition"
        >
          Regisztráció
        </button>
      </form>

      {/* ---------- ÁTLÉPÉS LOGINRA ---------- */}
      <p className="text-gray-400 text-sm mt-4 text-center">
        Már van fiókod?{" "}
        <Link to="/bejelentkezes" className="text-red-600 hover:underline">
          Bejelentkezés
        </Link>
      </p>

    </div>
  );
}
