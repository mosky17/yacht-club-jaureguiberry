<?php
session_start();

require_once(dirname(__FILE__).'/../proc/classes/auth.php');
require_once(dirname(__FILE__).'/../proc/classes/dato.php');

$datos = Dato::get_datos();

if(Auth::access_level() >= 0)
{
  // header("Location: " . $datos['url'] . "/admin/socios.php");
  // exit();
}

?>

<script type="text/javascript">
    var GLOBAL_domain = "<?php echo $datos["url"]; ?>";
    var GLOBAL_name = "<?php echo $datos['nombre']; ?>";
</script>

<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title><?php echo $datos['nombre']; ?></title>
    <script src="../scripts1.0.17/jquery-3.4.1.min.js"></script>
    <script src="../scripts1.0.17/toolbox.js"></script>
    <script src="../scripts1.0.17/bootstrap.bundle.min.js"></script>
    <script src="../scripts1.0.17/admin_login.js"></script>

    <!-- Le styles -->
    <link href="../styles1.0.10/bootstrap.min.css" rel="stylesheet">
    <link href="../styles1.0.10/main.css" rel="stylesheet">
    <style>
      .bd-placeholder-img {
        font-size: 1.125rem;
        text-anchor: middle;
        -webkit-user-select: none;
        -moz-user-select: none;
        user-select: none;
      }

      @media (min-width: 768px) {
        .bd-placeholder-img-lg {
          font-size: 3.5rem;
        }
      }
    </style>

    </style>
    <link href="../styles1.0.10/login.css" rel="stylesheet">

</head>
<body class="bg-dark">

    <main class="form-signin">
        
    <form id="loginForm" action="<?php echo $datos['url'] . "/admin"; ?>" method="POST">
        <img class="mb-4 logo" src="../images/logo.png" alt="">
        <div id="feedbackContainer"></div>
        <div class="form-floating">
        <input type="text" class="form-control" id="loginEmail" placeholder="Usuario">
        <label for="loginEmail">Usuario</label>
        </div>
        <div class="form-floating">
        <input type="password" class="form-control" id="loginPassword" placeholder="Contraseña">
        <label for="loginPassword">Contraseña</label>
        </div>

        <!-- <div class="checkbox mb-3">
        <label>
            <input type="checkbox" value="remember-me"> Remember me
        </label>
        </div> -->
        <button class="w-100 btn btn-lg btn-primary" type="submit" onClick="AdminLogin.Login();return false;" id="loginBtnIngresar">Ingresar</button>
        <!-- <p class="mt-5 mb-3 text-muted">&copy; 2017–2021</p> -->
    </form>
    </main>

</body>

</html>
