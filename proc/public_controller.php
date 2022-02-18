<?php

//error_reporting(E_ALL);

require_once(dirname(__FILE__).'/classes/socio.php');
require_once(dirname(__FILE__).'/classes/pago.php');
require_once(dirname(__FILE__).'/classes/recordatorio_deuda.php');
require_once(dirname(__FILE__).'/classes/horas_trabajo.php');

function get_tags(){
    $result = Socio::get_tags();
    echo json_encode($result);
}
function get_socio(){
    $result = Socio::get_socio_hash($_POST['hash']);
    echo json_encode($result);
}

//************** PAGO ********************
function get_pagos_socio(){
    $result = Pago::get_pagos_socio($_POST['id_socio']);
    echo json_encode($result);
}
function get_pago(){
    $result = Pago::get_pago($_POST['id']);
    echo json_encode($result);
}

//************** DEUDA ********************

function get_deudas_socio(){
    $result = RecordatorioDeuda::GetDeudasSocio($_POST['id_socio']);
    echo json_encode($result);
}

function get_costos_cuotas(){
    $result = Pago::get_cuota_costos();
    echo json_encode($result);
}

function get_horas_socio(){
    $result = HorasTrabajo::get_horas_socio($_POST['id_socio']);
    echo json_encode($result);
}
//************** PROC ********************

    if($_POST["func"]){
        call_user_func($_POST["func"]);
    }
