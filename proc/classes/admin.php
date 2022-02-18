<?php
require_once(dirname(__FILE__) . '/auth.php');

Auth::connect();

class Admin {

    public $id;
    public $nombre;
    public $email;
    public $clave;
    public $permiso_pagos;

    function __construct($id, $nombre, $email, $clave, $permiso_pagos) {

        $this->id = $id;
        $this->nombre = $nombre;
        $this->email = $email;
        $this->clave = $clave;
        $this->permiso_pagos = $permiso_pagos;

    }

    static private function mysqli_to_instances($result)
    {
        $return = array();
        if($result){
            while ($row = mysqli_fetch_array($result)) {
                $instance = new Admin($row['id'], $row['nombre'], $row['email'], $row['secreto'], $row['permiso_pagos']);
                $return[] = $instance;
            }
        }
        return $return;
    }

    static public function get_lista_admins()
    {
        $q = mysqli_query(Auth::$mysqli, "SELECT * FROM admins ORDER BY id;");
        return Admin::mysqli_to_instances($q);
    }

    static public function ingresar_admin($nombre, $email, $clave, $permiso_pagos){

        $q = mysqli_query(Auth::$mysqli, "SELECT * FROM admins WHERE email='". $nombre ."'");
        if(mysqli_num_rows($q) > 0){
            return array("error" => "Ya existe un administrador con ese usuario/email");
        }

        $q = mysqli_query(Auth::$mysqli, "INSERT INTO admins (id, nombre, email, secreto, permiso_pagos) VALUES (null," .
            '\'' . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $nombre)) . '\',' .
            '\'' . htmlspecialchars(mysqli_real_escape_string(Auth::$mysqli, $email)) . '\',' .
            'MD5(\''.$clave.'\'), ' .
            $permiso_pagos . ')');

        if (mysqli_affected_rows(Auth::$mysqli) == 1) {
            return true;
        } else {
            return array("error" => "Error al ingresar admin");
        }

    }

    static public function update_admin($id, $nombre, $email, $clave, $permiso_pagos){

        $q = mysqli_query(Auth::$mysqli, "SELECT * FROM admins WHERE email='". $nombre ."' AND id<>".$id);
        if(mysqli_num_rows($q) > 0){
            return array("error" => "Ya existe un administrador con ese usuario/email");
        }

        $q = mysqli_query(Auth::$mysqli, "UPDATE admins SET nombre='" . $nombre . "'," .
            "email='" . $email . "'," .
            "secreto=MD5('" . $clave . "')," .
            "permiso_pagos='" . $permiso_pagos . "' WHERE id=".$id);

        if (mysqli_affected_rows(Auth::$mysqli) == 1) {
            return true;
        } else {
            return array("error" => "Error al modificar admin");
        }

    }

    static public function delete_admin($id){

        $q = mysqli_query(Auth::$mysqli, "DELETE FROM admins WHERE id=".$id);

        if (mysqli_affected_rows(Auth::$mysqli) == 1) {
            return true;
        } else {
            return array("error" => "Error al borrar admin");
        }

    }
} 