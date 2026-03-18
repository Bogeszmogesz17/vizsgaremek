import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../lib/api";

export default function Account() {

  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [bookings, setBookings] = useState([]);

  const [showEditForm, setShowEditForm] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editPostalCode, setEditPostalCode] = useState("");
  const [editSettlementName, setEditSettlementName] = useState("");
  const [editSettlementId, setEditSettlementId] = useState("");
  const [editAddress, setEditAddress] = useState("");

  const [confirmCancelId, setConfirmCancelId] = useState(null);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");

  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");

  useEffect(() => {

    fetch(apiUrl("/users/me.php"), {
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
        setEditPostalCode(data.user.post_code || "");
        setEditSettlementName(data.user.settlement_name || "");
        setEditSettlementId(data.user.settlement_id ? String(data.user.settlement_id) : "");
        setEditAddress(data.user.address || "");

        setLoading(false);

      })
      .catch(() => navigate("/login"));

  }, [navigate]);

  useEffect(() => {
    if (editPostalCode.length !== 4) {
      return;
    }

    fetch(apiUrl(`/catalog/settlements.php?post_code=${editPostalCode}`))
      .then(res => res.json())
      .then(data => {
        if (!data.success) {
          setEditSettlementName("");
          setEditSettlementId("");
          return;
        }

        setEditSettlementName(data.settlement.settlement_name);
        setEditSettlementId(String(data.settlement.id));
      })
      .catch(() => {
        setEditSettlementName("");
        setEditSettlementId("");
      });
  }, [editPostalCode]);

  useEffect(() => {

    fetch(apiUrl("/bookings/index.php"), {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setBookings(data.bookings);
      });

  }, []);

  const cancelBooking = async (id) => {

    const res = await fetch(apiUrl(`/bookings/item.php?id=${id}`), {
      method: "DELETE",
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
        apiUrl("/users/me.php"),
        {
          method: "PATCH",

          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name: editName,
            email: editEmail,
            phone_number: editPhone,
            settlement_id: editSettlementId,
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
        post_code: editPostalCode,
        settlement_name: editSettlementName,
        settlement_id: editSettlementId,
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
        apiUrl("/users/password.php"),
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            old_password: oldPassword,
            new_password: newPassword,
            confirm_password: newPassword2
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

<div className="max-w-6xl mx-auto text-white">

<h1 className="text-2xl sm:text-3xl font-bold text-red-600 mb-6 sm:mb-8 text-center">
Fiókom
</h1>

<div className="grid md:grid-cols-2 gap-6 sm:gap-8 items-start">

<div className="bg-gray-900 p-4 sm:p-6 rounded-xl shadow">

<h2 className="text-xl font-semibold mb-4 text-red-500">
Profil adatok
</h2>

<p><strong>Név:</strong> {user.name}</p>
<p><strong>Email:</strong> {user.email}</p>
<p><strong>Telefon:</strong> {user.phone_number}</p>
<p><strong>Irányítószám:</strong> {user.post_code}</p>
<p><strong>Település:</strong> {user.settlement_name}</p>
<p><strong>Lakcím:</strong> {user.address}</p>

<button
onClick={() => setShowEditForm(!showEditForm)}
className="mt-6 w-full bg-red-600 hover:bg-red-700 p-3 rounded"
>
Profil módosítása
</button>

</div>

<div className="bg-gray-900 p-4 sm:p-6 rounded-xl shadow">

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
<div key={b.id} className="bg-gray-800 p-4 rounded-lg mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
<div className="min-w-0">
<p className="font-semibold">{b.service_name}</p>
<p className="text-sm text-gray-400 break-words">
{b.appointment_date} {b.appointment_time}
</p>
</div>

<button
onClick={() => setConfirmCancelId(b.id)}
className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded w-full sm:w-auto"
>
Lemondás
</button>

</div>

))}

</div>

</div>

{showEditForm && (

<div className="bg-gray-900 p-4 sm:p-6 rounded-xl shadow mt-8 max-w-xl mx-auto">

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
value={editPostalCode}
onChange={(e) => {
  const nextPostalCode = e.target.value;
  setEditPostalCode(nextPostalCode);
  if (nextPostalCode.length !== 4) {
    setEditSettlementName("");
    setEditSettlementId("");
  }
}}
className="w-full mb-3 p-3 bg-black rounded"
placeholder="Irányítószám"
/>

<input
value={editSettlementName}
disabled
className="w-full mb-3 p-3 bg-gray-800 rounded text-gray-400"
placeholder="Település"
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

<div className="bg-gray-900 p-4 sm:p-6 rounded-xl shadow mt-8 max-w-xl mx-auto">

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
onClick={handlePasswordChange}
className="w-full bg-red-600 hover:bg-red-700 p-3 rounded"
>
Jelszó módosítása
</button>

</div>

)}

</div>

{msg && (
<div className={`mt-6 p-4 rounded text-center max-w-xl mx-auto break-words ${msgType === "success" ? "bg-green-600" : "bg-red-600"}`}>
{msg}
</div>
)}

{confirmCancelId && (

<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">

<div className="bg-gray-900 p-5 sm:p-6 rounded text-center w-[calc(100%-1rem)] max-w-sm">

<p className="mb-6 text-lg">
Biztosan le szeretnéd mondani az időpontot?
</p>

<div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">

<button
onClick={() => {
cancelBooking(confirmCancelId);
setConfirmCancelId(null);
}}
className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded w-full sm:w-auto"
>
Igen
</button>

<button
onClick={() => setConfirmCancelId(null)}
className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded w-full sm:w-auto"
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
