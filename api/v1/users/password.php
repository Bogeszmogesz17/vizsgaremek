<?php
require_once __DIR__ . "/../_bootstrap.php";

requireMethod(["PATCH"]);
$userId = requireLoggedInUserId();
$data = readJsonInput();

$oldPassword = (string)($data["old_password"] ?? "");
$newPassword = (string)($data["new_password"] ?? "");
$confirmPassword = (string)($data["confirm_password"] ?? "");

if ($oldPassword === "" || $newPassword === "" || $confirmPassword === "") {
    jsonResponse([
        "success" => false,
        "message" => "Hiányzó adatok"
    ], 400);
}

if ($newPassword !== $confirmPassword) {
    jsonResponse([
        "success" => false,
        "message" => "Az új jelszavak nem egyeznek"
    ], 400);
}

$statement = $pdo->prepare("SELECT password FROM users WHERE id = :id LIMIT 1");
$statement->execute([":id" => $userId]);
$user = $statement->fetch(PDO::FETCH_ASSOC);

if (!$user || !password_verify($oldPassword, $user["password"])) {
    jsonResponse([
        "success" => false,
        "message" => "Hibás jelenlegi jelszó"
    ], 401);
}

$newPasswordHash = password_hash($newPassword, PASSWORD_DEFAULT);
$updateStatement = $pdo->prepare("UPDATE users SET password = :password WHERE id = :id");
$updateStatement->execute([
    ":password" => $newPasswordHash,
    ":id" => $userId
]);

jsonResponse([
    "success" => true,
    "message" => "Jelszó sikeresen módosítva"
]);
