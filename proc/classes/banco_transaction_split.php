<?php

require_once(dirname(__FILE__) . '/auth.php');
require_once(dirname(__FILE__) . '/dato.php');
require_once(dirname(__FILE__) . '/pago.php');

Auth::connect();

class TransaccionBancoSplit
{
    public $id;
    public $id_pago;
    public $id_transaction;
    public $valor;

    function __construct($id, $id_pago, $id_transaction, $valor)
    {
        $this->id = $id;
        $this->id_pago = $id_pago;
        $this->valor = $valor;
        $this->id_transaction = $id_transaction;
    }

    static private function mysqli_to_instances($result)
    {
        $return = array();
        if ($result) {
            while ($row = mysqli_fetch_array($result)) {
                $instance = new TransaccionBancoSplit(
                    $row['id'],
                    $row['id_pago'],
                    $row['id_transaction'],
                    $row['valor']);
                $return[] = $instance;
            }
        }
        return $return;
    }

    static public function get_transaction_splits()
    {
        $q = mysqli_query(Auth::$mysqli, "SELECT * FROM banco_transaction_split");
        return TransaccionBancoSplit::mysqli_to_instances($q);
    }

    static public function get_transaction_splits_by_parent_id($id)
    {
        $q = mysqli_query(Auth::$mysqli, "SELECT * FROM banco_transaction_split WHERE id_transaction=" . $id);
        return TransaccionBancoSplit::mysqli_to_instances($q);
    }

    static public function get_transaction_split_by_pago($id_pago)
    {
        $q = mysqli_query(Auth::$mysqli, "SELECT * FROM banco_transaction_split WHERE id_pago > 0 AND id_pago=" . $id_pago);
        $result = TransaccionBancoSplit::mysqli_to_instances($q);
        if (count($result) == 1) {
            return $result[0];
        } else {
            return array("error" => "Transaccion split no encontrada");
        }
    }

    static public function ingresar_split($id_transaction, $valor, $id_pago)
    {
        $q = mysqli_query(Auth::$mysqli, "INSERT INTO banco_transaction_split (id_transaction, valor, id_pago) VALUES (" 
            . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $id_transaction)) . ", " 
            . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $valor)) . ", "
            . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $id_pago))
            . ")");

        if ($q && mysqli_affected_rows(Auth::$mysqli) == 1) {
            return mysqli_insert_id(Auth::$mysqli);
        } else {
            return array("error" => "Error al ingresar transaccion split");
        }
    }
    
    static public function isTransactionPago($id_pago)
    {
        $q = mysqli_query(Auth::$mysqli, "SELECT * FROM banco_transaction_split WHERE id_pago > 0 AND id_pago=" . $id_pago);
        $result = TransaccionBancoSplit::mysqli_to_instances($q);
        if (count($result) == 1) {
            return true;
        } else {
            return false;
        }
    }

    public function remove()
    {
        $q = mysqli_query(Auth::$mysqli, "DELETE FROM banco_transaction_split WHERE id=" . $this->id);

        if ($q && mysqli_affected_rows(Auth::$mysqli) == 1) 
        {
            return true;
        } else {
            return array("error" => "Error al borrar transaccion split");
        }
    }
}
