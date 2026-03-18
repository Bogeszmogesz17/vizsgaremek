<?php

if (!function_exists("emailEscape")) {
    function emailEscape($value) {
        return htmlspecialchars((string)$value, ENT_QUOTES | ENT_SUBSTITUTE, "UTF-8");
    }
}

if (!function_exists("renderWorkshopEmail")) {
    function renderWorkshopEmail($title, $introText, $recipientName = "", $details = [], $note = "") {
        $safeTitle = emailEscape($title);
        $safeIntro = emailEscape($introText);
        $safeRecipientName = trim((string)$recipientName);
        $safeNote = trim((string)$note);

        $greetingHtml = "";
        if ($safeRecipientName !== "") {
            $greetingHtml = '
                <p style="margin:0 0 12px 0;color:#d1d5db;font-size:16px;line-height:1.6;">
                    Tisztelt <strong style=\"color:#ffffff;\">' . emailEscape($safeRecipientName) . '</strong>!
                </p>
            ';
        }

        $detailRows = "";
        if (is_array($details)) {
            foreach ($details as $label => $value) {
                if ($value === null || $value === "") {
                    continue;
                }
                $detailRows .= '
                    <tr>
                        <td style="padding:10px 0;color:#9ca3af;font-size:14px;vertical-align:top;width:36%;">' . emailEscape($label) . ':</td>
                        <td style="padding:10px 0;color:#f9fafb;font-size:14px;vertical-align:top;">' . emailEscape($value) . '</td>
                    </tr>
                ';
            }
        }

        $detailsHtml = "";
        if ($detailRows !== "") {
            $detailsHtml = '
                <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="margin:18px 0 0 0;border-collapse:collapse;">
                    ' . $detailRows . '
                </table>
            ';
        }

        $noteHtml = "";
        if ($safeNote !== "") {
            $noteHtml = '
                <p style="margin:16px 0 0 0;padding:12px 14px;background-color:#111827;border:1px solid #1f2937;border-radius:8px;color:#d1d5db;font-size:14px;line-height:1.6;">
                    ' . emailEscape($safeNote) . '
                </p>
            ';
        }

        return '
        <!doctype html>
        <html lang="hu">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>' . $safeTitle . '</title>
        </head>
        <body style="margin:0;padding:0;background-color:#0b0b0c;">
            <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="background-color:#0b0b0c;padding:24px 12px;">
                <tr>
                    <td align="center">
                        <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="max-width:640px;background-color:#111111;border:1px solid #232323;border-radius:12px;overflow:hidden;font-family:\'Segoe UI\', \'Trebuchet MS\', Verdana, Arial, sans-serif;">
                            <tr>
                                <td style="padding:18px 24px;background:linear-gradient(90deg,#7f1d1d 0%,#dc2626 100%);">
                                    <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:0.2px;">Dupla Dugattyú Műhely</p>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:24px;">
                                    <h2 style="margin:0 0 12px 0;color:#ffffff;font-size:24px;line-height:1.3;">' . $safeTitle . '</h2>
                                    ' . $greetingHtml . '
                                    <p style="margin:0;color:#d1d5db;font-size:16px;line-height:1.7;">' . $safeIntro . '</p>
                                    ' . $detailsHtml . '
                                    ' . $noteHtml . '
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:14px 24px;border-top:1px solid #232323;color:#9ca3af;font-size:12px;line-height:1.5;">
                                    Ez egy automatikusan generált üzenet. Kérjük, ne válaszolj erre az e-mailre.
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        ';
    }
}
