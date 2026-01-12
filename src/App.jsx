// ===============================
// FŐ ALKALMAZÁS KOMPONENS
// ===============================

import Navbar from "./components/Navbar";

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white">

      {/* ---------- NAVBAR ---------- */}
      <Navbar />

      {/* ---------- OLDAL TARTALOM ---------- */}
      <main className="p-6">
        <h1 className="text-3xl font-bold text-red-600">
          Autószerviz weboldal
        </h1>

        <p className="text-gray-400 mt-2">
          Ide kerül majd a tartalom
        </p>
      </main>

    </div>
  );
}
