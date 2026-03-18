<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require "./core/config.php";
require_once "./core/email_template.php";
require "phpmailer/src/Exception.php";
require "phpmailer/src/PHPMailer.php";
require "phpmailer/src/SMTP.php";

require "./core/settings.php";
isAdmin();
require_once "db.php";

$data = json_decode(file_get_contents("php://input"), true);

$original_work_process_id = isset($data["booking_id"]) ? (int)$data["booking_id"] : 0;
$date = $data["date"] ?? null;
$time = $data["time"] ?? null;
$service_name = trim($data["description"] ?? "");

if (!$original_work_process_id || !$date || !$time || $service_name === "") {
    echo json_encode([
        "success" => false,
        "message" => "Hiányzó adatok"
    ]);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT vehicle_id
        FROM work_process
        WHERE id = ?
        LIMIT 1
    ");
    $stmt->execute([$original_work_process_id]);
    $work = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$work) {
        echo json_encode([
            "success" => false,
            "message" => "Munkafolyamat nem található"
        ]);
        exit;
    }

    $customerStmt = $pdo->prepare("
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
    $customerStmt->execute([$work["vehicle_id"]]);
    $customer = $customerStmt->fetch(PDO::FETCH_ASSOC);

    if (!$customer) {
        echo json_encode([
            "success" => false,
            "message" => "Ügyfél adatok nem találhatók"
        ]);
        exit;
    }

    $conflictCheck = $pdo->prepare("
        SELECT COUNT(*)
        FROM work_process
        WHERE appointment_date = ?
          AND appointment_time = ?
          AND status = 0
    ");
    $conflictCheck->execute([$date, $time]);

    if ((int)$conflictCheck->fetchColumn() > 0) {
        echo json_encode([
            "success" => false,
            "message" => "Ez az időpont már foglalt"
        ]);
        exit;
    }

    $serviceStmt = $pdo->prepare("
        SELECT id
        FROM services
        WHERE id <= 6
          AND COALESCE(is_bookable, 1) = 0
        ORDER BY id ASC
        LIMIT 1
    ");
    $serviceStmt->execute();
    $service_id = $serviceStmt->fetchColumn();


    if (!$service_id) {
        echo json_encode([
            "success" => false,
            "message" => "Nem található alap (nem foglalható) szolgáltatás a további munkákhoz"
        ]);
        exit;
    }

    $pdo->beginTransaction();

    $insert = $pdo->prepare("
        INSERT INTO work_process (
            vehicle_id,
            appointment_date,
            appointment_time,
            status,
            issued_at,
            work_price,
            material_price,
            method_id,
            invoices_id,
            additional_work_description
        ) VALUES (?, ?, ?, 0, NOW(), 0, 0, NULL, NULL, ?)
    ");

    $insert->execute([
        $work["vehicle_id"],
        $date,
        $time,
        $service_name
    ]);

    $new_work_process_id = $pdo->lastInsertId();

    $serviceInsert = $pdo->prepare("
        INSERT INTO work_process_services (work_process_id, service_id)
        VALUES (?, ?)
    ");
    $serviceInsert->execute([$new_work_process_id, $service_id]);
    $closeOriginal = $pdo->prepare("
        UPDATE work_process
        SET status = 1
        WHERE id = ?
    ");
    $closeOriginal->execute([$original_work_process_id]);

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
    } catch (Exception $e) {}

    echo json_encode([
        "success" => true,
        "message" => "További időpont sikeresen létrehozva"
    ]);
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo json_encode([
        "success" => false,
        "message" => "Adatbázis hiba: " . $e->getMessage()
    ]);
}
