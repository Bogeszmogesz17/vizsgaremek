<?php

require "./core/settings.php";
require_once "db.php";

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

$date = $_GET["date"] ?? null;

if (!$date) {
    echo json_encode([
        "success" => false,
        "message" => "Hiányzó dátum"
    ]);
    exit;
}

$stmt = $pdo->prepare("
    SELECT appointment_time 
    FROM work_process
    WHERE appointment_date = ?
");

$stmt->execute([$date]);

$times = $stmt->fetchAll(PDO::FETCH_COLUMN);

echo json_encode([
    "success" => true,
    "times" => $times
]);