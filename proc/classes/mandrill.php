<?php

include(dirname(__FILE__)."/../PHPMailer/src/PHPMailer.php");
include(dirname(__FILE__)."/../PHPMailer/src/Exception.php");
include(dirname(__FILE__)."/../PHPMailer/src/SMTP.php");

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class Mandrill {

    public static function SendDefault($text,$html,$subject,$to,$tags)
    {
        $mail = new PHPMailer(true);
        try {
            //Server settings
            $mail->SMTPDebug = 0;                                 // Enable verbose debug output
            $mail->isSMTP();                                      // Set mailer to use SMTP
            $mail->Host = SMTP_CREDENTIALS::server;  // Specify main and backup SMTP servers
            $mail->SMTPAuth = true;                               // Enable SMTP authentication
            $mail->Username = SMTP_CREDENTIALS::username;         // SMTP username
            $mail->Password = SMTP_CREDENTIALS::passwd;           // SMTP password
            $mail->SMTPSecure = 'ssl';                            // Enable TLS encryption, `ssl` also accepted
            $mail->Port = 465;                                    // TCP port to connect to
            $mail->IsHTML(true);
            $mail->CharSet = 'UTF-8';

            //Recipients
            $mail->setFrom(SMTP_CREDENTIALS::email, SMTP_CREDENTIALS::name);
            $mail->addAddress($to);     // Add a recipient
            $mail->AddReplyTo(SMTP_CREDENTIALS::email, SMTP_CREDENTIALS::name);

            $mail->Subject = $subject;
            $mail->Body    = $html;
            $response = $mail->send();



            echo 'Message processed: ' . $response;

        } catch (Exception $e) {
            //echo 'Message could not be sent.';
            echo 'Mailer Error: ' . $mail->ErrorInfo;
        }
    }



    private static function _PrepareAttachmentsForSending($attachments){
        $keys = array_keys($attachments);
        for($i=0;$i<count($keys);$i++){
            if($attachments[$keys[$i]]['type'] == "text/plain" || $attachments[$keys[$i]]['type'] == "text/x-log"){
                $attachments[$keys[$i]]['content'] = base64_encode($attachments[$keys[$i]]['content']);
            }
        }
        return $attachments;
    }
}