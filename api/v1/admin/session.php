<?php
require_once __DIR__ . "/../_bootstrap.php";

requireMethod(["GET"]);
$admin = requireAdminSession();

jsonResponse([
    "success" => true,
    "admin" => $admin
]);
