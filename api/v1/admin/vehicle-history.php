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
        wp.material_price,
        COALESCE(
            GROUP_CONCAT(DISTINCT s.name ORDER BY s.name SEPARATOR ', '),
            'Nincs rögzített szolgáltatás'
        ) AS services,
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
    LEFT JOIN work_process_services wps ON wps.work_process_id = wp.id
    LEFT JOIN services s ON s.id = wps.service_id
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
    GROUP BY
        wp.id,
        wp.appointment_date,
        wp.appointment_time,
        wp.status,
        wp.work_price,
        wp.material_price,
        u.id,
        u.name,
        u.email,
        u.phone_number,
        st.post_code,
        st.settlement_name,
        u.address,
        v.id,
        b.brand_name,
        m.model_name,
        v.year,
        ft.fuel_name,
        es.engine_size
    ORDER BY wp.appointment_date DESC, wp.appointment_time DESC, wp.id DESC
    LIMIT 300
";

$statement = $pdo->prepare($sql);
$statement->execute($params);

jsonResponse([
    "success" => true,
    "history" => $statement->fetchAll(PDO::FETCH_ASSOC),
    "filters" => [
        "customer" => $customerQuery
    ]
]);
