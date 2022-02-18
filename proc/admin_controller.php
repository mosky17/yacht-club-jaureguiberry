<?php

//error_reporting(E_ALL);

require_once(dirname(__FILE__).'/classes/auth.php');
require_once(dirname(__FILE__).'/classes/socio.php');
require_once(dirname(__FILE__).'/classes/suscripcion.php');
require_once(dirname(__FILE__).'/classes/pago.php');
require_once(dirname(__FILE__).'/classes/admin.php');
require_once(dirname(__FILE__).'/classes/dato.php');
// require_once(dirname(__FILE__).'/classes/cantina_turno.php');
// require_once(dirname(__FILE__).'/classes/cantina_transaction.php');
// require_once(dirname(__FILE__).'/classes/transaction_entre_cajas.php');
// require_once(dirname(__FILE__).'/classes/banco_transaction.php');
// require_once(dirname(__FILE__).'/classes/banco_transaction_split.php');

//************** AUTH ********************

function login(){
	$username = htmlspecialchars(trim($_POST['email']));
	$passwd = htmlspecialchars(trim($_POST['passwd']));
	//$remember = htmlspecialchars(trim($_POST['remember']));
	echo json_encode(Auth::login($username, $passwd, false));
}
function logout(){
    $result = Auth::logout();
    echo json_encode($result);
}

//************** SOCIO ********************

function get_all_socios(){
	$result = Socio::get_all_socios();
	echo json_encode($result);
}

function get_lista_socios_por_nombre(){
    $result = Socio::get_lista_socios_por_nombre();
	echo json_encode($result);
}

function get_lista_socios_por_nombre_sin_suscripcion(){
    $result = Socio::get_lista_socios_por_nombre_sin_suscripcion();
	echo json_encode($result);
}

function get_socios_activos(){
    $result = Socio::get_socios_activos();
    //var_dump($result[0]);
    echo json_encode($result);
//    switch(json_last_error()) {
//        case JSON_ERROR_NONE:
//            echo ' - Sin errores';
//            break;
//        case JSON_ERROR_DEPTH:
//            echo ' - Excedido tamaño máximo de la pila';
//            break;
//        case JSON_ERROR_STATE_MISMATCH:
//            echo ' - Desbordamiento de buffer o los modos no coinciden';
//            break;
//        case JSON_ERROR_CTRL_CHAR:
//            echo ' - Encontrado carácter de control no esperado';
//            break;
//        case JSON_ERROR_SYNTAX:
//            echo ' - Error de sintaxis, JSON mal formado';
//            break;
//        case JSON_ERROR_UTF8:
//            echo ' - Caracteres UTF-8 malformados, posiblemente codificados de forma incorrecta';
//            break;
//        default:
//            echo ' - Error desconocido';
//            break;
//    }
}
function get_socios_suspendidos(){
    $result = Socio::get_socios_suspendidos();
    echo json_encode($result);
}
function get_tags(){
	$result = Socio::get_tags();
	echo json_encode($result);
}
function create_socio(){
	$result = Socio::create_socio(
        $_POST['numero'],
        $_POST['nombre'],
        $_POST['documento'],
        $_POST['email'],
        $_POST['fecha_ingreso'],
        $_POST['telefono'],
        $_POST['fecha_nacimiento']);
	echo json_encode($result);
}
function update_socio(){
    $result = Socio::update_socio(
        $_POST['id'],$_POST['numero'], 
        $_POST['nombre'], 
        $_POST['documento'], 
        $_POST['email'], 
        $_POST['fecha_ingreso'],
        $_POST['telefono'],
        $_POST['fecha_nacimiento']);
    echo json_encode($result);
}
function get_socio(){
	$result = Socio::get_socio($_POST['id']);
	echo json_encode($result);
}
function eliminar_socio(){
    $result = Socio::eliminar_socio($_POST['id_socio']);
    echo json_encode($result);
}
function update_estado_socio(){
    $result = Socio::update_estado_socio($_POST['id_socio'],$_POST['activo']);
    echo json_encode($result);
}
function get_lista_mails(){
    $result = Socio::get_lista_mails($_POST['all'],$_POST['tags']);
    echo json_encode($result);
}
function send_estados_de_cuenta(){
    $result = Socio::send_estados_de_cuenta($_POST['total'],htmlspecialchars(trim($_POST['texto'])));
    echo json_encode($result);
}

