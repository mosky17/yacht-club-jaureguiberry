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
        <script src="../scripts1.0.17/admin_caja.js"></script>
    </head>

    <body>
    <div class="container">
        <div id=feedbackContainer></div>

        <h2>Caja</h2>

        <div class="totales">
        </div>

        <div class="controlesFila d-flex">
            <div class="controlesFilaItem btn-group">
                <button class="btnPageSize btn btn-dark dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">25 por página</button>
                <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="#" onClick="AdminCaja.SetPagination(25); return false;">25</a></li>
                    <li><a class="dropdown-item" href="#" onClick="AdminCaja.SetPagination(50); return false;">50</a></li>
                    <li><a class="dropdown-item" href="#" onClick="AdminCaja.SetPagination(100); return false;">100</a></li>
                    <li><a class="dropdown-item" href="#" onClick="AdminCaja.SetPagination(200); return false;">200</a></li>
                </ul>
            </div>
            <!-- <button type="button" class="controlesFilaItem btn btn-danger" id="crearGasto" onclick="AdminCaja.OpenModalNuevoGasto();">+ Gasto</button>
            <button type="button" class="controlesFilaItem btn btn-success" id="crearHaber" onclick="ListaGastos.OpenModalNuevoHaber();">+ Ingreso</button> -->
            <!-- <div class="controlesFilaItem dropdown me-1">
                <button type="button" class="btn btn-secondary dropdown-toggle" id="dropdownMenuOffset" data-bs-toggle="dropdown" aria-expanded="false" data-bs-offset="0,1">
                Exportar
                </button>
                <ul class="dropdown-menu" aria-labelledby="dropdownMenuOffset">
                <li><a class="dropdown-item" href="#" onClick="AdminCaja.ExportarCaja(); return false;">Caja completa</a></li>
                </ul>
            </div> -->
        </div>
        
        <div class="paginationTopTable">
                <nav aria-label="...">
                    <ul class="paginationTablaPagos pagination pagination-sm">
                    </ul>
                </nav>
        </div>
        <table class="table table-hover">
            <thead>
            <tr>
                <th>#</th>
                <th>Valor</th>
                <th></th>
                <th>Fecha Pago</th>
                <th>Raz&oacute;n</th>
                <th>Rubro</th>
                <th>Notas</th>
            </tr>
            </thead>
            <tbody id="listaPagosTabla"></tbody>
        </table>
    </div>

    <iframe id="exportIframe" src="" style="height:0px;border:0 none;"></iframe>

    <!-- Modal ingresar gasto -->
    <div id="modalNuevoGasto" class="modal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="listaIngresarGastoModalLabel">Ingresar Gasto</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div id="feedbackContainerModalIngresarGasto" class="feedbackContainerModal"></div>

                    <form class="needs-validation" novalidate>
                        <div class="mb-3">
                            <label for="listaIngresarGastoValor" class="form-label">Monto $</label>
                            <input type="text" class="form-control" id="listaIngresarGastoValor" placeholder="0.00">
                        </div>
                        <div class="mb-3">
                            <label for="listaIngresarGastoFecha" class="form-label">Fecha pago</label>
                            <input type="date" class="form-control" id="listaIngresarGastoFecha">
                        </div>
                        <div class="mb-3">
                            <label for="listaIngresarGastoGrupo" class="form-label">Rubro</label>
                            <select id="listaIngresarGastoGrupo" class="form-select" required>
                                <option value="">- seleccionar rubro -</option>
                                <option value="Energia">Energ&iacute;a</option>
                                <option value="Equipamiento">Equipamiento</option>
                                <option value="Instalaciones">Instalaciones</option>
                                <option value="Insumos">Insumos</option>
                                <option value="Administracion">Administraci&oacute;n</option>
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
                <div class="modal-footer">
                    <img src="../images/loaderModal.gif" class="loaderModal">
                    <button id="listaIngresarGastoModalBtnIngresar" class="btn btn-primary">Ingresar</button>
                </div>
            </div>
        </div>
    </div>

    </body>

<?php }

require_once(dirname(__FILE__) . '/admin_footer.php');

?>