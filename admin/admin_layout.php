<?php
session_start();

require_once(dirname(__FILE__).'/../proc/classes/auth.php');
require_once(dirname(__FILE__).'/../proc/classes/dato.php');

$datos = Dato::get_datos();
?>

<script type="text/javascript">
    var GLOBAL_domain = "<?php echo $datos['url']; ?>";
</script>

<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex">

    <title><?php echo $datos["nombre"]; ?></title>
    <link href="../styles1.0.10/bootstrap-icons.css" rel="stylesheet">
    <link href="../styles1.0.10/bootstrap.min.css" rel="stylesheet">
	  <link href="../styles1.0.10/main.css" rel="stylesheet">
    <script src="http://code.jquery.com/jquery.js"></script>
    <script src="../scripts1.0.17/bootstrap.bundle.min.js"></script>
	  <script src="../scripts1.0.17/toolbox.js"></script>
	  <script src="../scripts1.0.17/jquery.maskedinput.js"></script>
</head>

<nav id="headerNavigation" class="navbar navbar-expand-lg navbar-dark bg-dark">
  <div class="container-fluid">
    <a class="navbar-brand" href="/"><?php echo $datos["nombre"]; ?></a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item">
          <a id="nav_lista_socios" class="nav-link active" aria-current="page" href="<?php echo $datos['url'];?>/admin/socios.php">Socios</a>
        </li>
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#" id="nav_caja" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            Cajas
          </a>
          <ul class="dropdown-menu" aria-labelledby="nav_caja">
            <!-- <li><a class="dropdown-item" aria-current="page" href="<?php echo $datos['url']; ?>/admin/caja_cantina.php">Cantina</a></li> -->
            <li><a class="dropdown-item" aria-current="page" href="<?php echo $datos['url']; ?>/admin/caja_banco.php">BROU</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" aria-current="page" href="<?php echo $datos['url']; ?>/admin/admin_caja.php">Caja</a></li>
          </ul>
        </li>
        <li class="hideInMobile nav-item">
          <a id="nav_lista_admins" class="nav-link" aria-current="page" href="<?php echo $datos['url']; ?>/admin/adminstradores.php">Administradores</a>
        </li>
      </ul>
      <img id="nav_loader" src="../images/loader.gif">
      <span id="admin_header_name" class="navbar-text"><?php echo Auth::get_admin_nombre()?></span>
      <button id="nav_logout" type="button" class="btn btn-danger" onClick="Toolbox.AdminLogout(); return false;">Salir</button>
    </div>
  </div>
</nav>