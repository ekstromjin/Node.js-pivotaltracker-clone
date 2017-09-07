angular
.module('pivotalAppSign')
.controller('resetPasswordController', ['$scope', '$rootScope', 'signService', 
function ($scope, $rootScope, signService){
	$scope.submitPassword = function() {
		if ($scope.resetPasswordForm.$valid) {
			signService.resetPassword($scope.password);
		}
	}	
}]);