<?php
require "./core/settings.php";
require "./core/config.php";
require_once "./core/email_template.php";
require "phpmailer/src/Exception.php";
require "phpmailer/src/PHPMailer.php";
require "phpmailer/src/SMTP.php";

isAdmin();

require_once "db.php";

$data = json_decode(file_get_contents("php://input"), true);
$work_id = $data["work_id"] ?? null;

if (!$work_id) {
    echo json_encode(["success" => false, "message" => "Hiányzó azonosító"]);
    exit;
}

try {
    $customerStmt = $pdo->prepare("
        SELECT
            wp.appointment_date,
            wp.appointment_time,
            u.name AS user_name,
            u.email AS user_email,
            b.brand_name AS car_brand,
            m.model_name AS car_model
        FROM work_process wp
        JOIN vehicles v ON wp.vehicle_id = v.id
        JOIN users u ON v.user_id = u.id
        JOIN model m ON v.model_id = m.id
        JOIN brand b ON m.brand_id = b.id
        WHERE wp.id = :id
        LIMIT 1
    ");
    $customerStmt->execute([":id" => $work_id]);
    $customer = $customerStmt->fetch(PDO::FETCH_ASSOC);

    if (!$customer) {
        echo json_encode(["success" => false, "message" => "Munka nem található"]);
        exit;
    }
    $stmt = $pdo->prepare("
        UPDATE work_process
        SET status = 1
        WHERE id = :id
    ");
    $stmt->execute([":id" => $work_id]);
    $mail = new \PHPMailer\PHPMailer\PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host = "smtp.gmail.com";
        $mail->SMTPAuth = true;
        $mail->Username = MAIL_USER;
        $mail->Password = MAIL_PASS;
        $mail->SMTPSecure = "tls";
        $mail->Port = 587;
        $mail->CharSet = "UTF-8";
        $mail->Encoding = "base64";

        $mail->setFrom(MAIL_USER, "Dupla Dugattyú Műhely");
        $mail->addAddress($customer["user_email"], $customer["user_name"]);

        $mail->isHTML(true);
        $mail->Subject = "Munka elkeszult";
        $mail->Body = renderWorkshopEmail(
            "Elkészült a munkafolyamat",
            "Tájékoztatunk, hogy a munkád elkészült.",
            $customer["user_name"],
            [
                "Dátum" => $customer["appointment_date"],
                "Időpont" => $customer["appointment_time"],
                "Autó" => trim($customer["car_brand"] . " " . $customer["car_model"])
            ]
        );
        $mail->send();
    } catch (\PHPMailer\PHPMailer\Exception $e) {}

    echo json_encode([
        "success" => true,
        "message" => "Munka lezárva"
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Adatbázis hiba"
    ]);
}
