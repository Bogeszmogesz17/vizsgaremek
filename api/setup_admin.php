<?php

require "./core/settings.php";


require_once "db.php";

$count = $pdo->query("SELECT COUNT(*) FROM admins")->fetchColumn();

if ($count > 0) {
    echo json_encode([
        "success" => false,
        "message" => "Admin már létezik"
    ]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (
    empty($data["username"]) ||
    empty($data["password"])
) {
    echo json_encode([
        "success" => false,
        "message" => "Minden mező kötelező"
    ]);
    exit;
}

$username = trim($data["username"]);
$password = password_hash($data["password"], PASSWORD_DEFAULT);

$stmt = $pdo->prepare("
    INSERT INTO admins (username, password)
    VALUES (?, ?)
");

$stmt->execute([$username, $password]);

echo json_encode([
    "success" => true,
    "message" => "Admin fiók sikeresen létrehozva"
]);
