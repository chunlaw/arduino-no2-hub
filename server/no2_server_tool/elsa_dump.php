#!/usr/bin/php -q
<?php
    include_once "elsa_db.php";
    dump_db( parse_ini_file('../elsa_server.ini') );
?>
