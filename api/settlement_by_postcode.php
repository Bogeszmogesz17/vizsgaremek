<?php
require "./core/settings.php";
require_once "db.php";

header("Content-Type: application/json");

$post_code = $_GET["post_code"] ?? "";

if (!$post_code) {
    echo json_encode(["success" => false]);
    exit;
}

$stmt = $pdo->prepare("
    SELECT id, settlement_name 
    FROM settlement 
    WHERE post_code = ?
    LIMIT 1
");

$stmt->execute([$post_code]);
$result = $stmt->fetch(PDO::FETCH_ASSOC);

if ($result) {
    echo json_encode([
        "success" => true,
        "settlement" => $result
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Nincs ilyen irányítószám"
    ]);
}