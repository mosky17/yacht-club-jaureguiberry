var AdminCaja = {
    CreandoHaber: false,
    PaginaSize: 25,
    Page: 1,
    MaxPages: 10,
    CurrentLastPage: 10,
    ModalNuevoGasto: null,

    SetPagination: function (size) {
        $('.btnPageSize').html(size + " por página");
        AdminCaja.PaginaSize = size;
        AdminCaja.LoadPagos();
    },
    SetPage: function (page) {
        AdminCaja.Page = page;
        AdminCaja.LoadPagos();
    },
    LoadPagos: function () {

        Toolbox.ShowLoader();

        $.ajax({
            dataType: 'json',
            type: "POST",
            url: "../proc/admin_controller.php",
            data: {
                func: "get_lista_pagos_paginated",
                sort: "DESC",
                page_size: AdminCaja.PaginaSize,
                page: AdminCaja.Page
            }
        }).done(function (data) {
            if (data && !data.error) {
                //pagination
                $('.paginationTablaPagos').html('');
                var pages_to_display = data.total_pages;
                if (pages_to_display > AdminCaja.MaxPages) {
                    pages_to_display = AdminCaja.MaxPages;
                }
                var page_to_start = 1;
                if (AdminCaja.Page >= pages_to_display) {
                    page_to_start = AdminCaja.Page - pages_to_display + 2;
                }
                var page_to_end = page_to_start + pages_to_display;
                if (page_to_end > data.total_pages) {
                    page_to_end = data.total_pages;
                }

                for (var i = page_to_start; i < page_to_end; i++) {
                    if (i == data.page) {
                        $('.paginationTablaPagos').append(
                            '<li class="page-item active" aria-current="page">'
                            + '<span class="page-link">' + i + '</span>'
                            + '</li>'
                        );
                    } else {
                        $('.paginationTablaPagos').append(
                            '<li class="page-item"><a class="page-link" href="#" onClick="AdminCaja.SetPage(' + i + '); return false;">' + i + '</a></li>'
                        );
                    }
                }

                $('#listaPagosTabla').html("");
                for (var i = 0; i < data.items.length; i++) {
                    var valor = Number(data.items[i].valor);
                    var haber = '<i class="icon icon-arrow-right green-arrow"></i>';
                    if (valor > 0) {
                        haber = '<i class="icon icon-arrow-left red-arrow"></i>';
                    }

                    var notas = '';
                    if (data.items[i].notas != null) {
                        notas = data.items[i].notas;
                    }

                    $('#listaPagosTabla').append('<tr onClick="document.location.href = \'admin_pago.php?id=' + data.items[i].id + '\'">' +
                        '<td>' + data.items[i].id + '</td>' +
                        '<td>' + Toolbox.FormatNumber(valor) + '</td>' +
                        '<td>' + haber + '</td>' +
                        '<td>' + Toolbox.MysqlDateToDate(data.items[i].fecha_pago) + '</td>' +
                        '<td>' + Toolbox.FormatRazonPago(data.items[i]) + '</td>' +
                        '<td>' + Toolbox.TransformSpecialTag(data.items[i].rubro) + '</td>' +
                        '<td>' + notas + '</td></tr>');
                }
            } else {
                if (data && data.error) {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', data.error);
                } else {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', 'Error inesperado durante get_lista_gastos_paginated');
                }
            }
            Toolbox.StopLoader();
        });
    },
    ExportarCaja: function () {
        $("#exportIframe").attr("src", "../proc/admin_controller.php?exportar=exportar_caja");
    },
    IngresarGasto: function () {
        if (AdminCaja.VerificarDatosGasto()) {

            var valor = $("#listaIngresarGastoValor").val();
            if (AdminCaja.CreandoHaber) {
                valor = valor * -1;
            }

            var rubro = $('#listaIngresarGastoGrupo').val();

            Toolbox.ShowLoaderModal();
            $.ajax({
                dataType: 'json',
                type: "POST",
                url: "../proc/admin_controller.php",
                data: {
                    func: "ingresar_gasto", valor: valor,
                    fecha_pago: $("#listaIngresarGastoFecha").val(),
                    razon: $("#listaIngresarGastoRazon").val(),
                    notas: $("#listaIngresarGastoNotas").val(),
                    rubro: rubro
                }
            }).done(function (data) {
                if (data && !data.error) {
                    AdminCaja.LoadPagos();
                    AdminCaja.ModalNuevoGasto.hide();
                } else {
                    if (data && data.error) {
                        Toolbox.ShowFeedback('feedbackContainerModalIngresarGasto', 'error', data.error);
                    } else {
                        Toolbox.ShowFeedback('feedbackContainerModalIngresarGasto', 'error', 'Unexpected error');
                    }
                }
                Toolbox.StopLoaderModal();
            });
        }
    },
    VerificarDatosGasto: function () {
        var error = undefined;


        if (!error && $('#listaIngresarGastoValor').val() == '') {
            error = 'Falt&oacute; especificar el valor del gasto';
        } else if (!error && $('#listaIngresarGastoFecha').val() == '') {
            error = 'Falt&oacute; especificar fecha de gasto';
        } else if (!error && isNaN($('#listaIngresarGastoValor').val())) {
            error = 'Valor invalido';
        } else if (!error && $('#listaIngresarGastoGrupo').val() == "") {
            error = 'Falt&oacute; especificar rubro';
        } else if (!error && $('#listaIngresarGastoRazon').val() == "") {
            error = 'Falt&oacute; especificar razón';
        }

        if (error == undefined) {
            Toolbox.ShowFeedback('feedbackContainerModalIngresarGasto', '', '');
        }
        else {
            Toolbox.ShowFeedback('feedbackContainerModalIngresarGasto', 'error', error);
        }

        return error == undefined;
    },
    GetTotales: function () {
        Toolbox.ShowLoader();
        $.ajax({
            dataType: 'json',
            type: "POST",
            url: "../proc/admin_controller.php",
            data: { func: "get_totales" }
        }).done(function (data) {
            if (data && !data.error) {
                $('.totales').html('<div class="campo">Ingreso Socios: <span class="text-success">' + Toolbox.FormatNumber(data.ingresos_socios) + '</span></div>' +
                    '<div class="campo">Otros Ingresos: <span class="text-success">' + Toolbox.FormatNumber(data.otros_ingresos) + '</span></div>' +
                    '<div class="campo">Gastos: <span class="text-error">' + Toolbox.FormatNumber(data.gastos) + '</span></div>' +
                    '<div class="campo">Total en Caja: <b>' + Toolbox.FormatNumber(Number(data.ingresos_socios) + Number(data.otros_ingresos) - Number(data.gastos)) + '</b></div>');
            } else {
                if (data && data.error) {
                    Toolbox.ShowFeedback('feedbackContainerModalIngresarGasto', 'error', data.error);
                } else {
                    Toolbox.ShowFeedback('feedbackContainerModalIngresarGasto', 'error', 'Unexpected error');
                }
            }
            Toolbox.StopLoader();
        });
    },
    OpenModalNuevoGasto: function () {
        $('.feedbackContainerModal').css('display', 'none');
        $('#listaIngresarGastoModalLabel').html('Nuevo Gasto');
        AdminCaja.CreandoHaber = false;
        $('#listaIngresarGastoValor').val('');
        $('#listaIngresarGastoFecha').val('');
        $('#listaIngresarGastoRazon').val('');
        $('#listaIngresarGastoNotas').val('');
        $('#listaIngresarGastoGrupo').val('');
        $('.loaderModal').css('display', 'none');

        AdminCaja.ModalNuevoGasto = new bootstrap.Modal(document.getElementById('modalNuevoGasto'), {});
        AdminCaja.ModalNuevoGasto.show();

        $('#listaIngresarGastoValor').focus();
    },
    OpenModalNuevoHaber: function () {

        $('.feedbackContainerModal').css('display', 'none');
        $('#listaIngresarGastoModalLabel').html('Nuevo Ingreso');
        AdminCaja.CreandoHaber = true;
        $('#listaIngresarGastoValor').val('');
        $('#listaIngresarGastoRazon').val('');
        $('#listaIngresarGastoNotas').val('');
        $('#listaIngresarGastoFecha').val('');
        $('#listaIngresarGastoGrupo').val('');
        $('.loaderModal').css('display', 'none');

        AdminCaja.ModalNuevoGasto = new bootstrap.Modal(document.getElementById('modalNuevoGasto'), {});
        AdminCaja.ModalNuevoGasto.show();

        $('#listaIngresarGastoValor').focus();
    }
}

$(document).ready(function () {
    Toolbox.UpdateActiveNavbar('nav_caja');
    AdminCaja.LoadPagos();
    AdminCaja.GetTotales();
});
