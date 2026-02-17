<?php
// ===============================
// ADATBÁZIS KAPCSOLAT (PDO)
// ===============================

$host = "localhost";
$dbname = "vizsga2";   
$user = "root";
$pass = "";

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $user,
        $pass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Adatbázis kapcsolat hiba"
    ]);
    exit;
}
