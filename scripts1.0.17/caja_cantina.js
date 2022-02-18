var CajaCantina = {
    Turnos: null,
    TurnoSeleccionadoId: null,
    TurnoActivoId: null,
    PagoTipo: "gasto",
    TotalEnCaja: 0,
    TransaccionesTurno: null,
    TransaccionesTurnoLoaded: false,
    SocioSeleccionadoId: null,
    Socios: null,
    SociosLoaded: false,
    Gastos: null,
    GastosLoaded: false,
    Pagos: null,
    PagosLoaded: false,
    UltimasTransacciones: null,
    UltimasTransaccionesLoaded: false,
    TransaccionesIntercaja: null,
    ModalAbrirTurno: null,
    ModalCerrarTurno: null,
    ModalNuevaTransaction: null,
    ModalNuevoIntercaja: null,
    ModalPago: null,

    OpenModalNuevoTurno: function () {
        $('.feedbackContainerModal').css('display', 'none');
        $('#input-caja-inicio').val('');
        $('.loaderModal').css('display', 'none');
        CajaCantina.ModalAbrirTurno = new bootstrap.Modal(document.getElementById('abrirTurnoModal'), {});
        CajaCantina.ModalAbrirTurno.show();
    },
    OpenModalCrearTransaccion: function () {
        $('.feedbackContainerModal').css('display', 'none');
        $('#listaIngresarGastoValor').val('');
        $('#listaIngresarGastoFecha').val(Toolbox.GetFechaHoyLocal());
        $('#listaIngresarGastoRazon').val('');
        $('#listaIngresarGastoNotas').val('');
        $('#listaIngresarGastoGrupo').val('');
        $('.loaderModal').css('display', 'none');

        $('#listaIngresarIngresoValor').val('');
        $('#listaIngresarIngresoFecha').val(Toolbox.GetFechaHoyLocal());
        $('#listaIngresarIngresoRazon').val('');
        $('#listaIngresarIngresoNotas').val('');
        $('#listaIngresarIngresoGrupo').val('');

        $('#socioIngresarPagoNotas').val('');
        $('#socioIngresarPagoFecha').val(Toolbox.GetFechaHoyLocal());

        CajaCantina.ModalNuevaTransaction = new bootstrap.Modal(document.getElementById('listaIngresarPagoModal'), {
            keyboard: false
        });
        CajaCantina.ModalNuevaTransaction.show();

        $('#listaIngresarGastoValor').focus();
    },
    OpenModalCerrarTurno: function () {
        $('.feedbackContainerModal').css('display', 'none');
        $('#input-cerrar_caja_cash').val('');
        $('.loaderModal').css('display', 'none');
        CajaCantina.ModalCerrarTurno = new bootstrap.Modal(document.getElementById('cerrarTurnoModal'), {});
        CajaCantina.ModalCerrarTurno.show();
    },
    LoadTransaccionesTurno: function () {
        CajaCantina.TransaccionesTurnoLoaded = false;
        Toolbox.ShowLoader();

        $.ajax({
            dataType: 'json',
            type: "POST",
            url: "../proc/admin_controller.php",
            data: {
                func: "get_transacciones_cantina_turno",
                id: CajaCantina.TurnoSeleccionadoId
            }
        }).done(function (data) {
            if (data && !data.error) {
                CajaCantina.TransaccionesTurno = {};
                for (var i = 0; i < data.length; i++) {
                    CajaCantina.TransaccionesTurno[data[i].id] = data[i];
                }
                CajaCantina.TransaccionesTurnoLoaded = true;
                CajaCantina.PopulateTransactionsTable('#lista_turno_actual', data, true);
                CajaCantina.UpdateDatosGastos();
                CajaCantina.UpdateDatosPagos();
            } else {
                if (data && data.error) {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', data.error);
                } else {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', 'Error inesperado durante get_transacciones_cantina_turno');
                }
            }
            Toolbox.StopLoader();
        });
    },
    LoadUltimasTransacciones: function () {
        CajaCantina.UltimasTransaccionesLoaded = false;
        Toolbox.ShowLoader();

        $.ajax({
            dataType: 'json',
            type: "POST",
            url: "../proc/admin_controller.php",
            data: { func: "get_ultimas_transacciones_cantina" }
        }).done(function (data) {
            if (data && !data.error) {
                CajaCantina.UltimasTransacciones = {};
                for (var i = 0; i < data.length; i++) {
                    CajaCantina.UltimasTransacciones[data[i].id] = data[i];
                }
                CajaCantina.UltimasTransaccionesLoaded = true;
                //CajaCantina.PopulateTransactionsTable('#lista_last_transactions', data, false);
                CajaCantina.UpdateDatosGastos();
                CajaCantina.UpdateDatosPagos();
            } else {
                if (data && data.error) {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', data.error);
                } else {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', 'Error inesperado durante get_ultimas_transacciones_cantina');
                }
            }
            Toolbox.StopLoader();
        });
    },
    PopulateTransactionsTable: function (table_id, data, withActions) {
        $(table_id).html("");

        for (var i = 0; i < data.length; i++) {
            var actions = "";
            if (withActions) {
                actions = '<td class="hideInMobile">';
                if (data[i].cancelado == false) {
                    actions += '<img class="cancel_pago action_button" src="images/cancel.png" onclick="CajaCantina.CancelPago(' + data[i].id + ')">';
                }
                actions += '</td>';
            }

            var tagCancelado = "";
            if (data[i].cancelado == true) {
                tagCancelado = '<span class="badge labelCancelado">CANCELADO</span> ';
            }

            var valor = Number(data[i].valor);
            var flecha = '<i class="icon icon-arrow-right green-arrow"></i>';
            if (valor < 0) {
                flecha = '<i class="icon icon-arrow-left red-arrow"></i>';
            }

            var rowOnclick = "";
            if (window.mobileCheck) {
                rowOnclick = ' onClick="CajaCantina.OpenModalTransactionInfoForMobile(' + data[i].id + ');"';
            }

            var idLink = '';
            if (data[i].id_pago != null) {
                idLink = '/admin_pago.php?id=' + data[i].id_pago;
            }

            $(table_id).append('<tr' + rowOnclick + '>' +
                '<td class="hideInMobile"><a href="' + idLink + '">' + data[i].id + '</a></td>' +
                '<td>' + Toolbox.FormatNumber(valor) + '</td>' +
                '<td>' + flecha + '</td>' +
                '<td class="hideInMobile">' + Toolbox.MysqlDateToDate(data[i].fecha_pago) + '</td>' +
                '<td class="razonTransaction' + data[i].id + '"></td>' +
                '<td class="rubroTransaction' + data[i].id + '"></td>' +
                '<td class="hideInMobile notasTransaction' + data[i].id + '">' + tagCancelado + '</td>' +
                actions + '</tr>');
        }
    },
    LoadUltimosTurnos: function () {
        Toolbox.ShowLoader();

        $.ajax({
            dataType: 'json',
            type: "POST",
            url: "../proc/admin_controller.php",
            data: { func: "get_ultimos_turnos" }
        }).done(function (data) {
            if (data && !data.error) {
                CajaCantina.Turnos = [];
                for (var i = 0; i < data.length; i++) {
                    CajaCantina.Turnos[data[i].id] = data[i];
                }

                $('#lista_ultimos_turnos').html("");
                for (var i = 0; i < data.length; i++) {
                    var saldo = Number(data[i].caja_fin) - Number(data[i].caja_inicio);

                    var estado = '<span class="badge bg-success">Cerrado</span>';
                    if (data[i].activo === "1") {
                        estado = '<span class="badge bg-danger">Abierto</span>';
                        CajaCantina.TurnoActivoId = data[i].id;
                    }



                    $('#lista_ultimos_turnos').append('<tr onClick="CajaCantina.SeleccionarTurnoFromId(' + data[i].id + ');">' +
                        '<td>' + Toolbox.MysqlDateTimeToDateTime(data[i].inicio) + '</td>' +
                        '<td>' + data[i].encargado + '</td>' +
                        '<td>' + Toolbox.FormatNumber(saldo) + '</td>' +
                        '<td>' + estado + '</td>' +
                        '<td class="hideInMobile">' + (data[i].notas != null ? data[i].notas : "") + '</td>' +
                        '</tr>');
                }
            } else {
                if (data && data.error) {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', data.error);
                } else {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', 'Error inesperado durante get_ultimos_turnos');
                }
            }

            if (CajaCantina.TurnoActivoId && CajaCantina.TurnoActivoId != "") {
                $('#boton_reanudar_turno').css('display', 'inline-block');
            } else {
                $('#boton_nuevo_turno').css('display', 'inline-block');
            }

            Toolbox.StopLoader();
        });
    },
    AbrirTurno: function () {

        if (CajaCantina.ValidateAbrirTurnoData()) {

            var date = new Date();
            date = date.toISOString().slice(0, 19).replace('T', ' ');

            var cantidadContada = Number($('#input-caja-inicio').val());
            cantidadContada = +cantidadContada.toFixed(2);

            Toolbox.ShowLoader();

            $.ajax({
                dataType: 'json',
                type: "POST",
                url: "../proc/admin_controller.php",
                data: {
                    func: "abrir_turno_cantina",
                    encargado: $('#input-encargado').val(),
                    tags: '',
                    inicio: date,
                    caja_inicio: cantidadContada
                }
            }).done(function (data) {
                if (data && !data.error) {
                    CajaCantina.TurnoActivoId = data.id;
                    CajaCantina.SeleccionarTurno(data);
                    CajaCantina.LoadUltimosTurnos();
                    CajaCantina.ModalAbrirTurno.hide();
                } else {
                    if (data && data.error) {
                        Toolbox.ShowFeedback('feedbackContainerModalAbrirTurno', 'error', data.error);
                    } else {
                        Toolbox.ShowFeedback('feedbackContainerModalAbrirTurno', 'error', 'Error inesperado durante abrir_turno_cantina');
                    }
                }
                Toolbox.StopLoader();
            });
        }
    },
    SetModoTurnoAbierto: function (turno) {
        $('.cantina .vista_shifts').css('display', 'none');
        $('.cantina .vista_last_transactions').css('display', 'none');
        $('.cantina .vista_last_retiros').css('display', 'none');
        $('.cantina .vista_current').css('display', 'block');

        $('.botonLobby').css('display', 'none');
        $('.botonTurno').css('display', 'inline-block');

        if (turno.activo == 1) {
            $('#boton_crear_transaccion').css('display', 'inline-block');
            $('.action_button').css('display', 'block');
        } else {
            $('#boton_crear_transaccion').css('display', 'none');
            $('.action_button').css('display', 'none');
        }
    },
    SetModoLobby: function () {
        $('.cantina .vista_shifts').css('display', 'block');
        $('.cantina .vista_last_transactions').css('display', 'block');
        $('.cantina .vista_last_retiros').css('display', 'block');
        $('.cantina .vista_current').css('display', 'none');
        $('.saldo_turno').css('display', 'none');
        $('#turno_label').css('display', 'none');
    },
    ValidateAbrirTurnoData: function () {
        var error = undefined;

        if ($('#input-caja-inicio').val() == '') {
            error = 'Debes contabilizar y reportar el efectivo en caja';
        } else if (!error && isNaN($('#input-caja-inicio').val())) {
            error = 'Valor invalido';
        }

        if (error == undefined) {
            var cantidadContada = Number($('#input-caja-inicio').val());
            cantidadContada = +cantidadContada.toFixed(2);

            if (CajaCantina.TotalEnCaja != cantidadContada) {
                error = 'En la caja deberia haber $ ' + CajaCantina.TotalEnCaja + '.';
            }
        }

        if (error == undefined) {
            Toolbox.ShowFeedback('feedbackContainerModalAbrirTurno', '', '');
        }
        else {
            Toolbox.ShowFeedback('feedbackContainerModalAbrirTurno', 'error', error);
        }

        return error == undefined;
    },
    SeleccionarTurnoFromId: function (id) {
        CajaCantina.SeleccionarTurno(CajaCantina.Turnos[id]);
    },
    SeleccionarTurno: function (turno) {
        CajaCantina.TurnoSeleccionadoId = turno.id;
        if (turno.activo == 1) {
            $('#turno_label').html('<h5><span class="badge bg-success">Turno abierto</span> ' + turno.encargado + '</h5>');
            $('#turno_label').css('display', 'table');
            //$('#turno_label').addClass("bg-success");
            $('#boton_cerrar_turno').css('display', 'block');
            $('.saldo_turno').css('display', 'block');
        } else {
            $('#turno_label').html('<h5><span class="badge bg-important">Turno cerrado</span> ' + turno.encargado + '</h5>');
            $('#turno_label').css('display', 'table');
            //$('#turno_label').addClass("bg-important");
            $('#boton_cerrar_turno').css('display', 'none');
            $('.saldo_turno').css('display', 'block');
        }
        CajaCantina.LoadTransaccionesTurno();
        CajaCantina.LoadSaldoTurno();
        CajaCantina.SetModoTurnoAbierto(turno);
    },
    IngresarPago: function () {
        if (CajaCantina.PagoTipo == "gasto") {
            if (CajaCantina.VerificarDatosGasto()) {
                var valor = $("#listaIngresarGastoValor").val();
                var rubro = $('#listaIngresarGastoGrupo').val();
                var fecha_pago = $("#listaIngresarGastoFecha").val();
                var razon = $("#listaIngresarGastoRazon").val();
                var notas = $("#listaIngresarGastoNotas").val();

                CajaCantina.IngresarGasto(valor, rubro, fecha_pago, razon, notas);
            }
        } else if (CajaCantina.PagoTipo == "ingreso") {
            if (CajaCantina.VerificarDatosIngreso()) {
                var valor = $("#listaIngresarIngresoValor").val();
                var rubro = $('#listaIngresarIngresoGrupo').val();
                var fecha_pago = $("#listaIngresarIngresoFecha").val();
                var razon = $("#listaIngresarIngresoRazon").val();
                var notas = $("#listaIngresarIngresoNotas").val();

                CajaCantina.IngresarGasto(valor, rubro, fecha_pago, razon, notas);
            }
        } else if (CajaCantina.PagoTipo == "ingresoPorSocio") {
            if (CajaCantina.VerificarDatosIngresoPorSocio()) {
                var razon = $("#socioIngresarPagoRazon").val();
                var valor = $("#socioIngresarPagoValor").val();
                var id_socio = CajaCantina.SocioSeleccionadoId;
                var fecha_pago = $("#socioIngresarPagoFecha").val();
                var descuento = $("#socioIngresarPagoDescuento").val();
                var descuento_json = $("#socioIngresarPagoRazonDescuento").val();
                var notas = $("#socioIngresarPagoNotas").val();

                CajaCantina.IngresarPagoSocio(id_socio, valor, razon, fecha_pago, notas, descuento, descuento_json);
            }
        }
    },
    IngresarPagoSocio: function (id_socio, valor, razon, fecha_pago, notas, descuento, descuento_json) {
        if ($("#socioIngresarPagoRazon").val() == "mensualidad") {
            razon = "mensualidad (" + $('#socioIngresarPagoRazonMensualidadMes').val() + "/" + $('#socioIngresarPagoRazonMensualidadAnio').val() + ")";
        }

        Toolbox.ShowLoaderModal();
        Toolbox.ShowFeedback('feedbackContainerModalIngresarPagoPorSocio', '', '');

        $.ajax({
            dataType: 'json',
            type: "POST",
            url: "../proc/admin_controller.php",
            data: {
                func: "transaccion_ingresar_pago",
                id_socio: id_socio,
                valor: valor,
                fecha_pago: fecha_pago,
                razon: razon,
                notas: notas,
                tipo: "Cantina",
                descuento: descuento,
                descuento_json: descuento_json,
                id_turno: CajaCantina.TurnoActivoId
            }
        }).done(function (data) {
            if (data && !data.error) {
                CajaCantina.LoadTransaccionesTurno();
                CajaCantina.LoadSaldoTurno();
                CajaCantina.LoadTotalCaja();
                CajaCantina.LoadPagos();
                CajaCantina.ModalNuevaTransaction.hide();
            } else {
                if (data && data.error) {
                    Toolbox.ShowFeedback('feedbackContainerModalIngresarPagoPorSocio', 'error', data.error);
                } else {
                    Toolbox.ShowFeedback('feedbackContainerModalIngresarPagoPorSocio', 'error', 'Error inesperado al transaccion_ingresar_pago');
                }
            }
            Toolbox.StopLoaderModal();
        });
    },
    VerificarDatosIngresoPorSocio: function () {
        var error = undefined;

        if (!error && (CajaCantina.SocioSeleccionadoId == undefined || CajaCantina.SocioSeleccionadoId == '')) {
            error = 'Falt&oacute; seleccionar socio';
        } else if (!error && $('#socioIngresarPagoValor').val() == '') {
            error = 'Falt&oacute; especificar el valor del pago';
        } else if (!error && $('#socioIngresarPagoFecha').val() == '') {
            error = 'Falto especificar fecha de pago';
        } else if (!error && isNaN($('#socioIngresarPagoValor').val())) {
            error = 'Valor invalido';
        }

        if (error == undefined) {
            Toolbox.ShowFeedback('feedbackContainerModalIngresarPagoPorSocio', '', '');
        }
        else {
            Toolbox.ShowFeedback('feedbackContainerModalIngresarPagoPorSocio', 'error', error);
        }

        return error == undefined;
    },
    IngresarGasto: function (valor, rubro, fecha_pago, razon, notas) {

        var valorTransaccion = valor;
        if (CajaCantina.PagoTipo == "gasto") {
            valorTransaccion = valorTransaccion * -1;
        } else if (CajaCantina.PagoTipo == "ingreso") {
            valor = valor * -1;
        }

        Toolbox.ShowLoaderModal();
        Toolbox.ShowFeedback('feedbackContainerModalIngresarPago', '', '');
        Toolbox.ShowFeedback('feedbackContainerModalIngresarPagoIngreso', '', '');

        $.ajax({
            dataType: 'json',
            type: "POST",
            url: "../proc/admin_controller.php",
            data: {
                func: "transaccion_ingresar_gasto",
                valor: valor,
                valorTransaccion: valorTransaccion,
                fecha_pago: fecha_pago,
                razon: razon,
                notas: notas,
                rubro: rubro,
                id_turno: CajaCantina.TurnoActivoId
            }
        }).done(function (data) {
            if (data && !data.error) {
                CajaCantina.LoadTransaccionesTurno();
                CajaCantina.LoadSaldoTurno();
                CajaCantina.LoadTotalCaja();
                CajaCantina.LoadGastos();
                CajaCantina.ModalNuevaTransaction.hide();
            } else {
                if (data && data.error) {
                    if (CajaCantina.PagoTipo == "gasto") {
                        Toolbox.ShowFeedback('feedbackContainerModalIngresarPago', 'error', data.error);
                    } else {
                        Toolbox.ShowFeedback('feedbackContainerModalIngresarPagoIngreso', 'error', data.error);
                    }
                } else {
                    if (CajaCantina.PagoTipo == "gasto") {
                        Toolbox.ShowFeedback('feedbackContainerModalIngresarPago', 'error', 'Error inesperado durante transaccion_ingresar_gasto');
                    } else {
                        Toolbox.ShowFeedback('feedbackContainerModalIngresarPagoIngreso', 'error', 'Error inesperado durante transaccion_ingresar_gasto');
                    }
                }
            }
            Toolbox.StopLoaderModal();
        });
    },
    VerificarDatosGasto: function () {
        var error = undefined;

        if (!error && $('#listaIngresarGastoValor').val() == '') {
            error = 'Falt&oacute; especificar el valor del gasto';
        } else if (!error && $('#listaIngresarGastoFecha').val() == '') {
            error = 'Falt&oacute; especificar fecha de gasto';
        } else if (!error && isNaN($('#listaIngresarGastoValor').val())) {
            error = 'Valor invalido';
        } else if (!error && $('#listaIngresarGastoValor').val() < 0) {
            error = 'El Valor debe ser positivo';
        } else if (!error && $('#listaIngresarGastoGrupo').val() == "") {
            error = 'Falt&oacute; especificar rubro';
        } else if (!error && $('#listaIngresarGastoRazon').val() == "") {
            error = 'Falt&oacute; especificar razón';
        }

        if (error == undefined) {
            Toolbox.ShowFeedback('feedbackContainerModalIngresarPago', '', '');
        }
        else {
            Toolbox.ShowFeedback('feedbackContainerModalIngresarPago', 'error', error);
        }

        return error == undefined;
    },
    VerificarDatosIngreso: function () {
        var error = undefined;

        if (!error && $('#listaIngresarIngresoValor').val() == '') {
            error = 'Falt&oacute; especificar el valor del ingreso';
        } else if (!error && $('#listaIngresarIngresoFecha').val() == '') {
            error = 'Falt&oacute; especificar fecha de ingreso';
        } else if (!error && isNaN($('#listaIngresarIngresoValor').val())) {
            error = 'Valor invalido';
        } else if (!error && $('#listaIngresarIngresoValor').val() < 0) {
            error = 'El Valor debe ser positivo';
        } else if (!error && $('#listaIngresarIngresoGrupo').val() == "") {
            error = 'Falt&oacute; especificar rubro';
        } else if (!error && $('#listaIngresarIngresoRazon').val() == "") {
            error = 'Falt&oacute; especificar razón';
        }

        if (error == undefined) {
            Toolbox.ShowFeedback('feedbackContainerModalIngresarPagoIngreso', '', '');
        }
        else {
            Toolbox.ShowFeedback('feedbackContainerModalIngresarPagoIngreso', 'error', error);
        }

        return error == undefined;
    },
    LoadTotalCaja: function () {
        Toolbox.ShowLoader();

        $.ajax({
            dataType: 'json',
            type: "POST",
            url: "../proc/admin_controller.php",
            data: { func: "get_total_caja_cantina" }
        }).done(function (data) {
            if (data === 0 || (data && !data.error)) {
                var value = Number(data);
                value = +value.toFixed(2);
                CajaCantina.TotalEnCaja = value;
                $('.total_en_caja').html(Toolbox.FormatNumber(value));
            } else {
                if (data && data.error) {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', data.error);
                } else {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', 'Error inesperado durante get_total_caja_cantina');
                }
            }
            Toolbox.StopLoader();
        });
    },
    LoadSaldoTurno: function () {
        Toolbox.ShowLoader();

        $.ajax({
            dataType: 'json',
            type: "POST",
            url: "../proc/admin_controller.php",
            data: {
                func: "get_saldo_turno_cantina",
                id: CajaCantina.TurnoSeleccionadoId
            }
        }).done(function (data) {
            if (data === 0 || (data && !data.error)) {
                var value = Number(data);
                value = +value.toFixed(2);
                $('.saldo_turno_amount').html(Toolbox.FormatNumber(value));
            } else {
                if (data && data.error) {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', data.error);
                } else {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', 'Error inesperado durante get_saldo_turno_cantina');
                }
            }
            Toolbox.StopLoader();
        });
    },
    CerrarTurno: function () {
        var error = undefined;

        if ($('#input-cerrar_caja_cash').val() == '') {
            error = 'Debes contabilizar y reportar el efectivo en caja';
        } else if (!error && isNaN($('#input-cerrar_caja_cash').val())) {
            error = 'Valor invalido';
        }

        if (error == undefined) {
            var cantidadContada = Number($('#input-cerrar_caja_cash').val());
            cantidadContada = +cantidadContada.toFixed(2);

            if (CajaCantina.TotalEnCaja != cantidadContada) {
                error = 'En la caja deberia haber $ ' + CajaCantina.TotalEnCaja + '. Por favor revisa que todos los pagos ingresados sean correctos.';
            }
        }

        if (error == undefined) {
            Toolbox.ShowFeedback('feedbackContainerModalCerrarTurno', '', '');
            Toolbox.ShowLoader();

            var date = new Date();
            date = date.toISOString().slice(0, 19).replace('T', ' ');

            $.ajax({
                dataType: 'json',
                type: "POST",
                url: "../proc/admin_controller.php",
                data: {
                    func: "cerrar_turno_cantina",
                    id: CajaCantina.TurnoActivoId,
                    fin: date,
                    caja_fin: cantidadContada,
                    notas: $('#cerrarTurnoNotas').val()
                }
            }).done(function (data) {
                if (data && !data.error) {
                    CajaCantina.ModalCerrarTurno.hide();
                    location.reload();
                } else {
                    if (data && data.error) {
                        Toolbox.ShowFeedback('feedbackContainerModalCerrarTurno', 'error', data.error);
                    } else {
                        Toolbox.ShowFeedback('feedbackContainerModalCerrarTurno', 'error', 'Error inesperado durante cerrar_turno_cantina');
                    }
                }
                Toolbox.StopLoader();
            });
        }
        else {
            Toolbox.ShowFeedback('feedbackContainerModalCerrarTurno', 'error', error);
        }
    },
    CancelPago: function (id) {
        if (confirm("Esta seguro que desea cancelar este pago?")) {
            Toolbox.ShowLoader();
            Toolbox.ShowFeedback('feedbackContainer', '', '');

            $.ajax({
                dataType: 'json',
                type: "POST",
                url: "../proc/admin_controller.php",
                data: {
                    func: "cancel_transaction_cantina",
                    id: id,
                    id_gasto: CajaCantina.TransaccionesTurno[id].id_gasto,
                    id_pago: CajaCantina.TransaccionesTurno[id].id_pago
                }
            }).done(function (data) {
                if (data && !data.error) {
                    CajaCantina.LoadTransaccionesTurno();
                    CajaCantina.LoadSaldoTurno();
                    CajaCantina.LoadTotalCaja();
                } else {
                    if (data && data.error) {
                        Toolbox.ShowFeedback('feedbackContainer', 'error', data.error);
                    } else {
                        Toolbox.ShowFeedback('feedbackContainer', 'error', 'Error inesperado durante cancel_pago_cantina');
                    }
                }
                Toolbox.StopLoader();
            });
        }
    },
    OnChangeSocioSelector: function () {
        CajaCantina.SocioSeleccionadoId = $('#socioIngresarPagoSocio').val();
    },
    LoadSocios: function () {
        CajaCantina.SociosLoaded = false;
        Toolbox.ShowLoader();

        $.ajax({
            dataType: 'json',
            type: "POST",
            url: "../proc/admin_controller.php",
            data: { func: "get_lista_socios_por_nombre" }
        }).done(function (data) {
            if (data && !data.error) {
                CajaCantina.Socios = {};
                $('#socioIngresarPagoSocio').html('<option value="">- seleccionar socio -</option>');
                for (var i = 0; i < data.length; i++) {
                    CajaCantina.Socios[data[i].id] = data[i];
                    $('#socioIngresarPagoSocio').append('<option value="' + data[i].id + '">' + data[i].nombre + '</option>');
                }
                CajaCantina.SociosLoaded = true;
                CajaCantina.UpdateDatosPagos();
            } else {
                if (data && data.error) {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', data.error);
                } else {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', 'Error inesperado durante get_lista_socios');
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
    OnChangeRazonDescuentoPago: function () {
        // if($('#socioIngresarPagoRazonDescuento').val() == "BalanceVoluntariado"){
        //     var aDescountar = Number(Socio.BalanceHoras - Socio.DescuentoBalanceHoras);
        //     if(aDescountar > Socio.CurrentCostoCuota){
        //         aDescountar = Socio.CurrentCostoCuota;
        //     }

        //     $('#socioIngresarPagoDescuento').val(aDescountar);
        // }
    },
    LoadPagos: function () {
        CajaCantina.PagosLoaded = false;
        Toolbox.ShowLoader();

        $.ajax({
            dataType: 'json',
            type: "POST",
            url: "../proc/admin_controller.php",
            data: { func: "get_pagos_transactions_cantina" }
        }).done(function (data) {
            if (data && !data.error) {

                CajaCantina.Pagos = {};
                for (var i = 0; i < data.length; i++) {
                    CajaCantina.Pagos[data[i].id] = data[i];
                }
                CajaCantina.PagosLoaded = true;
                CajaCantina.UpdateDatosPagos();
            } else {
                if (data && data.error) {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', data.error);
                } else {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', 'Error inesperado durante get_pagos_transactions_cantina');
                }
            }
            Toolbox.StopLoader();
        });
    },
    LoadGastos: function () {
        CajaCantina.GastosLoaded = false;
        Toolbox.ShowLoader();

        $.ajax({
            dataType: 'json',
            type: "POST",
            url: "../proc/admin_controller.php",
            data: { func: "get_gastos_transactions_cantina" }
        }).done(function (data) {
            if (data && !data.error) {
                CajaCantina.Gastos = {};
                for (var i = 0; i < data.length; i++) {
                    CajaCantina.Gastos[data[i].id] = data[i];
                }
                CajaCantina.GastosLoaded = true;
                CajaCantina.UpdateDatosGastos();
            } else {
                if (data && data.error) {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', data.error);
                } else {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', 'Error inesperado durante get_gastos_transactions_cantina');
                }
            }
            Toolbox.StopLoader();
        });
    },
    UpdateDatosPagos: function () {
        if (CajaCantina.SociosLoaded === true && CajaCantina.PagosLoaded === true) {
            if (CajaCantina.TransaccionesTurnoLoaded === true) {
                Object.keys(CajaCantina.TransaccionesTurno).forEach(function (key) {
                    if (CajaCantina.TransaccionesTurno[key].id_pago != null) {
                        var rubro = '<span class="badge labelSocioTransaction">' + CajaCantina.Socios[CajaCantina.Pagos[CajaCantina.TransaccionesTurno[key].id_pago].id_socio].nombre + '</span>';
                        var razon = Toolbox.TransformSpecialTag(CajaCantina.Pagos[CajaCantina.TransaccionesTurno[key].id_pago].razon);
                        $('.razonTransaction' + key).html(razon);
                        $('.rubroTransaction' + key).html(rubro);
                        $('.notasTransaction' + key).append(CajaCantina.Pagos[CajaCantina.TransaccionesTurno[key].id_pago].notas);
                    }
                });
            }

            if (CajaCantina.UltimasTransaccionesLoaded === true) {
                Object.keys(CajaCantina.UltimasTransacciones).forEach(function (key) {
                    if (CajaCantina.UltimasTransacciones[key].id_pago != null) {
                        var rubro = '<span class="badge labelSocioTransaction">' + CajaCantina.Socios[CajaCantina.Pagos[CajaCantina.UltimasTransacciones[key].id_pago].id_socio].nombre + '</span>';
                        var razon = Toolbox.TransformSpecialTag(CajaCantina.Pagos[CajaCantina.UltimasTransacciones[key].id_pago].razon);
                        $('.razonTransaction' + key).html(razon);
                        $('.rubroTransaction' + key).html(rubro);
                        $('.notasTransaction' + key).append(CajaCantina.Pagos[CajaCantina.UltimasTransacciones[key].id_pago].notas);
                    }
                });
            }
        }
    },
    UpdateDatosGastos: function () {
        if (CajaCantina.GastosLoaded === true) {
            if (CajaCantina.TransaccionesTurnoLoaded === true) {
                Object.keys(CajaCantina.TransaccionesTurno).forEach(function (key) {
                    if (CajaCantina.TransaccionesTurno[key].id_gasto != null) {
                        var razon = CajaCantina.Gastos[CajaCantina.TransaccionesTurno[key].id_gasto].razon;
                        var rubro = Toolbox.TransformSpecialTag(CajaCantina.Gastos[CajaCantina.TransaccionesTurno[key].id_gasto].rubro);
                        $('.razonTransaction' + key).html(razon);
                        $('.rubroTransaction' + key).html(rubro);
                        $('.notasTransaction' + key).append(CajaCantina.Gastos[CajaCantina.TransaccionesTurno[key].id_gasto].notas);
                    }
                });
            }

            if (CajaCantina.UltimasTransaccionesLoaded === true) {
                Object.keys(CajaCantina.UltimasTransacciones).forEach(function (key) {
                    if (CajaCantina.UltimasTransacciones[key].id_gasto != null) {
                        var razon = CajaCantina.Gastos[CajaCantina.UltimasTransacciones[key].id_gasto].razon;
                        var rubro = Toolbox.TransformSpecialTag(CajaCantina.Gastos[CajaCantina.UltimasTransacciones[key].id_gasto].rubro);
                        $('.razonTransaction' + key).html(razon);
                        $('.rubroTransaction' + key).html(rubro);
                        $('.notasTransaction' + key).append(CajaCantina.Gastos[CajaCantina.UltimasTransacciones[key].id_gasto].notas);
                    }
                });
            }
        }
    },
    ReanudarTurno: function () {
        if (CajaCantina.TurnoActivoId != null && CajaCantina.TurnoActivoId != "") {
            CajaCantina.SeleccionarTurnoFromId(CajaCantina.TurnoActivoId);
        }
    },
    LoadTransaccionesIntercaja: function () {
        Toolbox.ShowLoader();

        $.ajax({
            dataType: 'json',
            type: "POST",
            url: "../proc/admin_controller.php",
            data: {
                func: "get_transactions_caja",
                caja: "Cantina"
            }
        }).done(function (data) {
            if (data && !data.error) {
                $('#lista_last_retiros').html("");

                CajaCantina.TransaccionesIntercaja = {};
                for (var i = 0; i < data.length; i++) {
                    CajaCantina.TransaccionesIntercaja[data[i].id] = data[i];

                    var valor = Number(data[i].valor);
                    var origen = data[i].caja_origen;
                    var destino = data[i].caja_destino;
                    var flecha = '<i class="icon icon-arrow-right green-arrow"></i>';

                    valor = +valor.toFixed(2);
                    if ((data[i].caja_origen == 'Cantina' && valor < 0)
                        || (data[i].caja_destino == 'Cantina' && valor > 0)) {
                        flecha = '<i class="icon icon-arrow-left red-arrow"></i>';
                        if (valor >= 0) {
                            valor *= -1;
                        }
                    } else {
                        if (valor < 0) {
                            valor *= -1;
                        }
                        if (data[i].caja_origen == 'Cantina') {
                            destino = data[i].caja_origen;
                            origen = data[i].caja_destino;
                        }
                    }

                    $('#lista_last_retiros').append('<tr>' +
                        '<td>' + Toolbox.MysqlDateToDate(data[i].fecha) + '</td>' +
                        '<td>' + Toolbox.FormatNumber(valor) + '</td>' +
                        '<td>' + origen + '&nbsp;&nbsp;&nbsp;' + flecha + '&nbsp;&nbsp;&nbsp;' + destino + '</td>' +
                        '</tr>');
                }

            } else {
                if (data && data.error) {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', data.error);
                } else {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', 'Error inesperado durante get_transactions_caja');
                }
            }
            Toolbox.StopLoader();
        });
    },
    IngresarRetiro: function () {
        Toolbox.ShowLoaderModal();
        Toolbox.ShowFeedback('feedbackContainerModalRetiroModal', '', '');

        $.ajax({
            dataType: 'json',
            type: "POST",
            url: "../proc/admin_controller.php",
            data: {
                func: "ingresar_transaction_caja",
                valor: $('#inputNuevoRetiroValor').val(),
                fecha: Toolbox.DataToMysqlDate($("#inputNuevoRetiroFecha").val()),
                caja_origen: "Cantina",
                caja_destino: $('#inputNuevoRetiroDestino').val()
            }
        }).done(function (data) {
            if (data && !data.error) {
                CajaCantina.LoadTotalCaja();
                CajaCantina.LoadTransaccionesIntercaja();
                CajaCantina.ModalNuevoIntercaja.hide();
            } else {
                if (data && data.error) {
                    Toolbox.ShowFeedback('feedbackContainerModalRetiroModal', 'error', data.error);
                } else {
                    Toolbox.ShowFeedback('feedbackContainerModalRetiroModal', 'error', 'Error inesperado durante ingresar_transaction_caja');
                }
            }
            Toolbox.StopLoaderModal();
        });
    },
    OpenModalNuevoRetiro: function () {
        $('.feedbackContainerModal').css('display', 'none');
        $('#inputNuevoRetiroValor').val('');
        $('#inputNuevoRetiroFecha').val(Toolbox.GetFechaHoyLocal());
        $('.loaderModal').css('display', 'none');
        CajaCantina.ModalNuevoIntercaja = new bootstrap.Modal(document.getElementById('retiroModal'), {});
        CajaCantina.ModalNuevoIntercaja.show();
    },
    VerificarDatosRetiro: function () {
        var error = undefined;

        if (!error && $('#inputNuevoRetiroValor').val() == '') {
            error = 'Falt&oacute; especificar el valor del retiro';
        } else if (!error && $('#inputNuevoRetiroFecha').val() == '') {
            error = 'Falt&oacute; especificar fecha de retiro';
        } else if (!error && isNaN($('#inputNuevoRetiroValor').val())) {
            error = 'Valor invalido';
        }

        if (error == undefined) {
            Toolbox.ShowFeedback('feedbackContainerModalRetiroModal', '', '');
        }
        else {
            Toolbox.ShowFeedback('feedbackContainerModalRetiroModal', 'error', error);
        }

        return error == undefined;
    },
    PrecargarGasto: function (key) {
        switch (key) {
            case 'Viaticos Administracion':
                $('#listaIngresarGastoGrupo').val('Viaticos Administracion');
                $('#listaIngresarGastoRazon').val('Viáticos administración');
                break;
            case 'Insumos':
                $('#listaIngresarGastoGrupo').val('Insumos');
                $('#listaIngresarGastoRazon').val('Insumos');
                break;
        }
    },
    PrecargarIngreso: function (key) {
        switch (key) {
            case 'Devolucion':
                $('#listaIngresarIngresoGrupo').val('Devolucion');
                $('#listaIngresarIngresoRazon').val('Devolución');
                break;
        }
    },
    OpenModalTransactionInfoForMobile: function (transaction_id) {
        $('.feedbackContainerModal').css('display', 'none');
        $('.loaderModal').css('display', 'none');

        // $('#inputNuevoRetiroValor').val('');
        // $('#inputNuevoRetiroFecha').val(Toolbox.GetFechaHoyLocal());

        CajaCantina.ModalPago = new bootstrap.Modal(document.getElementById('modalPago'), {});
        CajaCantina.ModalPago.show();
    },
    // LoadPagosSocio: function () {
    //     Toolbox.ShowLoader();
    //     $.ajax({
    //         dataType: 'json',
    //         type: "POST",
    //         url: "../proc/admin_controller.php",
    //         data: {func: "get_pagos_socio", id_socio: Socio.IdSocio}
    //     }).done(function (data) {
    //         if (data && !data.error) {

    //             $('#listaPagosSocioTabla').html("");
    //             $('#listaPagosPorMesSocioTabla').html("");

    //             //pagos por mes data
    //             var pagosPorMes = {};
    //             var descuentosPorMes = {};

    //             for (var i = 0; i < data.length; i++) {

    //                 var descuento = "";
    //                 if(data[i].descuento != "" && data[i].descuento != "0.00"){
    //                     descuento = data[i].descuento + ' ' + Toolbox.TransformSpecialTag(data[i].descuento_json)

    //                     if(data[i].descuento_json == "BalanceVoluntariado") {
    //                         Socio.DescuentoBalanceHoras += Number(data[i].descuento);
    //                     }
    //                 }

    //                 $('#listaPagosSocioTabla').append('<tr onClick="document.location.href = \'/pago.php?id=' + data[i].id + '\'"><td>' + data[i].id + '</td>' +
    //                     '<td>' + data[i].valor + '</td>' +
    //                     '<td>' + Toolbox.MysqlDateToDate(data[i].fecha_pago) + '</td>' +
    //                     '<td>' + Toolbox.TransformSpecialTag(data[i].razon) + '</td>' +
    //                     '<td>' + descuento + '</td>' +
    //                     '<td>' + data[i].notas + '</td>' +
    //                     '<td>' + Toolbox.TransformSpecialTag(data[i].tipo) + '</td></tr>');

    //                 if(!(data[i].razon in pagosPorMes)){
    //                     pagosPorMes[data[i].razon] = Number(data[i].valor);
    //                 }else{
    //                     pagosPorMes[data[i].razon] += Number(data[i].valor);
    //                 }
    //                 if(data[i].descuento != "" && data[i].descuento != "0.00") {
    //                     if (!(data[i].razon in descuentosPorMes)) {
    //                         descuentosPorMes[data[i].razon] = Number(data[i].descuento);
    //                     } else {
    //                         descuentosPorMes[data[i].razon] += Number(data[i].descuento);
    //                     }
    //                 }
    //             }

    //             var today = new Date();
    //             var startYear = 2016;
    //             var startMonth = today.getMonth()+1;
    //             var pagosPorMesSortedData = [];

    //             for(var i=today.getFullYear();i>=startYear;i--){

    //                 for(var j=startMonth;j>=1;j--){

    //                     var rowString = "";
    //                     var mesString = "mensualidad (" + Toolbox.NombreMesesEsp[j] + "/" + i + ")";
    //                     if(mesString in pagosPorMes){

    //                         var rowStyle = "";
    //                         descuento = "";
    //                         if(mesString in descuentosPorMes && descuentosPorMes[mesString] != 'undefined'){
    //                             descuento = descuentosPorMes[mesString];
    //                         }

    //                         if(Number(descuento + pagosPorMes[mesString]) < Socio.calcularValorCuota(j,i)){
    //                             rowStyle = ' style="background-color:yellow;"';
    //                         }

    //                         rowString = '<tr>' +
    //                             '<td'+ rowStyle + '>' + Toolbox.TransformSpecialTag(mesString) + '</td>' +
    //                             '<td'+ rowStyle + '>' + pagosPorMes[mesString] + '</td>' +
    //                             '<td'+ rowStyle + '>' + descuento + '</td>' +
    //                             '<td'+ rowStyle + '>' + Number(descuento + pagosPorMes[mesString]) + '</td></tr>';

    //                     }else{
    //                         rowString = '<tr>' +
    //                             '<td style="background-color: #ca5757">' + Toolbox.TransformSpecialTag(mesString) + '</td>' +
    //                             '<td style="background-color: #ca5757">-</td>' +
    //                             '<td style="background-color: #ca5757">-</td>' +
    //                             '<td style="background-color: #ca5757">-</td></tr>';
    //                     }

    //                     pagosPorMesSortedData.push(rowString);
    //                 }

    //                 startMonth = 12;
    //             }

    //             for(var i=0;i<pagosPorMesSortedData.length;i++){
    //                 $('#listaPagosPorMesSocioTabla').append(pagosPorMesSortedData[i]);
    //             }

    //             Socio.GetHorasVoluntariado();
    //         }
    //         else {
    //             if (data && data.error) {
    //                 Toolbox.ShowFeedback('feedbackContainer', 'error', data.error);
    //             } else {
    //                 Toolbox.ShowFeedback('feedbackContainer', 'error', 'Unexpected error');
    //             }
    //         }
    //         Toolbox.StopLoader();
    //     });
    // }
}

$(document).ready(function () {

    Toolbox.UpdateActiveNavbar('nav_lista_cantina');
    Toolbox.LoadPagoYearSelect('socioIngresarPagoRazonMensualidadAnio');

    $('#gasto-tab').addClass("active");

    var today = new Date();
    $('#socioIngresarPagoRazonMensualidadAnio').val(today.getFullYear());
    $('#socioIngresarPagoRazonMensualidadMes').val(Toolbox.NombreMesesEsp[today.getMonth() + 1]);

    CajaCantina.LoadUltimasTransacciones();
    CajaCantina.LoadUltimosTurnos();
    CajaCantina.LoadTotalCaja();
    CajaCantina.LoadSocios();
    CajaCantina.LoadPagos();
    CajaCantina.LoadGastos();
    CajaCantina.LoadTransaccionesIntercaja();

    var tabEl = document.querySelector('button[data-bs-toggle="pill"]');
    tabEl.addEventListener('shown.bs.tab', function (event) {
        event.target // newly activated tab
        event.relatedTarget // previous active tab
    })

    var triggerTabList = [].slice.call(document.querySelectorAll('#ingresarPagoTabs button'))
    triggerTabList.forEach(function (triggerEl) {
        triggerEl.addEventListener('click', function (event) {
            //event.preventDefault()
            switch (event.delegateTarget.id) {
                case 'ingreso-tab':
                    CajaCantina.PagoTipo = "ingreso";
                    break;
                case 'ingresoPorSocio-tab':
                    CajaCantina.PagoTipo = "ingresoPorSocio";
                    break;
                default:
                    CajaCantina.PagoTipo = "gasto";
            }
        })
    })

    if (adminId == '11') {
        $('#botonRetiroCaja').css('display', 'inline-block');
    }
});