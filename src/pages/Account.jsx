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

  const [confirmCancelId, setConfirmCancelId] = useState(null);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");

  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");

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

        setLoading(false);

      })
      .catch(() => navigate("/login"));

  }, [navigate]);

  useEffect(() => {

    fetch("http://localhost/vizsga/api/my_bookings.php", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setBookings(data.bookings);
      });

  }, []);

  const cancelBooking = async (id) => {

    const res = await fetch("http://localhost/vizsga/api/cancel_booking.php", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ booking_id: id })
    });

    const data = await res.json();

    if (!data.success) {
      setMsg(data.message);
      setMsgType("error");
      return;
    }

    setBookings(bookings.filter(b => b.id !== id));

    setMsg("Sikeres lemondás, emailben tájékoztatjuk a szervizt!");
    setMsgType("success");
  };

  const handleProfileUpdate = async () => {

    try {

      const res = await fetch(
        "http://localhost/vizsga/api/update_profile.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name: editName,
            email: editEmail,
            phone_number: editPhone,
            address: editAddress
          })
        }
      );

      const data = await res.json();

      if (!data.success) {
        setMsg(data.message);
        setMsgType("error");
        return;
      }

      setUser({
        ...user,
        name: editName,
        email: editEmail,
        phone_number: editPhone,
        address: editAddress
      });

      setMsg("Profil frissítve");
      setMsgType("success");

    } catch {
      setMsg("Szerverhiba");
      setMsgType("error");
    }

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

  if (loading) {
    return <p className="text-center text-gray-400 mt-10">Betöltés...</p>;
  }

  return (

<div className="max-w-6xl mx-auto px-4 text-white">

<h1 className="text-3xl font-bold text-red-600 mb-8 text-center">
Fiókom
</h1>

<div className="grid md:grid-cols-2 gap-8 items-start">

<div className="bg-gray-900 p-6 rounded-xl shadow">

<h2 className="text-xl font-semibold mb-4 text-red-500">
Profil adatok
</h2>

<p><strong>Név:</strong> {user.name}</p>
<p><strong>Email:</strong> {user.email}</p>
<p><strong>Telefon:</strong> {user.phone_number}</p>
<p><strong>Lakcím:</strong> {user.address}</p>

<button
onClick={() => setShowEditForm(!showEditForm)}
className="mt-6 w-full bg-red-600 hover:bg-red-700 p-3 rounded"
>
Profil módosítása
</button>

</div>

<div className="bg-gray-900 p-6 rounded-xl shadow">

<h2 className="text-xl font-semibold mb-4 text-red-500">
Időpont foglalásaim
</h2>

<button
onClick={() => navigate("/idopont")}
className="mb-4 w-full bg-red-600 hover:bg-red-700 p-3 rounded"
>
Új időpont foglalása
</button>

{bookings.length === 0 && (
<p className="text-gray-400">Nincs még foglalásod.</p>
)}

{bookings.map(b => (

<div key={b.id} className="bg-gray-800 p-4 rounded-lg mb-3 flex justify-between">

<div>
<p className="font-semibold">{b.service_name}</p>
<p className="text-sm text-gray-400">
{b.appointment_date} {b.appointment_time}
</p>
</div>

<button
onClick={() => setConfirmCancelId(b.id)}
className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded"
>
Lemondás
</button>

</div>

))}

</div>

</div>

{showEditForm && (

<div className="bg-gray-900 p-6 rounded-xl shadow mt-8 max-w-xl mx-auto">

<h2 className="text-xl font-semibold mb-4 text-red-500">
Profil módosítása
</h2>

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
className="w-full bg-red-600 hover:bg-red-700 p-3 rounded"
>
Adatok mentése
</button>

</div>

)}

<div className="bg-gray-900 p-6 rounded-xl shadow mt-8 max-w-xl mx-auto">

<button
onClick={() => setShowPasswordForm(!showPasswordForm)}
className="w-full bg-gray-800 hover:bg-gray-700 p-3 rounded"
>
Jelszó módosítása
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
className="w-full bg-red-600 hover:bg-red-700 p-3 rounded"
>
Jelszó módosítása
</button>

</div>

)}

</div>

{msg && (
<div className={`mt-6 p-4 rounded text-center max-w-xl mx-auto ${msgType === "success" ? "bg-green-600" : "bg-red-600"}`}>
{msg}
</div>
)}

{confirmCancelId && (

<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60">

<div className="bg-gray-900 p-6 rounded text-center w-80">

<p className="mb-6 text-lg">
Biztosan le szeretnéd mondani az időpontot?
</p>

<div className="flex gap-4 justify-center">

<button
onClick={() => {
cancelBooking(confirmCancelId);
setConfirmCancelId(null);
}}
className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
>
Igen
</button>

<button
onClick={() => setConfirmCancelId(null)}
className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
>
Mégse
</button>

</div>

</div>

</div>

)}

</div>

);
} 