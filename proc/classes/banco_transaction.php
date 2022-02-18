<?php

require_once(dirname(__FILE__) . '/auth.php');
require_once(dirname(__FILE__) . '/dato.php');
require_once(dirname(__FILE__) . '/pago.php');
require_once(dirname(__FILE__) . '/caja.php');
require_once(dirname(__FILE__) . '/banco_transaction_split.php');
require_once(dirname(__FILE__) . '/transaction_entre_cajas.php');

Auth::connect();

class TransaccionBanco
{

    public $fecha_pago;
    public $id;
    public $id_pago;
    public $id_intercaja;
    public $valor;
    public $documento;
    public $descripcion;
    public $asunto;
    public $is_split;

    function __construct($id, $fecha_pago, $id_pago, $valor, $documento, $descripcion, $asunto, $is_split, $id_intercaja)
    {
        $this->id = $id;
        $this->id_pago = $id_pago;
        $this->fecha_pago = $fecha_pago;
        $this->valor = $valor;
        $this->documento = $documento;
        $this->descripcion = $descripcion;
        $this->asunto = $asunto;
        $this->is_split = $is_split;
        $this->id_intercaja = $id_intercaja;
    }

    static private function mysqli_to_instances($result)
    {
        $return = array();
        if ($result) {
            while ($row = mysqli_fetch_array($result)) {
                $instance = new TransaccionBanco(
                    $row['id'],
                    $row['fecha_pago'],
                    $row['id_pago'],
                    $row['valor'], 
                    $row['documento'],
                    $row['descripcion'],
                    $row['asunto'],
                    $row['is_split'],
                    $row['id_intercaja']);
                $return[] = $instance;
            }
        }
        return $return;
    }

    static public function get_transaction($id)
    {
        $q = mysqli_query(Auth::$mysqli, "SELECT * FROM banco_transaction WHERE id=" . $id);
        $result = TransaccionBanco::mysqli_to_instances($q);
        if (count($result) == 1) {
            return $result[0];
        } else {
            return array("error" => "Transaccion no encontrada");
        }
    }

    static public function get_transaction_by_pago($id_pago)
    {
        $q = mysqli_query(Auth::$mysqli, "SELECT * FROM banco_transaction WHERE id_pago > 0 AND id_pago=" . $id_pago);
        $result = TransaccionBanco::mysqli_to_instances($q);
        if (count($result) == 1) {
            return $result[0];
        } else {
            return array("error" => "Transaccion no encontrada");
        }
    }

    static public function get_transaction_by_intercaja($id_intercaja)
    {
        $q = mysqli_query(Auth::$mysqli, "SELECT * FROM banco_transaction WHERE id_intercaja > 0 AND id_intercaja=" . $id_intercaja);
        $result = TransaccionBanco::mysqli_to_instances($q);
        if (count($result) == 1) {
            return $result[0];
        } else {
            return array("error" => "Transaccion no encontrada");
        }
    }

    static public function get_ultimas_transacciones()
    {
        $q = mysqli_query(Auth::$mysqli, "SELECT * FROM banco_transaction ORDER BY fecha_pago DESC");
        return TransaccionBanco::mysqli_to_instances($q);
    }

    static public function get_total_transacciones()
    {
        $q = mysqli_query(Auth::$mysqli, "SELECT SUM(valor) AS total FROM banco_transaction");
        $row = mysqli_fetch_array($q);
        $totalTransacciones = $row['total'];
        if($totalTransacciones == null){
            $totalTransacciones = 0;
        }

        return $totalTransacciones;
    }

    static public function isTransactionPago($id_pago)
    {
        $q = mysqli_query(Auth::$mysqli, "SELECT * FROM banco_transaction WHERE id_pago > 0 AND id_pago=" . $id_pago);
        $result = TransaccionBanco::mysqli_to_instances($q);
        if (count($result) == 1) {
            return true;
        } else {
            return false;
        }
    }

    static public function isTransactionIntercaja($id_intercaja)
    {
        $q = mysqli_query(Auth::$mysqli, "SELECT * FROM banco_transaction WHERE id_intercaja > 0 AND id_intercaja=" . $id_intercaja);
        $result = TransaccionBanco::mysqli_to_instances($q);
        if (count($result) == 1) {
            return true;
        } else {
            return false;
        }
    }

