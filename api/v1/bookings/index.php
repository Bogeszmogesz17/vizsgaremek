<?php
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\PHPMailer;

require_once __DIR__ . "/../_bootstrap.php";
require_once __DIR__ . "/../../core/config.php";
require_once __DIR__ . "/../../core/email_template.php";
require_once __DIR__ . "/../../phpmailer/src/Exception.php";
require_once __DIR__ . "/../../phpmailer/src/PHPMailer.php";
require_once __DIR__ . "/../../phpmailer/src/SMTP.php";

$method = requireMethod(["GET", "POST"]);
$userId = requireLoggedInUserId();

if ($method === "GET") {
    $statement = $pdo->prepare("
        SELECT
            wp.id,
            wp.appointment_date,
            wp.appointment_time,
            s.name AS service_name
        FROM work_process wp
        JOIN services s ON s.id = wp.service_id
        JOIN vehicles v ON v.id = wp.vehicle_id
        WHERE v.user_id = ?
          AND (wp.status = 0 OR wp.status IS NULL)
        ORDER BY wp.appointment_date DESC, wp.appointment_time DESC
    ");
    $statement->execute([$userId]);

    jsonResponse([
        "success" => true,
        "bookings" => $statement->fetchAll(PDO::FETCH_ASSOC)
    ]);
}

$data = readJsonInput();
$requiredFields = [
    "appointment_date",
    "appointment_time",
    "service",
    "car_model",
    "car_year",
    "fuel_type"
];

foreach ($requiredFields as $field) {
    if (empty($data[$field])) {
        jsonResponse([
            "success" => false,
            "message" => "Hiányzó adat: {$field}"
        ], 400);
    }
}

$appointmentDate = trim((string)$data["appointment_date"]);
$appointmentTime = trim((string)$data["appointment_time"]);
$serviceId = requirePositiveInt($data["service"], "Érvénytelen szolgáltatás");
$carModelId = requirePositiveInt($data["car_model"], "Érvénytelen modell");
$carYear = requirePositiveInt($data["car_year"], "Érvénytelen évjárat");
$fuelTypeId = requirePositiveInt($data["fuel_type"], "Érvénytelen üzemanyag");
$engineSizeId = null;

if (isset($data["engine_size"]) && $data["engine_size"] !== "" && $data["engine_size"] !== null) {
    $engineSizeId = requirePositiveInt($data["engine_size"], "Érvénytelen köbcenti");
}

try {
    $appointmentDateTime = new DateTime($appointmentDate . " " . $appointmentTime);
    $currentDateTime = new DateTime();

    if ($appointmentDateTime < $currentDateTime) {
        jsonResponse([
            "success" => false,
            "message" => "Múltbeli időpontra nem lehet foglalni"
        ], 400);
    }
} catch (Throwable $throwable) {
    jsonResponse([
        "success" => false,
        "message" => "Érvénytelen dátum vagy időpont"
    ], 400);
}

try {
    $pdo->beginTransaction();

    $vehicleSearchStatement = $pdo->prepare("
        SELECT id
        FROM vehicles
        WHERE user_id = ?
          AND model_id = ?
          AND year = ?
          AND fuel_type_id = ?
          AND (engine_size_id = ? OR engine_size_id IS NULL)
        LIMIT 1
    ");
    $vehicleSearchStatement->execute([
        $userId,
        $carModelId,
        $carYear,
        $fuelTypeId,
        $engineSizeId
    ]);
    $vehicleId = $vehicleSearchStatement->fetchColumn();

    if (!$vehicleId) {
        $vehicleInsertStatement = $pdo->prepare("
            INSERT INTO vehicles (user_id, model_id, year, fuel_type_id, engine_size_id, active)
            VALUES (?, ?, ?, ?, ?, 1)
        ");
        $vehicleInsertStatement->execute([
            $userId,
            $carModelId,
            $carYear,
            $fuelTypeId,
            $engineSizeId
        ]);
        $vehicleId = $pdo->lastInsertId();
    }

    $conflictStatement = $pdo->prepare("
        SELECT COUNT(*)
        FROM work_process
        WHERE appointment_date = ?
          AND appointment_time = ?
          AND (status = 0 OR status IS NULL)
    ");
    $conflictStatement->execute([$appointmentDate, $appointmentTime]);

    if ((int)$conflictStatement->fetchColumn() > 0) {
        $pdo->rollBack();
        jsonResponse([
            "success" => false,
            "message" => "Ez az időpont már foglalt"
        ], 409);
    }

    $workProcessInsertStatement = $pdo->prepare("
        INSERT INTO work_process (
            vehicle_id,
            appointment_date,
            appointment_time,
            status,
            issued_at,
            work_price,
            service_id,
            method_id,
            invoices_id
        ) VALUES (?, ?, ?, 0, NOW(), 0, ?, NULL, NULL)
    ");
    $workProcessInsertStatement->execute([$vehicleId, $appointmentDate, $appointmentTime, $serviceId]);

    $carStatement = $pdo->prepare("
        SELECT b.brand_name AS brand, m.model_name AS model
        FROM model m
        LEFT JOIN brand b ON m.brand_id = b.id
        WHERE m.id = ?
        LIMIT 1
    ");
    $carStatement->execute([$carModelId]);
    $carData = $carStatement->fetch(PDO::FETCH_ASSOC) ?: ["brand" => "", "model" => ""];

    $pdo->commit();

    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host = "smtp.gmail.com";
        $mail->SMTPAuth = true;
        $mail->Username = MAIL_USER;
        $mail->Password = MAIL_PASS;
        $mail->SMTPSecure = "tls";
        $mail->Port = 587;
        $mail->CharSet = "UTF-8";
        $mail->Encoding = "base64";

        $mail->setFrom(MAIL_USER, "Dupla Dugattyú Műhely");
        $mail->addAddress($_SESSION["email"] ?? "", $_SESSION["name"] ?? "");

        $mail->isHTML(true);
        $mail->Subject = "Sikeres foglalás";
        $mail->Body = renderWorkshopEmail(
            "Sikeres foglalás",
            "A foglalásod sikeresen rögzítésre került.",
            $_SESSION["name"] ?? "",
            [
                "Dátum" => $appointmentDate,
                "Időpont" => $appointmentTime,
                "Autó" => trim(($carData["brand"] ?? "") . " " . ($carData["model"] ?? ""))
            ],
            "Foglalásodat legkésőbb 2 nappal az időpont előtt tudod lemondani."
        );

        $mail->send();
    } catch (Exception $exception) {
    }

    jsonResponse([
        "success" => true,
        "message" => "Sikeres foglalás"
    ], 201);
} catch (Throwable $throwable) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    jsonResponse([
        "success" => false,
        "message" => "Sikertelen foglalás"
    ], 500);
}
