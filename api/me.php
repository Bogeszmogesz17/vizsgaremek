<?php
require "./core/settings.php";
require_once "db.php";

header("Content-Type: application/json");

if (!isset($_SESSION['user_id']) && !isset($_SESSION['admin_id'])) {
    echo json_encode(["success" => false]);
    exit;
}
$accountId = $_SESSION['user_id'] ?? $_SESSION['admin_id'];
$role = isset($_SESSION['admin_id']) ? "admin" : "user";

try {

    $stmt = $pdo->prepare("
        SELECT 
            u.id,
            u.name,
            u.email,
            u.phone_number,
            u.address,
            u.settlement_id,
            s.post_code,
            s.settlement_name,
            u.created_at
        FROM users u
        LEFT JOIN settlement s 
            ON u.settlement_id = s.id
        WHERE u.id = ?
    ");

    $stmt->execute([$accountId]);

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "role" => $role,
        "user" => $user
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
