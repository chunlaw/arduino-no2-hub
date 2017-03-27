#!/usr/bin/php -q
<?php
    include_once "dbEncryption.php";
    function dump_db( $params )
    {
        $servername = $params['host'];
        $username = $params['user'];
        $password = fnDecrypt ( $params['password'], $params['hash'] );
        $DB_NAME = "ELSA_AUTH";
        $date = new DateTime();
        exec ( "mysqldump --user=$username --password=$password --host=$servername $DB_NAME > /home/ELSA/db_backup/${DB_NAME}_" . $date->format('Ymd') );
        $date->modify('-1 month');
        exec ( "rm -f " . $date->format('Ymd') );
    }
    function start_db( $params )
    {
        $servername = $params['host'];
        $username = $params['user'];
        $password = fnDecrypt ( $params['password'], $params['hash'] );

        $conn = new mysqli ( $servername, $username, $password, "ELSA_AUTH" );
        if ( $conn->connect_error )
        {
            die ( "Connection failed: " . $conn->connect_error . "\n" );
        }
        echo "Connected successfully\n";
        return $conn;
     }

     function getResultsByUUID ( $conn, $uuid, &$privateKey, &$expiryTS, $params )
     {
         $stmt = $conn->prepare ( "SELECT private_Key, UNIX_TIMESTAMP ( expiryTS ) FROM AUTH_INFO " .
                                  "WHERE UUID = ?");
         $stmt->bind_param ( 's', $uuid );
         $stmt->execute ();
         $stmt->bind_result ( $privateKey, $expiryTS );
         if ( ! $stmt->fetch() )
         {
             return false;
         }
         $privateKey = fnDecrypt ( $privateKey, $params['priKeyEncryptKey'] );
         return true;
     }

     function insertEntry ( $conn, $uuid, $privateKey, $email, $version, $params )
     {
         $privateKey = fnEncrypt ( $privateKey, $params['priKeyEncryptKey']);
         $stmt = $conn->prepare ( "INSERT INTO AUTH_INFO (UUID, Email, private_key, version) " .
                                  "VALUES ( ?, ?, ?, ?)" );
         $stmt->bind_param ( 'ssss', $uuid, $email, $privateKey, $version );
         if ( !$stmt->execute () )
         {
             echo "Execute failed: (". $stmt->errno . ") ". $stmt->error . "\n";
         }
     }

     function updateVersion ( $conn, $uuid, $version )
     {
         $stmt = $conn->prepare ( "UPDATE AUTH_INFO SET version = ?, " .
                                     "expiryTS = CASE WHEN expiryTS is NULL " .
                                        "THEN DATE_ADD(NOW(), INTERVAL 14 day) " .
                                        "ELSE expiryTS END ".  
                                  "WHERE UUID = ?" );
         $stmt->bind_param ( 'ss', $version, $uuid );
         $stmt->execute (); 
     }

     function close_db ( &$conn )
     {
         mysqli_close( $conn );
     }
?>
