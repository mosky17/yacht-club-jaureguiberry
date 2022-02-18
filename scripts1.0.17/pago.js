/**
 * Created with JetBrains PhpStorm.
 * User: Martin
 * Date: 08/07/13
 * Time: 10:50 PM
 * To change this template use File | Settings | File Templates.
 */

var Pago = {
    IdPago: null,
    PagoData: {},
    PagoLoaded: false,
    Socio: null,
    Socios: {},
    SociosLoaded: false,
    LoadSocios: function () {
        Toolbox.ShowLoader();
        Pago.SociosLoaded = false;

        $.ajax({
            dataType: 'json',
            type: "POST",
            url: "../proc/admin_controller.php",
            data: { func: "get_lista_socios_por_nombre" }
        }).done(function (data) {
            if (data && !data.error) {
                Pago.Socios = {};
                for (var i = 0; i < data.length; i++) {
                    Pago.Socios[data[i].id] = data[i];
                    $('#socioIngresarPagoSocio').append('<option value="' + data[i].id + '">' + data[i].nombre + '</option>');
                }
                Pago.SociosLoaded = true;
                Pago.UpdateSocioOwner();
            } else {
                if (data && data.error) {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', data.error);
                } else {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', 'Error inesperado durante get_lista_socios_por_nombre');
                }
            }
            Toolbox.StopLoader();
        });
    },
    LoadPago: function () {

        $('#pagoDatosValorRazon').css("display", "block");
        $('#pagoDatosValorDescuento').css("display", "block");
        $('#pagoBtnCancelar').css("display", "block");
        $('#pagoDatosValorSocio').css("display", "block");
        $('#pagoDatosValorNotas').css("display", "block");
        $('#pagoDatosValorFechaPago').css("display", "block");
        $('#pagoEditarRazon').css("display", "none");
        $('#pagoEditarDescuento').css("display", "none");
        $('#pagoBtnSalvar').css("display", "none");
        $('#pagoEditarSocio').css("display", "none");
        $('#pagoEditarFechaPago').css("display", "none");
        $('#pagoEditarNotas').css("display", "none");

        Pago.PagoLoaded = false;

        Toolbox.ShowLoader();
        $.ajax({
            dataType: 'json',
            type: "POST",
            url: "../proc/admin_controller.php",
            data: { func: "get_pago", id: Pago.IdPago }
        }).done(function (data) {
            if (data && !data.error) {
                Pago.PagoData = data;

                var descuento = "";
                if (data.descuento != "" && data.descuento != "0.00") {
                    descuento = data.descuento + ' ' + Toolbox.TransformSpecialTag(data.descuento_json)
                }

                if (data.cancelado == true) {
                    $('#pagoLabelEstado').css('display', 'block');
                    $('#pagoBtnCancelarContainer').css('display', 'none');
                } else {
                    $('#pagoLabelEstado').css('display', 'none');
                    $('#pagoBtnCancelarContainer').css('display', 'block');
                }
                $("#pagoNombreTitulo").html('Pago #' + data.id);
                $("#pagoDatosValorValor").html('<p>' + data.valor + "</p>");
                $("#pagoDatosValorFechaPago").html('<p>' + Toolbox.MysqlDateToDate(data.fecha_pago) + "</p>");
                $("#pagoDatosValorTipo").html('<p>' + Toolbox.TransformSpecialTag(data.tipo) + "</p>");
                $("#pagoDatosValorNotas").html('<p>' + data.notas + "</p>");
                $("#pagoDatosValorRazon").html('<p>' + Toolbox.TransformSpecialTag(data.razon) + "</p>");
                $("#pagoDatosValorSocio").html('<p>' + data.id_socio + "</p>");
                $("#pagoDatosValorDescuento").html(descuento);

                Pago.PagoLoaded = true;
                Pago.UpdateSocioOwner();
            } else {
                if (data && data.error) {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', data.error);
                } else {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', 'Unexpected error');
                }
            }
            Toolbox.StopLoader();
        });
    },
    CancelarPago: function () {

        var confirmacion = confirm('Anular pago permanentemente?');

        if (confirmacion) {
            Toolbox.ShowLoader();
            $.ajax({
                dataType: 'json',
                type: "POST",
                url: "../proc/admin_controller.php",
                data: { func: "cancelar_pago", id: Pago.IdPago }
            }).done(function (data) {
                if (data && !data.error) {
                    Pago.LoadPago();
                } else {
                    if (data && data.error) {
                        Toolbox.ShowFeedback('feedbackContainer', 'error', data.error);
                    } else {
                        Toolbox.ShowFeedback('feedbackContainer', 'error', 'Unexpected error');
                    }
                }
                Toolbox.StopLoader();
            });
        }
    },
    Editar: function () {
        $('#pagoDatosValorRazon').css("display", "none");
        $('#pagoEditarRazon').css("display", "table");
        $('#pagoDatosValorDescuento').css("display", "none");
        $('#pagoDatosValorSocio').css("display", "none");
        $('#pagoDatosValorNotas').css("display", "none");
        $('#pagoDatosValorFechaPago').css("display", "none");

        var razon = Pago.PagoData.razon;
        var razonSelectorValue = razon;

        if (razon.indexOf('mensualidad') !== -1) {

            razon = razon.split(" ")[1];
            razon = razon.substring(1, razon.length - 1);
            var razonMes = razon.split("/")[0];
            var razonYear = razon.split("/")[1];

            $('#socioIngresarPagoRazonMensualidadMes').val(razonMes);
            $('#socioIngresarPagoRazonMensualidadAnio').val(razonYear);
            razonSelectorValue = 'mensualidad';
        }

        $('#socioIngresarPagoRazon').val(razonSelectorValue);
        $('#socioIngresarPagoSocio').val(Pago.Socio.id);
        $('#socioIngresarPagoFecha').val(Toolbox.MysqlDateToDate(Pago.PagoData.fecha_pago));
        $('#socioIngresarPagoNotas').val(Pago.PagoData.notas);

        //$("#pagoEditarRazonRazon").val(Pago.PagoData.razon);
        $("#pagoEditarDescuentoDescuento").val(Pago.PagoData.descuento);
        $("#pagoEditarDescuentoRazonDescuento").val(Pago.PagoData.descuento_json);

        $('#pagoEditarDescuento').css("display", "block");
        $('#pagoBtnCancelar').css("display", "none");
        $('#pagoBtnSalvar').css("display", "block");
        $('#pagoEditarSocio').css("display", "block");
        $('#pagoEditarFechaPago').css("display", "block");
        $('#pagoEditarNotas').css("display", "block");
    },
    Salvar: function () {
        Toolbox.ShowLoader();

        var razon = $("#socioIngresarPagoRazon").val();
        if ($("#socioIngresarPagoRazon").val() == "mensualidad") {
            razon = "mensualidad (" + $('#socioIngresarPagoRazonMensualidadMes').val() + "/" + $('#socioIngresarPagoRazonMensualidadAnio').val() + ")";
        }

        $.ajax({
            dataType: 'json',
            type: "POST",
            url: "../proc/admin_controller.php",
            data: {
                func: "salvar_pago_modificar",
                id: Pago.IdPago,
                razon: razon,
                descuento: $("#pagoEditarDescuentoDescuento").val(),
                descuento_json: $("#pagoEditarDescuentoRazonDescuento").val(),
                notas: $("#socioIngresarPagoNotas").val(),
                fecha_pago: Toolbox.DataToMysqlDate($("#socioIngresarPagoFecha").val()),
                id_socio: $("#socioIngresarPagoSocio").val()
            }
        }).done(function (data) {
            if (data && !data.error) {
                Pago.LoadPago();

            } else {
                if (data && data.error) {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', data.error);
                } else {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', 'No se pudieron salvar las modificaciones');
                }
            }
            Toolbox.StopLoader();
        });
    },
    TogglePagoRazonMensualidad: function () {
        if ($('#socioIngresarPagoRazon').val() == "mensualidad") {
            $('#socioIngresarPagoRazonMensualidadMes').css('display', 'block');
            $('#socioIngresarPagoRazonMensualidadAnio').css('display', 'block');
        } else {
            $('#socioIngresarPagoRazonMensualidadMes').css('display', 'none');
            $('#socioIngresarPagoRazonMensualidadAnio').css('display', 'none');
        }
    },
    UpdateSocioOwner: function () {
        if (Pago.PagoLoaded == true && Pago.SociosLoaded == true) {
            Object.keys(Pago.Socios).forEach(function (key) {
                if (key == Pago.PagoData.id_socio) {
                    Pago.Socio = Pago.Socios[key];
                    $("#pagoDatosValorSocio").html('<p>' + Pago.Socio.nombre + "</p>");
                }
            });
        }
    }
}

$(document).ready(function () {
    Pago.LoadSocios();
    Toolbox.UpdateActiveNavbar('');
    var params = Toolbox.GetUrlVars();

    if (params['id']) {
        Pago.IdPago = params['id'];
    }

    $('#pagoBtnCancelar').on('click', function () {
        Pago.CancelarPago();
    });

    Pago.LoadPago();
});
