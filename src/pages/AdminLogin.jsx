import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
        const res = await fetch("http://localhost/vizsga/api/admin_login.php", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include", // 🔴 EZ KELL A SESSIONHÖZ
            body: JSON.stringify({
              email,
              password
            })
          });
          
      

      const data = await res.json();

      if (!data.success) {
        setMessage(data.message || "Hibás adatok");
        return;
      }

      // ✅ SIKERES ADMIN LOGIN
      navigate("/admin");

    } catch (err) {
      setMessage("Szerverhiba");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="bg-gray-900 p-8 rounded-lg w-full max-w-md border border-gray-800">
        <h1 className="text-3xl font-bold text-red-600 text-center mb-6">
          Admin bejelentkezés
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Admin e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded bg-black border border-gray-700"
          />

          <input
            type="password"
            placeholder="Jelszó"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded bg-black border border-gray-700"
          />

          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 p-3 rounded font-semibold"
          >
            Bejelentkezés
          </button>
        </form>

        {message && (
          <div className="mt-4 text-center text-red-500 font-semibold">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
