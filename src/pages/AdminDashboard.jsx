import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost/vizsga/api/admin_bookings_list.php", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        if (!data.success) {
          setError(data.message || "Nem sikerült betölteni a foglalásokat");
          return;
        }
        setBookings(data.bookings);
        setLoading(false);
      })
      .catch(() => {
        setError("Szerverhiba");
      });
  }, []);

  if (loading) {
    return <p className="text-gray-400">Foglalások betöltése...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-red-600">
        Admin Dashboard – Foglalások
      </h1>

      {bookings.length === 0 ? (
        <p className="text-gray-400">Nincs még foglalás.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border border-gray-800">
            <thead className="bg-gray-900">
              <tr>
                <th className="p-3 border-b border-gray-800">Dátum</th>
                <th className="p-3 border-b border-gray-800">Idő</th>
                <th className="p-3 border-b border-gray-800">Szolgáltatás</th>
                <th className="p-3 border-b border-gray-800">Ügyfél</th>
                <th className="p-3 border-b border-gray-800">Státusz</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id} className="hover:bg-gray-900">
                  <td className="p-3 border-b border-gray-800">
                    {b.appointment_date}
                  </td>
                  <td className="p-3 border-b border-gray-800">
                    {b.appointment_time}
                  </td>
                  <td className="p-3 border-b border-gray-800">
                    {b.service_name}
                  </td>
                  <td className="p-3 border-b border-gray-800">
                    {b.user_name}<br />
                    <span className="text-gray-400 text-sm">
                      {b.user_email}
                    </span>
                  </td>
                  <td className="p-3 border-b border-gray-800">
                    {b.status === "0" ? "Folyamatban" : "Kész"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
