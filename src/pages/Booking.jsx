// ===============================
// IDŐPONTFOGLALÁS
// ===============================

import { useState } from "react";

export default function Booking() {
  // ===== ÉV =====
  const currentYear = new Date().getFullYear();
  const availableYears = [currentYear, currentYear + 1];
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // ===== STATE =====
  const [selectedService, setSelectedService] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const [showSuccess, setShowSuccess] = useState(false);
  const [showPastError, setShowPastError] = useState(false);

  const [carBrand, setCarBrand] = useState("");
  const [carModel, setCarModel] = useState("");
  const [carYear, setCarYear] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [engineSize, setEngineSize] = useState("");

  const [popup, setPopup] = useState({
    show: false,
    success: false,
    message: ""
  });


  // ===== ÉVJÁRATOK (AUTÓ) =====
  const carYears = Array.from(
    { length: 2026 - 1990 + 1 },
    (_, i) => 2026 - i
  );

  // ===== ÜNNEPNAPOK (2026–2027) =====
  const holidays = [
    // ---- 2026 ----
    "2026-01-01", // Újév
    "2026-03-15", // Nemzeti ünnep
    "2026-04-03", // Nagypéntek
    "2026-04-06", // Húsvét hétfő
    "2026-05-01", // Munka ünnepe
    "2026-05-25", // Pünkösd hétfő
    "2026-08-20", // Államalapítás ünnepe
    "2026-10-23", // Nemzeti ünnep
    "2026-11-01", // Mindenszentek
    "2026-12-25", // Karácsony
    "2026-12-26", // Karácsony

    // ---- 2027 ----
    "2027-01-01", // Újév
    "2027-03-15", // Nemzeti ünnep
    "2027-03-26", // Nagypéntek
    "2027-03-29", // Húsvét hétfő
    "2027-05-01", // Munka ünnepe
    "2027-05-17", // Pünkösd hétfő
    "2027-08-20", // Államalapítás ünnepe
    "2027-10-23", // Nemzeti ünnep
    "2027-11-01", // Mindenszentek
    "2027-12-25", // Karácsony
    "2027-12-26", // Karácsony
  ];


  // ===== SEGÉD =====
  const isWeekendDay = (year, month, day) => {
    const d = new Date(year, month - 1, day).getDay();
    return d === 0 || d === 6;
  };

  const selectedDate =
    selectedMonth && selectedDay
      ? `${selectedYear}-${selectedMonth}-${selectedDay}`
      : "";

  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  const isPastDate = (date) => date < today;

  const isPastTime = (time) => {
    if (selectedDate !== today) return false;
    const [h, m] = time.split(":").map(Number);
    if (h < currentHour) return true;
    if (h === currentHour && m <= currentMinute) return true;
    return false;
  };

  const isWeekend = (date) => {
    const d = new Date(date).getDay();
    return d === 0 || d === 6;
  };

  const isHoliday = (year, month, day) => {
    const dateString = `${year}-${month}-${day}`;
    return holidays.includes(dateString);
  };


  // ===== ADATOK =====
  const months = [
    { value: "01", label: "Január" },
    { value: "02", label: "Február" },
    { value: "03", label: "Március" },
    { value: "04", label: "Április" },
    { value: "05", label: "Május" },
    { value: "06", label: "Június" },
    { value: "07", label: "Július" },
    { value: "08", label: "Augusztus" },
    { value: "09", label: "Szeptember" },
    { value: "10", label: "Október" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const days = Array.from({ length: 31 }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  );

  const generateTimeSlots = () => {
    const slots = [];
    let h = 8;
    let m = 0;
    while (h < 16) {
      if (!(h === 12 && m === 0)) {
        slots.push(
          `${h.toString().padStart(2, "0")}:${m
            .toString()
            .padStart(2, "0")}`
        );
      }
      m += 30;
      if (m === 60) {
        m = 0;
        h++;
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // ===== FOGLALÁS =====
  const handleBooking = async () => {
    if (!selectedService) {
      alert("Válassz szolgáltatást!");
      return;
    }

    if (!carBrand || !carModel || !carYear || !fuelType) {
      alert("Tölts ki minden autó adatot!");
      return;
    }

    if (Number(carYear) > currentYear) {
      alert("Az évjárat nem lehet nagyobb a jelenlegi évnél!");
      return;
    }

    try {
      const res = await fetch("http://localhost/vizsga/api/bookings_create.php", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          appointment_date: selectedDate,
          appointment_time: selectedTime,
          service: selectedService,
          car_brand: carBrand,
          car_model: carModel,
          car_year: carYear,
          fuel_type: fuelType,
          engine_size: fuelType === "elektromos" ? null : engineSize
        })
      }
      );

      const data = await res.json();

      if (!data.success) {
        setPopup({
          show: true,
          success: false,
          message: data.message || "Sikertelen foglalás"
        });
        return;
      }

      // ✅ siker
      setPopup({
        show: true,
        success: true,
        message: "Sikeres foglalás 🎉"
      });


      setShowSuccess(true);
    } catch {
      setPopup({
        show: true,
        success: false,
        message: "Nem sikerült kapcsolódni a szerverhez"
      });
    }

  };

  // ===== JSX =====
  return (
    <div className="max-w-4xl mx-auto space-y-10 text-white">
      {/* CÍM */}
      <section className="text-center">
        <h1 className="text-4xl font-bold text-red-600">Időpontfoglalás</h1>
        <p className="text-gray-400 mt-4">
          Válassz dátumot és szabad időpontot.
        </p>
      </section>

      {/* DÁTUM */}
      <section className="bg-gray-900 p-6 rounded-lg border border-gray-800">
        <div className="grid grid-cols-3 gap-4">
          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(Number(e.target.value));
              setSelectedMonth("");
              setSelectedDay("");
              setSelectedTime("");
            }}
            className="bg-black p-3 rounded"
          >
            {availableYears.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <select
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value);
              setSelectedDay("");
            }}
            className="bg-black p-3 rounded"
          >
            <option value="">Hónap</option>
            {months.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>

          <select
            value={selectedDay}
            disabled={!selectedMonth}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="bg-black p-3 rounded"
          >
            <option value="">Nap</option>
            {days.map((d) => {
              const weekend = isWeekendDay(selectedYear, selectedMonth, d);
              const holiday = isHoliday(selectedYear, selectedMonth, d);
              const disabled = weekend || holiday;

              return (
                <option
                  key={d}
                  value={d}
                  disabled={disabled}
                  className={disabled ? "text-gray-500" : ""}
                >
                  {d}
                  {weekend ? " (hétvége)" : ""}
                  {holiday ? " (ünnepnap)" : ""}
                </option>
              );
            })}

          </select>
        </div>
      </section>

      {/* IDŐPONT */}
      {selectedDate && !isWeekend(selectedDate) && !isPastDate(selectedDate) && (
        <section className="bg-gray-900 p-6 rounded-lg border border-gray-800">
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
            {timeSlots.map((t) => (
              <button
                key={t}
                disabled={isPastTime(t)}
                onClick={() => setSelectedTime(t)}
                className={`p-2 rounded text-sm ${selectedTime === t
                  ? "bg-red-600"
                  : "bg-black hover:bg-gray-800"
                  }`}
              >
                {t}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* SZOLGÁLTATÁS */}
      <section className="bg-gray-900 p-6 rounded-lg border border-gray-800">
        <select
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
          className="bg-black p-3 rounded w-full"
        >
          <option value="">Válassz szolgáltatást</option>
          <option value="gumizas_centirozas">Gumizás / Centírozás</option>
          <option value="atvizsgalas">Átvizsgálás</option>
          <option value="olajcsere_szurok">
            Olajcsere / szűrők
          </option>
        </select>
      </section>

      {/* AUTÓ */}
      <section className="bg-gray-900 p-6 rounded-lg border border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          placeholder="Márka"
          value={carBrand}
          onChange={(e) => setCarBrand(e.target.value)}
          className="bg-black p-3 rounded"
        />
        <input
          placeholder="Típus"
          value={carModel}
          onChange={(e) => setCarModel(e.target.value)}
          className="bg-black p-3 rounded"
        />
        <select
          value={carYear}
          onChange={(e) => setCarYear(e.target.value)}
          className="bg-black p-3 rounded"
        >
          <option value="">Évjárat</option>
          {carYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>


        <select
          value={fuelType}
          onChange={(e) => setFuelType(e.target.value)}
          className="bg-black p-3 rounded"
        >
          <option value="">Üzemanyag</option>
          <option value="benzin">Benzin</option>
          <option value="dizel">Dízel</option>
          <option value="hibrid">Hibrid</option>
          <option value="elektromos">Elektromos</option>
        </select>

        <select
          value={engineSize}
          onChange={(e) => setEngineSize(e.target.value)}
          disabled={fuelType === "elektromos"}
          className="bg-black p-3 rounded md:col-span-2"
        >
          <option value="">
            {fuelType === "elektromos"
              ? "Elektromos – nincs köbcenti"
              : "Köbcenti (liter)"}
          </option>
          {Array.from({ length: 53 }, (_, i) => {
            const v = (0.8 + i * 0.1).toFixed(1);
            return <option key={v} value={v}>{v}</option>;
          })}
        </select>
      </section>

      {/* FOGLALÁS */}
      {selectedDate && selectedTime && (
        <button
          onClick={handleBooking}
          className="w-full bg-red-600 hover:bg-red-700 p-4 rounded font-semibold"
        >
          Időpont lefoglalása
        </button>
      )}

      {/* SIKER */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="bg-gray-900 p-8 rounded text-center">
            <h3 className="text-xl mb-4">Sikeres foglalás 🎉</h3>
            <button
              onClick={() => setShowSuccess(false)}
              className="bg-red-600 px-4 py-2 rounded"
            >
              Bezárás
            </button>
          </div>
        </div>
      )}

      {popup.show && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div
            className={`p-8 rounded-lg text-center border-2 w-full max-w-sm
        ${popup.success
                ? "bg-green-900 border-green-500"
                : "bg-red-900 border-red-500"}
      `}
          >
            <h3 className="text-2xl font-bold mb-4">
              {popup.success ? "Siker!" : "Hiba"}
            </h3>

            <p className="mb-6">{popup.message}</p>

            <button
              onClick={() => setPopup({ show: false, success: false, message: "" })}
              className={`px-6 py-2 rounded font-semibold
          ${popup.success
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"}
        `}
            >
              Bezárás
            </button>
          </div>
        </div>
      )}


    </div>
  );
}
