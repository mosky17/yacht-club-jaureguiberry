<?php

require_once(dirname(__FILE__) . '/auth.php');
require_once(dirname(__FILE__) . '/dato.php');
require_once(dirname(__FILE__) . '/cantina_transaction.php');
require_once(dirname(__FILE__) . '/banco_transaction.php');
require_once(dirname(__FILE__) . '/banco_transaction_split.php');

Auth::connect();

class Pago
{
    public $id;
    public $id_socio;
    public $id_suscripcion_socio;
    public $valor;
    public $razon;
    public $fecha_pago;
    public $notas;
    public $cancelado;
    public $descuento;
    public $descuento_razon;
    public $rubro;

    function __construct($id, $id_socio, $id_suscripcion_socio, $valor, $razon, $fecha_pago, $notas, $cancelado, $descuento, $descuento_razon, $rubro)
    {
        $this->id = $id;
        $this->id_socio = $id_socio;
        $this->id_suscripcion_socio = $id_suscripcion_socio;
        $this->valor = $valor;
        $this->razon = $razon;
        $this->fecha_pago = $fecha_pago;
        $this->notas = $notas;
        $this->cancelado = $cancelado;
        $this->descuento = $descuento;
        $this->descuento_razon = $descuento_razon;
        $this->rubro = $rubro;
    }

    static private function mysqli_to_instances($result)
    {
        $return = array();
        if ($result) {
            while ($row = mysqli_fetch_array($result)) {
                $instance = new Pago(
                    $row['id'],
                    $row['id_socio'],
                    $row['id_suscripcion_socio'],
                    $row['valor'],
                    $row['razon'],
                    $row['fecha_pago'],
                    $row['notas'],
                    $row['cancelado'],
                    $row['descuento'],
                    $row['descuento_razon'],
                    $row['rubro']);
                $return[] = $instance;
            }
        }
        return $return;
    }

    static public function get_pago($id)
    {
        $q = mysqli_query(Auth::$mysqli, "SELECT * FROM pagos WHERE id=" . $id);
        $result = Pago::mysqli_to_instances($q);
        if (count($result) == 1) {
            return $result[0];
        } else {
            return array("error" => "Pago no encontrado");
        }
    }

    static public function cancelar_pago_before_transaction($id)
    {
        $pago = Pago::get_pago($id);
        return $pago->cancelar();
    }

    static public function cancelar_pago($id)
    {
        $pago = Pago::get_pago($id);
        if($pago->isTransactionCantina())
        {
            return array("error" => "No se puede cancelar un pago generado desde la Cantina. Cancelarlo desde la sección cantina.");
        } else if($pago->isTransactionBanco())
        { 
            mysqli_query(Auth::$mysqli, "SET autocommit=0");
            mysqli_query(Auth::$mysqli, "BEGIN");

            $transaction = TransaccionBanco::get_transaction_by_pago($id);

            $resultTransactionUpdate = $transaction->remove_pago();

            if ($resultTransactionUpdate !== true) 
            {
                mysqli_query(Auth::$mysqli, "ROLLBACK");
                mysqli_query(Auth::$mysqli, "SET autocommit=1");
                return $resultTransactionUpdate;
            }

            $resultPago = $pago->cancelar();

            if($resultPago === true)
            {
                mysqli_query(Auth::$mysqli, "COMMIT");
                mysqli_query(Auth::$mysqli, "SET autocommit=1");
                return true;
            } else{
                mysqli_query(Auth::$mysqli, "ROLLBACK");
                mysqli_query(Auth::$mysqli, "SET autocommit=1");
                return $resultPago;
            }
            
        } else if($pago->isTransactionBancoSplit())
        { 
            mysqli_query(Auth::$mysqli, "SET autocommit=0");
            mysqli_query(Auth::$mysqli, "BEGIN");

            $transactionSplit = TransaccionBancoSplit::get_transaction_split_by_pago($id);
            $transactionSplitParentId = $transactionSplit->id_transaction;

            $resultTransactionSplitRemove = $transactionSplit->remove();

            if ($resultTransactionSplitRemove !== true) 
            {
                mysqli_query(Auth::$mysqli, "ROLLBACK");
                mysqli_query(Auth::$mysqli, "SET autocommit=1");
                return $resultTransactionSplitRemove;
            }

            if(count(TransaccionBancoSplit::get_transaction_splits_by_parent_id($transactionSplitParentId)) == 0)
            {
                $resultTransactionMarkUnsplitted = TransaccionBanco::mark_transaction_unsplitted($transactionSplitParentId);

                if ($resultTransactionMarkUnsplitted !== true) 
                {
                    mysqli_query(Auth::$mysqli, "ROLLBACK");
                    mysqli_query(Auth::$mysqli, "SET autocommit=1");
                    return $resultTransactionMarkUnsplitted;
                }
            }

            $resultPago = $pago->cancelar();

            if($resultPago === true)
            {
                mysqli_query(Auth::$mysqli, "COMMIT");
                mysqli_query(Auth::$mysqli, "SET autocommit=1");
                return true;
            } else{
                mysqli_query(Auth::$mysqli, "ROLLBACK");
                mysqli_query(Auth::$mysqli, "SET autocommit=1");
                return array("error" => "Error al cancelar transaccion");
            }
        }else {
            return $pago->cancelar();
        }
    }

