<?php


use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require "./core/config.php";
require_once "./core/email_template.php";
require 'phpmailer/src/Exception.php';
require 'phpmailer/src/PHPMailer.php';
require 'phpmailer/src/SMTP.php';

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

require "./core/settings.php";
require_once "db.php";

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
$engine_size      = $data["engine_size"] ?? null;


$currentDateTime = new DateTime();
$appointmentDateTime = new DateTime($appointment_date . ' ' . $appointment_time);

if ($appointmentDateTime < $currentDateTime) {
    echo json_encode([
        "success" => false,
        "message" => "Múltbeli időpontra nem lehet foglalni"
    ]);
    exit;
}

try {

    $pdo->beginTransaction();

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

    $stmt = $pdo->prepare("
        SELECT COUNT(*) 
        FROM work_process
        WHERE appointment_date = ?
        AND appointment_time = ?
    ");

    $stmt->execute([
        $appointment_date,
        $appointment_time
    ]);

    $count = $stmt->fetchColumn();
    if ($count > 0) {

    $pdo->rollBack();

    echo json_encode([
        "success" => false,
        "message" => "Ez az időpont már foglalt"
    ]);

    exit;
}

    $stmt = $pdo->prepare("
        INSERT INTO work_process
        (vehicle_id, appointment_date, appointment_time, status, issued_at, work_price, material_price, method_id, invoices_id)
        VALUES (?, ?, ?, 0, NOW(), 0, 0, NULL, NULL)
    ");

    $stmt->execute([
        $vehicle_id,
        $appointment_date,
        $appointment_time
    ]);

    $work_process_id = $pdo->lastInsertId();

    $stmt = $pdo->prepare("
        INSERT INTO work_process_services
        (work_process_id, service_id)
        VALUES (?, ?)
    ");

    $stmt->execute([
        $work_process_id,
        $service_id
    ]);

    $stmt = $pdo->prepare("
SELECT b.brand_name AS brand, m.model_name AS model
FROM model m
LEFT JOIN brand b ON m.brand_id = b.id
WHERE m.id = ?
LIMIT 1
");

    $stmt->execute([$car_model]);
    $car = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($car) {
        $car_brand = $car['brand'];
        $car_model_name = $car['model'];
    } else {
        $car_brand = '';
        $car_model_name = '';
    }
    $pdo->commit();


    $mail = new PHPMailer(true);

    try {

        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = MAIL_USER;
        $mail->Password = MAIL_PASS;
        $mail->SMTPSecure = 'tls';
        $mail->Port = 587;
        $mail->CharSet = 'UTF-8';
        $mail->Encoding = 'base64';

        $mail->setFrom('bogibodis6@gmail.com', 'Dupla Dugattyú Műhely');
        $mail->addAddress($_SESSION["email"], $_SESSION["name"]);

        $mail->isHTML(true);
        $mail->Subject = 'Sikeres foglalás';

        $mail->Body = renderWorkshopEmail(
            "Sikeres foglalás",
            "A foglalásod sikeresen rögzítésre került.",
            $_SESSION["name"] ?? "",
            [
                "Dátum" => $appointment_date,
                "Időpont" => $appointment_time,
                "Autó" => trim($car_brand . " " . $car_model_name)
            ],
            "Foglalásodat legkésőbb 2 nappal az időpont előtt tudod lemondani."
        );

        $mail->send();

    } catch (Exception $e) {}

    echo json_encode([
        "success" => true,
        "message" => "Sikeres foglalás"
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    echo json_encode([
        "success" => false,
        "message" => "Sikertelen foglalás"
    ]);
}
