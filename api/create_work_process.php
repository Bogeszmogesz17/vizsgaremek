<?php
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
        WHERE LOWER(TRIM(name)) = LOWER(TRIM(?))
          AND is_bookable = 0
        LIMIT 1
    ");
    $serviceStmt->execute([$service_name]);
    $service_id = $serviceStmt->fetchColumn();


    $pdo->beginTransaction();

    if (!$service_id) {
        $newService = $pdo->prepare("
            INSERT INTO services (name, price, type, is_bookable)
            VALUES (?, 0, 0, 0)
        ");
        $newService->execute([$service_name]);
        $service_id = $pdo->lastInsertId();
    }

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
            invoices_id
        ) VALUES (?, ?, ?, 0, NOW(), 0, 0, NULL, NULL)
    ");

    $insert->execute([
        $work["vehicle_id"],
        $date,
        $time
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
