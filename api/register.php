<?php
require "./core/settings.php";
require_once "db.php";

header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

if (
    empty($data["name"]) ||
    empty($data["email"]) ||
    empty($data["password"]) ||
    empty($data["settlement_id"]) ||
    empty($data["address"])
) {
    echo json_encode([
        "success" => false,
        "message" => "Minden mező kitöltése kötelező"
    ]);
    exit;
}

$name          = trim($data["name"]);
$email         = trim($data["email"]);
$password      = password_hash($data["password"], PASSWORD_DEFAULT);
$settlement_id = (int)$data["settlement_id"];
$address       = trim($data["address"]);


// ===============================
// EMAIL DUPLIKÁCIÓ
// ===============================
$check = $pdo->prepare("SELECT id FROM users WHERE email = ?");
$check->execute([$email]);

if ($check->fetch()) {
    echo json_encode([
        "success" => false,
        "message" => "Ezzel az email címmel már létezik fiók"
    ]);
    exit;
}


// ===============================
// REGISZTRÁCIÓ
// ===============================
$stmt = $pdo->prepare("
    INSERT INTO users 
    (name, email, password, created_at, settlement_id, address)
    VALUES (?, ?, ?, NOW(), ?, ?)
");

$stmt->execute([
    $name,
    $email,
    $password,
    $settlement_id,
    $address
]);

echo json_encode([
    "success" => true,
    "message" => "Sikeres regisztráció"
]);