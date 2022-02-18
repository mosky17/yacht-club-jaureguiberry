<?php

require_once(dirname(__FILE__) . '/auth.php');
require_once(dirname(__FILE__) . '/log.php');
require_once(dirname(__FILE__) . '/mandrill.php');
require_once(dirname(__FILE__) . '/suscripcion.php');

Auth::connect();

class Socio
{
    const ID_SUSCRIPCION_GRUPO_FAMILIAR = 8;

    public $fecha_ingreso;
    public $fecha_egreso;
    public $email;
    public $documento;
    public $numero;
    public $nombre;
    public $tags;
    public $id;
    public $telefono;
    public $observaciones;
    public $activo;
    public $fecha_nacimiento;
    public $hash;
    public $suscripciones;

    function __construct($_id, $_nombre, $fecha_ingreso, $fecha_egreso, $_email, $_documento,
                         $_telefono, $_tags, $_numero, $_observaciones, $activo,
                         $fecha_nacimiento, $hash)
    {
        $this->id = $_id;
        $this->nombre = $_nombre;
        $this->fecha_ingreso = $fecha_ingreso;
        $this->fecha_egreso = $fecha_egreso;
        $this->email = $_email;
        $this->documento = $_documento;
        $this->telefono = $_telefono;
        $this->tags = $_tags;
        $this->numero = $_numero;
        $this->observaciones = $_observaciones;
        $this->activo = $activo;
        $this->fecha_nacimiento = $fecha_nacimiento;
        $this->hash = $hash;
    }

    static private function mysqli_to_instances($result)
    {
        $return = array();
        if ($result) {
            while ($row = mysqli_fetch_array($result)) {
                $tags = explode(",", $row['tags']);

                $instance = new Socio(
                    $row['id'], 
                    $row['nombre'], 
                    $row['fecha_ingreso'], 
                    $row['fecha_egreso'], 
                    $row['email'],
                    $row['documento'], $row['telefono'], $tags, $row['numero'], $row['observaciones'],
                    $row['activo'], $row['fecha_nacimiento'], $row['hash']);
                $return[] = $instance;
            }
        }
        return $return;
    }

    static public function get_all_socios()
    {
        $q = mysqli_query(Auth::$mysqli, "SELECT * FROM socios ORDER BY numero;");
        return Socio::mysqli_to_instances($q);
    }

    static public function get_lista_socios_por_nombre()
    {
        $q = mysqli_query(Auth::$mysqli, "SELECT * FROM socios WHERE activo=1 ORDER BY nombre;");
        return Socio::mysqli_to_instances($q);
    }

    static public function get_lista_socios_por_nombre_sin_suscripcion()
    {
        $q = mysqli_query(Auth::$mysqli, "SELECT * FROM socios WHERE activo=1 AND id NOT IN (SELECT id_socio FROM suscripcion_socio) ORDER BY nombre");
        return Socio::mysqli_to_instances($q);
    }

    static public function get_socios_activos()
    {
        $q = mysqli_query(Auth::$mysqli, "SELECT * FROM socios WHERE activo=1 ORDER BY numero;");
        return Socio::mysqli_to_instances($q);
    }

    static public function get_socios_suspendidos()
    {
        $q = mysqli_query(Auth::$mysqli, "SELECT * FROM socios WHERE activo=0 ORDER BY numero;");
        return Socio::mysqli_to_instances($q);
    }

    static public function get_socio($id)
    {
        $q = mysqli_query(Auth::$mysqli, "SELECT * FROM socios WHERE id = " . $id);
        $result = Socio::mysqli_to_instances($q);
        
        if (!is_array($result) || count($result) != 1) {
            return array("error" => "Socio no encontrado");
        }

        $socio = $result[0];
        return $socio->load_suscripciones();
    }

