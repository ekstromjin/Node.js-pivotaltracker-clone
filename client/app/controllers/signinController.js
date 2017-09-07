angular
	.module('pivotalAppSign')
		.controller('signinController', ['$scope', '$rootScope', 'signService',
		function ($scope, $rootScope, signService){
			$scope.error = '';
			if (angular.isUndefined($rootScope.forgotEmail))
				$rootScope.forgotEmail = '';

			$scope.login = function (){
				if ($scope.loginForm.$valid == false) {
					return;
				}

				var user = {
					emailaddress: $scope.useremail,
					password: $scope.password
				}

				signService.authenticateUser(user, $scope);
			}

			$scope.afterLoginAction = function(data) {
				if (typeof data.message.error == 'undefined') {
					$('.login-error').fadeOut();
					window.location = '';
				}
				else {
					$scope.error = data.message.error;
					$('.login-error').fadeIn();
				}
			}
		}]);