<?php
require "./core/settings.php";
require_once "db.php";

header("Content-Type: application/json");

if (!isset($_SESSION['user_id']) && !isset($_SESSION['admin_id'])) {
    echo json_encode(["success" => false]);
    exit;
}
$accountId = $_SESSION["user_id"] ?? $_SESSION["admin_id"];

$data = json_decode(file_get_contents("php://input"), true);

if (
    empty($data["name"]) ||
    empty($data["email"]) ||
    empty($data["phone_number"]) ||
    empty($data["address"])
) {
    echo json_encode(["success" => false, "message" => "Hiányzó adatok"]);
    exit;
}

try {
    $stmt = $pdo->prepare("
        UPDATE users
        SET name = ?, email = ?, phone_number = ?, address = ?
        WHERE id = ?
    ");

    $stmt->execute([
        $data["name"],
        $data["email"],
        $data["phone_number"],
        $data["address"],
        $accountId
    ]);

    if (isset($_SESSION["user_id"])) {
        $_SESSION["name"] = $data["name"];
        $_SESSION["email"] = $data["email"];
    }

    if (isset($_SESSION["admin_id"])) {
        $_SESSION["admin_name"] = $data["name"];
    }

    echo json_encode(["success" => true, "message" => "Adatok frissítve"]);

} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Hiba történt"]);
}
