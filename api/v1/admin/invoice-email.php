<?php
use PHPMailer\PHPMailer\PHPMailer;

require_once __DIR__ . "/../_bootstrap.php";
require_once __DIR__ . "/../../core/config.php";
require_once __DIR__ . "/../../core/email_template.php";
require_once __DIR__ . "/../../phpmailer/src/Exception.php";
require_once __DIR__ . "/../../phpmailer/src/PHPMailer.php";
require_once __DIR__ . "/../../phpmailer/src/SMTP.php";

requireMethod(["POST"]);
requireAdminSession();

$data = readJsonInput();
$workId = requirePositiveInt($data["work_id"] ?? null, "Érvénytelen azonosító");

$companyDataPath = __DIR__ . "/../../../public/company-data.json";
$companyData = [];

if (is_file($companyDataPath)) {
    $rawCompanyData = file_get_contents($companyDataPath);
    $decodedCompanyData = json_decode((string)$rawCompanyData, true);
    if (is_array($decodedCompanyData)) {
        $companyData = $decodedCompanyData;
    }
}

$companyName = trim((string)($companyData["company_name"] ?? "Dupla Dugattyú Műhely"));
$companyEmail = trim((string)($companyData["email"] ?? MAIL_USER));
$companyPhone = trim((string)($companyData["phone"] ?? ""));
$companyAddress = trim((string)($companyData["address"] ?? ""));
$companyTaxNumber = trim((string)($companyData["tax_number"] ?? ""));
$companyBankAccount = trim((string)($companyData["bank_account"] ?? ""));

$statement = $pdo->prepare("
    SELECT
        wp.id,
        wp.appointment_date,
        wp.appointment_time,
        wp.work_price,
        0 AS material_price,
        COALESCE(
            NULLIF(TRIM(wp.additional_work_description), ''),
            COALESCE(s.name, 'Munkafolyamat')
        ) AS service_name,
        u.name AS user_name,
        u.email AS user_email,
        u.phone_number,
        CONCAT(COALESCE(st.post_code, ''), ' ', COALESCE(st.settlement_name, ''), ', ', COALESCE(u.address, '')) AS user_address,
        b.brand_name AS car_brand,
        m.model_name AS car_model
    FROM work_process wp
    LEFT JOIN services s ON s.id = wp.service_id
    JOIN vehicles v ON v.id = wp.vehicle_id
    JOIN users u ON u.id = v.user_id
    LEFT JOIN settlement st ON st.id = u.settlement_id
    JOIN model m ON m.id = v.model_id
    JOIN brand b ON b.id = m.brand_id
    WHERE wp.id = ?
    LIMIT 1
");
$statement->execute([$workId]);
$invoice = $statement->fetch(PDO::FETCH_ASSOC);

if (!$invoice) {
    jsonResponse([
        "success" => false,
        "message" => "A munkafolyamat nem található"
    ], 404);
}

if (empty($invoice["user_email"])) {
    jsonResponse([
        "success" => false,
        "message" => "Az ügyfélnek nincs email címe"
    ], 400);
}

$workPrice = (float)($invoice["work_price"] ?? 0);
$materialPrice = (float)($invoice["material_price"] ?? 0);
$totalPrice = $workPrice + $materialPrice;
$invoiceNumber = "SZ-" . str_pad((string)$invoice["id"], 6, "0", STR_PAD_LEFT) . "-" . date("Ymd");
$issuedAt = date("Y.m.d");

try {
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = "smtp.gmail.com";
    $mail->SMTPAuth = true;
    $mail->Username = MAIL_USER;
    $mail->Password = MAIL_PASS;
    $mail->SMTPSecure = "tls";
    $mail->Port = 587;
    $mail->CharSet = "UTF-8";
    $mail->Encoding = "base64";
    $mail->setFrom(MAIL_USER, $companyName);
    $mail->addAddress($invoice["user_email"], $invoice["user_name"] ?? "");
    $mail->isHTML(true);
    $mail->Subject = "Számla - " . $invoiceNumber;

    $mail->Body = renderWorkshopEmail(
        "Számla",
        "Elküldtük az elkészült munkafolyamat számla adatait.",
        $invoice["user_name"] ?? "",
        [
            "Számlaszám" => $invoiceNumber,
            "Kiállítás dátuma" => $issuedAt,
            "Szolgáltatás" => $invoice["service_name"] ?? "",
            "Foglalás időpontja" => trim(($invoice["appointment_date"] ?? "") . " " . ($invoice["appointment_time"] ?? "")),
            "Autó" => trim(($invoice["car_brand"] ?? "") . " " . ($invoice["car_model"] ?? "")),
            "Ügyfél címe" => $invoice["user_address"] ?? "",
            "Végösszeg" => number_format($totalPrice, 0, ",", " ") . " Ft",
            "Kiállító" => $companyName,
            "Cím" => $companyAddress,
            "Telefon" => $companyPhone,
            "Email" => $companyEmail,
            "Adószám" => $companyTaxNumber,
            "Bankszámla" => $companyBankAccount
        ],
        "Ez az email a számla adatait tartalmazza. Nyomtatott PDF számla a szerelői felületen érhető el."
    );

    $mail->send();
} catch (Throwable $throwable) {
    jsonResponse([
        "success" => false,
        "message" => "Email küldési hiba"
    ], 500);
}

jsonResponse([
    "success" => true,
    "message" => "A számla email sikeresen elküldve"
]);
