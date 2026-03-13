<?php

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require __DIR__ . "/db.php";

$data = json_decode(file_get_contents("php://input"), true);

$token = $data["token"] ?? "";
$password = $data["password"] ?? "";

if (!$token || !$password) {
    echo json_encode([
        "success" => false,
        "message" => "Hiányzó adatok"
    ]);
    exit;
}

$stmt = $pdo->prepare("SELECT id FROM users WHERE reset_token=?");
$stmt->execute([$token]);

$user = $stmt->fetch();

if (!$user) {
    echo json_encode([
        "success" => false,
        "message" => "Érvénytelen token"
    ]);
    exit;
}

$hash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $pdo->prepare("UPDATE users SET password=?, reset_token=NULL WHERE id=?");
$stmt->execute([$hash, $user["id"]]);

echo json_encode([
    "success" => true,
    "message" => "Jelszó sikeresen módosítva"
]);
