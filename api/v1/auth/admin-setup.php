<?php
require_once __DIR__ . "/../_bootstrap.php";

requireMethod(["POST"]);

$adminCount = (int)$pdo->query("SELECT COUNT(*) FROM admins")->fetchColumn();
if ($adminCount > 0) {
    jsonResponse([
        "success" => false,
        "message" => "Admin már létezik"
    ], 409);
}

$data = readJsonInput();
$username = trim((string)($data["username"] ?? ""));
$password = (string)($data["password"] ?? "");

if ($username === "" || $password === "") {
    jsonResponse([
        "success" => false,
        "message" => "Minden mező kötelező"
    ], 400);
}

$passwordHash = password_hash($password, PASSWORD_DEFAULT);
$statement = $pdo->prepare("INSERT INTO admins (username, password) VALUES (?, ?)");
$statement->execute([$username, $passwordHash]);

jsonResponse([
    "success" => true,
    "message" => "Admin fiók sikeresen létrehozva"
], 201);
