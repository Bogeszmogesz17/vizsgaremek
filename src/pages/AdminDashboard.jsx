import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../lib/api";
const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatPrice = (value) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return "0 Ft";
  return `${numericValue.toLocaleString("hu-HU")} Ft`;
};

const formatAddress = (value = "") =>
  String(value)
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");

const buildInvoiceNumber = (workId) =>
  `SZ-${String(workId || 0).padStart(6, "0")}-${new Date()
    .toISOString()
    .slice(0, 10)
    .replaceAll("-", "")}`;

const buildInvoicePreviewHtml = ({ company, booking }) => {
  const invoiceNumber = buildInvoiceNumber(booking.id);
  const issueDate = new Date().toLocaleDateString("hu-HU");
  const serviceName = booking.service || booking.description || "Munkafolyamat";
  const customerAddress = formatAddress(booking.user_address || "");
  const companyAddress = formatAddress(company.address || "");
  const workPrice = Number(booking.work_price) || 0;
  const materialPrice = Number(booking.material_price) || 0;
  const totalPrice = workPrice + materialPrice;

  return `
    <!doctype html>
    <html lang="hu">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Számla - ${escapeHtml(invoiceNumber)}</title>
        <style>
          :root {
            color-scheme: light;
          }
          body {
            margin: 0;
            background: #f3f4f6;
            color: #111827;
            font-family: Arial, Helvetica, sans-serif;
          }
          .container {
            max-width: 900px;
            margin: 0 auto;
            padding: 24px 16px 40px;
          }
          .actions {
            display: flex;
            gap: 12px;
            margin-bottom: 16px;
          }
          .actions button {
            border: none;
            border-radius: 8px;
            padding: 10px 14px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
          }
          #print-btn {
            background: #111827;
            color: #fff;
          }
          #email-btn {
            background: #2563eb;
            color: #fff;
          }
          #email-btn[disabled] {
            opacity: 0.7;
            cursor: wait;
          }
          .invoice {
            background: #fff;
            border: 1px solid #d1d5db;
            border-radius: 12px;
            box-shadow: 0 10px 28px rgba(0, 0, 0, 0.08);
            overflow: hidden;
          }
          .header {
            display: flex;
            justify-content: space-between;
            gap: 20px;
            padding: 22px 24px;
            border-bottom: 1px solid #e5e7eb;
          }
          .header h1 {
            margin: 0 0 6px;
            font-size: 28px;
          }
          .header p {
            margin: 0;
            line-height: 1.5;
          }
          .meta {
            text-align: right;
            min-width: 220px;
            line-height: 1.5;
          }
          .section-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 20px;
            padding: 20px 24px 4px;
          }
          .section-grid h2 {
            margin: 0 0 10px;
            font-size: 16px;
          }
          .section-grid p {
            margin: 0 0 6px;
            line-height: 1.45;
            font-size: 14px;
          }
          .table-wrap {
            padding: 4px 24px 24px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th,
          td {
            border: 1px solid #d1d5db;
            padding: 10px;
            text-align: left;
            font-size: 14px;
          }
          th {
            background: #f9fafb;
          }
          .amount {
            text-align: right;
            white-space: nowrap;
          }
          .totals {
            margin-top: 14px;
            margin-left: auto;
            max-width: 340px;
            border: 1px solid #d1d5db;
            border-radius: 10px;
            overflow: hidden;
          }
          .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 12px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 14px;
          }
          .totals-row:last-child {
            border-bottom: none;
          }
          .totals-row.grand {
            background: #111827;
            color: #fff;
            font-weight: 700;
            font-size: 15px;
          }
          .footer-note {
            padding: 0 24px 24px;
            margin: 0;
            color: #4b5563;
            font-size: 13px;
            line-height: 1.5;
          }
          @media (max-width: 700px) {
            .header {
              flex-direction: column;
            }
            .meta {
              text-align: left;
            }
            .section-grid {
              grid-template-columns: 1fr;
            }
          }
          @media print {
            body {
              background: #fff;
            }
            .container {
              padding: 0;
              max-width: none;
            }
            .actions {
              display: none !important;
            }
            .invoice {
              border-radius: 0;
              box-shadow: none;
              border: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="actions">
            <button id="print-btn" type="button">Nyomtatás</button>
            <button id="email-btn" type="button">Email küldés ügyfélnek</button>
          </div>

          <article class="invoice">
            <header class="header">
              <div>
                <h1>Számla</h1>
                <p><strong>${escapeHtml(company.company_name || "")}</strong></p>
                <p>${escapeHtml(companyAddress)}</p>
                <p>${escapeHtml(company.phone || "")}</p>
                <p>${escapeHtml(company.email || "")}</p>
              </div>
              <div class="meta">
                <p><strong>Számlaszám:</strong> ${escapeHtml(invoiceNumber)}</p>
                <p><strong>Kiállítás dátuma:</strong> ${escapeHtml(issueDate)}</p>
                <p><strong>Adószám:</strong> ${escapeHtml(company.tax_number || "-")}</p>
                <p><strong>Cégjegyzékszám:</strong> ${escapeHtml(company.registration_number || "-")}</p>
              </div>
            </header>

            <section class="section-grid">
              <div>
                <h2>Számla kiállítója</h2>
                <p><strong>Cég:</strong> ${escapeHtml(company.company_name || "")}</p>
                <p><strong>Cím:</strong> ${escapeHtml(companyAddress)}</p>
                <p><strong>Email:</strong> ${escapeHtml(company.email || "")}</p>
                <p><strong>Telefon:</strong> ${escapeHtml(company.phone || "")}</p>
                <p><strong>Bankszámla:</strong> ${escapeHtml(company.bank_account || "-")}</p>
              </div>
              <div>
                <h2>Ügyfél adatai</h2>
                <p><strong>Név:</strong> ${escapeHtml(booking.user_name || "")}</p>
                <p><strong>Email:</strong> ${escapeHtml(booking.user_email || "")}</p>
                <p><strong>Telefon:</strong> ${escapeHtml(booking.phone_number || "")}</p>
                <p><strong>Cím:</strong> ${escapeHtml(customerAddress || "-")}</p>
              </div>
            </section>

            <section class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Szolgáltatás</th>
                    <th>Foglalás időpontja</th>
                    <th>Autó</th>
                    <th class="amount">Munkadíj</th>
                    <th class="amount">Anyagköltség</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>${escapeHtml(serviceName)}</td>
                    <td>${escapeHtml(`${booking.appointment_date || ""} ${booking.appointment_time || ""}`.trim())}</td>
                    <td>${escapeHtml(`${booking.car_brand || ""} ${booking.car_model || ""}`.trim())}</td>
                    <td class="amount">${escapeHtml(formatPrice(workPrice))}</td>
                    <td class="amount">${escapeHtml(formatPrice(materialPrice))}</td>
                  </tr>
                </tbody>
              </table>

              <div class="totals">
                <div class="totals-row">
                  <span>Munkadíj</span>
                  <strong>${escapeHtml(formatPrice(workPrice))}</strong>
                </div>
                <div class="totals-row">
                  <span>Anyagköltség</span>
                  <strong>${escapeHtml(formatPrice(materialPrice))}</strong>
                </div>
                <div class="totals-row grand">
                  <span>Végösszeg</span>
                  <strong>${escapeHtml(formatPrice(totalPrice))}</strong>
                </div>
              </div>
            </section>

            <p class="footer-note">
              Ez a számla előnézet a szerelő felületen készült. A dokumentum nyomtatható, illetve emailben kiküldhető az ügyfél részére.
            </p>
          </article>
        </div>

        <script>
          const workId = ${JSON.stringify(Number(booking.id) || 0)};
          const emailApiUrl = ${JSON.stringify("http://localhost/vizsga/api/v1/admin/invoice-email.php")};

          const printButton = document.getElementById("print-btn");
          const emailButton = document.getElementById("email-btn");

          printButton?.addEventListener("click", () => {
            window.print();
          });

          emailButton?.addEventListener("click", async () => {
            if (!workId) {
              alert("Hiányzik a számla azonosító.");
              return;
            }

            const originalText = emailButton.textContent;
            emailButton.disabled = true;
            emailButton.textContent = "Küldés...";

            try {
              const response = await fetch(emailApiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ work_id: workId }),
              });
              const data = await response.json();

              if (!data.success) {
                alert(data.message || "Az email küldése sikertelen.");
                return;
              }

              alert(data.message || "A számla email elküldve.");
            } catch (error) {
              alert("API hiba történt az email küldése közben.");
            } finally {
              emailButton.disabled = false;
              emailButton.textContent = originalText;
            }
          });
        </script>
      </body>
    </html>
  `;
};

