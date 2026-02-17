<?php
require "./core/settings.php";

isAdmin();

require_once "db.php";

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data["booking_id"])) {
    echo json_encode([
        "success" => false,
        "message" => "Hiányzó booking_id"
    ]);
    exit;
}

$booking_id = (int)$data["booking_id"];

try {
    // foglalás lekérése
    $stmt = $pdo->prepare("
        SELECT user_id, appointment_date, appointment_time
        FROM bookings
        WHERE id = ?
        LIMIT 1
    ");
    $stmt->execute([$booking_id]);
    $booking = $stmt->fetch();

    if (!$booking) {
        echo json_encode([
            "success" => false,
            "message" => "Foglalás nem található"
        ]);
        exit;
    }

    // work_process létrehozása
    $insert = $pdo->prepare("
        INSERT INTO work_process (
            booking_id,
            user_id,
            appointment_date,
            appointment_time,
            status,
            issued_at
        ) VALUES (?, ?, ?, ?, 1, NOW())
    ");

    $insert->execute([
        $booking_id,
        $booking["user_id"],
        $booking["appointment_date"],
        $booking["appointment_time"]
    ]);

    echo json_encode([
        "success" => true,
        "message" => "További munka elindítva"
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
