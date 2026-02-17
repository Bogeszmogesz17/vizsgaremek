<?php
session_start();

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

// 🔒 ADMIN CHECK
if (!isset($_SESSION["admin_id"])) {
    echo json_encode([
        "success" => false,
        "message" => "Nincs admin jogosultság"
    ]);
    exit;
}

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
    // 🔎 Foglalás lekérése
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

    // ➕ work_process létrehozása
    $insert = $pdo->prepare("
        INSERT INTO work_process (
            user_id,
            appointment_date,
            appointment_time,
            status,
            issued_at
        ) VALUES (?, ?, ?, 1, NOW())
    ");
    $insert->execute([
        $booking["user_id"],
        $booking["appointment_date"],
        $booking["appointment_time"]
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Munka elindítva"
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
