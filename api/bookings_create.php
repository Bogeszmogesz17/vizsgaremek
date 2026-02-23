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


echo "A data a legelején<pre>";
print_r($data);
echo "</pre>";


//CSAK TESZTELÉSHEZ, AMÍG NINCS RENDESEN MEGCSINÁLVA A SELECT MEZŐK!!!!!!!!!!!!
$car_model = 2;
$fuel_type = 2;
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
echo "<pre>";
print_r($vehicleIds);
echo "</pre>";

function registerVehicle($pdo, $data) {
    echo "A data a registerVehicle-ben<pre>";
    print_r($data);
    echo "</pre>";
    print_r($data);
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
}

function createWorkProcess ($pdo, $data) {
    echo "A data a createWorkProcess-ben<pre>";
    print_r($data);
    echo "</pre>";
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
}

if($vehicleIds) {
    $data["vehicle_id"] = $vehicleIds[0];
    createWorkProcess($pdo, $data);
} else {
    $data["user_id"]     = $user_id;
    $data["fuel_type"]   = $fuel_type;
    $data["engine_size"] = $engine_size;
    registerVehicle($pdo, $data);

    $data["vehicle_id"] = $pdo->lastInsertId();
    createWorkProcess($pdo, $data);
}
/*

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
*/

echo json_encode([
    "success" => false,
    "message" => $vehicleIds
]);