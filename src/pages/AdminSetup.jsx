import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminSetup() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const res = await fetch(
      "http://localhost/vizsga/api/setup_admin.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      }
    );

    const data = await res.json();

    if (!data.success) {
      setError(data.message);
      return;
    }

    setSuccess("Admin sikeresen létrehozva!");
    setTimeout(() => navigate("/admin-login"), 1500);
  };

  // ⬇️⬇️⬇️ EZ HIÁNYZOTT ⬇️⬇️⬇️
  return (
    <div className="max-w-md mx-auto bg-gray-900 p-8 rounded text-white mt-20">
      <h1 className="text-2xl text-center mb-6 text-red-600">
        Első admin létrehozása
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full p-3 bg-black rounded"
          placeholder="Admin felhasználónév"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          className="w-full p-3 bg-black rounded"
          placeholder="Jelszó"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-red-600 p-3 rounded font-semibold">
          Admin létrehozása
        </button>
      </form>

      {error && <p className="text-red-400 mt-4">{error}</p>}
      {success && <p className="text-green-400 mt-4">{success}</p>}
    </div>
  );
}
