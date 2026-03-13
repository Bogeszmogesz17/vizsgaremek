<?php
require_once __DIR__ . "/../_bootstrap.php";

requireMethod(["GET"]);

$bookableFilter = $_GET["bookable"] ?? null;
$includeAll = (string)($_GET["include_all"] ?? "0") === "1";

$sql = "
    SELECT id, name, price
    FROM services
    WHERE 1 = 1
";
$parameters = [];

if ($bookableFilter !== null && $bookableFilter !== "") {
    $sql .= " AND is_bookable = ?";
    $parameters[] = (int)$bookableFilter;
} elseif (!$includeAll) {
    $sql .= " AND LOWER(TRIM(name)) NOT IN ('fékcsere', 'fekcsere')";
}

$sql .= " ORDER BY name ASC";

$statement = $pdo->prepare($sql);
$statement->execute($parameters);

jsonResponse([
    "success" => true,
    "services" => $statement->fetchAll(PDO::FETCH_ASSOC)
]);
