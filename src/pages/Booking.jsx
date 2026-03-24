
import { useState, useEffect } from "react";
import { apiUrl } from "../lib/api";

export default function Booking() {

  const [brands, setBrands] = useState([]);

  useEffect(() => {
    fetch(apiUrl("/catalog/brands.php"), {
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



  const currentYear = new Date().getFullYear();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentMonth = today.getMonth() + 1;
  const availableYears = [currentYear, currentYear + 1];
  const [selectedYear, setSelectedYear] = useState(currentYear);

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
  const [touched, setTouched] = useState({});

  const selectedDate =
    selectedMonth && selectedDay
      ? `${selectedYear}-${selectedMonth}-${selectedDay}`
      : "";

  useEffect(() => {

    if (!selectedDate) return;

    fetch(apiUrl(`/availability/times.php?date=${selectedDate}`), {
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

    fetch(apiUrl(`/catalog/models.php?brand_id=${carBrand}`), {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setModels(data.models);
        }
      })
      .catch(err => console.error("MODEL ERROR:", err));

  }, [carBrand]);

  useEffect(() => {
    fetch(apiUrl("/catalog/services.php?bookable=1&base_only=1"), {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setServices(data.services);
        }
      })
      .catch(err => console.error("Service betöltési hiba:", err));
  }, []);

  useEffect(() => {
    fetch(apiUrl("/catalog/engine-sizes.php"), {
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
    fetch(apiUrl("/catalog/fuel-types.php"), {
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

  const carYears = Array.from(
    { length: currentYear - 1990 + 1 },
    (_, i) => currentYear - i
  );

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
  const isPastDate = (year, month, day) => {
    if (!year || !month || !day) {
      return false;
    }
    const date = new Date(year, Number(month) - 1, Number(day));
    date.setHours(0, 0, 0, 0);
    return date < today;
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

  const setFieldTouched = (fieldName) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
  };

  const isFieldInvalid = (fieldName) => {
    if (!touched[fieldName]) {
      return false;
    }

    switch (fieldName) {
      case "selectedMonth":
        return !selectedMonth;
      case "selectedDay":
        return !selectedDay;
      case "selectedService":
        return !selectedService;
      case "carBrand":
        return !carBrand;
      case "carModel":
        return !carModel;
      case "carYear":
        return !carYear;
      case "fuelType":
        return !fuelType;
      case "engineSize":
        return !isElectric && !engineSize;
      default:
        return false;
    }
  };

  const getSelectClassName = (fieldName, extraClass = "") =>
    `bg-black p-3 rounded border ${
      isFieldInvalid(fieldName) ? "border-red-500" : "border-gray-800"
    } focus:outline-none focus:ring-2 ${
      isFieldInvalid(fieldName) ? "focus:ring-red-500" : "focus:ring-red-600"
    } ${extraClass}`.trim();

  const handleBooking = async () => {
    const requiredFields = [
      "selectedMonth",
      "selectedDay",
      "selectedService",
      "carBrand",
      "carModel",
      "carYear",
      "fuelType",
    ];

    if (!isElectric) {
      requiredFields.push("engineSize");
    }

    setTouched((prev) => {
      const next = { ...prev };
      requiredFields.forEach((field) => {
        next[field] = true;
      });
      return next;
    });

    if (!selectedDate || !selectedTime) {
      alert("Válassz dátumot és időpontot!");
      return;
    }
    if (isPastDate(selectedYear, selectedMonth, selectedDay)) {
      alert("Visszamenőleges dátumra nem lehet foglalni!");
      return;
    }

    if (
      !selectedService ||
      !carBrand ||
      !carModel ||
      !carYear ||
      !fuelType ||
      (!isElectric && !engineSize)
    ) {
      alert("Tölts ki minden kötelező mezőt!");
      return;
    }

    try {

      const res = await fetch(apiUrl("/bookings/index.php"), {
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

      if (!data.success) {
        setPopup({
          show: true,
          success: false,
          message: data.message || "Sikertelen foglalás"
        });
        return;
      }


      setPopup({
        show: true,
        success: true,
        message: "Sikeres foglalás 🎉"
      });

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
      setTouched({});

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
    <div className="max-w-4xl mx-auto space-y-8 sm:space-y-10 text-white">

      <section className="text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-red-600">Időpontfoglalás</h1>
        <p className="text-gray-400 mt-4">
          Válassz dátumot és szabad időpontot.
        </p>
        <p className="text-xs text-gray-500 mt-2">
          <span className="text-red-500">*</span> Kötelező mező
        </p>
      </section>

      <section className="bg-gray-900 p-4 sm:p-6 rounded-lg border border-gray-800">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">

          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(Number(e.target.value));
              setSelectedMonth("");
              setSelectedDay("");
              setSelectedTime("");
            }}
            required
            className="bg-black p-3 rounded border border-gray-800 focus:outline-none focus:ring-2 focus:ring-red-600"
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
            onBlur={() => setFieldTouched("selectedMonth")}
            required
            aria-invalid={isFieldInvalid("selectedMonth")}
            className={getSelectClassName("selectedMonth")}
          >
            <option value="">Hónap *</option>
            {months.map((m) => {
              const monthNumber = Number(m.value);
              const disabled = selectedYear === currentYear && monthNumber < currentMonth;
              return (
                <option key={m.value} value={m.value} disabled={disabled}>
                  {m.label}
                </option>
              );
            })}
          </select>

          <select
            value={selectedDay}
            disabled={!selectedMonth}
            onChange={(e) => setSelectedDay(e.target.value)}
            onBlur={() => setFieldTouched("selectedDay")}
            required
            aria-invalid={isFieldInvalid("selectedDay")}
            className={getSelectClassName("selectedDay")}
          >
            <option value="">Nap *</option>
            {days.map((d) => {
              const weekend = isWeekendDay(selectedYear, selectedMonth, d);
              const holiday = isHoliday(selectedYear, selectedMonth, d);
              const inPast = isPastDate(selectedYear, selectedMonth, d);
              const disabled = weekend || holiday || inPast;

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
                  {inPast ? " (múltbeli nap)" : ""}
                </option>
              );
            })}
          </select>

        </div>
      </section>

      {selectedDate && (
        <section className="bg-gray-900 p-4 sm:p-6 rounded-lg border border-gray-800">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
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

      <section className="bg-gray-900 p-4 sm:p-6 rounded-lg border border-gray-800">
        <p className="text-gray-400 mb-3">
          Ha valami probléma van gépjárműjével, kérjük átvizsgálásra foglaljon időpontot!
        </p>
        <select
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
          onBlur={() => setFieldTouched("selectedService")}
          required
          aria-invalid={isFieldInvalid("selectedService")}
          className={getSelectClassName("selectedService", "w-full")}
        >
          
          <option value="">Válassz szolgáltatást *</option>

          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name}
            </option>
          ))}
        </select>
      </section>

      <section className="bg-gray-900 p-4 sm:p-6 rounded-lg border border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-4">

        <select
          value={carBrand}
          onChange={(e) => {
            const nextBrand = e.target.value;
            setCarBrand(nextBrand);
            setCarModel("");
            setTouched((prev) => ({ ...prev, carModel: false }));
            if (!nextBrand) {
              setModels([]);
            }
          }}
          onBlur={() => setFieldTouched("carBrand")}
          required
          aria-invalid={isFieldInvalid("carBrand")}
          className={getSelectClassName("carBrand")}
        >
          <option value="">Válassz márkát *</option>
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
          onBlur={() => setFieldTouched("carModel")}
          required
          aria-invalid={isFieldInvalid("carModel")}
          className={getSelectClassName("carModel")}
        >
          <option value="">
            {carBrand ? "Válassz típust *" : "Előbb válassz márkát *"}
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
          onBlur={() => setFieldTouched("carYear")}
          required
          aria-invalid={isFieldInvalid("carYear")}
          className={getSelectClassName("carYear")}
        >
          <option value="">Évjárat *</option>
          {carYears.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>

        <select
          value={fuelType}
          onChange={(e) => {
            setFuelType(e.target.value);
            setTouched((prev) => ({ ...prev, engineSize: false }));
          }}
          onBlur={() => setFieldTouched("fuelType")}
          required
          aria-invalid={isFieldInvalid("fuelType")}
          className={getSelectClassName("fuelType")}
        >
          <option value="">Üzemanyag *</option>

          {fuelTypes.map((fuel) => (
            <option key={fuel.id} value={fuel.id}>
              {fuel.fuel_name}
            </option>
          ))}
        </select>

        <select
          value={engineSize}
          onChange={(e) => setEngineSize(e.target.value)}
          onBlur={() => setFieldTouched("engineSize")}
          disabled={isElectric}
          required={!isElectric}
          aria-invalid={isFieldInvalid("engineSize")}
          className={getSelectClassName("engineSize", "md:col-span-2")}
        >
          <option value="">
            {isElectric
              ? "Elektromos – nincs köbcenti"
              : "Köbcenti (liter) *"}
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
          className="w-full bg-red-600 hover:bg-red-700 p-3 sm:p-4 rounded font-semibold mb-4 sm:mb-6"
        >
          Időpont lefoglalása
        </button>
      )}
      {popup.show && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div
            className={`p-6 sm:p-8 rounded text-center max-w-sm w-[calc(100%-1rem)] sm:w-full ${popup.success ? "bg-green-700" : "bg-red-700"
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
