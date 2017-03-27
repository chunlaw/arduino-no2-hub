#!/usr/bin/php -q
<?php
    if ( count($argv) <= 2 )
    {
        echo $argv[0] . " <email> <ELSA version>\n";
        exit (1);
    }
    include_once "elsa_server_tool/elsa_db.php";
    $params = parse_ini_file ( 'elsa_server.ini' );
    function gen_uuid() {
        return sprintf( '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            // 32 bits for "time_low"
            mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ),

            // 16 bits for "time_mid"
            mt_rand( 0, 0xffff ),

            // 16 bits for "time_hi_and_version",
            // four most significant bits holds version number 4
            mt_rand( 0, 0x0fff ) | 0x4000,

            // 16 bits, 8 bits for "clk_seq_hi_res",
            // 8 bits for "clk_seq_low",
            // two most significant bits holds zero and one for variant DCE1.1
            mt_rand( 0, 0x3fff ) | 0x8000,

            // 48 bits for "node"
            mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff )
        );
    }

    function gen_keyPair (&$privKey, &$pubKey)
    {
        $config = array(
            "digest_alg" => "sha512",
            "private_key_bits" => 4096,
            "private_key_type" => OPENSSL_KEYTYPE_RSA,
        );
            
        // Create the private and public key
        $res = openssl_pkey_new($config);

        // Extract the private key from $res to $privKey
        openssl_pkey_export($res, $privKey);

        // Extract the public key from $res to $pubKey
        $pubKey = openssl_pkey_get_details($res);
        $pubKey = $pubKey["key"];
    }

     $uuid = gen_uuid();
     gen_keyPair ($privateKey, $publicKey);
     echo $uuid . "\n";
     $email = $argv[1];
     $version = $argv[2];

     file_put_contents ( $uuid . ".pem" , $publicKey );

     $conn = start_db( $params );
     insertEntry ( $conn, $uuid, $privateKey, $email, $version, $params );
     close_db ( $conn );
?>
