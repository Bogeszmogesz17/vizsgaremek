<?php
// ===============================
// ADMIN SETUP – ELSŐ ADMIN LÉTREHOZÁSA
// ===============================

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

require_once "db.php";

// 1️⃣ MEGNÉZZÜK: VAN-E MÁR ADMIN
$count = $pdo->query("SELECT COUNT(*) FROM admins")->fetchColumn();

if ($count > 0) {
    echo json_encode([
        "success" => false,
        "message" => "Admin már létezik"
    ]);
    exit;
}

// 2️⃣ ADATOK BEOLVASÁSA
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

// 3️⃣ ADMIN LÉTREHOZÁSA
$stmt = $pdo->prepare("
    INSERT INTO admins (username, password)
    VALUES (?, ?)
");

$stmt->execute([$username, $password]);

echo json_encode([
    "success" => true,
    "message" => "Admin fiók sikeresen létrehozva"
]);