//************** PAGO ********************

function ingresar_pago(){
    $result = Pago::ingresar_pago($_POST['id_socio'],$_POST['valor'],$_POST['fecha_pago'],
        $_POST['razon'],$_POST['tipo'],$_POST['notas'],$_POST['descuento'],$_POST['descuento_json']);
    echo json_encode($result);
}
function salvar_pago_modificar(){
    $result = Pago::salvar_pago_modificar(
        $_POST['id'],
        $_POST['razon'],
        $_POST['descuento'],
        $_POST['descuento_json'],
        $_POST['notas'],
        $_POST['fecha_pago'],
        $_POST['id_socio']);
    echo json_encode($result);
}

function get_pagos_socio(){
    $result = Pago::get_pagos_socio($_POST['id_socio']);
    echo json_encode($result);
}

function get_pagos_suscripciones_socios(){
    $result = Pago::get_pagos_suscripciones_socios();
    echo json_encode($result);
}

function get_lista_pagos(){
    $result = Pago::get_lista_pagos();
    echo json_encode($result);
}

function get_pago(){
    $result = Pago::get_pago($_POST['id']);
    echo json_encode($result);
}

function cancelar_pago(){
    $result = Pago::cancelar_pago($_POST['id']);
    echo json_encode($result);
}

function get_lista_pagos_paginated(){
    $result = Pago::get_lista_pagos_paginated(
        $_POST['sort'],
        $_POST['page_size'],
        $_POST['page']
    );
    echo json_encode($result);
}

//************** SUSCRIPCIONES ********************

function get_suscripcion(){
    $result = Suscripcion::get_suscripcion($_POST['id'], true);
    echo json_encode($result);
}

function get_suscripciones(){
    $result = Suscripcion::get_suscripciones(true);
    echo json_encode($result);
}

function agregar_suscripcion_socio(){
    $result = Socio::suscribir(
        $_POST['id_socio'],
        $_POST['id_suscripcion'],
        $_POST['fecha_inicio'],
        $_POST['socios_incluidos']
    );
    echo json_encode($result);
}

function modificar_suscripcion_socio(){
    $result = Socio::modificar_suscripcion(
        $_POST['id'],
        $_POST['fecha_inicio'],
        $_POST['fecha_fin'],
        $_POST['activa']
    );
    echo json_encode($result);
}

function get_pagos_suscripciones_socio(){
    $result = Pago::get_pagos_suscripciones_socio($_POST['id']);
    echo json_encode($result);
}

function get_totales(){
    $result = Pago::get_totales();
    echo json_encode($result);
}

function get_suscripciones_socios(){
    $result = Socio::get_suscripciones_socios();
    echo json_encode($result);
}

//************** LOG ********************

function get_lista_logs(){
    $result = Log::get_lista_logs();
    echo json_encode($result);
}

//************** GASTO ********************

// function get_gasto(){
//     $result = Gasto::get_gasto($_POST['id']);
//     echo json_encode($result);
// }
// function cancelar_gasto(){
//     $result = Gasto::cancelar_gasto($_POST['id']);
//     echo json_encode($result);
// }function update_rubro_gasto(){
//     $result = Gasto::update_rubro_gasto($_POST['id'],$_POST['rubro']);
//     echo json_encode($result);
// }
// function ingresar_gasto(){
//     $result = Gasto::ingresar_gasto($_POST['valor'],$_POST['fecha_pago'],$_POST['razon'],$_POST['notas'],$_POST['rubro']);
//     echo json_encode($result);
// }
// function get_lista_gastos(){
//     $result = Gasto::get_lista_gastos();
//     echo json_encode($result);
// }
// function get_lista_gastos_desc(){
//     $result = Gasto::get_lista_gastos_desc();
//     echo json_encode($result);
// }

