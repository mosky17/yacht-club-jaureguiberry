<?php

require_once(dirname(__FILE__).'/admin_layout.php');
require_once(dirname(__FILE__).'/../proc/classes/auth.php');
require_once(dirname(__FILE__).'/../proc/classes/socio.php');
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

$errors = [];
    $createdSocioIds = [];

    if(isset($_FILES['filesToUpload']) && count($_FILES['filesToUpload']) > 0) 
    {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);

        try 
        {
            // echo "<br>";
            // echo "<br>";

            // echo '<script>var imported = true;</script>';
            // echo '<script>var importErrors = [];</script>';
            // echo '<script>var importedSocioIds = [];</script>';

            $file = $_FILES["filesToUpload"]["tmp_name"];
            $reader = PhpOffice\PhpSpreadsheet\IOFactory::createReaderForFile($file);
            $reader->setReadDataOnly(FALSE);
            $spreadsheet = $reader->load($file);
            //$worksheet = $spreadsheet->getActiveSheet();
            $worksheet = $spreadsheet->getSheet(0);
            $highestRow = $worksheet->getHighestRow();
            $highestColumn = $worksheet->getHighestColumn();
            $highestColumnIndex = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::columnIndexFromString($highestColumn);
            //$highestColumnIndex = 7;

            // echo "HIGH ROW: " . $highestRow . "<br>";
            // echo "HIGH COL: " . $highestColumnIndex . "<br>";

            //$rowSociosStart = 100000000000;
            for ($row = 2; $row <= $highestRow; ++$row) 
            {
                //echo "ROW: ". $row . "<br>";
                // $isSocio = false;
                // if($row > $rowSociosStart)
                // {
                    $isSocio = true;
                    $numero = "";
                    $nombre = "";
                    $apellido = "";
                    $documento = "";
                    $mail = "";
                    $tel = "";
                    $ingreso = "";
                //}
                for ($col = 1; $col <= $highestColumnIndex; ++$col) 
                {
                    if($isSocio == true)
                    {
                        // if($col == 1)
                        // {
                        //     $value = $worksheet->getCellByColumnAndRow($col, $row)->getFormattedValue();
                        //     if($value == null || $value == "")
                        //     {
                        //         $isSocio = false;
                        //     }
                        //     // else
                        //     // {
                        //     //     $value = explode('/', $value);
                        //     //     if(count($value) < 3)
                        //     //     {
                        //     //         $isTransaction = false;
                        //     //     }else
                        //     //     {
                        //     //         $value = $value[2] . "-" . $value[1] . "-" . $value[0];
                        //     //     }
                        //     // }
                        // } else
                        // {
                            $value = $worksheet->getCellByColumnAndRow($col, $row)->getValue();
                        //}

                        if($isSocio == true)
                        {
                            switch($col)
                            {
                                case 1:
                                    $numero = $value;
                                    //echo $numero . " | ";
                                    break;
                                case 2:
                                    $nombre = $value;
                                    //echo $nombre . " | ";
                                    break;
                                case 3:
                                    $apellido = $value;
                                    //echo $apellido . " | ";
                                    break;
                                case 4:
                                    $documento = $value;
                                    //echo $documento . " | ";
                                    break;
                                case 5:
                                    $mail = $value;
                                    //echo $mail . " | ";
                                    break;
                                case 6:
                                    $tel = $value;
                                    //echo $tel . " | ";
                                    break;
                                case 7:
                                    $ingreso = $value;
                                    //echo $ingreso . " | ";
                                    break;
                                case 8:
                                    $pago = $value;
                                    //echo $pago . " | ";
                                    break;
                            }
                        }
                    }
                }

                if($isSocio == true)
                {
                    //try to ingresar
                    if($numero != "")
                    {
                        $documento = str_replace("-", "", $documento);
                        $documento = str_replace(".", "", $documento);

                        if($ingreso == null || $ingreso == ""){
                            $ingreso = "1900";
                        }

                        $response = Socio::create_socio($numero, $nombre . " " . $apellido, $documento, $mail, $ingreso . "-01-01", $tel, null);
                        if($response != null && is_array($response) && isset($response['error']))
                        {
                            $errors[] = $response['error'];
                        } else {

                            //echo $pago;
                            if($pago == "Vitalicio"){

                                //echo "VITALICIO";

                                Socio::suscribir($response, 2, $ingreso . "-01-01");

                                if($response != null && is_array($response) && isset($response['error']))
                                {
                                    $errors[] = $response['error'];
                                }
                            }

                            $createdSocioIds[] = $response;
                        }
                    }
                }

                //echo "<br><br>";
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

            if(count($createdSocioIds) > 0){
                echo "<script>importedSocioIds = [";
                for($i=0;$i<count($createdSocioIds);$i++)
                {
                    if($i>0){
                        echo ", ";
                    }
                    echo "'" . $createdSocioIds[$i] . "'";
                }
                echo "];</script>";
            }
        } catch (Exception $ex) {
            var_dump($ex);
        }
    } else {
        echo '<script>var imported = false;</script>';
    }

