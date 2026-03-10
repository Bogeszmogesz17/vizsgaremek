<?php

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

$stmt = $pdo->prepare("
SELECT appointment_date 
FROM work_process wp
JOIN vehicles v ON v.id = wp.vehicle_id
WHERE wp.id = ? AND v.user_id = ?
");

$stmt->execute([$booking_id, $user_id]);

$booking = $stmt->fetch();

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

$stmt = $pdo->prepare("
DELETE FROM work_process
WHERE id = ?
");

$stmt->execute([$booking_id]);

echo json_encode([
    "success" => true
]);