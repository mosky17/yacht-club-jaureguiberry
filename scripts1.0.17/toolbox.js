window.mobileCheck = function () {
    let check = false;
    (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};

var Toolbox = {
    NombreMesesEsp: { 1: "Enero", 2: "Febrero", 3: "Marzo", 4: "Abril", 5: "Mayo", 6: "Junio", 7: "Julio", 8: "Agosto", 9: "Setiembre", 10: "Octubre", 11: "Noviembre", 12: "Diciembre" },
    NombreMesesEspIndex: {
        "enero": 1, "febrero": 2, "marzo": 3, "abril": 4, "mayo": 5, "junio": 6, "julio": 7,
        "agosto": 8, "setiembre": 9, "octubre": 10, "noviembre": 11, "diciembre": 12
    },
    LoaderQueue: 0,
    LoaderQueueModal: 0,
    GetUrlVars: function () {
        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for (var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
    },
    UpdateActiveNavbar: function (active) {
        $('#headerNavigation').css('display', 'block');
        $('.nav-link').removeClass('active');
        $('#' + active).addClass('active');
    },
    ShowLoader: function () {
        Toolbox.LoaderQueue += 1;
        $('#nav_loader').css('display', 'block');
    },
    StopLoader: function () {
        Toolbox.LoaderQueue -= 1;
        if (Toolbox.LoaderQueue == 0) {
            $('#nav_loader').css('display', 'none');
        }

    },
    ShowLoaderModal: function () {
        Toolbox.LoaderQueueModal += 1;
        $('.loaderModal').css('display', 'block');
    },
    StopLoaderModal: function () {
        Toolbox.LoaderQueueModal -= 1;
        if (Toolbox.LoaderQueueModal == 0) {
            $('.loaderModal').css('display', 'none');
        }

    },
    DataToMysqlDate: function (date) {
        var parts = date.split('/');
        return parts[2] + "-" + parts[1] + "-" + parts[0];
    },
    MysqlDateToDate: function (date) {
        if (date == null) {
            return "";
        }
        var parts = date.split('-');
        return parts[2] + "/" + parts[1] + "/" + parts[0];
    },
    MysqlDateTimeToDateTime: function (date) {
        var parts = date.split(' ');
        var resultDate = parts[0].split('-');
        return resultDate[2] + "/" + resultDate[1] + "/" + resultDate[0] + " " + parts[1];
    },
    ShowFeedback: function (container, type, message, autoTop = true, clearAllBefore = true) {

        if (clearAllBefore) {
            $('.feedbackContainer').css('display', 'none');
        }
        if (!message || message == "") {
            $('#' + container).css('display', 'none');
        } else {

            var typeClass = "";
            var prefix = "";

            if (type == 'error') {

                typeClass = " alert-danger";

            } else if (type == 'success') {

                typeClass = " alert-success";

            } else if (type == 'warning') {
                typeClass = " alert-warning";
            }

            var html = '<div class="alert alert-block' + typeClass + '" role="alert">'
                + message + '</div>';

            $('#' + container).html(html);
            $('#' + container).css('display', 'block');
            if (autoTop) {
                $(window).scrollTop(0);
                $('.modal').scrollTop(0);
            }
        }
    },
    GoToLogin: function () {
        window.location.href = GLOBAL_domain + "/login.php";
    },
    AdminLogout: function () {
        Toolbox.ShowLoader();

        $.ajax({
            dataType: 'json',
            type: "POST",
            url: "../proc/admin_controller.php",
            data: { func: "logout" }
        }).done(function (data) {
            if (data && !data.error) {
                window.location.href = GLOBAL_domain + "/admin/admin_login.php";
            } else {
                if (data && data.error) {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', data.error);
                } else {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', 'Error inesperado durante logout');
                }
            }
            Toolbox.StopLoader();
        });
    },
    TransformSpecialTag: function (text) {

        if (text == null) {
            return "";
        }
        var text2 = "";
        if (text.indexOf("mensualidad") == 0) {
            text2 = text.substring(13, text.length - 1);
            text = "mensualidad";
        }

        switch (text) {

            //suscripciones
            case "Membresía Anual":
                return '<span class="badge bg-primary">Membresía Anual</span>';
            case "Membresía Vitalicia":
                return '<span class="badge bg-success">Membresía Vitalicia</span>';
            case "Membresía Familiar":
                return '<span class="badge bd-pink-500">Membresía Familiar</span>';
            case "Membresía Familiar +1":
                return '<span class="badge bd-pink-600">Membresía Familiar +1</span>';
            case "Membresía Familiar +2":
                return '<span class="badge bd-pink-700">Membresía Familiar +2</span>';
            case "Membresía Familiar +3":
                return '<span class="badge bd-pink-800">Membresía Familiar +3</span>';
            case "Membresía Familiar +4":
                return '<span class="badge bd-pink-900">Membresía Familiar +4</span>';
            case "Miembro grupo familiar":
                return '<span class="badge bd-pink-200">Miembro grupo familiar</span>';

            //descuentos
            case "Balance":
                return '<span class="badge bg-success" style="">Balance</span>';
                break;

            //rubros pagos
            case "Energia":
                return '<span class="badge bg-warning" style="">Energ&iacute;a</span>';
                break;
            case "Equipamiento":
                return '<span class="badge bg-danger" style="background-color:#bf0000;">Equipamiento</span>';
                break;
            case "Instalaciones":
                return '<span class="badge bg-danger" style="background-color:#d91e88;">Instalaciones</span>';
                break;
            case "Administracion":
                return '<span class="badge" style="background-color:#e35000;">Administraci&oacute;n</span>';
                break;
            case "Administraci&oacute;n":
                return '<span class="badge" style="background-color:#e35000;">Administraci&oacute;n</span>';
                break;
            case "Cantina":
                return '<span class="badge bg-info">Cantina</span>';
                break;
            case "Locacion":
                return '<span class="badge bg-primary" style="background-color:#004098;">Locaci&oacute;n</span>';
                break;
            case "Edilicio":
                return '<span class="badge bg-primary" style="background-color:#004098;">Edilicio</span>';
                break;
            case "Transporte":
                return '<span class="badge bg-info" style="">Transporte</span>';
                break;
            case "Otro":
                return '<span class="badge bg-default">Otro</span>';
                break;
            case "Devoluciones":
                return '<span class="badge bg-default">Devoluciones</span>';
                break;
            case "Limpieza":
                return '<span class="badge" style="background-color:#75f7ff;">Limpieza</span>';
                break;
            case "Seguridad":
                return '<span class="badge" style="background-color:#ff75dd;">Seguridad</span>';
                break;
            case "Viaticos":
                return '<span class="badge" style="background-color:#75f7ff;">Vi&aacute;ticos</span>';
            case "Insumos":
                return '<span class="badge" style="background-color:red;">Insumos</span>';
            case "Membresia Socio":
                return '<span class="badge bg-primary">Membresia Socio</span>';

            //ELSE
            default:
                return text;
                break;
        }
    },
    GetFechaHoyLocal: function () {
        var date = new Date();
        var days = date.getDate() > 9 ? date.getDate() : '0' + date.getDate();
        var month = date.getMonth() + 1;
        month = month > 9 ? month : '0' + month;
        return days + '/' + month + '/' + date.getFullYear();
    },
    IsMysqlDate: function (text) {
        var parts = text.split("-");
        return parts.length == 3
            && parts[0].length == 4
            && parts[1].length == 2
            && parts[2].length == 2;
    },
    MyNumberLocale: null,
    FormatNumber: function (number) {
        if (Toolbox.MyNumberLocale == null) {
            Toolbox.MyNumberLocale = new Intl.NumberFormat();
        }
        var prefix = '<span style="">$ </span>';
        var number = parseFloat(number).toFixed(2);
        return prefix + Toolbox.MyNumberLocale.format(number);
    },
    LoadPagoYearSelect: function (select_id) {
        var today = new Date();
        for (var i = today.getFullYear() + 5; i >= 2018; i--) {
            $('#' + select_id).append('<option value="' + i + '">' + i + '</option>');
        }
    },
    JsDateFromMysqlDate: function (date) {
        if (date == null) {
            return null;
        }
        var dateParts = date.split("-");
        return new Date(dateParts[0], dateParts[1] - 1, dateParts[2].substr(0, 2));
    },
    GetPrecioObligacionSuscripcion: function (suscripcion, obligacion) {
        if (suscripcion.ciclo == 'anual') {
            for (var i = 0; i < suscripcion.precios.length; i++) {
                var fecha_desde = Toolbox.JsDateFromMysqlDate(suscripcion.precios[i].fecha_desde);
                var fecha_hasta = Toolbox.JsDateFromMysqlDate(suscripcion.precios[i].fecha_hasta);
                if (fecha_desde.getFullYear() <= obligacion && (fecha_hasta == null || fecha_hasta.getFullYear() >= obligacion)) {
                    return suscripcion.precios[i].precio;
                }
            }
        }

        return null;
    },
    FormatRazonPago: function (pago) {
        if (pago.id_suscripcion_socio != null) {
            return 'Suscripción socio: ' + pago.razon;
        } else if (pago.id_socio != null) {
            return 'Pago socio: ' + pago.razon;
        } else {
            return pago.razon;
        }
    }
}
