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
            wp.additional_work_description,
            COALESCE(s.price, 0) AS service_price,
            CASE
                WHEN COALESCE(s.is_bookable, 1) = 1 THEN 1
                ELSE 0
            END AS is_fixed_price_booking,
            COALESCE(s.name, 'Munkafolyamat') AS default_service_name,
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

    $storedTotalPrice = max(0, (int)($work["work_price"] ?? 0));
    $servicePrice = max(0, (int)($work["service_price"] ?? 0));
    $isFixedPriceBooking = !empty($work["is_fixed_price_booking"]) ? 1 : 0;
    $parsedDescription = parseWorkDescriptionWithLaborMeta(
        (string)($work["additional_work_description"] ?? ""),
        $storedTotalPrice,
        $servicePrice
    );

    $serviceDescription = trim((string)($parsedDescription["description"] ?? ""));
    if ($serviceDescription === "") {
        $serviceDescription = trim((string)($work["default_service_name"] ?? "Munkafolyamat"));
    }
    if ($serviceDescription === "") {
        $serviceDescription = "Munkafolyamat";
    }

    $laborPrice = max(0, (int)($parsedDescription["labor_price"] ?? 0));
    $hasLabor = !empty($parsedDescription["has_labor"]);
    $serviceItemPrice = $storedTotalPrice;

    if ($storedTotalPrice === 0 && $servicePrice > 0) {
        $serviceItemPrice = $servicePrice;
    } elseif ($hasLabor && $laborPrice > 0) {
        $serviceItemPrice = max(0, $storedTotalPrice - $laborPrice);
    }

    $items = [[
        "description" => $serviceDescription,
        "quantity" => 1,
        "unit_price" => $serviceItemPrice,
        "line_total" => $serviceItemPrice,
        "is_fixed_price" => $isFixedPriceBooking,
        "item_type" => "service"
    ]];

    if ($hasLabor) {
        $items[] = [
            "description" => "Munkadíj",
            "quantity" => 1,
            "unit_price" => $laborPrice,
            "line_total" => $laborPrice,
            "is_fixed_price" => 0,
            "item_type" => "labor"
        ];
    }

    $work["service_name"] = $serviceDescription;
    $work["labor_price"] = $laborPrice;
    unset($work["default_service_name"], $work["additional_work_description"]);

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
$serviceTotal = 0;
$laborTotal = 0;
$serviceDescriptions = [];
$hasLaborItem = false;
$hasFixedPriceServiceItem = false;

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
    $rawItemType = normalizeComparableHungarianText((string)($item["item_type"] ?? ""));
    if ($rawItemType === "service") {
        $itemType = "service";
    } elseif ($rawItemType === "labor") {
        $itemType = "labor";
    } else {
        $itemType = isLaborDescriptionLabel($description) ? "labor" : "service";
    }

    $netTotal += $lineTotal;
    $parsedServiceDescription = parseWorkDescriptionWithLaborMeta($description, 0, 0);
    $cleanServiceDescription = trim((string)($parsedServiceDescription["description"] ?? ""));
    $serviceItemContainsLabor = !empty($parsedServiceDescription["has_labor"]);

    if ($itemType === "service") {
        if ($serviceItemContainsLabor) {
            $hasLaborItem = true;
        }
        $description = $cleanServiceDescription;
    }

    if ($itemType === "labor") {
        $hasLaborItem = true;
        $laborTotal += $lineTotal;
        $isFixedPrice = 0;
        $description = "Munkadíj";
    } else {
        if ($cleanServiceDescription === "" && $serviceItemContainsLabor) {
            $hasLaborItem = true;
            $laborTotal += $lineTotal;
            $isFixedPrice = 0;
            $itemType = "labor";
            $description = "Munkadíj";
        }
    }

    if ($itemType === "service") {
        $serviceTotal += $lineTotal;
        $serviceDescriptions[] = $description;
        if ($isFixedPrice === 1) {
            $hasFixedPriceServiceItem = true;
        }
    }

    $sanitizedItems[] = [
        "description" => $description,
        "quantity" => $quantity,
        "unit_price" => $unitPrice,
        "line_total" => $lineTotal,
        "is_fixed_price" => $isFixedPrice,
        "item_type" => $itemType
    ];
}

if (!$sanitizedItems) {
    jsonResponse([
        "success" => false,
        "message" => "Érvénytelen számlatételek"
    ], 400);
}

$serviceDescriptions = array_values(array_filter($serviceDescriptions, static function ($value) {
    return trim((string)$value) !== "";
}));
if (!$serviceDescriptions) {
    jsonResponse([
        "success" => false,
        "message" => "Legalább egy fő számlatétel kötelező"
    ], 400);
}

$uniqueServiceDescriptions = array_values(array_unique($serviceDescriptions));
$mainDescription = trim(implode("; ", $uniqueServiceDescriptions));
if ($mainDescription === "") {
    $mainDescription = "Munkafolyamat";
}

$laborTotal = max(0, $laborTotal);
$metaSuffix = $hasLaborItem ? " ||LABOR_META:" . $laborTotal : "";
$maxDescriptionLength = 255 - mb_strlen($metaSuffix);
if ($maxDescriptionLength < 1) {
    $maxDescriptionLength = 1;
}
if (mb_strlen($mainDescription) > $maxDescriptionLength) {
    $mainDescription = mb_substr($mainDescription, 0, $maxDescriptionLength);
}

$storedDescription = buildWorkDescriptionWithLaborMeta($mainDescription, $laborTotal, $hasLaborItem);

$storedItems = [[
    "description" => $mainDescription,
    "quantity" => 1,
    "unit_price" => $serviceTotal,
    "line_total" => $serviceTotal,
    "is_fixed_price" => $hasFixedPriceServiceItem ? 1 : 0,
    "item_type" => "service"
]];
if ($hasLaborItem) {
    $storedItems[] = [
        "description" => "Munkadíj",
        "quantity" => 1,
        "unit_price" => $laborTotal,
        "line_total" => $laborTotal,
        "is_fixed_price" => 0,
        "item_type" => "labor"
    ];
}

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
        $storedDescription,
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