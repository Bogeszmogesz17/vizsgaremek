<?php
// ===============================
// FOGLALÁS LÉTREHOZÁSA
// ===============================

header("Content-Type: application/json");
require_once "db.php";

// JSON beolvasása
$data = json_decode(file_get_contents("php://input"), true);

// Alap ellenőrzés
if (
    empty($data["user_id"]) ||
    empty($data["appointment_date"]) ||
    empty($data["appointment_time"]) ||
    empty($data["service"]) ||
    empty($data["car_brand"]) ||
    empty($data["car_model"]) ||
    empty($data["car_year"]) ||
    empty($data["fuel_type"])
) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Hiányzó adatok"
    ]);
    exit;
}

try {
    // 1️⃣ work_process tábla
    $stmt = $pdo->prepare("
        INSERT INTO work_process 
        (user_id, appointment_date, status, issued_at, method_id)
        VALUES (:user_id, :appointment_date, 0, NOW(), 1)
    ");

    $stmt->execute([
        ":user_id" => $data["user_id"],
        ":appointment_date" => $data["appointment_date"]
    ]);

    $workProcessId = $pdo->lastInsertId();

    // 2️⃣ vehicles tábla
    $stmt = $pdo->prepare("
        INSERT INTO vehicles 
        (user_id, brand, model, year, engine_type)
        VALUES (:user_id, :brand, :model, :year, :engine)
    ");

    $stmt->execute([
        ":user_id" => $data["user_id"],
        ":brand" => $data["car_brand"],
        ":model" => $data["car_model"],
        ":year" => $data["car_year"],
        ":engine" => $data["fuel_type"]
    ]);

    $vehicleId = $pdo->lastInsertId();

    // 3️⃣ users_vehicle kapcsolótábla
    $stmt = $pdo->prepare("
        INSERT INTO users_vehicle (user_id, vehicle_id)
        VALUES (:user_id, :vehicle_id)
    ");

    $stmt->execute([
        ":user_id" => $data["user_id"],
        ":vehicle_id" => $vehicleId
    ]);

    // 4️⃣ válasz
    echo json_encode([
        "success" => true,
        "message" => "Foglalás sikeresen rögzítve",
        "work_process_id" => $workProcessId
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Mentési hiba"
    ]);
}
