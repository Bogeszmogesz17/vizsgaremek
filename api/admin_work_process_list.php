<?php
require "./core/settings.php";
isAdmin();
require_once "db.php";

try {
    $stmt = $pdo->query("
        SELECT 
            wp.id,
            wp.appointment_date,
            wp.appointment_time,
            wp.work_price,
            wp.material_price,
            COALESCE(s.name, '') AS description,
            u.name AS user_name,
            u.email AS user_email,
            u.phone_number,
            CONCAT(COALESCE(st.post_code, ''), ' ', COALESCE(st.settlement_name, ''), ', ', COALESCE(u.address, '')) AS user_address,
            b.brand_name AS car_brand,
            m.model_name AS car_model
        FROM work_process wp
        LEFT JOIN work_process_services wps ON wps.work_process_id = wp.id
        LEFT JOIN services s ON s.id = wps.service_id
        JOIN vehicles v ON wp.vehicle_id = v.id
        JOIN users u ON v.user_id = u.id
        LEFT JOIN settlement st ON st.id = u.settlement_id
        JOIN model m ON v.model_id = m.id
        JOIN brand b ON m.brand_id = b.id
        WHERE (wp.status = 0 OR wp.status IS NULL)
          AND s.is_bookable = 0
        ORDER BY wp.appointment_date ASC, wp.appointment_time ASC
    ");

    echo json_encode([
        "success" => true,
        "works" => $stmt->fetchAll(PDO::FETCH_ASSOC)
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Adatbázis hiba"
    ]);
}
