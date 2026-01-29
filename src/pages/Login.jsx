import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Minden mező kitöltése kötelező");
      return;
    }

    try {
      const res = await fetch("http://localhost/vizsga/api/login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Hibás belépési adatok");
        return;
      }

      // ✅ SIKERES LOGIN → FŐOLDAL
      navigate("/");

    } catch (err) {
      setError("Nem sikerült kapcsolódni a szerverhez");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-gray-900 p-6 rounded-lg text-white">
      <h1 className="text-3xl font-bold text-red-600 text-center">
        Bejelentkezés
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          type="email"
          placeholder="E-mail cím"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded bg-black border border-gray-700 text-white"
        />

        <input
          type="password"
          placeholder="Jelszó"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded bg-black border border-gray-700 text-white"
        />

        <button
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold p-3 rounded transition"
        >
          Bejelentkezés
        </button>
      </form>

      {error && (
        <p className="text-red-500 text-sm mt-4 text-center">
          {error}
        </p>
      )}

      <p className="text-gray-400 text-sm mt-6 text-center">
        Nincs még fiókod?{" "}
        <Link to="/regisztracio" className="text-red-600 hover:underline">
          Regisztráció
        </Link>
      </p>
    </div>
  );
}
