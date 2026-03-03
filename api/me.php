<?php
require "./core/settings.php";
require_once "db.php";

session_start();
header("Content-Type: application/json");

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false]);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT 
            u.id,
            u.name,
            u.email,
            u.phone,
            u.address,
            u.settlement_id,
            s.post_code,
            s.settlement_name,
            u.created_at
        FROM users u
        LEFT JOIN settlements s ON u.settlement_id = s.id
        WHERE u.id = ?
    ");

    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode(["success" => false]);
        exit;
    }

    echo json_encode([
        "success" => true,
        "user" => $user
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Adatbázis hiba"
    ]);
}