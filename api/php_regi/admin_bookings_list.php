<?php
session_start();

ini_set('display_errors', 0);
error_reporting(0);

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

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
            b.id,
            b.appointment_date,
            b.appointment_time,
            b.service,
            b.car_brand,
            b.car_model,
            b.fuel_type,
            u.name AS user_name,
            u.email AS user_email
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        ORDER BY b.appointment_date DESC
    ");

    echo json_encode([
        "success" => true,
        "bookings" => $stmt->fetchAll(PDO::FETCH_ASSOC)
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
