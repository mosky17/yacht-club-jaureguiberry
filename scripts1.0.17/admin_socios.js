var AdminSocios = {
    Tags: {},
    Socios: null,
    SociosLoaded: false,
    SociosAMostrar: "activos",
    ModalListaCorreos: null,
    ModalNuevoSocio: null,
    LastSocioNumber: 1,
    ModalImportarSocios: null,
    Suscripciones: null,
    SuscripcionesLoaded: false,
    SuscripcionesSocios: null,
    SuscripcionesSociosPorIdSocio: null,
    SuscripcionesSociosLoaded: false,
    PagosPorSuscripcionSocioId: null,
    PagosLoaded: false,

    LoadSocios: function () {

        // var func = 'get_socios_activos';
        // if (AdminSocios.SociosAMostrar == 'suspendidos') {
        //     func = 'get_socios_suspendidos';
        // }

        AdminSocios.SociosLoaded = false;

        Toolbox.ShowLoader();

        $.ajax({
            dataType: 'json',
            type: "POST",
            url: "../proc/admin_controller.php",
            data: { func: 'get_all_socios' }
        }).done(function (data) {
            if (data && !data.error) {
                $('#listaSociosTabla').html("");

                var countSocios = 0;
                AdminSocios.Socios = {};

                for (var i = 0; i < data.length; i++) {
                    AdminSocios.Socios[data[i].id] = data[i];
                    countSocios += 1;

                    // var tagsHtml = "";
                    // if (data[i].activo != true) {
                    //     tagsHtml += '<span class="badge bg-danger" style="margin-right: 3px;">SUSPENDIDO</span>';
                    // }
                    // for (var j = 0; j < data[i].tags.length; j++) {
                    //     if (data[i].tags[j] && data[i].tags[j] != '' && AdminSocios.Tags[data[i].tags[j]]) {
                    //         tagsHtml += '<span class="badge socioTag" style="background-color:' + AdminSocios.Tags[data[i].tags[j]].color + '">' + AdminSocios.Tags[data[i].tags[j]].nombre + '</span>';
                    //     }
                    // }

                    $('#listaSociosTabla').append('<tr><td>' + data[i].numero + '</td>' +
                        '<td><a href="' + GLOBAL_domain + '/admin/admin_socio.php?id=' + data[i].id + '">' + data[i].nombre + '</a></td>' +
                        '<td class="hideInMobile">' + data[i].documento + '</td>' +
                        '<td class="hideInMobile">' + data[i].telefono + '</td>' +
                        '<td class="hideInMobile">' + Toolbox.MysqlDateToDate(data[i].fecha_ingreso) + '</td>' +
                        '<td class="suscripcion_socio_' + data[i].id + '"></td>' +
                        '<td class="obligacion_socio obligacion_socio_' + data[i].id + '"></td></tr>');

                    if (Number(data[i].numero) > AdminSocios.LastSocioNumber) {
                        AdminSocios.LastSocioNumber = Number(data[i].numero);
                    }
                }

                $('#totalRegistrosSocios').html("Total Registros: " + countSocios);

                AdminSocios.SociosLoaded = true;
                AdminSocios.DisplaySuscripciones();

            } else {
                if (data && data.error) {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', data.error);
                } else {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', 'Error inesperado durante get_all_socios');
                }
            }
            Toolbox.StopLoader();
        });
    },
    CambiarSociosAMostrar: function () {
        AdminSocios.SociosAMostrar = $('.lista-socios-show').val();
        AdminSocios.LoadSocios();
    },
    OpenModalNuevoSocio: function () {
        $('.feedbackContainerModal').css('display', 'none');
        $('#inputNuevoSocioNumero').val(AdminSocios.LastSocioNumber + 1);
        AdminSocios.ModalNuevoSocio = new bootstrap.Modal(document.getElementById('modalNuevoSocio'), {});
        AdminSocios.ModalNuevoSocio.show();
    },
    SalvarSocio: function () {
        if (AdminSocios.VerificarDatosSocioNuevo()) {
            Toolbox.ShowLoaderModal();

            $.ajax({
                dataType: 'json',
                type: "POST",
                url: "../proc/admin_controller.php",
                data: {
                    func: "create_socio",
                    numero: $('#inputNuevoSocioNumero').val(),
                    nombre: $('#inputNuevoSocioNombre').val(),
                    documento: $('#inputNuevoSocioDocumento').val(),
                    email: $('#inputNuevoSocioEmail').val(),
                    telefono: $('#inputNuevoSocioTel').val(),
                    fecha_ingreso: $('#inputNuevoSocioFechaInicio').val(),
                    fecha_nacimiento: $('#inputNuevoSocioFechaNacimiento').val()
                }
            }).done(function (data) {
                if (data && !data.error) {
                    AdminSocios.LoadSocios();
                    AdminSocios.ModalNuevoSocio.hide();
                    Toolbox.ShowFeedback('feedbackContainer', 'success', "Socio ingresado con éxito.");
                } else {
                    if (data && data.error) {
                        Toolbox.ShowFeedback('feedbackContainerModalNuevoSocio', 'error', data.error);
                    } else {
                        Toolbox.ShowFeedback('feedbackContainerModalNuevoSocio', 'error', 'Error inesperado durante create_socio');
                    }
                }
                Toolbox.StopLoader();
            });
        }
    },
    VerificarDatosSocioNuevo: function () {
        var error = undefined;

        if (!error && $('#inputNuevoSocioNombre').val() == '') {
            error = 'Falt&oacute; especificar nombre de socio';
        }

        if (!error && $('#inputNuevoSocioNumero').val() == '') {
            error = 'Falt&oacute; especificar numero de socio';
        }
        if (!error && isNaN($('#inputNuevoSocioNumero').val())) {
            error = 'N&uacute;mero de socio invalido';
        }

        // if (!error && $('#inputNuevoSocioEmail').val() == '') {
        //     error = 'Falt&oacute; especificar un email';
        // }

        if (!error && $('#inputNuevoSocioDocumento').val() == '') {
            error = 'Falt&oacute; especificar documento';
        }
        if (!error && isNaN($('#inputNuevoSocioDocumento').val())) {
            error = 'Documento invalido';
        }

        if (!error && $('#inputNuevoSocioFechaInicio').val() == '') {
            error = 'Falt&oacute; especificar fecha de comienzo';
        }

        // if (!error && $('#inputNuevoSocioFechaNacimiento').val() == '') {
        //     error = 'Falt&oacute; especificar fecha de nacimiento';
        // }

        if (error == undefined) {
            Toolbox.ShowFeedback('feedbackContainerModalNuevoSocio', '', '');
        } else {
            Toolbox.ShowFeedback('feedbackContainerModalNuevoSocio', 'error', error);
        }

        return error == undefined;
    },
    OpenModalImportarSocios: function () {
        $('.feedbackContainerModal').css('display', 'none');
        AdminSocios.ModalImportarSocios = new bootstrap.Modal(document.getElementById('importarSociosModal'), {});
        AdminSocios.ModalImportarSocios.show();
    },
    LoadPagos: function () {
        AdminSocios.PagosLoaded = false;
        Toolbox.ShowLoader();
        $.ajax({
            dataType: 'json',
            type: "POST",
            url: "../proc/admin_controller.php",
            data: { func: "get_pagos_suscripciones_socios" }
        }).done(function (data) {
            if (data && !data.error) {
                AdminSocios.PagosPorSuscripcionSocioId = {};
                for (var i = 0; i < data.length; i++) {
                    if (!(data[i].id_suscripcion_socio in AdminSocios.PagosPorSuscripcionSocioId)) {
                        AdminSocios.PagosPorSuscripcionSocioId[data[i].id_suscripcion_socio] = [];
                    }
                    AdminSocios.PagosPorSuscripcionSocioId[data[i].id_suscripcion_socio].push(data[i]);
                    // var descuento = "";
                    // if (data[i].descuento != "" && data[i].descuento != "0.00") {
                    //     descuento = data[i].descuento + ' ' + Toolbox.TransformSpecialTag(data[i].descuento_json)

                    //     if (data[i].descuento_json == "BalanceVoluntariado") {
                    //         AdminSocio.DescuentoBalanceHoras += Number(data[i].descuento);
                    //     }
                    // }

                    // $('#listaPagosSocioTabla').append('<tr onClick="document.location.href = \'/admin_pago.php?id=' + data[i].id + '\'"><td>' + data[i].id + '</td>' +
                    //     '<td>' + data[i].valor + '</td>' +
                    //     '<td>' + Toolbox.MysqlDateToDate(data[i].fecha_pago) + '</td>' +
                    //     '<td>' + Toolbox.TransformSpecialTag(data[i].razon) + '</td>' +
                    //     '<td>' + descuento + '</td>' +
                    //     '<td>' + data[i].notas + '</td>' +
                    //     '<td>' + Toolbox.TransformSpecialTag(data[i].tipo) + '</td></tr>');

                    // if (!(data[i].razon in pagosPorMes)) {
                    //     pagosPorMes[data[i].razon] = Number(data[i].valor);
                    // } else {
                    //     pagosPorMes[data[i].razon] += Number(data[i].valor);
                    // }
                    // if (data[i].descuento != "" && data[i].descuento != "0.00") {
                    //     if (!(data[i].razon in descuentosPorMes)) {
                    //         descuentosPorMes[data[i].razon] = Number(data[i].descuento);
                    //     } else {
                    //         descuentosPorMes[data[i].razon] += Number(data[i].descuento);
                    //     }
                    // }
                }

                // var today = new Date();
                // var startYear = 2016;
                // var startMonth = today.getMonth() + 1;
                // var pagosPorMesSortedData = [];

                // for (var i = today.getFullYear(); i >= startYear; i--) {

                //     for (var j = startMonth; j >= 1; j--) {

                //         var rowString = "";
                //         var mesString = "mensualidad (" + Toolbox.NombreMesesEsp[j] + "/" + i + ")";
                //         if (mesString in pagosPorMes) {

                //             var rowStyle = "";
                //             descuento = "";
                //             if (mesString in descuentosPorMes && descuentosPorMes[mesString] != 'undefined') {
                //                 descuento = descuentosPorMes[mesString];
                //             }

                //             if (Number(descuento + pagosPorMes[mesString]) < AdminSocio.calcularValorCuota(j, i)) {
                //                 rowStyle = ' style="background-color:yellow;"';
                //             }

                //             rowString = '<tr>' +
                //                 '<td' + rowStyle + '>' + Toolbox.TransformSpecialTag(mesString) + '</td>' +
                //                 '<td' + rowStyle + '>' + pagosPorMes[mesString] + '</td>' +
                //                 '<td' + rowStyle + '>' + descuento + '</td>' +
                //                 '<td' + rowStyle + '>' + Number(descuento + pagosPorMes[mesString]) + '</td></tr>';

                //         } else {
                //             rowString = '<tr>' +
                //                 '<td style="background-color: #ca5757">' + Toolbox.TransformSpecialTag(mesString) + '</td>' +
                //                 '<td style="background-color: #ca5757">-</td>' +
                //                 '<td style="background-color: #ca5757">-</td>' +
                //                 '<td style="background-color: #ca5757">-</td></tr>';
                //         }

                //         pagosPorMesSortedData.push(rowString);
                //     }

                //     startMonth = 12;
                // }

                // for (var i = 0; i < pagosPorMesSortedData.length; i++) {
                //     $('#listaPagosPorMesSocioTabla').append(pagosPorMesSortedData[i]);
                // }

                AdminSocios.PagosLoaded = true;
                AdminSocios.DisplaySuscripciones();
            }
            else {
                if (data && data.error) {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', data.error);
                } else {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', 'Error inesperado durante get_pagos_suscripciones_socios');
                }
            }
            Toolbox.StopLoader();
        });
    },
    LoadSuscripcionesSocios: function () {
        AdminSocios.SuscripcionesSociosLoaded = false;
        Toolbox.ShowLoader();

        $.ajax({
            dataType: 'json',
            type: "POST",
            url: "../proc/admin_controller.php",
            data: { func: "get_suscripciones_socios" }
        }).done(function (data) {
            if (data && !data.error) {
                AdminSocios.SuscripcionesSocios = {};
                AdminSocios.SuscripcionesSociosPorIdSocio = {};
                for (var i = 0; i < data.length; i++) {
                    if (!(data[i].id_socio in AdminSocios.SuscripcionesSociosPorIdSocio)) {
                        AdminSocios.SuscripcionesSociosPorIdSocio[data[i].id_socio] = [];
                    }
                    AdminSocios.SuscripcionesSociosPorIdSocio[data[i].id_socio].push(data[i]);
                    AdminSocios.SuscripcionesSocios[data[i].id] = data[i];
                }
                AdminSocios.SuscripcionesSociosLoaded = true;
                AdminSocios.DisplaySuscripciones();

            } else {
                if (data && data.error) {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', data.error);
                } else {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', 'Error inesperado durante get_suscripciones_socios');
                }
            }
            Toolbox.StopLoader();
        });
    },
    LoadSuscripciones: function () {
        AdminSocios.SuscripcionesLoaded = false;
        Toolbox.ShowLoader();

        $.ajax({
            dataType: 'json',
            type: "POST",
            url: "../proc/admin_controller.php",
            data: { func: "get_suscripciones" }
        }).done(function (data) {
            if (data && !data.error) {
                AdminSocios.Suscripciones = {};
                for (var i = 0; i < data.length; i++) {
                    AdminSocios.Suscripciones[data[i].id] = data[i];
                }

                AdminSocios.SuscripcionesLoaded = true;
                AdminSocios.DisplaySuscripciones();
            } else {
                if (data && data.error) {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', data.error);
                } else {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', 'Error inesperado durante get_suscripciones');
                }
            }
            Toolbox.StopLoader();
        });
    },
    DisplaySuscripciones: function () {
        if (AdminSocios.SociosLoaded == true
            && AdminSocios.PagosLoaded == true
            && AdminSocios.SuscripcionesLoaded == true
            && AdminSocios.SuscripcionesSociosLoaded == true) {
            Object.keys(AdminSocios.Socios).forEach(function (socio_id) {
                if (socio_id in AdminSocios.SuscripcionesSociosPorIdSocio) {
                    var suscripcion_socio = AdminSocios.SuscripcionesSociosPorIdSocio[Number(socio_id)][0];
                    $('.suscripcion_socio_' + socio_id).html(Toolbox.TransformSpecialTag(
                        AdminSocios.Suscripciones[suscripcion_socio.id_suscripcion].nombre
                    ));

                    var ultima_obligacion_razon = 0;
                    if (suscripcion_socio.id in AdminSocios.PagosPorSuscripcionSocioId) {
                        for (var i = 0; i < AdminSocios.PagosPorSuscripcionSocioId[suscripcion_socio.id].length; i++) {
                            if (Number(AdminSocios.PagosPorSuscripcionSocioId[suscripcion_socio.id][i].razon) > ultima_obligacion_razon) {
                                ultima_obligacion_razon = AdminSocios.PagosPorSuscripcionSocioId[suscripcion_socio.id][i].razon;
                            }
                        }
                    }

                    var html_obligacion = "";
                    if (AdminSocios.Suscripciones[suscripcion_socio.id_suscripcion].ciclo == null ||
                        AdminSocios.Suscripciones[suscripcion_socio.id_suscripcion].ciclo == '') {
                        html_obligacion = '<img class="socio_list_obligacion_checked" src="../images/checked.png">';
                    } else if (ultima_obligacion_razon == 0) {
                        html_obligacion = '<span class="detalle">No hay pagos registrados.</span>';
                    } else {
                        html_obligacion = '<img class="socio_list_obligacion_checked" src="../images/checked.png">'
                            + '<span class="detalle">' + ultima_obligacion_razon + '</span>';
                    }

                    $('.obligacion_socio_' + socio_id).html(html_obligacion);
                }
            });
        }
    }
}

$(document).ready(function () {

    Toolbox.UpdateActiveNavbar('nav_lista_socios');
    AdminSocios.LoadSocios();
    AdminSocios.LoadPagos();
    AdminSocios.LoadSuscripciones();
    AdminSocios.LoadSuscripcionesSocios();
});
