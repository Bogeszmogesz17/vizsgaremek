// ===============================
// IDŐPONTFOGLALÁS
// ===============================

import { useState, useEffect } from "react";

export default function Booking() {

  // ===== MÁRKÁK BETÖLTÉSE =====
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    fetch("http://localhost/vizsga/api/brands.php", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setBrands(data.brands);
        }
      })
      .catch(err => console.error("Márka betöltési hiba:", err));
  }, []);



  // ===== ÉV =====
  const currentYear = new Date().getFullYear();
  const availableYears = [currentYear, currentYear + 1];
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // ===== STATE =====
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState("");
  const [bookedTimes, setBookedTimes] = useState([]);



  const [carBrand, setCarBrand] = useState("");
  const [carModel, setCarModel] = useState("");
  const [engineSizes, setEngineSizes] = useState([]);
  const [models, setModels] = useState([]);

  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const selectedDate =
    selectedMonth && selectedDay
      ? `${selectedYear}-${selectedMonth}-${selectedDay}`
      : "";

  useEffect(() => {

    if (!selectedDate) return;

    fetch(`http://localhost/vizsga/api/booked_times.php?date=${selectedDate}`, {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {

        if (data.success) {
          setBookedTimes(data.times);
        }

      })
      .catch(err => console.error(err));

  }, [selectedDate]);

  useEffect(() => {
    if (!carBrand) {
      return;
    }

    console.log("FETCHING MODEL FOR:", carBrand);

    fetch(`http://localhost/vizsga/api/models.php?brand_id=${carBrand}`, {
      credentials: "include"
    })
      .then(res => {
        console.log("STATUS:", res.status);
        return res.json();
      })
      .then(data => {
        console.log("MODEL RESPONSE:", data);

        if (data.success) {
          setModels(data.models);
        }
      })
      .catch(err => console.error("MODEL ERROR:", err));

  }, [carBrand]);

  useEffect(() => {
    fetch("http://localhost/vizsga/api/bookable_services.php?bookable=1", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        console.log("BOOKABLE SERVICES:", data); // ideiglenes debug
        if (data.success) {
          setServices(data.services);
        }
      })
      .catch(err => console.error("Service betöltési hiba:", err));
  }, []);

  useEffect(() => {
    fetch("http://localhost/vizsga/api/engine_sizes.php", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setEngineSizes(data.engine_sizes);
        }
      })
      .catch(err => console.error("Engine size betöltési hiba:", err));
  }, []);



  const [carYear, setCarYear] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [fuelTypes, setFuelTypes] = useState([]);
  useEffect(() => {
    fetch("http://localhost/vizsga/api/fuel_types.php", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setFuelTypes(data.fuel_types);
        }
      })
      .catch(err => console.error("Fuel betöltési hiba:", err));
  }, []);
  const [engineSize, setEngineSize] = useState("");

  const [popup, setPopup] = useState({
    show: false,
    success: false,
    message: ""
  });

  // ===== ÉVJÁRATOK =====
  const carYears = Array.from(
    { length: currentYear - 1990 + 1 },
    (_, i) => currentYear - i
  );

  // ===== HÓNAPOK =====
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
  const holidays = [
    "2026-01-01",
    "2026-03-15",
    "2026-04-03",
    "2026-04-06",
    "2026-05-01",
    "2026-05-25",
    "2026-08-20",
    "2026-10-23",
    "2026-11-01",
    "2026-12-25",
    "2026-12-26",
  ];

  const isWeekendDay = (year, month, day) => {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  };

  const isHoliday = (year, month, day) => {
    const formatted = `${year}-${month}-${day}`;
    return holidays.includes(formatted);
  };

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
  const selectedFuel = fuelTypes.find(
    (fuel) => String(fuel.id) === String(fuelType)
  );
  const isElectric = selectedFuel?.fuel_name?.toLowerCase() === "elektromos";

  // ===== FOGLALÁS =====
  const handleBooking = async () => {

    console.log("BOOKING CLICK");

    if (!selectedDate || !selectedTime) {
      alert("Válassz dátumot és időpontot!");
      return;
    }

    if (!selectedService) {
      alert("Válassz szolgáltatást!");
      return;
    }

    if (!carBrand || !carModel || !carYear || !fuelType) {
      alert("Tölts ki minden autó adatot!");
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
          engine_size: engineSize
        })
      });

      const data = await res.json();

      console.log("BOOKING RESPONSE:", data);

      if (!data.success) {
        setPopup({
          show: true,
          success: false,
          message: data.message || "Sikertelen foglalás"
        });
        return;
      }

      // ===== SIKERES FOGLALÁS =====

      setPopup({
        show: true,
        success: true,
        message: "Sikeres foglalás 🎉"
      });

      // mezők reset
      setSelectedService("");
      setSelectedMonth("");
      setSelectedDay("");
      setSelectedTime("");

      setCarBrand("");
      setCarModel("");
      setModels([]);
      setCarYear("");
      setFuelType("");
      setEngineSize("");

      // időpont lista frissítése
      setBookedTimes(prev => [...prev, selectedTime]);

    } catch (err) {

      console.error(err);

      setPopup({
        show: true,
        success: false,
        message: "Nem sikerült kapcsolódni a szerverhez"
      });
    }
  };

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
      {selectedDate && (
        <section className="bg-gray-900 p-6 rounded-lg border border-gray-800">
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
            {timeSlots.map((t) => {

              const booked = bookedTimes.some(time => time.startsWith(t));

              return (
                <button
                  key={t}
                  disabled={booked}
                  onClick={() => {
                    if (!booked) {
                      setSelectedTime(t);
                    }
                  }}
                  className={`p-2 rounded text-sm transition
        ${booked
                      ? "bg-gray-700 text-gray-400 cursor-not-allowed pointer-events-none"
                      : selectedTime === t
                        ? "bg-red-600"
                        : "bg-black hover:bg-gray-800"
                    }
      `}
                >
                  {t} {booked && "❌"}
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
          className="bg-black p-3 rounded w-full"
        >
          <option value="">Válassz szolgáltatást</option>

          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name}
            </option>
          ))}
        </select>
      </section>

      {/* AUTÓ */}
      <section className="bg-gray-900 p-6 rounded-lg border border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* MÁRKA */}
        <select
          value={carBrand}
          onChange={(e) => {
            const nextBrand = e.target.value;
            setCarBrand(nextBrand);
            setCarModel("");
            if (!nextBrand) {
              setModels([]);
            }
          }}
          className="bg-black p-3 rounded"
        >
          <option value="">Válassz márkát</option>
          {brands.length > 0 ? (
            brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.brand_name}
              </option>
            ))
          ) : (
            <option disabled>Betöltés...</option>
          )}
        </select>

        <select
          value={carModel}
          onChange={(e) => setCarModel(e.target.value)}
          disabled={!carBrand}
          className="bg-black p-3 rounded"
        >
          <option value="">
            {carBrand ? "Válassz típust" : "Előbb válassz márkát"}
          </option>

          {models.map((model) => (
            <option key={model.id} value={model.id}>
              {model.model_name}
            </option>
          ))}
        </select>

        <select
          value={carYear}
          onChange={(e) => setCarYear(e.target.value)}
          className="bg-black p-3 rounded"
        >
          <option value="">Évjárat</option>
          {carYears.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>

        <select
          value={fuelType}
          onChange={(e) => setFuelType(e.target.value)}
          className="bg-black p-3 rounded"
        >
          <option value="">Üzemanyag</option>

          {fuelTypes.map((fuel) => (
            <option key={fuel.id} value={fuel.id}>
              {fuel.fuel_name}
            </option>
          ))}
        </select>

        <select
          value={engineSize}
          onChange={(e) => setEngineSize(e.target.value)}
          disabled={isElectric}
          className="bg-black p-3 rounded md:col-span-2"
        >
          <option value="">
            {isElectric
              ? "Elektromos – nincs köbcenti"
              : "Köbcenti (liter)"}
          </option>

          {engineSizes.map((engine) => (
            <option key={engine.id} value={engine.id}>
              {engine.engine_size}
            </option>
          ))}
        </select>

      </section>

      {selectedDate && selectedTime && (
        <button
          onClick={handleBooking}
          className="w-full bg-red-600 hover:bg-red-700 p-4 rounded font-semibold"
        >
          Időpont lefoglalása
        </button>
      )}
      {popup.show && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div
            className={`p-8 rounded text-center max-w-sm w-full ${popup.success ? "bg-green-700" : "bg-red-700"
              }`}
          >
            <p className="text-white text-lg mb-6">{popup.message}</p>

            <button
              onClick={() => setPopup({ ...popup, show: false })}
              className="bg-black px-6 py-2 rounded text-white"
            >
              OK
            </button>
          </div>
        </div>
      )}

    </div>
  );
}