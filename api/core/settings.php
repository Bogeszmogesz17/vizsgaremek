<?php
ini_set('display_errors', 0);
error_reporting(0);

session_start();

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: {$_SERVER["REQUEST_METHOD"]}, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ADMIN CHECK
function isAdmin() {
    if (!isset($_SESSION["admin_id"])) {
        http_response_code(401);
        echo json_encode([
            "success" => false, 
            "message" => "Nincs jogosultság"
        ]);
        exit;
    }
}

// USER CHECK
function isUser() {
    if (!isset($_SESSION["user_id"])) {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "Nincs bejelentkezve"
    ]);
    exit;
    }
}
?>