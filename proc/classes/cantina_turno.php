<?php

require_once(dirname(__FILE__) . '/auth.php');
require_once(dirname(__FILE__) . '/log.php');

Auth::connect();

class TurnoCantina
{

    public $inicio;
    public $fin;
    public $id;
    public $encargado;
    public $tags;
    public $activo;
    public $caja_fin;
    public $notas;
    public $caja_inicio;

    function __construct($inicio, $fin, $id, $encargado, $tags, $activo, $caja_fin, $notas, $caja_inicio)
    {
        $this->id = $id;
        $this->inicio = $inicio;
        $this->fin = $fin;
        $this->encargado = $encargado;
        $this->tags = $tags;
        $this->activo = $activo;
        $this->notas = $notas;
        $this->caja_fin = $caja_fin;
        $this->caja_inicio = $caja_inicio;
    }

    static private function mysqli_to_instances($result)
    {
        $return = array();
        if ($result) {
            while ($row = mysqli_fetch_array($result)) {
                $tags = explode(",", $row['tags']);
                $instance = new TurnoCantina($row['inicio'], $row['fin'], $row['id'], $row['encargado'],
                $tags, $row['activo'], $row['caja_fin'], $row['notas'], $row['caja_inicio']);
                $return[] = $instance;
            }
        }
        return $return;
    }

    static public function get_ultimos()
    {
        $q = mysqli_query(Auth::$mysqli, "SELECT * FROM cantina_turnos ORDER BY id DESC");
        return TurnoCantina::mysqli_to_instances($q);
    }

    static public function get_turno($id)
    {
        $q = mysqli_query(Auth::$mysqli, "SELECT * FROM cantina_turnos WHERE id = " . $id);
        $result = TurnoCantina::mysqli_to_instances($q);
        if(count($result) == 0){
            return null;
        } else {
            return $result[0];
        }
    }

    static public function abrir($encargado, $tags, $inicio, $caja_inicio)
    {
        if(TurnoCantina::get_current() === null){
            $q = mysqli_query(Auth::$mysqli, "INSERT INTO cantina_turnos (id, encargado, tags, inicio, activo, caja_inicio) VALUES (" .
            "null, "
            . "'". htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $encargado)) . "', " 
            . "'". htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $tags)) . "', "
            . "'". htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $inicio)) . "', "
            . "1, "
            . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $caja_inicio))
            . ")");

            if (mysqli_affected_rows(Auth::$mysqli) == 1) {
                return TurnoCantina::get_turno(mysqli_insert_id(Auth::$mysqli));
            } else {
                return array("error" => "Error al abrir turno");
            }
        } else{
            return array("error" => "Ya hay un turno abierto");
        }
    }

    static public function cerrar($id, $fin, $caja_fin, $notas)
    {
        $q = mysqli_query(Auth::$mysqli, "UPDATE cantina_turnos SET "
        . "activo=0,"
        . "fin='" . $fin . "',"
        . "caja_fin=" . $caja_fin . ","
        . "notas='" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $notas)) . "'"
        . " WHERE id=" . $id);

        if (mysqli_affected_rows(Auth::$mysqli) == 1) {
            return true;
        } else {
            return array("error" => "Error al cerrar turno");
        }
    }

    static public function get_current()
    {
        $q = mysqli_query(Auth::$mysqli, "SELECT * FROM cantina_turnos WHERE activo=1");
        $result = TurnoCantina::mysqli_to_instances($q);
        if(count($result) == 0){
            return null;
        } else {
            echo 3;
            return $result[0];
        }
    }

//     static public function get_socios_activos()
//     {
//         $q = mysqli_query(Auth::$mysqli, "SELECT * FROM socios WHERE activo=1 ORDER BY numero;");
//         return Socio::mysqli_to_instances($q);
//     }

//     static public function get_socios_suspendidos()
//     {
//         $q = mysqli_query(Auth::$mysqli, "SELECT * FROM socios WHERE activo=0 ORDER BY numero;");
//         return Socio::mysqli_to_instances($q);
//     }

//     static public function get_socio($id)
//     {
//         $q = mysqli_query(Auth::$mysqli, "SELECT * FROM socios WHERE id = " . $id . ";");
//         $result = Socio::mysqli_to_instances($q);
//         if (count($result) == 1) {
//             return $result[0];
//         } else {
//             return array("error" => "Socio no encontrado");
//         }
//     }

//     static public function get_socio_hash($hash)
//     {
//         $q = mysqli_query(Auth::$mysqli, "SELECT * FROM socios WHERE hash = '" . $hash . "';");
//         $result = Socio::mysqli_to_instances($q);
//         if (count($result) == 1) {
//             return $result[0];
//         } else {
//             return array("error" => "SELECT * FROM socios WHERE hash = '" . $hash . "';");
//         }
//     }

//     static public function get_tags()
//     {
//         $q = mysqli_query(Auth::$mysqli, "SELECT * FROM tags ORDER BY id;");
//         $return = array();
//         while ($row = mysqli_fetch_array($q)) {
//             $return[] = array("id" => $row['id'], "nombre" => $row['nombre'], "color" => $row['color']);
//         }
//         return $return;
//     }

//     static public function create_socio($numero, $nombre, $documento, $email, $fecha_inicio, $tags, $telefono, $observaciones, $fecha_nacimiento)
//     {

//         //check number
//         $q = mysqli_query(Auth::$mysqli, "SELECT * FROM socios WHERE numero=" . $numero);
//         $sociosIgualNumero = Socio::mysqli_to_instances($q);
//         if ($sociosIgualNumero && count($sociosIgualNumero) > 0) {
//             return array("error" => "Numero de socio ya existente");
//         }

