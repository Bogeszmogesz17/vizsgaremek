<?php
require "./core/settings.php";
require_once "db.php";

$brandId = $_GET["brand_id"] ?? null;

if (!$brandId) {
    echo json_encode(["success" => false]);
    exit;
}

$stmt = $pdo->prepare("
    SELECT id, model_name 
    FROM model 
    WHERE brand_id = ?
    ORDER BY model_name ASC
");

$stmt->execute([$brandId]);

echo json_encode([
    "success" => true,
    "models" => $stmt->fetchAll(PDO::FETCH_ASSOC)
]);