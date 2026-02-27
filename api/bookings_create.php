<?php

// ===== CORS =====
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: http://localhost:5173");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
    http_response_code(200);
    exit();
}

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// ========================================

require "./core/settings.php";
require_once "db.php";

session_start();

if (!isset($_SESSION["user_id"])) {
    echo json_encode(["success" => false, "message" => "Nincs bejelentkezve"]);
    exit;
}

$user_id = $_SESSION["user_id"];
require_once "db.php";

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
$service_id       = (int)$data["service"];
$car_model        = (int)$data["car_model"];
$car_year         = (int)$data["car_year"];
$fuel_type        = (int)$data["fuel_type"];
$engine_size      = $data["engine_size"] ? (int)$data["engine_size"] : null;

try {

    $pdo->beginTransaction();

    // =====================================
    // 1️⃣ Megnézzük van-e már ilyen jármű
    // =====================================
    $stmt = $pdo->prepare("
        SELECT id 
        FROM vehicles 
        WHERE user_id = ?
        AND model_id = ?
        AND year = ?
        AND fuel_type_id = ?
        AND (engine_size_id = ? OR engine_size_id IS NULL)
        LIMIT 1
    ");

    $stmt->execute([
        $user_id,
        $car_model,
        $car_year,
        $fuel_type,
        $engine_size
    ]);

    $vehicle_id = $stmt->fetchColumn();

    // =====================================
    // 2️⃣ Ha nincs, létrehozzuk
    // =====================================
    if (!$vehicle_id) {

        $stmt = $pdo->prepare("
            INSERT INTO vehicles
            (user_id, model_id, year, fuel_type_id, engine_size_id, active)
            VALUES (?, ?, ?, ?, ?, 1)
        ");

        $stmt->execute([
            $user_id,
            $car_model,
            $car_year,
            $fuel_type,
            $engine_size
        ]);

        $vehicle_id = $pdo->lastInsertId();
    }

    // =====================================
    // 3️⃣ work_process beszúrás
    // =====================================
    $stmt = $pdo->prepare("
        INSERT INTO work_process
        (vehicle_id, appointment_date, appointment_time, status, issued_at, work_price, material_price, method_id, invoices_id)
        VALUES (?, ?, ?, 'booked', NOW(), 0, 0, NULL, NULL)
    ");

    $stmt->execute([
        $vehicle_id,
        $appointment_date,
        $appointment_time
    ]);

    $work_process_id = $pdo->lastInsertId();

    // =====================================
    // 4️⃣ work_process_services beszúrás
    // =====================================
    $stmt = $pdo->prepare("
        INSERT INTO work_process_services
        (work_process_id, service_id)
        VALUES (?, ?)
    ");

    $stmt->execute([
        $work_process_id,
        $service_id
    ]);

    $pdo->commit();

    echo json_encode([
        "success" => true,
        "message" => "Sikeres foglalás"
    ]);

} catch (Exception $e) {

    $pdo->rollBack();

    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}