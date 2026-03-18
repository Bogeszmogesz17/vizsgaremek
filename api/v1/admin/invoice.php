<?php
require_once __DIR__ . "/../_bootstrap.php";

$method = requireMethod(["GET", "POST"]);
requireAdminSession();

function normalizeServiceName(string $value): string
{
    $normalized = mb_strtolower(trim($value), "UTF-8");
    $normalized = strtr($normalized, [
        "á" => "a",
        "é" => "e",
        "í" => "i",
        "ó" => "o",
        "ö" => "o",
        "ő" => "o",
        "ú" => "u",
        "ü" => "u",
        "ű" => "u"
    ]);

    return preg_replace("/\s+/", " ", $normalized) ?? "";
}

function isFixedPriceService(string $serviceName): bool
{
    $normalizedName = normalizeServiceName($serviceName);
    return strpos($normalizedName, "gumiz") !== false || strpos($normalizedName, "atvizsg") !== false;
}

function ensureInvoiceItemsTable(PDO $pdo): void
{
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS invoice_items (
            id INT NOT NULL AUTO_INCREMENT,
            invoice_id INT NOT NULL,
            description VARCHAR(255) NOT NULL,
            quantity INT NOT NULL DEFAULT 1,
            unit_price INT NOT NULL DEFAULT 0,
            line_total INT NOT NULL DEFAULT 0,
            is_fixed_price TINYINT(1) NOT NULL DEFAULT 0,
            PRIMARY KEY (id),
            KEY idx_invoice_id (invoice_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
}

function loadInvoiceContext(PDO $pdo, int $workId): array
{
    $statement = $pdo->prepare("
        SELECT
            wp.id,
            wp.appointment_date,
            wp.appointment_time,
            wp.work_price,
            wp.material_price,
            wp.invoices_id,
            COALESCE(
                NULLIF(TRIM(wp.additional_work_description), ''),
                COALESCE(GROUP_CONCAT(DISTINCT s.name SEPARATOR ', '), 'Munkafolyamat')
            ) AS service_name,
            u.name AS user_name,
            u.email AS user_email,
            u.phone_number,
            CONCAT(COALESCE(st.post_code, ''), ' ', COALESCE(st.settlement_name, ''), ', ', COALESCE(u.address, '')) AS user_address,
            b.brand_name AS car_brand,
            m.model_name AS car_model
        FROM work_process wp
        LEFT JOIN work_process_services wps ON wps.work_process_id = wp.id
        LEFT JOIN services s ON s.id = wps.service_id
        JOIN vehicles v ON v.id = wp.vehicle_id
        JOIN users u ON u.id = v.user_id
        LEFT JOIN settlement st ON st.id = u.settlement_id
        JOIN model m ON m.id = v.model_id
        JOIN brand b ON b.id = m.brand_id
        WHERE wp.id = ?
        GROUP BY
            wp.id,
            wp.appointment_date,
            wp.appointment_time,
            wp.work_price,
            wp.material_price,
            wp.invoices_id,
            wp.additional_work_description,
            u.name,
            u.email,
            u.phone_number,
            st.post_code,
            st.settlement_name,
            u.address,
            b.brand_name,
            m.model_name
        LIMIT 1
    ");
    $statement->execute([$workId]);
    $context = $statement->fetch(PDO::FETCH_ASSOC);

    if (!$context) {
        jsonResponse([
            "success" => false,
            "message" => "A munkafolyamat nem található"
        ], 404);
    }

    return $context;
}

function loadInvoiceRow(PDO $pdo, array $context): ?array
{
    if (!empty($context["invoices_id"])) {
        $statement = $pdo->prepare("
            SELECT id, work_process_id, exhibition_date, payment_deadline, serial_number, completion_date, payment
            FROM invoice
            WHERE id = ?
            LIMIT 1
        ");
        $statement->execute([(int)$context["invoices_id"]]);
        $invoice = $statement->fetch(PDO::FETCH_ASSOC);
        if ($invoice) {
            return $invoice;
        }
    }

    $fallbackStatement = $pdo->prepare("
        SELECT id, work_process_id, exhibition_date, payment_deadline, serial_number, completion_date, payment
        FROM invoice
        WHERE work_process_id = ?
        ORDER BY id DESC
        LIMIT 1
    ");
    $fallbackStatement->execute([(int)$context["id"]]);
    $invoice = $fallbackStatement->fetch(PDO::FETCH_ASSOC);

    return $invoice ?: null;
}

function loadDefaultItemsForWork(PDO $pdo, int $workId): array
{
    $customDescriptionStatement = $pdo->prepare("
        SELECT TRIM(COALESCE(additional_work_description, '')) AS additional_work_description
        FROM work_process
        WHERE id = ?
        LIMIT 1
    ");
    $customDescriptionStatement->execute([$workId]);
    $customDescription = trim((string)$customDescriptionStatement->fetchColumn());
    if ($customDescription !== "") {
        return [[
            "description" => $customDescription,
            "quantity" => 1,
            "unit_price" => 0,
            "line_total" => 0,
            "is_fixed_price" => 0
        ]];
    }
    $statement = $pdo->prepare("
        SELECT s.name, COALESCE(s.price, 0) AS price
        FROM work_process_services wps
        JOIN services s ON s.id = wps.service_id
        WHERE wps.work_process_id = ?
        ORDER BY s.name ASC
    ");
    $statement->execute([$workId]);
    $services = $statement->fetchAll(PDO::FETCH_ASSOC);

    if (!$services) {
        return [[
            "description" => "Munkafolyamat",
            "quantity" => 1,
            "unit_price" => 0,
            "line_total" => 0,
            "is_fixed_price" => 0
        ]];
    }

    $items = [];
    foreach ($services as $service) {
        $description = trim((string)($service["name"] ?? ""));
        if ($description === "") {
            continue;
        }

        $unitPrice = max(0, (int)($service["price"] ?? 0));
        $isFixedPrice = isFixedPriceService($description) ? 1 : 0;

        $items[] = [
            "description" => $description,
            "quantity" => 1,
            "unit_price" => $unitPrice,
            "line_total" => $unitPrice,
            "is_fixed_price" => $isFixedPrice
        ];
    }

    if (!$items) {
        $items[] = [
            "description" => "Munkafolyamat",
            "quantity" => 1,
            "unit_price" => 0,
            "line_total" => 0,
            "is_fixed_price" => 0
        ];
    }

    return $items;
}

function loadFixedPriceMap(PDO $pdo, int $workId): array
{
    $statement = $pdo->prepare("
        SELECT s.name, COALESCE(s.price, 0) AS price
        FROM work_process_services wps
        JOIN services s ON s.id = wps.service_id
        WHERE wps.work_process_id = ?
    ");
    $statement->execute([$workId]);
    $rows = $statement->fetchAll(PDO::FETCH_ASSOC);

    $map = [];
    foreach ($rows as $row) {
        $name = trim((string)($row["name"] ?? ""));
        if ($name === "" || !isFixedPriceService($name)) {
            continue;
        }

        $map[normalizeServiceName($name)] = max(0, (int)($row["price"] ?? 0));
    }

    return $map;
}

if ($method === "GET") {
    ensureInvoiceItemsTable($pdo);

    $workId = requirePositiveInt($_GET["work_id"] ?? null, "Érvénytelen azonosító");
    $context = loadInvoiceContext($pdo, $workId);
    $invoice = loadInvoiceRow($pdo, $context);

    $items = [];
    if ($invoice) {
        $itemStatement = $pdo->prepare("
            SELECT id, description, quantity, unit_price, line_total, is_fixed_price
            FROM invoice_items
            WHERE invoice_id = ?
            ORDER BY id ASC
        ");
        $itemStatement->execute([(int)$invoice["id"]]);
        $items = $itemStatement->fetchAll(PDO::FETCH_ASSOC);
    }

    if (!$items) {
        $items = loadDefaultItemsForWork($pdo, $workId);
    }

    $totalPrice = 0;
    foreach ($items as $item) {
        $totalPrice += max(0, (int)($item["line_total"] ?? 0));
    }

    jsonResponse([
        "success" => true,
        "work" => $context,
        "invoice" => $invoice,
        "items" => $items,
        "total_price" => $totalPrice
    ]);
}

$data = readJsonInput();
$workId = requirePositiveInt($data["work_id"] ?? null, "Érvénytelen azonosító");
$rawItems = $data["items"] ?? null;

if (!is_array($rawItems) || count($rawItems) === 0) {
    jsonResponse([
        "success" => false,
        "message" => "Legalább egy tétel megadása kötelező"
    ], 400);
}

ensureInvoiceItemsTable($pdo);
$context = loadInvoiceContext($pdo, $workId);
$fixedPriceMap = loadFixedPriceMap($pdo, $workId);

$items = [];
foreach ($rawItems as $rawItem) {
    if (!is_array($rawItem)) {
        continue;
    }

    $description = trim((string)($rawItem["description"] ?? ""));
    if ($description === "") {
        continue;
    }

    $quantity = (int)($rawItem["quantity"] ?? 1);
    $quantity = $quantity > 0 ? $quantity : 1;

    $unitPrice = (int)($rawItem["unit_price"] ?? 0);
    $unitPrice = $unitPrice >= 0 ? $unitPrice : 0;

    $normalizedDescription = normalizeServiceName($description);
    $isFixedPrice = array_key_exists($normalizedDescription, $fixedPriceMap);
    if ($isFixedPrice) {
        $unitPrice = $fixedPriceMap[$normalizedDescription];
        $quantity = 1;
    }

    $lineTotal = $quantity * $unitPrice;

    $items[] = [
        "description" => $description,
        "quantity" => $quantity,
        "unit_price" => $unitPrice,
        "line_total" => $lineTotal,
        "is_fixed_price" => $isFixedPrice ? 1 : 0
    ];
}

if (!$items) {
    jsonResponse([
        "success" => false,
        "message" => "Nincs érvényes számlatétel"
    ], 400);
}

$totalPrice = 0;
foreach ($items as $item) {
    $totalPrice += $item["line_total"];
}

$today = date("Y-m-d");
$paymentDeadline = date("Y-m-d", strtotime("+8 days"));
$serialNumber = "SZ-" . str_pad((string)$workId, 6, "0", STR_PAD_LEFT) . "-" . date("Ymd");

try {
    $pdo->beginTransaction();

    $invoice = loadInvoiceRow($pdo, $context);
    if ($invoice) {
        $invoiceId = (int)$invoice["id"];
        $invoiceUpdateStatement = $pdo->prepare("
            UPDATE invoice
            SET exhibition_date = ?, payment_deadline = ?, completion_date = ?, payment = 0
            WHERE id = ?
        ");
        $invoiceUpdateStatement->execute([$today, $paymentDeadline, $today, $invoiceId]);
    } else {
        $invoiceInsertStatement = $pdo->prepare("
            INSERT INTO invoice (work_process_id, exhibition_date, payment_deadline, serial_number, completion_date, payment)
            VALUES (?, ?, ?, ?, ?, 0)
        ");
        $invoiceInsertStatement->execute([$workId, $today, $paymentDeadline, $serialNumber, $today]);
        $invoiceId = (int)$pdo->lastInsertId();
    }

    $linkInvoiceStatement = $pdo->prepare("
        UPDATE work_process
        SET invoices_id = ?, work_price = ?, material_price = 0
        WHERE id = ?
    ");
    $linkInvoiceStatement->execute([$invoiceId, $totalPrice, $workId]);

    $deleteItemsStatement = $pdo->prepare("DELETE FROM invoice_items WHERE invoice_id = ?");
    $deleteItemsStatement->execute([$invoiceId]);

    $insertItemStatement = $pdo->prepare("
        INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, line_total, is_fixed_price)
        VALUES (?, ?, ?, ?, ?, ?)
    ");

    foreach ($items as $item) {
        $insertItemStatement->execute([
            $invoiceId,
            $item["description"],
            $item["quantity"],
            $item["unit_price"],
            $item["line_total"],
            $item["is_fixed_price"]
        ]);
    }

    $pdo->commit();
} catch (Throwable $throwable) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    jsonResponse([
        "success" => false,
        "message" => "A számla mentése sikertelen"
    ], 500);
}

jsonResponse([
    "success" => true,
    "message" => "A számla mentése sikeres",
    "invoice_id" => $invoiceId,
    "total_price" => $totalPrice,
    "items" => $items
]);