    static public function transaction_already_exists($fecha_pago, $valor, $documento, $descripcion, $asunto)
    {
        $valor = number_format($valor, 2, '.', '');

        $q = mysqli_query(Auth::$mysqli, "SELECT * FROM banco_transaction WHERE "
            . 'fecha_pago="' . $fecha_pago . '" '
            . 'AND valor=' . $valor . ' '
            . 'AND documento="' . $documento . '" '
            . 'AND descripcion="' . $descripcion . '" '
            . 'AND asunto="' . $asunto . '"');

        $result = TransaccionBanco::mysqli_to_instances($q);
        if (count($result) == 1) {
            return true;
        } else {
            return false;
        }
    }

    static public function ingresar_transaction($fecha_pago, $valor, $documento, $descripcion, $asunto)
    {
        if(Dato::dato_exists('caja_banco_fecha_comienzo'))
        {
            $fecha_comienzo_restriccion = Dato::get_dato("caja_banco_fecha_comienzo")->valor;

            if(strtotime($fecha_pago)<=strtotime($fecha_comienzo_restriccion))
            {
                return array("error" => "Transacción ignorada por restricción de fecha.");
            }
        }

        if(TransaccionBanco::transaction_already_exists($fecha_pago, $valor, $documento, $descripcion, $asunto))
        {
            return array("error" => "duplicada");
        } else {
            $q = mysqli_query(Auth::$mysqli, "INSERT INTO banco_transaction (fecha_pago, valor, documento, descripcion, asunto) VALUES (" 
                . "'" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $fecha_pago)) . "', " 
                . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $valor)) . ", " 
                . "'" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $documento)) . "', " 
                . "'" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $descripcion)) . "', " 
                . "'" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $asunto)) . "'"
                . ")");

            if ($q && mysqli_affected_rows(Auth::$mysqli) == 1) {
                return mysqli_insert_id(Auth::$mysqli);
            } else {
                return array("error" => "Error al ingresar transaccion con los valores: " . $fecha_pago . " " . $valor . " " . $documento . " " . $descripcion . " " . $asunto);
            }
        }
    }

    static public function identificar($id_transaccion, $id_socio, $id_suscripcion_socio, $valor, $razon, $rubro, $notas, $descuento, $descuento_razon)
    {
        $transaction = TransaccionBanco::get_transaction($id_transaccion);
        if (Dato::verificar_movimiento_caja($transaction->fecha_pago) !== true)
        {
            return array("error" => "Caja cerrada! No se pueden alterar movimientos de esta fecha.");
        }

        mysqli_query(Auth::$mysqli, "SET autocommit=0");
        mysqli_query(Auth::$mysqli, "BEGIN");

        $resultPago = Pago::ingresar_pago(
            $id_socio, 
            $id_suscripcion_socio, 
            $valor, 
            $razon, 
            $transaction->fecha_pago, 
            $notas, 
            $descuento, 
            $descuento_razon,
            $rubro
        );
    
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
            return array("error" => "Error al actualizar transaccion: no se guardó el pago");
        }

        $q = mysqli_query(Auth::$mysqli, "UPDATE banco_transaction SET id_pago=" . $resultPago . ' WHERE id=' . $transaction->id);

        if ($q && mysqli_affected_rows(Auth::$mysqli) == 1) {
            mysqli_query(Auth::$mysqli, "COMMIT");
            mysqli_query(Auth::$mysqli, "SET autocommit=1");
            return $resultPago;
        } else {
            mysqli_query(Auth::$mysqli, "ROLLBACK");
            mysqli_query(Auth::$mysqli, "SET autocommit=1");
            return array("error" => "Error al actualizar transaccion");
        }
    }

    static public function identificar_split($id_transaccion, $id_socio, $id_suscripcion_socio, $valor, $razon, $rubro, $notas, $descuento, $descuento_razon)
    {
        $transaction = TransaccionBanco::get_transaction($id_transaccion);
        if (Dato::verificar_movimiento_caja($transaction->fecha_pago) !== true)
        {
            return array("error" => "Caja cerrada! No se pueden alterar movimientos de esta fecha.");
        }

        mysqli_query(Auth::$mysqli, "SET autocommit=0");
        mysqli_query(Auth::$mysqli, "BEGIN");

        $resultPago = Pago::ingresar_pago(
            $id_socio, 
            $id_suscripcion_socio, 
            $valor, 
            $razon, 
            $transaction->fecha_pago, 
            $notas, 
            $descuento, 
            $descuento_razon,
            $rubro
        );
    
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
            return array("error" => "Error al actualizar transaccion: no se guardó el pago");
        }

        $resultSplit = TransaccionBancoSplit::ingresar_split(
            $id_transaccion, 
            $valor, 
            $resultPago
        );

        if(isset($resultSplit["error"]))
        {
            mysqli_query(Auth::$mysqli, "ROLLBACK");
            mysqli_query(Auth::$mysqli, "SET autocommit=1");
            return $resultSplit;
        }

        if(!isset($resultSplit))
        {
            mysqli_query(Auth::$mysqli, "ROLLBACK");
            mysqli_query(Auth::$mysqli, "SET autocommit=1");
            return array("error" => "Error al actualizar transaccion: no se guardó el split");
        }

        if($transaction->is_split == false)
        {
            $q = mysqli_query(Auth::$mysqli, "UPDATE banco_transaction SET is_split=1 WHERE id=" . $transaction->id);

            if (!$q || mysqli_affected_rows(Auth::$mysqli) != 1) 
            {
                mysqli_query(Auth::$mysqli, "ROLLBACK");
                mysqli_query(Auth::$mysqli, "SET autocommit=1");
                return array("error" => "Error al actualizar transaccion");
            }
        } 

        mysqli_query(Auth::$mysqli, "COMMIT");
        mysqli_query(Auth::$mysqli, "SET autocommit=1");
        return $resultPago;
    }

    static public function identificar_intercaja($id_transaccion, $caja)
    {
        $transaction = TransaccionBanco::get_transaction($id_transaccion);
        if (Dato::verificar_movimiento_caja($transaction->fecha_pago) !== true)
        {
            return array("error" => "Caja cerrada! No se pueden alterar movimientos de esta fecha.");
        }

        mysqli_query(Auth::$mysqli, "SET autocommit=0");
        mysqli_query(Auth::$mysqli, "BEGIN");

        $caja_origen = Caja::BROU;
        $caja_destino = $caja;

        $resultIntercaja = TransactionIntercaja::ingresar_transaction(
            $transaction->valor,
            $transaction->fecha_pago,
            $caja_origen,
            $caja_destino
        );
    
        if(isset($resultIntercaja["error"]))
        {
            mysqli_query(Auth::$mysqli, "ROLLBACK");
            mysqli_query(Auth::$mysqli, "SET autocommit=1");
            return $resultIntercaja;
        }

        if(!isset($resultIntercaja))
        {
            mysqli_query(Auth::$mysqli, "ROLLBACK");
            mysqli_query(Auth::$mysqli, "SET autocommit=1");
            return array("error" => "Error al actualizar transaccion: no se guardó el intercaja");
        }

        $q = mysqli_query(Auth::$mysqli, "UPDATE banco_transaction SET id_intercaja=" . $resultIntercaja . ' WHERE id=' . $transaction->id);

        if ($q && mysqli_affected_rows(Auth::$mysqli) == 1) {
            mysqli_query(Auth::$mysqli, "COMMIT");
            mysqli_query(Auth::$mysqli, "SET autocommit=1");
            return $resultIntercaja;
        } else {
            mysqli_query(Auth::$mysqli, "ROLLBACK");
            mysqli_query(Auth::$mysqli, "SET autocommit=1");
            return array("error" => "Error al actualizar transaccion");
        }
    }

    public function remove_pago()
    {
        $q = mysqli_query(Auth::$mysqli, "UPDATE banco_transaction SET id_pago=NULL WHERE id=" . $this->id);

        if ($q && mysqli_affected_rows(Auth::$mysqli) == 1) 
        {
            return true;
        } else {
            return array("error" => "Error al actualizar transaccion");
        }
    }

    public function remove_intercaja()
    {
        $q = mysqli_query(Auth::$mysqli, "UPDATE banco_transaction SET id_intercaja=NULL WHERE id=" . $this->id);

        if ($q && mysqli_affected_rows(Auth::$mysqli) == 1) 
        {
            return true;
        } else {
            return array("error" => "Error al actualizar transaccion");
        }
    }

    public static function mark_transaction_unsplitted($id)
    {
        $q = mysqli_query(Auth::$mysqli, "UPDATE banco_transaction SET is_split=0 WHERE id=" . $id);

        if ($q && mysqli_affected_rows(Auth::$mysqli) == 1) 
        {
            return true;
        } else {
            return array("error" => "Error al actualizar transaccion");
        }
    }
}
