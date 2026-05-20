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

function normalizeComparableHungarianText(string $value): string
{
    $normalized = mb_strtolower(trim($value), "UTF-8");
    $normalized = str_replace(
        ["á", "é", "í", "ó", "ö", "ő", "ú", "ü", "ű"],
        ["a", "e", "i", "o", "o", "o", "u", "u", "u"],
        $normalized
    );
    return preg_replace("/\s+/u", " ", $normalized) ?? $normalized;
}

function isLaborDescriptionLabel(string $value): bool
{
    $normalized = normalizeComparableHungarianText($value);
    if (in_array($normalized, ["munkadij", "munkadij (labor)", "labor"], true)) {
        return true;
    }

    if (preg_match("/^munkad(i)?j(\s*\(labor\))?$/u", $normalized) === 1) {
        return true;
    }

    if (preg_match("/^munkad(i)?j$/u", $normalized) === 1) {
        return true;
    }

    return false;
}

function parseWorkDescriptionWithLaborMeta(
    string $rawDescription,
    int $storedTotalPrice = 0,
    int $serviceBasePrice = 0
): array {
    $description = trim($rawDescription);
    $laborPrice = 0;
    $hasLabor = false;

    if ($description !== "" && preg_match("/\s*\|\|LABOR_META:(\d+)\s*$/u", $description, $matches) === 1) {
        $hasLabor = true;
        $laborPrice = max(0, (int)$matches[1]);
        $description = trim((string)preg_replace("/\s*\|\|LABOR_META:\d+\s*$/u", "", $description));
    }

    if ($description !== "") {
        $parts = array_values(array_filter(array_map("trim", explode(";", $description)), static function ($part) {
            return $part !== "";
        }));

        if ($parts) {
            $filteredParts = [];
            foreach ($parts as $part) {
                if (isLaborDescriptionLabel($part)) {
                    $hasLabor = true;
                    continue;
                }
                $filteredParts[] = $part;
            }

            if ($filteredParts) {
                $description = implode("; ", $filteredParts);
            } elseif ($hasLabor) {
                $description = "";
            }
        } elseif (isLaborDescriptionLabel($description)) {
            $hasLabor = true;
            $description = "";
        }
    }

    if (
        $description !== "" &&
        preg_match("/^(.*?)[,;]\s*(munkad[íi]j(\s*\(labor\))?|labor)\s*$/iu", $description, $matches) === 1
    ) {
        $hasLabor = true;
        $description = trim((string)($matches[1] ?? ""));
    }

    if ($hasLabor && $laborPrice <= 0) {
        $safeServiceBasePrice = max(0, $serviceBasePrice);
        $safeStoredTotalPrice = max(0, $storedTotalPrice);
        if ($safeServiceBasePrice > 0 && $safeStoredTotalPrice > $safeServiceBasePrice) {
            $laborPrice = $safeStoredTotalPrice - $safeServiceBasePrice;
        }
    }

    return [
        "description" => $description,
        "labor_price" => $laborPrice,
        "has_labor" => $hasLabor
    ];
}

function buildWorkDescriptionWithLaborMeta(
    string $description,
    int $laborPrice = 0,
    bool $hasLabor = false
): string {
    $safeDescription = trim($description);
    if ($safeDescription === "") {
        $safeDescription = "Munkafolyamat";
    }

    if (!$hasLabor) {
        return $safeDescription;
    }

    return $safeDescription . " ||LABOR_META:" . max(0, $laborPrice);
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
