<?php

require_once "core/config.php";
session_start();

header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

$booking_id = $data["booking_id"] ?? null;
$description = $data["description"] ?? "";
$date = $data["date"] ?? "";
$time = $data["time"] ?? "";

if (!$booking_id || !$date || !$time) {
    echo json_encode([
        "success" => false,
        "message" => "Hiányzó adatok"
    ]);
    exit;
}

/*
Megkeressük a vehicle_id-t az eredeti foglalásból
*/
$stmt = $conn->prepare("
SELECT vehicle_id 
FROM work_process
WHERE id = ?
");

$stmt->bind_param("i", $booking_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode([
        "success" => false,
        "message" => "Foglalás nem található"
    ]);
    exit;
}

$row = $result->fetch_assoc();
$vehicle_id = $row["vehicle_id"];

/*
Új munkafolyamat létrehozása
*/
$stmt = $conn->prepare("
INSERT INTO work_process
(vehicle_id, appointment_date, appointment_time, description, status, issued_at, work_price, material_price)
VALUES (?, ?, ?, ?, 0, NOW(), 0, 0)
");

$stmt->bind_param("isss", $vehicle_id, $date, $time, $description);

if ($stmt->execute()) {

    echo json_encode([
        "success" => true
    ]);

} else {

    echo json_encode([
        "success" => false,
        "message" => "Adatbázis hiba"
    ]);
}