<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5174");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once "db.php";



$data = json_decode(file_get_contents("php://input"), true);

if (
    empty($data["email"]) ||
    empty($data["password"])
) {
    echo json_encode([
        "success" => false,
        "message" => "Hiányzó adatok"
    ]);
    exit;
}

$email = trim($data["email"]);
$password = $data["password"];

$stmt = $pdo->prepare("SELECT id, name, password FROM users WHERE email = :email LIMIT 1");
$stmt->execute([":email" => $email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user["password"])) {
    echo json_encode([
        "success" => false,
        "message" => "Hibás e-mail vagy jelszó"
    ]);
    exit;
}

// ✅ SESSION
$_SESSION['user_id'] = $user['id'];
$_SESSION['email']   = $user['email'];
$_SESSION['name']    = $user['name'];


echo json_encode([
  "success" => true,
  "message" => "Sikeres bejelentkezés",
  "user" => [
    "id" => $user["id"],
    "name" => $user["name"],
    "email" => $user["email"]
  ]
]);

