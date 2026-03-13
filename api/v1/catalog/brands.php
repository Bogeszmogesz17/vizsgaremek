<?php
require_once __DIR__ . "/../_bootstrap.php";

requireMethod(["GET"]);
$statement = $pdo->query("SELECT id, brand_name FROM brand ORDER BY brand_name ASC");

jsonResponse([
    "success" => true,
    "brands" => $statement->fetchAll(PDO::FETCH_ASSOC)
]);
