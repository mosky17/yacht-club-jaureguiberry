<?php

require_once(dirname(__FILE__) . '/layout.php');
//require_once(dirname(__FILE__) . '/ingresar_transaction.php');
require_once(dirname(__FILE__) . '/proc/classes/auth.php');

if (Auth::access_level() < 0) {
    ?>
    <script type="text/javascript">
        Toolbox.GoToLogin();
    </script>
<?php } else { ?>

    <head>
        <script src="scripts1.0.17/caja_cantina.js"></script>
    </head>

    <?php echo '<script>var adminId = "'. $_SESSION['id'] . '";</script>' ?>

    <body>
        <div class="container cantina">
            <div class="botonesTop">
                <div id="boton_nuevo_turno" class="botonLobby botonTop btn btn-success" onclick="CajaCantina.OpenModalNuevoTurno();">Abrir turno</div>
                <div id="boton_reanudar_turno" class="botonLobby botonTop btn btn-warning" onclick="CajaCantina.ReanudarTurno();">Reanudar turno</div>
                <div id="botonRetiroCaja" class="botonLobby botonTop btn btn-primary" onclick="CajaCantina.OpenModalNuevoRetiro();">Nuevo Movimiento Interno</div>
                <div id="boton_cerrar_turno" style="display:none;" class="botonTurno botonTop btn btn-danger" onclick="CajaCantina.OpenModalCerrarTurno();">Cerrar turno</div>
            </div>
            <h2>Caja Cantina</h2>
            <span id="turno_label" class="tag_turno"></span>

            <div id="feedbackContainer"></div>

            <div class="vista_totales d-flex">
                <div class="caja_tipo">
                    <h4>Total en caja:<h4>
                    <h2 class="total_en_caja"><h2>
                </div>
                <div class="caja_tipo saldo_turno" style="display:none;">
                    <h4>Saldo del turno:<h4>
                    <h2 class="saldo_turno_amount"><h2>
                </div>
            </div>

            <!-- <div class="vista_last_transactions">
                <h3>Últimos pagos</h3>
                <div class="scroll_container">
                    <table class="table table-hover table-striped">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Valor ($)</th>
                                <th></th>
                                <th>Fecha Pago</th>
                                <th>Raz&oacute;n</th>
                                <th></th>
                                <th>Notas</th>
                            </tr>
                        </thead>
                        <tbody id="lista_last_transactions"></tbody>
                    </table>
                </div>
            </div> -->

            <div class="vista_shifts">
                <h3>Últimos turnos</h3>
                <div class="scroll_container">
                    <table class="table table-hover table-striped">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Encargado</th>
                                <th>Saldo</th>
                                <th>Estado</th>
                                <th class="hideInMobile">Notas</th>
                            </tr>
                        </thead>
                        <tbody id="lista_ultimos_turnos"></tbody>
                    </table>
                </div>
            </div>

            <div class="vista_last_retiros">
            <h3>Movimientos internos</h3>
                <div class="scroll_container">
                    <table class="table table-hover table-striped">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Monto</th>
                                <th>Flujo</th>
                            </tr>
                        </thead>
                        <tbody id="lista_last_retiros"></tbody>
                    </table>
                </div>
            </div>

            <div class="vista_current" style="display: none;">
                <h3>Pagos</h3>
                <div class="botones botonesPagos">
                    <div id="boton_crear_transaccion" class="btn btn-success" onclick="CajaCantina.OpenModalCrearTransaccion();">Nuevo pago</div>
                </div>
                <div class="scroll_container" style="max-height: fit-content;">
                    <table class="table table-hover table-striped">
                        <thead>
                            <tr>
                                <th class="hideInMobile">#</th>
                                <th class="rowMonto">Valor</th>
                                <th></th>
                                <th class="hideInMobile">Fecha Pago</th>
                                <th>Raz&oacute;n</th>
                                <th></th>
                                <th class="hideInMobile">Notas</th>
                                <th class="hideInMobile">Acciones</th>
                        </thead>
                        <tbody id="lista_turno_actual"></tbody>
                    </table>
                </div>
            </div>
        </div>

    <!-- <iframe id="exportIframe" src="" style="height:0px;border:0 none;"></iframe> -->
    <div class="cantina">
    
    <!-- Modal abrir turno -->
    <div id="abrirTurnoModal" class="modal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Abrir turno</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div id="feedbackContainerModalAbrirTurno" class="feedbackContainerModal"></div>
                    
                    <form class="needs-validation" novalidate>
                        <div class="mb-3">
                            <label for="input-encargado" class="form-label">Encargado</label>
                            <select id="input-encargado" class="form-select" required>
                                <option value="Martin Gaibisso">Martín Gaibisso</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="input-caja-inicio" class="form-label">Efectivo contabilizado en caja</label>
                            <div class="input-group mb-3">
                                <span class="input-group-text">$</span>
                                <input type="text" placeholder="0.00" id="input-caja-inicio" class="form-control" required>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <img src="../images/loaderModal.gif" class="loaderModal">
                    <button class="btn btn-primary boton-abrir-turno" onclick="CajaCantina.AbrirTurno();">Abrir turno</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal intercaja -->
    <div id="retiroModal" class="modal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Nuevo movimiento interno</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div id="feedbackContainerModalRetiroModal" class="feedbackContainerModal"></div>
                    
                    <form class="needs-validation" novalidate>
                        <div class="mb-3">
                            <label for="inputNuevoRetiroDestino" class="form-label">Caja destino</label>
                            <select id="inputNuevoRetiroDestino" class="form-select" required>
                                <option value="Personal">Personal</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="inputNuevoRetiroValor" class="form-label">Valor</label>
                            <div class="input-group mb-3">
                                <span class="input-group-text">$</span>
                                <input type="text" placeholder="0.00" id="inputNuevoRetiroValor" class="form-control" required>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="inputNuevoRetiroFecha" class="form-label">Fecha</label>
                            <input type="text" placeholder="" id="inputNuevoRetiroFecha" class="form-control" required>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <img src="../images/loaderModal.gif" class="loaderModal">
                    <button class="btn btn-primary botonNuevoRetiro" onclick="CajaCantina.IngresarRetiro();">Crear</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal ingresar pago -->
    <div id="listaIngresarPagoModal" class="modal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Nuevo pago</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <ul class="nav nav-pills nav-fill" role="tablist" id="ingresarPagoTabs">
                        <li class="nav-item" role="presentation" style="margin-left:0px;">
                            <button class="nav-link active" id="gasto-tab" data-bs-toggle="pill" data-bs-target="#gasto" type="button" role="tab" aria-controls="gasto" aria-selected="true">Gasto</button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="ingresoPorSocio-tab" data-bs-toggle="pill" data-bs-target="#ingresoPorSocio" type="button" role="tab" aria-controls="ingresoPorSocio" aria-selected="false">Ingreso por socio</button>
                        </li>
                        <li class="nav-item" role="presentation" style="margin-right:0px;">
                            <button class="nav-link" id="ingreso-tab" data-bs-toggle="pill" data-bs-target="#ingreso" type="button" role="tab" aria-controls="ingreso" aria-selected="false">Otro ingreso</button>
                        </li>
                    </ul>
                    <div class="tab-content" id="pills-tabContent">
                        <!-- TAB GASTO -->
                        <div class="tab-pane fade show active" id="gasto" role="tabpanel" aria-labelledby="gasto-tab">
                            <div id="feedbackContainerModalIngresarPago" class="feedbackContainerModal"></div>
                            <form class="needs-validation" novalidate>
                                <div class="mb-3">
                                    <label class="form-label">Precargados</label>
                                    <div class="pills mb-3 pillsPrecargados">
                                        <button class="btn btn-sm" style="background-color:#adb5bd" onclick="CajaCantina.PrecargarGasto('Viaticos Administracion'); return false;">Viáticos Administración</button>
                                        <button class="btn btn-sm" style="background-color:#dc3545" onclick="CajaCantina.PrecargarGasto('Insumos'); return false;">Insumos</button>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label for="listaIngresarGastoValor" class="form-label">Monto</label>
                                    <div class="input-group mb-3">
                                        <span class="input-group-text">$</span>
                                        <input type="text" placeholder="0.00" id="listaIngresarGastoValor" class="form-control" required>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label for="listaIngresarGastoFecha" class="form-label">Fecha pago</label>
                                    <input type="date" class="form-control" id="listaIngresarGastoFecha">
                                </div>
                                <div class="mb-3">
                                    <label for="listaIngresarGastoGrupo" class="form-label">Rubro</label>
                                    <select id="listaIngresarGastoGrupo" class="form-select" required>
                                        <option value="">- seleccionar rubro -</option>
                                        <option value="Cultivo">Cultivo</option>
                                        <option value="Energia">Energ&iacute;a</option>
                                        <option value="Equipamiento">Equipamiento</option>
                                        <option value="Instalaciones">Instalaciones</option>
                                        <option value="Insumos">Insumos</option>
                                        <option value="Administracion">Administraci&oacute;n</option>
                                        <option value="Jardineros">Jardineros</option>
                                        <option value="Locacion">Locaci&oacute;n</option>
                                        <option value="Transporte">Transporte</option>
                                        <option value="Devoluciones">Devoluciones</option>
                                        <option value="Limpieza">Limpieza</option>
                                        <option value="Seguridad">Seguridad</option>
                                        <option value="Viaticos Administracion">Viáticos Administración</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label for="listaIngresarGastoRazon" class="form-label">Razón</label>
                                    <textarea class="form-control" id="listaIngresarGastoRazon" rows="2"></textarea>
                                </div>
                                <div class="mb-3">
                                    <label for="listaIngresarGastoNotas" class="form-label">Notas</label>
                                    <textarea class="form-control" id="listaIngresarGastoNotas" rows="2"></textarea>
                                </div>
                            </form>
                        </div>
                        <!-- TAB INGRESO POR SOCIO -->
                        <div class="tab-pane fade" id="ingresoPorSocio" role="tabpanel" aria-labelledby="ingresoPorSocio-tab">
                            <div id="feedbackContainerModalIngresarPagoPorSocio" class="feedbackContainerModal"></div>
                            <div class="mb-3">
                                <label for="socioIngresarPagoSocio" class="form-label">Socio</label>
                                <select id="socioIngresarPagoSocio" class="form-select" onchange="CajaCantina.OnChangeSocioSelector();" required></select>
                            </div>
                            <div class="mb-3 previewSocio">
                                <div class="ingresoSocioDatosSocioContainerLoader">
                                    <img src="../images/loaderModal.gif" class="loaderModal">
                                </div>
                                <div class="ingresoSocioDatosSocioContainer">

                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="socioIngresarPagoRazon" class="form-label">Razón</label>
                                <div class="d-flex">
                                    <select id="socioIngresarPagoRazon" style="margin-left:0px;" class="form-select socioRazonSelect" onchange="CajaCantina.TogglePagoRazonMensualidad();">
                                        <option value="mensualidad">Mensualidad</option>
                                        <option value="matricula">Matr&iacute;cula</option>
                                    </select>
                                    <select id="socioIngresarPagoRazonMensualidadMes" class="form-select socioRazonSelect">
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
                                    <select id="socioIngresarPagoRazonMensualidadAnio" class="form-select socioRazonSelect" style="margin-right:0px;"></select>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="socioIngresarPagoValor" class="form-label">Monto</label>
                                <div class="input-group mb-3">
                                    <span class="input-group-text">$</span>
                                    <input type="text" placeholder="0.00" id="socioIngresarPagoValor" class="form-control" required>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="socioIngresarPagoFecha" class="form-label">Fecha pago</label>
                                <input type="date" class="form-control" id="socioIngresarPagoFecha">
                            </div>
                            <div class="mb-3">
                                <label for="socioIngresarPagoDescuento" class="form-label">Descuento</label>
                                <div class="d-flex">
                                    <div class="input-group mb-3" style="margin-right:10px;">
                                        <span class="input-group-text">$</span>
                                        <input type="text" placeholder="0.00" id="socioIngresarPagoDescuento" class="form-control">
                                    </div>
                                    <select id="socioIngresarPagoRazonDescuento" class="form-select" style="height: 39px;">
                                        <option value="BalanceVoluntariado">Balance Voluntariado</option>    
                                        <option value="Resolucion directiva">Resoluci&oacute;n directiva</option>
                                        <option value="DescuentoAnual">Descuento Anual</option>
                                        <option value="Otra">Otra</option>
                                    </select>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="socioIngresarPagoNotas" class="form-label">Notas</label>
                                <textarea class="form-control" id="socioIngresarPagoNotas" rows="2"></textarea>
                            </div>
                        </div>
                        <div class="tab-pane fade" id="ingreso" role="tabpanel" aria-labelledby="ingreso-tab">
                            <!-- TAB INGRESO -->
                            <div id="feedbackContainerModalIngresarPagoIngreso" class="feedbackContainerModal"></div>
                            <div class="modalListaRow">
                                <h4>Precargados</h4>
                                <div class="pills">
                                    <span class="badge" style="background-color:gray" onclick="CajaCantina.PrecargarIngreso('Devolucion');">Devolución</span>
                                </div>
                            </div>
                            <div class="modalListaRow">
                                <h4>Valor <span class="inputCurrency">$</span></h4>
                                <input style="width: 110px;" type="text" placeholder="0.00" id="listaIngresarIngresoValor">
                            </div>
                            <div class="modalListaRow">
                                <h4>Fecha</h4>
                                <input style="width: 120px;" type="text" placeholder="" id="listaIngresarIngresoFecha">
                            </div>
                            <div class="modalListaRow">
                                <h4>Rubro</h4>
                                <select id="listaIngresarIngresoGrupo">
                                    <option value="Cantina" selected>Cantina</option>
                                    <option value="Devolucion">Devolución</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>
                            <div class="modalListaRow">
                                <h4>Raz&oacute;n</h4>
                                <textarea style="width: 400px; height: 50px; max-width: 400px; max-height: 100px;"
                                        id="listaIngresarIngresoRazon"></textarea>
                            </div>
                            <div class="modalListaRow">
                                <h4>Notas</h4>
                                <textarea style="width: 400px; height: 50px; max-width: 400px; max-height: 100px;"
                                        id="listaIngresarIngresoNotas"></textarea>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <img src="../images/loaderModal.gif" class="loaderModal">
                    <button class="btn btn-default" data-dismiss="modal" aria-hidden="true">Cancelar</button>
                    <button id="listaIngresarPagoModalBtnIngresar" class="btn btn-primary" onclick="CajaCantina.IngresarPago();">Crear</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal cerrar turno -->
    <div id="cerrarTurnoModal" class="modal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Cerrar turno</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div id="feedbackContainerModalCerrarTurno" class="feedbackContainerModal"></div>

                    <form class="needs-validation" novalidate>
                        <div class="mb-3">
                            <label for="input-cerrar_caja_cash" class="form-label">Efectivo contabilizado en caja</label>
                            <div class="input-group mb-3">
                                <span class="input-group-text">$</span>
                                <input type="text" placeholder="0.00" id="input-cerrar_caja_cash" class="form-control" required>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="cerrarTurnoNotas" class="form-label">Notas</label>
                            <textarea id="cerrarTurnoNotas" class="form-control" required></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <img src="../images/loaderModal.gif" class="loaderModal">
                    <button class="btn btn-primary boton-cerrar-turno" onclick="CajaCantina.CerrarTurno();">Cerrar turno</button>
                </div>
            </div>
        </div>
    </div>
    </div>

    </body>

<?php }

require_once(dirname(__FILE__) . '/footer.php');

?>
