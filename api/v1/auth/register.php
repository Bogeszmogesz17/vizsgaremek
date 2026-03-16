<?php
require_once __DIR__ . "/../_bootstrap.php";

requireMethod(["POST"]);
$data = readJsonInput();

$name = trim((string)($data["name"] ?? ""));
$email = strtolower(trim((string)($data["email"] ?? "")));
$password = (string)($data["password"] ?? "");
$phoneNumber = trim((string)($data["phone_number"] ?? ""));
$settlementId = $data["settlement_id"] ?? null;
$address = trim((string)($data["address"] ?? ""));
$termsAccepted = filter_var($data["terms_accepted"] ?? false, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);

if ($name === "" || $email === "" || $password === "" || $phoneNumber === "" || $address === "" || empty($settlementId)) {
    jsonResponse([
        "success" => false,
        "message" => "Minden mező kitöltése kötelező"
    ], 400);
}

if ($termsAccepted !== true) {
    jsonResponse([
        "success" => false,
        "message" => "A regisztrációhoz kötelező elfogadni az ÁSZF-et"
    ], 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse([
        "success" => false,
        "message" => "Érvénytelen email cím"
    ], 400);
}

$emailDomain = substr((string)strrchr($email, "@"), 1);
$hasDnsRecord = true;

if (function_exists("checkdnsrr")) {
    $hasDnsRecord = checkdnsrr($emailDomain, "MX") || checkdnsrr($emailDomain, "A") || checkdnsrr($emailDomain, "AAAA");
} elseif (function_exists("dns_get_record")) {
    $hasDnsRecord = !empty(dns_get_record($emailDomain, DNS_MX))
        || !empty(dns_get_record($emailDomain, DNS_A))
        || !empty(dns_get_record($emailDomain, DNS_AAAA));
}

if (!$hasDnsRecord) {
    jsonResponse([
        "success" => false,
        "message" => "Az email domain nem található"
    ], 400);
}

$settlementId = requirePositiveInt($settlementId, "Érvénytelen település");
$passwordHash = password_hash($password, PASSWORD_DEFAULT);

$duplicateCheckStatement = $pdo->prepare("SELECT id FROM users WHERE LOWER(email) = ?");
$duplicateCheckStatement->execute([$email]);

if ($duplicateCheckStatement->fetch()) {
    jsonResponse([
        "success" => false,
        "message" => "Ezzel az email címmel már létezik fiók"
    ], 409);
}

$insertStatement = $pdo->prepare("
    INSERT INTO users (name, email, password, created_at, phone_number, settlement_id, address)
    VALUES (?, ?, ?, NOW(), ?, ?, ?)
");
$insertStatement->execute([$name, $email, $passwordHash, $phoneNumber, $settlementId, $address]);

jsonResponse([
    "success" => true,
    "message" => "Sikeres regisztráció"
], 201);
