<?php
require_once "db.php";

$stmt = $pdo->prepare("
    SELECT id, name 
    FROM services
    WHERE is_bookable = 1
    ORDER BY name ASC
");

$stmt->execute();
$services = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    "success" => true,
    "data" => $services
]);