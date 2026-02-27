<?php
session_start();

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

require_once "db.php";

/* =====================================================
   SELECT ADATOK (LEGÖRDÜLŐ MENÜK)
   ===================================================== */
if ($_SERVER["REQUEST_METHOD"] === "GET" && isset($_GET["type"])) {

    $type = $_GET["type"];

    switch ($type) {

        case "brands":
            $stmt = $pdo->query("SELECT id, brand_name FROM brand ORDER BY brand_name");
            break;

        case "models":
            if (!isset($_GET["brand_id"])) {
                echo json_encode(["success" => false]);
                exit;
            }

            $stmt = $pdo->prepare("
                SELECT id, model_name 
                FROM model 
                WHERE brand_id = :brand_id
                ORDER BY model_name
            ");
            $stmt->execute([":brand_id" => $_GET["brand_id"]]);

            echo json_encode([
                "success" => true,
                "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)
            ]);
            exit;

        case "fuel":
            $stmt = $pdo->query("SELECT id, fuel_name FROM fuel_type ORDER BY fuel_name");
            break;

        case "engine":
            $stmt = $pdo->query("SELECT id, engine_size FROM engine_size ORDER BY engine_size");
            break;

        case "services":
            $stmt = $pdo->query("
                SELECT id, name 
                FROM services
                WHERE is_bookable = 1
                ORDER BY name
            ");
            break;

        default:
            echo json_encode(["success" => false]);
            exit;
    }

    echo json_encode([
        "success" => true,
        "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)
    ]);
    exit;
}

/* =====================================================
   FOGLALÁS (POST)
   ===================================================== */

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    if (!isset($_SESSION["user_id"])) {
        echo json_encode([
            "success" => false,
            "message" => "Nincs bejelentkezve"
        ]);
        exit;
    }

    $user_id = $_SESSION["user_id"];
    $data = json_decode(file_get_contents("php://input"), true);

    $required = [
        "appointment_date",
        "appointment_time",
        "service",
        "car_model",
        "car_year",
        "fuel_type",
        "engine_size"
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

    try {

        $pdo->beginTransaction();

        $service     = (int)$data["service"];
        $model_id    = (int)$data["car_model"];
        $year        = (int)$data["car_year"];
        $fuel_id     = (int)$data["fuel_type"];
        $engine_id   = (int)$data["engine_size"];

        /* ===== SERVICE ELLENŐRZÉS ===== */
        $stmt = $pdo->prepare("
            SELECT id FROM services
            WHERE id = :id AND is_bookable = 1
        ");
        $stmt->execute([":id" => $service]);

        if (!$stmt->fetch()) {
            throw new Exception("Ez a szolgáltatás nem foglalható.");
        }

        /* ===== VEHICLE KERESÉS ===== */
        $stmt = $pdo->prepare("
            SELECT id FROM vehicles
            WHERE user_id = :user_id
            AND model_id = :model_id
            AND year = :year
            AND fuel_type_id = :fuel_id
            AND engine_size_id = :engine_id
            LIMIT 1
        ");

        $stmt->execute([
            ":user_id" => $user_id,
            ":model_id" => $model_id,
            ":year" => $year,
            ":fuel_id" => $fuel_id,
            ":engine_id" => $engine_id
        ]);

        $vehicle_id = $stmt->fetchColumn();

        /* ===== HA NINCS, LÉTREHOZZUK ===== */
        if (!$vehicle_id) {

            $stmt = $pdo->prepare("
                INSERT INTO vehicles (
                    user_id,
                    model_id,
                    year,
                    fuel_type_id,
                    engine_size_id,
                    active
                ) VALUES (
                    :user_id,
                    :model_id,
                    :year,
                    :fuel_id,
                    :engine_id,
                    1
                )
            ");

            $stmt->execute([
                ":user_id" => $user_id,
                ":model_id" => $model_id,
                ":year" => $year,
                ":fuel_id" => $fuel_id,
                ":engine_id" => $engine_id
            ]);

            $vehicle_id = $pdo->lastInsertId();
        }

        /* ===== WORK PROCESS ===== */
        $stmt = $pdo->prepare("
            INSERT INTO work_process (
                vehicle_id,
                appointment_date,
                appointment_time,
                status,
                issued_at,
                work_price,
                material_price,
                method_id,
                invoices_id
            ) VALUES (
                :vehicle_id,
                :date,
                :time,
                0,
                NOW(),
                0,
                0,
                1,
                1
            )
        ");

        $stmt->execute([
            ":vehicle_id" => $vehicle_id,
            ":date" => $data["appointment_date"],
            ":time" => $data["appointment_time"]
        ]);

        $work_process_id = $pdo->lastInsertId();

        /* ===== SERVICE KAPCSOLÁS ===== */
        $stmt = $pdo->prepare("
            INSERT INTO work_process_services (
                work_process_id,
                service_id
            ) VALUES (
                :wp_id,
                :service_id
            )
        ");

        $stmt->execute([
            ":wp_id" => $work_process_id,
            ":service_id" => $service
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
}