// function get_totales(){
//     $result = Gasto::get_totales();
//     echo json_encode($result);
// }

//************** ADMINS ********************

function get_lista_admins(){
    $result = Admin::get_lista_admins();
    echo json_encode($result);
}

function ingresar_admin(){
    $result = Admin::ingresar_admin($_POST['nombre'],$_POST['email'],$_POST['clave'],$_POST['permiso_pagos']);
    echo json_encode($result);
}

function update_admin(){
    $result = Admin::update_admin($_POST['id'],$_POST['nombre'],$_POST['email'],$_POST['clave'],$_POST['permiso_pagos']);
    echo json_encode($result);
}

function delete_admin(){
    $result = Admin::delete_admin($_POST['id']);
    echo json_encode($result);
}

function get_settings()
{
    $result = Dato::get_datos();
    echo json_encode($result);
}

function salvar_configuracion()
{
    $result = Dato::save_datos($_POST['datos']);
    echo json_encode($result);
}

//************** DATOS ********************

function update_dato(){
    $result = Dato::actualizar_dato($_POST['codigo'],$_POST['valor']);
    echo json_encode($result);
}

//************** CANTINA ********************

function get_ultimos_turnos(){
    $result = TurnoCantina::get_ultimos();
    echo json_encode($result);
}

function get_retiros_cantina(){
    $result = RetiroCantina::get_retiros();
    echo json_encode($result);
}

function get_ultimas_transacciones_cantina(){
    $result = TransaccionCantina::get_ultimas_transacciones();
    echo json_encode($result);
}

function get_transacciones_cantina_turno(){
    $result = TransaccionCantina::get_transacciones_turno($_POST['id']);
    echo json_encode($result);
}

function abrir_turno_cantina(){
    $result = TurnoCantina::abrir(
        $_POST['encargado'],
        $_POST['tags'],
        $_POST['inicio'],
        $_POST['caja_inicio']);
    echo json_encode($result);
}

function transaccion_ingresar_gasto()
{
    $resultTransaction = TransaccionCantina::ingresar_transaction_gasto(
        $_POST['id_turno'],
        $_POST['fecha_pago'],
        $_POST['razon'],
        $_POST['valor'],
        $_POST['valorTransaccion'],
        $_POST['rubro'],
        $_POST['notas']
    );

    echo json_encode($resultTransaction);
}

function transaccion_ingresar_pago()
{
    $resultTransaction = TransaccionCantina::ingresar_transaction_pago(
        $_POST['id_turno'],
        $_POST['fecha_pago'],
        $_POST['razon'],
        $_POST['valor'],
        $_POST['id_socio'],
        $_POST['tipo'],
        $_POST['notas'],
        $_POST['descuento_json'],
        $_POST['descuento']
    );

    echo json_encode($resultTransaction);
}

function get_total_caja_cantina(){
    $resultTransacciones = TransaccionCantina::get_total_transacciones();
    $resultIntercaja = TransactionIntercaja::get_total_para_caja("Cantina");
    echo json_encode($resultTransacciones + $resultIntercaja);
}

function get_saldo_turno_cantina(){
    $result = TransaccionCantina::get_saldo_turno($_POST['id']);
    echo json_encode($result);
}

function cerrar_turno_cantina(){
    $result = TurnoCantina::cerrar(
        $_POST['id'],
        $_POST['fin'],
        $_POST['caja_fin'],
        $_POST['notas']);
    echo json_encode($result);
}

function cancel_transaction_cantina(){
    $result = TransaccionCantina::cancel_transaction_cantina(
        $_POST['id'], 
        $_POST['id_gasto'], 
        $_POST['id_pago']
    );
    echo json_encode($result);
}

function get_gastos_transactions_cantina(){
    $result = Gasto::get_gastos_transactions_cantina();
    echo json_encode($result);
}

function get_gastos_transactions_banco(){
    $result = Gasto::get_gastos_transactions_banco();
    echo json_encode($result);
}