    private function isTransactionCantina()
    {
        return TransaccionCantina::isTransactionPago($this->id);
    }

    private function isTransactionBanco()
    {
        return TransaccionBanco::isTransactionPago($this->id);
    }

    private function isTransactionBancoSplit()
    {
        return TransaccionBancoSplit::isTransactionPago($this->id);
    }

    private function cancelar()
    {
        if(Dato::verificar_movimiento_caja($this->fecha_pago) !== true){
            return array("error" => "Caja cerrada! No se pueden alterar movimientos de esta fecha.");
        }

        $q = mysqli_query(Auth::$mysqli, "UPDATE pagos SET cancelado=1 WHERE id=".$this->id);
        if (mysqli_affected_rows(Auth::$mysqli) == 1) {
            return true;
        } else {
            return array("error" => "Pago no cancelado");
        }
    }

    static public function salvar_pago_modificar($id, $razon, $descuento, $descuento_json, $notas, $fecha_pago, $id_socio)
    {
        $pago = Pago::get_pago($id);
        if (Dato::verificar_movimiento_caja($pago->fecha_pago) !== true) {
            return array("error" => "Caja cerrada! No se pueden alterar movimientos de esta fecha.");
        }

        $q = mysqli_query(Auth::$mysqli, "UPDATE pagos SET "
            . "razon='" . $razon . "', "
            . "descuento='" . $descuento . "', "
            . "notas='" . $notas . "', "
            . "fecha_pago='" . $fecha_pago . "', "
            . "id_socio=" . $id_socio . ", "
            . "descuento_json='" . $descuento_json . "' "
            . "WHERE id=" . $id);

        if (mysqli_affected_rows(Auth::$mysqli) == 1) {
            return true;
        } else {
            return array("error" => "Pago no modificado");
        }
    }

    static public function get_pagos_socio($id_socio)
    {
        $q = mysqli_query(Auth::$mysqli, "SELECT * FROM pagos WHERE id_socio=" . $id_socio . " AND cancelado=0 ORDER BY fecha_pago DESC");
        return Pago::mysqli_to_instances($q);
    }

    static public function get_pagos_suscripciones_socios()
    {
        $q = mysqli_query(Auth::$mysqli, "SELECT * FROM pagos WHERE id_suscripcion_socio IS NOT NULL AND cancelado=0");
        return Pago::mysqli_to_instances($q);
    }