    public function load_suscripciones()
    {
        $suscripciones = array();

        $result = mysqli_query(Auth::$mysqli, "SELECT * FROM suscripcion_socio WHERE id_socio = " . $this->id);
        if ($result) {
            while ($row = mysqli_fetch_array($result)) 
            {
                $suscripciones[] = [
                    "id" => $row['id'],
                    "id_suscripcion" => $row['id_suscripcion'],
                    "fecha_inicio" => $row['fecha_inicio'],
                    "fecha_fin" => $row['fecha_fin'],
                    "activa" => $row['activa'],
                    "vinculos" => $row['vinculos']
                ];
            }
        }

        $this->suscripciones = $suscripciones;

        return $this;
    }

    static public function get_suscripciones_socios()
    {
        $suscripciones_socios = array();

        $result = mysqli_query(Auth::$mysqli, "SELECT * FROM suscripcion_socio WHERE activa = 1");
        if ($result) {
            while ($row = mysqli_fetch_array($result)) 
            {
                $suscripciones_socios[] = [
                    "id" => $row['id'],
                    "id_socio" => $row['id_socio'],
                    "id_suscripcion" => $row['id_suscripcion'],
                    "fecha_inicio" => $row['fecha_inicio'],
                    "fecha_fin" => $row['fecha_fin'],
                    "activa" => $row['activa'],
                    "vinculos" => $row['vinculos']
                ];
            }
        }

        return $suscripciones_socios;
    }

