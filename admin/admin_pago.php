<?php

require_once(dirname(__FILE__) . '/admin_layout.php');
require_once(dirname(__FILE__) . '/../proc/classes/auth.php');

if(Auth::access_level() < 0)
{
    header("Location: " . $datos['url'] . "/admin/admin_login.php");
    exit();
}
else
{ ?>

    <head>
        <script src="scripts1.0.17/pago.js"></script>
    </head>

    <body>
    <div class="container">
        <div class="socioHeader">
            <h2 id="pagoNombreTitulo" style="float: left;"></h2>
            <div style="float: left;margin: 25px 0 0 10px;"><a href="#" onclick="Pago.Editar();return false;">editar</a></div>
            <span id="pagoLabelEstado" class="label labelCancelado">CANCELADO</span>
        </div>
        <div id=feedbackContainer></div>

        <div class="box row-fluid">
            <div class="span6">
                <div style="" class="socioDatosField">
                    <h4>Socio</h4>
                    <div id="pagoDatosValorSocio" class="socioDatosValor"></div>
                    <div id="pagoEditarSocio" style="display:none;">
                        <select id="socioIngresarPagoSocio" onchange="CajaCantina.OnChangeSocioSelector();"></select>
                    </div>
                </div>
                <div style="" class="socioDatosField">
                    <h4>Monto $</h4>
                    <div id="pagoDatosValorValor" class="socioDatosValor"></div>
                </div>
                <div class="socioDatosField">
                    <h4>Fecha Pago</h4>
                    <div id="pagoDatosValorFechaPago" class="socioDatosValor"></div>
                    <div id="pagoEditarFechaPago" style="display:none;">
                        <input type="text" placeholder="" id="socioIngresarPagoFecha" style="width:130px;">
                    </div>
                </div>
                <div class="socioDatosField">
                    <h4>Notas</h4>
                    <div id="pagoDatosValorNotas" class="socioDatosValor"></div>
                    <div id="pagoEditarNotas" style="display:none;">
                        <textarea style="width: 400px; height: 50px; max-width: 400px;" id="socioIngresarPagoNotas"></textarea>
                    </div>
                </div>
            </div>
            <div class="span6">
                <div class="socioDatosField">
                    <h4>Raz&oacute;n</h4>
                    <div id="pagoDatosValorRazon" class="socioDatosValor"></div>
                    <div id="pagoEditarRazon" style="display:none;">
                        <select id="socioIngresarPagoRazon" onchange="Pago.TogglePagoRazonMensualidad();">
                            <option value="mensualidad">Mensualidad</option>
                            <option value="matricula">Matr&iacute;cula</option>
                        </select>
                        <select id="socioIngresarPagoRazonMensualidadMes">
                            <option value="Enero">Enero</option>
                            <option value="Febrero">Febrero</option>
                            <option value="Marzo">Marzo</option>
                            <option value="Abril">Abril</option>
                            <option value="Mayo">Mayo</option>
                            <option value="Junio">Junio</option>
                            <option value="Julio">Julio</option>
                            <option value="Agosto">Agosto</option>
                            <option value="Setiembre">Setiembre</option>
                            <option value="Octubre">Octubre</option>
                            <option value="Noviembre">Noviembre</option>
                            <option value="Diciembre">Diciembre</option>
                        </select>
                        <select id="socioIngresarPagoRazonMensualidadAnio">
                            <option value="2014">2014</option>
                            <option value="2015">2015</option>
                            <option value="2016">2016</option>
                            <option value="2017">2017</option>
                            <option value="2018">2018</option>
                            <option value="2019">2019</option>
                            <option value="2020">2020</option>
                            <option value="2021">2021</option>
                            <option value="2022">2022</option>
                            <option value="2022">2023</option>
                            <option value="2022">2024</option>
                            <option value="2022">2025</option>
                            <option value="2022">2026</option>
                            <option value="2022">2027</option>
                        </select>
                    </div>
                </div>
                <div style="" class="socioDatosField">
                    <h4>Descuento $</h4>
                    <div style="margin: 0;padding: 10px;" id="pagoDatosValorDescuento" class="socioDatosValor"></div>
                    <div id="pagoEditarDescuento">
                        <input type="text" placeholder="0.00" id="pagoEditarDescuentoDescuento" style="margin-left: 23px;width:100px;">
                        <select style="margin: 0 0 0 10px;" id="pagoEditarDescuentoRazonDescuento">
                            <option value="Voluntariado">Voluntariado</option>
                            <option value="Resolucion directiva">Resoluci&oacute;n directiva</option>
                            <option value="BalanceVoluntariado">Balance Voluntariado</option>
                            <option value="DescuentoAnual">Descuento Anual</option>
                            <option value="Otra">Otra</option>
                        </select>
                    </div>
                </div>
            </div>
            <div style="display:none;" class="span12" id="pagoBtnCancelarContainer">
                <div class="btn btn-danger" id="pagoBtnCancelar">Cancelar Pago</div>
            </div>
        </div>
        <div style="display: block;width: 100px;margin: 10px 0;float: right;" class="btn btn-primary" id="pagoBtnSalvar" onclick="Pago.Salvar();">Guardar cambios</div>
    </div>

    </body>

<?php }

require_once(dirname(__FILE__) . '/admin_footer.php');

?>
