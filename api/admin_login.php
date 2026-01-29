<?php
// ===============================
// ADMIN LOGIN (EMAIL + SESSION)
// ===============================

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

try {
    // ADMIN LEKÉRÉS EMAIL ALAPJÁN
    $stmt = $pdo->prepare("
        SELECT id, email, password 
        FROM admins 
        WHERE email = :email
        LIMIT 1
    ");
    $stmt->execute([":email" => $email]);
    $admin = $stmt->fetch();

    if (!$admin || !password_verify($password, $admin["password"])) {
        echo json_encode([
            "success" => false,
            "message" => "Hibás email vagy jelszó"
        ]);
        exit;
    }

    // SESSION BEÁLLÍTÁS
    $_SESSION["admin_id"] = $admin["id"];
    $_SESSION["admin_email"] = $admin["email"];

    echo json_encode([
        "success" => true,
        "message" => "Sikeres admin bejelentkezés"
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Szerverhiba"
    ]);
}
