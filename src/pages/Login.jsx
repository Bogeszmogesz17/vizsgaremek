import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Minden mező kitöltése kötelező");
      return;
    }

    const url =
      role === "admin"
        ? "http://localhost/vizsga/api/admin_login.php"
        : "http://localhost/vizsga/api/login.php";

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Sikertelen bejelentkezés");
        return;
      }

      // ✅ TELJES RELOAD → Navbar frissül
      if (role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/";
      }

    } catch {
      setError("Szerverhiba");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-gray-900 p-8 rounded text-white mt-10">

      <h1 className="text-3xl font-bold text-red-600 text-center mb-6">
        Bejelentkezés
      </h1>

      {/* ROLE VÁLASZTÓ */}
      <div className="flex justify-center gap-6 mb-6">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={role === "user"}
            onChange={() => setRole("user")}
          />
          Felhasználó
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={role === "admin"}
            onChange={() => setRole("admin")}
          />
          Szerelő
        </label>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="E-mail cím"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full p-3 bg-black rounded border border-gray-700"
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Jelszó"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-3 bg-black rounded border border-gray-700 pr-12"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700 p-3 rounded font-semibold"
        >
          Belépés
        </button>
      </form>

      <p className="text-center mt-3">
        <Link
          to="/forgot-password"
          className="text-sm text-gray-400 hover:text-red-500"
        >
          Elfelejtetted a jelszavad?
        </Link>
      </p>

      {/* JAVÍTOTT ROUTE */}
      <p className="text-center text-gray-400 mt-4">
        Még nem vagy regisztrálva?{" "}
        <Link
          to="/regisztracio"
          className="text-red-500 hover:text-red-400 font-semibold"
        >
          Regisztrálj itt
        </Link>
      </p>

      {error && (
        <p className="text-red-500 text-center mt-4">
          {error}
        </p>
      )}
    </div>
  );
}