<?php
require_once __DIR__ . "/../_bootstrap.php";

requireMethod(["GET"]);
$date = trim((string)($_GET["date"] ?? ""));

if ($date === "") {
    jsonResponse([
        "success" => false,
        "message" => "Hiányzó dátum"
    ], 400);
}

$statement = $pdo->prepare("
    SELECT appointment_time
    FROM work_process
    WHERE appointment_date = ?
      AND (status = 0 OR status IS NULL)
");
$statement->execute([$date]);

jsonResponse([
    "success" => true,
    "times" => $statement->fetchAll(PDO::FETCH_COLUMN)
]);
