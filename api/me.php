<?php
require "./core/settings.php";

isUser();

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
