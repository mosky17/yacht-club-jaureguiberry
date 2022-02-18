<?php

require_once(dirname(__FILE__) . '/auth.php');
require_once(dirname(__FILE__) . '/dato.php');

Auth::connect();

class TransactionIntercaja
{
    //El valor se aplica sobre caja_origen
    public $id;
    public $fecha;
    public $valor;
    public $caja_origen;
    public $caja_destino;
    public $cancelado;

    function __construct($id, $fecha, $valor, $cancelado, $caja_origen, $caja_destino)
    {
        $this->id = $id;
        $this->fecha = $fecha;
        $this->valor = $valor;
        $this->cancelado = $cancelado;
        $this->caja_origen = $caja_origen;
        $this->caja_destino = $caja_destino;
    }

    static private function mysqli_to_instances($result)
    {
        $return = array();
        if ($result) {
            while ($row = mysqli_fetch_array($result)) {
                $instance = new TransactionIntercaja($row['id'], $row['fecha'], $row['valor'], $row['cancelado'], $row['caja_origen'], $row['caja_destino']);
                $return[] = $instance;
            }
        }
        return $return;
    }

    private function cancelar()
    {
        $q = mysqli_query(Auth::$mysqli, "UPDATE transaction_entre_cajas SET cancelado=1 WHERE id=".$this->id);
        if (mysqli_affected_rows(Auth::$mysqli) == 1) {
            return true;
        } else {
            return array("error" => "Transaccion intercajas no cancelado");
        }
    }

    static public function get_transactions_caja($caja)
    {
        $q = mysqli_query(Auth::$mysqli, 'SELECT * FROM transaction_entre_cajas WHERE cancelado=0 AND (caja_origen="' . $caja . '" OR caja_destino="' . $caja . '") ORDER BY fecha DESC');
        return TransactionIntercaja::mysqli_to_instances($q);
    }

    static public function get_total_para_caja($caja)
    {
        $q = mysqli_query(Auth::$mysqli, 'SELECT SUM(valor) AS total FROM transaction_entre_cajas WHERE cancelado=0 AND caja_origen="' . $caja . '"');
        $row = mysqli_fetch_array($q);
        $totalOrigen = $row['total'];
        if($totalOrigen == null){
            $totalOrigen = 0;
        }

        $q = mysqli_query(Auth::$mysqli, 'SELECT SUM(valor) AS total FROM transaction_entre_cajas WHERE cancelado=0 AND caja_destino="' . $caja . '"');
        $row = mysqli_fetch_array($q);
        $totalDestino = $row['total'];
        if($totalDestino == null){
            $totalDestino = 0;
        }

        return $totalOrigen - $totalDestino;
    }

    static public function ingresar_transaction($valor, $fecha, $caja_origen, $caja_destino)
    {
        $q = mysqli_query(Auth::$mysqli, "INSERT INTO transaction_entre_cajas (valor, fecha, caja_origen, caja_destino) VALUES ("
            . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $valor)) . ", "
            . '"' . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $fecha)) . '", '
            . '"' . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $caja_origen)) . '", '
            . '"' . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $caja_destino)) . '"'
            . ')');

        if (mysqli_affected_rows(Auth::$mysqli) == 1) {
            return mysqli_insert_id(Auth::$mysqli);
        } else {
            return array("error" => "Error al ingresar transaccion intercaja");
        }
    }
}
