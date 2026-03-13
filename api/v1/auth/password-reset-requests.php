<?php
require_once __DIR__ . "/../_bootstrap.php";

requireMethod(["POST"]);
$data = readJsonInput();
$email = trim((string)($data["email"] ?? ""));

if ($email === "") {
    jsonResponse([
        "success" => false,
        "message" => "Add meg az email címet"
    ], 400);
}

$statement = $pdo->prepare("SELECT id FROM users WHERE email = ?");
$statement->execute([$email]);
$user = $statement->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    jsonResponse([
        "success" => true,
        "message" => "Ha létezik ilyen email, küldtünk reset linket."
    ]);
}

$token = bin2hex(random_bytes(32));
$updateStatement = $pdo->prepare("UPDATE users SET reset_token = ? WHERE id = ?");
$updateStatement->execute([$token, $user["id"]]);

jsonResponse([
    "success" => true,
    "message" => "Reset token generálva",
    "token" => $token
]);
