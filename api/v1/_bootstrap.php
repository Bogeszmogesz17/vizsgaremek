<?php
require_once __DIR__ . "/../core/settings.php";
require_once __DIR__ . "/../db.php";

function jsonResponse(array $payload, int $statusCode = 200): void
{
    http_response_code($statusCode);
    echo json_encode($payload);
    exit;
}

function requestMethod(): string
{
    return strtoupper($_SERVER["REQUEST_METHOD"] ?? "GET");
}

function requireMethod(array $allowedMethods): string
{
    $method = requestMethod();
    if (!in_array($method, $allowedMethods, true)) {
        jsonResponse([
            "success" => false,
            "message" => "A metódus nem engedélyezett"
        ], 405);
    }

    return $method;
}

function readJsonInput(): array
{
    $rawInput = file_get_contents("php://input");
    if ($rawInput === false || $rawInput === "") {
        return [];
    }

    $decoded = json_decode($rawInput, true);
    if (!is_array($decoded)) {
        return [];
    }

    return $decoded;
}

function requirePositiveInt($value, string $message): int
{
    if (!is_numeric($value)) {
        jsonResponse(["success" => false, "message" => $message], 400);
    }

    $intValue = (int)$value;
    if ($intValue <= 0) {
        jsonResponse(["success" => false, "message" => $message], 400);
    }

    return $intValue;
}

function getPositiveIntQueryParam(string $name): ?int
{
    if (!isset($_GET[$name]) || !is_numeric($_GET[$name])) {
        return null;
    }

    $value = (int)$_GET[$name];
    return $value > 0 ? $value : null;
}

function requireLoggedInUserId(): int
{
    if (!isset($_SESSION["user_id"])) {
        jsonResponse([
            "success" => false,
            "message" => "Nincs bejelentkezve"
        ], 401);
    }

    return (int)$_SESSION["user_id"];
}

function requireAdminSession(): array
{
    if (!isset($_SESSION["admin_id"])) {
        jsonResponse([
            "success" => false,
            "message" => "Nincs jogosultság"
        ], 401);
    }

    return [
        "id" => (int)$_SESSION["admin_id"],
        "name" => $_SESSION["admin_name"] ?? ""
    ];
}

function requireAuthenticatedSession(): array
{
    if (isset($_SESSION["admin_id"])) {
        return [
            "role" => "admin",
            "id" => (int)$_SESSION["admin_id"]
        ];
    }

    if (isset($_SESSION["user_id"])) {
        return [
            "role" => "user",
            "id" => (int)$_SESSION["user_id"]
        ];
    }

    jsonResponse([
        "success" => false,
        "message" => "Nincs bejelentkezve"
    ], 401);
}
