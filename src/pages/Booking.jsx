// ===============================
// IDŐPONTFOGLALÁS – HÜLYEBIZTOS
// ===============================

import { useState } from "react";

export default function Booking() {
    const FIXED_YEAR = 2026;

    // ---------- STATE ----------
    const [selectedService, setSelectedService] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedDay, setSelectedDay] = useState("");
    const [selectedTime, setSelectedTime] = useState("");

    const [showSuccess, setShowSuccess] = useState(false);
    const [showPastError, setShowPastError] = useState(false);

    const [carBrand, setCarBrand] = useState("");
    const [carModel, setCarModel] = useState("");
    const [carYear, setCarYear] = useState("");
    const [licensePlate, setLicensePlate] = useState("");

    // ---------- SZÁMOLT DÁTUM ----------
    const selectedDate =
        selectedMonth && selectedDay
            ? `${FIXED_YEAR}-${selectedMonth}-${selectedDay}`
            : "";

    // ---------- AKTUÁLIS IDŐ ----------
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

    // ---------- FOGLALÁS ----------
    const handleBooking = () => {
        if (!selectedService) {
            alert("Kérlek válassz szolgáltatást!");
            return;
        }

        if (!carBrand || !carModel || !carYear || !licensePlate) {
            alert("Kérlek tölts ki minden autó adatot!");
            return;
        }

        if (isPastDate(selectedDate) || isPastTime(selectedTime)) {
            setShowPastError(true);
            return;
        }

        setShowSuccess(true);
    };

    // ---------- ADATOK ----------
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
                slots.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
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

    // ===============================
    // JSX
    // ===============================
    return (
        <div className="max-w-4xl mx-auto space-y-10">

            {/* CÍM */}
            <section className="text-center">
                <h1 className="text-4xl font-bold text-red-600">Időpontfoglalás</h1>
                <p className="text-gray-400 mt-4">Válassz dátumot és szabad időpontot.</p>
            </section>

            {/* DÁTUM */}
            <section className="bg-gray-900 p-6 rounded-lg border border-gray-800">
                <p className="text-gray-400 mb-4">
                    Év: <span className="text-white font-semibold">2026</span>
                </p>

                <div className="grid grid-cols-2 gap-4 max-w-sm">
                    <select
                        value={selectedMonth}
                        onChange={(e) => {
                            setSelectedMonth(e.target.value);
                            setSelectedDay("");
                            setSelectedTime("");
                        }}
                        className="bg-black text-white border border-gray-700 p-3 rounded"
                    >
                        <option value="">Hónap</option>
                        {months.map((m) => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                    </select>

                    <select
                        value={selectedDay}
                        onChange={(e) => {
                            setSelectedDay(e.target.value);
                            setSelectedTime("");
                        }}
                        disabled={!selectedMonth}
                        className="bg-black text-white border border-gray-700 p-3 rounded"
                    >
                        <option value="">Nap</option>
                        {days.map((d) => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                </div>
            </section>

            {/* IDŐPONTOK */}
            {selectedDate && !isWeekend(selectedDate) && !isPastDate(selectedDate) && (
                <section className="bg-gray-900 p-6 rounded-lg border border-gray-800">
                    <h3 className="text-white mb-4 font-semibold">Időpont kiválasztása</h3>

                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                        {timeSlots.map((time) => {
                            const disabled = isPastTime(time);
                            return (
                                <button
                                    key={time}
                                    disabled={disabled}
                                    onClick={() => setSelectedTime(time)}
                                    className={`p-2 rounded text-sm ${disabled
                                        ? "bg-gray-700 text-gray-500"
                                        : selectedTime === time
                                            ? "bg-red-600 text-white"
                                            : "bg-black text-white hover:bg-gray-800"
                                        }`}
                                >
                                    {time}
                                </button>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* SZOLGÁLTATÁS */}
            <section className="bg-gray-900 p-6 rounded-lg border border-gray-800">
                <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="bg-black text-white border border-gray-700 p-3 rounded w-full max-w-sm"
                >
                    <option value="">Válassz szolgáltatást</option>
                    <option value="atvizsgalas">Átvizsgálás</option>
                    <option value="gumizas">Gumizás</option>
                    <option value="centirozas">Centírozás</option>
                </select>
            </section>

            {/* AUTÓ */}
            <section className="bg-gray-900 p-6 rounded-lg border border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-4">
                <input placeholder="Márka" value={carBrand} onChange={e => setCarBrand(e.target.value)} className="bg-black text-white p-3 rounded border border-gray-700" />
                <input placeholder="Típus" value={carModel} onChange={e => setCarModel(e.target.value)} className="bg-black text-white p-3 rounded border border-gray-700" />
                <input type="number" placeholder="Évjárat" value={carYear} max={new Date().getFullYear()} onChange={(e) => {
                    const value = e.target.value; const currentYear = new Date().getFullYear();
                    if (value === "" || Number(value) <= currentYear) {
                        setCarYear(value);
                    }
                }} className="bg-black text-white border border-gray-700 p-3 rounded"
                />
                <input
                    type="text"
                    placeholder="Rendszám"
                    value={licensePlate}
                    maxLength={9}
                    onChange={(e) => {
                        let value = e.target.value.toUpperCase();

                        // csak betűk, számok és kötőjel
                        value = value.replace(/[^A-Z0-9-]/g, "");

                        setLicensePlate(value);
                    }}
                    className="bg-black text-white border border-gray-700 p-3 rounded uppercase"
                />


            </section>

            {/* FOGLALÁS */}
            {selectedDate && selectedTime && (
                <button
                    onClick={handleBooking}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold p-4 rounded"
                >
                    Időpont lefoglalása
                </button>
            )}

            {/* SIKER */}
            {showSuccess && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                    <div className="bg-gray-900 p-8 rounded text-center">
                        <h3 className="text-white text-xl mb-4">Sikeres foglalás 🎉</h3>
                        <button onClick={() => setShowSuccess(false)} className="bg-red-600 px-4 py-2 rounded text-white">
                            Bezárás
                        </button>
                    </div>
                </div>
            )}

            {showPastError && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                    <div className="bg-gray-900 p-8 rounded text-center">
                        <p className="text-red-500 mb-4">
                            Visszamenőleg nem lehet foglalni.
                        </p>
                        <button onClick={() => setShowPastError(false)} className="bg-red-600 px-4 py-2 rounded text-white">
                            Rendben
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