export default function AdminDashboard() {
  const navigate = useNavigate();
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

  const [view, setView] = useState("bookings");

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingsPage, setBookingsPage] = useState(1);
  const [bookingSearchTerm, setBookingSearchTerm] = useState("");
  const [bookingSearchType, setBookingSearchType] = useState("all");

  const [works, setWorks] = useState([]);
  const [workLoading, setWorkLoading] = useState(false);
  const [workSearchTerm, setWorkSearchTerm] = useState("");
  const [workSearchType, setWorkSearchType] = useState("all");

  const [showWorkForm, setShowWorkForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [workDescription, setWorkDescription] = useState("");
  const [workDate, setWorkDate] = useState("");
  const [workTime, setWorkTime] = useState("");
  const [confirmCancelId, setConfirmCancelId] = useState(null);

  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");
  const [companyData, setCompanyData] = useState(null);
  const removeDiacritics = (value = "") =>
    value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const isInspectionBooking = (serviceName = "") =>
    removeDiacritics(serviceName).toLowerCase().includes("atvizsg");
  const normalizedBookingSearch = bookingSearchTerm.trim().toLowerCase();
  const filteredBookings = bookings.filter((b) => {
    if (!normalizedBookingSearch) return true;

    const service = (b.service || "").toLowerCase();
    const appointmentDate = (b.appointment_date || "").toLowerCase();
    const customer = `${b.user_name || ""} ${b.user_email || ""}`.toLowerCase();

    if (bookingSearchType === "service") {
      return service.includes(normalizedBookingSearch);
    }

    if (bookingSearchType === "day") {
      return appointmentDate.includes(normalizedBookingSearch);
    }

    if (bookingSearchType === "customer") {
      return customer.includes(normalizedBookingSearch);
    }

    return (
      service.includes(normalizedBookingSearch) ||
      appointmentDate.includes(normalizedBookingSearch) ||
      customer.includes(normalizedBookingSearch)
    );
  });
  const bookingsPerPage = 10;
  const totalBookingPages = Math.max(1, Math.ceil(filteredBookings.length / bookingsPerPage));
  const paginatedBookings = filteredBookings.slice(
    (bookingsPage - 1) * bookingsPerPage,
    bookingsPage * bookingsPerPage
  );
  const normalizedWorkSearch = workSearchTerm.trim().toLowerCase();
  const filteredWorks = works.filter((w) => {
    if (!normalizedWorkSearch) return true;

    const description = (w.description || "").toLowerCase();
    const appointmentDate = (w.appointment_date || "").toLowerCase();

    if (workSearchType === "work") {
      return description.includes(normalizedWorkSearch);
    }

    if (workSearchType === "day") {
      return appointmentDate.includes(normalizedWorkSearch);
    }

    return (
      description.includes(normalizedWorkSearch) ||
      appointmentDate.includes(normalizedWorkSearch)
    );
  });


  async function loadBookings() {
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/admin/bookings.php"), {
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        setBookings(data.bookings);
        setBookingsPage(1);
      }
    } catch (err) {
      console.error("Booking load error:", err);
    }
    setLoading(false);
  }


  async function loadCompanyData() {
    try {
      const res = await fetch("/company-data.json");
      if (!res.ok) {
        return;
      }

      const data = await res.json();
      setCompanyData(data);
    } catch (err) {
      console.error("Company data load error:", err);
    }
  }

  const cancelBooking = async (bookingId) => {
    try {
      const res = await fetch(apiUrl(`/bookings/item.php?id=${bookingId}`), {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ booking_id: bookingId }),
      });

      const data = await res.json();

      if (!data.success) {
        setMsg(data.message || "A lemondás nem sikerült");
        setMsgType("error");
        return;
      }

      setMsg(data.message || "Foglalás sikeresen lemondva");
      setMsgType("success");
      await loadBookings();
    } catch (err) {
      console.error("Cancel booking error:", err);
      setMsg("API hiba történt");
      setMsgType("error");
    }
  };

  const openInvoicePreview = (booking) => {
    if (!companyData) {
      alert("A cégadatok még töltődnek, próbáld újra pár másodperc múlva.");
      return;
    }

    const invoiceWindow = window.open("", "_blank", "width=1024,height=900");
    if (!invoiceWindow) {
      alert("A böngésző blokkolta az új ablakot.");
      return;
    }

    const invoiceHtml = buildInvoicePreviewHtml({
      company: companyData,
      booking,
    });

    invoiceWindow.document.open();
    invoiceWindow.document.write(invoiceHtml);
    invoiceWindow.document.close();
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

        loadBookings();
        loadCompanyData();
      } catch (err) {
        console.error("Admin check error:", err);
        navigate("/admin-login");
      }
    };

    checkAdmin();
  }, [navigate]);


  const loadWorks = async () => {
    setWorkLoading(true);
    try {
      const res = await fetch(apiUrl("/admin/works.php"), {
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        setWorks(data.works);
      }
    } catch (err) {
      console.error("Work load error:", err);
    }
    setWorkLoading(false);
  };

  const submitAdditionalWork = async () => {
    if (!selectedBooking) {
      alert("Nincs kiválasztott foglalás");
      return;
    }

    if (!workDescription || !workDate || !workTime) {
      alert("Minden mező kötelező");
      return;
    }

    try {
      const res = await fetch(apiUrl("/admin/works.php"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          booking_id: selectedBooking.id,
          description: workDescription,
          date: workDate,
          time: workTime,
          
        }),
        
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Mentés sikertelen");
        return;
      }

      setShowWorkForm(false);
      setWorkDescription("");
      setWorkDate("");
      setWorkTime("");

      await loadWorks();
      await loadBookings();

      setView("work");
    } catch (err) {
      console.error("API error:", err);
      alert("API hiba történt");
    }
  };

  const finishWork = async (workId) => {
    try {
      const res = await fetch(apiUrl("/admin/work-status.php"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ work_id: workId }),
      });

      const data = await res.json();

      if (data.success) {
        await Promise.all([loadWorks(), loadBookings()]);
      } else {
        alert(data.message || "Nem sikerült lezárni a munkát");
      }
    } catch (err) {
      console.error("Finish work error:", err);
      alert("API hiba történt");
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-6 sm:mt-10 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-red-600">
          Szerelő felület
        </h1>
        <div className="flex gap-2 self-start sm:self-auto">
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

      <div className="flex flex-wrap gap-2 sm:gap-4 mb-8">
        <button
          onClick={() => { setView("bookings"); loadBookings(); }}
          className={`px-3 sm:px-4 py-2 rounded text-sm sm:text-base ${view === "bookings" ? "bg-red-600" : "bg-gray-700"}`}
        >
          Foglalások
        </button>

        <button
          onClick={() => { setView("work"); loadWorks(); }}
          className={`px-3 sm:px-4 py-2 rounded text-sm sm:text-base ${view === "work" ? "bg-red-600" : "bg-gray-700"}`}
        >
          Átvizsgálás utáni időpontok
        </button>
      </div>

      {msg && (
        <div className={`mb-6 p-3 rounded text-center break-words ${msgType === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {msg}
        </div>
      )}

      {view === "bookings" && (
        <>
          <h2 className="text-xl font-semibold mb-4 text-center">Foglalások</h2>
          <div className="mb-4 flex flex-col sm:flex-row gap-3">
            <select
              value={bookingSearchType}
              onChange={(e) => {
                setBookingSearchType(e.target.value);
                setBookingsPage(1);
              }}
              className="bg-black border border-gray-700 rounded px-3 py-2"
            >
              <option value="all">Mindenben keres</option>
              <option value="service">Szolgáltatások között</option>
              <option value="day">Napok között</option>
              <option value="customer">Ügyfelek között</option>
            </select>
            <input
              type="text"
              value={bookingSearchTerm}
              onChange={(e) => {
                setBookingSearchTerm(e.target.value);
                setBookingsPage(1);
              }}
              placeholder="Keresés szolgáltatásra, napra vagy ügyfélre..."
              className="flex-1 bg-black border border-gray-700 rounded px-3 py-2"
            />
          </div>

          {loading ? (
            <p className="text-center">Betöltés...</p>
          ) : filteredBookings.length === 0 ? (
            <p className="text-center">Nincs találat a megadott szűrésre.</p>
          ) : (
            <div className="mb-10">
              <div className="space-y-3 md:hidden">
                {paginatedBookings.map((b) => (
                  <div key={b.id} className="bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-2">
                    <p className="font-semibold text-red-400">{b.service}</p>
                    <p className="text-sm text-gray-300">{b.appointment_date} {b.appointment_time}</p>
                    <p className="text-sm">{b.user_name}</p>
                    <p className="text-sm text-gray-400 break-all">{b.user_email}</p>
                    <p className="text-sm">{b.car_brand} {b.car_model}</p>
                    <a href={`tel:${b.phone_number}`} className="text-blue-400 hover:underline text-sm inline-block">
                      {b.phone_number}
                    </a>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {isInspectionBooking(b.service) && (
                        <button
                          onClick={() => {
                            setSelectedBooking(b);
                            setShowWorkForm(true);
                          }}
                          className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm"
                        >
                          További időpont
                        </button>
                      )}
                      <button
                        onClick={() => finishWork(b.id)}
                        className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm"
                      >
                        Kész
                      </button>
                      <button
                        onClick={() => openInvoicePreview(b)}
                        className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
                      >
                        🧾
                      </button>
                      <button
                        onClick={() => setConfirmCancelId(b.id)}
                        className="bg-red-700 hover:bg-red-800 px-3 py-1 rounded text-sm"
                      >
                        Lemondás
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden md:block overflow-x-auto">
                <table className="w-full min-w-[920px] border border-gray-700 text-center">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="p-2">Dátum</th>
                      <th className="p-2">Idő</th>
                      <th className="p-2">Szolgáltatás</th>
                      <th className="p-2">Ügyfél</th>
                      <th className="p-2">Autó</th>
                      <th className="p-2">Telcsi</th>
                      <th className="p-2">Művelet</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedBookings.map(b => (
                      <tr key={b.id} className="border-t border-gray-700">
                        <td className="p-2">{b.appointment_date}</td>
                        <td className="p-2">{b.appointment_time}</td>
                        <td className="p-2">{b.service}</td>

                        <td className="p-2">
                          {b.user_name}
                          <br />
                          <span className="text-sm text-gray-400">{b.user_email}</span>
                        </td>

                        <td className="p-2">
                          {b.car_brand} {b.car_model}
                        </td>

                        <td className="p-2">
                          <a href={`tel:${b.phone_number}`} className="text-blue-400 hover:underline">
                            {b.phone_number}
                          </a>
                        </td>

                        <td className="p-2">
                          <div className="flex justify-center gap-2 flex-wrap">
                            {isInspectionBooking(b.service) && (
                              <button
                                onClick={() => {
                                  setSelectedBooking(b);
                                  setShowWorkForm(true);
                                }}
                                className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded"
                              >
                                További időpont
                              </button>
                            )}
                            <button
                              onClick={() => finishWork(b.id)}
                              className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded"
                            >
                              Kész
                            </button>
                            <button
                              onClick={() => openInvoicePreview(b)}
                              className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
                            >
                              🧾
                            </button>
                            <button
                              onClick={() => setConfirmCancelId(b.id)}
                              className="bg-red-700 hover:bg-red-800 px-3 py-1 rounded"
                            >
                              Lemondás
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredBookings.length > bookingsPerPage && (
                <div className="flex items-center justify-center gap-3 mt-4">
                  <button
                    onClick={() => setBookingsPage(prev => Math.max(1, prev - 1))}
                    disabled={bookingsPage === 1}
                    className="px-3 py-1 rounded bg-gray-700 disabled:opacity-40"
                  >
                    Előző
                  </button>
                  <span className="text-sm text-gray-300">
                    {bookingsPage} / {totalBookingPages}
                  </span>
                  <button
                    onClick={() => setBookingsPage(prev => Math.min(totalBookingPages, prev + 1))}
                    disabled={bookingsPage === totalBookingPages}
                    className="px-3 py-1 rounded bg-gray-700 disabled:opacity-40"
                  >
                    Következő
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {view === "work" && (
        <>
          <h2 className="text-xl font-semibold mb-4 text-center">
            Átvizsgálás utáni időpontok
          </h2>
          <div className="mb-4 flex flex-col sm:flex-row gap-3">
            <select
              value={workSearchType}
              onChange={(e) => setWorkSearchType(e.target.value)}
              className="bg-black border border-gray-700 rounded px-3 py-2"
            >
              <option value="all">Mindenben keres</option>
              <option value="work">Munkák között</option>
              <option value="day">Napok között</option>
            </select>
            <input
              type="text"
              value={workSearchTerm}
              onChange={(e) => setWorkSearchTerm(e.target.value)}
              placeholder="Keresés munkára vagy napra..."
              className="flex-1 bg-black border border-gray-700 rounded px-3 py-2"
            />
          </div>

          {workLoading ? (
            <p className="text-center">Betöltés...</p>
          ) : works.length === 0 ? (
            <p className="text-center">Nincs folyamatban lévő munka.</p>
          ) : filteredWorks.length === 0 ? (
            <p className="text-center">Nincs találat a megadott szűrésre.</p>
          ) : (
            <div className="mb-10">
              <div className="space-y-3 md:hidden">
                {filteredWorks.map((w) => (
                  <div key={w.id} className="bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-2">
                    <p className="font-semibold">{w.user_name}</p>
                    <p className="text-sm text-gray-400 break-all">{w.user_email}</p>
                    <p className="text-sm">{w.car_brand} {w.car_model}</p>
                    <p className="text-sm text-gray-300">{w.appointment_date} {w.appointment_time}</p>
                    <a href={`tel:${w.phone_number}`} className="text-blue-400 hover:underline text-sm inline-block">
                      {w.phone_number}
                    </a>
                    <p className="text-sm break-words">{w.description}</p>
                    <p className="text-sm text-yellow-400">Folyamatban</p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <button
                        onClick={() => finishWork(w.id)}
                        className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm"
                      >
                        Kész
                      </button>
                      <button
                        onClick={() => openInvoicePreview(w)}
                        className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
                      >
                        🧾
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden md:block overflow-x-auto">
                <table className="w-full min-w-[920px] border border-gray-700 text-center">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="p-2">Ügyfél</th>
                      <th className="p-2">Autó</th>
                      <th className="p-2">Időpont</th>
                      <th className="p-2">Telefon</th>
                      <th className="p-2">Megjegyzés</th>
                      <th className="p-2">Állapot</th>
                      <th className="p-2">Művelet</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredWorks.map(w => (
                      <tr key={w.id} className="border-t border-gray-700">
                        <td className="p-2">
                          {w.user_name}
                          <br />
                          <span className="text-sm text-gray-400">{w.user_email}</span>
                        </td>

                        <td className="p-2">
                          {w.car_brand} {w.car_model}
                        </td>

                        <td className="p-2">
                          {w.appointment_date} {w.appointment_time}
                        </td>

                        <td className="p-2">
                          <a href={`tel:${w.phone_number}`} className="text-blue-400 hover:underline">
                            {w.phone_number}
                          </a>
                        </td>

                        <td className="p-2 break-words max-w-xs">{w.description}</td>

                        <td className="p-2 text-yellow-400">
                          Folyamatban
                        </td>

                        <td className="p-2">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => finishWork(w.id)}
                              className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded"
                            >
                              Kész
                            </button>
                            <button
                              onClick={() => openInvoicePreview(w)}
                              className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
                            >
                              🧾
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}


      {showWorkForm && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-5 sm:p-6 rounded w-[calc(100%-1rem)] sm:w-full max-w-md">

            <h3 className="text-xl font-bold mb-4 text-red-600">
              További munka felvétele
            </h3>

            <p className="text-sm text-gray-400 mb-2">
              {selectedBooking.car_brand} {selectedBooking.car_model}
            </p>

            <textarea
              placeholder="Munka leírása"
              value={workDescription}
              onChange={e => setWorkDescription(e.target.value)}
              className="w-full p-2 bg-black border border-gray-700 rounded mb-3"
            />

            <input
              type="date"
              value={workDate}
              max="2030-12-31"
              onChange={e => setWorkDate(e.target.value)}
              className="w-full p-2 bg-black border border-gray-700 rounded mb-3"
            />

            <input
              type="time"
              value={workTime}
              step="1800"
              onChange={e => setWorkTime(e.target.value)}
              className="w-full p-2 bg-black border border-gray-700 rounded mb-4"
            />

            <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
              <button
                onClick={() => setShowWorkForm(false)}
                className="px-4 py-2 bg-gray-700 rounded w-full sm:w-auto"
              >
                Mégse
              </button>

              <button
                onClick={submitAdditionalWork}
                className="px-4 py-2 bg-red-600 rounded w-full sm:w-auto"
              >
                Mentés
              </button>
            </div>

          </div>
        </div>
      )}

      {confirmCancelId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-gray-900 p-5 sm:p-6 rounded text-center w-[calc(100%-1rem)] max-w-sm">
            <p className="mb-6 text-lg">Biztosan lemondod ezt a foglalást?</p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button
                onClick={() => {
                  cancelBooking(confirmCancelId);
                  setConfirmCancelId(null);
                }}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded w-full sm:w-auto"
              >
                Igen
              </button>

              <button
                onClick={() => setConfirmCancelId(null)}
                className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded w-full sm:w-auto"
              >
                Mégse
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
