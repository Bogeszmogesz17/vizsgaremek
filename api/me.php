<?php
session_start();

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

if (!isset($_SESSION["user_id"])) {
  echo json_encode([
    "success" => false,
    "message" => "Nincs bejelentkezve"
  ]);
  exit;
}

require_once "db.php";

$stmt = $pdo->prepare("
  SELECT id, name, email, created_at
  FROM users
  WHERE id = :id
  LIMIT 1
");
$stmt->execute([
  ":id" => $_SESSION["user_id"]
]);

$user = $stmt->fetch();

echo json_encode([
  "success" => true,
  "user" => $user
]);
