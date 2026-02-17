<?php
session_start();

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// ADMIN CHECK
if (!isset($_SESSION["admin_id"])) {
    echo json_encode(["success" => false, "message" => "Nincs jogosultság"]);
    exit;
}

require_once "db.php";

$data = json_decode(file_get_contents("php://input"), true);
$work_id = $data["work_id"] ?? null;

if (!$work_id) {
    echo json_encode(["success" => false, "message" => "Hiányzó azonosító"]);
    exit;
}

try {
    // státusz frissítése
    $stmt = $pdo->prepare("
        UPDATE work_process
        SET status = 1
        WHERE id = :id
    ");
    $stmt->execute([":id" => $work_id]);

    echo json_encode([
        "success" => true,
        "message" => "Munka lezárva"
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Adatbázis hiba"
    ]);
}
