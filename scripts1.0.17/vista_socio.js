var VistaSocio = {
    IdSocio: null,
    Hash:null,
    SocioData: {},
    BalanceHoras:0,
    DescuentoBalanceHoras:0,
    CuotaCostos: null,
    LoadSocio: function () {

        Toolbox.ShowLoader();
        $.ajax({
            dataType: 'json',
            type: "POST",
            url: "proc/public_controller.php",
            data: { func: "get_socio", hash: VistaSocio.Hash }
        }).done(function (data) {
            if (data && !data.error) {
                VistaSocio.SocioData = data;
                VistaSocio.IdSocio = data.id;

                $('#socioLabelEstado').removeClass('labelEstadoActivo');
                $('#socioLabelEstado').removeClass('labelEstadoSuspendido');
                if(data.activo==true){
                    $('#socioLabelEstado').addClass('labelEstadoActivo');
                    $('#socioLabelEstado').html("Activo");
                }else{
                    $('#socioLabelEstado').addClass('labelEstadoSuspendido');
                    $('#socioLabelEstado').html("Suspendido");
                }

                $("#socioNombreTitulo").html(data.nombre);
                $("#socioDatosValorNumero").html('<p>' + data.numero + "</p>");
                $("#socioDatosValorEmail").html('<p>' + data.email + "</p>");
                $("#socioDatosValorFechaInicio").html('<p>' + Toolbox.MysqlDateToDate(data.fecha_inicio) + "</p>");

                VistaSocio.LoadPagos();
                VistaSocio.GetDeudas();

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
    LoadPagos: function () {
        Toolbox.ShowLoader();

        var today = new Date();
        var month = today.getMonth() + 1;
        var year = today.getFullYear();

        $.ajax({
            dataType: 'json',
            type: "POST",
            url: "proc/public_controller.php",
            data: { func: "get_pagos_socio", id_socio: VistaSocio.IdSocio }
        }).done(function (data) {
            if (data && !data.error) {

                $('#listaPagosSocioTabla').html("");

                var mesString = "mensualidad (" + Toolbox.NombreMesesEsp[month] + "/" + year + ")";
                var montoPagoMes = 0;

                for (var i = 0; i < data.length; i++) {

                    var descuento = "";
                    if(data[i].descuento != "" && data[i].descuento != "0.00"){
                        descuento = data[i].descuento + ' ' + Toolbox.TransformSpecialTag(data[i].descuento_json)

                        if(data[i].descuento_json == "BalanceVoluntariado") {
                            VistaSocio.DescuentoBalanceHoras += Number(data[i].descuento);
                        }
                    }

                    if(data[i].razon == mesString) {
                        montoPagoMes += Number(data[i].valor);
                        if(data[i].descuento != "" && data[i].descuento != "0.00") {
                            montoPagoMes += Number(data[i].descuento);
                        }
                    }

                    $('#listaPagosSocioTabla').append('<tr>' +
                        '<td>' + data[i].valor + '</td>' +
                        '<td>' + Toolbox.MysqlDateToDate(data[i].fecha_pago) + '</td>' +
                        '<td>' + Toolbox.TransformSpecialTag(data[i].razon) + '</td>' +
                        '<td>' + descuento + '</td>' +
                        '<td>' + Toolbox.TransformSpecialTag(data[i].tipo) + '</td></tr>');
                }
                
                VistaSocio.GetHorasVoluntariado();

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
    GetDeudas: function(){
        Toolbox.ShowLoader();
        $.ajax({
            dataType: 'json',
            type: "POST",
            url: "proc/public_controller.php",
            data: { func: "get_deudas_socio", id_socio: VistaSocio.IdSocio }
        }).done(function (data) {
            if (data && !data.error) {
                $('.socioRecordatorioDeudaContainer').html('');
                if(data.length > 0){
                    $('.deudas').css("display","block");
                }
                for(var i=0;i<data.length;i++){
                    $('.socioRecordatorioDeudaContainer').append('<span class="alert alert-danger socio-deuda"><strong>$' + data[i].monto + "</strong>  " + data[i].razon + '</span>');
                }
            }
            Toolbox.StopLoader();
        });
    },
    GetHorasVoluntariado: function(){
        Toolbox.ShowLoader();
        $.ajax({
            dataType: 'json',
            type: "POST",
            url: "proc/public_controller.php",
            data: {func: "get_horas_socio", id_socio: VistaSocio.IdSocio}
        }).done(function (data) {
            if (data && !data.error) {

                $('#listaHorasSocioTabla').html("");
                var balance = 0;

                for (var i = 0; i < data.length; i++) {

                    balance += Number(data[i].horas * data[i].costo);

                    $('#listaHorasSocioTabla').append('<tr><td>' + Toolbox.MysqlDateToDate(data[i].created_at) + '</td>' +
                        '<td>' + Toolbox.TransformSpecialTag(data[i].rubro) + '</td>' +
                        '<td>' + data[i].horas + '</td>' +
                        '<td>' + data[i].costo + '</td></tr>');
                }

                $('#socioDatosValorBalanceHoras').html("<p>$" + Number(balance - VistaSocio.DescuentoBalanceHoras) + "</p>");
                VistaSocio.BalanceHoras = balance;

            } else {
                if (data && data.error) {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', data.error);
                } else {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', 'Error al cargar horas de voluntariado');
                }
            }
            Toolbox.StopLoader();
        });
    },
    GetCuotaCostos: function(){
        Toolbox.ShowLoader();

        $.ajax({
            dataType: 'json',
            type: "POST",
            url: "proc/public_controller.php",
            data: {func: "get_costos_cuotas"}
        }).done(function (data) {
            if (data && !data.error) {
                VistaSocio.CuotaCostos = data;
            }

            VistaSocio.LoadSocio();

            Toolbox.StopLoader();
        });
    },
    calcularValorCuota: function(mes,year){

        for(var i=0;i<VistaSocio.CuotaCostos.length;i++){
            var mesInicio = VistaSocio.CuotaCostos[i].fecha_inicio.split("-")[1];
            var mesFin = VistaSocio.CuotaCostos[i].fecha_fin.split("-")[1];
            var yearInicio = VistaSocio.CuotaCostos[i].fecha_inicio.split("-")[0];
            var yearFin = VistaSocio.CuotaCostos[i].fecha_fin.split("-")[0];

            if(((yearInicio == year && mesInicio <= mes) || yearInicio < year) &&
                ((yearFin == year && mesFin >= mes) || yearFin > year)){
                return VistaSocio.CuotaCostos[i].valor;
            }
        }
    },
}

$(document).ready(function () {

    var params = Toolbox.GetUrlVars();

    if (params['h']) {
        VistaSocio.Hash = params['h'];
    }
    VistaSocio.GetCuotaCostos();
});
