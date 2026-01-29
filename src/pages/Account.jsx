import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Account() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost/vizsga/api/me.php", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        if (!data.success) {
          navigate("/bejelentkezes");
          return;
        }
        setUser(data.user);
      })
      .catch(() => setError("Nem sikerült betölteni az adatokat"));
  }, []);

  if (error) {
    return <p className="text-red-500 text-center">{error}</p>;
  }

  if (!user) {
    return <p className="text-center text-gray-400">Betöltés...</p>;
  }

  return (
    <div className="max-w-lg mx-auto bg-gray-900 p-8 rounded text-white">
      <h1 className="text-3xl font-bold text-red-600 mb-6 text-center">
        Fiókom
      </h1>

      <div className="space-y-3">
        <p><strong>Név:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p>
          <strong>Regisztráció:</strong>{" "}
          {new Date(user.created_at).toLocaleDateString()}
        </p>
      </div>

      <button
        onClick={() => {
          fetch("http://localhost/vizsga/api/logout.php", {
            credentials: "include"
          }).then(() => navigate("/"));
        }}
        className="mt-8 w-full bg-red-600 hover:bg-red-700 p-3 rounded font-semibold"
      >
        Kijelentkezés
      </button>
    </div>
  );
}
