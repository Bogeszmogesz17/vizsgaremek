<?php
require_once __DIR__ . "/../_bootstrap.php";

requireMethod(["POST"]);
$data = readJsonInput();

$email = strtolower(trim((string)($data["email"] ?? "")));
$password = (string)($data["password"] ?? "");
$role = trim((string)($data["role"] ?? "user"));
$adminEmail = "bogibodis6@gmail.com";

if ($email === "" || $password === "") {
    jsonResponse([
        "success" => false,
        "message" => "Hiányzó adatok"
    ], 400);
}

if ($role === "admin") {
    if ($email !== $adminEmail) {
        jsonResponse([
            "success" => false,
            "message" => "Ez egy sima felhasználó.",
            "user" => []
        ], 403);
    }

    $statement = $pdo->prepare("
        SELECT id, name, email, password
        FROM users
        WHERE email = :email
        LIMIT 1
    ");
    $statement->execute([":email" => $email]);
    $adminUser = $statement->fetch(PDO::FETCH_ASSOC);

    if (!$adminUser || !password_verify($password, $adminUser["password"])) {
        jsonResponse([
            "success" => false,
            "message" => "Hibás felhasználónév vagy jelszó"
        ], 401);
    }

    $_SESSION["admin_id"] = $adminUser["id"];
    $_SESSION["admin_name"] = $adminUser["name"];
    $_SESSION["role"] = "admin";

    jsonResponse([
        "success" => true,
        "message" => "Sikeres admin bejelentkezés"
    ]);
}

if ($email === $adminEmail) {
    jsonResponse([
        "success" => false,
        "email" => $email,
        "message" => "Ez egy admin felhasználó.",
        "user" => []
    ], 403);
}

$statement = $pdo->prepare("
    SELECT id, name, email, password
    FROM users
    WHERE email = :email
    LIMIT 1
");
$statement->execute([":email" => $email]);
$user = $statement->fetch(PDO::FETCH_ASSOC);

if (!$user || !password_verify($password, $user["password"])) {
    jsonResponse([
        "success" => false,
        "message" => "Hibás e-mail vagy jelszó"
    ], 401);
}

$_SESSION["user_id"] = $user["id"];
$_SESSION["name"] = $user["name"];
$_SESSION["email"] = $user["email"];
$_SESSION["role"] = "user";

jsonResponse([
    "success" => true,
    "message" => "Sikeres bejelentkezés",
    "user" => [
        "id" => $user["id"],
        "name" => $user["name"],
        "email" => $user["email"]
    ]
]);
