angular
	.module('pivotalApp.controllers')
		.controller('projectDetailController', ['$scope', '$rootScope', '$cookies', '$http', '$routeParams', 'SocketIO', '$timeout',
			function ($scope, $rootScope, $cookies, $http, $routeParams, SocketIO, $timeout){

				$rootScope.index_page = false;
				$rootScope.detail_page = true;
				$scope.project_id = $routeParams.id;
				$scope.data_queue = {};
				$scope.loadingFlag = true;

				$scope.init = function () {
					$('.project_nav_expanded .nav-tabs > li').each(function(index) {
						if (index == 0)
							$(this).addClass('active');
						else
							$(this).removeClass('active');
					});

					// $http.post('/v1/api/project/getProject', {
					// 	project_id: $scope.project_id
					// }).success(function (data, status) {
					// 	if (typeof data.message.error == 'undefined') {
					// 		$rootScope.project = data.message;
					// 		$rootScope.filterStoiresByCategory($rootScope.project);
					// 	}
					// });

					SocketIO.emit(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.GET_PROJECT, {project_id: $scope.project_id});

					if (typeof $cookies.getObject('panel_orders') == 'undefined') {
						$cookies.putObject('panel_orders', ['current', 'mywork', 'backlog', 'test', 'done']);
					}
					if (typeof $cookies.getObject('panel_visible') == 'undefined') {
						var temp = {};
						temp['current'] = 1;
						temp['mywork'] = 1;
						temp['backlog'] = 1;
						temp['test'] = 1;
						temp['done'] = 1;

						$cookies.putObject('panel_visible', temp);
					}

					$('section.panels').sortable({
						connectWith: ".panel-element",
						items: ".panel-element",
						opacity: 0.8,
						coneHelperSize: true,
						placeholder: 'sortable-box-placeholder panel visible',
						forcePlaceholderSize: true,
						tolerance: "pointer",
						stop: function () {
							$scope.temp = [];
							$('section.panels').find('.panel').each(function () {
								$scope.temp.push($(this).data('order'));
							});

							$cookies.putObject('panel_orders', $scope.temp);
						}
					});

					$scope.getPanelOrders();
					$scope.getShowPanels();
				}

				SocketIO.watch(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.GET_PROJECT, function (data) {
					$scope.data_queue = data;
				});

				$scope.$watch('data_queue',function(data, olddata) {
					if(data != olddata) {
						$rootScope.project = data;
						$rootScope.filterStoiresByCategory($rootScope.project);

						$timeout(function (){
							$scope.loadingFlag = false;
						}, 100);
					}
				});

				$rootScope.filterStoiresByCategory = function (project) {

					project.currentStories = [];
					project.myworkStories = [];
					project.backlogStories = [];
					project.testStories = [];
					project.doneStories = [];

					if (project.stories) {
						angular.forEach(project.stories, function (story, index){
							story.requester_name = $scope.getRequesterName(story.requester, story);

							if (story.status == 4) {
								project.doneStories.push(story);
							}
							else if (story.status == 3) {
								project.backlogStories.push(story);
							}
							else if (story.status == 2) {
								project.testStories.push(story);
							}
							else if (story.status == 1 || story.status == 0) {
								if ($rootScope.loginUser.role == consts.admin.role) {
									project.currentStories.push(story);
								}
								else if ($rootScope.loginUser.role == 0) {
									if (story.members.indexOf($rootScope.loginUser._id) == -1) {
										project.currentStories.push(story);
									}
									else {
										project.myworkStories.push(story);
									}
								}
							}
						});
					}

					$timeout(function (){
						$rootScope.initSidebar();
					},50);
				}

				$scope.getPanelOrders = function () {
					$scope.panel_orders = $cookies.getObject('panel_orders');
				}

				$scope.getShowPanels = function () {
					$scope.panel_visible = $cookies.getObject('panel_visible');
				}

				$scope.getRequesterName = function(user_id, story) {
					if (!user_id) { return ''; }
					if (!$rootScope.filteredUsers[story.requester]) { return ''; }
					return $rootScope.getFullName($rootScope.filteredUsers[story.requester]);
				}

				$scope.init();
			}]);