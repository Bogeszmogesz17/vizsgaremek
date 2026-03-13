<?php
require "./core/settings.php";
require_once "db.php";

header("Content-Type: application/json");

try {

    $onlyBookable = isset($_GET['bookable']);

    $sql = "
        SELECT id, name, price
        FROM services
    ";

    if ($onlyBookable) {
        $sql .= " WHERE is_bookable = 1";
    }

    $sql .= " ORDER BY name ASC";

    $stmt = $pdo->query($sql);

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
