<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once "db.php";

$data = json_decode(file_get_contents("php://input"), true);

if (
    empty($data["name"]) ||
    empty($data["email"]) ||
    empty($data["password"])
) {
    echo json_encode([
        "success" => false,
        "message" => "Hiányzó adatok"
    ]);
    exit;
}

$name = trim($data["name"]);
$email = trim($data["email"]);
$password = password_hash($data["password"], PASSWORD_DEFAULT);

try {
    // 🔍 EMAIL ELLENŐRZÉS
    $check = $pdo->prepare("SELECT id FROM users WHERE email = :email LIMIT 1");
    $check->execute([":email" => $email]);

    if ($check->fetch()) {
        echo json_encode([
            "success" => false,
            "message" => "Ezzel az email címmel már létezik regisztráció"
        ]);
        exit;
    }

    // ✅ REGISZTRÁCIÓ
    $stmt = $pdo->prepare("
        INSERT INTO users (name, email, password, created_at)
        VALUES (:name, :email, :password, NOW())
    ");

    $stmt->execute([
        ":name" => $name,
        ":email" => $email,
        ":password" => $password
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Sikeres regisztráció 🎉"
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Szerverhiba"
    ]);
}
