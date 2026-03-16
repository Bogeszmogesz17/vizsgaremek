import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";

import AdminSetup from "./pages/AdminSetup";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProfile from "./pages/AdminProfile";
import AdminVehicleHistory from "./pages/AdminVehicleHistory";

import Account from "./pages/Account";
import Home from "./pages/Home";
import Services from "./pages/Services";
import Booking from "./pages/Booking";
import Contact from "./pages/Contact";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Footer from "./pages/Footer";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
function AppContent() {
  const location = useLocation();
  const hideNavbar = ["/admin", "/admin/profil", "/admin/auto-eloelet"].includes(location.pathname);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {!hideNavbar && <Navbar />}

      <main className="flex-1 px-3 sm:px-5 lg:px-8 py-5 sm:py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/szolgaltatasok" element={<Services />} />
          <Route path="/idopont" element={<Booking />} />
          <Route path="/kapcsolat" element={<Contact />} />
          <Route path="/regisztracio" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/fiok" element={<Account />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/admin-setup" element={<AdminSetup />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/profil" element={<AdminProfile />} />
          <Route path="/admin/auto-eloelet" element={<AdminVehicleHistory />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
