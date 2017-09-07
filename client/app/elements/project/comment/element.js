'use strict';

angular.module('pivotalApp.directives')
.directive('createActivityForm', ['$rootScope', '$http', 'SocketIO', function($rootScope, $http, SocketIO) {
	return {
		restrict: 'E',
		scope: true,
		transclude: true,
		link: function(scope, element, attr) {
			scope.comment_route = '/uploads/story/' + scope.story._id + '/comment/';
			
			scope.uploadCommentFiles = function (files) {
				scope.files = [];
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
						scope.files.push({'filename': data.message.name, 'original_name' : data.message.originalname});
					});
				});
			}

			scope.filterAllMembers = function () {
				scope.allMembers = [];
				angular.forEach($rootScope.allUsers, function (user, index) {
					scope.allMembers[user._id] = user.firstname + " " + user.lastname;
				});
			}

			$rootScope.$watch('allUsers', function (data) {
				if (data) {
					scope.filterAllMembers();
				}
			});

			scope.createActivity = function () {
				if (typeof scope.comment != 'undefined' || typeof scope.files != 'undefined') {
					if (scope.comment != '' || scope.files.length() != 0) {	
						var data = {
							user_id: $rootScope.loginUser._id,
							story_id: scope.story._id,
							comment: scope.comment,
							uploadfiles: scope.files,
							tms: $rootScope.project.members
						}
						SocketIO.emit(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.CREATE_COMMENT, data);
						scope.comment = '';
						$('input[name=comment_files]').val('');						
					}
				}
			}
		},
		templateUrl: 'app/elements/project/comment/template.html'
	}
}]);