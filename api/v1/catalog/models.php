<?php
require_once __DIR__ . "/../_bootstrap.php";

requireMethod(["GET"]);

$brandId = getPositiveIntQueryParam("brand_id");
if ($brandId === null) {
    jsonResponse([
        "success" => false,
        "message" => "Hiányzó vagy érvénytelen brand_id"
    ], 400);
}

$statement = $pdo->prepare("
    SELECT id, model_name
    FROM model
    WHERE brand_id = ?
    ORDER BY model_name ASC
");
$statement->execute([$brandId]);

jsonResponse([
    "success" => true,
    "models" => $statement->fetchAll(PDO::FETCH_ASSOC)
]);
