import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Account() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState(""); // success | error

  const navigate = useNavigate();

  // 🔐 SESSION CHECK + ADATOK
  useEffect(() => {
    fetch("http://localhost/vizsga/api/me.php", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        if (!data.success) {
          navigate("/login");
          return;
        }

        setUser(data.user);
        setLoading(false);
      })
      .catch(() => {
        navigate("/login");
      });
  }, []);

  // ⏳ BETÖLTÉS
  if (loading) {
    return (
      <p className="text-center text-gray-400 mt-10">
        Betöltés...
      </p>
    );
  }

  // 🔑 JELSZÓ MÓDOSÍTÁS
  const handlePasswordChange = async () => {
    setMsg("");

    if (!oldPassword || !newPassword || !newPassword2) {
      setMsg("Minden mezőt ki kell tölteni");
      setMsgType("error");
      return;
    }

    if (newPassword !== newPassword2) {
      setMsg("Az új jelszavak nem egyeznek");
      setMsgType("error");
      return;
    }

    try {
      const res = await fetch(
        "http://localhost/vizsga/api/change_password.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            old_password: oldPassword,
            new_password: newPassword
          })
        }
      );

      const data = await res.json();

      if (!data.success) {
        setMsg(data.message);
        setMsgType("error");
        return;
      }

      setMsg(data.message);
      setMsgType("success");

      setOldPassword("");
      setNewPassword("");
      setNewPassword2("");

    } catch {
      setMsg("Szerverhiba");
      setMsgType("error");
    }
  };

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

      <hr className="my-6 border-gray-700" />

      <button
        onClick={() => setShowPasswordForm(!showPasswordForm)}
        className="w-full bg-gray-800 hover:bg-gray-700 p-3 rounded font-semibold"
      >
        {showPasswordForm ? "Jelszó módosítás elrejtése" : "Jelszó módosítása"}
      </button>

      {showPasswordForm && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">
            Jelszó módosítása
          </h2>

          <input
            type="password"
            placeholder="Jelenlegi jelszó"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full mb-3 p-3 bg-black rounded"
          />

          <input
            type="password"
            placeholder="Új jelszó"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full mb-3 p-3 bg-black rounded"
          />

          <input
            type="password"
            placeholder="Új jelszó megerősítése"
            value={newPassword2}
            onChange={(e) => setNewPassword2(e.target.value)}
            className="w-full mb-4 p-3 bg-black rounded"
          />

          <button
            onClick={handlePasswordChange}
            className="w-full bg-red-600 hover:bg-red-700 p-3 rounded font-semibold"
          >
            Jelszó módosítása
          </button>

          {msg && (
            <div
              className={`mt-4 p-3 rounded text-center ${
                msgType === "success"
                  ? "bg-green-600"
                  : "bg-red-600"
              }`}
            >
              {msg}
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => {
          fetch("http://localhost/vizsga/api/logout.php", {
            credentials: "include"
          }).then(() => {
            window.location.href = "/";
          });
        }}
        className="mt-8 w-full bg-red-600 hover:bg-red-700 p-3 rounded font-semibold"
      >
        Kijelentkezés
      </button>
    </div>
  );
}
