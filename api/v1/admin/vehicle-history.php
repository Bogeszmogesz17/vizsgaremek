<?php
require_once __DIR__ . "/../_bootstrap.php";

requireMethod(["GET"]);
requireAdminSession();

$customerQuery = trim((string)($_GET["customer"] ?? ""));
$sql = "
    SELECT
        wp.id,
        wp.appointment_date,
        wp.appointment_time,
        wp.status,
        wp.work_price,
        0 AS material_price,
        wp.additional_work_description,
        COALESCE(
            s.name,
            'Nincs rögzített szolgáltatás'
        ) AS default_service_name,
        u.id AS user_id,
        u.name AS user_name,
        u.email AS user_email,
        u.phone_number,
        CONCAT(COALESCE(st.post_code, ''), ' ', COALESCE(st.settlement_name, ''), ', ', COALESCE(u.address, '')) AS user_address,
        v.id AS vehicle_id,
        b.brand_name AS car_brand,
        m.model_name AS car_model,
        v.year AS car_year,
        COALESCE(ft.fuel_name, '') AS fuel_type,
        COALESCE(es.engine_size, '') AS engine_size
    FROM work_process wp
    LEFT JOIN services s ON s.id = wp.service_id
    JOIN vehicles v ON v.id = wp.vehicle_id
    JOIN users u ON u.id = v.user_id
    LEFT JOIN settlement st ON st.id = u.settlement_id
    JOIN model m ON m.id = v.model_id
    JOIN brand b ON b.id = m.brand_id
    LEFT JOIN fuel_type ft ON ft.id = v.fuel_type_id
    LEFT JOIN engine_size es ON es.id = v.engine_size_id
";

$params = [];
if ($customerQuery !== "") {
    $sql .= "
        WHERE (
            u.name LIKE :customer
            OR u.email LIKE :customer
            OR u.phone_number LIKE :customer
        )
    ";
    $params[":customer"] = "%" . $customerQuery . "%";
}

$sql .= "
    ORDER BY wp.appointment_date DESC, wp.appointment_time DESC, wp.id DESC
    LIMIT 300
";

$statement = $pdo->prepare($sql);
$statement->execute($params);
$history = $statement->fetchAll(PDO::FETCH_ASSOC);
foreach ($history as &$historyItem) {
    $parsedDescription = parseWorkDescriptionWithLaborMeta(
        (string)($historyItem["additional_work_description"] ?? ""),
        max(0, (int)($historyItem["work_price"] ?? 0)),
        0
    );
    $services = trim((string)($parsedDescription["description"] ?? ""));
    if ($services === "") {
        $services = trim((string)($historyItem["default_service_name"] ?? ""));
    }
    if ($services === "") {
        $services = "Nincs rögzített szolgáltatás";
    }

    $historyItem["services"] = $services;
    unset($historyItem["additional_work_description"], $historyItem["default_service_name"]);
}
unset($historyItem);

jsonResponse([
    "success" => true,
    "history" => $history,
    "filters" => [
        "customer" => $customerQuery
    ]
]);