function get_pagos_transactions_cantina(){
    $result = Pago::get_pagos_transactions_cantina();
    echo json_encode($result);
}

function get_pagos_transactions_banco(){
    $result = Pago::get_pagos_transactions_banco();
    echo json_encode($result);
}

function ingresar_cantina_retiro()
{
    $resultTransaction = RetiroCantina::ingresar_retiro_cantina(
        $_POST['valor'],
        $_POST['fecha'],
        $_POST['responsable']
    );

    echo json_encode($resultTransaction);
}

//************** BANCO ********************

function get_ultimas_transacciones_banco(){
    $result = TransaccionBanco::get_ultimas_transacciones();
    echo json_encode($result);
}

function identificar_transaccion_banco()
{
    $resultTransaction = TransaccionBanco::identificar(
        $_POST['id_transaccion'],
        $_POST['id_socio'],
        $_POST['id_suscripcion_socio'],
        $_POST['valor'],
        $_POST['razon'],
        $_POST['rubro'],
        $_POST['notas'],
        $_POST['descuento'],
        $_POST['descuento_razon']
    );

    echo json_encode($resultTransaction);
}

function transaccion_identificar_intercaja()
{
    $resultTransaction = TransaccionBanco::identificar_intercaja(
        $_POST['id_transaccion'],
        $_POST['caja']
    );

    echo json_encode($resultTransaction);
}

function identificar_transaccion_banco_split()
{
    $resultTransaction = TransaccionBanco::identificar_split(
        $_POST['id_transaccion'],
        $_POST['id_socio'],
        $_POST['id_suscripcion_socio'],
        $_POST['valor'],
        $_POST['razon'],
        $_POST['rubro'],
        $_POST['notas'],
        $_POST['descuento'],
        $_POST['descuento_razon']
    );

    echo json_encode($resultTransaction);
}

function get_total_caja_banco()
{
    $originalBalance = 0;
    if(Dato::dato_exists('caja_banco_balance_original'))
    {
        $originalBalance = Dato::get_dato("caja_banco_balance_original")->valor;
    }
    
    $resultTransacciones = TransaccionBanco::get_total_transacciones();
    //$resultIntercaja = TransactionIntercaja::get_total_para_caja("BROU");
    echo json_encode($resultTransacciones + $originalBalance);
}

function get_transacciones_banco_splits(){
    $result = TransaccionBancoSplit::get_transaction_splits();
    echo json_encode($result);
}

//************** CAJAS ********************

function get_transactions_caja(){
    $result = TransactionIntercaja::get_transactions_caja($_POST['caja']);
    echo json_encode($result);
}

function ingresar_transaction_caja()
{
    $result = TransactionIntercaja::ingresar_transaction(
        $_POST['valor'],
        $_POST['fecha'],
        $_POST['caja_origen'],
        $_POST['caja_destino']
    );
    echo json_encode($result);
}

//************** EXPORTAR ********************

function exportar_pagos_por_socio(){
    Exportar::exportar_pagos_por_socio();
}
function exportar_caja(){
    Exportar::exportar_caja();
}
function exportar_pago_total_por_socio(){
    Exportar::exportar_pago_total_por_socio();
}
function exportar_pagos_por_mes(){
    Exportar::exportar_pagos_por_mes();
}
function exportar_pagos_por_mes_acotado(){
    Exportar::exportar_pagos_por_mes_acotado();
}
function exportar_socios_activos(){
    Exportar::exportar_socios_activos();
}
function exportar_deudas(){
    Exportar::exportar_deudas();
}

function exportar_descuentos_por_socio(){
    Exportar::exportar_descuentos_por_socio();
}

function exportar_socios_ingresos_egresos(){
    Exportar::exportar_socios_ingresos_egresos();
}



//************** PROC ********************

//auth
if(Auth::access_level()>=0){

	if($_POST["func"]){
		call_user_func($_POST["func"]);
	}else{
        if($_GET["exportar"]){
            call_user_func($_GET["exportar"]);
        }
    }
}else{
	if($_POST["func"]){
		if($_POST["func"] == 'login'){
			login();
		}
	}
}
