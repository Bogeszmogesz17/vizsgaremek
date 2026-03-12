<?php

require "./core/settings.php";
require_once "db.php";

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

if (!isset($_SESSION["user_id"])) {
    echo json_encode([
        "success" => false,
        "message" => "Nincs bejelentkezve"
    ]);
    exit;
}

$user_id = $_SESSION["user_id"];

$stmt = $pdo->prepare("
SELECT 
    wp.id,
    wp.appointment_date,
    wp.appointment_time,
    s.name AS service_name
FROM work_process wp
JOIN work_process_services wps ON wps.work_process_id = wp.id
JOIN services s ON s.id = wps.service_id
JOIN vehicles v ON v.id = wp.vehicle_id
WHERE v.user_id = ?
  AND (wp.status = 0 OR wp.status IS NULL)
ORDER BY wp.appointment_date DESC, wp.appointment_time DESC
");

$stmt->execute([$user_id]);

$bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    "success" => true,
    "bookings" => $bookings
]);