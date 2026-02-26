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
            s.name as service,
            u.name AS user_name,
            u.email AS user_email,
            m.model_name AS car_model,
            b.brand_name AS car_brand,
            ft.fuel_name as fuel_type
        FROM work_process wp
        JOIN work_process_services as wps ON wp.id = wps.work_process_id
        JOIN services as s ON wps.service_id = s.id
        JOIN vehicles v ON wp.vehicle_id = v.id
        JOIN users u ON v.user_id = u.id
        JOIN model as m ON v.model_id = m.id
        JOIN brand as b ON m.brand_id = b.id
        JOIN fuel_type as ft ON v.fuel_type_id = ft.id
        ORDER BY wp.appointment_date DESC
    ");
    
    echo json_encode([
        "success" => true,
        "bookings" => $stmt->fetchAll(PDO::FETCH_ASSOC)
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
