/**
 * Created with JetBrains PhpStorm.
 * User: Martin
 * Date: 07/07/13
 * Time: 10:28 PM
 * To change this template use File | Settings | File Templates.
 */

var ListaPagos = {
    ListaSocios: {},
    ListaPagos: {},
    LoadSocios: function () {
        Toolbox.ShowLoader();

        $.ajax({
            dataType: 'json',
            type: "POST",
            url: "../proc/admin_controller.php",
            data: { func: "get_lista_socios" }
        }).done(function (data) {
            if (data && !data.error) {


                $('#macropago_tabla_socios').html('<tr><td class="right"><input onchange="ListaPagos.MacroPagoSeleccionarTodosChanged();" type="checkbox" class="macropago_socio_chk" id="macropago_socio_todos">' +
                    '<label class="macropago_socio_label" for="macropago_socio_todos"><b>Seleccionar todos</b></label></td></tr>');
                var html = "";
                var countCols = 1;

                ListaPagos.ListaSocios = {};
                for (var i = 0; i < data.length; i++) {
                    ListaPagos.ListaSocios[data[i].id] = data[i];

                    if (countCols == 1) {
                        html += '<tr><td class="right">';
                    } else {
                        html += '<td class="left">';
                    }

                    html += '<input type="checkbox" class="macropago_socio_chk" id="macropago_socio_' + data[i].id + '">' +
                        '<label class="macropago_socio_label" for="macropago_socio_' + data[i].id + '">' + data[i].nombre + '</label></td>';

                    if (countCols == 2) {
                        html += '</tr>';
                        $('#macropago_tabla_socios').append(html);
                        html = "";
                        countCols = 0;
                    } else if (i == data.length - 1) {
                        html += '<td></td></tr>';
                        $('#macropago_tabla_socios').append(html);
                    }

                    countCols += 1;
                }

                ListaPagos.LoadListaPagos();
                ListaPagos.LoadListaDeudas();
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
    LoadListaPagos: function () {

        Toolbox.ShowLoader();

        $.ajax({
            dataType: 'json',
            type: "POST",
            url: "../proc/admin_controller.php",
            data: { func: "get_lista_pagos" }
        }).done(function (data) {
            if (data && !data.error) {

                ListaPagos.ListaPagos = data;
                $('#listaPagosTabla').html("");

                for (var i = 0; i < data.length; i++) {

                    var tagCancelado = "";
                    if (data[i].cancelado == true) {
                        tagCancelado = '<span class="label labelCancelado">PAGO CANCELADO</span> ';
                    }

                    var descuento = "";
                    if (data[i].descuento != "" && data[i].descuento != "0.00") {
                        descuento = data[i].descuento + ' ' + Toolbox.TransformSpecialTag(data[i].descuento_json)
                    }

                    $('#listaPagosTabla').append('<tr onClick="document.location.href = \'/admin_pago.php?id=' + data[i].id + '\'"><td>' + data[i].id + '</td>' +
                        '<td>' + data[i].valor + '</td>' +
                        '<td>' + Toolbox.MysqlDateToDate(data[i].fecha_pago) + '</td>' +
                        '<td>' + Toolbox.TransformSpecialTag(data[i].razon) + '</td>' +
                        '<td>' + descuento + '</td>' +
                        '<td>' + tagCancelado + data[i].notas + '</td>' +
                        '<td>' + Toolbox.TransformSpecialTag(data[i].tipo) + '</td>' +
                        '<td><a href="/socio.php?id=' + data[i].id_socio + '" class="label" style="background-color:#AF002A;">#' + ListaPagos.ListaSocios[data[i].id_socio].numero + ' ' + ListaPagos.ListaSocios[data[i].id_socio].nombre + '</a></td></tr>');

                }

                ListaPagos.UpdateMesesImpagos();

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
    ExportarComoListaPagosPorSocio: function () {
        $("#exportIframe").attr("src", "../proc/admin_controller.php?exportar=exportar_pagos_por_socio");
    },
    ExportarComoListaTotalPagoPorSocio: function () {
        $("#exportIframe").attr("src", "../proc/admin_controller.php?exportar=exportar_pago_total_por_socio");
    },
    ExportarComoListaPagosPorMes: function () {
        $("#exportIframe").attr("src", "../proc/admin_controller.php?exportar=exportar_pagos_por_mes");
    },
    ExportarComoListaPagosPorMesAcotado: function () {
        $("#exportIframe").attr("src", "../proc/admin_controller.php?exportar=exportar_pagos_por_mes_acotado");
    },
    ExportarDeudas: function () {
        $("#exportIframe").attr("src", "../proc/admin_controller.php?exportar=exportar_deudas");
    },
    ExportarDescuentosPorSocio: function () {
        $("#exportIframe").attr("src", "../proc/admin_controller.php?exportar=exportar_descuentos_por_socio");
    },
    LoadListaDeudas: function () {
        Toolbox.ShowLoader();

        $.ajax({
            dataType: 'json',
            type: "POST",
            url: "../proc/admin_controller.php",
            data: { func: "get_all_deudas" }
        }).done(function (data) {
            if (data && !data.error) {
                $('#listaDeudasTabla').html("");
                for (var i = 0; i < data.length; i++) {

                    $('#listaDeudasTabla').append('<tr>' +
                        '<td>' + data[i].monto + '</td>' +
                        '<td>' + data[i].razon + '</td>' +
                        '<td><a href="/socio.php?id=' + data[i].id_socio + '" class="label" style="background-color:#AF002A;">#' + ListaPagos.ListaSocios[data[i].id_socio].numero + ' ' + ListaPagos.ListaSocios[data[i].id_socio].nombre + '</a></td>' +
                        '<td><a href="#" onclick="ListaPagos.CancelarDeuda(\'' + data[i].id + '\');return false;">cancelar</a></td></tr>');
                }
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
    CancelarDeuda: function (id) {
        if (confirm("Cancelar deuda?")) {
            Toolbox.ShowLoader();
            $.ajax({
                dataType: 'json',
                type: "POST",
                url: "../proc/admin_controller.php",
                data: { func: "cancelar_deuda", id: id }
            }).done(function (data) {
                if (data && !data.error) {

                    ListaPagos.LoadListaDeudas();

                } else {
                    if (data && data.error) {
                        Toolbox.ShowFeedback('feedbackContainer', 'error', data.error);
                    } else {
                        Toolbox.ShowFeedback('feedbackContainer', 'error', 'Error al cancelar deuda.');
                    }
                }
                Toolbox.StopLoader();
            });
        }
    },
    OpenModalMacroPago: function () {
        $('#macroPagoModal').modal('show');
    },
    VerificarMacroPago: function () {
        if (confirm("Esta seguro que desea agregar este pago a todos los socios seleccionados?")) {
            if ($('.macropago_valor').val() == "") {
                Toolbox.ShowFeedback('macroPagoModalFeedback', 'error', 'Falt&oacute; especificar el valor del pago');
                return false;
            } else if (isNaN($('.macropago_valor').val())) {
                Toolbox.ShowFeedback('macroPagoModalFeedback', 'error', 'Falto especificar fecha de pago');
                return false;
            } else if ($('.macropago_fecha').val() == "") {
                Toolbox.ShowFeedback('macroPagoModalFeedback', 'error', 'Falto especificar fecha de pago');
                return false;
            }
            return true;
        } else {
            return false;
        }
    },
    AgregarMacroPago: function () {
        if (ListaPagos.VerificarMacroPago()) {

            var listaSocioIds = [];
            $('.macropago_socio_chk').each(function () {
                if ($(this).prop("checked") == true) {
                    if ($(this).attr('id') != 'macropago_socio_todos') {
                        listaSocioIds.push($(this).attr('id').substring(16));
                    }
                }
            });

            var razonPago = $("#macropago_razon").val();
            if ($("#macropago_razon").val() == "mensualidad") {
                razonPago = "mensualidad (" + $('#macropago_razonMensualidad').val() + "/" + $('#macropago_razonMensualidadAnio').val() + ")";
            }

            for (var i = 0; i < listaSocioIds.length; i++) {
                (function (index) {
                    Toolbox.ShowLoaderModal();
                    $.ajax({
                        dataType: 'json',
                        type: "POST",
                        url: "../proc/admin_controller.php",
                        data: {
                            func: "ingresar_pago",
                            id_socio: listaSocioIds[index],
                            valor: $(".macropago_valor").val(),
                            fecha_pago: Toolbox.DataToMysqlDate($(".macropago_fecha").val()),
                            razon: razonPago,
                            notas: "",
                            tipo: $("#macropago_tipo").val()
                        }
                    }).done(function (data) {

                        if (index == listaSocioIds.length - 1) {
                            ListaPagos.LoadListaPagos();
                            $('#macroPagoModal').modal('hide');
                            Toolbox.ShowFeedback('feedbackContainer', 'success', 'Macro pago agregado con exito');
                        }
                        Toolbox.StopLoaderModal();
                    });
                })(i);
            }
        }
    },
    MacroPagoSeleccionarTodosChanged: function () {
        if ($('#macropago_socio_todos').prop("checked") == true) {
            $('.macropago_socio_chk').prop("checked", true);
        } else {
            $('.macropago_socio_chk').prop("checked", false);
        }
    },
    TogglePagoRazon: function () {
        if ($('#macropago_razon').val() == "mensualidad") {
            $('#macropago_razonMensualidad').css('display', 'block');
            $('#macropago_razonMensualidadAnio').css('display', 'block');
        } else {
            $('#macropago_razonMensualidad').css('display', 'none');
            $('#macropago_razonMensualidadAnio').css('display', 'none');
        }
    },
    VerificarNuevaCuotaCosto: function () {
        return true;
    },
    SalvarCostoCuota: function () {
        if (ListaPagos.VerificarNuevaCuotaCosto()) {
            Toolbox.ShowLoaderModal();
            $.ajax({
                dataType: 'json',
                type: "POST",
                url: "../proc/admin_controller.php",
                data: {
                    func: "ingresar_cuota_costo",
                    fecha_inicio: Toolbox.DataToMysqlDate($('.nuevaCuotaCosto_fecha_inicio').val()),
                    fecha_fin: Toolbox.DataToMysqlDate($('.nuevaCuotaCosto_fecha_fin').val()),
                    valor: $(".nuevaCuotaCosto_valor").val()
                }
            }).done(function (data) {
                if (data && !data.error) {
                    ListaPagos.GetCuotaCostos();
                    $('#nuevaCuotaCostoModal').modal('hide');
                } else {
                    if (data && data.error) {
                        Toolbox.ShowFeedback('feedbackContainer', 'error', data.error);
                    } else {
                        Toolbox.ShowFeedback('feedbackContainer', 'error', 'Error al ingresar registro de costo de cuota.');
                    }
                }
                Toolbox.StopLoaderModal();
            });
        }
    }
    ,
    OpenModalNuevoCostoCuota: function () {
        $('#nuevaCuotaCostoModal').modal('show');
    }
    ,
    BorrarCuotaCosto: function (id) {
        if (confirm("Eliminar registro de costo de cuota?")) {
            Toolbox.ShowLoader();
            $.ajax({
                dataType: 'json',
                type: "POST",
                url: "../proc/admin_controller.php",
                data: { func: "borrar_cuota_costo", id: id }
            }).done(function (data) {
                if (data && !data.error) {

                    ListaPagos.GetCuotaCostos();

                } else {
                    if (data && data.error) {
                        Toolbox.ShowFeedback('feedbackContainer', 'error', data.error);
                    } else {
                        Toolbox.ShowFeedback('feedbackContainer', 'error', 'Error al eliminar registro de costo de cuota.');
                    }
                }
                Toolbox.StopLoader();
            });
        }
    }
    ,
    GetCuotaCostos: function () {
        Toolbox.ShowLoader();

        $.ajax({
            dataType: 'json',
            type: "POST",
            url: "../proc/admin_controller.php",
            data: { func: "get_costos_cuotas" }
        }).done(function (data) {
            if (data && !data.error) {

                ListaPagos.CuotaCostos = data;

                $('#listaCostoCuotasTabla').html("");
                for (var i = 0; i < data.length; i++) {

                    $('#listaCostoCuotasTabla').append('<tr>' +
                        '<td>' + data[i].valor + '</td>' +
                        '<td>' + data[i].fecha_inicio + '</td>' +
                        '<td>' + data[i].fecha_fin + '</td>' +
                        '<td><a href="#" onclick="ListaPagos.BorrarCuotaCosto(\'' + data[i].id + '\');return false;">borrar</a></td></tr>');
                }
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
    OnChangeMesesImpagosSelector: function () {
        //ListaPagos.UpdateMesesImpagos();
    },
    UpdateMesesImpagos: function () {
        //for (var i = 0; i < ListaPagos.ListaPagos.length; i++) {

        //lista meses inpagos
        var inpagosData = {};
        var fromYear = $('#mesesImpagosSelector').val();
        var today = new Date();
        var deudaEstimada = 0;


        for (var month = 1; month <= 12; month++) {

            Object.keys(ListaPagos.ListaSocios).forEach(function (key) {

                if (ListaPagos.ListaSocios[key].activo == "1" && ListaPagos.ListaSocios[key].numero != 38/*NOT DAISY*/) {

                    if ((fromYear == today.getFullYear() && month > today.getMonth() + 1) ||
                        ListaPagos.ListaSocios[key].fecha_inicio > fromYear + "-" + month + "-31") {

                        //dont show

                    } else {
                        var foundPayment = false;
                        var totalPayment = 0;

                        for (var i = 0; i < ListaPagos.ListaPagos.length; i++) {
                            if (ListaPagos.ListaPagos[i].razon == "mensualidad (" + Toolbox.NombreMesesEsp[month] + "/" + fromYear + ")" &&
                                ListaPagos.ListaPagos[i].id_socio == key) {
                                foundPayment = true;
                                totalPayment += Number(ListaPagos.ListaPagos[i].valor) + Number(ListaPagos.ListaPagos[i].descuento);
                            }
                        }

                        if (!foundPayment) {

                            if (!(key in inpagosData)) {
                                inpagosData[key] = [];
                            }

                            inpagosData[key].push({
                                //nombre: '<a href="/socio.php?id=' + ListaPagos.ListaSocios[key].id_socio + '" class="label" style="background-color:#AF002A;">#' + ListaPagos.ListaSocios[key].numero + ' ' + ListaPagos.ListaSocios[key].nombre + '</a>',
                                mes: Toolbox.NombreMesesEsp[month] + "/" + fromYear,
                                motivo: 'notfound'
                            });

                            deudaEstimada += Number(ListaPagos.calcularValorCuota(month, fromYear));
                        } else if (totalPayment < ListaPagos.calcularValorCuota(month, fromYear)) {

                            if (!(key in inpagosData)) {
                                inpagosData[key] = [];
                            }

                            inpagosData[key].push({
                                //nombre: '<a href="/socio.php?id=' + ListaPagos.ListaSocios[key].id_socio + '" class="label" style="background-color:#AF002A;">#' + ListaPagos.ListaSocios[key].numero + ' ' + ListaPagos.ListaSocios[key].nombre + '</a>',
                                mes: Toolbox.NombreMesesEsp[month] + "/" + fromYear,
                                motivo: 'less'
                            });

                            deudaEstimada += Number(ListaPagos.calcularValorCuota(month, fromYear)) - Number(totalPayment);
                        }
                    }
                }

            });

        }

        $('#listaMesesInpagosTabla').html("");

        Object.keys(inpagosData).forEach(function (key) {

            var htmlDeudas = "";
            for (var i = 0; i < inpagosData[key].length; i++) {

                if (htmlDeudas != "") {
                    htmlDeudas += '</br>';
                }

                if (inpagosData[key][i]["motivo"] == "less") {
                    htmlDeudas += '<span class="label" style="background-color:#ffd12b;margin: 5px 0;">' + inpagosData[key][i]["mes"] + '</span>';
                } else {
                    htmlDeudas += '<span class="label" style="background-color:red;margin: 5px 0;">' + inpagosData[key][i]["mes"] + '</span>';
                }
            }

            $('#listaMesesInpagosTabla').append('<tr><td>' + '<a href="/socio.php?id=' + ListaPagos.ListaSocios[key].id + '" class="label" style="background-color:#AF002A;">#' + ListaPagos.ListaSocios[key].numero + ' ' + ListaPagos.ListaSocios[key].nombre + '</a>' + '</td>' +
                '<td>' + htmlDeudas + '</td></tr>');
        });

        $('.deuda-estimada').html("Deuda estimada en $" + deudaEstimada + ".");

        //}
    },
    calcularValorCuota: function (mes, year) {

        for (var i = 0; i < ListaPagos.CuotaCostos.length; i++) {
            var mesInicio = ListaPagos.CuotaCostos[i].fecha_inicio.split("-")[1];
            var mesFin = ListaPagos.CuotaCostos[i].fecha_fin.split("-")[1];
            var yearInicio = ListaPagos.CuotaCostos[i].fecha_inicio.split("-")[0];
            var yearFin = ListaPagos.CuotaCostos[i].fecha_fin.split("-")[0];

            if (((yearInicio == year && mesInicio <= mes) || yearInicio < year) &&
                ((yearFin == year && mesFin >= mes) || yearFin > year)) {
                return ListaPagos.CuotaCostos[i].valor;
            }
        }
    }
}

$(document).ready(function () {

    Toolbox.UpdateActiveNavbar('nav_lista_pagos');
    $(".macropago_fecha").mask("99/99/9999");
    $(".nuevaCuotaCosto_fecha_inicio").mask("99/99/9999");
    $(".nuevaCuotaCosto_fecha_fin").mask("99/99/9999");
    ListaPagos.LoadSocios();
    ListaPagos.GetCuotaCostos();

    var aniosDisplayHtml = "";
    var today = new Date();
    for (var i = 2014; i < today.getFullYear() + 1; i++) {
        aniosDisplayHtml += "<option value='" + i + "'>" + i + "</option>";
    }

    $('#mesesImpagosSelector').html(aniosDisplayHtml);
    $('#mesesImpagosSelector').val(today.getFullYear());

});
