var CajaBanco = {
    Socios: null,
    SociosLoaded: false,
    Suscripciones: null,
    SuscripcionesSocios: null,
    SuscripcionesSociosPorId: null,
    Pagos: null,
    PagosPorSocio: null,
    PagosLoaded: false,
    UltimasTransacciones: null,
    UltimasTransaccionesLoaded: false,
    PagoTipo: "gasto",
    SelectedTransactionId: null,
    SocioSeleccionadoId: null,
    Splits: null,
    SplitsLoaded: false,
    TransaccionesIntercaja: null,
    TransaccionesIntercajaLoaded: false,
    TransaccionesWereGrouped: false,
    ModalImportarBrou: null,
    ModalIdentificar: null,

    LoadUltimasTransacciones: function () {
        CajaBanco.UltimasTransaccionesLoaded = false;
        CajaBanco.TransaccionesWereGrouped = false;
        Toolbox.ShowLoader();

        $.ajax({
            dataType: 'json',
            type: "POST",
            url: "../proc/admin_controller.php",
            data: { func: "get_ultimas_transacciones_banco" }
        }).done(function (data) {
            if (data && !data.error) {
                CajaBanco.UltimasTransacciones = {};
                var noIdentificados = [];
                var identificados = [];
                for (var i = 0; i < data.length; i++) {
                    CajaBanco.UltimasTransacciones[data[i].id] = data[i];

                    if (CajaBanco.IsTransaccionNoIdentificada(data[i])) {
                        noIdentificados.push(data[i]);
                    } else {
                        identificados.push(data[i]);
                    }
                }
                CajaBanco.UltimasTransaccionesLoaded = true;
                CajaBanco.GroupTransactions();
                CajaBanco.UpdateDatosPagos();
                CajaBanco.UpdateDatosIntercajas();
            } else {
                if (data && data.error) {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', data.error);
                } else {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', 'Error inesperado durante get_ultimas_transacciones_banco');
                }
            }
            Toolbox.StopLoader();
        });
    },
    IsTransaccionNoIdentificada: function (transaction) {
        return (transaction.id_pago == null
            && transaction.id_intercaja == null)
            && (transaction.is_split == false
                || CajaBanco.GetMaxValueSplit(transaction.id) > 0);
    },
    LoadSplitTransacciones: function () {
        CajaBanco.SplitsLoaded = false;
        CajaBanco.TransaccionesWereGrouped = false;
        Toolbox.ShowLoader();

        $.ajax({
            dataType: 'json',
            type: "POST",
            url: "../proc/admin_controller.php",
            data: { func: "get_transacciones_banco_splits" }
        }).done(function (data) {
            if (data && !data.error) {
                CajaBanco.Splits = {};
                for (var i = 0; i < data.length; i++) {
                    if (!(data[i].id_transaction in CajaBanco.Splits)) {
                        CajaBanco.Splits[data[i].id_transaction] = [];
                    }
                    CajaBanco.Splits[data[i].id_transaction].push(data[i]);
                }
                CajaBanco.SplitsLoaded = true;
                CajaBanco.GroupTransactions();
                CajaBanco.UpdateDatosPagos();
            } else {
                if (data && data.error) {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', data.error);
                } else {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', 'Error inesperado durante get_transacciones_banco_splits');
                }
            }
            Toolbox.StopLoader();
        });
    },
    GroupTransactions: function () {
        if (CajaBanco.SplitsLoaded === true && CajaBanco.UltimasTransaccionesLoaded === true) {
            var noIdentificados = [];
            var identificados = [];
            Object.keys(CajaBanco.UltimasTransacciones).forEach(function (transaction_id) {
                if (CajaBanco.IsTransaccionNoIdentificada(CajaBanco.UltimasTransacciones[transaction_id])) {
                    noIdentificados.push(CajaBanco.UltimasTransacciones[transaction_id]);
                } else {
                    identificados.push(CajaBanco.UltimasTransacciones[transaction_id]);
                }
            });

            noIdentificados.sort(CajaBanco.SortTransactionByFechaPago);
            identificados.sort(CajaBanco.SortTransactionByFechaPago);

            CajaBanco.PopulateTransactionsTable('#lista_last_transactions', identificados, false);
            CajaBanco.PopulateTransactionsTable('#lista_transactions_noidentificadas', noIdentificados, true);
            CajaBanco.TransaccionesWereGrouped = true;
            CajaBanco.UpdateDatosPagos();
        }
    },
    SortTransactionByFechaPago: function (a, b) {
        var aName = b.fecha_pago.toLowerCase();
        var bName = a.fecha_pago.toLowerCase();
        return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
    },
    PopulateTransactionsTable: function (table_id, data, isSinIdentificar) {
        $(table_id).html("");

        for (var i = 0; i < data.length; i++) {
            var valor = Number(data[i].valor);
            var htmlOnClick = '';
            var htmlMonto = '';
            var htmlPagoAsociado = '';
            if (isSinIdentificar == true) {
                htmlOnClick = ' onclick="CajaBanco.OpenModalIdentificarTransaccion(' + data[i].id + ')"';
                htmlMonto = Toolbox.FormatNumber(valor);
                htmlPagoAsociado = '<span class="valorRestanteNoIdentificado">No identificado</span>';
            } else {
                htmlMonto = Toolbox.FormatNumber(valor);
            }

            $(table_id).append('<tr class="rowTransactionBanco" ' + htmlOnClick + '>' +
                '<td>' + Toolbox.MysqlDateToDate(data[i].fecha_pago) + '</td>' +
                '<td>' + data[i].descripcion + '</td>' +
                '<td>' + data[i].documento + '</td>' +
                '<td>' + data[i].asunto + '</td>' +
                '<td class="montoTransaction montoTransaction' + data[i].id + '">' + htmlMonto + '</td>' +
                '<td id="pagoAsociado' + data[i].id + '" class="pagoAsociado">' + htmlPagoAsociado + '</td>' +
                '</tr>');
        }
    },
    LoadTotalCaja: function () {
        Toolbox.ShowLoader();

        $.ajax({
            dataType: 'json',
            type: "POST",
            url: "../proc/admin_controller.php",
            data: { func: "get_total_caja_banco" }
        }).done(function (data) {
            if (data === 0 || (data && !data.error)) {
                var value = Number(data);
                $('.total_en_caja').html(Toolbox.FormatNumber(value));
            } else {
                if (data && data.error) {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', data.error);
                } else {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', 'Error inesperado durante get_total_caja_banco');
                }
            }
            Toolbox.StopLoader();
        });
    },
    LoadSocios: function () {
        CajaBanco.SociosLoaded = false;
        Toolbox.ShowLoader();

        $.ajax({
            dataType: 'json',
            type: "POST",
            url: "../proc/admin_controller.php",
            data: { func: "get_lista_socios_por_nombre" }
        }).done(function (data) {
            if (data && !data.error) {
                CajaBanco.Socios = {};
                $('#socioIngresarPagoSocio').html('<option value="">- seleccionar socio -</option>');
                for (var i = 0; i < data.length; i++) {
                    CajaBanco.Socios[data[i].id] = data[i];
                    $('#socioIngresarPagoSocio').append('<option value="' + data[i].id + '">' + data[i].nombre + '</option>');
                }
                CajaBanco.SociosLoaded = true;
                CajaBanco.UpdateDatosPagos();
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
    LoadPagos: function () {
        CajaBanco.PagosLoaded = false;
        Toolbox.ShowLoader();

        $.ajax({
            dataType: 'json',
            type: "POST",
            url: "../proc/admin_controller.php",
            data: { func: "get_pagos_transactions_banco" }
        }).done(function (data) {
            if (data && !data.error) {

                CajaBanco.Pagos = {};
                CajaBanco.PagosPorSocio = {};
                for (var i = 0; i < data.length; i++) {
                    CajaBanco.Pagos[data[i].id] = data[i];
                    if (data[i].id_socio != null) {
                        CajaBanco.PagosPorSocio[data[i].id_socio] = data[i];
                    }
                }
                CajaBanco.PagosLoaded = true;
                CajaBanco.UpdateDatosPagos();
            } else {
                if (data && data.error) {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', data.error);
                } else {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', 'Error inesperado durante get_pagos_transactions_banco');
                }
            }
            Toolbox.StopLoader();
        });
    },
    UpdateDatosPagos: function () {
        if (CajaBanco.SociosLoaded === true
            && CajaBanco.PagosLoaded === true
            && CajaBanco.SplitsLoaded === true
            && CajaBanco.UltimasTransaccionesLoaded === true
            && CajaBanco.TransaccionesWereGrouped === true) {
            Object.keys(CajaBanco.UltimasTransacciones).forEach(function (transaction_id) {
                if (CajaBanco.UltimasTransacciones[transaction_id].id_pago != null) {
                    if (CajaBanco.Pagos[CajaBanco.UltimasTransacciones[transaction_id].id_pago].id_socio == null
                        || CajaBanco.Pagos[CajaBanco.UltimasTransacciones[transaction_id].id_pago].id_suscripcion_socio == null) {
                        var razon = CajaBanco.Pagos[CajaBanco.UltimasTransacciones[transaction_id].id_pago].razon;
                        $('#pagoAsociado' + transaction_id).attr('onclick', "document.location.href = 'admin_pago.php?id=" + CajaBanco.UltimasTransacciones[transaction_id].id_pago + "';");
                        $('#pagoAsociado' + transaction_id).html('<div title="' + razon + '" class="label label-success pagoIdentificado">' + CajaBanco.Pagos[CajaBanco.UltimasTransacciones[transaction_id].id_pago].razon + '</div>');
                    } else {
                        var tagSocio = '<div class="badge labelSocioTransaction" '
                            + 'onclick="document.location.href = \'admin_socio.php?id=' + CajaBanco.Pagos[CajaBanco.UltimasTransacciones[transaction_id].id_pago].id_socio + '\';">'
                            + CajaBanco.Socios[CajaBanco.Pagos[CajaBanco.UltimasTransacciones[transaction_id].id_pago].id_socio].nombre
                            + '</div>';

                        var tagRazon = '<div class="badge bg-primary labelSocioTransactionRazon"'
                            + ' onclick="document.location.href = \'admin_pago.php?id=' + CajaBanco.UltimasTransacciones[transaction_id].id_pago + '\';">'
                            + Toolbox.TransformSpecialTag(CajaBanco.Pagos[CajaBanco.UltimasTransacciones[transaction_id].id_pago].razon);
                        + '</div>';

                        $('#pagoAsociado' + transaction_id).html('<div class="banco_transaction_pago_tags">' + tagSocio + tagRazon + '</div>');
                    }

                } else if (CajaBanco.UltimasTransacciones[transaction_id].is_split == true) {
                    var countLinks = 0;
                    var valorRestanteDeIdentificar = Number(CajaBanco.UltimasTransacciones[transaction_id].valor);
                    var htmlMonto = '<span class="montoSplitTotal">Total ' + Toolbox.FormatNumber(valorRestanteDeIdentificar) + '</span></br>';;

                    for (var i = 0; i < CajaBanco.Splits[transaction_id].length; i++) {
                        valorRestanteDeIdentificar -= Number(CajaBanco.Pagos[CajaBanco.Splits[transaction_id][i].id_pago].valor);
                        var valor = Number(CajaBanco.Pagos[CajaBanco.Splits[transaction_id][i].id_pago].valor);

                        htmlMonto += '<span class="montoSplitIdentificado">' + Toolbox.FormatNumber(valor) + '</span></br>';

                        if (i == 0) {
                            var tagSocio = '<span class="badge labelSocioTransaction" '
                                + 'onclick="document.location.href = \'admin_socio.php?id=' + CajaBanco.Pagos[CajaBanco.Splits[transaction_id][i].id_pago].id_socio + '\';">'
                                + CajaBanco.Socios[CajaBanco.Pagos[CajaBanco.Splits[transaction_id][i].id_pago].id_socio].nombre + '</span>';
                            $('#pagoAsociado' + transaction_id).html('<div class="banco_transaction_pago_tags">' + tagSocio + '</div>');
                        }

                        $('#pagoAsociado' + transaction_id).append('<div class="badge bg-primary labelSocioTransactionRazon"'
                            + 'onclick="document.location.href = \'admin_pago.php?id=' + CajaBanco.Splits[transaction_id][i].id_pago + '\';">'
                            + Toolbox.TransformSpecialTag(CajaBanco.Pagos[CajaBanco.Splits[transaction_id][i].id_pago].razon)
                            + '</div>');

                        countLinks++;
                    }

                    if (valorRestanteDeIdentificar > 0) {
                        htmlMonto += '<span class="valorRestanteNoIdentificado">' + Toolbox.FormatNumber(valorRestanteDeIdentificar) + '</span>';
                    }

                    $('.montoTransaction' + transaction_id).html(htmlMonto);
                }
            });
        }
    },
    UpdateDatosIntercajas: function () {
        if (CajaBanco.TransaccionesIntercajaLoaded === true) {
            if (CajaBanco.UltimasTransaccionesLoaded === true) {
                Object.keys(CajaBanco.UltimasTransacciones).forEach(function (key) {
                    if (CajaBanco.UltimasTransacciones[key].id_intercaja != null) {
                        var origen = CajaBanco.TransaccionesIntercaja[CajaBanco.UltimasTransacciones[key].id_intercaja].caja_origen;
                        var destino = CajaBanco.TransaccionesIntercaja[CajaBanco.UltimasTransacciones[key].id_intercaja].caja_destino;
                        var flecha = '<i class="icon icon-arrow-right green-arrow"></i>';
                        var valor = Number(CajaBanco.UltimasTransacciones[key].valor);
                        if (valor < 0) {
                            flecha = '<i class="icon icon-arrow-left red-arrow"></i>';
                            origen = destino;
                            destino = CajaBanco.TransaccionesIntercaja[CajaBanco.UltimasTransacciones[key].id_intercaja].caja_origen;
                        }

                        $('#pagoAsociado' + key).attr('onclick', "document.location.href = 'intercaja.php?id=" + CajaBanco.UltimasTransacciones[key].id_intercaja + "';");
                        $('#pagoAsociado' + key).html(origen + '&nbsp;&nbsp;&nbsp;' + flecha + '&nbsp;&nbsp;&nbsp;' + destino);
                    }
                });
            }
        }
    },
    OpenModalImportar: function () {
        CajaBanco.ModalImportarBrou = new bootstrap.Modal(document.getElementById('importarBrouModal'), {});
        CajaBanco.ModalImportarBrou.show();
    },
    OpenModalIdentificarTransaccion: function (id_transaccion) {
        CajaBanco.SelectedTransactionId = id_transaccion;
        $('.feedbackContainerModal').css('display', 'none');
        $('#listaIngresarGastoRazon').val('');
        $('#listaIngresarGastoNotas').val('');
        $('#listaIngresarGastoGrupo').val('');
        $('.loaderModal').css('display', 'none');

        $('#listaIngresarIngresoRazon').val('');
        $('#listaIngresarIngresoNotas').val('');
        $('#listaIngresarIngresoGrupo').val('');

        $('#socioIngresarPagoNotas').val('');
        if (CajaBanco.UltimasTransacciones[id_transaccion].is_split == true) {
            $('#socioIngresarPagoSocio').val(CajaBanco.Pagos[CajaBanco.Splits[id_transaccion][0].id_pago].id_socio);
            CajaBanco.SocioSeleccionadoId = CajaBanco.Pagos[CajaBanco.Splits[id_transaccion][0].id_pago].id_socio;
            CajaBanco.OnChangeSocioSelector();
        } else {
            $('#socioIngresarPagoSocio').val('');
            CajaBanco.SocioSeleccionadoId = null;
        }
        $('#socioIngresarPagoValor').val(CajaBanco.GetMaxValueSplit(id_transaccion));
        $('#listaIngresarGastoValor').val(CajaBanco.GetMaxValueSplit(id_transaccion));
        $('#listaIngresarIngresoValor').val(CajaBanco.GetMaxValueSplit(id_transaccion));

        $('#listaIngresarGastoFecha').val(CajaBanco.UltimasTransacciones[id_transaccion].fecha_pago);
        $('#socioIngresarPagoFecha').val(CajaBanco.UltimasTransacciones[id_transaccion].fecha_pago);
        $('#listaIngresarIngresoFecha').val(CajaBanco.UltimasTransacciones[id_transaccion].fecha_pago);

        var valor = Number(CajaBanco.UltimasTransacciones[id_transaccion].valor);
        var currency = '&nbsp;$ ';
        valor = +valor.toFixed(2);
        if (valor < 0) {
            currency = '-$ ';
            valor *= -1;
        }
        $('#identificarPagoModalLabel').html('Identificar transacción de ' + currency + valor);
        $('.asuntoTransaccion').html('<b>Asunto:</b>&nbsp;' + CajaBanco.UltimasTransacciones[id_transaccion].asunto)

        CajaBanco.ModalIdentificar = new bootstrap.Modal(document.getElementById('identificarPagoModal'), {});
        CajaBanco.ModalIdentificar.show();
    },
    IdentificarPago: function () {
        if (CajaBanco.PagoTipo == "gasto") {
            if (CajaBanco.VerificarDatosGasto()) {
                CajaBanco.IngresarPago(
                    CajaBanco.SelectedTransactionId,
                    null,
                    null,
                    CajaBanco.UltimasTransacciones[CajaBanco.SelectedTransactionId].valor,
                    $("#listaIngresarGastoRazon").val(),
                    $('#listaIngresarGastoGrupo').val(),
                    $("#listaIngresarGastoNotas").val(),
                    null,
                    null
                );
            }
        } else if (CajaBanco.PagoTipo == "ingreso") {
            if (CajaBanco.VerificarDatosIngreso()) {
                CajaBanco.IngresarPago(
                    CajaBanco.SelectedTransactionId,
                    null,
                    null,
                    CajaBanco.UltimasTransacciones[CajaBanco.SelectedTransactionId].valor,
                    $("#listaIngresarIngresoRazon").val(),
                    $('#listaIngresarIngresoGrupo').val(),
                    $("#listaIngresarIngresoNotas").val(),
                    null,
                    null
                );
            }
        } else if (CajaBanco.PagoTipo == "ingresoPorSocio") {
            if (CajaBanco.VerificarDatosIngresoPorSocio(CajaBanco.SelectedTransactionId)) {
                var razon = null;
                var id_suscripcion_socio = $("#socioIngresarPagoSuscripcion").val();
                if (CajaBanco.Suscripciones[CajaBanco.SuscripcionesSociosPorId[id_suscripcion_socio].id_suscripcion].ciclo == 'anual') {
                    razon = $('#socioIngresarPagoRazonMensualidadAnio').val();
                }

                CajaBanco.IngresarPago(
                    CajaBanco.SelectedTransactionId,
                    CajaBanco.SocioSeleccionadoId,
                    id_suscripcion_socio,
                    $("#socioIngresarPagoValor").val(),
                    razon,
                    'Suscripcion',
                    $("#socioIngresarPagoNotas").val(),
                    $("#socioIngresarPagoDescuento").val(),
                    $("#socioIngresarPagoRazonDescuento").val()
                );
            }
        } else if (CajaBanco.PagoTipo == "movimientoArcas") {
            CajaBanco.IngresarIntercaja(CajaBanco.SelectedTransactionId);
        }
    },
    VerificarDatosGasto: function () {
        var error = undefined;

        if (!error && $('#listaIngresarGastoGrupo').val() == "") {
            error = 'Falt&oacute; especificar rubro';
        }

        if (!error && $('#listaIngresarGastoRazon').val() == "") {
            error = 'Faltó especificar razón';
        }

        if (!error && Number(CajaBanco.UltimasTransacciones[CajaBanco.SelectedTransactionId].valor) > 0) {
            error = 'El valor no puede ser positivo para un gasto';
        }

        if (error == undefined) {
            Toolbox.ShowFeedback('feedbackContainerModalIdentificarPago', '', '');
        }
        else {
            Toolbox.ShowFeedback('feedbackContainerModalIdentificarPago', 'error', error);
        }

        return error == undefined;
    },
    VerificarDatosIngreso: function () {
        var error = undefined;

        if (!error && $('#listaIngresarIngresoGrupo').val() == "") {
            error = 'Falt&oacute; especificar rubro';
        }

        if (!error && $('#listaIngresarIngresoRazon').val() == "") {
            error = 'Faltó especificar razón';
        }

        if (!error && Number(CajaBanco.UltimasTransacciones[CajaBanco.SelectedTransactionId].valor) < 0) {
            error = 'El valor no puede ser negativo para un ingreso';
        }

        if (error == undefined) {
            Toolbox.ShowFeedback('feedbackContainerModalIdentificarPago', '', '');
        }
        else {
            Toolbox.ShowFeedback('feedbackContainerModalIdentificarPago', 'error', error);
        }

        return error == undefined;
    },
    IngresarPago: function (id_transaccion, id_socio, id_suscripcion_socio, valor, razon, rubro, notas, descuento, descuento_razon) {
        Toolbox.ShowLoaderModal();
        Toolbox.ShowFeedback('feedbackContainerModalIdentificarPago', '', '');

        if (CajaBanco.IsIngresoSocioSplitting(id_transaccion, valor)) {
            $.ajax({
                dataType: 'json',
                type: "POST",
                url: "../proc/admin_controller.php",
                data: {
                    func: "identificar_transaccion_banco_split",
                    id_transaccion: id_transaccion,
                    id_socio: id_socio,
                    id_suscripcion_socio: id_suscripcion_socio,
                    valor: valor,
                    razon: razon,
                    rubro: rubro,
                    notas: notas,
                    descuento: descuento,
                    descuento_razon: descuento_razon
                }
            }).done(function (data) {
                if (data && !data.error) {
                    CajaBanco.LoadPagos();
                    CajaBanco.LoadUltimasTransacciones();
                    CajaBanco.LoadSplitTransacciones();
                    CajaBanco.ModalIdentificar.hide();
                    Toolbox.ShowFeedback('feedbackContainerCaja', 'success', 'Pago identificado correctamente');
                } else {
                    if (data && data.error) {
                        Toolbox.ShowFeedback('feedbackContainerModalIdentificarPago', 'error', data.error);
                    } else {
                        Toolbox.ShowFeedback('feedbackContainerModalIdentificarPago', 'error', 'Error inesperado al identificar_transaccion_banco_split');
                    }
                }
                Toolbox.StopLoaderModal();
            });
        } else {
            $.ajax({
                dataType: 'json',
                type: "POST",
                url: "../proc/admin_controller.php",
                data: {
                    func: "identificar_transaccion_banco",
                    id_transaccion: id_transaccion,
                    id_socio: id_socio,
                    id_suscripcion_socio: id_suscripcion_socio,
                    valor: valor,
                    razon: razon,
                    rubro: rubro,
                    notas: notas,
                    descuento: descuento,
                    descuento_razon: descuento_razon
                }
            }).done(function (data) {
                if (data && !data.error) {
                    CajaBanco.LoadPagos();
                    CajaBanco.LoadUltimasTransacciones();
                    CajaBanco.ModalIdentificar.hide();
                    Toolbox.ShowFeedback('feedbackContainerCaja', 'success', 'Pago identificado correctamente');
                } else {
                    if (data && data.error) {
                        Toolbox.ShowFeedback('feedbackContainerModalIdentificarPago', 'error', data.error);
                    } else {
                        Toolbox.ShowFeedback('feedbackContainerModalIdentificarPago', 'error', 'Error inesperado durante identificar_transaccion_banco');
                    }
                }
                Toolbox.StopLoaderModal();
            });
        }
    },
    VerificarDatosIngresoPorSocio: function (id_transaction) {
        var error = undefined;

        if (!error && (CajaBanco.SocioSeleccionadoId == null || CajaBanco.SocioSeleccionadoId == undefined || CajaBanco.SocioSeleccionadoId == '')) {
            error = 'Falt&oacute; seleccionar socio';
        } else if (!error && $('#socioIngresarPagoValor').val() == '') {
            error = 'Falt&oacute; especificar el valor del pago';
        } else if (!error && isNaN($('#socioIngresarPagoValor').val())) {
            error = 'Valor invalido';
        } else if (!error && CajaBanco.GetMaxValueSplit(id_transaction) < $('#socioIngresarPagoValor').val()) {
            error = 'El máximo Valor para identificar es de $' + CajaBanco.GetMaxValueSplit(id_transaction);
        } else if (!error && Number($('#socioIngresarPagoValor').val()) < 0) {
            error = 'El valor no puede ser negativo para un ingreso';
        }

        if (error == undefined) {
            Toolbox.ShowFeedback('feedbackContainerModalIdentificarPago', '', '');
        }
        else {
            Toolbox.ShowFeedback('feedbackContainerModalIdentificarPago', 'error', error);
        }

        return error == undefined;
    },
    GetMaxValueSplit: function (id_transaction) {
        if (CajaBanco.Splits && id_transaction in CajaBanco.Splits) {
            var totalInSplits = 0;
            for (var i = 0; i < CajaBanco.Splits[id_transaction].length; i++) {
                totalInSplits += Number(CajaBanco.Splits[id_transaction][i].valor);
            }
            return Number(CajaBanco.UltimasTransacciones[id_transaction].valor) - totalInSplits;
        } else {
            return Number(CajaBanco.UltimasTransacciones[id_transaction].valor);
        }
    },
    IsIngresoSocioSplitting: function (id_transaction, valor) {
        if (CajaBanco.Splits && id_transaction in CajaBanco.Splits) {
            return true;
        } else {
            return Number(CajaBanco.UltimasTransacciones[id_transaction].valor) > Number(valor);
        }
    },
    // IngresarPagoSocio: function (id_transaction, id_socio, valor, razon, notas, descuento, descuento_json) {
    //     if ($("#socioIngresarPagoRazon").val() == "mensualidad") {
    //         razon = "mensualidad (" + $('#socioIngresarPagoRazonMensualidadMes').val() + "/" + $('#socioIngresarPagoRazonMensualidadAnio').val() + ")";
    //     }

    //     Toolbox.ShowLoaderModal();
    //     Toolbox.ShowFeedback('feedbackContainerModalIdentificarPago', '', '');

    //     if (CajaBanco.IsIngresoSocioSplitting(id_transaction, valor)) {
    //         $.ajax({
    //             dataType: 'json',
    //             type: "POST",
    //             url: "../proc/admin_controller.php",
    //             data: {
    //                 func: "transaccion_identificar_pago_split",
    //                 id_transaccion: id_transaction,
    //                 id_socio: id_socio,
    //                 razon: razon,
    //                 notas: notas,
    //                 descuento: descuento,
    //                 descuento_json: descuento_json,
    //                 valor: valor
    //             }
    //         }).done(function (data) {
    //             if (data && !data.error) {
    //                 CajaBanco.LoadPagos();
    //                 CajaBanco.LoadUltimasTransacciones();
    //                 CajaBanco.LoadSplitTransacciones();
    //                 CajaBanco.ModalIdentificar.hide();
    //             } else {
    //                 if (data && data.error) {
    //                     Toolbox.ShowFeedback('feedbackContainerModalIdentificarPago', 'error', data.error);
    //                 } else {
    //                     Toolbox.ShowFeedback('feedbackContainerModalIdentificarPago', 'error', 'Error inesperado al transaccion_identificar_pago');
    //                 }
    //             }
    //             Toolbox.StopLoaderModal();
    //         });
    //     } else {
    //         $.ajax({
    //             dataType: 'json',
    //             type: "POST",
    //             url: "../proc/admin_controller.php",
    //             data: {
    //                 func: "transaccion_identificar_pago",
    //                 id_transaccion: id_transaction,
    //                 id_socio: id_socio,
    //                 razon: razon,
    //                 notas: notas,
    //                 descuento: descuento,
    //                 descuento_json: descuento_json
    //             }
    //         }).done(function (data) {
    //             if (data && !data.error) {
    //                 CajaBanco.LoadUltimasTransacciones();
    //                 CajaBanco.LoadPagos();
    //                 CajaBanco.ModalIdentificar.hide();
    //             } else {
    //                 if (data && data.error) {
    //                     Toolbox.ShowFeedback('feedbackContainerModalIdentificarPago', 'error', data.error);
    //                 } else {
    //                     Toolbox.ShowFeedback('feedbackContainerModalIdentificarPago', 'error', 'Error inesperado al transaccion_identificar_pago');
    //                 }
    //             }
    //             Toolbox.StopLoaderModal();
    //         });
    //     }
    // },
    OnChangeSocioSelector: function () {
        CajaBanco.SocioSeleccionadoId = $('#socioIngresarPagoSocio').val();
        $('#socioIngresarPagoSuscripcion').html("");

        if (CajaBanco.SocioSeleccionadoId != '' && CajaBanco.SocioSeleccionadoId in CajaBanco.SuscripcionesSocios) {
            for (var i = 0; i < CajaBanco.SuscripcionesSocios[CajaBanco.SocioSeleccionadoId].length; i++) {
                $('#socioIngresarPagoSuscripcion').append('<option value="' + CajaBanco.SuscripcionesSocios[CajaBanco.SocioSeleccionadoId][i].id + '"'
                    + (i == 0 ? "selected" : "") + '>'
                    + CajaBanco.Suscripciones[CajaBanco.SuscripcionesSocios[CajaBanco.SocioSeleccionadoId][i].id_suscripcion].nombre + '</option>');
            }
            $('#socioIngresarPagoSuscripcion').prop('disabled', false);
        } else {
            $('#socioIngresarPagoSuscripcion').prop('disabled', true);
        }
        CajaBanco.TogglePagoRazonSuscripcion();
    },
    TogglePagoRazonSuscripcion: function () {
        if (CajaBanco.SocioSeleccionadoId != '') {
            var id_suscripcion_socio = $('#socioIngresarPagoSuscripcion').val();
            if (CajaBanco.Suscripciones[CajaBanco.SuscripcionesSociosPorId[id_suscripcion_socio].id_suscripcion].ciclo == 'anual') {
                $('#socioIngresarPagoRazonMensualidadAnio').prop('disabled', false);
            }
        } else {
            $('#socioIngresarPagoRazonMensualidadAnio').prop('disabled', true);
        }
    },
    LoadTransaccionesIntercaja: function () {
        CajaBanco.TransaccionesIntercajaLoaded = false;
        Toolbox.ShowLoader();

        $.ajax({
            dataType: 'json',
            type: "POST",
            url: "../proc/admin_controller.php",
            data: {
                func: "get_transactions_caja",
                caja: "BROU"
            }
        }).done(function (data) {
            if (data && !data.error) {
                $('#lista_last_intercaja').html("");

                CajaBanco.TransaccionesIntercaja = {};
                for (var i = 0; i < data.length; i++) {
                    CajaBanco.TransaccionesIntercaja[data[i].id] = data[i];
                }
                CajaBanco.TransaccionesIntercajaLoaded = true;
                CajaBanco.UpdateDatosIntercajas();

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
    IngresarIntercaja: function (id_transaccion) {
        Toolbox.ShowLoaderModal();
        Toolbox.ShowFeedback('feedbackContainerModalIdentificarPago', '', '');

        $.ajax({
            dataType: 'json',
            type: "POST",
            url: "../proc/admin_controller.php",
            data: {
                func: "transaccion_identificar_intercaja",
                id_transaccion: id_transaccion,
                caja: $('#inputNuevoRetiroDestino').val()
            }
        }).done(function (data) {
            if (data && !data.error) {
                CajaBanco.LoadTransaccionesIntercaja();
                CajaBanco.LoadUltimasTransacciones();
                CajaBanco.ModalIdentificar.hide();
            } else {
                if (data && data.error) {
                    Toolbox.ShowFeedback('feedbackContainerModalIdentificarPago', 'error', data.error);
                } else {
                    Toolbox.ShowFeedback('feedbackContainerModalIdentificarPago', 'error', 'Error inesperado durante transaccion_identificar_intercaja');
                }
            }
            Toolbox.StopLoaderModal();
        });
    },
    PrecargarGasto: function (key) {
        switch (key) {
            case 'UTE':
                $('#listaIngresarGastoGrupo').val('Energia');
                $('#listaIngresarGastoRazon').val('UTE');
                break;
            case 'OSE':
                $('#listaIngresarGastoGrupo').val('Cultivo');
                $('#listaIngresarGastoRazon').val('OSE');
                break;
            case 'ANTEL':
                $('#listaIngresarGastoGrupo').val('Administracion');
                $('#listaIngresarGastoRazon').val('ANTEL');
                break;
            case 'BPS':
                $('#listaIngresarGastoGrupo').val('Administracion');
                $('#listaIngresarGastoRazon').val('BPS');
                break;
            case 'Costos Bancarios':
                $('#listaIngresarGastoGrupo').val('Administracion');
                $('#listaIngresarGastoRazon').val('Costos Bancarios');
                break;
            case 'Jardinero':
                $('#listaIngresarGastoGrupo').val('Jardineros');
                $('#listaIngresarGastoRazon').val('Servicio jardineria');
                break;
            case 'Jardinero':
                $('#listaIngresarGastoGrupo').val('Jardineros');
                $('#listaIngresarGastoRazon').val('Servicio jardineria');
                break;
            case 'Limpieza':
                $('#listaIngresarGastoGrupo').val('Limpieza');
                $('#listaIngresarGastoRazon').val('Servicio limpieza');
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
    LoadSuscripcionesSocios: function () {
        Toolbox.ShowLoader();

        $.ajax({
            dataType: 'json',
            type: "POST",
            url: "../proc/admin_controller.php",
            data: { func: "get_suscripciones_socios" }
        }).done(function (data) {
            if (data && !data.error) {
                CajaBanco.SuscripcionesSocios = {};
                CajaBanco.SuscripcionesSociosPorId = {};
                for (var i = 0; i < data.length; i++) {
                    if (!(data[i].id_socio in CajaBanco.SuscripcionesSocios)) {
                        CajaBanco.SuscripcionesSocios[data[i].id_socio] = [];
                    }
                    CajaBanco.SuscripcionesSocios[data[i].id_socio].push(data[i]);
                    CajaBanco.SuscripcionesSociosPorId[data[i].id] = data[i];
                }
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
        Toolbox.ShowLoader();

        $.ajax({
            dataType: 'json',
            type: "POST",
            url: "../proc/admin_controller.php",
            data: { func: "get_suscripciones" }
        }).done(function (data) {
            if (data && !data.error) {
                CajaBanco.Suscripciones = {};
                for (var i = 0; i < data.length; i++) {
                    CajaBanco.Suscripciones[data[i].id] = data[i];
                }
            } else {
                if (data && data.error) {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', data.error);
                } else {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', 'Error inesperado durante get_suscripciones');
                }
            }
            Toolbox.StopLoader();
        });
    }
}

$(document).ready(function () {

    Toolbox.UpdateActiveNavbar('nav_lista_banco');

    $("#inputNuevoRetiroFecha").mask("99/99/9999");

    Toolbox.LoadPagoYearSelect('socioIngresarPagoRazonMensualidadAnio');

    var today = new Date();
    $('#socioIngresarPagoRazonMensualidadAnio').val(today.getFullYear());
    $('#socioIngresarPagoRazonMensualidadMes').val(Toolbox.NombreMesesEsp[today.getMonth() + 1]);

    CajaBanco.LoadUltimasTransacciones();
    CajaBanco.LoadSplitTransacciones();
    CajaBanco.LoadTotalCaja();
    CajaBanco.LoadSocios();
    CajaBanco.LoadPagos();
    CajaBanco.LoadTransaccionesIntercaja();
    CajaBanco.LoadSuscripciones();
    CajaBanco.LoadSuscripcionesSocios();

    $('#gasto-tab').addClass("active");

    $('#tipoPagosTabs a[href="#movimientoArcas"]').click(function (e) {
        e.preventDefault();
        CajaBanco.PagoTipo = "movimientoArcas";
        $(this).tab('show');
    });

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
                    CajaBanco.PagoTipo = "ingreso";
                    break;
                case 'ingresoPorSocio-tab':
                    CajaBanco.PagoTipo = "ingresoPorSocio";
                    break;
                case 'movimientoIntercaja-tab':
                    CajaBanco.PagoTipo = "movimientoIntercaja";
                    break;
                default:
                    CajaBanco.PagoTipo = "gasto";
            }
        })
    })

    //import results
    if (imported == true) {
        if (importedTransactionIds) {
            Toolbox.ShowFeedback('feedbackContainerGreen', 'success', 'Se importaron ' + importedTransactionIds.length + ' transacciones correctamente', true, false);
        } else {
            Toolbox.ShowFeedback('feedbackContainerGreen', '', '', true, false);
        }
        if (importErrors.length > 0) {
            var errorMessageRed = "";
            var errorMessageYellowCount = 0;
            for (var i = 0; i < importErrors.length; i++) {
                if (importErrors[i] == "duplicada") {
                    errorMessageYellowCount++;
                } else {
                    if (errorMessageRed != "") {
                        //errorMessageRed += "\n\r";
                    }
                    errorMessageRed += '<p>' + importErrors[i] + '</p>';
                }
            }

            if (errorMessageRed != "") {
                Toolbox.ShowFeedback('feedbackContainerRed', 'error', errorMessageRed, true, false);
            } else {
                Toolbox.ShowFeedback('feedbackContainerRed', '', '', true, false);
            }

            if (errorMessageYellowCount > 0) {
                Toolbox.ShowFeedback('feedbackContainerYellow', 'warning', 'Se detectaron ' + errorMessageYellowCount + ' transacciones ya existentes.', true, false);
            } else {
                Toolbox.ShowFeedback('feedbackContainerYellow', '', '', true, false);
            }

        } else {
            Toolbox.ShowFeedback('feedbackContainerRed', '', '', true, false);
            Toolbox.ShowFeedback('feedbackContainerYellow', '', '', true, false);
        }
    }
});