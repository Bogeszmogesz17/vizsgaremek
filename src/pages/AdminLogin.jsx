import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [email, setEmail] = useState(""); // username megy bele
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Minden mező kitöltése kötelező");
      return;
    }

    try {
      const res = await fetch(
        "http://localhost/vizsga/api/admin_login.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            email,      // username megy bele
            password
          })
        }
      );

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Sikertelen bejelentkezés");
        return;
      }

      navigate("/admin");

    } catch {
      setError("Szerverhiba");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-gray-900 p-8 rounded text-white mt-20">
      <h1 className="text-3xl font-bold text-red-600 text-center mb-6">
        Admin bejelentkezés
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"   // ⬅️ EZ A KULCS
          placeholder="Admin felhasználónév"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 bg-black rounded border border-gray-700"
        />

        <input
          type="password"
          placeholder="Jelszó"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