    static public function suscribir($id_socio, $id_suscripcion, $fecha_inicio, $socios_incluidos)
    {
        $socio = Socio::get_socio($id_socio);
        if(is_null($socio) || (is_array($socio) && isset($socio["error"])))
        {
            return $socio;
        }

        $suscripcion = Suscripcion::get_suscripcion($id_suscripcion, false);
        if(is_null($suscripcion) || (is_array($suscripcion) && isset($suscripcion["error"])))
        {
            return $suscripcion;
        }

        if($suscripcion->allow_multi == false)
        {
            for($i=0;$i<count($socio->suscripciones);$i++)
            {
                if($socio->suscripciones[$i]["id_suscripcion"] == $id_suscripcion
                    && $socio->suscripciones[$i]["activa"] == 1)
                {
                    return array("error" => "Socio ya esta suscripto");
                }
            }
        }

        mysqli_query(Auth::$mysqli, "SET autocommit=0");
        mysqli_query(Auth::$mysqli, "BEGIN");

        $vinculos = 'NULL';
        if($socios_incluidos != null && !empty($socios_incluidos)){
            $vinculos = "";
            for($i=0;$i<count($socios_incluidos);$i++){
                if(!empty($vinculos)){
                    $vinculos .= ",";
                }
                $vinculos .= htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $socios_incluidos[$i]));
            }
            $vinculos = "'" . $vinculos . "'";
        }

        $q = mysqli_query(Auth::$mysqli, "INSERT INTO suscripcion_socio (id_socio, id_suscripcion, fecha_inicio, vinculos) VALUES ("
            . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $id_socio)) . ", "
            . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $id_suscripcion)) . ", "
            . "'" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $fecha_inicio)) . "', "
            . $vinculos
            . ")"
        );

        if(mysqli_affected_rows(Auth::$mysqli) != 1)
        {
            mysqli_query(Auth::$mysqli, "ROLLBACK");
            mysqli_query(Auth::$mysqli, "SET autocommit=1");
            return array("error" => "Error al suscribir socio");
        }

        $insertedMainSuscripcionId = mysqli_insert_id(Auth::$mysqli);

        if($socios_incluidos != null && !empty($socios_incluidos)){
            for($i=0;$i<count($socios_incluidos);$i++){

                $q = mysqli_query(Auth::$mysqli, "INSERT INTO suscripcion_socio (id_socio, id_suscripcion, fecha_inicio, vinculos) VALUES ("
                    . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $socios_incluidos[$i])) . ", "
                    . Socio::ID_SUSCRIPCION_GRUPO_FAMILIAR . ", "
                    . "'" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $fecha_inicio)) . "', "
                    . "'" . $id_socio . "'"
                    . ")"
                );
                
                if(mysqli_affected_rows(Auth::$mysqli) != 1)
                {
                    mysqli_query(Auth::$mysqli, "ROLLBACK");
                    mysqli_query(Auth::$mysqli, "SET autocommit=1");
                    return array("error" => "Error al suscribir socio patrocinado");
                }
            }
        }

        mysqli_query(Auth::$mysqli, "COMMIT");
        mysqli_query(Auth::$mysqli, "SET autocommit=1");
        return $insertedMainSuscripcionId;
    }

    static public function modificar_suscripcion($id_suscripcion_socio, $fecha_inicio, $fecha_fin, $activa)
    {
        if($fecha_fin != null && !empty($fecha_fin)){
            $fecha_fin = '"' . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $fecha_fin)) . '"';
        }else{
            $fecha_fin = 'NULL';
        }

        $q = mysqli_query(Auth::$mysqli, "UPDATE suscripcion_socio SET " .
            'fecha_inicio="' . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $fecha_inicio)) . '", ' .
            'fecha_fin=' . $fecha_fin . ', ' .
            'activa=' . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $activa)) . 
            " WHERE id=" . $id_suscripcion_socio);

        if (mysqli_affected_rows(Auth::$mysqli) == 1) {
            Log::log("Editar suscripcion socio", "Suscripcion socio #" . $id_suscripcion_socio . " editado");
            return true;
        } else {
            return array("error" => "Suscripción no modificada");
        }
    }

    static public function get_socio_hash($hash)
    {
        $q = mysqli_query(Auth::$mysqli, "SELECT * FROM socios WHERE hash = '" . $hash . "';");
        $result = Socio::mysqli_to_instances($q);
        if (count($result) == 1) {
            return $result[0];
        } else {
            return array("error" => "SELECT * FROM socios WHERE hash = '" . $hash . "';");
        }
    }

    static public function get_tags()
    {
        $q = mysqli_query(Auth::$mysqli, "SELECT * FROM tags ORDER BY id;");
        $return = array();
        while ($row = mysqli_fetch_array($q)) {
            $return[] = array("id" => $row['id'], "nombre" => $row['nombre'], "color" => $row['color']);
        }
        return $return;
    }

    static public function create_socio($numero, $nombre, $documento, $email, $fecha_ingreso, $telefono, $fecha_nacimiento)
    {
        //check number
        $q = mysqli_query(Auth::$mysqli, "SELECT * FROM socios WHERE numero=" . $numero);
        $sociosIgualNumero = Socio::mysqli_to_instances($q);
        if ($sociosIgualNumero && count($sociosIgualNumero) > 0) {
            return array("error" => "Numero de socio ya existente");
        }

        if($fecha_nacimiento != null && !empty($fecha_nacimiento)){
            $fecha_nacimiento = "'" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $fecha_nacimiento)) . "'";
        }else{
            $fecha_nacimiento = 'NULL';
        }

        $q = mysqli_query(Auth::$mysqli, "INSERT INTO socios (numero, nombre, documento, email, fecha_ingreso, telefono, fecha_nacimiento) VALUES ("
            . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $numero)) . ", "
            . "'" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $nombre)) . "', "
            . "'" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $documento)) . "', "
            . "'" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $email)) . "', "
            . "'" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $fecha_ingreso)) . "', "
            . "'" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $telefono)) . "', "
            . $fecha_nacimiento . ""
            . ")"
        );

        if (mysqli_affected_rows(Auth::$mysqli) == 1) {
            return mysqli_insert_id(Auth::$mysqli);
        } else {
            return array("error" => "Error al crear socio");
        }
    }

    static public function update_socio($id, $numero, $nombre, $documento, $email, $fecha_ingreso, $telefono, $fecha_nacimiento)
    {
        //check number
        $q = mysqli_query(Auth::$mysqli, "SELECT * FROM socios WHERE numero=" . $numero);
        $sociosIgualNumero = Socio::mysqli_to_instances($q);
        if (count($sociosIgualNumero) > 1 || (count($sociosIgualNumero) == 1 && $sociosIgualNumero[0]->id != $id)) {
            return array("error" => "Numero de socio ya existente");
        }

        if($fecha_nacimiento != null && !empty($fecha_nacimiento)){
            $fecha_nacimiento = "'" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $fecha_nacimiento)) . "'";
        }else{
            $fecha_nacimiento = 'NULL';
        }

        $q = mysqli_query(Auth::$mysqli, "UPDATE socios SET numero=" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $numero)) .
        ", nombre='" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $nombre)) .
        "', documento='" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $documento)) .
        "', email='" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $email)) .
        "', fecha_ingreso='" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $fecha_ingreso)) .
        "', telefono='" . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $telefono)) .
        "', fecha_nacimiento=" . $fecha_nacimiento . " WHERE id=" . $id);

        if (mysqli_affected_rows(Auth::$mysqli) == 1) {
            Log::log("Editar Socio", "Socio #" . $id . " " . $nombre . " editado");
            return $id;
        } else {
            return array("error" => "Error al editar socio");
        }
    }

    static public function update_estado_socio($id,$estado)
    {
        $q = mysqli_query(Auth::$mysqli, "UPDATE socios SET activo=" . $estado . " WHERE id=" . $id);

        if (mysqli_affected_rows(Auth::$mysqli) == 1) {
            return true;
        }else{
            return array("error" => "Socio no actualizado");
        }
    }

    static public function eliminar_socio($id)
    {
        //check si no tiene pagos
        $q = mysqli_query(Auth::$mysqli, "SELECT * FROM pagos WHERE id_socio=" . $id . " AND cancelado=0");
        if(mysqli_num_rows($q) > 0){
            return array("error" => "Imposible eliminar, socio tiene pagos a su nombre");
        }else{
            $q = mysqli_query(Auth::$mysqli, "DELETE FROM socios WHERE id=" . $id);
        }

        if (mysqli_affected_rows(Auth::$mysqli) == 1) {
            return true;
        }else{
            return array("error" => "Socio no eliminado");
        }
    }

    static public function get_lista_mails($all,$tags)
    {
        if($all == 'true'){
            $q = mysqli_query(Auth::$mysqli, "SELECT * FROM socios WHERE activo=1");
        }else{

            $and = "";
            if($tags && count($tags) > 0){
                $and .= " AND (";
                for($i=0;$i<count($tags);$i++){
                    if($i > 0){
                        $and .= " OR ";
                    }
                    $and .= "tags like '" . $tags[$i] . ",%'";
                    $and .= " OR tags like '%," . $tags[$i] . ",%'";
                    $and .= " OR tags like '%," . $tags[$i] . "'";
                    $and .= " OR tags = '" . $tags[$i] . "'";
                }
                $and .= ")";
            }
            $q = mysqli_query(Auth::$mysqli, "SELECT * FROM socios WHERE activo=1" . $and);
        }
        
        return Socio::mysqli_to_instances($q);
    }

    public function generate_hash(){

        $q = mysqli_query(Auth::$mysqli, "UPDATE socios SET hash=CONCAT(MD5('" . $this->id . $this->numero . $this->documento . $this->telefono. "secreto'), UNIX_TIMESTAMP()) WHERE id=" . $this->id);

        if (mysqli_affected_rows(Auth::$mysqli) == 1) {
            $socioAgain = Socio::get_socio($this->id);
            return $socioAgain->hash;
        } else {
            return array("error" => "Error al generar hash.");
        }
    }

    public function has_tag($tag_id){

        for($i=0;$i<count($this->tags);$i++) {

            if ((int) $this->tags[$i] == (int) $tag_id) {
                return true;
            }
        }

        return false;
    }
}
