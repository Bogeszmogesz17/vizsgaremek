<?php
require "./core/settings.php";

if (isset($_SESSION["admin_id"])) {
  echo json_encode([
    "loggedIn" => true,
    "role" => "admin",
    "name" => $_SESSION["admin_name"]
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
