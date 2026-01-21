// ===============================
// FŐ ALKALMAZÁS + ROUTER
// ===============================

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

// Oldalak importálása
import Home from "./pages/Home";
import Services from "./pages/Services";
import Booking from "./pages/Booking";
import Contact from "./pages/Contact";
import Register from "./pages/Register";
import Login from "./pages/Login";


export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-black text-white">

        {/* ---------- NAVBAR ---------- */}
        <Navbar />

        {/* ---------- OLDAL TARTALOM ---------- */}
        <main className="p-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/szolgaltatasok" element={<Services />} />
            <Route path="/idopont" element={<Booking />} />
            <Route path="/kapcsolat" element={<Contact />} />
            <Route path="/regisztracio" element={<Register />} />
            <Route path="/bejelentkezes" element={<Login />} />
          </Routes>
        </main>

      </div>
    </BrowserRouter>
  );
}
