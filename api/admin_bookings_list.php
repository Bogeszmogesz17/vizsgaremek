<?php
// ===============================
// ADMIN – FOGLALÁSOK LISTÁZÁSA
// ===============================

session_start();

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// 🔒 ADMIN ELLENŐRZÉS
if (!isset($_SESSION["admin_id"])) {
    echo json_encode([
        "success" => false,
        "message" => "Nincs admin jogosultság"
    ]);
    exit;
}

require_once "db.php";

try {
    $stmt = $pdo->query("
        SELECT 
            wp.id,
            wp.appointment_date,
            wp.appointment_time,
            wp.status,
            u.name AS user_name,
            u.email AS user_email,
            s.name AS service_name
        FROM work_process wp
        JOIN users u ON wp.user_id = u.id
        JOIN services s ON wp.service_id = s.id
        ORDER BY wp.appointment_date ASC, wp.appointment_time ASC
    ");

    $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "bookings" => $bookings
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Adatbázis hiba"
    ]);
}
