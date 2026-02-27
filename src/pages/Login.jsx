import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState("user"); // user | admin
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

      // 👉 SIKERES BELÉPÉS
      if (role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
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
          type= "email"
          placeholder = "E-mail cím"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full p-3 bg-black rounded border border-gray-700"
        />


        <input
          type="password"
          placeholder="Jelszó"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full p-3 bg-black rounded border border-gray-700"
        />

        <button
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700 p-3 rounded font-semibold"
        >
          Belépés
        </button>
      </form>

      {error && (
        <p className="text-red-500 text-center mt-4">
          {error}
        </p>
      )}
    </div>
  );
}
