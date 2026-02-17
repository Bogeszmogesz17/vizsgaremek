<?php
require "./core/settings.php";

require_once "db.php";

$data = json_decode(file_get_contents("php://input"), true);

if (
    empty($data["name"]) ||
    empty($data["email"]) ||
    empty($data["password"])
) {
    echo json_encode([
        "success" => false,
        "message" => "Minden mező kitöltése kötelező"
    ]);
    exit;
}

$name = trim($data["name"]);
$email = trim($data["email"]);
$password = password_hash($data["password"], PASSWORD_DEFAULT);

// EMAIL DUPLIKÁCIÓ
$check = $pdo->prepare("SELECT id FROM users WHERE email = ?");
$check->execute([$email]);

if ($check->fetch()) {
    echo json_encode([
        "success" => false,
        "message" => "Ezzel az email címmel már létezik fiók"
    ]);
    exit;
}

// REGISZTRÁCIÓ
$stmt = $pdo->prepare("
    INSERT INTO users (name, email, password, created_at, settlement_id, phone_number, address)
    VALUES (?, ?, ?, NOW(), 1, '1234', 'teszt utca')
");

$stmt->execute([$name, $email, $password]);

echo json_encode([
    "success" => true,
    "message" => "Sikeres regisztráció"
]);
