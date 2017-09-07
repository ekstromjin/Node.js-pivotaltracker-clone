'use strict';

angular.module('pivotalApp.directives')
.directive('updateProfileForm', ['$rootScope', 'userService', function($rootScope, userService) {
	return {
		restrict: 'E',
		link: function(scope, element) {

			scope.error = '';

			$rootScope.$watch('loginUser', function(){
				if ($rootScope.loginUser) {
					scope.user_id = $rootScope.loginUser._id;
					scope.firstname = $rootScope.loginUser.firstname;
					scope.lastname = $rootScope.loginUser.lastname;
					scope.gender = $rootScope.loginUser.gender;
					scope.birthday = $rootScope.loginUser.birthday.split("T")[0];
					scope.profile_image = $rootScope.loginUser.avatar;
				}
			});

			scope.updateUser = function () {

				scope.profile_image = $('#profile_image').val();
				
				if (scope.updateProfileForm.$valid == false) {
					return;
				}

				scope.gender = $('input[name=gender]:checked').val();

				var user = {
					id: $("#user_id").val(),
					firstname: scope.firstname,
					lastname: scope.lastname,
					birthday: scope.birthday,
					gender: scope.gender,
					avatar: scope.profile_image,
				};

				userService.updateProfile(user, scope);

			}
			scope.removeProfileImage = function (){
				$('#profile_image').val('');
			}
			// jquery functions
			$(document).ready(function (){
				var handleDatePicker = function (){
					$('.date-picker').datepicker({
						autoclose: true,
						dateFormat: 'yy-mm-dd',
					});
				};

				handleDatePicker();

				$('#avatar').change(function (){
					var profile_image = '';

					var xhr = new XMLHttpRequest();
					var url = '/v1/user/upload_profile';
					var method = 'post';
					xhr.open(method, url, true);

					var formdata = new FormData();
					var file = $(this).find('input').context.files[0];

					if (file) {
						formdata.append('files', file, file.name);

						xhr.send(formdata);
						var element = $(this);

						xhr.onreadystatechange = function (){
							if (xhr.readyState == 4 && xhr.status == 200) {
								profile_image = JSON.parse(xhr.responseText).message;

								$('#profile_image').val(profile_image);
							}
						}
					}
				});
			});
		},
		templateUrl: 'app/elements/user/profile/template.html'
	}
}]);