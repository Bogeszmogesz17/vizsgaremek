import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { apiUrl } from "../lib/api";

export default function ResetPassword() {

  const [params] = useSearchParams();
  const navigate = useNavigate();

  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMsg("");
    setError("");

    if (!password || !password2) {
      setError("Minden mezőt ki kell tölteni");
      return;
    }

    if (password !== password2) {
      setError("A jelszavak nem egyeznek");
      return;
    }

    const res = await fetch(apiUrl("/auth/password-resets.php"), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        token,
        password
      })
    });

    const data = await res.json();

    if (!data.success) {
      setError(data.message);
      return;
    }

    setMsg(data.message);

    setTimeout(() => {
      navigate("/login");
    }, 2000);
  };

  return (
    <div className="max-w-md mx-auto bg-gray-900 p-8 rounded text-white mt-10">

      <h1 className="text-2xl font-bold text-red-600 mb-6 text-center">
        Új jelszó beállítása
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          type="password"
          placeholder="Új jelszó"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 bg-black rounded border border-gray-700"
        />

        <input
          type="password"
          placeholder="Új jelszó megerősítése"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          className="w-full p-3 bg-black rounded border border-gray-700"
        />

        <button
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700 p-3 rounded"
        >
          Jelszó módosítása
        </button>

      </form>

      {error && (
        <p className="text-red-500 text-center mt-4">
          {error}
        </p>
      )}

      {msg && (
        <p className="text-green-400 text-center mt-4">
          {msg}
        </p>
      )}

    </div>
  );
}
