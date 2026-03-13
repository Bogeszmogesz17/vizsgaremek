import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../lib/api";

export default function AdminProfile() {
  const navigate = useNavigate();
  const logout = async () => {
    try {
      await fetch(apiUrl("/auth/session.php"), {
        method: "DELETE",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      navigate("/admin-login", { state: { logoutSuccess: true } });
    }
  };
  const [loading, setLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");
  const [adminProfile, setAdminProfile] = useState({
    name: "",
    email: "",
    phone_number: "",
    address: "",
  });

  const loadAdminProfile = useCallback(async () => {
    try {
      const res = await fetch(apiUrl("/users/me.php"), {
        credentials: "include",
      });
      const data = await res.json();

      if (!data.success || !data.user) {
        navigate("/admin-login");
        return;
      }

      setAdminProfile({
        name: data.user.name || "",
        email: data.user.email || "",
        phone_number: data.user.phone_number || "",
        address: data.user.address || "",
      });
    } catch (err) {
      console.error("Admin profile load error:", err);
      navigate("/admin-login");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const saveAdminProfile = async () => {
    if (
      !adminProfile.name ||
      !adminProfile.email ||
      !adminProfile.phone_number ||
      !adminProfile.address
    ) {
      setMsg("Minden mező kitöltése kötelező");
      setMsgType("error");
      return;
    }

    setProfileSaving(true);
    try {
      const res = await fetch(apiUrl("/users/me.php"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(adminProfile),
      });

      const data = await res.json();

      if (!data.success) {
        setMsg(data.message || "A mentés nem sikerült");
        setMsgType("error");
        setProfileSaving(false);
        return;
      }

      setMsg("Admin profil frissítve");
      setMsgType("success");
      await loadAdminProfile();
    } catch (err) {
      console.error("Admin profile save error:", err);
      setMsg("Szerverhiba");
      setMsgType("error");
    }
    setProfileSaving(false);
  };

  const handlePasswordChange = async () => {
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
      const res = await fetch(apiUrl("/users/password.php"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
          confirm_password: newPassword2,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setMsg(data.message || "Sikertelen jelszómódosítás");
        setMsgType("error");
        return;
      }

      setMsg(data.message || "Jelszó sikeresen módosítva");
      setMsgType("success");
      setOldPassword("");
      setNewPassword("");
      setNewPassword2("");
      setShowPasswordForm(false);
    } catch (err) {
      console.error("Admin password change error:", err);
      setMsg("Szerverhiba");
      setMsgType("error");
    }
  };

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch(apiUrl("/admin/session.php"), {
          credentials: "include",
        });
        const data = await res.json();

        if (!data.success) {
          navigate("/admin-login");
          return;
        }

        await loadAdminProfile();
      } catch (err) {
        console.error("Admin check error:", err);
        navigate("/admin-login");
      }
    };

    checkAdmin();
  }, [loadAdminProfile, navigate]);

  if (loading) {
    return <p className="text-center text-gray-400 mt-10">Betöltés...</p>;
  }

  return (
    <div className="max-w-2xl mx-auto mt-6 sm:mt-10 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-red-600">Admin profil</h1>
        <div className="flex gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => navigate("/admin")}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm sm:text-base"
          >
            Vissza az admin felületre
          </button>
          <button
            type="button"
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm sm:text-base"
          >
            Kijelentkezés
          </button>
        </div>
      </div>

      <div className="bg-gray-900 p-4 sm:p-6 rounded-xl shadow">
        <input
          value={adminProfile.name}
          onChange={(e) => setAdminProfile((prev) => ({ ...prev, name: e.target.value }))}
          className="w-full mb-3 p-3 bg-black rounded"
          placeholder="Név"
        />

        <input
          value={adminProfile.email}
          onChange={(e) => setAdminProfile((prev) => ({ ...prev, email: e.target.value }))}
          className="w-full mb-3 p-3 bg-black rounded"
          placeholder="Email"
        />

        <input
          value={adminProfile.phone_number}
          onChange={(e) => setAdminProfile((prev) => ({ ...prev, phone_number: e.target.value }))}
          className="w-full mb-3 p-3 bg-black rounded"
          placeholder="Telefonszám"
        />

        <input
          value={adminProfile.address}
          onChange={(e) => setAdminProfile((prev) => ({ ...prev, address: e.target.value }))}
          className="w-full mb-4 p-3 bg-black rounded"
          placeholder="Lakcím"
        />

        <button
          onClick={saveAdminProfile}
          disabled={profileSaving}
          className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 p-3 rounded"
        >
          {profileSaving ? "Mentés..." : "Adatok mentése"}
        </button>
      </div>

      <div className="bg-gray-900 p-4 sm:p-6 rounded-xl shadow mt-8">
        <button
          type="button"
          onClick={() => setShowPasswordForm(!showPasswordForm)}
          className="w-full bg-gray-800 hover:bg-gray-700 p-3 rounded"
        >
          Jelszó módosítása
        </button>

        {showPasswordForm && (
          <div className="mt-6">
            <input
              type="password"
              placeholder="Régi jelszó"
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
              placeholder="Jelszó megerősítés"
              value={newPassword2}
              onChange={(e) => setNewPassword2(e.target.value)}
              className="w-full mb-4 p-3 bg-black rounded"
            />

            <button
              type="button"
              onClick={handlePasswordChange}
              className="w-full bg-red-600 hover:bg-red-700 p-3 rounded"
            >
              Jelszó módosítása
            </button>
          </div>
        )}
      </div>

      {msg && (
        <div
          className={`mt-6 p-4 rounded text-center break-words ${
            msgType === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {msg}
        </div>
      )}
    </div>
  );
}
