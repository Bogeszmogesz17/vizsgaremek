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

const createLocalInvoiceItemId = () =>
  `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
const LABOR_ITEM_DESCRIPTION = "Munkadíj";
const normalizeText = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
const isLaborInvoiceItem = (item = {}) =>
  normalizeText(item.item_type) === "labor" ||
  normalizeText(item.description) === normalizeText(LABOR_ITEM_DESCRIPTION);

const clampPositiveInt = (value, fallback = 0) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(0, parsed);
};

const calculateInvoiceLineTotal = (item) => {
  const quantity = Math.max(1, clampPositiveInt(item?.quantity, 1));
  const unitPrice = clampPositiveInt(item?.unit_price, 0);
  return quantity * unitPrice;
};

const VAT_RATE = 0.27;

const calculateVatAmount = (netValue = 0) => {
  const numericNet = Number(netValue);
  if (!Number.isFinite(numericNet)) return 0;
  return Math.round(numericNet * VAT_RATE);
};

const calculateGrossAmount = (netValue = 0) =>
  Math.max(0, Math.round(Number(netValue) || 0)) + calculateVatAmount(netValue);

const toLocalInvoiceItem = (item = {}) => ({
  row_id: createLocalInvoiceItemId(),
  description: String(item.description || ""),
  quantity: Math.max(1, clampPositiveInt(item.quantity, 1)),
  unit_price: clampPositiveInt(item.unit_price, 0),
  is_fixed_price: !Number.isNaN(Number(item.is_fixed_price))
    ? Number(item.is_fixed_price) === 1
    : false,
  item_type: isLaborInvoiceItem(item) ? "labor" : "service",
});

const toApiInvoiceItems = (items = []) =>
  items
    .map((item) => {
      const description = String(item.description || "").trim();
      if (!description) return null;

      const quantity = Math.max(1, clampPositiveInt(item.quantity, 1));
      const unitPrice = clampPositiveInt(item.unit_price, 0);

      return {
        description,
        quantity,
        unit_price: unitPrice,
        line_total: quantity * unitPrice,
        is_fixed_price: item.is_fixed_price ? 1 : 0,
      };
    })
    .filter(Boolean);

const buildInvoicePreviewHtml = ({ company, booking, items, canSendEmail }) => {
  const invoiceNumber = buildInvoiceNumber(booking.id);
  const issueDate = new Date().toLocaleDateString("hu-HU");
  const serviceName = booking.service || booking.description || booking.service_name || "Munkafolyamat";
  const customerAddress = formatAddress(booking.user_address || "");
  const companyAddress = formatAddress(company.address || "");
  const invoiceItems = toApiInvoiceItems(items);
  const netTotalPrice = invoiceItems.reduce(
    (sum, item) => sum + (Number(item.line_total) || 0),
    0
  );
  const vatTotalPrice = calculateVatAmount(netTotalPrice);
  const grossTotalPrice = calculateGrossAmount(netTotalPrice);
  const itemRowsHtml = invoiceItems.length
    ? invoiceItems
        .map((item) => {
          const lineNetTotal = Number(item.line_total) || 0;
          const lineVatTotal = calculateVatAmount(lineNetTotal);
          const lineGrossTotal = calculateGrossAmount(lineNetTotal);
          return `
                  <tr>
                    <td>${escapeHtml(item.description)}</td>
                    <td class="amount">${escapeHtml(String(item.quantity))}</td>
                    <td class="amount">${escapeHtml(formatPrice(item.unit_price))}</td>
                    <td class="amount">${escapeHtml(formatPrice(lineNetTotal))}</td>
                    <td class="amount">${escapeHtml(formatPrice(lineVatTotal))}</td>
                    <td class="amount">${escapeHtml(formatPrice(lineGrossTotal))}</td>
                  </tr>
                `
        })
        .join("")
    : `
                  <tr>
                    <td colspan="6">Nincs tétel felvéve.</td>
                  </tr>
                `;

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
          #download-btn {
            background: #059669;
            color: #fff;
          }
          #email-btn[disabled] {
            opacity: 0.7;
            cursor: not-allowed;
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
            align-items: flex-start;
            gap: 12px;
            padding: 10px 12px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 14px;
          }
          .totals-row span {
            flex: 0 0 auto;
          }
          .totals-row strong {
            margin-left: auto;
            flex: 1 1 auto;
            min-width: 0;
            text-align: right;
            word-break: break-word;
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
            <button id="download-btn" type="button">Letöltés</button>
            <button id="email-btn" type="button"${
              canSendEmail ? "" : " disabled"
            }>${
    canSendEmail ? "Email küldés ügyfélnek" : "Email küldés (mentés után)"
  }</button>
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
                    <th>Tétel</th>
                    <th class="amount">Mennyiség</th>
                    <th class="amount">Egységár (nettó)</th>
                    <th class="amount">Nettó összesen</th>
                    <th class="amount">ÁFA (27%)</th>
                    <th class="amount">Bruttó összesen</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemRowsHtml}
                </tbody>
              </table>

              <div class="totals">
                <div class="totals-row">
                  <span>Szolgáltatás</span>
                  <strong>${escapeHtml(serviceName)}</strong>
                </div>
                <div class="totals-row">
                  <span>Nettó végösszeg</span>
                  <strong>${escapeHtml(formatPrice(netTotalPrice))}</strong>
                </div>
                <div class="totals-row">
                  <span>ÁFA (27%)</span>
                  <strong>${escapeHtml(formatPrice(vatTotalPrice))}</strong>
                </div>
                <div class="totals-row grand">
                  <span>Bruttó végösszeg</span>
                  <strong>${escapeHtml(formatPrice(grossTotalPrice))}</strong>
                </div>
              </div>
            </section>

            <p class="footer-note">
              Ez a számla előnézet a szerelő felületen készült. A dokumentum nyomtatható, illetve emailben kiküldhető az ügyfél részére.
            </p>
          </article>
        </div>
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
  const [additionalWorkServices, setAdditionalWorkServices] = useState([]);
  const [selectedAdditionalServiceId, setSelectedAdditionalServiceId] = useState("");

  const [workDate, setWorkDate] = useState("");
  const [workTime, setWorkTime] = useState("");
  const [confirmCancelId, setConfirmCancelId] = useState(null);

  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");
  const [companyData, setCompanyData] = useState(null);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoiceSaving, setInvoiceSaving] = useState(false);
  const [invoiceTargetWork, setInvoiceTargetWork] = useState(null);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [savedInvoiceId, setSavedInvoiceId] = useState(null);
  const removeDiacritics = (value = "") =>
    value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const isInspectionBooking = (serviceName = "") =>
    removeDiacritics(serviceName).toLowerCase().includes("atvizsg");
  const invoiceTotalPrice = toApiInvoiceItems(invoiceItems).reduce(
    (sum, item) => sum + (Number(item.line_total) || 0),
    0
  );
  const invoiceVatTotal = calculateVatAmount(invoiceTotalPrice);
  const invoiceGrossTotal = calculateGrossAmount(invoiceTotalPrice);
  const mainInvoiceItem =
    invoiceItems.find((item) => item.item_type !== "labor") || null;
  const laborInvoiceItem =
    invoiceItems.find((item) => item.item_type === "labor") || null;
  const isFixedPriceBooking = Boolean(invoiceTargetWork?.is_fixed_price_booking);
  const canAddLaborInvoiceItem =
    !isFixedPriceBooking &&
    Boolean(mainInvoiceItem) &&
    !laborInvoiceItem;
  const normalizedBookingSearch = bookingSearchTerm.trim().toLowerCase();
  const filteredBookings = bookings.filter((b) => {
    if (!normalizedBookingSearch) return true;

    const service = (b.service || "").toLowerCase();
    const appointmentDate = (b.appointment_date || "").toLowerCase();
    const customer = `${b.user_name || ""} ${b.user_email || ""}`.toLowerCase();

    if (bookingSearchType === "service") {
      return service.includes(normalizedBookingSearch);
    }

    if (bookingSearchType === "date") {
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
    const customer = `${w.user_name || ""}`.toLowerCase();
    const car = `${w.car_brand || ""} ${w.car_model || ""}`.toLowerCase();
    const appointmentDate = (w.appointment_date || "").toLowerCase();
    if (workSearchType === "name") {
      return customer.includes(normalizedWorkSearch);
    }

    if (workSearchType === "car") {
      return car.includes(normalizedWorkSearch);
    }


    if (workSearchType === "date") {
      return appointmentDate.includes(normalizedWorkSearch);
    }

    return (
      customer.includes(normalizedWorkSearch) ||
      car.includes(normalizedWorkSearch) ||
      appointmentDate.includes(normalizedWorkSearch)
    );
  });

  useEffect(() => {
    if (!msg || msgType !== "success") return undefined;

    const timeoutId = setTimeout(() => {
      setMsg("");
      setMsgType("");
    }, 10000);

    return () => clearTimeout(timeoutId);
  }, [msg, msgType]);


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

  const resetInvoiceForm = () => {
    setShowInvoiceForm(false);
    setInvoiceLoading(false);
    setInvoiceSaving(false);
    setInvoiceTargetWork(null);
    setInvoiceItems([]);
    setSavedInvoiceId(null);
  };

  const openInvoiceEditor = async (work) => {
    if (!work?.id) {
      alert("Hiányzik a munkafolyamat azonosítója.");
      return;
    }

    setShowInvoiceForm(true);
    setInvoiceLoading(true);
    setInvoiceTargetWork(work);
    setSavedInvoiceId(null);
    setInvoiceItems([]);

    try {
      const res = await fetch(apiUrl(`/admin/invoice.php?work_id=${work.id}`), {
        credentials: "include",
      });
      const data = await res.json();

      if (!data.success) {
        alert(data.message || "A számla betöltése sikertelen.");
        resetInvoiceForm();
        return;
      }

      const loadedWork = data.work || {};
      setInvoiceTargetWork({
        ...work,
        ...loadedWork,
      });
      setSavedInvoiceId(data.invoice?.id || null);
      const loadedItems = (data.items || []).map((item) => toLocalInvoiceItem(item));
      setInvoiceItems(
        (() => {
          const serviceName =
            loadedWork.service_name ||
            work.service ||
            work.description ||
            "Munkafolyamat";
          const databasePriceCandidate =
            clampPositiveInt(loadedWork.work_price, 0) > 0
              ? clampPositiveInt(loadedWork.work_price, 0)
              : clampPositiveInt(loadedWork.service_price, 0);
          const isFixed = Number(loadedWork.is_fixed_price_booking || 0) === 1;
          const selectedMainItem =
            loadedItems.find((item) => item.item_type !== "labor") ||
            toLocalInvoiceItem({
              description: serviceName,
              quantity: 1,
              unit_price: databasePriceCandidate,
              is_fixed_price: isFixed ? 1 : 0,
              item_type: "service",
            });
          const selectedLaborItem = loadedItems.find(
            (item) => item.item_type === "labor"
          );

          const normalizedMainItem = {
            ...selectedMainItem,
            description:
              String(selectedMainItem.description || "").trim() ||
              serviceName,
            quantity: Math.max(1, clampPositiveInt(selectedMainItem.quantity, 1)),
            unit_price:
              clampPositiveInt(selectedMainItem.unit_price, 0) > 0
                ? clampPositiveInt(selectedMainItem.unit_price, 0)
                : databasePriceCandidate,
            is_fixed_price: isFixed ? true : Boolean(selectedMainItem.is_fixed_price),
            item_type: "service",
          };

          if (isFixed) {
            return [normalizedMainItem];
          }

          if (!selectedLaborItem) {
            return [normalizedMainItem];
          }

          return [
            normalizedMainItem,
            {
              ...selectedLaborItem,
              description:
                String(selectedLaborItem.description || "").trim() ||
                LABOR_ITEM_DESCRIPTION,
              quantity: Math.max(
                1,
                clampPositiveInt(selectedLaborItem.quantity, 1)
              ),
              unit_price: clampPositiveInt(selectedLaborItem.unit_price, 0),
              is_fixed_price: false,
              item_type: "labor",
            },
          ];
        })()
      );
    } catch (err) {
      console.error("Invoice load error:", err);
      alert("API hiba történt a számla betöltése közben.");
      const fallbackDescription = work.service || work.description || "Munkafolyamat";
      const fallbackPrice =
        clampPositiveInt(work.work_price, 0) + clampPositiveInt(work.material_price, 0);
      setInvoiceItems([
        toLocalInvoiceItem({
          description: fallbackDescription,
          quantity: 1,
          unit_price: fallbackPrice,
          is_fixed_price: 0,
        }),
      ]);
    } finally {
      setInvoiceLoading(false);
    }
  };

  const updateInvoiceItem = (rowId, field, value) => {
    setInvoiceItems((prev) =>
      prev.map((item) => {
        if (item.row_id !== rowId) return item;

        if (field === "description") {
          return { ...item, description: value };
        }

        if (field === "quantity") {
          if (value === "") {
            return {
              ...item,
              quantity: "",
            };
          }
          return {
            ...item,
            quantity: Math.max(1, clampPositiveInt(value, item.quantity || 1)),
          };
        }

        if (field === "unit_price") {
          if (item.is_fixed_price) return item;
          if (value === "") {
            return {
              ...item,
              unit_price: "",
            };
          }
          return {
            ...item,
            unit_price: clampPositiveInt(value, item.unit_price || 0),
          };
        }

        return item;
      })
    );
  };

  const removeInvoiceItem = (rowId) => {
    setInvoiceItems((prev) => prev.filter((item) => item.row_id !== rowId));
  };

  const addLaborInvoiceItem = () => {
    if (!mainInvoiceItem || isFixedPriceBooking) {
      return;
    }
    setInvoiceItems((prev) => [
      ...prev.filter((item) => item.item_type !== "labor"),
      ...(prev.some((item) => item.item_type === "labor")
        ? prev.filter((item) => item.item_type === "labor")
        : [
            {
              row_id: createLocalInvoiceItemId(),
              description: LABOR_ITEM_DESCRIPTION,
              quantity: 1,
              unit_price: 0,
              is_fixed_price: false,
              item_type: "labor",
            },
          ]),
    ]);
  };

  const openInvoicePreviewWindow = () => {
    if (!companyData) {
      alert("A cégadatok még töltődnek, próbáld újra pár másodperc múlva.");
      return;
    }

    if (!invoiceTargetWork) {
      alert("Nincs kiválasztott munkafolyamat.");
      return;
    }

    const preparedItems = toApiInvoiceItems(invoiceItems);
    if (!preparedItems.length) {
      alert("Legalább egy számlatétel szükséges az előnézethez.");
      return;
    }

    const invoiceWindow = window.open("", "_blank", "width=1024,height=900");
    if (!invoiceWindow) {
      alert("A böngésző blokkolta az új ablakot.");
      return;
    }

    const invoiceHtml = buildInvoicePreviewHtml({
      company: companyData,
      booking: invoiceTargetWork,
      items: preparedItems,
      canSendEmail: Boolean(savedInvoiceId),
    });

    invoiceWindow.document.open();
    invoiceWindow.document.write(invoiceHtml);
    invoiceWindow.document.close();

    const previewDocument = invoiceWindow.document;
    const workId = Number(invoiceTargetWork.id) || 0;
    const canSendEmail = Boolean(savedInvoiceId);
    const emailApiUrl = apiUrl("/admin/invoice-email.php");
    const printButton = previewDocument.getElementById("print-btn");
    const downloadButton = previewDocument.getElementById("download-btn");
    const emailButton = previewDocument.getElementById("email-btn");

    printButton?.addEventListener("click", () => {
      invoiceWindow.print();
    });

    downloadButton?.addEventListener("click", () => {
      const fileName = `szamla-${String(workId || "ismeretlen")}.html`;
      const invoiceDocument = "<!doctype html>\n" + previewDocument.documentElement.outerHTML;
      const blob = new Blob([invoiceDocument], {
        type: "text/html;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const anchor = previewDocument.createElement("a");
      anchor.href = url;
      anchor.download = fileName;
      previewDocument.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    });

    emailButton?.addEventListener("click", async () => {
      if (!canSendEmail) {
        invoiceWindow.alert("Előbb mentsd el a számlát a Rendben gombbal.");
        return;
      }
      if (!workId) {
        invoiceWindow.alert("Hiányzik a számla azonosító.");
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
          invoiceWindow.alert(data.message || "Az email küldése sikertelen.");
          return;
        }

        invoiceWindow.alert(data.message || "A számla email elküldve.");
      } catch (error) {
        console.error("Invoice email error:", error);
        invoiceWindow.alert("API hiba történt az email küldése közben.");
      } finally {
        emailButton.disabled = false;
        emailButton.textContent = originalText;
      }
    });
  };

  const saveInvoice = async () => {
    if (!invoiceTargetWork?.id) {
      alert("Nincs kiválasztott munkafolyamat.");
      return;
    }

    const preparedItems = toApiInvoiceItems(invoiceItems);
    if (!preparedItems.length) {
      alert("Legalább egy számlatétel megadása kötelező.");
      return;
    }

    setInvoiceSaving(true);
    try {
      const res = await fetch(apiUrl("/admin/invoice.php"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          work_id: invoiceTargetWork.id,
          items: preparedItems,
        }),
      });
      const data = await res.json();

      if (!data.success) {
        alert(data.message || "A számla mentése sikertelen.");
        return;
      }

      setSavedInvoiceId(data.invoice_id || null);
      setInvoiceItems((data.items || preparedItems).map((item) => toLocalInvoiceItem(item)));
      setMsg(data.message || "A számla mentése sikeres.");
      setMsgType("success");
      await Promise.all([loadBookings(), loadWorks()]);
      resetInvoiceForm();
    } catch (err) {
      console.error("Invoice save error:", err);
      alert("API hiba történt a számla mentése közben.");
    } finally {
      setInvoiceSaving(false);
    }
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
        loadAdditionalWorkServices();
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
  const loadAdditionalWorkServices = async () => {
    try {
      const res = await fetch(apiUrl("/catalog/services.php?bookable=0"), {
        credentials: "include",
      });
      const data = await res.json();

      if (!data.success) return;

      const services = Array.isArray(data.services) ? data.services : [];
      setAdditionalWorkServices(services);
      setSelectedAdditionalServiceId((previous) => {
        if (previous && services.some((service) => String(service.id) === String(previous))) {
          return previous;
        }
        return services.length ? String(services[0].id) : "";
      });
    } catch (err) {
      console.error("Additional services load error:", err);
    }
  };

  const submitAdditionalWork = async () => {
    if (!selectedBooking) {
      alert("Nincs kiválasztott foglalás");
      return;
    }
    if (!selectedAdditionalServiceId || !workDate || !workTime) {
      alert("Minden mező kötelező");
      return;
    }

    const selectedDateTime = new Date(`${workDate}T${workTime}`);
    const now = new Date();
    if (Number.isNaN(selectedDateTime.getTime())) {
      alert("Érvénytelen dátum vagy időpont.");
      return;
    }

    if (selectedDateTime < now) {
      alert("Korábbi időpontra nem lehet foglalni.");
      return;
    }

    try {
      const res = await fetch(apiUrl("/admin/works.php"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          booking_id: selectedBooking.id,
          service_id: Number(selectedAdditionalServiceId),
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
      setSelectedAdditionalServiceId("");
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
            onClick={() => navigate("/admin/auto-eloelet")}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm sm:text-base"
          >
            Autó előélet
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
              <option value="date">Dátum szerint</option>
              <option value="customer">Ügyfelek között</option>
            </select>
            <input
              type="text"
              value={bookingSearchTerm}
              onChange={(e) => {
                setBookingSearchTerm(e.target.value);
                setBookingsPage(1);
              }}
              placeholder="Keresés szolgáltatásra, dátumra vagy ügyfélre..."
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
                            loadAdditionalWorkServices();
                          }}
                          className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm"
                        >
                          További időpont
                        </button>
                      )}
                      {!isInspectionBooking(b.service) && (
                        <button
                          onClick={() => finishWork(b.id)}
                          className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm"
                        >
                          Kész
                        </button>
                      )}
                      <button
                        onClick={() => openInvoiceEditor(b)}
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
                      <th className="p-2">Telefon</th>
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
                                  loadAdditionalWorkServices();
                                }}
                                className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded"
                              >
                                További időpont
                              </button>
                            )}
                            {!isInspectionBooking(b.service) && (
                              <button
                                onClick={() => finishWork(b.id)}
                                className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded"
                              >
                                Kész
                              </button>
                            )}
                            <button
                              onClick={() => openInvoiceEditor(b)}
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
              <option value="name">Név szerint</option>
              <option value="car">Autó szerint</option>
              <option value="date">Dátum szerint</option>
            </select>
            <input
              type="text"
              value={workSearchTerm}
              onChange={(e) => setWorkSearchTerm(e.target.value)}
              placeholder="Keresés névre, autóra vagy dátumra..."
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
                        onClick={() => openInvoiceEditor(w)}
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
                              onClick={() => openInvoiceEditor(w)}
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

      {showInvoiceForm && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-2">
          <div className="bg-gray-900 p-4 sm:p-6 rounded w-full max-w-5xl max-h-[95vh] overflow-y-auto border border-gray-700">
            <h3 className="text-xl sm:text-2xl font-bold mb-2 text-red-600">
              Számla összeállítása
            </h3>
            {invoiceTargetWork && (
              <p className="text-sm text-gray-300 mb-4 break-words">
                {invoiceTargetWork.user_name || "Ügyfél"} •{" "}
                {invoiceTargetWork.car_brand || ""}{" "}
                {invoiceTargetWork.car_model || ""} •{" "}
                {invoiceTargetWork.appointment_date || ""}{" "}
                {invoiceTargetWork.appointment_time || ""}
              </p>
            )}

            {invoiceLoading ? (
              <p className="text-center py-8">Számla betöltése...</p>
            ) : (
              <>
                <div className="border border-gray-700 rounded p-3 sm:p-4 space-y-4">
                  {mainInvoiceItem && (
                    <div className="border border-gray-700 rounded p-3 sm:p-4 space-y-3">
                      <p className="text-sm font-semibold text-gray-300">Fő tétel</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={mainInvoiceItem.description}
                          disabled={mainInvoiceItem.is_fixed_price}
                          onChange={(e) =>
                            updateInvoiceItem(
                              mainInvoiceItem.row_id,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="Szolgáltatás megnevezése"
                          className="sm:col-span-2 w-full bg-black border border-gray-700 rounded px-3 py-2 disabled:opacity-60"
                        />
                        <input
                          type="number"
                          min="1"
                          value={mainInvoiceItem.quantity}
                          disabled={mainInvoiceItem.is_fixed_price}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) =>
                            updateInvoiceItem(
                              mainInvoiceItem.row_id,
                              "quantity",
                              e.target.value
                            )
                          }
                          onBlur={() => {
                            if (mainInvoiceItem.quantity === "") {
                              updateInvoiceItem(mainInvoiceItem.row_id, "quantity", "1");
                            }
                          }}
                          className="w-full bg-black border border-gray-700 rounded px-3 py-2 disabled:opacity-60"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Egységár (Ft)</label>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={mainInvoiceItem.unit_price}
                            disabled={mainInvoiceItem.is_fixed_price}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) =>
                              updateInvoiceItem(
                                mainInvoiceItem.row_id,
                                "unit_price",
                                e.target.value
                              )
                            }
                            onBlur={() => {
                              if (mainInvoiceItem.unit_price === "") {
                                updateInvoiceItem(mainInvoiceItem.row_id, "unit_price", "0");
                              }
                            }}
                            className="w-full bg-black border border-gray-700 rounded px-3 py-2 disabled:opacity-60"
                          />
                        </div>
                        <div className="sm:col-span-2 text-left sm:text-right font-semibold text-lg">
                          Összesen: {formatPrice(calculateInvoiceLineTotal(mainInvoiceItem))}
                        </div>
                      </div>
                    </div>
                  )}

                  {laborInvoiceItem && (
                    <div className="border border-gray-700 rounded p-3 sm:p-4 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-gray-300">Munkadíj</p>
                        <button
                          type="button"
                          onClick={() => removeInvoiceItem(laborInvoiceItem.row_id)}
                          className="text-xs bg-red-700 hover:bg-red-800 px-2 py-1 rounded"
                        >
                          Törlés
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                        <input
                          type="text"
                          value={laborInvoiceItem.description}
                          onChange={(e) =>
                            updateInvoiceItem(
                              laborInvoiceItem.row_id,
                              "description",
                              e.target.value
                            )
                          }
                          className="sm:col-span-2 w-full bg-black border border-gray-700 rounded px-3 py-2"
                        />
                        <input
                          type="number"
                          min="1"
                          value={laborInvoiceItem.quantity}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) =>
                            updateInvoiceItem(
                              laborInvoiceItem.row_id,
                              "quantity",
                              e.target.value
                            )
                          }
                          onBlur={() => {
                            if (laborInvoiceItem.quantity === "") {
                              updateInvoiceItem(laborInvoiceItem.row_id, "quantity", "1");
                            }
                          }}
                          className="w-full bg-black border border-gray-700 rounded px-3 py-2"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Egységár (Ft)</label>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={laborInvoiceItem.unit_price}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) =>
                              updateInvoiceItem(
                                laborInvoiceItem.row_id,
                                "unit_price",
                                e.target.value
                              )
                            }
                            onBlur={() => {
                              if (laborInvoiceItem.unit_price === "") {
                                updateInvoiceItem(laborInvoiceItem.row_id, "unit_price", "0");
                              }
                            }}
                            className="w-full bg-black border border-gray-700 rounded px-3 py-2"
                          />
                        </div>
                        <div className="sm:col-span-2 text-left sm:text-right font-semibold text-lg">
                          Összesen: {formatPrice(calculateInvoiceLineTotal(laborInvoiceItem))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
                  <div className="self-start">
                    {canAddLaborInvoiceItem && (
                      <button
                        type="button"
                        onClick={addLaborInvoiceItem}
                        className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
                      >
                        + Munkadíj hozzáadása
                      </button>
                    )}
                    {isFixedPriceBooking && (
                      <p className="text-xs text-gray-400">
                        Fix áras foglalás: munkadíj nem adható hozzá.
                      </p>
                    )}
                  </div>
                  <div className="text-sm sm:text-right space-y-1">
                    <p className="font-semibold">
                      Nettó: <span className="text-red-400">{formatPrice(invoiceTotalPrice)}</span>
                    </p>
                    <p className="font-semibold">
                      ÁFA (27%): <span className="text-red-400">{formatPrice(invoiceVatTotal)}</span>
                    </p>
                    <p className="text-lg font-bold">
                      Bruttó: <span className="text-red-500">{formatPrice(invoiceGrossTotal)}</span>
                    </p>
                  </div>
                </div>
              </>
            )}

            <div className="flex flex-col sm:flex-row sm:justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={resetInvoiceForm}
                className="px-4 py-2 bg-gray-700 rounded w-full sm:w-auto"
              >
                Mégse
              </button>
              <button
                type="button"
                onClick={openInvoicePreviewWindow}
                disabled={invoiceLoading || invoiceSaving}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded w-full sm:w-auto disabled:opacity-60"
              >
                Előnézet
              </button>
              <button
                type="button"
                onClick={saveInvoice}
                disabled={invoiceLoading || invoiceSaving}
                className="px-4 py-2 bg-green-700 hover:bg-green-800 rounded w-full sm:w-auto disabled:opacity-60"
              >
                {invoiceSaving ? "Mentés..." : "Rendben"}
              </button>
            </div>
          </div>
        </div>
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

            <select
              value={selectedAdditionalServiceId}
              onChange={(e) => setSelectedAdditionalServiceId(e.target.value)}
              className="w-full p-2 bg-black border border-gray-700 rounded mb-3"
            >
              {additionalWorkServices.length === 0 && (
                <option value="">Nincs választható szolgáltatás</option>
              )}
              {additionalWorkServices.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={workDate}
              min={new Date().toISOString().split("T")[0]}
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
                onClick={() => {
                  setShowWorkForm(false);
                  setSelectedAdditionalServiceId("");
                }}
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


