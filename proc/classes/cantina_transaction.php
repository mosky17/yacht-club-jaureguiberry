<?php

require_once(dirname(__FILE__) . '/auth.php');
require_once(dirname(__FILE__) . '/dato.php');
require_once(dirname(__FILE__) . '/pago.php');
require_once(dirname(__FILE__) . '/transaction_entre_cajas.php');

Auth::connect();

class TransaccionCantina
{

    public $fecha_pago;
    public $id;
    public $id_turno;
    public $id_gasto;
    public $id_pago;
    public $valor;
    public $cancelado;

    function __construct($id, $id_turno, $fecha_pago, $id_gasto, $id_pago, $valor, $cancelado)
    {

        $this->id = $id;
        $this->id_gasto = $id_gasto;
        $this->id_pago = $id_pago;
        $this->id_turno = $id_turno;
        $this->fecha_pago = $fecha_pago;
        $this->valor = $valor;
        $this->cancelado = $cancelado;
    }

    static private function mysqli_to_instances($result)
    {
        $return = array();
        if ($result) {
            while ($row = mysqli_fetch_array($result)) {
                $instance = new TransaccionCantina(
                    $row['id'],
                    $row['id_turno'],
                    $row['fecha_pago'], 
                    $row['id_gasto'], 
                    $row['id_pago'],
                    $row['valor'],
                    $row['cancelado']);
                $return[] = $instance;
            }
        }
        return $return;
    }

    static public function get_transaction($id)
    {
        $q = mysqli_query(Auth::$mysqli, "SELECT * FROM cantina_transaction WHERE id=" . $id);
        $result = TransaccionCantina::mysqli_to_instances($q);
        if (count($result) == 1) {
            return $result[0];
        } else {
            return array("error" => "Transaccion no encontrada");
        }
    }

    static public function get_ultimas_transacciones()
    {
        $q = mysqli_query(Auth::$mysqli, "SELECT * FROM cantina_transaction ORDER BY fecha_pago DESC LIMIT 50");
        return TransaccionCantina::mysqli_to_instances($q);
    }

    static public function get_transacciones_turno($id)
    {
        $q = mysqli_query(Auth::$mysqli, "SELECT * FROM cantina_transaction WHERE id_turno=" . $id . " ORDER BY fecha_pago ASC");
        return TransaccionCantina::mysqli_to_instances($q);
    }

    static public function get_total_transacciones()
    {
        $q = mysqli_query(Auth::$mysqli, "SELECT SUM(valor) AS total FROM cantina_transaction WHERE cancelado=0");
        $row = mysqli_fetch_array($q);
        $totalTransacciones = $row['total'];
        if($totalTransacciones == null){
            $totalTransacciones = 0;
        }

        return $totalTransacciones;
    }

    static public function get_saldo_turno($id)
    {
        $q = mysqli_query(Auth::$mysqli, "SELECT SUM(valor) AS total FROM cantina_transaction WHERE id_turno=" . $id . " AND cancelado=0");
        $row = mysqli_fetch_array($q);
        if($row['total'] == null){
            return 0;
        }
        return $row['total'];
    }

    static public function isTransactionGasto($id_gasto)
    {
        $q = mysqli_query(Auth::$mysqli, "SELECT * FROM cantina_transaction WHERE id_gasto > 0 AND id_gasto=" . $id_gasto);
        $result = TransaccionCantina::mysqli_to_instances($q);
        if (count($result) == 1) {
            return true;
        } else {
            return false;
        }
    }

    static public function isTransactionPago($id_pago)
    {
        $q = mysqli_query(Auth::$mysqli, "SELECT * FROM cantina_transaction WHERE id_pago > 0 AND id_pago=" . $id_pago);
        $result = TransaccionCantina::mysqli_to_instances($q);
        if (count($result) == 1) {
            return true;
        } else {
            return false;
        }
    }

    static public function cancel_transaction_cantina($id, $id_gasto, $id_pago)
    {
        if(isset($id_gasto) && $id_gasto > 0)
        {
            return TransaccionCantina::cancel_transaction_cantina_gasto($id, $id_gasto);
        } elseif(isset($id_pago) && $id_pago > 0)
        {
            return TransaccionCantina::cancel_transaction_cantina_pago($id, $id_pago);
        } else 
        {
            return array("error" => "No se puede cancelar esta transacción, id no encontrado.");
        }
    }

    static private function cancel_transaction_cantina_gasto($id, $id_gasto)
    {
        mysqli_query(Auth::$mysqli, "SET autocommit=0");
        mysqli_query(Auth::$mysqli, "BEGIN");

        $resultGasto = Gasto::cancelar_gasto_before_transaction($id_gasto);
    
        if(isset($resultGasto["error"]))
        {
            mysqli_query(Auth::$mysqli, "ROLLBACK");
            mysqli_query(Auth::$mysqli, "SET autocommit=1");
            return $resultGasto;
        }

        $transaction = TransaccionCantina::get_transaction($id);
        if (Dato::verificar_movimiento_caja($transaction->fecha_pago) !== true)
        {
            mysqli_query(Auth::$mysqli, "ROLLBACK");
            mysqli_query(Auth::$mysqli, "SET autocommit=1");
            return array("error" => "Caja cerrada! No se pueden alterar movimientos de esta fecha.");
        }

        $q = mysqli_query(Auth::$mysqli, "UPDATE cantina_transaction SET cancelado=1 WHERE id=" . $id);
        if (mysqli_affected_rows(Auth::$mysqli) == 1) 
        {
            mysqli_query(Auth::$mysqli, "COMMIT");
            mysqli_query(Auth::$mysqli, "SET autocommit=1");
            return true;
        } else {
            mysqli_query(Auth::$mysqli, "ROLLBACK");
            mysqli_query(Auth::$mysqli, "SET autocommit=1");
            return array("error" => "Error al cancelar pago");
        }
    }

