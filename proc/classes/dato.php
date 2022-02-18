<?php

require_once(dirname(__FILE__) . '/auth.php');

Auth::connect();

class Dato {

    public $codigo;
    public $valor;

    function __construct($codigo, $valor) {

        $this->codigo = $codigo;
        $this->valor = $valor;
    }

    static private function mysqli_to_instances($result)
    {
        $return = array();
        if($result){
            while ($row = mysqli_fetch_array($result)) 
            {
                $instance = new Dato($row['codigo'], $row['valor']);
                $return[] = $instance;
            }
        }
        return $return;
    }

    static public function get_dato($codigo)
    {
        $q = mysqli_query(Auth::$mysqli, "SELECT * FROM datos WHERE codigo='".$codigo."'");
        $result = Dato::mysqli_to_instances($q);
        if (count($result) == 1) {
            return $result[0];
        } else {
            return array("error" => "Dato no encontrado");
        }
    }

    static public function dato_exists($codigo)
    {
        $q = mysqli_query(Auth::$mysqli, "SELECT * FROM datos WHERE codigo='".$codigo."'");
        $result = Dato::mysqli_to_instances($q);
        if (count($result) == 1) {
            return true;
        } else {
            return false;
        }
    }

    static public function get_datos()
    {
        $q = mysqli_query(Auth::$mysqli, "SELECT * FROM datos");
        $datos = Dato::mysqli_to_instances($q);
        $indexado = array();
        for($i=0;$i<count($datos);$i++){
            $indexado[$datos[$i]->codigo] = $datos[$i]->valor;
        }
        return $indexado;
    }

    static public function save_datos($datos)
    {
        $gotErrorResponse = false;
        foreach($datos as $key => $value)
        {
            $resultSave = Dato::actualizar_dato($value["codigo"], $value["valor"]);
            // if(is_array($resultSave) && isset($resultSave["error"]))
            // {
            //     $gotErrorResponse = true;
            // }
        }
        if ($gotErrorResponse == false) {
            return array("ok" => true);
        } else {
            return array("error" => "Algunos datos no se salvaron");
        }
    }

    static public function actualizar_dato($codigo, $valor)
    {
        $dato = Dato::get_dato($codigo);
        if(array_key_exists("error",$dato)){
            //dato does not exists
            $q = mysqli_query(Auth::$mysqli, "INSERT INTO datos (codigo, valor) VALUES ("
                . "'" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $codigo)) . "', "
                . "'" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $valor)) . "'"
                . ")");
            if (mysqli_affected_rows(Auth::$mysqli) == 1) {
                return array("ok" => true);
            } else {
                return array("error" => "Dato no modificado");
            }
        }else{
            $q = mysqli_query(Auth::$mysqli, "UPDATE datos SET valor='" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $valor)) . "' WHERE codigo='" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $codigo)) . "'");
            if (mysqli_affected_rows(Auth::$mysqli) == 1) {
                return array("ok" => true);
            } else {
                return array("error" => "Dato no modificado");
            }
        }
    }

    static public function verificar_movimiento_caja($fecha)
    {
        $caja_cerrada = Dato::get_dato("cajacerrada");
        $caja_cerrada = $caja_cerrada->valor;

        if(strtotime($fecha)<=strtotime($caja_cerrada)){
            return false;
        }else{
            return true;
        }
    }
} 