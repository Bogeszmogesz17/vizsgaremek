import { useState, useEffect } from "react";

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // -------------------------------
  // Adatok betöltése adatbázisból
  // -------------------------------
  useEffect(() => {
    fetch("http://localhost/vizsga/api/services.php", {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setServices(data.services);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-12 max-w-4xl mx-auto">

      {/* ---------- CÍM ---------- */}
      <section className="text-center">
        <h1 className="text-4xl font-bold text-red-600">
          Szolgáltatásaink
        </h1>

        <p className="text-gray-400 mt-4">
          Szervizünk az alábbi szolgáltatásokat nyújtja.
          Az árak minden esetben helyszíni egyeztetés alapján kerülnek meghatározásra.
        </p>
      </section>

      {/* ---------- TÖLTÉS ---------- */}
      {loading && (
        <p className="text-center text-gray-400">Betöltés...</p>
      )}

      {/* ---------- SZOLGÁLTATÁS LISTA ---------- */}
      <section className="space-y-4">

        {services.map((service) => (
          <div
            key={service.id}
            className="bg-gray-900 hover:bg-gray-800 transition p-6 rounded-lg border border-gray-800"
          >
            <h3 className="text-xl font-semibold text-white">
              {service.name}
            </h3>
          </div>
        ))}

      </section>

    </div>
  );
}