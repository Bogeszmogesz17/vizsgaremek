import { useState } from "react";
import { Link } from "react-router-dom";
import { apiUrl } from "../lib/api";

export default function Login() {

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

    try {
      const res = await fetch(apiUrl("/auth/login.php"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role, email, password })
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Sikertelen bejelentkezés");
        return;
      }

      if (role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/fiok";
      }

    } catch {
      setError("Szerverhiba");
    }
  };

  return (
    <div className="w-[calc(100%-1rem)] sm:w-full max-w-md mx-auto bg-gray-900 p-5 sm:p-8 rounded text-white mt-6 sm:mt-10">

      <h1 className="text-2xl sm:text-3xl font-bold text-red-600 text-center mb-6">
        Bejelentkezés
      </h1>

      <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-6">
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

      <p className="text-center text-gray-400 text-sm sm:text-base mt-4">
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
