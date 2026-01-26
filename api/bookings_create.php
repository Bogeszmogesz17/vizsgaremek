<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once "db.php";

$data = json_decode(file_get_contents("php://input"), true);

// kötelező mezők
$required = [
    "user_id",
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
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Hiányzó adatok: $field"
        ]);
        exit;
    }
}

try {
    // 1️⃣ work_process
    $stmt = $pdo->prepare("
        INSERT INTO work_process
        (user_id, appointment_date, status, work_price, service_price, material_price, issued_at, method_id)
        VALUES (:user_id, :appointment_date, 0, 0, 0, 0, NOW(), 1)
    ");
    $stmt->execute([
        ":user_id" => $data["user_id"],
        ":appointment_date" => $data["appointment_date"]
    ]);

    $workProcessId = $pdo->lastInsertId();

    // 2️⃣ vehicles (FONTOS: engine_number!)
    $stmt = $pdo->prepare("
        INSERT INTO vehicles
        (user_id, brand, model, year, engine_number)
        VALUES (:user_id, :brand, :model, :year, :engine_number)
    ");
    $stmt->execute([
        ":user_id" => $data["user_id"],
        ":brand" => $data["car_brand"],
        ":model" => $data["car_model"],
        ":year" => $data["car_year"],
        ":engine_number" => $data["fuel_type"]
    ]);

    $vehicleId = $pdo->lastInsertId();

    // 3️⃣ users_vehicle
    $stmt = $pdo->prepare("
    INSERT INTO users_vehicle (user_id, vehicle_id, appointment_id)
    VALUES (:user_id, :vehicle_id, :appointment_id)
");

$stmt->execute([
    ":user_id" => $data["user_id"],
    ":vehicle_id" => $vehicleId,
    ":appointment_id" => $workProcessId
]);


    echo json_encode([
        "success" => true,
        "message" => "Foglalás sikeresen rögzítve"
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage() // ⬅ MOST KIÍRJA A VALÓDI SQL HIBÁT
    ]);
}
