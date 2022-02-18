/**
 * Coded by Mosky
 * https://github.com/mosky17
 */

var CajaAudit = {

    CheckCaja: function() {

    }

}

$(document).ready(function () {

    $("#fecha_desde").mask("99/99/9999");
    $("#fecha_hasta").mask("99/99/9999");
    $('#fecha_hasta').val(Toolbox.GetFechaHoyLocal());
    $('#fecha_desde').val("01/04/2019");

});