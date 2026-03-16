import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../lib/api";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [settlementName, setSettlementName] = useState("");
  const [settlementId, setSettlementId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    if (postalCode.length !== 4) {
      return;
    }

    fetch(apiUrl(`/catalog/settlements.php?post_code=${postalCode}`))
      .then(res => res.json())
      .then(data => {
        if (!data.success) {
          setSettlementName("");
          setSettlementId("");
          return;
        }

        setSettlementName(data.settlement.settlement_name);
        setSettlementId(data.settlement.id);
      })
      .catch(() => {
        setSettlementName("");
        setSettlementId("");
      });
  }, [postalCode]);

  const openModal = (message, success) => {
    setModalMessage(message);
    setModalSuccess(success);
    setModalOpen(true);
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      openModal(
        "A jelszónak minimum 8 karakteresnek kell lennie, tartalmaznia kell legalább 1 nagybetűt és 1 számot.",
        false
      );
      return;
    }

    if (password !== confirmPassword) {
      openModal("A két jelszó nem egyezik.", false);
      return;
    }

    if (!name || !email || !password || !phoneNumber || !settlementId || !address) {
      openModal("Minden mező kitöltése kötelező", false);
      return;
    }

    if (!termsAccepted) {
      openModal("A regisztrációhoz el kell fogadnod az ÁSZF-et.", false);
      return;
    }

    try {
      const response = await fetch(apiUrl("/auth/register.php"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone_number: phoneNumber,
          password,
          settlement_id: settlementId,
          address,
          terms_accepted: termsAccepted
        })
      });

      const result = await response.json();
      if (!result.success) {
        openModal(result.message || "Hiba történt", false);
        return;
      }

      openModal("Sikeres regisztráció", true);
    } catch {
      openModal("Nem sikerült kapcsolódni a szerverhez", false);
    }
  };

  return (
    <>
      <div className="w-[calc(100%-1rem)] sm:w-full max-w-md mx-auto bg-gray-900 p-5 sm:p-8 rounded text-white mt-6 sm:mt-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-red-600 mb-6 text-center">Regisztráció</h2>

        <form onSubmit={handleRegister} className="space-y-3">
          <input
            className="w-full p-3 bg-black rounded"
            placeholder="Név"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

          <input
            type="email"
            className="w-full p-3 bg-black rounded"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <input
            type="tel"
            placeholder="Telefonszám"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            className="w-full p-3 bg-black rounded"
          />

          <input
            type="text"
            placeholder="Irányítószám"
            value={postalCode}
            onChange={(event) => {
              const nextPostalCode = event.target.value;
              setPostalCode(nextPostalCode);
              if (nextPostalCode.length !== 4) {
                setSettlementName("");
                setSettlementId("");
              }
            }}
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
            onChange={(event) => setAddress(event.target.value)}
            className="w-full p-3 bg-black rounded"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Jelszó"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full p-3 bg-black rounded border border-gray-700 pr-12"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Jelszó megerősítése"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full p-3 bg-black rounded border border-gray-700 pr-12"
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showConfirmPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <div className="flex items-start gap-2 text-sm text-gray-300">
            <input
              id="termsAccepted"
              type="checkbox"
              checked={termsAccepted}
              onChange={(event) => setTermsAccepted(event.target.checked)}
              className="mt-1 h-4 w-4 accent-red-600"
            />
            <label htmlFor="termsAccepted" className="leading-5">
              Tudomásul veszem és elfogadom az{" "}
              <a
                href="/aszf.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-500 hover:text-red-400 underline"
              >
                Általános Szerződési Feltételeket
              </a>
              .
            </label>
          </div>

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
            className={`p-6 sm:p-8 rounded text-center max-w-sm w-[calc(100%-1rem)] sm:w-full ${modalSuccess ? "bg-green-700" : "bg-red-700"}`}
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
