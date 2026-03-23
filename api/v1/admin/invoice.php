<?php
require_once __DIR__ . "/../_bootstrap.php";

$method = requireMethod(["GET", "POST"]);
requireAdminSession();

if ($method === "GET") {
    $workId = getPositiveIntQueryParam("work_id");
    if (!$workId) {
        jsonResponse([
            "success" => false,
            "message" => "Hiányzó munkafolyamat azonosító"
        ], 400);
    }

    $workStatement = $pdo->prepare("
        SELECT
            wp.id,
            wp.appointment_date,
            wp.appointment_time,
            wp.work_price,
            wp.invoices_id,
            COALESCE(s.price, 0) AS service_price,
            CASE
                WHEN COALESCE(s.is_bookable, 1) = 1 THEN 1
                ELSE 0
            END AS is_fixed_price_booking,
            COALESCE(
                NULLIF(TRIM(wp.additional_work_description), ''),
                COALESCE(s.name, 'Munkafolyamat')
            ) AS service_name,
            u.name AS user_name,
            u.email AS user_email,
            u.phone_number,
            CONCAT(COALESCE(st.post_code, ''), ' ', COALESCE(st.settlement_name, ''), ', ', COALESCE(u.address, '')) AS user_address,
            b.brand_name AS car_brand,
            m.model_name AS car_model
        FROM work_process wp
        LEFT JOIN services s ON s.id = wp.service_id
        JOIN vehicles v ON v.id = wp.vehicle_id
        JOIN users u ON u.id = v.user_id
        LEFT JOIN settlement st ON st.id = u.settlement_id
        JOIN model m ON m.id = v.model_id
        JOIN brand b ON b.id = m.brand_id
        WHERE wp.id = ?
        LIMIT 1
    ");
    $workStatement->execute([$workId]);
    $work = $workStatement->fetch(PDO::FETCH_ASSOC);

    if (!$work) {
        jsonResponse([
            "success" => false,
            "message" => "A munkafolyamat nem található"
        ], 404);
    }

    $defaultDescription = trim((string)($work["service_name"] ?? "Munkafolyamat"));
    $storedWorkPrice = max(0, (int)($work["work_price"] ?? 0));
    $servicePrice = max(0, (int)($work["service_price"] ?? 0));
    $isFixedPriceBooking = !empty($work["is_fixed_price_booking"]) ? 1 : 0;
    $defaultTotal = $storedWorkPrice > 0 ? $storedWorkPrice : $servicePrice;
    $items = [[
        "description" => $defaultDescription !== "" ? $defaultDescription : "Munkafolyamat",
        "quantity" => 1,
        "unit_price" => $defaultTotal,
        "line_total" => $defaultTotal,
        "is_fixed_price" => $isFixedPriceBooking
    ]];

    jsonResponse([
        "success" => true,
        "work" => $work,
        "invoice" => [
            "id" => (int)$workId
        ],
        "items" => $items
    ]);
}


$data = readJsonInput();
$workId = requirePositiveInt($data["work_id"] ?? null, "Hiányzó munkafolyamat azonosító");
$itemsInput = $data["items"] ?? null;

if (!is_array($itemsInput) || count($itemsInput) === 0) {
    jsonResponse([
        "success" => false,
        "message" => "Legalább egy számlatétel kötelező"
    ], 400);
}

$sanitizedItems = [];
$netTotal = 0;

foreach ($itemsInput as $item) {
    if (!is_array($item)) {
        continue;
    }

    $description = trim((string)($item["description"] ?? ""));
    if ($description === "") {
        continue;
    }
    if (mb_strlen($description) > 255) {
        $description = mb_substr($description, 0, 255);
    }

    $quantity = is_numeric($item["quantity"] ?? null) ? (int)$item["quantity"] : 1;
    if ($quantity < 1) {
        $quantity = 1;
    }

    $unitPrice = is_numeric($item["unit_price"] ?? null) ? (int)$item["unit_price"] : 0;
    if ($unitPrice < 0) {
        $unitPrice = 0;
    }

    $lineTotal = $quantity * $unitPrice;
    $isFixedPrice = !empty($item["is_fixed_price"]) ? 1 : 0;

    $netTotal += $lineTotal;
    $sanitizedItems[] = [
        "description" => $description,
        "quantity" => $quantity,
        "unit_price" => $unitPrice,
        "line_total" => $lineTotal,
        "is_fixed_price" => $isFixedPrice
    ];
}

if (!$sanitizedItems) {
    jsonResponse([
        "success" => false,
        "message" => "Érvénytelen számlatételek"
    ], 400);
}

$descriptionParts = [];
foreach ($sanitizedItems as $item) {
    $descriptionParts[] = trim((string)$item["description"]);
}

$storedDescription = trim(implode("; ", array_filter($descriptionParts, static function ($value) {
    return $value !== "";
})));
if (mb_strlen($storedDescription) > 255) {
    $storedDescription = mb_substr($storedDescription, 0, 255);
}

$storedItems = [[
    "description" => $storedDescription !== "" ? $storedDescription : "Munkafolyamat",
    "quantity" => 1,
    "unit_price" => $netTotal,
    "line_total" => $netTotal,
    "is_fixed_price" => 0
]];

try {
    $pdo->beginTransaction();

    $workExistsStatement = $pdo->prepare("
        SELECT id
        FROM work_process
        WHERE id = ?
        LIMIT 1
        FOR UPDATE
    ");
    $workExistsStatement->execute([$workId]);
    if (!$workExistsStatement->fetchColumn()) {
        $pdo->rollBack();
        jsonResponse([
            "success" => false,
            "message" => "A munkafolyamat nem található"
        ], 404);
    }


    $updateWorkStatement = $pdo->prepare("
        UPDATE work_process
        SET
            work_price = ?,
            invoices_id = ?,
            additional_work_description = ?,
            exhibition_date = COALESCE(exhibition_date, CURDATE())
        WHERE id = ?
    ");
    $updateWorkStatement->execute([
        $netTotal,
        $workId,
        $storedDescription !== "" ? $storedDescription : null,
        $workId
    ]);

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
    "invoice_id" => $workId,
    "items" => $storedItems
]);
