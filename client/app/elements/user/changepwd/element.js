'use strict';

angular.module('pivotalApp.directives')
.directive('changePasswordForm', ['$rootScope', 'userService', function($rootScope, userService) {
	return {
		restrict: 'E',
		link: function(scope, element) {
			scope.incorrect = false;
			scope.changeIncorrect = function() {
				scope.incorrect = false;
			}

			scope.changePassword = function() {
				if (scope.changePasswordForm.$valid) {
					var password_info = {
						current_password: scope.current_password,
						new_password: scope.new_password,
					}

					userService.changePassword(scope, password_info);
				}
			}

			scope.afterChange = function() {
				element.find('input').val('');
				element.find('.btn-cancel').trigger('click');
			}
		},
		templateUrl: 'app/elements/user/changepwd/template.html'
	}
}]);