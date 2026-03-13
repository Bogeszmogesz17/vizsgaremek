<?php
require_once __DIR__ . "/../_bootstrap.php";

requireMethod(["PATCH", "POST"]);
$data = readJsonInput();

$token = trim((string)($data["token"] ?? ""));
$password = (string)($data["password"] ?? "");

if ($token === "" || $password === "") {
    jsonResponse([
        "success" => false,
        "message" => "Hiányzó adatok"
    ], 400);
}

$statement = $pdo->prepare("SELECT id FROM users WHERE reset_token = ?");
$statement->execute([$token]);
$user = $statement->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    jsonResponse([
        "success" => false,
        "message" => "Érvénytelen token"
    ], 404);
}

$passwordHash = password_hash($password, PASSWORD_DEFAULT);
$updateStatement = $pdo->prepare("UPDATE users SET password = ?, reset_token = NULL WHERE id = ?");
$updateStatement->execute([$passwordHash, $user["id"]]);

jsonResponse([
    "success" => true,
    "message" => "Jelszó sikeresen módosítva"
]);
