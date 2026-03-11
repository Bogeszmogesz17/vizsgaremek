<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'phpmailer/src/Exception.php';
require 'phpmailer/src/PHPMailer.php';
require 'phpmailer/src/SMTP.php';

require "./core/settings.php";
require_once "db.php";

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

session_start();

if (!isset($_SESSION["user_id"])) {
    echo json_encode(["success" => false]);
    exit;
}

$user_id = $_SESSION["user_id"];

$data = json_decode(file_get_contents("php://input"), true);
$booking_id = $data["booking_id"];


// ===== Foglalás adatok lekérése =====

$stmt = $pdo->prepare("
SELECT 
    wp.appointment_date,
    wp.appointment_time,
    u.name,
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

$booking = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$booking) {
    echo json_encode([
        "success" => false,
        "message" => "Foglalás nem található"
    ]);
    exit;
}

$appointment_date = $booking["appointment_date"];

$today = new DateTime();
$booking_date = new DateTime($appointment_date);

$diff = $today->diff($booking_date)->days;

if ($booking_date <= $today || $diff < 2) {
    echo json_encode([
        "success" => false,
        "message" => "Foglalást csak 2 nappal előtte lehet lemondani"
    ]);
    exit;
}


// ===== Foglalás törlése =====

$stmt = $pdo->prepare("
DELETE FROM work_process
WHERE id = ?
");

$stmt->execute([$booking_id]);


// ===== EMAIL AZ ADMINNAK =====

$mail = new PHPMailer(true);

try {

    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'bogibodis6@gmail.com';
    $mail->Password = 'kqzp piki taum nymc'; 
    $mail->SMTPSecure = 'tls';
    $mail->Port = 587;

    $mail->setFrom('bogibodis6@gmail.com', 'Dupla Dugattyú Műhely');

    // ADMIN EMAIL
    $mail->addAddress('bogibodis6@gmail.com');

    $mail->isHTML(true);
    $mail->Subject = 'Foglalás lemondva';

    $mail->Body = '
    <div style="font-family:Arial;padding:20px">

    <h2>Időpont lemondva</h2>

    <p><b>'.$booking["name"].'</b> lemondta az időpontját.</p>

    <p>
    <b>Dátum:</b> '.$booking["appointment_date"].'<br>
    <b>Időpont:</b> '.$booking["appointment_time"].'<br>
    <b>Autó:</b> '.$booking["brand_name"].' '.$booking["model_name"].'
    </p>

    </div>
    ';

    $mail->send();

} catch (Exception $e) {
    // ha email hiba van, attól még a lemondás működik
}


echo json_encode([
    "success" => true,
    "message" => "Sikeres lemondás, emailben tájékoztatjuk a szervizt!"
]);