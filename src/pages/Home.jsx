// ===============================
// FŐOLDAL – MODERN BEMUTATKOZÁS
// ===============================

import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Home() {

 const [logoutPopup, setLogoutPopup] = useState(false);
const location = useLocation();

useEffect(() => {

  if (location.state?.logoutSuccess) {
    setLogoutPopup(true);
  }

}, [location]);

  return (
    <div className="space-y-20">

      {/* HERO */}
      <section className="text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold text-red-600">
          Megbízható autószerviz, modern megoldásokkal
        </h1>

        <p className="text-gray-400 max-w-2xl mx-auto text-lg">
          Szervizünk célja, hogy gyors, átlátható és megbízható megoldást
          nyújtson minden autótulajdonos számára. Online rendszerünk
          segítségével egyszerűen foglalhatsz időpontot,
          sorban állás nélkül.
        </p>

        <div className="flex justify-center gap-4">
          <Link
            to="/idopont"
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition"
          >
            Időpont foglalása
          </Link>

          <Link
            to="/szolgaltatasok"
            className="border border-gray-700 hover:border-red-600 text-gray-300 px-6 py-3 rounded-lg transition"
          >
            Szolgáltatások
          </Link>
        </div>
      </section>


      {/* BEMUTATKOZÁS */}
      <section className="max-w-4xl mx-auto text-gray-400 space-y-4 text-center">
        <p>
          Tapasztalt szerelőcsapatunk több éves szakmai múlttal rendelkezik,
          legyen szó általános szervizről, hibafeltárásról vagy karbantartásról.
        </p>
        <p>
          Hiszünk abban, hogy az átlátható kommunikáció és a precíz munkavégzés
          hosszú távon bizalmat épít ügyfeleinkkel.
        </p>
      </section>


      {/* KÁRTYÁK */}
      <section className="grid gap-6 md:grid-cols-3">

        <div className="bg-gray-900 hover:bg-gray-800 transition p-6 rounded-xl border border-gray-800">
          <h3 className="text-xl font-semibold text-white">
            Gyors ügyintézés
          </h3>
          <p className="text-gray-400 mt-3">
            Online időpontfoglalásunkkal egyszerűen és gyorsan intézheted
            a szervizlátogatást.
          </p>
        </div>

        <div className="bg-gray-900 hover:bg-gray-800 transition p-6 rounded-xl border border-gray-800">
          <h3 className="text-xl font-semibold text-white">
            Szakértő csapat
          </h3>
          <p className="text-gray-400 mt-3">
            Szerelőink naprakész tudással és modern eszközökkel dolgoznak.
          </p>
        </div>

        <div className="bg-gray-900 hover:bg-gray-800 transition p-6 rounded-xl border border-gray-800">
          <h3 className="text-xl font-semibold text-white">
            Átlátható folyamat
          </h3>
          <p className="text-gray-400 mt-3">
            A javítás minden lépéséről tájékoztatást kapsz,
            rejtett költségek nélkül.
          </p>
        </div>

      </section>


      {/* CTA */}
      <section className="bg-gradient-to-r from-gray-900 to-black p-8 rounded-xl text-center border border-gray-800">
        <h2 className="text-2xl font-bold text-white">
          Készen állsz az időpontfoglalásra?
        </h2>

        <p className="text-gray-400 mt-2">
          Néhány kattintás, és máris rögzítetted az időpontodat.
        </p>

        <Link
          to="/idopont"
          className="inline-block mt-6 bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-lg transition"
        >
          Időpont foglalása
        </Link>
      </section>


      {/* ===============================
          KIJELENTKEZÉS POPUP
         =============================== */}

      {logoutPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999]">

          <div className="bg-green-700 p-8 rounded text-center max-w-sm w-full">

            <p className="text-white text-lg mb-6">
              Sikeres kijelentkezés
            </p>

            <button

              onClick={() => setLogoutPopup(false)}
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