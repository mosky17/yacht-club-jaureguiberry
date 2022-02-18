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
        <script src="../scripts1.0.17/admin_socio.js"></script>
    </head>

    <body>
        <div class="container">
            <div id="feedbackContainer" class="feedbackContainer"></div>
            <div class="socioHeader">
                <h2 id="socioNombreTitulo"></h2>
            </div>

            
        <div class="section"> 
            <div class="row cajaBordeada">
                <div class="col">
                    <div class="row">
                        <h5>Estado</h5>
                        <div class="badge" id="socioDatosValorEstado">Activo</div>
                    </div>
                    <div class="row">
                        <h5>N&uacute;mero</h5>
                        <p id="socioDatosValorNumero" class="socioDatosValor"></p>
                    </div>
                    <div class="row">
                        <h5>Documento</h5>
                        <p id="socioDatosValorDocumento" class="socioDatosValor"></p>
                    </div>
                    <div class="row">
                        <h5>Fecha Nacimiento</h5>
                        <p id="socioDatosValorFechaNacimiento" class="socioDatosValor"></p>
                    </div>
                </div>
                <div class="col">
                    <div class="row">
                        <h5>Email</h5>
                        <p id="socioDatosValorEmail" class="socioDatosValor"></p>
                    </div>
                    <div class="row">
                        <h5>Tel&eacute;fono</h5>
                        <p id="socioDatosValorTelefono" class="socioDatosValor"></p>
                    </div>
                    <div class="row">
                        <h5>Fecha Ingreso</h5>
                        <p id="socioDatosValorFechaIngreso" class="socioDatosValor"></p>
                    </div>
                    <div class="row">
                        <h5>Fecha Egreso</h5>
                        <p id="socioDatosValorFechaEgreso" class="socioDatosValor"></p>
                    </div>
                </div>
                <div class="col">
                    <div class="row">
                        <button class="btn btn-primary btn-columna" onClick="AdminSocio.OpenModalEditSocio();">Editar</button>
                    </div>
                    <div class="row">
                        <button class="btn btn-secondary btn-columna" onClick="AdminSocio.OpenModalCambiarEstado();">Cambiar estado</button>
                    </div>
                    <!-- <div class="row">
                        <button class="btn btn-success btn-columna" title="Ingresar nuevo pago" onclick="AdminSocio.OpenModalNuevoPago();">Agregar Pago</button>
                    </div> -->
                    <div class="row">
                        <button class="btn btn-success btn-columna" title="Nueva suscripción" onclick="AdminSocio.OpenModalNuevaSuscripcion();">Nueva Suscripción</button>
                    </div>
                </div>
                
            </div>
        </div>

        <!--Suscripciones-->
        <div class="section">
            <!-- <h3>Suscripciones</h3> -->
            <div class="row-fluid listaSuscripciones">
            </div>
        </div>

        <!--Pagos-->
        <!-- <div class="section">
            <h3 id="socioPagoseTitulo">Últimos pagos</h3>
            <div class="box row-fluid cajaBordeada">
                <div class="span12 socioListaContenedor">
                    <table class="table table-hover table-striped">
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Valor $</th>
                            <th>Fecha Pago</th>
                            <th>Raz&oacute;n</th>
                            <th>Descuento $</th>
                            <th>Notas</th>
                            <th>Tipo</th>
                        </tr>
                        </thead>
                        <tbody id="listaPagosSocioTabla"></tbody>
                    </table>
                </div>
            </div>
        </div> -->
    </div>

    <!-- Modal ingresar pago -->
    <div id="modalNuevoPagoSocio" class="modal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Ingresar Pago</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div id="feedbackContainerModalIngresarPago" class="feedbackContainerModal"></div>
                    
                    <form class="needs-validation" novalidate>
                        <div class="mb-3">
                            <label for="socioIngresarPagoRazon" class="form-label">Razón</label>
                            <select id="socioIngresarPagoRazon" class="form-select" required onChange="AdminSocio.TogglePagoRazon();">
                                <option value="mensualidad">Mensualidad</option>
                                <option value="matricula">Matr&iacute;cula</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="socioIngresarPagoRazonMensualidadMes" class="form-label">Mes</label>
                            <select id="socioIngresarPagoRazonMensualidadMes" class="form-select" required>
                                <option value="Enero">Enero</option>
                                <option value="Febrero">Febrero</option>
                                <option value="Marzo">Marzo</option>
                                <option value="Abril">Abril</option>
                                <option value="Mayo">Mayo</option>
                                <option value="Junio">Junio</option>
                                <option value="Julio">Julio</option>
                                <option value="Agosto">Agosto</option>
                                <option value="Setiembre">Setiembre</option>
                                <option value="Octubre">Octubre</option>
                                <option value="Noviembre">Noviembre</option>
                                <option value="Diciembre">Diciembre</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="socioIngresarPagoRazonMensualidadAnio" class="form-label">Año</label>
                            <select id="socioIngresarPagoRazonMensualidadAnio" class="form-select" required>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="socioIngresarPagoFecha" class="form-label">Fecha pago</label>
                            <input type="date" class="form-control" id="socioIngresarPagoFecha">
                        </div>
                        <div class="mb-3">
                            <label for="socioIngresarPagoTipo" class="form-label">Via</label>
                            <select id="socioIngresarPagoTipo" class="form-select" required>
                                <option value="personalmente">Personalmente</option>
                                <option value="transferencia_brou">Transferencia BROU</option>
                                <option value="otra">Otra</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="socioIngresarPagoValor" class="form-label">Monto $</label>
                            <input type="text" class="form-control" id="socioIngresarPagoValor" placeholder="0.00">
                        </div>
                        <div class="mb-3">
                            <label for="socioIngresarPagoDescuento" class="form-label">Descuento $</label>
                            <input type="text" class="form-control" id="socioIngresarPagoDescuento" placeholder="0.00">
                        </div>
                        <div class="mb-3">
                            <label for="socioIngresarPagoRazonDescuento" class="form-label">Razón descuento</label>
                            <select id="socioIngresarPagoRazonDescuento" class="form-select" onchange="AdminSocio.OnChangeRazonDescuentoPago();" required>
                                <option value="">-</option>
                                <option value="BalanceVoluntariado">Balance</option>
                                <option value="Resolucion directiva">Resoluci&oacute;n directiva</option>
                                <option value="DescuentoAnual">Descuento Anual</option>
                                <option value="Otra">Otra</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="socioIngresarPagoNotas" class="form-label">Comentarios</label>
                            <textarea class="form-control" id="socioIngresarPagoNotas" rows="3"></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <img src="../images/loaderModal.gif" class="loaderModal">
                    <button id="socioIngresarPagoModalBtnIngresar" class="btn btn-primary">Ingresar</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal cambiar estado -->
    <div id="modalCambiarEstadoSocio" class="modal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Cambiar estado</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div id="feedbackContainerModalCambiarEstado" class="feedbackContainerModal"></div>
                    <form class="needs-validation" novalidate>
                        <div class="mb-3">
                            <label for="socioEditarEstado" class="form-label">Nuevo estado</label>
                            <select id="socioEditarEstado" class="form-select" required>
                                <option value="activo">Activo</option>
                                <option value="suspendido">Suspendido</option>
                                <option value="eliminar">Eliminar Socio</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <img src="../images/loaderModal.gif" class="loaderModal">
                    <button id="socioCambiarEstadoModalBtnCambiar" class="btn btn-primary" onClick="AdminSocio.CambiarEstadoSocio();">Cambiar</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal editar socio -->
    <div id="modalEditarDatos" class="modal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Editar datos</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div id="feedbackContainerModalEditarDatos" class="feedbackContainerModal"></div>

                    <form class="needs-validation" novalidate>
                        <div class="mb-3">
                            <label for="inputEditarDatosNumero" class="form-label">Numero</label>
                            <input type="text" class="form-control" id="inputEditarDatosNumero" disabled>
                        </div>
                        <div class="mb-3">
                            <label for="inputEditarDatosNombre" class="form-label">Nombre</label>
                            <input type="text" class="form-control" id="inputEditarDatosNombre">
                        </div>
                        <div class="mb-3">
                            <label for="inputEditarDatosDocumento" class="form-label">Documento</label>
                            <input type="text" class="form-control" id="inputEditarDatosDocumento" placeholder="12345678" aria-describedby="helpDocumento">
                            <div id="helpDocumento" class="form-text">Sin puntos ni guiones.</div>
                        </div>
                        <div class="mb-3">
                            <label for="inputEditarDatosEmail" class="form-label">Email</label>
                            <input type="email" class="form-control" id="inputEditarDatosEmail" placeholder="email@socio.com">
                        </div>
                        <div class="mb-3">
                            <label for="inputEditarDatosFechaNacimiento" class="form-label">Fecha nacimiento</label>
                            <input type="date" class="form-control" id="inputEditarDatosFechaNacimiento">
                        </div>
                        <div class="mb-3">
                            <label for="inputEditarDatosTel" class="form-label">Teléfono</label>
                            <input type="text" class="form-control" id="inputEditarDatosTel">
                        </div>
                        <div class="mb-3">
                            <label for="inputEditarDatosFechaInicio" class="form-label">Fecha ingreso</label>
                            <input type="date" class="form-control" id="inputEditarDatosFechaInicio">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <img src="../images/loaderModal.gif" class="loaderModal">
                    <button id="modalEditarDatosBtnSalvarSocio" class="btn btn-primary" onclick="AdminSocio.SalvarSocio();">Guardar cambios</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal nueva suscripcion -->
    <div id="ModalNuevaSuscripcion" class="modal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 id="tituloModalSuscripcion" class="modal-title">Nueva suscripción</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div id="feedbackContainerModalNuevaSuscripcion" class="feedbackContainerModal"></div>
                    <form class="needs-validation" novalidate>
                        <div class="mb-3">
                            <label for="socioNuevaSuscripcionTipo" class="form-label">Tipo suscripción</label>
                            <select id="socioNuevaSuscripcionTipo" class="form-select" onchange="AdminSocio.OnChangeSuscripcionTipo();" required>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="socioNuevaSuscripcionFechaInicio" class="form-label">Fecha inicio</label>
                            <input type="date" class="form-control" id="socioNuevaSuscripcionFechaInicio">
                        </div>
                        <div class="mb-3 selectorMiembrosFamiliares" style="display:none;">
                            <label for="socioNuevaSuscripcionSociosPatrocinados" class="form-label">Miembros familiares incluidos</label>
                            <select id="socioNuevaSuscripcionSociosPatrocinados1" class="form-select mb-2" required>
                            </select>
                            <select id="socioNuevaSuscripcionSociosPatrocinados2" class="form-select mb-2" required>
                            </select>
                            <select id="socioNuevaSuscripcionSociosPatrocinados3" class="form-select mb-2" required>
                            </select>
                            <select id="socioNuevaSuscripcionSociosPatrocinados4" class="form-select mb-2" required>
                            </select>
                            <select id="socioNuevaSuscripcionSociosPatrocinados5" class="form-select mb-2" required>
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <img src="../images/loaderModal.gif" class="loaderModal">
                    <button id="botonSuscribirSocio" class="btn btn-primary" onClick="AdminSocio.GuardarSuscripcion();">Suscribir</button>
                </div>
            </div>
        </div>
    </div>

    </body>

<?php }

require_once(dirname(__FILE__) . '/admin_footer.php');

?>
