

var Admins = {
    AdminsData: null,
    SelectedAdmin: null,
    ModalAdmin: null,
    ModalConfig: null,
    Config: [],

    LoadAdmins: function () {
        Toolbox.ShowLoader();

        $.ajax({
            dataType: 'json',
            type: "POST",
            url: "../proc/admin_controller.php",
            data: { func: "get_lista_admins" }
        }).done(function (data) {
            if (data && !data.error) {
                $('.tabla-admins').html('');
                Admins.AdminsData = {};
                for (var i = 0; i < data.length; i++) {
                    Admins.AdminsData[data[i].id] = data[i];
                    $('.tabla-admins').append('<tr><td>' + data[i].nombre + '</td>' +
                        '<td>' + data[i].email + '</td>' +
                        '<td><a href="#" onclick="Admins.OpenModalModificarAdmin(\'' + data[i].id + '\');return false;">modificar</a></td>' +
                        '<td><a href="#" onclick="Admins.DeleteAdmin(\'' + data[i].id + '\');return false;">borrar</a></td></tr>');
                }
            }
            Toolbox.StopLoader();
        });
    },
    OpenModalModificarAdmin: function (id) {
        Admins.SelectedAdmin = Admins.AdminsData[id];
        $('#adminsDatosModalLabel').html('Modificar Administrador');
        $('#admin_datos_nombre').val(Admins.SelectedAdmin.nombre);
        $('#admin_datos_email').val(Admins.SelectedAdmin.email);
        $('#admin_datos_clave').val('');
        $('#admin_datos_clave2').val('');
        $('#adminsDatosModalBtnSalvar').off('click');
        $('#adminsDatosModalBtnSalvar').on('click', Admins.ModificarAdmin);
        $('#adminsDatosModal').modal('show');
    },
    DeleteAdmin: function (id) {

        if (confirm("Esta seguro que desea borrar a " + Admins.AdminsData[id].nombre + "?")) {

            Toolbox.ShowLoader();

            $.ajax({
                dataType: 'json',
                type: "POST",
                url: "../proc/admin_controller.php",
                data: { func: "delete_admin", id: id }
            }).done(function (data) {
                if (data && !data.error) {
                    Admins.LoadAdmins();
                    Toolbox.ShowFeedback('feedbackContainer', 'success', "Administrador borrado con exito");
                } else {
                    if (data && data.error) {
                        Toolbox.ShowFeedback('feedbackContainer', 'error', data.error);
                    } else {
                        Toolbox.ShowFeedback('feedbackContainer', 'error', 'No se pudo borrar');
                    }
                }
                Toolbox.StopLoader();
            });
        }
    },
    OpenModalNuevoAdmin: function () {
        Admins.SelectedAdmin = null;
        $('#adminsDatosModalLabel').html('Crear administrador');
        $('#admin_datos_nombre').val('');
        $('#admin_datos_email').val('');
        $('#admin_datos_clave').val('');
        $('#admin_datos_clave2').val('');
        $('#adminsDatosModalBtnSalvar').off('click');
        $('#adminsDatosModalBtnSalvar').on('click', Admins.SalvarNuevoAdmin);

        $('.feedbackContainerModal').css('display', 'none');
        $('#socioIngresarHorasFecha').val('');
        Admins.ModalAdmin = new bootstrap.Modal(document.getElementById('adminsDatosModal'), {});
        Admins.ModalAdmin.show();
    },
    ModificarAdmin: function () {

        if (Admins.VerifyAdminData()) {

            Toolbox.ShowLoaderModal();

            $.ajax({
                dataType: 'json',
                type: "POST",
                url: "../proc/admin_controller.php",
                data: {
                    func: "update_admin", id: Admins.SelectedAdmin.id,
                    nombre: $('.admin_datos_nombre').val(),
                    email: $('.admin_datos_email').val(),
                    clave: $('.admin_datos_clave').val(),
                    permiso_pagos: 1
                }
            }).done(function (data) {
                if (data && !data.error) {
                    Admins.LoadAdmins();
                    Admins.ModalAdmin.hide();
                    Toolbox.ShowFeedback('feedbackContainer', 'success', "Administrador modificado con exito");
                } else {
                    if (data && data.error) {
                        Toolbox.ShowFeedback('adminsDatosModalFeedback', 'error', data.error);
                    } else {
                        Toolbox.ShowFeedback('adminsDatosModalFeedback', 'error', 'No se pudo modificar');
                    }
                }
                Toolbox.StopLoaderModal();
            });
        }
    },
    SalvarNuevoAdmin: function () {
        if (Admins.VerifyAdminData()) {
            Toolbox.ShowLoaderModal();

            $.ajax({
                dataType: 'json',
                type: "POST",
                url: "../proc/admin_controller.php",
                data: {
                    func: "ingresar_admin",
                    nombre: $('#admin_datos_nombre').val(),
                    email: $('#admin_datos_email').val(),
                    clave: $('#admin_datos_clave').val(),
                    permiso_pagos: 1
                }
            }).done(function (data) {
                if (data && !data.error) {
                    Admins.LoadAdmins();
                    Admins.ModalAdmin.hide();
                    Toolbox.ShowFeedback('feedbackContainer', 'success', "Administrador creado con exito");
                } else {
                    if (data && data.error) {
                        Toolbox.ShowFeedback('adminsDatosModalFeedback', 'error', data.error);
                    } else {
                        Toolbox.ShowFeedback('adminsDatosModalFeedback', 'error', 'No se pudo crear');
                    }
                }
                Toolbox.StopLoaderModal();
            });
        }
    },
    VerifyAdminData: function () {
        if ($('#admin_datos_nombre').val() == "") {
            Toolbox.ShowFeedback('adminsDatosModalFeedback', 'error', 'El nombre no puede estar vac&iacute;o');
            return false;
        }
        if ($('#admin_datos_email').val() == "") {
            Toolbox.ShowFeedback('adminsDatosModalFeedback', 'error', 'El email/usuario no puede estar vac&iacute;o');
            return false;
        }
        if ($('#admin_datos_clave').val() == "") {
            Toolbox.ShowFeedback('adminsDatosModalFeedback', 'error', 'La clave no puede estar vac&iacute;a');
            return false;
        }
        if ($('#admin_datos_clave').val() != $('#admin_datos_clave2').val()) {
            Toolbox.ShowFeedback('adminsDatosModalFeedback', 'error', 'Las claves no coinciden');
            return false;
        }
        return true;
    },
    OpenModalCerrarCaja: function () {
        if (Admins.SettingCajaCerrada) {
            $('.admin_cerrar_caja_fecha').html(Toolbox.MysqlDateToDate(DATO_cajacerrada));
        }
        $('#adminsCerrarCajaModal').modal('show');
    },
    SalvarCerrarCaja: function () {
        Toolbox.ShowLoader();

        $.ajax({
            dataType: 'json',
            type: "POST",
            url: "../proc/admin_controller.php",
            data: {
                func: "update_dato", codigo: "cajacerrada",
                valor: Toolbox.DataToMysqlDate($('.admin_cerrar_caja_fecha').val())
            }
        }).done(function (data) {
            if (data && data.ok) {
                location.reload();
            } else {
                if (data && data.error) {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', data.error);
                } else {
                    Toolbox.ShowFeedback('feedbackContainer', 'error', 'No se pudo cerrar la caja.');
                }
            }
            Toolbox.StopLoader();
        });
    },
    OpenModalSettings: function () {
        $('.feedbackContainerModal').css('display', 'none');
        Admins.ModalConfig = new bootstrap.Modal(document.getElementById('adminsSettingsModal'), {});
        Admins.ModalConfig.show();
    },
    LoadSettings: function () {
        Toolbox.ShowLoader();

        $.ajax({
            dataType: 'json',
            type: "POST",
            url: "../proc/admin_controller.php",
            data: {
                func: "get_settings"
            }
        }).done(function (data) {
            if (data && !data.error) {
                Admins.Config = data;
                $.each(data, function (key, value) {
                    var inputType = "text";
                    if (Toolbox.IsMysqlDate(value)) {
                        inputType = "date";
                    }

                    $('#settings').append('<div class="mb-3">'
                        + '<label for="setting' + i + '" class="form-label">' + key + '</label>'
                        + '<input type="' + inputType + '" class="form-control" id="setting_' + key + '" value="' + value + '">'
                        + '</div>');
                });

                for (var i = 0; i < data.length; i++) {

                }
            }
            Toolbox.StopLoader();
        });
    },
    SaveSettings: function () {
        $('.feedbackContainerModal').css('display', 'none');
        $('.feedbackContainer').css('display', 'none');
        Toolbox.ShowLoaderModal();

        var arraySettings = [];
        $.each(Admins.Config, function (key, value) {
            arraySettings.push({ codigo: key, valor: $('#setting_' + key).val() });
        });

        $.ajax({
            dataType: 'json',
            type: "POST",
            url: "../proc/admin_controller.php",
            data: {
                func: "salvar_configuracion",
                datos: arraySettings
            }
        }).done(function (data) {
            if (data && data.ok) {
                Admins.ModalConfig.hide();
                Toolbox.ShowFeedback('feedbackContainer', 'success', "Configuración guardada con éxito");
            } else {
                if (data && data.error) {
                    Toolbox.ShowFeedback('feedbackContainerModal', 'error', data.error);
                } else {
                    Toolbox.ShowFeedback('feedbackContainerModal', 'error', 'Error durante salvar_configuracion');
                }
            }
            Toolbox.StopLoader();
        });
    }
}

$(document).ready(function () {

    Toolbox.UpdateActiveNavbar('nav_lista_admins');
    Admins.LoadAdmins();
    Admins.LoadSettings();

    // if (DATO_cajacerrada && DATO_cajacerrada != "") {
    //     $('.texto-caja-cerrada').html("Caja cerrada al " + Toolbox.MysqlDateToDate(DATO_cajacerrada));
    // } else {
    //     $('.texto-caja-cerrada').html("La caja no fue cerrada. Puedes cerrar la caja a una fecha especifica para asegurarte de que no se hagan cambios previos a esa fecha.");
    // }
});