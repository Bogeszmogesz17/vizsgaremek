<?php

use PHPMailer\PHPMailer\PHPMailer;

require "./core/settings.php";
require "./core/config.php";
require_once "./core/email_template.php";
require "phpmailer/src/Exception.php";
require "phpmailer/src/PHPMailer.php";
require "phpmailer/src/SMTP.php";
require_once "db.php";

isAdmin();

$data = json_decode(file_get_contents("php://input"), true);
$workId = isset($data["work_id"]) ? (int)$data["work_id"] : 0;

if ($workId <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "Érvénytelen azonosító"
    ]);
    exit;
}

$companyDataPath = __DIR__ . "/../public/company-data.json";
$companyData = [];
if (is_file($companyDataPath)) {
    $rawCompanyData = file_get_contents($companyDataPath);
    $decodedCompanyData = json_decode($rawCompanyData, true);
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

try {
    $stmt = $pdo->prepare("
        SELECT
            wp.id,
            wp.appointment_date,
            wp.appointment_time,
            wp.work_price,
            wp.material_price,
            COALESCE(GROUP_CONCAT(DISTINCT s.name SEPARATOR ', '), 'Munkafolyamat') AS service_name,
            u.name AS user_name,
            u.email AS user_email,
            u.phone_number,
            CONCAT(COALESCE(st.post_code, ''), ' ', COALESCE(st.settlement_name, ''), ', ', COALESCE(u.address, '')) AS user_address,
            b.brand_name AS car_brand,
            m.model_name AS car_model
        FROM work_process wp
        LEFT JOIN work_process_services wps ON wps.work_process_id = wp.id
        LEFT JOIN services s ON s.id = wps.service_id
        JOIN vehicles v ON v.id = wp.vehicle_id
        JOIN users u ON u.id = v.user_id
        LEFT JOIN settlement st ON st.id = u.settlement_id
        JOIN model m ON m.id = v.model_id
        JOIN brand b ON b.id = m.brand_id
        WHERE wp.id = ?
        GROUP BY
            wp.id,
            wp.appointment_date,
            wp.appointment_time,
            wp.work_price,
            wp.material_price,
            u.name,
            u.email,
            u.phone_number,
            st.post_code,
            st.settlement_name,
            u.address,
            b.brand_name,
            m.model_name
        LIMIT 1
    ");
    $stmt->execute([$workId]);
    $invoice = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$invoice) {
        echo json_encode([
            "success" => false,
            "message" => "A munkafolyamat nem található"
        ]);
        exit;
    }

    if (empty($invoice["user_email"])) {
        echo json_encode([
            "success" => false,
            "message" => "Az ügyfélnek nincs email címe"
        ]);
        exit;
    }

    $workPrice = (float)($invoice["work_price"] ?? 0);
    $materialPrice = (float)($invoice["material_price"] ?? 0);
    $totalPrice = $workPrice + $materialPrice;
    $invoiceNumber = "SZ-" . str_pad((string)$invoice["id"], 6, "0", STR_PAD_LEFT) . "-" . date("Ymd");
    $issuedAt = date("Y.m.d");

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
            "Munkadíj" => number_format($workPrice, 0, ",", " ") . " Ft",
            "Anyagköltség" => number_format($materialPrice, 0, ",", " ") . " Ft",
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

    echo json_encode([
        "success" => true,
        "message" => "A számla email sikeresen elküldve"
    ]);
} catch (\Throwable $e) {
    echo json_encode([
        "success" => false,
        "message" => "Email küldési hiba"
    ]);
}
