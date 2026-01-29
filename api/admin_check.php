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

// 🔒 SESSION ELLENŐRZÉS
if (!isset($_SESSION["admin_id"])) {
    echo json_encode([
        "logged_in" => false
    ]);
    exit;
}

// ✅ HA BE VAN JELENTKEZVE
echo json_encode([
    "logged_in" => true,
    "admin" => [
        "id" => $_SESSION["admin_id"],
        "email" => $_SESSION["admin_email"]
    ]
]);
