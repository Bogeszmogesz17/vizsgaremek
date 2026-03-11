<?php

require_once "core/config.php";
session_start();

header("Content-Type: application/json");

$sql = "
SELECT 
wp.id,
wp.appointment_date,
wp.appointment_time,
wp.description,

u.name AS user_name,
u.email AS user_email,
u.phone_number,

b.brand_name AS car_brand,
m.model_name AS car_model

FROM work_process wp

JOIN vehicles v ON wp.vehicle_id = v.id
JOIN users u ON v.user_id = u.id
JOIN model m ON v.model_id = m.id
JOIN brand b ON m.brand_id = b.id

ORDER BY wp.appointment_date ASC
";

$result = $conn->query($sql);

$works = [];

while ($row = $result->fetch_assoc()) {
    $works[] = $row;
}

echo json_encode([
    "success" => true,
    "works" => $works
]);