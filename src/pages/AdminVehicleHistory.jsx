import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../lib/api";

const formatPrice = (value) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return "0 Ft";
  return `${numericValue.toLocaleString("hu-HU")} Ft`;
};

const formatVehicle = (item) => {
  const base = [item.car_brand, item.car_model].filter(Boolean).join(" ");
  const details = [
    item.car_year ? `${item.car_year}` : "",
    item.fuel_type || "",
    item.engine_size ? `${item.engine_size} cm³` : "",
  ].filter(Boolean);

  if (!details.length) return base || "Ismeretlen jármű";
  return `${base} (${details.join(", ")})`;
};

export default function AdminVehicleHistory() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [activeCustomerFilter, setActiveCustomerFilter] = useState("");
  const [historyRows, setHistoryRows] = useState([]);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");

  const logout = async () => {
    try {
      await fetch(apiUrl("/auth/session.php"), {
        method: "DELETE",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      navigate("/admin-login", { state: { logoutSuccess: true } });
    }
  };

  const loadHistory = useCallback(async (customerFilter = "") => {
    setLoading(true);
    setMsg("");
    setMsgType("");

    try {
      const query = customerFilter
        ? `?customer=${encodeURIComponent(customerFilter)}`
        : "";

      const res = await fetch(apiUrl(`/admin/vehicle-history.php${query}`), {
        credentials: "include",
      });
      const data = await res.json();

      if (!data.success) {
        setHistoryRows([]);
        setMsg(data.message || "A keresés nem sikerült");
        setMsgType("error");
        return;
      }

      setHistoryRows(Array.isArray(data.history) ? data.history : []);
      setActiveCustomerFilter(customerFilter);
    } catch (err) {
      console.error("Vehicle history load error:", err);
      setHistoryRows([]);
      setMsg("API hiba történt a lekérdezés közben");
      setMsgType("error");
    } finally {
      setLoading(false);
    }
  }, []);

  const onSubmitSearch = async (event) => {
    event.preventDefault();
    await loadHistory(searchValue.trim());
  };

  const clearSearch = async () => {
    setSearchValue("");
    await loadHistory("");
  };

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch(apiUrl("/admin/session.php"), {
          credentials: "include",
        });
        const data = await res.json();

        if (!data.success) {
          navigate("/admin-login");
          return;
        }

        await loadHistory("");
      } catch (err) {
        console.error("Admin check error:", err);
        navigate("/admin-login");
      }
    };

    checkAdmin();
  }, [loadHistory, navigate]);

  return (
    <div className="max-w-6xl mx-auto mt-6 sm:mt-10 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-red-600">
          Autó előélet kereső
        </h1>
        <div className="flex flex-wrap gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => navigate("/admin")}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm sm:text-base"
          >
            Vissza az admin felületre
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/profil")}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm sm:text-base"
          >
            Profil oldal
          </button>
          <button
            type="button"
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm sm:text-base"
          >
            Kijelentkezés
          </button>
        </div>
      </div>

      <form
        onSubmit={onSubmitSearch}
        className="bg-gray-900 border border-gray-700 rounded-xl p-4 sm:p-5 mb-6"
      >
        <label className="block text-sm text-gray-300 mb-2">
          Keresés ügyfél alapján (név, email vagy telefonszám)
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Pl.: Kiss Anna, anna@email.hu vagy 0630..."
            className="flex-1 bg-black border border-gray-700 rounded px-3 py-2"
          />
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
          >
            Keresés
          </button>
          <button
            type="button"
            onClick={clearSearch}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
          >
            Szűrés törlése
          </button>
        </div>
      </form>

      {msg && (
        <div
          className={`mb-6 p-3 rounded text-center break-words ${
            msgType === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {msg}
        </div>
      )}

      <div className="mb-4 text-sm text-gray-300">
        {activeCustomerFilter ? (
          <p>
            Aktív ügyfél szűrés: <span className="text-red-400">{activeCustomerFilter}</span>
          </p>
        ) : (
          <p>Minden ügyfél előzményei láthatók (max. 300 rekord).</p>
        )}
      </div>

      {loading ? (
        <p className="text-center">Betöltés...</p>
      ) : historyRows.length === 0 ? (
        <p className="text-center">Nincs találat a megadott szűrésre.</p>
      ) : (
        <div className="space-y-3">
          {historyRows.map((item) => {
            const isDone = Number(item.status) === 1;
            const totalPrice = Number(item.work_price || 0) + Number(item.material_price || 0);
            return (
              <article
                key={item.id}
                className="bg-gray-900 border border-gray-700 rounded-xl p-4 sm:p-5"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-red-400">
                      {item.user_name || "Ismeretlen ügyfél"}
                    </h2>
                    <p className="text-sm text-gray-400 break-all">{item.user_email || "-"}</p>
                    <p className="text-sm">{item.phone_number || "-"}</p>
                    <p className="text-sm text-gray-300 break-words">{item.user_address || "-"}</p>
                  </div>
                  <span
                    className={`self-start px-3 py-1 rounded text-sm font-semibold ${
                      isDone ? "bg-green-700" : "bg-yellow-700"
                    }`}
                  >
                    {isDone ? "Lezárt" : "Folyamatban"}
                  </span>
                </div>

                <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                  <p>
                    <span className="text-gray-400">Autó:</span>{" "}
                    <span className="font-medium">{formatVehicle(item)}</span>
                  </p>
                  <p>
                    <span className="text-gray-400">Időpont:</span>{" "}
                    <span className="font-medium">
                      {item.appointment_date || "-"} {item.appointment_time || ""}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-400">Esemény:</span>{" "}
                    <span className="font-medium break-words">{item.services || "-"}</span>
                  </p>
                  <p>
                    <span className="text-gray-400">Munkadíj:</span>{" "}
                    <span className="font-medium">{formatPrice(item.work_price)}</span>
                  </p>
                  <p>
                    <span className="text-gray-400">Anyagköltség:</span>{" "}
                    <span className="font-medium">{formatPrice(item.material_price)}</span>
                  </p>
                  <p>
                    <span className="text-gray-400">Összesen:</span>{" "}
                    <span className="font-medium text-red-400">{formatPrice(totalPrice)}</span>
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
