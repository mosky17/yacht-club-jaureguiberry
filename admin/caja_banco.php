<?php

require_once(dirname(__FILE__) . '/admin_layout.php');
require_once(dirname(__FILE__) . '/../proc/classes/auth.php');
require_once(dirname(__FILE__) . '/../proc/classes/banco_transaction.php');
require '../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\IOFactory;

if(Auth::access_level() < 0)
{
    header("Location: " . $datos['url'] . "/admin/admin_login.php");
    exit();
}
else
{
    $errors = [];
    $createdTransactionsIds = [];

    if(isset($_FILES['filesToUpload']) && count($_FILES['filesToUpload']) > 0) 
    {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);

        try 
        {
            // echo "<br>";
            // echo "<br>";

            echo '<script>var imported = true;</script>';
            echo '<script>var importErrors = [];</script>';
            echo '<script>var importedTransactionIds = [];</script>';

            $file = $_FILES["filesToUpload"]["tmp_name"];
            $reader = PhpOffice\PhpSpreadsheet\IOFactory::createReaderForFile($file);
            $reader->setReadDataOnly(FALSE);
            $spreadsheet = $reader->load($file);
            $worksheet = $spreadsheet->getActiveSheet();
            $highestRow = $worksheet->getHighestRow();
            $highestColumn = $worksheet->getHighestColumn();
            $highestColumnIndex = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::columnIndexFromString($highestColumn);

            $rowTransactionsStart = 100000000000;
            for ($row = 1; $row <= $highestRow; ++$row) 
            {
                $isTransaction = false;
                if($row > $rowTransactionsStart)
                {
                    $isTransaction = true;
                    $fecha = null;
                    $descripcion = null;
                    $documento = null;
                    $asunto = null;
                    $debito = null;
                    $credito = null;
                }
                for ($col = 1; $col <= $highestColumnIndex; ++$col) 
                {
                    if($isTransaction == true)
                    {
                        if($col == 1)
                        {
                            $value = $worksheet->getCellByColumnAndRow($col, $row)->getFormattedValue();
                            if($value == null || $value == "")
                            {
                                $isTransaction = false;
                            }else
                            {
                                $value = explode('/', $value);
                                if(count($value) < 3)
                                {
                                    $isTransaction = false;
                                }else
                                {
                                    $value = $value[2] . "-" . $value[1] . "-" . $value[0];
                                }
                            }
                        } else
                        {
                            $value = $worksheet->getCellByColumnAndRow($col, $row)->getValue();
                        }

                        if($isTransaction == true)
                        {
                            switch($col)
                            {
                                case 1:
                                    $fecha = $value;
                                    //echo $fecha . " | ";
                                    break;
                                case 2:
                                    $descripcion = $value;
                                    //echo $descripcion . " | ";
                                    break;
                                case 4:
                                    $documento = $value;
                                    //echo $documento . " | ";
                                    break;
                                case 5:
                                    $asunto = $value;
                                    //echo $asunto . " | ";
                                    break;
                                case 6:
                                    $debito = $value;
                                    //echo $debito . " | ";
                                    break;
                                case 7:
                                    $credito = $value;
                                    //echo $credito . " | ";
                                    break;
                            }
                        }
                    }else
                    {
                        if($worksheet->getCellByColumnAndRow($col, $row)->getValue() == 'Movimientos')
                        {
                            $rowTransactionsStart = $row + 1;
                        }
                    }
                }

                if($isTransaction == true)
                {
                    //try to ingresar
                    if($fecha != null && $descripcion != null && ($debito != null || $credito != null))
                    {
                        if($debito != null && $debito != "")
                        {
                            $valor = (double)$debito * -1;
                        }else if($credito != null && $credito != "")
                        {
                            $valor = $credito;
                        }

                        $response = TransaccionBanco::ingresar_transaction($fecha, $valor, $documento, $descripcion, $asunto);
                        if($response != null && is_array($response) && isset($response['error']))
                        {
                            $errors[] = $response['error'];
                        } else {
                            $createdTransactionsIds[] = $response;
                        }
                    }
                }
            }

            if(count($errors) > 0)
            {
                echo "<script>importErrors = [";
                for($i=0;$i<count($errors);$i++)
                {
                    if($i>0){
                        echo ", ";
                    }
                    echo "'" . $errors[$i] . "'";
                }
                echo "];</script>";
            }

            if(count($createdTransactionsIds) > 0){
                echo "<script>importedTransactionIds = [";
                for($i=0;$i<count($createdTransactionsIds);$i++)
                {
                    if($i>0){
                        echo ", ";
                    }
                    echo "'" . $createdTransactionsIds[$i] . "'";
                }
                echo "];</script>";
            }
        } catch (Exception $ex) {
            var_dump($ex);
        }
    } else {
        echo '<script>var imported = false;</script>';
    }
