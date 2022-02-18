/**
 * Created with JetBrains PhpStorm.
 * User: Martin
 * Date: 09/03/14
 * Time: 08:06 PM
 * To change this template use File | Settings | File Templates.
 */

var Estadisticas = {
    DataGastos: null,
    DataPagos: null,
    DataHorasVoluntariado: null,
    LoadListaGastos: function () {

        Toolbox.ShowLoader();

        $.ajax({
            dataType: 'json',
            type: "POST",
            url: "../proc/admin_controller.php",
            data: { func: "get_lista_gastos" }
        }).done(function (data) {
            if (data && !data.error) {
                Estadisticas.DataGastos = data;

                if (Estadisticas.DataPagos) {
                    Estadisticas.ArmarTortaGastos(Estadisticas.DataGastos, $('#select-torta-gastos').val());
                    Estadisticas.ArmarGraficaIngresosEgresos();
                }
            }
            Toolbox.StopLoader();
        });
    },
    LoadPagos: function () {
        Toolbox.ShowLoader();

        $.ajax({
            dataType: 'json',
            type: "POST",
            url: "../proc/admin_controller.php",
            data: { func: "get_lista_pagos" }
        }).done(function (data) {
            if (data && !data.error) {
                Estadisticas.DataPagos = data;
                if (Estadisticas.DataGastos) {
                    Estadisticas.ArmarGraficaIngresosEgresos();
                    Estadisticas.ArmarTortaGastos(Estadisticas.DataGastos, $('#select-torta-gastos').val());
                    Estadisticas.ArmarGraficaDeuda();
                }
                Estadisticas.ArmarGraficaDescuentos(Estadisticas.DataPagos);
                Estadisticas.ArmarGraficaPagosMembresias(Estadisticas.DataPagos);
            }
            Toolbox.StopLoader();
        });
    },
    LoadHorasVoluntariado: function () {
        Toolbox.ShowLoader();

        $.ajax({
            dataType: 'json',
            type: "POST",
            url: "../proc/admin_controller.php",
            data: { func: "get_horas_all" }
        }).done(function (data) {
            if (data && !data.error) {
                Estadisticas.DataHorasVoluntariado = data;
                Estadisticas.ArmarGraficaHorasVoluntariado(data);
            }
            Toolbox.StopLoader();
        });
    },
    ArmarBarsGastos: function (data) {

        //parse data
        var auxData = {};
        for (var i = 0; i < data.length; i++) {

            var valor = Number(data[i].valor);
            if (valor > 0) {
                var mes = new Date(data[i].fecha_pago);
                var year = mes.getFullYear();
                mes = Toolbox.NombreMesesEsp[mes.getMonth() + 1] + " " + year;

                if (!auxData[mes]) {
                    auxData[mes] = 0;
                }
                auxData[mes] += valor;
            }
        }
        var dataSource = [];
        $.each(auxData, function (index, value) {
            var mes = index;
            dataSource.push({ mes: mes, valor: value });
        });

        $("#bars-gastos").dxChart({
            dataSource: dataSource,
            argumentAxis: {
                valueMarginsEnabled: false,
                discreteAxisDivisionMode: "crossLabels",
                grid: {
                    visible: true
                }
            },
            series: {
                valueField: "valor",
                argumentField: "mes",
                color: '#CB797C'
            },
            commonSeriesSettings: {
                label: {
                    visible: true,
                    connector: {
                        visible: true
                    },
                    customizeText: function (value) {
                        return "$" + value.value;
                    }
                },
                argumentField: "mes",
                type: "fullStackedLine"
            },
            tooltip: {
                enabled: true,
                customizeText: function (value) {
                    return "$" + value.value;
                }
            },
            legend: {
                visible: false
            },
            valueAxis: {
                title: {
                    text: "pesos"
                }
            },
            title: "Gastos totales (por mes)"
        });
    },
    ArmarTortaGastos: function (data, scope) {
        //filter scope
        var dataToUse;

        var descuentos = [];
        for (var i = 0; i < Estadisticas.DataPagos.length; i++) {
            if (Estadisticas.DataPagos[i].descuento != "0.00") {
                descuentos.push({
                    rubro: "Descuentos por " + Estadisticas.DataPagos[i].descuento_json,
                    valor: Estadisticas.DataPagos[i].descuento,
                    fecha_pago: Estadisticas.DataPagos[i].fecha_pago
                });
            }
        }

        if (scope == "comienzo") {
            dataToUse = data;
            dataToUse = dataToUse.concat(descuentos);

        } else {

            dataToUse = [];
            var today = new Date();
            var year = Number(today.getFullYear());
            var month = Number(today.getMonth()) + 1;
            var day = Number(today.getDate());

            if (scope == "12") {
                month -= 12;
                if (month < 1) {
                    year -= 1;
                    month = 12 + month;
                }

            } else if (scope == "3") {
                month -= 3;
                if (month < 1) {
                    year -= 1;
                    month = 12 + month;
                }

            } else if (scope == "1") {
                month -= 1;
                if (month < 1) {
                    year -= 1;
                    month = 12;
                }
            }

            for (var i = 0; i < data.length; i++) {
                var fecha_gasto = (Estadisticas.DataGastos[i].fecha_pago).split("-");
                var dia_gasto = Number(fecha_gasto[2]);
                var mes_gasto = Number(fecha_gasto[1]);
                var year_gasto = Number(fecha_gasto[0]);

                if ((year_gasto > year) ||
                    (year_gasto == year && mes_gasto > month) ||
                    (year_gasto == year && mes_gasto == month && dia_gasto >= day)) {
                    dataToUse.push(data[i]);
                }
            }

            for (var i = 0; i < descuentos.length; i++) {
                var fecha_gasto = (descuentos[i].fecha_pago).split("-");
                var dia_gasto = Number(fecha_gasto[2]);
                var mes_gasto = Number(fecha_gasto[1]);
                var year_gasto = Number(fecha_gasto[0]);

                if ((year_gasto > year) ||
                    (year_gasto == year && mes_gasto > month) ||
                    (year_gasto == year && mes_gasto == month && dia_gasto >= day)) {
                    dataToUse.push(descuentos[i]);
                }
            }
        }


        //parse data
        var auxData = {};
        for (var i = 0; i < dataToUse.length; i++) {
            if (dataToUse[i].rubro == "" || dataToUse[i].rubro == "Devoluciones") {
                //do nothing
            } else {
                if (!auxData[dataToUse[i].rubro]) {
                    auxData[dataToUse[i].rubro] = 0;
                }
                auxData[dataToUse[i].rubro] += Number(dataToUse[i].valor);
            }
        }
        var dataSource = [];
        $.each(auxData, function (index, value) {
            var rubro = index;

            switch (rubro) {
                case 'Locacion':
                    rubro = 'Locaci&oacute;n';
                    break;
                case 'Energia':
                    rubro = 'Energ&iacute;a';
                    break;
            }

            dataSource.push({ rubro: rubro, valor: value });
        });

        $("#torta-gastos").dxPieChart({
            size: {
                width: 900
            },
            dataSource: dataSource,
            series: [
                {
                    argumentField: "rubro",
                    valueField: "valor",
                    label: {
                        visible: true,
                        connector: {
                            visible: true,
                            width: 1
                        },
                        customizeText: function (value) {
                            return value.percentText;
                        }
                    }
                }
            ],
            tooltip: {
                enabled: true,
                customizeText: function (value) {
                    return "$" + value.value;
                }
            },
            title: "Gastos totales por rubro ($)"
        });
    },
    ArmarGraficaIngresosEgresos: function () {

        var dataSource = [];
        var auxDataEgreso = {};
        var auxDataIngreso = {};

        //parse data GASTOS
        //console.log(Estadisticas.DataGastos);
        for (var i = 0; i < Estadisticas.DataGastos.length; i++) {

            var mes = (Estadisticas.DataGastos[i].fecha_pago).split("-")[1];
            var year = (Estadisticas.DataGastos[i].fecha_pago).split("-")[0];
            mes = Toolbox.NombreMesesEsp[Number(mes)] + " " + year;

            var valor = Number(Estadisticas.DataGastos[i].valor);
            if (valor > 0) {
                //egreso
                if (!auxDataEgreso[mes]) {
                    auxDataEgreso[mes] = 0;
                }
                auxDataEgreso[mes] += valor;
                //if (mes == "Octubre 2014") {
                //    console.log(valor);
                //}
            } else {
                //ingreso
                if (!auxDataIngreso[mes]) {
                    auxDataIngreso[mes] = 0;
                }
                auxDataIngreso[mes] += valor * -1;
            }

        }
        $.each(auxDataEgreso, function (index, value) {
            var mes = index;
            dataSource.push({ mes: mes, egresos: value });
        });
        $.each(auxDataIngreso, function (index, value) {
            var mes = index;
            dataSource.push({ mes: mes, ingresos: value });
        });

        //parse data PAGOS
        auxDataIngreso = {};
        for (var i = 0; i < Estadisticas.DataPagos.length; i++) {

            var mes = new Date(Estadisticas.DataPagos[i].fecha_pago);
            var year = mes.getFullYear();
            mes = Toolbox.NombreMesesEsp[mes.getMonth() + 1] + " " + year;

            if (!auxDataIngreso[mes]) {
                auxDataIngreso[mes] = 0;
            }
            auxDataIngreso[mes] += Number(Estadisticas.DataPagos[i].valor);
        }
        $.each(auxDataIngreso, function (index, value) {
            var mes = index;
            dataSource.push({ mes: mes, ingresos: value });
        });

        //console.log(dataSource);

        $("#torta-ingresos").dxChart({
            dataSource: dataSource,
            series: [
                {
                    argumentField: "mes",
                    valueField: "egresos",
                    name: "Egresos",
                    type: "bar",
                    color: '#C46A6A'
                },
                {
                    argumentField: "mes",
                    valueField: "ingresos",
                    name: "Ingresos",
                    type: "bar",
                    color: '#7EC16A'
                }],
            tooltip: {
                enabled: true,
                customizeText: function (value) {
                    return "$" + value.value;
                }
            },
            legend: {
                visible: true,
                verticalAlignment: 'bottom',
                horizontalAlignment: 'center'
            },
            valueAxis: {
                title: {
                    text: "pesos"
                }
            },
            argumentAxis: {
                type: 'discrete',
                label: {
                    overlappingBehavior: { mode: 'rotate', rotationAngle: 60 }
                }
            },
            title: "Ingresos/Egresos (por mes)"
        });
    }
    ,
    ArmarGraficaHorasVoluntariado: function (data) {

        //parse data

        var auxData = {};
        var rubros = {};
        var orderCats = [];

        data.sort(function (a, b) {
            var dateA = new Date(a.created_at);
            var dateB = new Date(b.created_at);
            return dateA - dateB;
        });

        for (var i = 0; i < data.length; i++) {

            var fecha = new Date(data[i].created_at);
            var year = fecha.getFullYear();
            var textoX = Toolbox.NombreMesesEsp[fecha.getMonth() + 1] + " " + year;

            if (!auxData[textoX]) {
                auxData[textoX] = {};
                orderCats.push(textoX);
            }

            var rubro = data[i].rubro;
            if (!rubros[rubro]) {
                rubros[rubro] = "true";
            }

            if (auxData[textoX][rubro]) {
                auxData[textoX][rubro] += Number(data[i].horas);
            } else {
                auxData[textoX][rubro] = Number(data[i].horas);
            }
        }
        var dataSource = [];
        $.each(auxData, function (index, value) {
            var mes = index;
            var rubross = value;
            var obj = { mes: mes };
            $.each(rubross, function (indexV, valueV) {
                obj[indexV] = valueV;
            });
            dataSource.push(obj);
        });

        var fields = [];
        $.each(rubros, function (index, value) {
            fields.push({ valueField: index, name: index });
        });

        //console.log(dataSource);

        /*
         var dataSource = [
         { state: "Germany", young: 6.7, older: 5.1 },
         { state: "Japan", young: 9.6, middle: 43.4, older: 9},
         { state: "Russia", young: 13.5, middle: 49},
         { state: "USA", middle: 90.3, older: 14.5 }
         ];
         */

        $("#torta-horas").dxChart({
            dataSource: dataSource,
            commonSeriesSettings: {
                argumentField: "mes",
                type: "stackedBar"
            },
            series: fields,
            legend: {
                verticalAlignment: "bottom",
                horizontalAlignment: "center",
                itemTextPosition: 'top'
            },
            title: "Horas de voluntariado (por mes)",
            tooltip: {
                enabled: true,
                customizeText: function () {
                    var num = Number(this.valueText);
                    return this.seriesName + ": " + num.toFixed(1) + " hrs.";
                }
            },
            valueAxis: {
                title: {
                    text: "horas"
                }
            },
            argumentAxis: {
                type: 'discrete',
                categories: orderCats,
                label: {
                    overlappingBehavior: { mode: 'rotate', rotationAngle: 60 }
                }
            }
        });
    }
    ,
    OnChangeSelectTortaGastos: function () {
        Estadisticas.ArmarTortaGastos(Estadisticas.DataGastos, $('#select-torta-gastos').val());
    },
    ArmarGraficaDescuentos: function (data) {

        //parse data

        var auxData = {};
        var razones = {};
        var orderCats = [];

        data.sort(function (a, b) {
            var dateA = new Date(a.fecha_pago);
            var dateB = new Date(b.fecha_pago);
            return dateA - dateB;
        });

        for (var i = 0; i < data.length; i++) {

            if (data[i].descuento != "0.00") {
                var fecha = new Date(data[i].fecha_pago);
                var year = fecha.getFullYear();
                var textoX = Toolbox.NombreMesesEsp[fecha.getMonth() + 1] + " " + year;

                if (!auxData[textoX]) {
                    auxData[textoX] = {};
                    orderCats.push(textoX);
                }

                var razon = data[i].descuento_json;


                if (!razones[razon]) {
                    razones[razon] = "true";
                }

                if (auxData[textoX][razon]) {
                    auxData[textoX][razon] += Number(data[i].descuento);
                } else {
                    auxData[textoX][razon] = Number(data[i].descuento);
                }
            }
        }
        var dataSource = [];
        $.each(auxData, function (index, value) {
            var mes = index;
            var raz = value;
            var obj = { mes: mes };
            $.each(raz, function (indexV, valueV) {
                obj[indexV] = valueV;
            });
            dataSource.push(obj);
        });

        var fields = [];
        $.each(razones, function (index, value) {
            fields.push({ valueField: index, name: index });
        });

        //console.log(dataSource);

        /*
         var dataSource = [
         { state: "Germany", young: 6.7, older: 5.1 },
         { state: "Japan", young: 9.6, middle: 43.4, older: 9},
         { state: "Russia", young: 13.5, middle: 49},
         { state: "USA", middle: 90.3, older: 14.5 }
         ];
         */

        $("#torta-descuentos").dxChart({
            dataSource: dataSource,
            commonSeriesSettings: {
                argumentField: "mes",
                type: "stackedBar"
            },
            series: fields,
            legend: {
                verticalAlignment: "bottom",
                horizontalAlignment: "center",
                itemTextPosition: 'top'
            },
            title: "Descuentos totales (por mes)",
            tooltip: {
                enabled: true,
                customizeText: function () {
                    var num = Number(this.valueText);
                    return this.seriesName + ": $" + num.toFixed(2);
                }
            },
            valueAxis: {
                title: {
                    text: "$"
                }
            },
            argumentAxis: {
                type: 'discrete',
                categories: orderCats,
                label: {
                    overlappingBehavior: { mode: 'rotate', rotationAngle: 60 }
                }
            }
        });
    },
    ArmarGraficaDeuda: function (data) {

        var dataSource = [];
        var auxDataCajaPorMes = {};
        var auxDataCajaPorMesCount = {};
        var mes;
        var year;
        var valor;

        //parse data GASTOS
        //console.log(Estadisticas.DataGastos);
        for (var i = 0; i < Estadisticas.DataGastos.length; i++) {

            mes = (Estadisticas.DataGastos[i].fecha_pago).split("-")[1];
            year = (Estadisticas.DataGastos[i].fecha_pago).split("-")[0];
            mes = Toolbox.NombreMesesEsp[Number(mes)] + " " + year;

            valor = Number(Estadisticas.DataGastos[i].valor);

            if (auxDataCajaPorMes.hasOwnProperty(mes)) {
                auxDataCajaPorMes[mes] += valor * -1;
                auxDataCajaPorMesCount[mes] += 1;
            } else {
                auxDataCajaPorMes[mes] = valor * -1;
                auxDataCajaPorMesCount[mes] = 1;
            }
        }

        //parse data PAGOS
        for (var i = 0; i < Estadisticas.DataPagos.length; i++) {

            mes = (Estadisticas.DataPagos[i].fecha_pago).split("-")[1];
            year = (Estadisticas.DataPagos[i].fecha_pago).split("-")[0];
            mes = Toolbox.NombreMesesEsp[Number(mes)] + " " + year;

            valor = Number(Estadisticas.DataPagos[i].valor);

            if (auxDataCajaPorMes.hasOwnProperty(mes)) {
                auxDataCajaPorMes[mes] += valor;
                auxDataCajaPorMesCount[mes] += 1;
            } else {
                auxDataCajaPorMes[mes] = valor;
                auxDataCajaPorMesCount[mes] = 1;
            }
        }

        var caja = 0;
        $.each(auxDataCajaPorMes, function (index, value) {
            caja += value;
            dataSource.push({ mes: index, caja: caja });
            //console.log(index + ": " + auxDataCajaPorMesCount[index]);
        });

        $("#torta-deuda").dxChart({
            size: {
                width: 900
            },
            dataSource: dataSource,
            title: "Caja ($)",
            commonSeriesSettings: {
                argumentField: "mes"
            },
            series: [
                { valueField: "caja", name: "Caja", color: "red" }
            ],
            tooltip: {
                enabled: true,
                customizeText: function () {
                    var num = Number(this.valueText);
                    return this.argumentText + ": $" + num.toFixed(2);
                }
            }
        });
    },
    ArmarGraficaPagosMembresias: function (data) {

        var auxDataPorMes = {};
        var auxDataDescutnosPorMes = {};
        var pagosDataAux = [];

        //parse data PAGOS
        for (var i = 0; i < Estadisticas.DataPagos.length; i++) {

            var razon = (Estadisticas.DataPagos[i].razon);
            if (razon.indexOf('mensualidad') !== -1) {

                razon = razon.split(" ")[1];
                razon = razon.substring(1, razon.length - 1);
                var razonMes = razon.split("/")[0];
                var razonYear = razon.split("/")[1];
                var razonMesNum = Toolbox.NombreMesesEspIndex[razonMes.toLowerCase()];

                var aux = Estadisticas.DataPagos[i];
                aux.razon_simple = razon;
                aux.int_order = (Number(razonYear) * 1000) + Number(razonMesNum);
                pagosDataAux.push(aux);
            }
        }

        pagosDataAux = pagosDataAux.sort(function (a, b) {
            var x = a['int_order']; var y = b['int_order'];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });

        for (var i = 0; i < pagosDataAux.length; i++) {

            valor = Number(pagosDataAux[i].valor);
            var descuento = Number(pagosDataAux[i].descuento);

            if (pagosDataAux[i].razon_simple == "Octubre/2017" && descuento && descuento > 0) {
                console.log("Descuento: " + descuento);
            }

            if (auxDataPorMes.hasOwnProperty(pagosDataAux[i].razon_simple)) {
                auxDataPorMes[pagosDataAux[i].razon_simple] += valor;
                auxDataDescutnosPorMes[pagosDataAux[i].razon_simple] += descuento;

            } else {
                auxDataPorMes[pagosDataAux[i].razon_simple] = valor;
                auxDataDescutnosPorMes[pagosDataAux[i].razon_simple] = descuento;
            }
        }

        var dataSource = [];
        $.each(auxDataPorMes, function (index, value) {
            dataSource.push({ mes: index, ingresos: value, descuentos: auxDataDescutnosPorMes[index] });
        });

        $("#torta-membresias").dxChart({
            dataSource: dataSource,
            commonSeriesSettings: {
                argumentField: "mes",
                type: "stackedBar"
            },
            series: [
                { valueField: "ingresos", name: "Ingresos", color: "#a0ed67" },
                { valueField: "descuentos", name: "Descuentos", color: "#eda967" }
            ],
            title: "Ingresos por Membres&iacute;as",
            tooltip: {
                enabled: true,
                customizeText: function () {
                    var num = Number(this.valueText);
                    return this.argumentText + ": $" + num.toFixed(2);
                }
            },
            valueAxis: {
                title: {
                    text: "$"
                }
            }
        });
    }

}


$(document).ready(function () {

    Toolbox.UpdateActiveNavbar('nav_lista_estadisticas');
    Estadisticas.LoadListaGastos();
    Estadisticas.LoadPagos();
    Estadisticas.LoadHorasVoluntariado();

});