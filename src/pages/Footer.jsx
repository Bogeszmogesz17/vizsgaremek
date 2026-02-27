import { Link, useLocation } from "react-router-dom";

export default function Footer() {
  const location = useLocation();

  // Ha az útvonal (URL) tartalmazza az "admin" szót, akkor nem jelenítjük meg a láblécet
  if (location.pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="bg-black border-t border-gray-800 pt-10 pb-6 mt-10">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Bal oszlop: Céginfó */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-red-600 tracking-tight">DUPLA DUGATTYÚ MŰHELY</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Modern megoldások, precíz munkavégzés és átlátható árazás. 
            Mert tudjuk, hogy az autód nem csak egy tárgy, hanem a mindennapjaid része.
          </p>
        </div>

        {/* Középső oszlop: Navigáció */}
        <div className="flex flex-col space-y-2">
          <h4 className="text-white font-semibold mb-2">Gyorslinkek</h4>
          <Link to="/" className="text-gray-400 hover:text-red-500 transition text-sm w-fit">Főoldal</Link>
          <Link to="/szolgaltatasok" className="text-gray-400 hover:text-red-500 transition text-sm w-fit">Szolgáltatások</Link>
          <Link to="/idopont" className="text-gray-400 hover:text-red-500 transition text-sm w-fit">Időpontfoglalás</Link>
          <Link to="/kapcsolat" className="text-gray-400 hover:text-red-500 transition text-sm w-fit">Kapcsolat</Link>
        </div>

        {/* Jobb oszlop: Elérhetőség */}
        <div className="space-y-3">
          <h4 className="text-white font-semibold mb-2">Kapcsolat</h4>
          <div className="text-gray-400 text-sm space-y-1">
            <p>📍 1234 Budapest, Szerviz utca 42.</p>
            <p>📞 +36 30 123 4567</p>
            <p>✉️ info@autoszervizpro.hu</p>
            <p className="pt-2 text-red-500 font-medium">H-P: 08:00 - 17:00</p>
          </div>
        </div>
      </div>

      {/* Alsó sáv: Copyright */}
      <div className="max-w-7xl mx-auto px-4 mt-10 pt-6 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
        <p>&copy; 2026 Autószerviz Pro. Minden jog fenntartva.</p>
        <div className="flex gap-6">
          <span className="hover:text-gray-300 cursor-pointer">Adatkezelési tájékoztató</span>
          <span className="hover:text-gray-300 cursor-pointer">ÁSZF</span>
        </div>
      </div>
    </footer>
  );
}