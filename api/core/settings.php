<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Content-Type: application/json");

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// SESSION
if (session_status() === PHP_SESSION_NONE) {
    session_start();
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