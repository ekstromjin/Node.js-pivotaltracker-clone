angular
	.module('pivotalApp.directives')
		.directive('elementStoryCreate', ['$rootScope',
			function ($rootScope) {
				return {
					restrict: 'E',
					scope: true,
					templateUrl: 'app/elements/project/createstory/template.html',
					controller: 'storyCreateController',
					link: function (scope, element, attrs) {

					}
				}
			}])
		.controller('storyCreateController', ['$rootScope', '$scope', 'SocketIO', '$http',
			function ($rootScope, $scope, SocketIO, $http){
				$scope.createError = false;
				$scope.fileNames = [];
				$scope.originalfileNames = [];

				$scope.init = function () {
					$scope.type = '0';
					$scope.points = '0';

					$rootScope.$watch('project', function (data) {
						if (data) {
							var temp = [];
							var members = angular.copy($rootScope.project.tms);
							angular.forEach(members, function (member, index){
								$rootScope.makeSimpleName(member);
								temp.push({id: member._id, text: member.simple_name});
							});
							$rootScope.handleMultiSelect2($('#story_members'), temp, 'Select the Owners.');
						}
					});
				}

				$scope.createStory = function () {
					if ($rootScope.loginUser && $rootScope.project && ($rootScope.loginUser.role == consts.admin.role || $rootScope.loginUser._id == $rootScope.project.leader)) {
						$scope.createError = false;
						$scope.storyForm.$submitted = true;
						if ($scope.storyForm.$valid == false) {
							return;
						}
						else {
							var members = [];
							if ($scope.story_members) {
								members = $scope.story_members.split(',');
							}
							var story = {
								title: $scope.title,
								type: $scope.type,
								project_id: $scope.project_id,
								points: $scope.points,
								members: members,
								tempFiles: $scope.fileNames,
								files: $scope.originalfileNames,
								description: $scope.description,
								status: 0,
								requester: $scope.loginUser._id,
							}

							SocketIO.emit('pivotal_app:createStory', story);
						}
					}
					else {
						$scope.createError = true;
						$('#addstory').modal('hide');
						return;
					}
				}

				$scope.uploadStoryFiles = function (files) {
					$scope.originalfileNames = [];
					$scope.fileNames = [];
					angular.forEach(files, function (file, index){
						var formData = new FormData();
						formData.append('file', file);

						$http.post('/v1/story/getStoryFiles', formData,
						{
							withCredentials: true,
							headers: {'Content-Type': undefined },
							transformRequest: angular.identity
						})
						.success(function (data, status) {
							$scope.originalfileNames.push(data.message.originalname);
							$scope.fileNames.push(data.message.name);
						});
					});
				}

				$scope.initStoryForm = function () {
					$scope.title = "";
					$scope.description = '';
					$scope.story_members = '';
					$scope.points = '0';
					$scope.type = '0';
					$('#addstory textarea').val("");
					$('#addstory input[name=title]').val("");
					$('#addstory select[name=type]').val("0");
					$('#addstory select[name=points]').val("0");
					$('input[name=story_files]').val('');
					$('#story_members').val('');
					var temp = [];
					var members = angular.copy($rootScope.project.tms);
					$('#s2id_story_members').remove();
					angular.forEach(members, function (member, index){
						$rootScope.makeSimpleName(member);
						temp.push({id: member._id, text: member.simple_name});
					});
					$rootScope.handleMultiSelect2($('#story_members'), temp, 'Select the Owners.');
					$scope.storyForm.$submitted = false;
					$scope.storyForm.title.$touched = false;
					$scope.storyForm.description.$touched = false;
					console.log($scope.title);
				}

				SocketIO.watch(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.CREATE_STORY_ERROR, function (data) {
					$scope.createError = true;
					$('#addstory').modal('hide');
				});

				$(document).ready( function () {
					$('a[data-target=#addstory]').on('click', function() {
						$scope.initStoryForm()
					});
				});

				$scope.init();
			}]);