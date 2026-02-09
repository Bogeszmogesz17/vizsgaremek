// ===============================
// FŐ ALKALMAZÁS + ROUTER
// ===============================

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

// ADMIN OLDALAK
import AdminSetup from "./pages/AdminSetup";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

// FELHASZNÁLÓ OLDALAK
import Account from "./pages/Account";
import Home from "./pages/Home";
import Services from "./pages/Services";
import Booking from "./pages/Booking";
import Contact from "./pages/Contact";
import Register from "./pages/Register";
import Login from "./pages/Login";

export default function App() {
  return (
    <BrowserRouter>
      {/* FONTOS: a layout maradhat, de a main NE NYELJE EL az oldalt */}
      <div className="min-h-screen bg-black text-white flex flex-col">

        {/* ---------- NAVBAR ---------- */}
        <Navbar />

        {/* ---------- OLDAL TARTALOM ---------- */}
        {/* ⬇️ EZ A SOR A KULCS */}
        <main className="flex-1">
          <Routes>
            {/* PUBLIC */}
            <Route path="/" element={<Home />} />
            <Route path="/szolgaltatasok" element={<Services />} />
            <Route path="/idopont" element={<Booking />} />
            <Route path="/kapcsolat" element={<Contact />} />
            <Route path="/regisztracio" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/fiok" element={<Account />} />

            {/* ADMIN */}
            <Route path="/admin-setup" element={<AdminSetup />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>

      </div>
    </BrowserRouter>
  );
}
