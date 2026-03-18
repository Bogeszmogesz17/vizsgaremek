
export default function Contact() {
  return (
    <div className="space-y-12 max-w-5xl mx-auto">

      <section className="text-center">
        <h1 className="text-4xl font-bold text-red-600">
          Kapcsolat
        </h1>

        <p className="text-gray-400 mt-4">
          Vedd fel velünk a kapcsolatot bizalommal,
          kollégáink készséggel állnak rendelkezésedre.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">

        <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
          <h3 className="text-xl font-semibold text-white">
            Lőcse Dávid
          </h3>

          <p className="text-gray-400 mt-2">
            Telefonszám:{" "}
            <a
              href="tel:+36301234567"
              className="text-gray-300 hover:text-red-500 transition"
            >
              +36 30 123 4567
            </a>
          </p>

          <p className="text-gray-400">
            E-mail:{" "}
            <a
              href="mailto:peter.kovacs@autoszerviz.hu"
              className="text-gray-300 hover:text-red-500 transition"
            >
              peter.kovacs@autoszerviz.hu
            </a>
          </p>
        </div>


        <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
          <h3 className="text-xl font-semibold text-white">
            Balla Kristóf
          </h3>

          <p className="text-gray-400 mt-2">
            Telefonszám:{" "}
            <a
              href="tel:+36204269789"
              className="text-gray-300 hover:text-red-500 transition"
            >
              +36 20 426 9789
            </a>
          </p>

          <p className="text-gray-400">
            E-mail:{" "}
            <a
              href="mailto:ballabk02@gmail.com"
              className="text-gray-300 hover:text-red-500 transition"
            >
              ballabk02@gmail.com
            </a>
          </p>
        </div>

      </section>

      <section className="bg-gray-900 p-6 rounded-lg border border-gray-800">
        <h3 className="text-lg font-semibold text-white">
          Szerviz címe
        </h3>

        <p className="text-gray-400 mt-2">
          2699 Szügy, Béke utca 9.
        </p>
      </section>

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
