import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [view, setView] = useState("bookings");

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [works, setWorks] = useState([]);
  const [workLoading, setWorkLoading] = useState(false);

  const [showWorkForm, setShowWorkForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [workDescription, setWorkDescription] = useState("");
  const [workDate, setWorkDate] = useState("");
  const [workTime, setWorkTime] = useState("");

  // -----------------------------
  // ADMIN CHECK
  // -----------------------------
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch("http://localhost/vizsga/api/admin_check.php", {
          credentials: "include",
        });
        const data = await res.json();

        if (!data.success) {
          navigate("/admin-login");
          return;
        }

        loadBookings();
      } catch (err) {
        console.error("Admin check error:", err);
        navigate("/admin-login");
      }
    };

    checkAdmin();
  }, [navigate]);

  // -----------------------------
  // FOGLALÁSOK BETÖLTÉSE
  // -----------------------------
  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost/vizsga/api/admin_bookings_list.php", {
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (err) {
      console.error("Booking load error:", err);
    }
    setLoading(false);
  };

  // -----------------------------
  // MUNKÁK BETÖLTÉSE
  // -----------------------------
  const loadWorks = async () => {
    setWorkLoading(true);
    try {
      const res = await fetch("http://localhost/vizsga/api/admin_work_process_list.php", {
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        setWorks(data.works);
      }
    } catch (err) {
      console.error("Work load error:", err);
    }
    setWorkLoading(false);
  };

  // -----------------------------
  // TOVÁBBI MUNKA MENTÉSE
  // -----------------------------
  const submitAdditionalWork = async () => {
    if (!selectedBooking) {
      alert("Nincs kiválasztott foglalás");
      return;
    }

    if (!workDescription || !workDate || !workTime) {
      alert("Minden mező kötelező");
      return;
    }

    try {
      const res = await fetch("http://localhost/vizsga/api/create_work_process.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          booking_id: selectedBooking.id,
          description: workDescription,
          date: workDate,
          time: workTime,
          
        }),
        
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Mentés sikertelen");
        return;
      }

      // mezők ürítése
      setShowWorkForm(false);
      setWorkDescription("");
      setWorkDate("");
      setWorkTime("");

      await loadWorks();
      await loadBookings();

      setView("work");
    } catch (err) {
      console.error("API error:", err);
      alert("API hiba történt");
    }
  };

  // -----------------------------
  // MUNKA LEZÁRÁSA
  // -----------------------------
  const finishWork = async (workId) => {
    try {
      const res = await fetch("http://localhost/vizsga/api/finish_work.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ work_id: workId }),
      });

      const data = await res.json();

      if (data.success) {
        loadWorks();
      } else {
        alert(data.message || "Nem sikerült lezárni a munkát");
      }
    } catch (err) {
      console.error("Finish work error:", err);
      alert("API hiba történt");
    }
  };

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <div className="max-w-6xl mx-auto mt-10 text-white">

      <h1 className="text-3xl font-bold text-red-600 mb-6">
        Szerelő felület
      </h1>

      {/* FÜLEK */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => { setView("bookings"); loadBookings(); }}
          className={`px-4 py-2 rounded ${view === "bookings" ? "bg-red-600" : "bg-gray-700"}`}
        >
          Foglalások
        </button>

        <button
          onClick={() => { setView("work"); loadWorks(); }}
          className={`px-4 py-2 rounded ${view === "work" ? "bg-red-600" : "bg-gray-700"}`}
        >
          Átvizsgálás utáni időpontok
        </button>
      </div>

      {/* -----------------------------
          FOGLALÁSOK LISTA
      ----------------------------- */}
      {view === "bookings" && (
        <>
          <h2 className="text-xl font-semibold mb-4 text-center">Foglalások</h2>

          {loading ? (
            <p className="text-center">Betöltés...</p>
          ) : (
            <table className="w-full border border-gray-700 text-center">
              <thead className="bg-gray-800">
                <tr>
                  <th className="p-2">Dátum</th>
                  <th className="p-2">Idő</th>
                  <th className="p-2">Szolgáltatás</th>
                  <th className="p-2">Ügyfél</th>
                  <th className="p-2">Autó</th>
                  <th className="p-2">Telcsi</th>
                  <th className="p-2">Művelet</th>
                </tr>
              </thead>

              <tbody>
                {bookings.map(b => (
                  <tr key={b.id} className="border-t border-gray-700">
                    <td className="p-2">{b.appointment_date}</td>
                    <td className="p-2">{b.appointment_time}</td>
                    <td className="p-2">{b.service}</td>

                    <td className="p-2">
                      {b.user_name}
                      <br />
                      <span className="text-sm text-gray-400">{b.user_email}</span>
                    </td>

                    <td className="p-2">
                      {b.car_brand} {b.car_model}
                    </td>

                    <td className="p-2">
                      <a href={`tel:${b.phone_number}`} className="text-blue-400 hover:underline">
                        {b.phone_number}
                      </a>
                    </td>

                    <td className="p-2">
                      {(b.service === "atvizsgalas" || b.service === "Átvizsgálás") && (
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedBooking(b);
                              setShowWorkForm(true);
                            }}
                            className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded"
                          >
                            További időpont
                          </button>

                          <button className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded">
                            🧾
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {/* -----------------------------
          MUNKÁK LISTA
      ----------------------------- */}
      {view === "work" && (
        <>
          <h2 className="text-xl font-semibold mb-4 text-center">
            Átvizsgálás utáni időpontok
          </h2>

          {workLoading ? (
            <p className="text-center">Betöltés...</p>
          ) : works.length === 0 ? (
            <p className="text-center">Nincs folyamatban lévő munka.</p>
          ) : (
            <table className="w-full border border-gray-700 text-center">
              <thead className="bg-gray-800">
                <tr>
                  <th className="p-2">Ügyfél</th>
                  <th className="p-2">Autó</th>
                  <th className="p-2">Időpont</th>
                  <th className="p-2">Telefon</th>
                  <th className="p-2">Megjegyzés</th>
                  <th className="p-2">Állapot</th>
                  <th className="p-2">Művelet</th>
                </tr>
              </thead>

              <tbody>
                {works.map(w => (
                  <tr key={w.id} className="border-t border-gray-700">
                    <td className="p-2">
                      {w.user_name}
                      <br />
                      <span className="text-sm text-gray-400">{w.user_email}</span>
                    </td>

                    <td className="p-2">
                      {w.car_brand} {w.car_model}
                    </td>

                    <td className="p-2">
                      {w.appointment_date} {w.appointment_time}
                    </td>

                    <td className="p-2">
                      <a href={`tel:${w.phone_number}`} className="text-blue-400 hover:underline">
                        {w.phone_number}
                      </a>
                    </td>

                    <td className="p-2">{w.description}</td>

                    <td className="p-2 text-yellow-400">
                      Folyamatban
                    </td>

                    <td className="p-2">
                      <button
                        onClick={() => finishWork(w.id)}
                        className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded"
                      >
                        Kész
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {/* -----------------------------
          MODAL – TOVÁBBI MUNKA
      ----------------------------- */}
      {showWorkForm && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded w-full max-w-md">

            <h3 className="text-xl font-bold mb-4 text-red-600">
              További munka felvétele
            </h3>

            <p className="text-sm text-gray-400 mb-2">
              {selectedBooking.car_brand} {selectedBooking.car_model}
            </p>

            <textarea
              placeholder="Munka leírása"
              value={workDescription}
              onChange={e => setWorkDescription(e.target.value)}
              className="w-full p-2 bg-black border border-gray-700 rounded mb-3"
            />

            <input
              type="date"
              value={workDate}
              max="2030-12-31"
              onChange={e => setWorkDate(e.target.value)}
              className="w-full p-2 bg-black border border-gray-700 rounded mb-3"
            />

            <input
              type="time"
              value={workTime}
              step="1800"
              onChange={e => setWorkTime(e.target.value)}
              className="w-full p-2 bg-black border border-gray-700 rounded mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowWorkForm(false)}
                className="px-4 py-2 bg-gray-700 rounded"
              >
                Mégse
              </button>

              <button
                onClick={submitAdditionalWork}
                className="px-4 py-2 bg-red-600 rounded"
              >
                Mentés
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
