<?php
require "./core/settings.php";
require_once "db.php";

session_start();
header("Content-Type: application/json");

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

try {
    $stmt = $pdo->prepare("
        UPDATE users
        SET name = ?, email = ?, phone = ?, settlement_id = ?, address = ?
        WHERE id = ?
    ");

    $stmt->execute([
        $data["name"],
        $data["email"],
        $data["phone"],
        $data["settlement_id"],
        $data["address"],
        $_SESSION["user_id"]
    ]);

    echo json_encode(["success" => true, "message" => "Adatok frissítve"]);

} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Hiba történt"]);
}