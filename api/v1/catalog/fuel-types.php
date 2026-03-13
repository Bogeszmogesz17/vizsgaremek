<?php
require_once __DIR__ . "/../_bootstrap.php";

requireMethod(["GET"]);
$statement = $pdo->query("
    SELECT id, fuel_name
    FROM fuel_type
    ORDER BY id ASC
");

jsonResponse([
    "success" => true,
    "fuel_types" => $statement->fetchAll(PDO::FETCH_ASSOC)
]);
