<?php
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\PHPMailer;

require_once __DIR__ . "/../_bootstrap.php";
require_once __DIR__ . "/../../core/config.php";
require_once __DIR__ . "/../../core/email_template.php";
require_once __DIR__ . "/../../phpmailer/src/Exception.php";
require_once __DIR__ . "/../../phpmailer/src/PHPMailer.php";
require_once __DIR__ . "/../../phpmailer/src/SMTP.php";

requireMethod(["PATCH", "POST"]);
requireAdminSession();

$data = readJsonInput();
$workId = requirePositiveInt($data["work_id"] ?? null, "Hiányzó azonosító");

$customerStatement = $pdo->prepare("
    SELECT
        wp.appointment_date,
        wp.appointment_time,
        u.name AS user_name,
        u.email AS user_email,
        b.brand_name AS car_brand,
        m.model_name AS car_model
    FROM work_process wp
    JOIN vehicles v ON wp.vehicle_id = v.id
    JOIN users u ON v.user_id = u.id
    JOIN model m ON v.model_id = m.id
    JOIN brand b ON m.brand_id = b.id
    WHERE wp.id = :id
    LIMIT 1
");
$customerStatement->execute([":id" => $workId]);
$customer = $customerStatement->fetch(PDO::FETCH_ASSOC);

if (!$customer) {
    jsonResponse([
        "success" => false,
        "message" => "Munka nem található"
    ], 404);
}

$updateStatement = $pdo->prepare("
    UPDATE work_process
    SET status = 1
    WHERE id = :id
");
$updateStatement->execute([":id" => $workId]);

$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host = "smtp.gmail.com";
    $mail->SMTPAuth = true;
    $mail->Username = MAIL_USER;
    $mail->Password = MAIL_PASS;
    $mail->SMTPSecure = "tls";
    $mail->Port = 587;
    $mail->CharSet = "UTF-8";
    $mail->Encoding = "base64";
    $mail->setFrom(MAIL_USER, "Dupla Dugattyú Műhely");
    $mail->addAddress($customer["user_email"], $customer["user_name"]);
    $mail->isHTML(true);
    $mail->Subject = "Munka elkészült";
    $mail->Body = renderWorkshopEmail(
        "Elkészült a munkafolyamat",
        "Tájékoztatunk, hogy a munkád elkészült.",
        $customer["user_name"],
        [
            "Dátum" => $customer["appointment_date"],
            "Időpont" => $customer["appointment_time"],
            "Autó" => trim($customer["car_brand"] . " " . $customer["car_model"])
        ]
    );
    $mail->send();
} catch (Exception $exception) {
}

jsonResponse([
    "success" => true,
    "message" => "Munka lezárva"
]);
