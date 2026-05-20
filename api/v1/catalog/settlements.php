<?php
require_once __DIR__ . "/../_bootstrap.php";

requireMethod(["GET"]);

$postCode = trim((string)($_GET["post_code"] ?? ""));
if ($postCode !== "") {
    $statement = $pdo->prepare("
        SELECT id, settlement_name
        FROM settlement
        WHERE post_code = ?
        ORDER BY settlement_name ASC
    ");
    $statement->execute([$postCode]);
    $results = $statement->fetchAll(PDO::FETCH_ASSOC);

    if (!$results) {
        jsonResponse([
            "success" => false,
            "message" => "Nincs ilyen irányítószám"
        ], 404);
    }

    jsonResponse([
        "success" => true,
        "settlement" => $results[0],
        "settlements" => $results
    ]);
}

$statement = $pdo->query("
    SELECT id, settlement_name, post_code
    FROM settlement
    ORDER BY settlement_name ASC
");

jsonResponse([
    "success" => true,
    "settlements" => $statement->fetchAll(PDO::FETCH_ASSOC)
]);
