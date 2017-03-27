#!/usr/bin/php -q
<?php
    include "no2_server_tool/elsa_db.php";

    function checkTime ( $ts, $expiryTS )
    {
        return $expiryTS == null || ( ( abs ( $ts - time() ) < 3600 ) && ( $ts <= $expiryTS ) );
    }

    function handleNo2Data ( $no2 )
    {
        echo $no2 . " " . time() . "\n";
    }

    function onMsg ( $msgsock, $params )
    {
        do {
            $data = socket_read ( $msgsock, 4 );
            if ( $data == false )
            {
                echo "socket_read() failed: reason: " . socket_strerror(socket_last_error($msgsock)) . "\n";
                break;
            }
            $no2_con = unpack ( 'f', $data );
            // get data
            handleNo2Data ( $no2_con[1] );
            sleep(1);
        } while ( true );
        @ob_flush();
    }
?>