    static private function cancel_transaction_cantina_pago($id, $id_pago)
    {
        mysqli_query(Auth::$mysqli, "SET autocommit=0");
        mysqli_query(Auth::$mysqli, "BEGIN");

        $resultPago = Pago::cancelar_pago_before_transaction($id_pago);
    
        if(isset($resultPago["error"]))
        {
            mysqli_query(Auth::$mysqli, "ROLLBACK");
            mysqli_query(Auth::$mysqli, "SET autocommit=1");
            return $resultPago;
        }

        $transaction = TransaccionCantina::get_transaction($id);
        if (Dato::verificar_movimiento_caja($transaction->fecha_pago) !== true)
        {
            mysqli_query(Auth::$mysqli, "ROLLBACK");
            mysqli_query(Auth::$mysqli, "SET autocommit=1");
            return array("error" => "Caja cerrada! No se pueden alterar movimientos de esta fecha.");
        }

        $q = mysqli_query(Auth::$mysqli, "UPDATE cantina_transaction SET cancelado=1 WHERE id=" . $id);
        if (mysqli_affected_rows(Auth::$mysqli) == 1) 
        {
            mysqli_query(Auth::$mysqli, "COMMIT");
            mysqli_query(Auth::$mysqli, "SET autocommit=1");
            return true;
        } else {
            mysqli_query(Auth::$mysqli, "ROLLBACK");
            mysqli_query(Auth::$mysqli, "SET autocommit=1");
            return array("error" => "Error al cancelar pago");
        }
    }

    static public function ingresar_transaction_gasto($id_turno, $fecha_pago, $razon, $valorGasto, $valorTransaction, $rubro, $notas)
    {
        mysqli_query(Auth::$mysqli, "SET autocommit=0");
        mysqli_query(Auth::$mysqli, "BEGIN");

        $resultGasto = Gasto::ingresar_gasto(
            $valorGasto,
            $fecha_pago,
            $razon,
            $notas,
            $rubro);
    
        if(isset($resultGasto["error"]))
        {
            mysqli_query(Auth::$mysqli, "ROLLBACK");
            mysqli_query(Auth::$mysqli, "SET autocommit=1");
            return $resultGasto;
        }

        if(!isset($resultGasto))
        {
            mysqli_query(Auth::$mysqli, "ROLLBACK");
            mysqli_query(Auth::$mysqli, "SET autocommit=1");
            return array("error" => "Error al ingresar transaccion: no se guardó el gasto");
        }

        $q = mysqli_query(Auth::$mysqli, "INSERT INTO cantina_transaction (id_turno, fecha_pago, id_gasto, id_pago, valor, cancelado) VALUES (" 
            . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $id_turno)) . ", " 
            . "'" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $fecha_pago)) . "', " 
            . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $resultGasto)) . ", " 
            . "NULL, "
            .htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $valorTransaction)) . ", "
            . "0"
            . ")");

        if ($q && mysqli_affected_rows(Auth::$mysqli) == 1) {
            $transactionId = mysqli_insert_id(Auth::$mysqli);
            mysqli_query(Auth::$mysqli, "COMMIT");
            mysqli_query(Auth::$mysqli, "SET autocommit=1");
            return $transactionId;
        } else {
            mysqli_query(Auth::$mysqli, "ROLLBACK");
            mysqli_query(Auth::$mysqli, "SET autocommit=1");
            return array("error" => "Error al ingresar transaccion");
        }
    }

    static public function ingresar_transaction_pago($id_turno, $fecha_pago, $razon, $valor, $id_socio, $tipo, $notas, $descuento_json, $descuento)
    {
        mysqli_query(Auth::$mysqli, "SET autocommit=0");
        mysqli_query(Auth::$mysqli, "BEGIN");

        $resultPago = Pago::ingresar_pago($id_socio, $valor, $fecha_pago, $razon, $tipo, $notas, $descuento, $descuento_json);
    
        if(isset($resultPago["error"]))
        {
            mysqli_query(Auth::$mysqli, "ROLLBACK");
            mysqli_query(Auth::$mysqli, "SET autocommit=1");
            return $resultPago;
        }

        if(!isset($resultPago))
        {
            mysqli_query(Auth::$mysqli, "ROLLBACK");
            mysqli_query(Auth::$mysqli, "SET autocommit=1");
            return array("error" => "Error al ingresar transaccion: no se guardó el pago");
        }

        $q = mysqli_query(Auth::$mysqli, "INSERT INTO cantina_transaction (id_turno, fecha_pago, id_gasto, id_pago, valor, cancelado) VALUES (" 
            . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $id_turno)) . ", " 
            . "'" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $fecha_pago)) . "', " 
            . "NULL, "
            . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $resultPago)) . ", "
            .htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $valor)) . ", "
            . "0"
            . ")");

        if ($q && mysqli_affected_rows(Auth::$mysqli) == 1) {
            $transactionId = mysqli_insert_id(Auth::$mysqli);
            mysqli_query(Auth::$mysqli, "COMMIT");
            mysqli_query(Auth::$mysqli, "SET autocommit=1");
            return $transactionId;
        } else {
            mysqli_query(Auth::$mysqli, "ROLLBACK");
            mysqli_query(Auth::$mysqli, "SET autocommit=1");
            return array("error" => "Error al ingresar transaccion");
        }
    }
}