//         $tagString = "";
//         for ($i = 0; $i < count($tags); $i++) {
//             $tagString .= $tags[$i] . ",";
//         }
//         $tagString = rtrim($tagString, ",");

// //        echo "INSERT INTO socios (id, numero, nombre, documento, email, fecha_inicio, tags, telefono, observaciones, fecha_nacimiento) VALUES (" .
// //            "null, " . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $numero)) . ", '" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $nombre)) . "', '" .
// //            htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $documento)) . "', '" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $email)) . "', '" .
// //            htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $fecha_inicio)) . "', '" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $tagString)) . "', '" .
// //            htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $telefono)) . "', '" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $observaciones)) . "', '" .
// //            htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $fecha_nacimiento)) . "');";

//         $q = mysqli_query(Auth::$mysqli, "INSERT INTO socios (id, numero, nombre, documento, email, fecha_inicio, tags, telefono, observaciones, fecha_nacimiento) VALUES (" .
//         "null, " . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $numero)) . ", '" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $nombre)) . "', '" .
//         htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $documento)) . "', '" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $email)) . "', '" .
//         htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $fecha_inicio)) . "', '" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $tagString)) . "', '" .
//         htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $telefono)) . "', '" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $observaciones)) . "', '" .
//         htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $fecha_nacimiento)) . "');");

//         if (mysqli_affected_rows(Auth::$mysqli) == 1) {
//             return mysqli_insert_id(Auth::$mysqli);
//         } else {
//             return array("error" => "Error al crear socio");
//         }
//     }

//     static public function update_socio($id, $numero, $nombre, $documento, $email, $fecha_inicio, $tags, $telefono, $observaciones, $fecha_nacimiento)
//     {

//         //check number
//         $q = mysqli_query(Auth::$mysqli, "SELECT * FROM socios WHERE numero=" . $numero);
//         $sociosIgualNumero = Socio::mysqli_to_instances($q);
//         if (count($sociosIgualNumero) > 1 || (count($sociosIgualNumero) == 1 && $sociosIgualNumero[0]->id != $id)) {
//             return array("error" => "Numero de socio ya existente");
//         }

//         $tagString = "";
//         for ($i = 0; $i < count($tags); $i++) {
//             $tagString .= $tags[$i] . ",";
//         }
//         $tagString = rtrim($tagString, ",");

//         $q = mysqli_query(Auth::$mysqli, "UPDATE socios SET numero=" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $numero)) .
//         ", nombre='" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $nombre)) .
//         "', documento='" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $documento)) .
//         "', email='" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $email)) .
//         "', fecha_inicio='" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $fecha_inicio)) .
//         "', tags='" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $tagString)) .
//         "', telefono='" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $telefono)) .
//         "', fecha_nacimiento='" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $fecha_nacimiento)) .
//         "', observaciones='" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $observaciones)) . "' WHERE id=" . $id);

// //        echo "UPDATE socios SET numero=" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $numero)) .
// //            ", nombre='" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $nombre)) .
// //            "', documento='" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $documento)) .
// //            "', email='" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $email)) .
// //            "', fecha_inicio='" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $fecha_inicio)) .
// //            "', tags='" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $tagString)) .
// //            "', telefono='" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $telefono)) .
// //            "', fecha_nacimiento='" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $fecha_nacimiento)) .
// //            "', observaciones='" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $observaciones)) . "' WHERE id=" . $id;

//         if (mysqli_affected_rows(Auth::$mysqli) == 1) {
//             Log::log("Editar Socio", "Socio #" . $id . " " . $nombre . " editado");
//             return $id;
//         } else {
//             return array("error" => "Error al editar socio");
//         }
//     }

//     static public function update_estado_socio($id,$estado)
//     {
//         $q = mysqli_query(Auth::$mysqli, "UPDATE socios SET activo=" . $estado . " WHERE id=" . $id);

//         if (mysqli_affected_rows(Auth::$mysqli) == 1) {
//             return true;
//         }else{
//             return array("error" => "Socio no actualizado");
//         }
//     }

//     static public function eliminar_socio($id)
//     {
//         //check si no tiene pagos
//         $q = mysqli_query(Auth::$mysqli, "SELECT * FROM pagos WHERE id_socio=" . $id . " AND cancelado=0");
//         if(mysqli_num_rows($q) > 0){
//             return array("error" => "Imposible eliminar, socio tiene pagos a su nombre");
//         }else{
//             $q = mysqli_query(Auth::$mysqli, "DELETE FROM socios WHERE id=" . $id);
//         }

//         if (mysqli_affected_rows(Auth::$mysqli) == 1) {
//             return true;
//         }else{
//             return array("error" => "Socio no eliminado");
//         }
//     }

//     static public function get_lista_mails($all,$tags)
//     {
//         if($all == 'true'){
//             $q = mysqli_query(Auth::$mysqli, "SELECT * FROM socios WHERE activo=1");
//         }else{

//             $and = "";
//             if($tags && count($tags) > 0){
//                 $and .= " AND (";
//                 for($i=0;$i<count($tags);$i++){
//                     if($i > 0){
//                         $and .= " OR ";
//                     }
//                     $and .= "tags like '" . $tags[$i] . ",%'";
//                     $and .= " OR tags like '%," . $tags[$i] . ",%'";
//                     $and .= " OR tags like '%," . $tags[$i] . "'";
//                     $and .= " OR tags = '" . $tags[$i] . "'";
//                 }
//                 $and .= ")";
//             }
//             $q = mysqli_query(Auth::$mysqli, "SELECT * FROM socios WHERE activo=1" . $and);
//         }

//         //echo "SELECT * FROM socios WHERE cancelado=0" . $and;
//         return Socio::mysqli_to_instances($q);
//     }
}
