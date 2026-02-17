<?php

require "./core/settings.php";
require_once "db.php";

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data["email"]) || empty($data["password"])) {
    echo json_encode([
        "success" => false,
        "message" => "Hiányzó adatok"
    ]);
    exit;
}

$email = trim($data["email"]);
$password = $data["password"];

if($email != "bogibodis6@gmail.com") {
    $stmt = $pdo->prepare("
    SELECT id, name, email, password 
    FROM users 
    WHERE email = :email 
    LIMIT 1
    ");
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
} else {
    echo json_encode([
        "success" => false,
        "email" => $email,
        "message" => "Ez egy admin felhasználó.",
        "user" => []
    ]);    
}