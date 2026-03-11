<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once "core/config.php";

$data = json_decode(file_get_contents("php://input"), true);

$booking_id = $data["booking_id"] ?? null;
$date = $data["date"] ?? null;
$time = $data["time"] ?? null;
$description = $data["description"] ?? "";

if (!$booking_id || !$date || !$time) {
    echo json_encode(["success"=>false,"message"=>"Hiányzó adatok"]);
    exit;
}

/* VEHICLE lekérés a bookingból */

$stmt = $conn->prepare("
SELECT vehicle_id
FROM bookings
WHERE id = ?
");

$stmt->bind_param("i",$booking_id);
$stmt->execute();
$res = $stmt->get_result();

if($res->num_rows === 0){
    echo json_encode(["success"=>false,"message"=>"Foglalás nem található"]);
    exit;
}

$row = $res->fetch_assoc();
$vehicle_id = $row["vehicle_id"];

/* új work_process beszúrás */

$stmt = $conn->prepare("
INSERT INTO work_process
(vehicle_id,appointment_date,appointment_time,description,status,issued_at,work_price,material_price)
VALUES(?,?,?, ?,0,NOW(),0,0)
");

$stmt->bind_param("isss",$vehicle_id,$date,$time,$description);

if(!$stmt->execute()){
    echo json_encode([
        "success"=>false,
        "message"=>$conn->error
    ]);
    exit;
}

echo json_encode([
    "success"=>true
]);