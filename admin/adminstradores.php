<?php

require_once(dirname(__FILE__) . '/admin_layout.php');
require_once(dirname(__FILE__) . '/../proc/classes/auth.php');

if(Auth::access_level() < 0)
{
    header("Location: " . $datos['url'] . "/admin/admin_login.php");
    exit();
}
else
{ ?>

    <head>
        <script src="../scripts1.0.17/admins.js"></script>
    </head>

    <body>
    <div class="container">
        <div id=feedbackContainer></div>
        <div class="section">
            <h2>Administradores</h2>
            <div class="inlineTitleRight">
                <div class="btn btn-success btn-sm" onclick="Admins.OpenModalNuevoAdmin();">Nuevo administrador</div>
            </div>
            <div class="cajaBordeada">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Email/Usuario</th>
                            <th>Modificar</th>
                            <th>Borrar</th>
                        </tr>
                    </thead>
                    <tbody class="tabla-admins"></tbody>
                </table>
            </div>
        </div>

        <div class="btn btn-primary" onclick="Admins.OpenModalSettings();">Editar configuración</div>
    </div>

    <!-- Modal admin -->
    <div id="adminsDatosModal" class="modal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Nuevo administrador</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div id="adminsDatosModalFeedback" class="feedbackContainerModal"></div>

                    <form class="needs-validation" novalidate>
                        <div class="mb-3">
                            <label for="admin_datos_nombre" class="form-label">Nombre</label>
                            <input type="text" class="form-control" id="admin_datos_nombre">
                        </div>
                        <div class="mb-3">
                            <label for="admin_datos_email" class="form-label">Usuario</label>
                            <input type="text" class="form-control" id="admin_datos_email">
                        </div>
                        <div class="mb-3">
                            <label for="admin_datos_clave" class="form-label">Contraseña</label>
                            <input type="password" class="form-control" id="admin_datos_clave">
                        </div>
                        <div class="mb-3">
                            <label for="admin_datos_clave2" class="form-label">Repetir Contraseña</label>
                            <input type="password" class="form-control" id="admin_datos_clave2">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <img src="../images/loaderModal.gif" class="loaderModal">
                    <button id="adminsDatosModalBtnSalvar" class="btn btn-primary">Salvar</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal settings -->
    <div id="adminsSettingsModal" class="modal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Configuración</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div id="adminsSettingsFeedback" class="feedbackContainerModal"></div>

                    <form id="settings" class="needs-validation" novalidate>
                    </form>
                </div>
                <div class="modal-footer">
                    <img src="../images/loaderModal.gif" class="loaderModal">
                    <button id="" class="btn btn-primary" onClick="Admins.SaveSettings();">Guardar</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal cerrar caja -->
    <div id="adminsCerrarCajaModal" class="modal hide fade" tabindex="-1" role="dialog"
         aria-labelledby="adminsCerrarCajaModalLabel" aria-hidden="true">
        <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">x</button>
            <h3>Cerrar Caja</h3>
        </div>
        <div class="modal-body">
            <div id="adminsCerrarCajaModalFeedback" class="feedbackContainerModal"></div>
            <table>
                <tr>
                    <td>Hasta la fecha</td>
                    <td><input type="text" class="admin_cerrar_caja_fecha"></td>
                </tr>
            </table>
        </div>
        <div class="modal-footer">
            <img src="../images/loaderModal.gif" class="loaderModal">
            <button class="btn" data-dismiss="modal" aria-hidden="true">Cerrar</button>
            <button class="btn btn-primary" onclick="Admins.SalvarCerrarCaja();">Salvar</button>
        </div>
    </div>

    </body>

<?php }

require_once(dirname(__FILE__) . '/admin_footer.php');

?>
