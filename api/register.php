<?php
require "./core/settings.php";
require_once "db.php";

header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

if (
    empty($data["name"]) ||
    empty($data["email"]) ||
    empty($data["password"]) ||
    empty($data["phone_number"]) ||
    empty($data["settlement_id"]) ||
    empty($data["address"])
) {
    echo json_encode([
        "success" => false,
        "message" => "Minden mező kitöltése kötelező"
    ]);
    exit;
}

$termsAccepted = filter_var($data["terms_accepted"] ?? false, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
if ($termsAccepted !== true) {
    echo json_encode([
        "success" => false,
        "message" => "A regisztrációhoz kötelező elfogadni az ÁFSZ-t"
    ]);
    exit;
}

$name          = trim($data["name"]);
$email         = strtolower(trim($data["email"]));
$phone_number = trim($data["phone_number"]);
$password      = password_hash($data["password"], PASSWORD_DEFAULT);
$settlement_id = (int)$data["settlement_id"];
$address       = trim($data["address"]);
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        "success" => false,
        "message" => "Érvénytelen email cím"
    ]);
    exit;
}

$email_domain = substr(strrchr($email, "@"), 1);
$has_dns_record = true;

if (function_exists("checkdnsrr")) {
    $has_dns_record = checkdnsrr($email_domain, "MX") || checkdnsrr($email_domain, "A") || checkdnsrr($email_domain, "AAAA");
} elseif (function_exists("dns_get_record")) {
    $has_dns_record = !empty(dns_get_record($email_domain, DNS_MX)) ||
                      !empty(dns_get_record($email_domain, DNS_A)) ||
                      !empty(dns_get_record($email_domain, DNS_AAAA));
}

if (!$has_dns_record) {
    echo json_encode([
        "success" => false,
        "message" => "Az email domain nem található"
    ]);
    exit;
}


$check = $pdo->prepare("SELECT id FROM users WHERE LOWER(email) = ?");
$check->execute([$email]);

if ($check->fetch()) {
    echo json_encode([
        "success" => false,
        "message" => "Ezzel az email címmel már létezik fiók"
    ]);
    exit;
}



$stmt = $pdo->prepare("
    INSERT INTO users 
    (name, email, password, created_at, phone_number, settlement_id, address)
    VALUES (?, ?, ?, NOW(), ?, ?, ?)
");

$stmt->execute([
    $name,
    $email,
    $password,
    $phone_number,
    $settlement_id,
    $address
]);

echo json_encode([
    "success" => true,
    "message" => "Sikeres regisztráció"
]);
