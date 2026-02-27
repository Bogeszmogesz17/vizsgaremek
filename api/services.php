<?php
require "./core/settings.php";
require_once "db.php";

header("Content-Type: application/json");

try {
    $stmt = $pdo->query("
        SELECT 
            id,
            name
        FROM services 
        ORDER BY name ASC
    ");
    
    echo json_encode([
        "success" => true,
        "services" => $stmt->fetchAll(PDO::FETCH_ASSOC)
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}