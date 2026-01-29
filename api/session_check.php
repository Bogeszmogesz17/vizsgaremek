<?php
session_start();

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

if (isset($_SESSION["admin_id"])) {
  echo json_encode([
    "loggedIn" => true,
    "role" => "admin",
    "email" => $_SESSION["email"]
  ]);
  exit;
}

if (isset($_SESSION["user_id"])) {
  echo json_encode([
    "loggedIn" => true,
    "role" => "user",
    "email" => $_SESSION["email"],
    "name"  => $_SESSION["name"]
  ]);
  exit;
}

echo json_encode([
  "loggedIn" => false
]);
