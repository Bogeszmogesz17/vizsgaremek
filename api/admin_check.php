<?php
require "./core/settings.php";

isAdmin();

echo json_encode([
    "success" => true,
    "admin" => [
        "id" => $_SESSION["admin_id"],
        "name" => $_SESSION["admin_name"] ?? ""
    ]
]);
