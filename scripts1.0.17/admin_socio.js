var AdminSocio = {
    IdSocio: null,
    Tags: {},
    SocioData: {},
    SocioDataLoaded: false,
    CuotaCostos: null,
    CurrentCostoCuota: 0,
    BalanceHoras: 0,
    DescuentoBalanceHoras: 0,
    ModalEditarDatos: null,
    ModalCambiarEstado: null,
    ModalAgregarPago: null,
    ModalAgregarHoras: null,
    Suscripciones: {},
    SuscripcionesLoaded: false,
    ModalNuevaSuscripcion: null,
    EditandoSuscripcionId: null,
    SociosSinSuscripcion: null,
    Socios: null,
    SociosLoaded: false,

    GetTags: function () {
        Toolbox.ShowLoader();

        $.ajax({
            dataType: 'json',
            type: "POST",
            url: "../proc/admin_controller.php",
            data: { func: "get_tags" }
        }).done(function (data) {
            if (data && !data.error) {

                for (var i = 0; i < data.length; i++) {
                    AdminSocio.Tags[data[i].id] = data[i];
                }

                if (AdminSocio.New) {
                    AdminSocio.LoadNewForm();
                } else if (AdminSocio.IdSocio) {
                    AdminSocio.LoadSocio();
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
    SalvarSocio: function () {

        if (AdminSocio.VerificarDatosSocio()) {
            Toolbox.ShowLoaderModal();

            $.ajax({
                dataType: 'json',
                type: "POST",
                url: "../proc/admin_controller.php",
                data: {
                    func: "update_socio",
                    id: AdminSocio.IdSocio,
                    numero: $('#inputEditarDatosNumero').val(),
                    nombre: $('#inputEditarDatosNombre').val(),
                    documento: $('#inputEditarDatosDocumento').val(),
                    email: $('#inputEditarDatosEmail').val(),
                    telefono: $('#inputEditarDatosTel').val(),
                    fecha_ingreso: $('#inputEditarDatosFechaInicio').val(),
                    fecha_nacimiento: $('#inputEditarDatosFechaNacimiento').val()
                }
            }).done(function (data) {
                if (data && !data.error) {
                    AdminSocio.LoadSocio();
                    AdminSocio.ModalEditarDatos.hide();
                } else {
                    if (data && data.error) {
                        Toolbox.ShowFeedback('feedbackContainerModalEditarDatos', 'error', data.error);
                    } else {
                        Toolbox.ShowFeedback('feedbackContainerModalEditarDatos', 'error', 'Unexpected error');
                    }
                }
                Toolbox.StopLoader();
            });
        }
    },
    VerificarDatosSocio: function () {

        var error = undefined;

        if (!error && $('#inputEditarDatosNombre').val() == '') {
            error = 'Falt&oacute; especificar nombre de socio';
        }

        if (!error && $('#inputEditarDatosNumero').val() == '') {
            error = 'Falt&oacute; especificar numero de socio';
        }
        if (!error && isNaN($('#inputEditarDatosNumero').val())) {
            error = 'N&uacute;mero de socio invalido';
        }

        // if (!error && $('#inputEditarDatosEmail').val() == '') {
        //     error = 'Falt&oacute; especificar un email';
        // }

        // if (!error && $('#inputEditarDatosDocumento').val() == '') {
        //     error = 'Falt&oacute; especificar documento';
        // }
        if (!error && $('#inputEditarDatosDocumento').val() != '' && isNaN($('#inputEditarDatosDocumento').val())) {
            error = 'Documento invalido';
        }

        if (!error && $('#inputEditarDatosFechaInicio').val() == '') {
            error = 'Falt&oacute; especificar fecha de comienzo';
        }

        // if (!error && $('#inputEditarDatosFechaNacimiento').val() == '') {
        //     error = 'Falt&oacute; especificar fecha de nacimiento';
        // }

        if (error == undefined) {
            Toolbox.ShowFeedback('feedbackContainerModalEditarDatos', '', '');
        } else {
            Toolbox.ShowFeedback('feedbackContainerModalEditarDatos', 'error', error);
        }

        return error == undefined;
    },
    LoadSocio: function () {
        AdminSocio.SocioDataLoaded = false;
        Toolbox.ShowLoader();
        $.ajax({
            dataType: 'json',
            type: "POST",
            url: "../proc/admin_controller.php",
            data: { func: "get_socio", id: AdminSocio.IdSocio }
        }).done(function (data) {
            if (data && !data.error) {
                AdminSocio.SocioData = data;

                $('#socioDatosValorEstado').removeClass('bg-success');
                $('#socioDatosValorEstado').removeClass('bg-danger');
                if (data.activo == true) {
                    $('#socioDatosValorEstado').addClass('bg-success');
                    $('#socioDatosValorEstado').html("Activo/a");
                } else {
                    $('#socioDatosValorEstado').addClass('bg-danger');
                    $('#socioDatosValorEstado').html("Suspendido/a");
                }

                $("#socioDatosFieldNombre").css('display', 'none');
                $("#socioBtnSalvarContainer").css('display', 'none');
                $("#socioNombreTitulo").html(data.nombre + '<i class="icon-edit socioIconBtnTitle" onClick="AdminSocio.EditSocio();" title="Editar socio"></i><i class="icon-eye-open socioIconBtnTitle" onClick="AdminSocio.OpenSocioView();" title="Vista de socio"></i>');
                $("#socioDatosValorNumero").html(data.numero);
                $("#socioDatosValorDocumento").html(data.documento);
                $("#socioDatosValorEmail").html(data.email);
                $("#socioDatosValorFechaIngreso").html(Toolbox.MysqlDateToDate(data.fecha_ingreso));
                if (data.fecha_egreso != null) {
                    $("#socioDatosValorFechaEgreso").html(Toolbox.MysqlDateToDate(data.fecha_egreso));
                } else {
                    $("#socioDatosValorFechaEgreso").html('-');
                }
                $("#socioDatosValorFechaIngreso").html(Toolbox.MysqlDateToDate(data.fecha_ingreso));
                $("#socioDatosValorFechaNacimiento").html(Toolbox.MysqlDateToDate(data.fecha_nacimiento));
                $("#socioDatosValorTelefono").html(data.telefono);
                AdminSocio.SocioDataLoaded = true;
                AdminSocio.LoadSuscripciones();

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
    OpenModalNuevoPago: function () {

        $('.feedbackContainerModal').css('display', 'none');
        $('#socioIngresarPagoValor').val("0.00");
        $('#socioIngresarPagoDescuento').val("0.00");
        $('#socioIngresarPagoNotas').val('');
        $('#socioIngresarPagoFecha').val('');

        AdminSocio.ModalAgregarPago = new bootstrap.Modal(document.getElementById('modalNuevoPagoSocio'), {});
        AdminSocio.ModalAgregarPago.show();
    },
    OnChangeMonto: function () {
        //$('#socioIngresarPagoDescuento').val(AdminSocio.CurrentCostoCuota - $('#socioIngresarPagoValor').val());
    },
    IngresarPago: function () {
        if (AdminSocio.VerificarDatosPago()) {

            var razonPago = $("#socioIngresarPagoRazon").val();
            if ($("#socioIngresarPagoRazon").val() == "mensualidad") {
                razonPago = "mensualidad (" + $('#socioIngresarPagoRazonMensualidadMes').val() + "/" + $('#socioIngresarPagoRazonMensualidadAnio').val() + ")";
            }

            Toolbox.ShowLoaderModal();
            $.ajax({
                dataType: 'json',
                type: "POST",
                url: "../proc/admin_controller.php",
                data: {
                    func: "ingresar_pago",
                    id_socio: AdminSocio.IdSocio,
                    valor: $("#socioIngresarPagoValor").val(),
                    fecha_pago: $("#socioIngresarPagoFecha").val(),
                    razon: razonPago,
                    notas: $("#socioIngresarPagoNotas").val(),
                    tipo: $("#socioIngresarPagoTipo").val(),
                    descuento: $("#socioIngresarPagoDescuento").val(),
                    descuento_json: $("#socioIngresarPagoRazonDescuento").val()
                }
            }).done(function (data) {
                if (data && !data.error) {
                    AdminSocio.LoadPagos();
                    AdminSocio.ModalAgregarPago.hide();
                } else {
                    if (data && data.error) {
                        Toolbox.ShowFeedback('feedbackContainerModalIngresarPago', 'error', data.error);
                    } else {
                        Toolbox.ShowFeedback('feedbackContainerModalIngresarPago', 'error', 'Error inesperado durante ingresar_pago');
                    }
                }
                Toolbox.StopLoaderModal();
            });
        }
    },
    VerificarDatosPago: function () {
        var error = undefined;

        if (!error && $('#socioIngresarPagoValor').val() == '') {
            error = 'Falt&oacute; especificar el valor del pago';
        } else if (!error && $('#socioIngresarPagoFecha').val() == '') {
            error = 'Falto especificar fecha de pago';
        } else if (!error && isNaN($('#socioIngresarPagoValor').val())) {
            error = 'Valor invalido';
        }
        //else if (!error && $('#socioIngresarPagoRazon').val() == "mensualidad" &&
        //    AdminSocio.CurrentCostoCuota > 0 &&
        //    $('#socioIngresarPagoValor').val() + $('#socioIngresarPagoDescuento').val() > AdminSocio.CurrentCostoCuota){
        //
        //    error = 'El monto y el descuento exceden el costo de la cuota mensual establecida de $' + AdminSocio.CurrentCostoCuota;
        //}

        if (error == undefined) {
            Toolbox.ShowFeedback('feedbackContainerModalIngresarPago', '', '');
        }
        else {
            Toolbox.ShowFeedback('feedbackContainerModalIngresarPago', 'error', error);
        }

        return error == undefined;
    },
    LoadPagos: function () {
        Toolbox.ShowLoader();
        $.ajax({
            dataType: 'json',
            type: "POST",
            url: "../proc/admin_controller.php",
            data: { func: "get_pagos_socio", id_socio: AdminSocio.IdSocio }
        }).done(function (data) {
            if (data && !data.error) {

                $('#listaPagosSocioTabla').html("");
                $('#listaPagosPorMesSocioTabla').html("");

                //pagos por mes data
                var pagosPorMes = {};
                var descuentosPorMes = {};

                for (var i = 0; i < data.length; i++) {

                    var descuento = "";
                    if (data[i].descuento != "" && data[i].descuento != "0.00") {
                        descuento = data[i].descuento + ' ' + Toolbox.TransformSpecialTag(data[i].descuento_json)

                        if (data[i].descuento_json == "BalanceVoluntariado") {
                            AdminSocio.DescuentoBalanceHoras += Number(data[i].descuento);
                        }
                    }

                    $('#listaPagosSocioTabla').append('<tr onClick="document.location.href = \'/admin_pago.php?id=' + data[i].id + '\'"><td>' + data[i].id + '</td>' +
                        '<td>' + data[i].valor + '</td>' +
                        '<td>' + Toolbox.MysqlDateToDate(data[i].fecha_pago) + '</td>' +
                        '<td>' + Toolbox.TransformSpecialTag(data[i].razon) + '</td>' +
                        '<td>' + descuento + '</td>' +
                        '<td>' + data[i].notas + '</td>' +
                        '<td>' + Toolbox.TransformSpecialTag(data[i].tipo) + '</td></tr>');

                    if (!(data[i].razon in pagosPorMes)) {
                        pagosPorMes[data[i].razon] = Number(data[i].valor);
                    } else {
                        pagosPorMes[data[i].razon] += Number(data[i].valor);
                    }
                    if (data[i].descuento != "" && data[i].descuento != "0.00") {
                        if (!(data[i].razon in descuentosPorMes)) {
                            descuentosPorMes[data[i].razon] = Number(data[i].descuento);
                        } else {
                            descuentosPorMes[data[i].razon] += Number(data[i].descuento);
                        }
                    }
                }

                var today = new Date();
                var startYear = 2016;
                var startMonth = today.getMonth() + 1;
                var pagosPorMesSortedData = [];

                for (var i = today.getFullYear(); i >= startYear; i--) {

                    for (var j = startMonth; j >= 1; j--) {

                        var rowString = "";
                        var mesString = "mensualidad (" + Toolbox.NombreMesesEsp[j] + "/" + i + ")";
                        if (mesString in pagosPorMes) {

                            var rowStyle = "";
                            descuento = "";
                            if (mesString in descuentosPorMes && descuentosPorMes[mesString] != 'undefined') {
                                descuento = descuentosPorMes[mesString];
                            }

                            if (Number(descuento + pagosPorMes[mesString]) < AdminSocio.calcularValorCuota(j, i)) {
                                rowStyle = ' style="background-color:yellow;"';
                            }

                            rowString = '<tr>' +
                                '<td' + rowStyle + '>' + Toolbox.TransformSpecialTag(mesString) + '</td>' +
                                '<td' + rowStyle + '>' + pagosPorMes[mesString] + '</td>' +
                                '<td' + rowStyle + '>' + descuento + '</td>' +
                                '<td' + rowStyle + '>' + Number(descuento + pagosPorMes[mesString]) + '</td></tr>';

                        } else {
                            rowString = '<tr>' +
                                '<td style="background-color: #ca5757">' + Toolbox.TransformSpecialTag(mesString) + '</td>' +
                                '<td style="background-color: #ca5757">-</td>' +
                                '<td style="background-color: #ca5757">-</td>' +
                                '<td style="background-color: #ca5757">-</td></tr>';
                        }

                        pagosPorMesSortedData.push(rowString);
                    }

                    startMonth = 12;
                }

                for (var i = 0; i < pagosPorMesSortedData.length; i++) {
                    $('#listaPagosPorMesSocioTabla').append(pagosPorMesSortedData[i]);
                }

                AdminSocio.GetHorasVoluntariado();
            }
            else {
                if (data && data.error) {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', data.error);
                } else {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', 'Unexpected error');
                }
            }
            Toolbox.StopLoader();
        });
    },
    CambiarEstadoSocio: function () {

        var nuevoEstado;
        var confirmacion = false;
        if ($('#socioEditarEstado').val() == 'activo') {
            if (AdminSocio.SocioData.activo == true) {
                AdminSocio.ModalCambiarEstado.hide();
                return;
            } else {
                nuevoEstado = true;
            }
        } else if ($('#socioEditarEstado').val() == 'suspendido') {
            if (AdminSocio.SocioData.activo != true) {
                AdminSocio.ModalCambiarEstado.hide();
                return;
            } else {
                nuevoEstado = false;
            }
        } else if ($('#socioEditarEstado').val() == 'eliminar') {
            confirmacion = confirm('Eliminar socio permanentemente?');
        }

        if ($('#socioEditarEstado').val() == 'eliminar') {
            if (confirmacion) {
                Toolbox.ShowLoader();
                $.ajax({
                    dataType: 'json',
                    type: "POST",
                    url: "../proc/admin_controller.php",
                    data: { func: "eliminar_socio", id_socio: AdminSocio.IdSocio }
                }).done(function (data) {
                    if (data && !data.error) {
                        AdminSocio.LoadSocio();
                        AdminSocio.ModalCambiarEstado.hide();
                    } else {
                        if (data && data.error) {
                            Toolbox.ShowFeedback('feedbackContainerModalCambiarEstado', 'error', data.error);
                        } else {
                            Toolbox.ShowFeedback('feedbackContainerModalCambiarEstado', 'error', 'Unexpected error');
                        }
                    }
                    Toolbox.StopLoader();
                });
            }
        } else {
            Toolbox.ShowLoader();
            $.ajax({
                dataType: 'json',
                type: "POST",
                url: "../proc/admin_controller.php",
                data: {
                    func: "update_estado_socio",
                    id_socio: AdminSocio.IdSocio,
                    activo: nuevoEstado
                }
            }).done(function (data) {
                if (data && !data.error) {
                    AdminSocio.LoadSocio();
                    AdminSocio.ModalCambiarEstado.hide();
                } else {
                    if (data && data.error) {
                        Toolbox.ShowFeedback('feedbackContainerModalCambiarEstado', 'error', data.error);
                    } else {
                        Toolbox.ShowFeedback('feedbackContainerModalCambiarEstado', 'error', 'Unexpected error');
                    }
                }
                Toolbox.StopLoader();
            });
        }
    },
    TogglePagoRazon: function () {
        if ($('#socioIngresarPagoRazon').val() == "mensualidad") {
            $('#socioIngresarPagoRazonMensualidadMes').parent().css('display', 'block');
            $('#socioIngresarPagoRazonMensualidadAnio').parent().css('display', 'block');
        } else {
            $('#socioIngresarPagoRazonMensualidadMes').parent().css('display', 'none');
            $('#socioIngresarPagoRazonMensualidadAnio').parent().css('display', 'none');
        }
    },
    OpenSocioView: function () {
        if (!AdminSocio.SocioData.hash) {
            Toolbox.ShowLoader();
            $.ajax({
                dataType: 'json',
                type: "POST",
                url: "../proc/admin_controller.php",
                data: { func: "generar_hash", id: AdminSocio.IdSocio }
            }).done(function (data) {
                if (data && !data.error) {

                    window.open(GLOBAL_domain + '/vista_socio.php?h=' + data,
                        '_blank'
                    );

                } else {
                    if (data && data.error) {
                        Toolbox.ShowFeedback('feedbackContainer', 'error', data.error);
                    } else {
                        Toolbox.ShowFeedback('feedbackContainer', 'error', 'Error al cancelar deuda.');
                    }
                }
                Toolbox.StopLoader();
            });
        } else {
            window.open(GLOBAL_domain + '/vista_socio.php?h=' + AdminSocio.SocioData.hash,
                '_blank'
            );
        }
    },
    OnChangeRazonDescuentoPago: function () {
        if ($('#socioIngresarPagoRazonDescuento').val() == "BalanceVoluntariado") {
            var aDescountar = Number(AdminSocio.BalanceHoras - AdminSocio.DescuentoBalanceHoras);
            if (aDescountar > AdminSocio.CurrentCostoCuota) {
                aDescountar = AdminSocio.CurrentCostoCuota;
            }

            $('#socioIngresarPagoDescuento').val(aDescountar);
        }
    },
    OpenModalEditSocio: function () {
        $('.feedbackContainerModal').css('display', 'none');
        $('#inputEditarDatosNumero').val(AdminSocio.SocioData.numero);
        $('#inputEditarDatosEmail').val(AdminSocio.SocioData.email);
        $('#inputEditarDatosDocumento').val(AdminSocio.SocioData.documento);
        $('#inputEditarDatosNombre').val(AdminSocio.SocioData.nombre);
        $('#inputEditarDatosTel').val(AdminSocio.SocioData.telefono);
        $('#inputEditarDatosFechaNacimiento').val(AdminSocio.SocioData.fecha_nacimiento);
        $('#inputEditarDatosFechaInicio').val(AdminSocio.SocioData.fecha_ingreso);

        AdminSocio.ModalEditarDatos = new bootstrap.Modal(document.getElementById('modalEditarDatos'), {});
        AdminSocio.ModalEditarDatos.show();
    },
    OpenModalCambiarEstado: function () {
        $('.feedbackContainerModal').css('display', 'none');
        AdminSocio.ModalCambiarEstado = new bootstrap.Modal(document.getElementById('modalCambiarEstadoSocio'), {});
        AdminSocio.ModalCambiarEstado.show();
    },
    OpenModalNuevaSuscripcion: function () {
        AdminSocio.EditandoSuscripcionId = null;
        $('.feedbackContainerModal').css('display', 'none');

        $('#socioNuevaSuscripcionTipo').prop('disabled', false);
        $('#botonSuscribirSocio').html('Suscribir');
        $('#tituloModalSuscripcion').html('Nueva suscripción');

        AdminSocio.ModalNuevaSuscripcion = new bootstrap.Modal(document.getElementById('ModalNuevaSuscripcion'), {});
        AdminSocio.ModalNuevaSuscripcion.show();
    },
    OnChangeSuscripcionTipo: function () {
        if (AdminSocio.Suscripciones[$('#socioNuevaSuscripcionTipo').val()].includes_sub_socios != null
            && Number(AdminSocio.Suscripciones[$('#socioNuevaSuscripcionTipo').val()].includes_sub_socios) > 0) {
            for (var i = 1; i <= 5; i++) {
                if (i <= Number(AdminSocio.Suscripciones[$('#socioNuevaSuscripcionTipo').val()].includes_sub_socios)) {
                    $('#socioNuevaSuscripcionSociosPatrocinados' + i).css('display', 'block');
                } else {
                    $('#socioNuevaSuscripcionSociosPatrocinados' + i).css('display', 'none');
                }
            }
            $('.selectorMiembrosFamiliares').css('display', 'block');
        } else {
            $('.selectorMiembrosFamiliares').css('display', 'none');
        }
    },
    LoadSuscripciones: function () {
        Toolbox.ShowLoader();
        AdminSocio.SuscripcionesLoaded = false;

        $.ajax({
            dataType: 'json',
            type: "POST",
            url: "../proc/admin_controller.php",
            data: { func: "get_suscripciones" }
        }).done(function (data) {
            if (data && !data.error) {
                AdminSocio.Suscripciones = {};
                $('#socioNuevaSuscripcionTipo').html('');
                for (var i = 0; i < data.length; i++) {
                    AdminSocio.Suscripciones[data[i].id] = data[i];
                    $('#socioNuevaSuscripcionTipo').append('<option value="' + data[i].id + '">' + data[i].nombre + '</option>');
                }
                AdminSocio.SuscripcionesLoaded = true;
                AdminSocio.DisplaySuscripciones();
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
        if (AdminSocio.SuscripcionesLoaded == true && AdminSocio.SociosLoaded == true) {

            if (AdminSocio.SocioData.suscripciones != 'undefinded'
                && AdminSocio.SocioData.suscripciones != null) {
                $('.listaSuscripciones').html("");
                for (var i = 0; i < AdminSocio.SocioData.suscripciones.length; i++) {

                    var estado = '<div class="badge bg-success suscripcion_estado">Activa</div>';
                    if (AdminSocio.SocioData.suscripciones[i].activa == false) {
                        estado = '<div class="badge bg-danger suscripcion_estado">Suspendida</div>';
                    }

                    var socios_incluidos = "";
                    if (AdminSocio.SocioData.suscripciones[i].vinculos != null) {
                        var vinculos = AdminSocio.SocioData.suscripciones[i].vinculos;
                        vinculos = String(vinculos).split(",");

                        if (vinculos.length > 0) {

                            socios_incluidos = '<div class="row"><div class="col-8"><div class="row mb-3"><h5>Miembros familiares</h5>';
                            if (AdminSocio.Suscripciones[AdminSocio.SocioData.suscripciones[i].id_suscripcion].ciclo == null
                                || AdminSocio.Suscripciones[AdminSocio.SocioData.suscripciones[i].id_suscripcion].ciclo == '') {
                                socios_incluidos = '<div class="row"><div class="col-8"><div class="row mb-3"><h5>Miembro patrocinador</h5>';
                            }

                            for (var j = 0; j < vinculos.length; j++) {
                                socios_incluidos += '<a class="socio_vinculado" href="' + GLOBAL_domain + '/admin/admin_socio.php?id=' + vinculos[j] + '">'
                                    + '<img src="../images/socio_silueta.png" class="socio_vinculado_avatar">'
                                    + '<h6>' + AdminSocio.Socios[vinculos[j]].nombre + '</h6>'
                                    + '</a>';
                            }

                            socios_incluidos += '</div></div></div>';
                        }
                    }

                    $('.listaSuscripciones').append(
                        '<div class="suscripcion_box">' +
                        '<h4>' + AdminSocio.Suscripciones[AdminSocio.SocioData.suscripciones[i].id_suscripcion].nombre + '</h4>' +
                        '<div class="row cajaBordeada">' +
                        '<div class="row">' +

                        '<div class="col">' +

                        '<div class="row">' +
                        '<h5>Estado</h5>' +
                        estado +
                        '</div>' +

                        '</div>' +
                        '<div class="col">' +

                        '<div class="row">' +
                        '<h5>Fecha inicio</h5>' +
                        '<p class="socioDatosValor">' + Toolbox.MysqlDateToDate(AdminSocio.SocioData.suscripciones[i].fecha_inicio) + '</p>' +
                        '</div>' +

                        '</div>' +
                        '<div class="col">' +

                        '<div class="row">' +
                        '<button class="btn btn-primary btn-columna" onClick="AdminSocio.OpenModalEditSuscripcion(' + AdminSocio.SocioData.suscripciones[i].id + ');">Editar</button>' +
                        '</div>' +

                        '</div>' +
                        '</div>' +

                        socios_incluidos +

                        '<div class="row">' +
                        '<div class="col-8">' +

                        '<div class="row">' +
                        '<h5>Pagos</h5>' +
                        '<div id="tabla_pagos_suscripcion_' + AdminSocio.SocioData.suscripciones[i].id + '" class="tabla_pagos_suscripcion">' +
                        '<img src="../images/loaderModal.gif" class=""></img>' +
                        '</div>' +
                        '</div>' +

                        '</div>' +
                        '</div>' +

                        '</div>' +
                        '</div>'
                    );

                    AdminSocio.LoadPagosSuscripcionSocio(AdminSocio.SocioData.suscripciones[i]);
                }
            }
        }
    },
    AgregarSuscripcion: function () {
        if (AdminSocio.VerificarDatosNuevaSuscripcion()) {

            var id_suscripcion = $('#socioNuevaSuscripcionTipo').val();
            var socios_incluidos = [];

            if (AdminSocio.Suscripciones[id_suscripcion].includes_sub_socios != null
                && Number(AdminSocio.Suscripciones[id_suscripcion].includes_sub_socios) > 0) {
                for (var i = 1; i <= Number(AdminSocio.Suscripciones[id_suscripcion].includes_sub_socios); i++) {
                    socios_incluidos.push($('#socioNuevaSuscripcionSociosPatrocinados' + i).val());
                }
            }

            Toolbox.ShowLoaderModal();
            Toolbox.ShowFeedback('feedbackContainerModalNuevaSuscripcion', '', '');

            $.ajax({
                dataType: 'json',
                type: "POST",
                url: "../proc/admin_controller.php",
                data: {
                    func: "agregar_suscripcion_socio",
                    id_suscripcion: id_suscripcion,
                    id_socio: AdminSocio.IdSocio,
                    fecha_inicio: $('#socioNuevaSuscripcionFechaInicio').val(),
                    socios_incluidos: socios_incluidos
                }
            }).done(function (data) {
                if (data && !data.error) {
                    AdminSocio.LoadSocio();
                    AdminSocio.ModalNuevaSuscripcion.hide();
                    Toolbox.ShowFeedback('feedbackContainer', 'success', "Suscripción agregada con éxito.");
                } else {
                    if (data && data.error) {
                        Toolbox.ShowFeedback('feedbackContainerModalNuevaSuscripcion', 'error', data.error);
                    } else {
                        Toolbox.ShowFeedback('feedbackContainerModalNuevaSuscripcion', 'error', 'Error inesperado durante agregar_suscripcion_socio');
                    }
                }
                Toolbox.StopLoaderModal();
            });
        }
    },
    VerificarDatosNuevaSuscripcion() {
        var suscripcion = AdminSocio.Suscripciones[$('#socioNuevaSuscripcionTipo').val()];

        if (suscripcion.includes_sub_socios != null && suscripcion.includes_sub_socios > 0) {
            for (var i = 1; i <= 5; i++) {
                for (var j = 1; j <= 5; j++) {
                    if (i == j) {
                        continue;
                    }

                    if ($('#socioNuevaSuscripcionSociosPatrocinados' + i).val() != ''
                        && $('#socioNuevaSuscripcionSociosPatrocinados' + j).val() != ''
                        && $('#socioNuevaSuscripcionSociosPatrocinados' + i).val() == $('#socioNuevaSuscripcionSociosPatrocinados' + j).val()) {
                        Toolbox.ShowFeedback('feedbackContainerModalNuevaSuscripcion', 'error', 'No se puede asignar el mismo socio más de una vez');
                        return false;
                    }
                }
            }
        }

        return true;
    },
    LoadPagosSuscripcionSocio: function (suscripcion_socio) {
        Toolbox.ShowLoader();

        $.ajax({
            dataType: 'json',
            type: "POST",
            url: "../proc/admin_controller.php",
            data: {
                func: "get_pagos_suscripciones_socio",
                id: suscripcion_socio.id
            }
        }).done(function (data) {
            if (data && !data.error && Array.isArray(data)) {
                AdminSocio.DisplayPagosSuscripcion(
                    AdminSocio.Suscripciones[suscripcion_socio.id_suscripcion],
                    suscripcion_socio,
                    data
                );
            } else {
                if (data && data.error) {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', data.error);
                } else {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', 'Error inesperado durante get_pagos_suscripciones_socio');
                }
            };
            Toolbox.StopLoader();
        });
    },
    DisplayPagosSuscripcion: function (suscripcion, suscripcion_socio, pagos) {

        if (suscripcion.ciclo == null || suscripcion.ciclo == '') {
            $('#tabla_pagos_suscripcion_' + suscripcion_socio.id).html("Esta suscripcion no supone obligaciones.");
            return;
        }
        var today = new Date();
        var inicio_suscripcion = Toolbox.JsDateFromMysqlDate(suscripcion_socio.fecha_inicio);
        var obligaciones = [];
        if (suscripcion.ciclo == 'anual') {
            for (var anio = today.getFullYear(); anio >= inicio_suscripcion.getFullYear(); anio--) {
                obligaciones.push(anio);
            }
        } else if (suscripcion.ciclo == 'mensual') {
        } else if (suscripcion.ciclo == 'semestral') {
        }

        var html_obligaciones = '<table class="table table-hover">' +
            '<thead><tr><th>Obligación</th><th>Costo</th><th>Pagos</th></tr></thead>' +
            '<tbody>';
        for (var i = 0; i < obligaciones.length; i++) {
            var pagos_list = '<div class="pagos_table_sublist">';
            for (var j = 0; j < pagos.length; j++) {
                if (pagos[j].razon == obligaciones[i]) {
                    pagos_list += '<div class="pago_item badge bg-success">';
                    pagos_list += '<span class="monto">' + Toolbox.FormatNumber(pagos[j].valor) + '</span>';
                    pagos_list += '<span class="fecha">' + Toolbox.MysqlDateToDate(pagos[j].fecha_pago) + '</span>';
                    pagos_list += '</div>';
                }
            }
            pagos_list += '</div>';

            var costo = Toolbox.GetPrecioObligacionSuscripcion(suscripcion, obligaciones[i]);
            if (costo == null) {
                costo = "No especificado";
            }

            html_obligaciones += '<tr>' +
                '<td>' + obligaciones[i] + '</td>' +
                '<td>' + Toolbox.FormatNumber(Number(costo)) + '</td>' +
                '<td>' + pagos_list + '</td>' +
                '</tr>';
        }
        html_obligaciones += '</tbody></table>';
        $('#tabla_pagos_suscripcion_' + suscripcion_socio.id).html(html_obligaciones);
    },
    OpenModalEditSuscripcion: function (id_suscripcion_socio) {
        AdminSocio.EditandoSuscripcionId = id_suscripcion_socio;
        $('.feedbackContainerModal').css('display', 'none');

        var suscripcion_socio = null;
        for (var i = 0; i < AdminSocio.SocioData.suscripciones.length; i++) {
            if (AdminSocio.SocioData.suscripciones[i].id == id_suscripcion_socio) {
                suscripcion_socio = AdminSocio.SocioData.suscripciones[i];
                break;
            }
        }

        $('#socioNuevaSuscripcionTipo').val(suscripcion_socio.id_suscripcion);
        $('#socioNuevaSuscripcionTipo').prop('disabled', true);
        $('#botonSuscribirSocio').html('Guardar cambios');
        $('#tituloModalSuscripcion').html('Editar suscripción');
        $('#socioNuevaSuscripcionFechaInicio').val(suscripcion_socio.fecha_inicio);

        AdminSocio.ModalNuevaSuscripcion = new bootstrap.Modal(document.getElementById('ModalNuevaSuscripcion'), {});
        AdminSocio.ModalNuevaSuscripcion.show();
    },
    GuardarSuscripcion: function () {
        if (AdminSocio.EditandoSuscripcionId != null && AdminSocio.EditandoSuscripcionId != "") {
            AdminSocio.ModificarSuscripcion();
        } else {
            AdminSocio.AgregarSuscripcion();
        }
    },
    ModificarSuscripcion: function () {
        Toolbox.ShowLoaderModal();
        Toolbox.ShowFeedback('feedbackContainerModalNuevaSuscripcion', '', '');

        $.ajax({
            dataType: 'json',
            type: "POST",
            url: "../proc/admin_controller.php",
            data: {
                func: "modificar_suscripcion_socio",
                id: AdminSocio.EditandoSuscripcionId,
                fecha_inicio: $('#socioNuevaSuscripcionFechaInicio').val(),
                fecha_fin: null,
                activa: 1
            }
        }).done(function (data) {
            if (data && !data.error) {
                AdminSocio.LoadSocio();
                AdminSocio.ModalNuevaSuscripcion.hide();
                Toolbox.ShowFeedback('feedbackContainer', 'success', "Suscripción modificada con éxito.");
            } else {
                if (data && data.error) {
                    Toolbox.ShowFeedback('feedbackContainerModalNuevaSuscripcion', 'error', data.error);
                } else {
                    Toolbox.ShowFeedback('feedbackContainerModalNuevaSuscripcion', 'error', 'Error inesperado durante modificar_suscripcion_socio');
                }
            }
            Toolbox.StopLoaderModal();
        });
    },
    LoadSociosSinSuscripcion: function () {
        Toolbox.ShowLoader();

        $.ajax({
            dataType: 'json',
            type: "POST",
            url: "../proc/admin_controller.php",
            data: { func: "get_lista_socios_por_nombre_sin_suscripcion" }
        }).done(function (data) {
            if (data && !data.error) {
                AdminSocio.SociosSinSuscripcion = {};
                $('#socioNuevaSuscripcionSociosPatrocinados1').html('<option value="">- seleccionar socio -</option>');
                $('#socioNuevaSuscripcionSociosPatrocinados2').html('<option value="">- seleccionar socio -</option>');
                $('#socioNuevaSuscripcionSociosPatrocinados3').html('<option value="">- seleccionar socio -</option>');
                $('#socioNuevaSuscripcionSociosPatrocinados4').html('<option value="">- seleccionar socio -</option>');
                $('#socioNuevaSuscripcionSociosPatrocinados5').html('<option value="">- seleccionar socio -</option>');
                for (var i = 0; i < data.length; i++) {
                    AdminSocio.SociosSinSuscripcion[data[i].id] = data[i];
                    $('#socioNuevaSuscripcionSociosPatrocinados1').append('<option value="' + data[i].id + '">' + data[i].nombre + '</option>');
                    $('#socioNuevaSuscripcionSociosPatrocinados2').append('<option value="' + data[i].id + '">' + data[i].nombre + '</option>');
                    $('#socioNuevaSuscripcionSociosPatrocinados3').append('<option value="' + data[i].id + '">' + data[i].nombre + '</option>');
                    $('#socioNuevaSuscripcionSociosPatrocinados4').append('<option value="' + data[i].id + '">' + data[i].nombre + '</option>');
                    $('#socioNuevaSuscripcionSociosPatrocinados5').append('<option value="' + data[i].id + '">' + data[i].nombre + '</option>');
                }
            } else {
                if (data && data.error) {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', data.error);
                } else {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', 'Error inesperado durante get_lista_socios_por_nombre_sin_suscripcion');
                }
            }
            Toolbox.StopLoader();
        });
    },
    LoadSocios: function () {
        AdminSocio.SociosLoaded = false;
        Toolbox.ShowLoader();

        $.ajax({
            dataType: 'json',
            type: "POST",
            url: "../proc/admin_controller.php",
            data: { func: "get_lista_socios_por_nombre" }
        }).done(function (data) {
            if (data && !data.error) {
                AdminSocio.Socios = {};
                for (var i = 0; i < data.length; i++) {
                    AdminSocio.Socios[data[i].id] = data[i];
                }

                AdminSocio.SociosLoaded = true;
                AdminSocio.DisplaySuscripciones();
            } else {
                if (data && data.error) {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', data.error);
                } else {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', 'Error inesperado durante get_lista_socios_por_nombre');
                }
            }
            Toolbox.StopLoader();
        });
    }
}

$(document).ready(function () {

    Toolbox.LoadPagoYearSelect('socioIngresarPagoRazonMensualidadAnio');

    $('#socioBtnSalvar').on('click', AdminSocio.SalvarSocio);

    Toolbox.UpdateActiveNavbar('');
    var params = Toolbox.GetUrlVars();

    if (params['new'] && params['new'] == 'true') {
        AdminSocio.New = true;
    } else if (params['id']) {
        AdminSocio.IdSocio = params['id'];
    }
    AdminSocio.GetTags();
    AdminSocio.LoadSociosSinSuscripcion();
    AdminSocio.LoadSocios();

    $('#socioIngresarPagoModalBtnIngresar').on('click', AdminSocio.IngresarPago);

    $('#socioCambiarEstadoModalBtnCambiar').on('click', function () {
        AdminSocio.CambiarEstadoSocio();
    });

    var today = new Date();
    $('#socioIngresarPagoRazonMensualidadAnio').val(today.getFullYear());
    $('#socioIngresarPagoRazonMensualidadMes').val(Toolbox.NombreMesesEsp[today.getMonth() + 1]);

    $('#socioIngresarHorasModalBtnIngresar').on('click', AdminSocio.IngresarHoras);
    $('#socioIngresarHorasFecha').val(Toolbox.GetFechaHoyLocal());

    $('#socioNuevoTalonCobrosYAMonth').val(today.getMonth() + 1);
    $('#socioNuevoTalonCobrosYAYear').val(today.getFullYear());
});
