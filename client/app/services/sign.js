angular
	.module('pivotalAppSign')
		.service('signService', ['$http', '$rootScope', '$location', function ($http, $rootScope, $location){

			this.authenticateUser = function (user, scope) {
				$http.post('/v1/user/login', user)
					.success(function (data, status) {
						scope.afterLoginAction(data);
				});
			}

			this.registerNewUser = function (user, scope) {
				$http.post('/v1/user/signup', user)
					.success(function (data, status){
						if (typeof data.message.error != 'undefined') {
							scope.error = data.message.error;
							$('.register-error').fadeIn();
						}
						else {
							$('.register-error').fadeOut();
							scope.firstname = '';
							scope.lastname = '';
							scope.birthday = '';
							scope.password = '';
							scope.repassword = '';
							scope.emailaddress = '';
							scope.profile_image = '';
							$('#profile_image').val('');
							$location.url('/');
						}
				});
			}

			this.forgotPassword = function(useremail) {
				$http.post('/v1/user/forgot_password', {useremail: useremail})
				.then(function (response) {
					$location.url('/');
				});
			}

			this.resetPassword = function(password) {
				$http.post('/v1/user/reset_password', {password: password})
				.then(function (response) {
					$location.url('/');
				});
			}
		}]);