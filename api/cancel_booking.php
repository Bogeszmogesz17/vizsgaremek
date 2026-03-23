<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'phpmailer/src/Exception.php';
require 'phpmailer/src/PHPMailer.php';
require 'phpmailer/src/SMTP.php';
require "./core/config.php";
require_once "./core/email_template.php";

require "./core/settings.php";
require_once "db.php";

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

if (!isset($_SESSION["user_id"]) && !isset($_SESSION["admin_id"])) {
    echo json_encode([
        "success" => false,
        "message" => "Nincs bejelentkezve"
    ]);
    exit;
}

$isAdmin = isset($_SESSION["admin_id"]);
$user_id = $_SESSION["user_id"] ?? null;

$data = json_decode(file_get_contents("php://input"), true);
$booking_id = isset($data["booking_id"]) ? (int)$data["booking_id"] : 0;

if ($booking_id <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "Érvénytelen foglalás azonosító"
    ]);
    exit;
}

if ($isAdmin) {
    $stmt = $pdo->prepare("
    SELECT 
        wp.appointment_date,
        wp.appointment_time,
        u.name,
        u.email,
        b.brand_name,
        m.model_name
    FROM work_process wp
    JOIN vehicles v ON v.id = wp.vehicle_id
    JOIN users u ON u.id = v.user_id
    JOIN model m ON m.id = v.model_id
    JOIN brand b ON b.id = m.brand_id
    WHERE wp.id = ?
    ");
    $stmt->execute([$booking_id]);
} else {
    $stmt = $pdo->prepare("
    SELECT 
        wp.appointment_date,
        wp.appointment_time,
        u.name,
        u.email,
        b.brand_name,
        m.model_name
    FROM work_process wp
    JOIN vehicles v ON v.id = wp.vehicle_id
    JOIN users u ON u.id = v.user_id
    JOIN model m ON m.id = v.model_id
    JOIN brand b ON b.id = m.brand_id
    WHERE wp.id = ? AND v.user_id = ?
    ");
    $stmt->execute([$booking_id, $user_id]);
}

$booking = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$booking) {
    echo json_encode([
        "success" => false,
        "message" => "Foglalás nem található"
    ]);
    exit;
}

$today = new DateTime();
$booking_date = new DateTime($booking["appointment_date"]);
$diff = $today->diff($booking_date)->days;

if (!$isAdmin && ($booking_date <= $today || $diff < 2)) {
    echo json_encode([
        "success" => false,
        "message" => "Foglalást csak 2 nappal előtte lehet lemondani"
    ]);
    exit;
}

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare("
    DELETE FROM work_process_services
    WHERE work_process_id = ?
    ");
    $stmt->execute([$booking_id]);

    $stmt = $pdo->prepare("
    DELETE FROM work_process
    WHERE id = ?
    ");
    $stmt->execute([$booking_id]);

    if ($stmt->rowCount() !== 1) {
        throw new RuntimeException("Foglalás törlése sikertelen");
    }

    $pdo->commit();
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    echo json_encode([
        "success" => false,
        "message" => "A foglalás törlése sikertelen"
    ]);
    exit;
}

$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = MAIL_USER;
    $mail->Password = MAIL_PASS;
    $mail->SMTPSecure = 'tls';
    $mail->Port = 587;
    $mail->CharSet = 'UTF-8';
    $mail->Encoding = 'base64';
    $mail->setFrom(MAIL_USER, 'Dupla Dugattyú Műhely');
    $mail->isHTML(true);

    if ($isAdmin) {
        if (!empty($booking["email"])) {
            $mail->addAddress($booking["email"], $booking["name"] ?? "");
        } else {
            $mail->addAddress(MAIL_USER);
        }

        $mail->addBCC(MAIL_USER);
        $mail->Subject = 'Lemondott időpont';

        $mail->Body = renderWorkshopEmail(
            "Időpont lemondva",
            "A Dupla Dugattyú Műhely adminisztrátora lemondta a foglalásodat.",
            $booking["name"] ?? "",
            [
                "Dátum" => $booking["appointment_date"],
                "Időpont" => $booking["appointment_time"],
                "Autó" => trim(($booking["brand_name"] ?? "") . " " . ($booking["model_name"] ?? ""))
            ],
            "Kérdés esetén kérjük, vedd fel velünk a kapcsolatot."
        );
    } else {
        $mail->addAddress(MAIL_USER);
        $mail->Subject = 'Foglalás lemondva';

        $mail->Body = renderWorkshopEmail(
            "Időpont lemondva",
            $booking["name"] . " lemondta az időpontját.",
            "",
            [
                "Dátum" => $booking["appointment_date"],
                "Időpont" => $booking["appointment_time"],
                "Autó" => trim($booking["brand_name"] . " " . $booking["model_name"])
            ]
        );
    }

    $mail->send();
} catch (Exception $e) {
}

echo json_encode([
    "success" => true,
    "message" => $isAdmin
        ? "Sikeres lemondás, emailben tájékoztattuk az ügyfelet."
        : "Sikeres lemondás, emailben tájékoztatjuk a szervizt!"
]);
