<?php
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\PHPMailer;

require_once __DIR__ . "/../_bootstrap.php";
require_once __DIR__ . "/../../core/config.php";
require_once __DIR__ . "/../../core/email_template.php";
require_once __DIR__ . "/../../phpmailer/src/Exception.php";
require_once __DIR__ . "/../../phpmailer/src/PHPMailer.php";
require_once __DIR__ . "/../../phpmailer/src/SMTP.php";

$method = requireMethod(["DELETE", "POST"]);
$session = requireAuthenticatedSession();
$isAdmin = $session["role"] === "admin";
$userId = $isAdmin ? null : $session["id"];

$bookingId = getPositiveIntQueryParam("id");
if ($bookingId === null && $method === "POST") {
    $data = readJsonInput();
    if (isset($data["booking_id"])) {
        $bookingId = requirePositiveInt($data["booking_id"], "Érvénytelen foglalás azonosító");
    }
}

if ($bookingId === null) {
    jsonResponse([
        "success" => false,
        "message" => "Érvénytelen foglalás azonosító"
    ], 400);
}

if ($isAdmin) {
    $statement = $pdo->prepare("
        SELECT
            wp.appointment_date,
            wp.appointment_time,
            u.name,
            u.email,
            b.brand_name,
            m.model_name
        FROM work_process wp
        JOIN vehicles v ON v.id = wp.vehicle_id
        JOIN users u ON u.id = v.user_id
        JOIN model m ON m.id = v.model_id
        JOIN brand b ON b.id = m.brand_id
        WHERE wp.id = ?
        LIMIT 1
    ");
    $statement->execute([$bookingId]);
} else {
    $statement = $pdo->prepare("
        SELECT
            wp.appointment_date,
            wp.appointment_time,
            u.name,
            u.email,
            b.brand_name,
            m.model_name
        FROM work_process wp
        JOIN vehicles v ON v.id = wp.vehicle_id
        JOIN users u ON u.id = v.user_id
        JOIN model m ON m.id = v.model_id
        JOIN brand b ON b.id = m.brand_id
        WHERE wp.id = ?
          AND v.user_id = ?
        LIMIT 1
    ");
    $statement->execute([$bookingId, $userId]);
}

$booking = $statement->fetch(PDO::FETCH_ASSOC);
if (!$booking) {
    jsonResponse([
        "success" => false,
        "message" => "Foglalás nem található"
    ], 404);
}

try {
    $today = new DateTime();
    $bookingDate = new DateTime($booking["appointment_date"]);
    $daysDifference = (int)$today->diff($bookingDate)->days;

    if (!$isAdmin && ($bookingDate <= $today || $daysDifference < 2)) {
        jsonResponse([
            "success" => false,
            "message" => "Foglalást csak 2 nappal előtte lehet lemondani"
        ], 400);
    }
} catch (Throwable $throwable) {
    jsonResponse([
        "success" => false,
        "message" => "Érvénytelen foglalási dátum"
    ], 500);
}

try {
    $pdo->beginTransaction();

    $deleteStatement = $pdo->prepare("DELETE FROM work_process WHERE id = ?");
    $deleteStatement->execute([$bookingId]);

    if ($deleteStatement->rowCount() !== 1) {
        throw new RuntimeException("Foglalás törlése sikertelen");
    }

    $pdo->commit();
} catch (Throwable $throwable) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    jsonResponse([
        "success" => false,
        "message" => "A foglalás törlése sikertelen"
    ], 500);
}

$mail = new PHPMailer(true);

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
    $mail->isHTML(true);

    if ($isAdmin) {
        if (!empty($booking["email"])) {
            $mail->addAddress($booking["email"], $booking["name"] ?? "");
        } else {
            $mail->addAddress(MAIL_USER);
        }

        $mail->addBCC(MAIL_USER);
        $mail->Subject = "Lemondott időpont";
        $mail->Body = renderWorkshopEmail(
            "Időpont lemondva",
            "A Dupla Dugattyú Műhely adminisztrátora lemondta a foglalásodat.",
            $booking["name"] ?? "",
            [
                "Dátum" => $booking["appointment_date"],
                "Időpont" => $booking["appointment_time"],
                "Autó" => trim(($booking["brand_name"] ?? "") . " " . ($booking["model_name"] ?? ""))
            ],
            "Kérdés esetén kérjük, vedd fel velünk a kapcsolatot."
        );
    } else {
        $mail->addAddress(MAIL_USER);
        $mail->Subject = "Foglalás lemondva";
        $mail->Body = renderWorkshopEmail(
            "Időpont lemondva",
            ($booking["name"] ?? "Ügyfél") . " lemondta az időpontját.",
            "",
            [
                "Dátum" => $booking["appointment_date"],
                "Időpont" => $booking["appointment_time"],
                "Autó" => trim(($booking["brand_name"] ?? "") . " " . ($booking["model_name"] ?? ""))
            ]
        );
    }

    $mail->send();
} catch (Exception $exception) {
}

jsonResponse([
    "success" => true,
    "message" => $isAdmin
        ? "Sikeres lemondás, emailben tájékoztattuk az ügyfelet."
        : "Sikeres lemondás, emailben tájékoztatjuk a szervizt!"
]);
