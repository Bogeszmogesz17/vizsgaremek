import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [settlementName, setSettlementName] = useState("");
  const [settlementId, setSettlementId] = useState("");

  const [settlements, setSettlements] = useState([]);
  const [selectedSettlement, setSelectedSettlement] = useState("");

  // MODAL STATE
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // ✅ EZT KELLETT IDE TENNI
  useEffect(() => {
    fetch("http://localhost/vizsga/api/settlements.php")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSettlements(data.settlements);
        }
      });
  }, []);

  useEffect(() => {
    if (postalCode.length === 4) {
      fetch(`http://localhost/vizsga/api/settlement_by_postcode.php?post_code=${postalCode}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setSettlementName(data.settlement.settlement_name);
            setSettlementId(data.settlement.id);
          } else {
            setSettlementName("");
            setSettlementId("");
          }
        });
    } else {
      setSettlementName("");
      setSettlementId("");
    }
  }, [postalCode]);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !settlementId || !address) {
      setModalMessage("Minden mező kitöltése kötelező");
      setModalSuccess(false);
      setModalOpen(true);
      return;
    }

    try {
      const res = await fetch("http://localhost/vizsga/api/register.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          settlement_id: settlementId,
          address
        })
      });

      const data = await res.json();

      if (!data.success) {
        setModalMessage(data.message || "Hiba történt");
        setModalSuccess(false);
        setModalOpen(true);
        return;
      }

      setModalMessage("Sikeres regisztráció");
      setModalSuccess(true);
      setModalOpen(true);

    } catch {
      setModalMessage("Nem sikerült kapcsolódni a szerverhez");
      setModalSuccess(false);
      setModalOpen(true);
    }
  };

  return (
    <>
      <div className="max-w-md mx-auto bg-gray-900 p-8 rounded text-white mt-10">
        <h2 className="text-2xl mb-6 text-center">Regisztráció</h2>

        <form onSubmit={handleRegister} className="space-y-3">

          <input
            className="w-full p-3 bg-black rounded"
            placeholder="Név"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            className="w-full p-3 bg-black rounded"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="text"
            placeholder="Irányítószám"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            className="w-full p-3 bg-black rounded"
          />

          <input
            type="text"
            placeholder="Település"
            value={settlementName}
            disabled
            className="w-full p-3 bg-gray-800 rounded text-gray-400"
          />

          <input
            type="text"
            placeholder="Lakcím"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full p-3 bg-black rounded"
          />

          <input
            type="password"
            className="w-full p-3 bg-black rounded"
            placeholder="Jelszó"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 p-3 rounded font-semibold"
          >
            Regisztráció
          </button>

        </form>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div
            className={`p-8 rounded text-center max-w-sm w-full ${modalSuccess ? "bg-green-700" : "bg-red-700"
              }`}
          >
            <p className="text-white text-lg mb-6">{modalMessage}</p>

            <button
              onClick={() => {
                setModalOpen(false);
                if (modalSuccess) {
                  navigate("/login");
                }
              }}
              className="bg-black px-6 py-2 rounded text-white"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
}