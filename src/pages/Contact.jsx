// ===============================
// KAPCSOLAT OLDAL
// Két szerelő + térkép
// ===============================

export default function Contact() {
  return (
    <div className="space-y-12 max-w-5xl mx-auto">

      {/* ---------- CÍM ---------- */}
      <section className="text-center">
        <h1 className="text-4xl font-bold text-red-600">
          Kapcsolat
        </h1>

        <p className="text-gray-400 mt-4">
          Vedd fel velünk a kapcsolatot bizalommal,
          kollégáink készséggel állnak rendelkezésedre.
        </p>
      </section>

      {/* ---------- SZERELŐK KÁRTYÁI ---------- */}
      <section className="grid gap-6 md:grid-cols-2">

        {/* SZERELŐ 1 */}
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
          <h3 className="text-xl font-semibold text-white">
            Kovács Péter
          </h3>

          <p className="text-gray-400 mt-2">
            Telefonszám: +36 30 123 4567
          </p>

          <p className="text-gray-400">
            E-mail: peter.kovacs@autoszerviz.hu
          </p>
        </div>

        {/* SZERELŐ 2 */}
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
          <h3 className="text-xl font-semibold text-white">
            Nagy László
          </h3>

          <p className="text-gray-400 mt-2">
            Telefonszám: +36 20 987 6543
          </p>

          <p className="text-gray-400">
            E-mail: laszlo.nagy@autoszerviz.hu
          </p>
        </div>

      </section>

      {/* ---------- CÍM ---------- */}
      <section className="bg-gray-900 p-6 rounded-lg border border-gray-800">
        <h3 className="text-lg font-semibold text-white">
          Szerviz címe
        </h3>

        <p className="text-gray-400 mt-2">
          2699 Szügy, Béke utca 9.
        </p>
      </section>

      {/* ---------- TÉRKÉP ---------- */}
      <section className="bg-gray-900 p-4 rounded-lg border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">
          Térkép
        </h3>

        <div className="w-full h-80 rounded overflow-hidden">
          <iframe
            title="Térkép"
            src="https://www.google.com/maps?q=Szügy+Béke+utca+9&output=embed"
            className="w-full h-full border-0"
            loading="lazy"
          ></iframe>
        </div>
      </section>

    </div>
  );
}
