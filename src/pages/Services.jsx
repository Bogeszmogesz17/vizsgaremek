// ===============================
// SZOLGÁLTATÁSOK OLDAL
// Hosszú, egymás alatti hasábok
// ===============================

export default function Services() {
  // -------------------------------
  // Szolgáltatások listája
  // (később adatbázisból)
  // -------------------------------
  const services = [
    {
      title: "Gumizás/Centrírozás",
      description:
        "Nyári és téli gumik cseréje, szerelése és ellenőrzése modern eszközökkel. Kerekek pontos centrírozása a vibráció csökkentése és a komfortos vezetés érdekében."
    },
    {
      title: "Átvizsgálás",
      description:
        "Általános műszaki átvizsgálás, amely segít feltárni a rejtett hibákat."
    },
    {
      title: "Motor- és futómű felújítás / karbantartás",
      description:
        "Motor és futómű elemek javítása, karbantartása a hosszú élettartam érdekében."
    },
    {
      title: "Dióhéjas szívósor tisztítás",
      description:
        "Speciális dióhéjas technológiával végzett szívósor tisztítás a hatékonyabb motor működésért."
    },
    {
      title: "Kipufogó gyártás / javítás",
      description:
        "Egyedi kipufogó elemek gyártása és meglévő rendszerek javítása."
    }
  ];

  return (
    <div className="space-y-12 max-w-4xl mx-auto">

      {/* ---------- CÍM ÉS LEÍRÁS ---------- */}
      <section className="text-center">
        <h1 className="text-4xl font-bold text-red-600">
          Szolgáltatásaink
        </h1>

        <p className="text-gray-400 mt-4">
          Szervizünk az alábbi szolgáltatásokat nyújtja.
          Az árak minden esetben helyszíni egyeztetés alapján kerülnek meghatározásra.
        </p>
      </section>

      {/* ---------- SZOLGÁLTATÁS LISTA ---------- */}
      <section className="space-y-4">

        {services.map((service, index) => (
          <div
            key={index}
            className="bg-gray-900 hover:bg-gray-800 transition p-6 rounded-lg border border-gray-800"
          >
            <h3 className="text-xl font-semibold text-white">
              {service.title}
            </h3>

            <p className="text-gray-400 mt-2">
              {service.description}
            </p>

            <p className="text-sm text-gray-500 mt-3">
              Ár: helyszíni egyeztetés alapján
            </p>
          </div>
        ))}

      </section>

    </div>
  );
}
