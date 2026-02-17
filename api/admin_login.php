<?php
require "./core/settings.php";


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

$userEmail = trim($data["email"]); // frontend mező = username
$password = $data["password"];

if($userEmail == "bogibodis6@gmail.com") {

try {
    $stmt = $pdo->prepare("
        SELECT id, name, email, password
        FROM users
        WHERE email = :email
        LIMIT 1
    ");
    $stmt->execute([":email" => $userEmail]);
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
    $_SESSION["role"] = "admin";

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
} else {
    echo json_encode([
        "success" => false,
        "message" => "Ez egy sima felhasználó.",
        "user" => []
    ]);    
}