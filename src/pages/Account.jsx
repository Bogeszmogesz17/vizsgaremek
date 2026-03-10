import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Account() {

  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [bookings, setBookings] = useState([]);

  const [showEditForm, setShowEditForm] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editSettlementId, setEditSettlementId] = useState("");

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");

  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");

  // =====================
  // USER BETÖLTÉS
  // =====================
  useEffect(() => {

    fetch("http://localhost/vizsga/api/me.php", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {

        if (!data.success || !data.user) {
          navigate("/login");
          return;
        }

        setUser(data.user);

        setEditName(data.user.name || "");
        setEditEmail(data.user.email || "");
        setEditPhone(data.user.phone_number || "");
        setEditAddress(data.user.address || "");
        setEditSettlementId(data.user.settlement_id || "");

        setLoading(false);

      })
      .catch(() => {
        navigate("/login");
      });

  }, [navigate]);

  // =====================
  // FOGLALÁSOK BETÖLTÉSE
  // =====================
  useEffect(() => {

    fetch("http://localhost/vizsga/api/my_bookings.php", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {

        if (data.success) {
          setBookings(data.bookings);
        }

      });

  }, []);

  // =====================
  // FOGLALÁS LEMONDÁSA
  // =====================
  const cancelBooking = async (id) => {

    const res = await fetch("http://localhost/vizsga/api/cancel_booking.php", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        booking_id: id
      })
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.message);
      return;
    }

    setBookings(bookings.filter(b => b.id !== id));

  };

  // =====================
  // PROFIL FRISSÍTÉS
  // =====================
  const handleProfileUpdate = async () => {

    setMsg("");

    try {

      const res = await fetch(
        "http://localhost/vizsga/api/update_profile.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({
            name: editName,
            email: editEmail,
            phone_number: editPhone,
            address: editAddress,
            settlement_id: editSettlementId
          })
        }
      );

      const data = await res.json();

      if (!data.success) {
        setMsg(data.message || "Hiba történt");
        setMsgType("error");
        return;
      }

      setMsg("Profil frissítve");
      setMsgType("success");

      setUser({
        ...user,
        name: editName,
        email: editEmail,
        phone_number: editPhone,
        address: editAddress
      });

    } catch {

      setMsg("Szerverhiba");
      setMsgType("error");

    }

  };

  // =====================
  // JELSZÓ MÓDOSÍTÁS
  // =====================
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
          headers: {
            "Content-Type": "application/json"
          },
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

  if (loading) {
    return (
      <p className="text-center text-gray-400 mt-10">
        Betöltés...
      </p>
    );
  }

  return (

    <div className="max-w-lg mx-auto bg-gray-900 p-8 rounded text-white">

      <h1 className="text-3xl font-bold text-red-600 mb-6 text-center">
        Fiókom
      </h1>

      {/* PROFIL ADATOK */}

      <div className="space-y-2">

        <p><strong>Név:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Telefonszám:</strong> {user.phone_number}</p>
        <p><strong>Lakcím:</strong> {user.address}</p>
        <p><strong>Irányítószám:</strong> {user.post_code}</p>
        <p><strong>Település:</strong> {user.settlement_name}</p>

        <p>
          <strong>Regisztráció:</strong>{" "}
          {new Date(user.created_at).toLocaleDateString()}
        </p>

      </div>

      <hr className="my-6 border-gray-700" />

      {/* FOGLALÁSOK */}

      <h2 className="text-xl font-semibold mb-4">Időpont foglalásaim</h2>

      <button
        onClick={() => navigate("/idopont")}
        className="mb-4 w-full bg-red-600 hover:bg-red-700 p-3 rounded font-semibold"
      >
        Új időpont foglalása
      </button>

      {bookings.length === 0 && (
        <p className="text-gray-400">Nincs még foglalásod.</p>
      )}

      {bookings.map(b => (

        <div key={b.id} className="bg-gray-800 p-4 rounded mb-3 flex justify-between items-center">

          <div>
            <p className="font-semibold">{b.service_name}</p>
            <p className="text-sm text-gray-400">
              {b.appointment_date} {b.appointment_time}
            </p>
          </div>

          <button
            onClick={() => cancelBooking(b.id)}
            className="bg-red-700 hover:bg-red-800 px-3 py-1 rounded"
          >
            Lemondás
          </button>

        </div>

      ))}

      <hr className="my-6 border-gray-700" />

      {/* PROFIL MÓDOSÍTÁS */}

      <button
        onClick={() => setShowEditForm(!showEditForm)}
        className="w-full bg-gray-800 hover:bg-gray-700 p-3 rounded font-semibold"
      >
        {showEditForm ? "Profil módosítás elrejtése" : "Profil adatok módosítása"}
      </button>

      {showEditForm && (

        <div className="mt-6">

          <input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full mb-3 p-3 bg-black rounded"
            placeholder="Név"
          />

          <input
            value={editEmail}
            onChange={(e) => setEditEmail(e.target.value)}
            className="w-full mb-3 p-3 bg-black rounded"
            placeholder="Email"
          />

          <input
            value={editPhone}
            onChange={(e) => setEditPhone(e.target.value)}
            className="w-full mb-3 p-3 bg-black rounded"
            placeholder="Telefonszám"
          />

          <input
            value={editAddress}
            onChange={(e) => setEditAddress(e.target.value)}
            className="w-full mb-4 p-3 bg-black rounded"
            placeholder="Lakcím"
          />

          <button
            onClick={handleProfileUpdate}
            className="w-full bg-red-600 hover:bg-red-700 p-3 rounded font-semibold"
          >
            Adatok mentése
          </button>

        </div>

      )}

      <hr className="my-6 border-gray-700" />

      {/* JELSZÓ */}

      <button
        onClick={() => setShowPasswordForm(!showPasswordForm)}
        className="w-full bg-gray-800 hover:bg-gray-700 p-3 rounded font-semibold"
      >
        {showPasswordForm ? "Jelszó módosítás elrejtése" : "Jelszó módosítása"}
      </button>

      {showPasswordForm && (

        <div className="mt-6">

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

        </div>

      )}

      {msg && (
        <div className={`mt-4 p-3 rounded text-center ${msgType === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {msg}
        </div>
      )}

      <button
        onClick={async () => {

          await fetch("http://localhost/vizsga/api/logout.php", {
            credentials: "include"
          });

          navigate("/", { state: { message: "logout" } });


        }}
        className="mt-8 w-full bg-red-600 hover:bg-red-700 p-3 rounded font-semibold"
      >
        Kijelentkezés
      </button>

    </div>

  );
}