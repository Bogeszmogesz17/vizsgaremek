<?php
require_once __DIR__ . "/../_bootstrap.php";

$method = requireMethod(["GET", "PATCH"]);
$session = requireAuthenticatedSession();
$accountId = $session["id"];
$role = $session["role"];

if ($method === "GET") {
    $statement = $pdo->prepare("
        SELECT
            u.id,
            u.name,
            u.email,
            u.phone_number,
            u.address,
            u.settlement_id,
            s.post_code,
            s.settlement_name,
            u.created_at
        FROM users u
        LEFT JOIN settlement s ON u.settlement_id = s.id
        WHERE u.id = ?
        LIMIT 1
    ");
    $statement->execute([$accountId]);
    $user = $statement->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        jsonResponse([
            "success" => false,
            "message" => "Felhasználó nem található"
        ], 404);
    }

    jsonResponse([
        "success" => true,
        "role" => $role,
        "user" => $user
    ]);
}

$data = readJsonInput();
$name = trim((string)($data["name"] ?? ""));
$email = strtolower(trim((string)($data["email"] ?? "")));
$phoneNumber = trim((string)($data["phone_number"] ?? ""));
$address = trim((string)($data["address"] ?? ""));
$settlementId = $data["settlement_id"] ?? null;

if ($name === "" || $email === "" || $phoneNumber === "" || $address === "" || empty($settlementId)) {
    jsonResponse([
        "success" => false,
        "message" => "Hiányzó adatok"
    ], 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse([
        "success" => false,
        "message" => "Érvénytelen email cím"
    ], 400);
}
$settlementId = requirePositiveInt($settlementId, "Érvénytelen település");

$updateStatement = $pdo->prepare("
    UPDATE users
    SET name = ?, email = ?, phone_number = ?, settlement_id = ?, address = ?
    WHERE id = ?
");
$updateStatement->execute([$name, $email, $phoneNumber, $settlementId, $address, $accountId]);

if ($role === "user") {
    $_SESSION["name"] = $name;
    $_SESSION["email"] = $email;
} else {
    $_SESSION["admin_name"] = $name;
}

jsonResponse([
    "success" => true,
    "message" => "Adatok frissítve"
]);
