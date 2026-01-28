<?php
// ===============================
// SESSION + CORS
// ===============================
session_start();

header("Access-Control-Allow-Origin: http://localhost:5174");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Preflight (CORS)
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

// ===============================
// BEJELENTKEZÉS ELLENŐRZÉS
// ===============================
if (!isset($_SESSION["user_id"])) {
    echo json_encode([
        "success" => false,
        "message" => "Nincs bejelentkezve"
    ]);
    exit;
}

$user_id = $_SESSION["user_id"];

// ===============================
// DB
// ===============================
require_once "db.php";

// ===============================
// ADATOK BEOLVASÁSA
// ===============================
$data = json_decode(file_get_contents("php://input"), true);

$required = [
    "appointment_date",
    "appointment_time",
    "service",
    "car_brand",
    "car_model",
    "car_year",
    "fuel_type"
];

foreach ($required as $field) {
    if (empty($data[$field])) {
        echo json_encode([
            "success" => false,
            "message" => "Hiányzó adat: $field"
        ]);
        exit;
    }
}

$appointment_date = $data["appointment_date"];
$appointment_time = $data["appointment_time"];
$service          = $data["service"];
$car_brand        = $data["car_brand"];
$car_model        = $data["car_model"];
$car_year         = (int)$data["car_year"];
$fuel_type        = $data["fuel_type"];
$engine_size      = $data["engine_size"] ?? null;

// ===============================
// MENTÉS
// ===============================
try {
    $stmt = $pdo->prepare("
        INSERT INTO bookings (
            user_id,
            appointment_date,
            appointment_time,
            service,
            car_brand,
            car_model,
            car_year,
            fuel_type,
            engine_size
        ) VALUES (
            :user_id,
            :date,
            :time,
            :service,
            :brand,
            :model,
            :year,
            :fuel,
            :engine
        )
    ");

    $stmt->execute([
        ":user_id" => $user_id,
        ":date"    => $appointment_date,
        ":time"    => $appointment_time,
        ":service" => $service,
        ":brand"   => $car_brand,
        ":model"   => $car_model,
        ":year"    => $car_year,
        ":fuel"    => $fuel_type,
        ":engine"  => $engine_size
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Sikeres foglalás"
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
