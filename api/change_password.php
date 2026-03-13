<?php
require "./core/settings.php";


isUser();

require_once "db.php";

$data = json_decode(file_get_contents("php://input"), true);

if (
    empty($data["old_password"]) ||
    empty($data["new_password"])
) {
    echo json_encode([
        "success" => false,
        "message" => "Hiányzó adatok"
    ]);
    exit;
}

$userId = $_SESSION["user_id"];
$oldPassword = $data["old_password"];
$newPassword = $data["new_password"];

$stmt = $pdo->prepare("SELECT password FROM users WHERE id = :id");
$stmt->execute([":id" => $userId]);
$user = $stmt->fetch();

if (!$user || !password_verify($oldPassword, $user["password"])) {
    echo json_encode([
        "success" => false,
        "message" => "Hibás jelenlegi jelszó"
    ]);
    exit;
}

$newHash = password_hash($newPassword, PASSWORD_DEFAULT);

$update = $pdo->prepare("
    UPDATE users SET password = :password WHERE id = :id
");
$update->execute([
    ":password" => $newHash,
    ":id" => $userId
]);

echo json_encode([
    "success" => true,
    "message" => "Jelszó sikeresen módosítva"
]);
