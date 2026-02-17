<?php
session_start();

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
            wp.id,
            wp.appointment_date,
            wp.appointment_time,
            wp.status,
            wp.issued_at,
            u.name AS user_name,
            u.email AS user_email
        FROM work_process wp
        JOIN users u ON wp.user_id = u.id
        WHERE wp.status = 1
        ORDER BY wp.issued_at ASC
    ");

    echo json_encode([
        "success" => true,
        "works" => $stmt->fetchAll(PDO::FETCH_ASSOC)
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
