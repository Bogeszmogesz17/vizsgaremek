<?php
require "./core/settings.php";


// ===============================
// BEJELENTKEZÉS ELLENŐRZÉS
// ===============================
isUser();

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



//CSAK TESZTELÉSHEZ, AMÍG NINCS RENDESEN MEGCSINÁLVA A SELECT MEZŐK!!!!!!!!!!!!
$car_model   = 2;
$fuel_type   = 2;
$service     = 1;
$engine_size = 3;

$stmt = $pdo->prepare("SELECT id FROM vehicles WHERE user_id = :user_id AND fuel_type_id = :fuel_type_id AND engine_size_id = :engine_size_id AND model_id = :model_id");

// Bind parameter

$stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
$stmt->bindParam(':model_id', $car_model, PDO::PARAM_INT);
$stmt->bindParam(':fuel_type_id', $fuel_type, PDO::PARAM_INT);
$stmt->bindParam(':engine_size_id', $engine_size, PDO::PARAM_INT);

// Execute
$stmt->execute();

// Fetch results
$vehicleIds = $stmt->fetchAll(PDO::FETCH_COLUMN);

$status = false;
function registerVehicle($pdo, $data) {
    try {
        $stmt = $pdo->prepare("
            INSERT INTO vehicles (
                year,
                user_id,
                model_id,
                fuel_type_id,
                engine_size_id
            ) VALUES (
                :year,
                :user_id,
                :model_id,
                :fuel_type_id,
                :engine_size_id
            )
        ");
    
        $stmt->execute([
            ":year"           => (int)$data["car_year"],
            ":user_id"        => $data["user_id"],
            ":model_id"       => $data["car_model"],
            ":fuel_type_id"   => $data["fuel_type"],
            ":engine_size_id" => $data["engine_size"],
        ]);

    } catch (PDOException $e) {
        echo json_encode([
            "success" => false,
            "message" => $e->getMessage()
        ]);
    }    
}

function createWorkProcess ($pdo, $data) {
    try {
        $stmt = $pdo->prepare("
            INSERT INTO work_process (
                vehicle_id,
                appointment_date,
                appointment_time,
                issued_at
            ) VALUES (
                :vehicle_id,
                :date,
                :time,
                :issued_at
            )
        ");
    
        $stmt->execute([
            ":date"       => $data["appointment_date"],
            ":time"       => $data["appointment_time"],
            ":issued_at"  => date("Y-m-d H:i:s"),
            ":vehicle_id" => $data["vehicle_id"],
        ]);

    } catch (PDOException $e) {
        echo json_encode([
            "success" => false,
            "message" => $e->getMessage()
        ]);
    }    
}

function createWorkProcessService ($pdo, $data) {
    try {
        $stmt = $pdo->prepare("
            INSERT INTO work_process_services (
                service_id,
                work_process_id
            ) VALUES (
                :service_id,
                :work_process_id
            )
        ");
    
        $stmt->execute([
            ":service_id"       => $data["service_id"],
            ":work_process_id"  => $data["work_process_id"],
        ]);

        $status = true;
        return $status;
    
    } catch (PDOException $e) {
        echo json_encode([
            "success" => false,
            "message" => $e->getMessage()
        ]);
    }       
}

if($vehicleIds) {
    $data["vehicle_id"] = $vehicleIds[0];
    createWorkProcess($pdo, $data);
    $data["service_id"]      = $service;
    $data["work_process_id"] = $pdo->lastInsertId();
    $status = createWorkProcessService($pdo, $data);
} else {
    $data["user_id"]     = $user_id;
    $data["fuel_type"]   = $fuel_type;
    $data["engine_size"] = $engine_size;
    registerVehicle($pdo, $data);

    $data["vehicle_id"] = $pdo->lastInsertId();
    createWorkProcess($pdo, $data);

    $data["service_id"]      = $service;
    $data["work_process_id"] = $pdo->lastInsertId();
    $status = createWorkProcessService($pdo, $data);
}

if($status) {
    echo json_encode([
        "success" => true,
        "message" => "Sikeres foglalás"
    ]);    
} else {
    echo json_encode([
        "success" => false,
        "message" => $vehicleIds
    ]);
}

