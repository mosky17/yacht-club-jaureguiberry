var AdminLogin = {
	Validated: false,
	Login: function () {
		$.ajax({
			dataType: 'json',
			type: "POST",
			url: "../proc/admin_controller.php",
			data: {
				func: "login",
				email: $('#loginEmail').val(),
				passwd: $('#loginPassword').val()
			}
		}).done(function (data) {
			if (data && !data.error) {
				AdminLogin.Validated = true;
				$('#loginForm').submit();
			} else {
				if (data && data.error) {
					Toolbox.ShowFeedback('feedbackContainer', 'error', data.error);
				} else {
					Toolbox.ShowFeedback('feedbackContainer', 'error', 'Error inesperado durante login');
				}
			}
		});
	}
}

$(document).ready(function () {
	$("#loginEmail").focus();

	$(document).keypress(function (e) {
		if (e.which == 13) {
			AdminLogin.Login();
		}
	});
});
