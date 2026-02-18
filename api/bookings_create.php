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
$car_model = 1;
$fuel_type = 1;
$engine_size = 1;

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

if($vehicleIds) {
    echo "Van id";
    try {
        $stmt = $pdo->prepare("
            INSERT INTO work_process (
                vehicle_id,
                appointment_date,
                appointment_time
            ) VALUES (
                :vehicle_id,
                :date,
                :time
            )
        ");
    
        $stmt->execute([
            ":date"       => $appointment_date,
            ":time"       => $appointment_time,
            ":vehicle_id" => $vehicleIds[0]
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
} else {
    echo "nincs id";
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