    static public function get_lista_pagos()
    {
        $q = mysqli_query(Auth::$mysqli, "SELECT * FROM pagos WHERE cancelado=0 ORDER BY fecha_pago DESC");
        return Pago::mysqli_to_instances($q);
    }

    static public function get_lista_pagos_con_cancelados()
    {
        $q = mysqli_query(Auth::$mysqli, "SELECT * FROM pagos ORDER BY fecha_pago");
        return Pago::mysqli_to_instances($q);
    }

    static public function ingresar_pago($id_socio, $id_suscripcion_socio, $valor, $razon, $fecha_pago, $notas, $descuento, $descuento_razon, $rubro)
    {
        if (Dato::verificar_movimiento_caja($fecha_pago) !== true) {
            return array("error" => "Caja cerrada! No se pueden ingresar movimientos en esta fecha");
        }

        if($id_socio != null && !empty($id_socio)){
            $id_socio = htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $id_socio));
        }else{
            $id_socio = 'NULL';
        }

        if($id_suscripcion_socio != null && !empty($id_suscripcion_socio)){
            $id_suscripcion_socio = htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $id_suscripcion_socio));
        }else{
            $id_suscripcion_socio = 'NULL';
        }

        if($notas != null && !empty($notas)){
            $notas = "'" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $notas)) . "'";
        }else{
            $notas = 'NULL';
        }

        if($descuento != null && !empty($descuento)){
            $descuento = htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $descuento));
        }else{
            $descuento = 'NULL';
        }

        if($descuento_razon != null && !empty($descuento_razon)){
            $descuento_razon = "'" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $descuento_razon)) . "'";
        }else{
            $descuento_razon = 'NULL';
        }

        if($rubro != null && !empty($rubro)){
            $rubro = "'" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $rubro)) . "'";
        }else{
            $rubro = 'NULL';
        }

        $q = mysqli_query(Auth::$mysqli, "INSERT INTO pagos (id_socio, id_suscripcion_socio, valor, razon, fecha_pago, notas, descuento, descuento_razon, rubro) VALUES (" .
            $id_socio . ", " .
            $id_suscripcion_socio . ", " .
            "'" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $valor)) . "', " .
            "'" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $razon)) . "', " .
            "'" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $fecha_pago)) . "', " .
            $notas . ", " .
            $descuento . ", " .
            $descuento_razon . ", " .
            $rubro .
            ")");

        // echo "INSERT INTO pagos (id_socio, id_suscripcion_socio, valor, razon, fecha_pago, notas, descuento, descuento_razon, rubro) VALUES (" .
        // $id_socio . ", " .
        // $id_suscripcion_socio . ", " .
        // "'" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $valor)) . "', " .
        // "'" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $razon)) . "', " .
        // "'" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $fecha_pago)) . "', " .
        // $notas . ", " .
        // $descuento . ", " .
        // $descuento_razon . ", " .
        // $rubro .
        // ")";

        if (mysqli_affected_rows(Auth::$mysqli) == 1) {
            return mysqli_insert_id(Auth::$mysqli);
        } else {
            return array("error" => "Error al ingresar pago");
        }
    }

    static public function get_cuota_costos()
    {
        $result = mysqli_query(Auth::$mysqli, "SELECT * FROM cuota_costo;");
        $cuota_costos = array();
        if ($result) {
            while ($row = mysqli_fetch_array($result)) {
                $cuota_costos[] = array(
                    "id" => $row['id'],
                    "valor" => $row['valor'],
                    "fecha_inicio" => $row['fecha_inicio'],
                    "fecha_fin" => $row['fecha_fin']
                );
            }
        }
        return $cuota_costos;
    }

    static public function delete_cuota_costo($id)
    {
        $q = mysqli_query(Auth::$mysqli, "DELETE FROM cuota_costo WHERE id=" . $id);
        if (mysqli_affected_rows(Auth::$mysqli) == 1) {
            return true;
        } else {
            return array("error" => "Registro no borrado");
        }
    }

    static public function ingresar_cuota_costo($valor, $fecha_inicio, $fecha_fin)
    {

        if (Dato::verificar_movimiento_caja($fecha_fin) !== true) {
            return array("error" => "Caja cerrada! No se pueden ingresar movimientos en esta fecha.");
        }

        $q = mysqli_query(Auth::$mysqli, "INSERT INTO cuota_costo (valor, fecha_inicio, fecha_fin) VALUES (" .
            htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $valor)) . ", '" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $fecha_inicio)) . "', '" .
            htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $fecha_fin)) . "');");

        if (mysqli_affected_rows(Auth::$mysqli) == 1) {
            return true;
        } else {
            return array("error" => "Error al ingresar registro de costo de cuota");
        }
    }

    static public function get_pagos_transactions_cantina()
    {
        $q = mysqli_query(Auth::$mysqli, "SELECT * FROM pagos p WHERE EXISTS (SELECT * FROM cantina_transaction t WHERE p.id = t.id_pago)");
        return Pago::mysqli_to_instances($q);
    }

    static public function get_pagos_transactions_banco()
    {
        $q = mysqli_query(Auth::$mysqli, "SELECT * FROM pagos p WHERE EXISTS (SELECT * FROM banco_transaction t WHERE p.id = t.id_pago)");
        $simpleTransactions = Pago::mysqli_to_instances($q);

        $q = mysqli_query(Auth::$mysqli, "SELECT * FROM pagos p WHERE EXISTS (SELECT * FROM banco_transaction_split t WHERE p.id = t.id_pago)");
        $splitTransactions = Pago::mysqli_to_instances($q);

        return array_merge($simpleTransactions, $splitTransactions);
    }

    static public function get_pagos_suscripciones_socio($id_suscripcion_socio)
    {
        $q = mysqli_query(Auth::$mysqli, "SELECT * FROM pagos WHERE id_suscripcion_socio=" . $id_suscripcion_socio . " AND cancelado=0 ORDER BY fecha_pago DESC");
        return Pago::mysqli_to_instances($q);
    }

    static public function get_lista_pagos_paginated($sort, $page_size, $page)
    {
        $q = mysqli_query(Auth::$mysqli, "SELECT COUNT(*) AS total FROM pagos WHERE cancelado=0");
        $row = mysqli_fetch_array($q);
        $totalTransacciones = $row['total'];
        if($totalTransacciones == null){
            $totalTransacciones = 0;
        }

        $total_pages = ceil($totalTransacciones / $page_size);
        if($page > $total_pages)
        {
            $page = $total_pages;
        }

        $offset = ($page - 1) * $page_size;

        $q = mysqli_query(Auth::$mysqli, "SELECT * FROM pagos WHERE " 
            . "cancelado=0 "
            . "ORDER BY fecha_pago " . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $sort)) . " "
            . "LIMIT " . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $page_size)) . " "
            . "OFFSET " . $offset
        );

        return [
            "page_size" => $page_size,
            "page" => $page,
            "total_pages" => $total_pages,
            "items" => Pago::mysqli_to_instances($q)
        ];
    }

    static public function get_totales(){

        $retorno = array("ingresos_socios"=>0,
                         "otros_ingresos"=>0,
                         "gastos"=>0);

        $q = mysqli_query(Auth::$mysqli, "SELECT * FROM pagos WHERE cancelado=0");
        $pagos = Pago::mysqli_to_instances($q);

        for($i=0;$i<count($pagos);$i++){
            if($pagos[$i]->valor < 0){
                $retorno["gastos"] += $pagos[$i]->valor * -1;
            } 
            else if($pagos[$i]->id_socio != null)
            {
                $retorno["ingresos_socios"] += $pagos[$i]->valor;
            }
            else
            {
                $retorno["otros_ingresos"] += $pagos[$i]->valor;
            }
        }

        return $retorno;
    }
}
