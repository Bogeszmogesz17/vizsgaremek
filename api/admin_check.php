<?php
// ===============================
// ADMIN SESSION CHECK
// ===============================

session_start();

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

// 🔒 NEM ADMIN
if (!isset($_SESSION["admin_id"])) {
    echo json_encode([
        "success" => false,
        "message" => "Nincs admin jogosultság"
    ]);
    exit;
}

// ✅ ADMIN BE VAN JELENTKEZVE
echo json_encode([
    "success" => true,
    "admin" => [
        "id" => $_SESSION["admin_id"],
        "email" => $_SESSION["admin_email"]
    ]
]);
