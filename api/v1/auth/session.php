<?php
require_once __DIR__ . "/../_bootstrap.php";

$method = requireMethod(["GET", "DELETE"]);

if ($method === "GET") {
    if (isset($_SESSION["admin_id"])) {
        jsonResponse([
            "loggedIn" => true,
            "role" => "admin",
            "name" => $_SESSION["admin_name"] ?? ""
        ]);
    }

    if (isset($_SESSION["user_id"])) {
        jsonResponse([
            "loggedIn" => true,
            "role" => "user",
            "email" => $_SESSION["email"] ?? "",
            "name" => $_SESSION["name"] ?? ""
        ]);
    }

    jsonResponse([
        "loggedIn" => false
    ]);
}

$_SESSION = [];

if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(),
        "",
        time() - 42000,
        $params["path"],
        $params["domain"],
        $params["secure"],
        $params["httponly"]
    );
}

session_destroy();

jsonResponse([
    "success" => true,
    "message" => "Sikeres kijelentkezés"
]);
