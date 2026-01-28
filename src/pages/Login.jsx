import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

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
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // 👈 SESSION MIATT KELL
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();


      if (!data.success) {
        setError(data.message || "Hibás adatok");
        return;
      }

      // ✅ SIKERES BEJELENTKEZÉS
      setSuccess(true);

      setTimeout(() => {
        navigate("/"); // főoldal
      }, 1500);

    } catch {
      setError("Szerverhiba");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-gray-900 p-6 rounded-lg text-white">
      {/* CÍM */}
      <h1 className="text-3xl font-bold text-red-600 text-center">
        Bejelentkezés
      </h1>

      {/* ŰRLAP */}
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

      {/* HIBA */}
      {error && (
        <p className="text-red-500 text-sm mt-4 text-center">
          {error}
        </p>
      )}

      {/* SIKER */}
      {success && (
        <div className="mt-4 p-3 rounded bg-green-600 text-center">
          Sikeres bejelentkezés ✅
        </div>
      )}

      {/* REGISZTRÁCIÓ */}
      <p className="text-gray-400 text-sm mt-6 text-center">
        Nincs még fiókod?{" "}
        <Link to="/regisztracio" className="text-red-600 hover:underline">
          Regisztráció
        </Link>
      </p>
    </div>
  );
}
