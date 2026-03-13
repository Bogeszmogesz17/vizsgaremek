<?php
require_once __DIR__ . "/../_bootstrap.php";

requireMethod(["GET"]);
$statement = $pdo->query("
    SELECT id, engine_size
    FROM engine_size
    ORDER BY engine_size
");

jsonResponse([
    "success" => true,
    "engine_sizes" => $statement->fetchAll(PDO::FETCH_ASSOC)
]);
