<?php

// CORS
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

require "./core/settings.php";
require_once "db.php";

$stmt = $pdo->query("
    SELECT id, engine_size 
    FROM engine_size
    ORDER BY engine_size
");

echo json_encode([
    "success" => true,
    "engine_sizes" => $stmt->fetchAll(PDO::FETCH_ASSOC)
]);