{ ?>

<head>
	<script src="../scripts1.0.17/admin_socios.js"></script>
</head>

<body>
	<div class="container">
		<h2>Lista de Socios</h2>
			<div id="listaSociosControlesContainer" class="hideInMobile controlesLista">
				<div id="listaSociosBtnCrearSocio" class="btn btn-primary" onclick="AdminSocios.OpenModalNuevoSocio();">Nuevo Socio</div>
                <!-- <select class="form-select lista-socios-show" onchange="AdminSocios.CambiarSociosAMostrar();">
                    <option value="activos" selected>Mostrar Socios Activos</option>
                    <option value="suspendidos">Mostrar Socios Suspendidos</option>
                </select> -->
                <!-- <div class="btn btn-success" onclick="AdminSocios.OpenModalImportarSocios();">Importar socios</div> -->
                <h5 id="totalRegistrosSocios" class="totalRegistros"></h5>
			</div>
			<div id=feedbackContainer></div>
			<table class="table table-hover">
				<thead>
					<tr>
						<th>Número</th>
						<th>Nombre</th>
                        <th>Documento</th>
                        <th>Teléfono</th>
						<th class="">Ingreso</th>
						<th class="">Suscripción</th>
                        <th class="">Estado</th>
					</tr>
				</thead>
				<tbody id="listaSociosTabla"></tbody>
			</table>
	</div>

    <!-- Modal nuevo socio -->
    <div id="modalNuevoSocio" class="modal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Nuevo socio</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div id="feedbackContainerModalNuevoSocio" class="feedbackContainerModal"></div>

                    <form class="needs-validation" novalidate>
                    <div class="mb-3">
                            <label for="inputNuevoSocioNumero" class="form-label">Número</label>
                            <input type="number" class="form-control" id="inputNuevoSocioNumero" disabled>
                        </div>
                        <div class="mb-3">
                            <label for="inputNuevoSocioNombre" class="form-label">Nombre</label>
                            <input type="text" class="form-control" id="inputNuevoSocioNombre">
                        </div>
                        <div class="mb-3">
                            <label for="inputNuevoSocioDocumento" class="form-label">Documento</label>
                            <input type="number" class="form-control" id="inputNuevoSocioDocumento" placeholder="12345678" aria-describedby="helpDocumento">
                            <div id="helpDocumento" class="form-text">Sin puntos ni guiones.</div>
                        </div>
                        <div class="mb-3">
                            <label for="inputNuevoSocioEmail" class="form-label">Email</label>
                            <input type="email" class="form-control" id="inputNuevoSocioEmail" placeholder="email@socio.com">
                        </div>
                        <div class="mb-3">
                            <label for="inputNuevoSocioFechaNacimiento" class="form-label">Fecha nacimiento</label>
                            <input type="date" class="form-control" id="inputNuevoSocioFechaNacimiento">
                        </div>
                        <div class="mb-3">
                            <label for="inputNuevoSocioTel" class="form-label">Teléfono</label>
                            <input type="text" class="form-control" id="inputNuevoSocioTel">
                        </div>
                        <div class="mb-3">
                            <label for="inputNuevoSocioFechaInicio" class="form-label">Fecha ingreso</label>
                            <input type="date" class="form-control" id="inputNuevoSocioFechaInicio">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <img src="../images/loaderModal.gif" class="loaderModal">
                    <button id="modalNuevoSocioBtnCrearSocio" class="btn btn-primary" onclick="AdminSocios.SalvarSocio();">Crear</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal importar socios -->
    <div id="importarSociosModal" class="modal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Importar socios</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div id="feedbackContainerModalImportarSocios" class="feedbackContainerModal"></div>
                    <form class="needs-validation" method="post" action="socios.php" enctype="multipart/form-data" novalidate>
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
</body>

<?php }

require_once(dirname(__FILE__) . '/admin_footer.php');

?>
