angular
	.module('pivotalApp.services')
		.service('userService', ['$http', '$rootScope',
			function ($http, $rootScope){

				this.changePassword = function (scope, password_info) {
					$http.post(consts.api.version + "/user/change_password", password_info)
					.then(function(response) {
						if (response.data.message == 'incorrect') {
							scope.incorrect = true;
						}
						else {
							scope.afterChange();
						}
					});
				}

				this.updateProfile = function (user, scope) {
					$http.post('/v1/user/update', user)
						.success(function (data, status){
							if (typeof data.message.error != 'undefined') {
								scope.error = data.message.error;
								$('.update-profile-error').fadeIn();
							}
							else {
								$rootScope.loginUser = data.message.success;
								angular.forEach($rootScope.project.tms, function (member, index){
									if (member._id == $rootScope.loginUser._id) {
										$rootScope.project.tms.splice(index, 1);
										$rootScope.project.tms.push($rootScope.loginUser);
									}
								});
								$rootScope.makeSimpleName($rootScope.loginUser);
								$('#update_profile_modal').modal('hide');
							}
					});
				}
			}]);