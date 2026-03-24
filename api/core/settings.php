<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
ini_set('default_charset', 'UTF-8');

header("Content-Type: application/json; charset=UTF-8");

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

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
