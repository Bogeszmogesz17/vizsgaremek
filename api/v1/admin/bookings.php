<?php
require_once __DIR__ . "/../_bootstrap.php";

requireMethod(["GET"]);
requireAdminSession();

$statement = $pdo->query("
    SELECT
        wp.id,
        wp.appointment_date,
        wp.appointment_time,
        wp.work_price,
        wp.material_price,
        s.name AS service,
        u.name AS user_name,
        u.email AS user_email,
        u.phone_number,
        CONCAT(COALESCE(st.post_code, ''), ' ', COALESCE(st.settlement_name, ''), ', ', COALESCE(u.address, '')) AS user_address,
        m.model_name AS car_model,
        b.brand_name AS car_brand,
        ft.fuel_name AS fuel_type
    FROM work_process wp
    JOIN work_process_services wps ON wp.id = wps.work_process_id
    JOIN services s ON wps.service_id = s.id
    JOIN vehicles v ON wp.vehicle_id = v.id
    JOIN users u ON v.user_id = u.id
    LEFT JOIN settlement st ON st.id = u.settlement_id
    JOIN model m ON v.model_id = m.id
    JOIN brand b ON m.brand_id = b.id
    JOIN fuel_type ft ON v.fuel_type_id = ft.id
    WHERE (wp.status = 0 OR wp.status IS NULL)
      AND COALESCE(s.is_bookable, 1) = 1
    ORDER BY wp.appointment_date DESC
");

jsonResponse([
    "success" => true,
    "bookings" => $statement->fetchAll(PDO::FETCH_ASSOC)
]);
