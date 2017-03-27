#!/usr/bin/php -q
<?php
if ( $argc < 2 )
{
    echo $argv[0]." <port>\n";
    exit(1);
}

include_once "no2_server_tool/client_handler.php";

error_reporting(E_ALL);

$params = parse_ini_file('no2_server.ini');

/* Allow the script to hang around waiting for connections. */
set_time_limit(0);

$address = "0.0.0.0";
$port = $argv[1];

if (($sock = socket_create(AF_INET, SOCK_STREAM, SOL_TCP)) === false) {
    echo "socket_create() failed: reason: " . socket_strerror(socket_last_error()) . "\n";
}

if (socket_bind($sock, $address, $port) === false) {
    echo "socket_bind() failed: reason: " . socket_strerror(socket_last_error($sock)) . "\n";
}

if (socket_listen($sock, 5) === false) {
    echo "socket_listen() failed: reason: " . socket_strerror(socket_last_error($sock)) . "\n";
}
pcntl_signal(SIGCHLD, SIG_IGN);
do {
    if (($msgsock = socket_accept($sock)) === false) {
        echo "socket_accept() failed: reason: " . socket_strerror(socket_last_error($sock)) . "\n";
        break;
    }
    socket_set_option ( $msgsock, SOL_SOCKET, SO_RCVTIMEO, array("sec"=>1, "usec"=>0) );
    $pid = pcntl_fork();
    if ( $pid == -1 )
    {
        die('server err\n');
    }
    else if ( $pid )
    {
        socket_close($msgsock);
        continue;
    }
    else
    {
        onMsg ( $msgsock, $params );
        socket_close($msgsock);
        break;
    }
} while (true);
socket_close($sock);
?>
