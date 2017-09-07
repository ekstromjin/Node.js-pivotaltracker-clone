angular
	.module('pivotalApp.directives')
		.directive('elementTask', ['$rootScope',
			function ($rootScope){
				return {
					restrict: 'E',
					scope: true,
					transclude: true,
					templateUrl: 'app/elements/project/task/template.html',
					controller: 'taskController',
					link: function (scope, element, attrs) {
						scope.disabled = false;
						scope.initTaskStatus = function () {
							if (scope.story.members.indexOf($rootScope.loginUser._id) == -1) {
								scope.disabled = true;
							}
						}
						scope.initTaskStatus()
					}
				}
			}])
		.controller('taskController', ['$rootScope', '$scope', 'SocketIO',
			function ($rootScope, $scope, SocketIO){

				$scope.createTask = function (title, storyid, userid) {
					if (typeof $scope.task_title == 'undefined' || $scope.task_title == '')
						return;

					var task = {
						title: $scope.task_title,
						status: 0,
						story_id: storyid,
						user_id: userid
					};
					$scope.task_title = '';
					SocketIO.emit(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.CREATE_TASK, task);
				}

				$scope.doneTask = function (task) {
					SocketIO.emit(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.DONE_TASK, task);
				}

				$scope.deleteTask = function (taskid) {
					if (confirm("Are you sure")) {
						SocketIO.emit(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.REMOVE_TASK, {_id: taskid, story_id: $scope.story._id});
					}
				}

			}]);