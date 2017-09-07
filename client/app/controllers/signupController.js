angular
	.module('pivotalAppSign')
		.controller('signupController', ['$scope', '$http', '$rootScope', 'signService', '$timeout', 
		function ($scope, $http, $rootScope, signService, $timeout){

			$scope.error = '';

			$scope.registerUser = function () {

				$scope.profile_image = $('#profile_image').val();
				
				if ($scope.signupForm.$valid == false) {
					return;
				}
				
				if ($scope.password != $scope.repassword) {
					return;
				}

				$scope.gender = $('input[name=gender]:checked').val();

				var user = {
					firstname: $scope.firstname,
					lastname: $scope.lastname,
					birthday: $scope.birthday,
					password: $scope.password,
					gender: $scope.gender,
					emailaddress: $scope.emailaddress,
					avatar: $scope.profile_image,
					role: 0
				};

				signService.registerNewUser(user, $scope);

			}

			$scope.removeProfileImage = function (){
				$('#profile_image').val('');
			}

			// jquery functions
			$(document).ready(function (){
				var handleDatePicker = function (){
					var nowDate = new Date();
					var startYear = nowDate.getFullYear() - 20;
					$('.date-picker').attr('data-date', startYear + '-01-01');
					$('.date-picker').datepicker({
						autoclose: true,
						format: 'yyyy-mm-dd',
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
		}]);