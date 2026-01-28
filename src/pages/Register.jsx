import { useState } from "react";

export default function Register() {
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost/vizsga/api/register.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          password
        })
      });

      setModalMessage(data.message);

      if (data.success) {
        setModalType("success");
      } else {
        setModalType("error");
      }

      const data = await res.json();
      setMessage(data.message);

    } catch {
      setMessage("Szerverhiba");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-gray-900 p-6 rounded text-white">
      <h2 className="text-2xl font-bold mb-4 text-center">Regisztráció</h2>

      <form onSubmit={handleRegister} className="space-y-4">
        <input
          type="text"
          placeholder="Név"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-black p-3 rounded"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-black p-3 rounded"
        />

        <input
          type="password"
          placeholder="Jelszó"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-black p-3 rounded"
        />

        <button className="w-full bg-red-600 hover:bg-red-700 p-3 rounded font-semibold">
          Regisztráció
        </button>
      </form>

      {message && (
        <p className="text-center mt-4 text-gray-300">{message}</p>
      )}

      {modalMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div
            className={`p-6 rounded-lg text-center max-w-sm w-full
        ${modalType === "success" ? "bg-green-700" : "bg-red-700"}
      `}
          >
            <h3 className="text-white text-xl font-semibold mb-4">
              {modalType === "success" ? "Siker 🎉" : "Hiba ❌"}
            </h3>

            <p className="text-white mb-6">
              {modalMessage}
            </p>

            <button
              onClick={() => setModalMessage("")}
              className="bg-black bg-opacity-30 hover:bg-opacity-50 px-6 py-2 rounded text-white"
            >
              OK
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
