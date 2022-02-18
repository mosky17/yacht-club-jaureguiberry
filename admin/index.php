<?php

require_once(dirname(__FILE__).'/../proc/classes/auth.php');
require_once(dirname(__FILE__).'/../proc/classes/dato.php');

$datos = Dato::get_datos();

if(Auth::access_level() < 0)
{
    header("Location: " . $datos['url'] . "/admin/admin_login.php");
    exit();
}
else 
{
    header("Location: " . $datos['url'] . "/admin/socios.php");
    exit();
}