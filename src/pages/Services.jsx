import { useState, useEffect } from "react";
import { apiUrl } from "../lib/api";
const serviceDescriptions = {
  "Átvizsgálás": "Állapotfelmérés motor, futómű és fékrendszer ellenőrzésével.",
  "Dióhéjas szívósor tisztítás": "Kokszlerakódások eltávolítása kíméletes dióhéj szórással.",
  "Gumizás/Centrírozás": "Szezonális kerékcsere és rezgésmentes centrírozás.",
  "Kipufogó gyártás / javítás": "Kipufogórendszer elemeinek javítása vagy egyedi gyártása.",
  "Motor- és futómű felújítás / karbantartás": "Komplex javítás és megelőző karbantartás hosszú távú üzembiztonsághoz.",
  "Olajcsere / szűrők (olajszűrő, levegőszűrő, pollenszűrő, üzemanyagszűrő)": "Olaj és szűrők cseréje gyári előírások szerint.",
};

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openServiceId, setOpenServiceId] = useState(null);

  useEffect(() => {
    fetch(apiUrl("/catalog/services.php?base_only=1"), {
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
      <section className="text-center">
        <h1 className="text-4xl font-bold text-red-600">
          Szolgáltatásaink
        </h1>

        <p className="text-gray-400 mt-4">
          Szervizünk az alábbi szolgáltatásokat nyújtja.
          Az árak minden esetben helyszíni egyeztetés alapján kerülnek meghatározásra.
        </p>
      </section>

      {loading && (
        <p className="text-center text-gray-400">Betöltés...</p>
      )}

      <section className="space-y-4">

        {services.map((service) => {
          const isOpen = openServiceId === service.id;
          const description =
            serviceDescriptions[service.name] ?? "Röviden: professzionális, megbízható kivitelezés szervizünkben.";

          return (
            <div
              key={service.id}
              className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenServiceId(isOpen ? null : service.id)}
                className="w-full text-left p-6 flex items-center justify-between hover:bg-gray-800 transition"
              >
                <h3 className="text-xl font-semibold text-white">
                  {service.name}
                </h3>
                <span
                  className={`text-gray-300 text-lg transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                >
                  ▼
                </span>
              </button>

              {isOpen && (
                <div className="px-6 pb-6 pt-0">
                  <p className="text-gray-300 text-sm sm:text-base">
                    {description}
                  </p>
                </div>
              )}
            </div>
          );
        })}

      </section>

    </div>
  );
}
