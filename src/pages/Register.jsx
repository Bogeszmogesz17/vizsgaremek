import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // MODAL STATE
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const handleRegister = async () => {
    try {
      const res = await fetch("http://localhost/vizsga/api/register.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      // ❌ HIBA
      if (!data.success) {
        setModalMessage(data.message || "Hiba történt");
        setModalSuccess(false);
        setModalOpen(true);
        return;
      }

      // ✅ SIKER
      setModalMessage(data.message || "Sikeres regisztráció");
      setModalSuccess(true);
      setModalOpen(true);

    } catch (err) {
      setModalMessage("Nem sikerült kapcsolódni a szerverhez");
      setModalSuccess(false);
      setModalOpen(true);
    }
  };

  return (
    <>
      {/* FORM */}
      <div className="max-w-md mx-auto bg-gray-900 p-8 rounded text-white">
        <h2 className="text-2xl mb-6 text-center">Regisztráció</h2>

        <input
          className="w-full mb-3 p-3 bg-black rounded"
          placeholder="Név"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="w-full mb-3 p-3 bg-black rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full mb-4 p-3 bg-black rounded"
          placeholder="Jelszó"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleRegister}
          className="w-full bg-red-600 hover:bg-red-700 p-3 rounded font-semibold"
        >
          Regisztráció
        </button>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div
            className={`p-8 rounded text-center max-w-sm w-full ${
              modalSuccess ? "bg-green-700" : "bg-red-700"
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
