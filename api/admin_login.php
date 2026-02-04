<?php
session_start();

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

require_once "db.php";

$data = json_decode(file_get_contents("php://input"), true);

if (
    empty($data["email"]) ||   // frontend miatt marad "email"
    empty($data["password"])
) {
    echo json_encode([
        "success" => false,
        "message" => "Hiányzó adatok"
    ]);
    exit;
}

$username = trim($data["email"]); // frontend mező = username
$password = $data["password"];

try {
    $stmt = $pdo->prepare("
        SELECT id, username, password
        FROM admins
        WHERE username = :username
        LIMIT 1
    ");
    $stmt->execute([":username" => $username]);
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$admin) {
        echo json_encode([
            "success" => false,
            "message" => "Nincs ilyen admin"
        ]);
        exit;
    }

    if (!password_verify($password, $admin["password"])) {
        echo json_encode([
            "success" => false,
            "message" => "Hibás jelszó"
        ]);
        exit;
    }

    // ✅ EGYSÉGES SESSION
    $_SESSION["admin_id"] = $admin["id"];
    $_SESSION["admin_name"] = $admin["username"];

    echo json_encode([
        "success" => true,
        "message" => "Sikeres admin bejelentkezés"
    ]);

} catch (Throwable $e) {
    echo json_encode([
        "success" => false,
        "message" => "Szerverhiba"
    ]);
}