?>

    <head>
        <script src="../scripts1.0.17/caja_banco.js"></script>
    </head>

    <?php echo '<script>var adminId = "'. $_SESSION['id'] . '";</script>' ?>

    <body>
        <div class="container banco">
            <h2>Caja BROU</h2>

            <div class="feedbackContainer" id="feedbackContainerRed"></div>
            <div class="feedbackContainer" id="feedbackContainerYellow"></div>
            <div class="feedbackContainer" id="feedbackContainerGreen"></div>
            <div class="feedbackContainer" id="feedbackContainerCaja"></div>

            <div class="row cajaBordeada">
                <div class="col">
                    <div class="row">
                        <h5>Total en caja</h5>
                        <h2 class="total_en_caja"><h2>
                    </div>
                </div>
                <div class="col">
                    <div class="row">
                        <button class="btn btn-primary btn-columna" onclick="CajaBanco.OpenModalImportar();">Importar estado de cuenta</button>
                    </div>
                </div>
            </div>

            </br>

            <div class="vista_transactions_noidentificadas">
                <h3>Transacciones no identificadas</h3>
                <div class="scroll_container">
                    <table class="table table-hover table-striped">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Descripción</th>
                                <th>Documento</th>
                                <th>Asunto</th>
                                <th style="min-width: 80px;">Monto</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody id="lista_transactions_noidentificadas"></tbody>
                    </table>
                </div>
            </div>

            <div class="vista_last_transactions">
                <h3>Últimas transacciones</h3>
                <div class="scroll_container">
                    <table class="table table-hover table-striped">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Descripción</th>
                                <th>Documento</th>
                                <th>Asunto</th>
                                <th style="min-width: 80px;">Monto</th>
                                <th>Asociado a</th>
                            </tr>
                        </thead>
                        <tbody id="lista_last_transactions"></tbody>
                    </table>
                </div>
            </div>
        </div>

        <div class="banco">

            <!-- Modal importar estado de cuenta -->
            <div id="importarBrouModal" class="modal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Importar de BROU</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div id="feedbackContainerModalImportarBrou" class="feedbackContainerModal"></div>
                            <form class="needs-validation" method="post" action="caja_banco.php" enctype="multipart/form-data" novalidate>
                                <div class="mb-3">
                                    <label for="filesToUpload" class="form-label">Archivo XLS</label>
                                    <input class="form-control" name="filesToUpload" type="file" id="filesToUpload">
                                </div>
                                <div class="mb-3">
                                    <input class="btn btn-primary" type="submit" style="float:right;" value="Importar"/>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal identificar pago -->
            <div id="identificarPagoModal" class="modal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="identificarPagoModalLabel">Identificar transacción de </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <p class="asuntoTransaccion"></p>
                            <div id="feedbackContainerModalIdentificarPago" class="feedbackContainerModal"></div>
                            <ul class="nav nav-pills nav-fill" role="tablist" id="ingresarPagoTabs">
                                <li class="nav-item" role="presentation" style="margin-left:0px;">
                                    <button class="nav-link active" id="gasto-tab" data-bs-toggle="pill" data-bs-target="#gasto" type="button" role="tab" aria-controls="gasto" aria-selected="true">Gasto</button>
                                </li>
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link" id="ingresoPorSocio-tab" data-bs-toggle="pill" data-bs-target="#ingresoPorSocio" type="button" role="tab" aria-controls="ingresoPorSocio" aria-selected="false">Suscripción</button>
                                </li>
                                <li class="nav-item" role="presentation" style="margin-right:0px;">
                                    <button class="nav-link" id="ingreso-tab" data-bs-toggle="pill" data-bs-target="#ingreso" type="button" role="tab" aria-controls="ingreso" aria-selected="false">Ingreso</button>
                                </li>
                                <!-- <li class="nav-item" role="presentation" style="margin-right:0px;">
                                    <button class="nav-link" id="movimientoIntercaja-tab" data-bs-toggle="pill" data-bs-target="#movimientoIntercaja" type="button" role="tab" aria-controls="ingreso" aria-selected="false">Movimiento</button>
                                </li> -->
                            </ul>
                            <div class="tab-content" id="pills-tabContent">
                                <!-- TAB GASTO -->
                                <div class="tab-pane fade show active" id="gasto" role="tabpanel" aria-labelledby="gasto-tab">
                                    <div id="feedbackContainerModalIngresarPago" class="feedbackContainerModal"></div>
                                    <form class="needs-validation" novalidate>
                                        <div class="mb-3">
                                            <label class="form-label">Precargados</label>
                                            <div class="pills mb-3 pillsPrecargados">
                                                <button class="btn btn-sm" style="background-color:#adb5bd" onclick="CajaBanco.PrecargarGasto('UTE'); return false;">UTE</button>
                                                <button class="btn btn-sm" style="background-color:#dc3545" onclick="CajaBanco.PrecargarGasto('Costos Bancarios'); return false;">Costos Bancarios</button>
                                                <button class="btn btn-sm" style="background-color:#fd7e14" onclick="CajaBanco.PrecargarGasto('Limpieza'); return false;">Limpieza</button>
                                                <button class="btn btn-sm" style="background-color:#d63384" onclick="CajaBanco.PrecargarGasto('Jardinero'); return false;">Jardinero</button>
                                            </div>
                                        </div>

                                        <div class="mb-3">
                                            <div class="d-flex">
                                                <div class="" style="margin-right:10px;">
                                                    <label for="listaIngresarGastoValor" class="form-label">Monto</label>
                                                    <div class="input-group">
                                                        <span class="input-group-text">$</span>
                                                        <input type="text" placeholder="0.00" id="listaIngresarGastoValor" class="form-control" required disabled>
                                                    </div>
                                                </div>
                                                <div class="">
                                                    <label for="listaIngresarGastoFecha" class="form-label">Fecha pago</label>
                                                    <input type="date" class="form-control" id="listaIngresarGastoFecha" disabled>
                                                </div>
                                            </div>
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
                                                <option value="Jardineros">Jardineria</option>
                                                <option value="Transporte">Transporte</option>
                                                <option value="Devoluciones">Devoluciones</option>
                                                <option value="Limpieza">Limpieza</option>
                                                <option value="Seguridad">Seguridad</option>
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
                                    <div class="mb-3 ">
                                        <label for="socioIngresarPagoSocio" class="form-label">Socio</label>
                                        <div class="d-flex">
                                            <select id="socioIngresarPagoSocio" class="form-select" onchange="CajaBanco.OnChangeSocioSelector();" required></select>
                                            <!-- <img src="../images/loaderModal.gif" class="loaderSocios" style="visibility:hidden;"> -->
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <div class="d-flex">
                                            <div class="col">
                                                <label for="socioIngresarPagoSuscripcion" class="form-label">Suscripción</label>
                                                <select id="socioIngresarPagoSuscripcion" style="margin-left:0px;" class="form-select socioRazonSelect" onchange="CajaBanco.TogglePagoRazonSuscripcion();" disabled>
                                                </select>
                                            </div>
                                            <div class="col">
                                                <label for="socioIngresarPagoRazonMensualidadAnio" class="form-label">Obligación</label>
                                                <div class="d-flex">
                                                    <select id="socioIngresarPagoRazonMensualidadMes" class="form-select socioRazonSelect" style="display:none;" disabled>
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
                                                    <select id="socioIngresarPagoRazonMensualidadAnio" class="form-select socioRazonSelect" style="margin-right:0px;" disabled></select>
                                                </div>        
                                            </div>
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <div class="d-flex">
                                            <div class="" style="margin-right:10px;">
                                                <label for="socioIngresarPagoValor" class="form-label">Monto</label>
                                                <div class="input-group">
                                                    <span class="input-group-text">$</span>
                                                    <input type="text" placeholder="0.00" id="socioIngresarPagoValor" class="form-control" required>
                                                </div>
                                            </div>
                                            <div class="">
                                                <label for="socioIngresarPagoFecha" class="form-label">Fecha pago</label>
                                                <input type="date" class="form-control" id="socioIngresarPagoFecha" disabled>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label for="socioIngresarPagoDescuento" class="form-label">Descuento</label>
                                        <div class="d-flex">
                                            <div class="input-group" style="margin-right:10px;">
                                                <span class="input-group-text">$</span>
                                                <input type="text" placeholder="0.00" id="socioIngresarPagoDescuento" class="form-control">
                                            </div>
                                            <select id="socioIngresarPagoRazonDescuento" class="form-select" style="height: 39px;">
                                                <option value="Resolucion directiva">Resoluci&oacute;n directiva</option>
                                                <option value="Otra">Otra</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label for="socioIngresarPagoNotas" class="form-label">Notas</label>
                                        <textarea class="form-control" id="socioIngresarPagoNotas" rows="2"></textarea>
                                    </div>
                                </div>
                                <!-- TAB INGRESO -->
                                <div class="tab-pane fade" id="ingreso" role="tabpanel" aria-labelledby="ingreso-tab">
                                    <div id="feedbackContainerModalIngresarPagoIngreso" class="feedbackContainerModal"></div>
                                    <form class="needs-validation" novalidate>
                                        <div class="mb-3">
                                            <label class="form-label">Precargados</label>
                                            <div class="pills mb-3 pillsPrecargados">
                                                <button class="btn btn-sm" style="background-color:gray" onclick="CajaBanco.PrecargarIngreso('Devolucion'); return false;">Devolución</button>
                                            </div>
                                        </div>
                                        <div class="mb-3">
                                            <div class="d-flex">
                                                <div class="" style="margin-right:10px;">
                                                    <label for="listaIngresarIngresoValor" class="form-label">Monto</label>
                                                    <div class="input-group">
                                                        <span class="input-group-text">$</span>
                                                        <input type="text" placeholder="0.00" id="listaIngresarIngresoValor" class="form-control" required disabled>
                                                    </div>
                                                </div>
                                                <div class="">
                                                    <label for="listaIngresarIngresoFecha" class="form-label">Fecha pago</label>
                                                    <input type="date" class="form-control" id="listaIngresarIngresoFecha" disabled>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="mb-3">
                                            <label for="listaIngresarIngresoGrupo" class="form-label">Rubro</label>
                                            <select id="listaIngresarIngresoGrupo" class="form-select" required>
                                                <option value="">- seleccionar rubro -</option>
                                                <option value="Cantina" selected>Cantina</option>
                                                <option value="Devolucion">Devolución</option>
                                                <option value="Otro">Otro</option>
                                            </select>
                                        </div>
                                        <div class="mb-3">
                                            <label for="listaIngresarIngresoRazon" class="form-label">Razón</label>
                                            <textarea class="form-control" id="listaIngresarIngresoRazon" rows="2"></textarea>
                                        </div>
                                        <div class="mb-3">
                                            <label for="listaIngresarIngresoNotas" class="form-label">Notas</label>
                                            <textarea class="form-control" id="listaIngresarIngresoNotas" rows="2"></textarea>
                                        </div>
                                    </form>
                                </div>
                                <!-- TAB INTERCAJA -->
                                <!-- <div class="tab-pane fade" id="movimientoIntercaja" role="tabpanel" aria-labelledby="movimientoIntercaja-tab">
                                    <div id="feedbackContainerModalIngresarPagoIngreso" class="feedbackContainerModal"></div>
                                    
                                </div> -->
                            </div>
                        </div>
                        <div class="modal-footer">
                            <img src="../images/loaderModal.gif" class="loaderModal">
                            <button id="identificarPagoModalBtnIngresar" class="btn btn-primary" onclick="CajaBanco.IdentificarPago();">Asociar</button>
                        </div>
                    </div>
                </div>
            </div>

        </div>

    </body>

<?php }

require_once(dirname(__FILE__) . '/admin_footer.php');

?>
