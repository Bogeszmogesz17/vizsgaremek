import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState("user"); // user | admin
  const [identifier, setIdentifier] = useState(""); // email vagy username
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!identifier || !password) {
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
        body: JSON.stringify({
          email: identifier, // adminnál is email kulcs, de username megy bele
          password
        })
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Hibás adatok");
        return;
      }

      // SIKER
      navigate(role === "admin" ? "/admin" : "/");

    } catch {
      setError("Szerverhiba");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-gray-900 p-6 rounded-lg text-white">
      <h1 className="text-3xl font-bold text-red-600 text-center">
        Bejelentkezés
      </h1>

      {/* ROLE VÁLASZTÓ */}
      <div className="flex justify-center gap-6 mt-6">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            value="user"
            checked={role === "user"}
            onChange={() => setRole("user")}
          />
          Felhasználó
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            value="admin"
            checked={role === "admin"}
            onChange={() => setRole("admin")}
          />
          Admin
        </label>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          type="text"
          placeholder={
            role === "admin"
              ? "Admin felhasználónév"
              : "E-mail cím"
          }
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
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
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold p-3 rounded"
        >
          Bejelentkezés
        </button>
      </form>

      {error && (
        <p className="text-red-500 text-sm mt-4 text-center">
          {error}
        </p>
      )}

      {role === "user" && (
        <p className="text-gray-400 text-sm mt-6 text-center">
          Nincs még fiókod?{" "}
          <Link to="/regisztracio" className="text-red-600 hover:underline">
            Regisztráció
          </Link>
        </p>
      )}
    </div>
  );
}
