<?php
require "./core/settings.php";
require_once "db.php";

header("Content-Type: application/json");

try {
    $stmt = $pdo->query("SELECT id, brand_name FROM brand ORDER BY brand_name ASC");

    echo json_encode([
        "success" => true,
        "brands" => $stmt->fetchAll(PDO::FETCH_ASSOC)
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}