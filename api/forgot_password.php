<?php

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require __DIR__ . "/db.php";

$data = json_decode(file_get_contents("php://input"), true);

$email = $data["email"] ?? "";

if (!$email) {
    echo json_encode([
        "success" => false,
        "message" => "Add meg az email címet"
    ]);
    exit;
}

$stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$email]);

$user = $stmt->fetch();

if (!$user) {
    echo json_encode([
        "success" => true,
        "message" => "Ha létezik ilyen email, küldtünk reset linket."
    ]);
    exit;
}

$token = bin2hex(random_bytes(32));

$stmt = $pdo->prepare("UPDATE users SET reset_token=? WHERE id=?");
$stmt->execute([$token, $user["id"]]);

echo json_encode([
    "success" => true,
    "message" => "Reset token generálva",
    "token" => $token
]);
