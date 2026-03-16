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
requireAdminSession();

if ($method === "GET") {
    $statement = $pdo->query("
        SELECT
            wp.id,
            wp.appointment_date,
            wp.appointment_time,
            wp.work_price,
            wp.material_price,
            COALESCE(s.name, '') AS description,
            u.name AS user_name,
            u.email AS user_email,
            u.phone_number,
            CONCAT(COALESCE(st.post_code, ''), ' ', COALESCE(st.settlement_name, ''), ', ', COALESCE(u.address, '')) AS user_address,
            b.brand_name AS car_brand,
            m.model_name AS car_model
        FROM work_process wp
        LEFT JOIN work_process_services wps ON wps.work_process_id = wp.id
        LEFT JOIN services s ON s.id = wps.service_id
        JOIN vehicles v ON wp.vehicle_id = v.id
        JOIN users u ON v.user_id = u.id
        LEFT JOIN settlement st ON st.id = u.settlement_id
        JOIN model m ON v.model_id = m.id
        JOIN brand b ON m.brand_id = b.id
        WHERE (wp.status = 0 OR wp.status IS NULL)
          AND s.is_bookable = 0
        ORDER BY wp.appointment_date ASC, wp.appointment_time ASC
    ");

    jsonResponse([
        "success" => true,
        "works" => $statement->fetchAll(PDO::FETCH_ASSOC)
    ]);
}

$data = readJsonInput();
$originalWorkProcessId = requirePositiveInt($data["booking_id"] ?? null, "Hiányzó foglalás azonosító");
$date = trim((string)($data["date"] ?? ""));
$time = trim((string)($data["time"] ?? ""));
$serviceName = trim((string)($data["description"] ?? ""));

if ($date === "" || $time === "" || $serviceName === "") {
    jsonResponse([
        "success" => false,
        "message" => "Hiányzó adatok"
    ], 400);
}

$appointmentDateTime = DateTimeImmutable::createFromFormat("Y-m-d H:i", "{$date} {$time}");
$dateTimeErrors = DateTimeImmutable::getLastErrors();
if (
    !$appointmentDateTime ||
    ($dateTimeErrors && (($dateTimeErrors["warning_count"] ?? 0) > 0 || ($dateTimeErrors["error_count"] ?? 0) > 0))
) {
    jsonResponse([
        "success" => false,
        "message" => "Érvénytelen dátum vagy időpont"
    ], 400);
}

if ($appointmentDateTime < new DateTimeImmutable("now")) {
    jsonResponse([
        "success" => false,
        "message" => "Korábbi időpontra nem lehet foglalni"
    ], 400);
}

try {
    $workStatement = $pdo->prepare("
        SELECT vehicle_id
        FROM work_process
        WHERE id = ?
        LIMIT 1
    ");
    $workStatement->execute([$originalWorkProcessId]);
    $work = $workStatement->fetch(PDO::FETCH_ASSOC);

    if (!$work) {
        jsonResponse([
            "success" => false,
            "message" => "Munkafolyamat nem található"
        ], 404);
    }

    $customerStatement = $pdo->prepare("
        SELECT
            u.name AS user_name,
            u.email AS user_email,
            b.brand_name AS car_brand,
            m.model_name AS car_model
        FROM vehicles v
        JOIN users u ON v.user_id = u.id
        JOIN model m ON v.model_id = m.id
        JOIN brand b ON m.brand_id = b.id
        WHERE v.id = ?
        LIMIT 1
    ");
    $customerStatement->execute([$work["vehicle_id"]]);
    $customer = $customerStatement->fetch(PDO::FETCH_ASSOC);

    if (!$customer) {
        jsonResponse([
            "success" => false,
            "message" => "Ügyfél adatok nem találhatók"
        ], 404);
    }

    $conflictStatement = $pdo->prepare("
        SELECT COUNT(*)
        FROM work_process
        WHERE appointment_date = ?
          AND appointment_time = ?
          AND status = 0
    ");
    $conflictStatement->execute([$date, $time]);

    if ((int)$conflictStatement->fetchColumn() > 0) {
        jsonResponse([
            "success" => false,
            "message" => "Ez az időpont már foglalt"
        ], 409);
    }

    $serviceSearchStatement = $pdo->prepare("
        SELECT id
        FROM services
        WHERE LOWER(TRIM(name)) = LOWER(TRIM(?))
          AND is_bookable = 0
        LIMIT 1
    ");
    $serviceSearchStatement->execute([$serviceName]);
    $serviceId = $serviceSearchStatement->fetchColumn();

    $pdo->beginTransaction();

    if (!$serviceId) {
        $serviceInsertStatement = $pdo->prepare("
            INSERT INTO services (name, price, type, is_bookable)
            VALUES (?, 0, 0, 0)
        ");
        $serviceInsertStatement->execute([$serviceName]);
        $serviceId = $pdo->lastInsertId();
    }

    $workProcessInsertStatement = $pdo->prepare("
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
        ) VALUES (?, ?, ?, 0, NOW(), 0, 0, NULL, NULL)
    ");
    $workProcessInsertStatement->execute([$work["vehicle_id"], $date, $time]);
    $newWorkProcessId = $pdo->lastInsertId();

    $serviceLinkStatement = $pdo->prepare("
        INSERT INTO work_process_services (work_process_id, service_id)
        VALUES (?, ?)
    ");
    $serviceLinkStatement->execute([$newWorkProcessId, $serviceId]);

    $closeOriginalStatement = $pdo->prepare("
        UPDATE work_process
        SET status = 1
        WHERE id = ?
    ");
    $closeOriginalStatement->execute([$originalWorkProcessId]);

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
        $mail->addAddress($customer["user_email"], $customer["user_name"]);
        $mail->isHTML(true);
        $mail->Subject = "Új időpont foglalva";
        $mail->Body = renderWorkshopEmail(
            "Új időpont került foglalásra",
            "Új időpontot foglaltunk neked.",
            $customer["user_name"],
            [
                "Dátum" => $date,
                "Időpont" => $time,
                "Autó" => trim($customer["car_brand"] . " " . $customer["car_model"])
            ]
        );
        $mail->send();
    } catch (Exception $exception) {
    }

    jsonResponse([
        "success" => true,
        "message" => "További időpont sikeresen létrehozva"
    ], 201);
} catch (Throwable $throwable) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    jsonResponse([
        "success" => false,
        "message" => "Adatbázis hiba"
    ], 500);
}
