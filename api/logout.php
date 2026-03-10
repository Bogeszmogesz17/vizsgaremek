<?php
require "./core/settings.php";

session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'domain' => 'localhost',
    'secure' => false,
    'httponly' => true,
    'samesite' => 'None'
]);

session_start();

// SESSION TÖRLÉS
$_SESSION = [];

if (ini_get("session.use_cookies")) {
    $params = session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'domain' => 'localhost',
    'secure' => false,
    'httponly' => true,
    'samesite' => 'Lax'
]);
}

session_destroy();

echo json_encode([
    "success" => true,
    "message" => "Sikeres kijelentkezés"
]);
