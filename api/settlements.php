<?php

require "./core/settings.php";
require_once "db.php";

header("Content-Type: application/json");

$stmt = $pdo->query("
    SELECT id, settlement_name, post_code
    FROM settlement
    ORDER BY settlement_name ASC
");

echo json_encode([
    "success" => true,
    "settlements" => $stmt->fetchAll(PDO::FETCH_ASSOC)
]);