'use strict';

angular.module('pivotalAppSign')
.controller('forgotPasswordController', ['$rootScope', '$scope', 'signService',
function($rootScope, $scope, signService) {
	$rootScope.forgotEmail = '';

	$scope.submitEmail = function() {
		if ($scope.forgotPasswordForm.$valid) {
			$rootScope.forgotEmail = $scope.useremail;
			signService.forgotPassword($scope.useremail);
		}
	}
}]);