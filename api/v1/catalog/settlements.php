<?php
require_once __DIR__ . "/../_bootstrap.php";

requireMethod(["GET"]);

$postCode = trim((string)($_GET["post_code"] ?? ""));
if ($postCode !== "") {
    $statement = $pdo->prepare("
        SELECT id, settlement_name
        FROM settlement
        WHERE post_code = ?
        LIMIT 1
    ");
    $statement->execute([$postCode]);
    $result = $statement->fetch(PDO::FETCH_ASSOC);

    if (!$result) {
        jsonResponse([
            "success" => false,
            "message" => "Nincs ilyen irányítószám"
        ], 404);
    }

    jsonResponse([
        "success" => true,
        "settlement" => $result
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
