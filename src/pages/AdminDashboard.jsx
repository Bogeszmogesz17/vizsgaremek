import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [view, setView] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [works, setWorks] = useState([]);
  const [workLoading, setWorkLoading] = useState(false);

  // 🔐 ADMIN CHECK
  useEffect(() => {
    fetch("http://localhost/vizsga/api/admin_check.php", {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
        if (!data.success) {
          navigate("/admin-login");
        } else {
          loadBookings();
        }
      });
  }, []);

  // 📅 Félórás foglalások
  const loadBookings = () => {
    setLoading(true);
    fetch("http://localhost/vizsga/api/admin_bookings_list.php", {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setBookings(data.bookings);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  // 🛠️ Folyamatban lévő munkák
  const loadWorks = () => {
    setWorkLoading(true);
    fetch("http://localhost/vizsga/api/admin_work_list.php", {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setWorks(data.works);
        setWorkLoading(false);
      })
      .catch(() => setWorkLoading(false));
  };

  // ➕ További munka indítása
  const startAdditionalWork = async (bookingId) => {
    const res = await fetch(
      "http://localhost/vizsga/api/start_additional_work.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ booking_id: bookingId })
      }
    );
    const data = await res.json();
    if (data.success) loadWorks();
    else alert(data.message);
  };

  // ✅ Munka lezárása
  const finishWork = async (workId) => {
    const res = await fetch(
      "http://localhost/vizsga/api/finish_work.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ work_id: workId })
      }
    );
    const data = await res.json();
    if (data.success) loadWorks();
    else alert(data.message);
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 text-white">

      <h1 className="text-3xl font-bold text-red-600 mb-6">
        Admin felület
      </h1>

      {/* NÉZETVÁLTÓ */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => { setView("bookings"); loadBookings(); }}
          className={`px-4 py-2 rounded ${view === "bookings" ? "bg-red-600" : "bg-gray-700"}`}
        >
          Félórás foglalások
        </button>

        <button
          onClick={() => { setView("work"); loadWorks(); }}
          className={`px-4 py-2 rounded ${view === "work" ? "bg-red-600" : "bg-gray-700"}`}
        >
          Folyamatban lévő munkák
        </button>
      </div>

      {/* ====== FÉLÓRÁS FOGLALÁSOK ====== */}
      {view === "bookings" && (
        <>
          <h2 className="text-xl font-semibold mb-4">Foglalások</h2>

          {loading ? <p>Betöltés...</p> : (
            <table className="w-full border border-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th className="p-2">Dátum</th>
                  <th className="p-2">Idő</th>
                  <th className="p-2">Szolgáltatás</th>
                  <th className="p-2">Ügyfél</th>
                  <th className="p-2">Autó</th>
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
                      {b.user_name}<br />
                      <span className="text-sm text-gray-400">{b.user_email}</span>
                    </td>
                    <td className="p-2">
                      {b.car_brand} {b.car_model}
                    </td>
                    <td className="p-2">
                      {b.service === "atvizsgalas" && (
                        <button
                          onClick={() => startAdditionalWork(b.id)}
                          className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded"
                        >
                          További munka
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {/* ====== FOLYAMATBAN LÉVŐ MUNKÁK ====== */}
      {view === "work" && (
        <>
          <h2 className="text-xl font-semibold mb-4">
            Folyamatban lévő munkák
          </h2>

          {workLoading ? <p>Betöltés...</p> :
            works.length === 0 ? <p>Nincs folyamatban lévő munka.</p> : (
              <table className="w-full border border-gray-700">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="p-2">Ügyfél</th>
                    <th className="p-2">Autó</th>
                    <th className="p-2">Átvétel</th>
                    <th className="p-2">Állapot</th>
                    <th className="p-2">Művelet</th>
                  </tr>
                </thead>
                <tbody>
                  {works.map(w => (
                    <tr key={w.id} className="border-t border-gray-700">
                      <td className="p-2">
                        {w.user_name}<br />
                        <span className="text-sm text-gray-400">{w.user_email}</span>
                      </td>
                      <td className="p-2">
                        {w.car_brand} {w.car_model}
                      </td>
                      <td className="p-2">
                        {w.appointment_date} {w.appointment_time}
                      </td>
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
    </div>
  );
}
