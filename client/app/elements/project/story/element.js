angular
	.module('pivotalApp.directives')
		.directive('elementStory', ['$rootScope', '$timeout', '$cookies', '$routeParams',
			function ($rootScope, $timeout, $cookies, $routeParams){
				return {
					restrict: 'E',
					scope: true,
					transclude: true,
					templateUrl: 'app/elements/project/story/template.html',
					controller: 'storyController',
					link: function (scope, element, attrs, controller){
						var story_id = 'story_' + scope.story._id;
						scope.isExpand = false;

						if (angular.isDefined($routeParams.story_id) && $routeParams.story_id == scope.story._id) {
							if (angular.isUndefined(scope.expandedStories[story_id])) {
								scope.expandedStories[story_id] = 1;
								$cookies.putObject('expanded_stories', scope.expandedStories);
							}
						}

						scope.openAndCloseStory = function (storyid) {
							var story = element.find('#story_'+storyid);
							var icon = story.find('.item-header-top>.item-collapse>i');

							if (!story.hasClass('expand')) {
								icon.removeClass('fa-plus');
								icon.addClass('fa-minus');
								story.find('.item-body').slideDown();
								story.addClass('expand');

								if (angular.isUndefined(scope.expandedStories[story_id])) {
									scope.expandedStories[story_id] = 1;
									$cookies.putObject('expanded_stories', scope.expandedStories);
								}
							}
							else {
								icon.removeClass('fa-minus');
								icon.addClass('fa-plus');
								story.find('.item-body').slideUp();

								$timeout(function() { story.removeClass('expand'); }, 300)

								if (angular.isDefined(scope.expandedStories[story_id])) {
									delete scope.expandedStories[story_id];
									$cookies.putObject('expanded_stories', scope.expandedStories);
								}
							}
						}

						scope.isExpand = function() {
							return angular.isDefined(scope.expandedStories[story_id]);
						}

						scope.isExpand = scope.isExpand();
					}
				}
			}])
		.controller('storyController', ['$scope', '$rootScope', '$location', '$timeout', 'SocketIO',
			function ($scope, $rootScope, $location, $timeout, SocketIO){
				var base_url = $location.absUrl().replace($location.path(), '');
				$scope.clipboardUrl = base_url + '/project/' + $rootScope.project._id + '/story/' + $scope.story._id;

				$scope.init = function() {
					$scope.permission = false;
					if ($rootScope.filteredUsers[$rootScope.project.leader] && $rootScope.loginUser && $scope.story.status != 4)
						$scope.permission = $rootScope.loginUser.role == consts.admin.role || $rootScope.loginUser._id == $rootScope.filteredUsers[$rootScope.project.leader]._id;
					
					$scope.story.points = String($scope.story.points);
					$scope.story.type = String($scope.story.type);

					$scope.story_title = {
						accept: false,
						text: $scope.story.title,
						required: false,
					}

					$scope.story_description = {
						accept: false,
						text: $scope.story.description,
						required: false,
					}

					var story_members = [];
					var members = angular.copy($rootScope.project.tms);
					angular.forEach(members, function (member, index){
						$rootScope.makeSimpleName(member);
						story_members.push({id: member._id, text: member.simple_name});
					});

					$timeout(function() {
						$rootScope.handleMultiSelect2($('#story_' + $scope.story._id).find('.story_members'), story_members, 'Select the Owners');	
					}, 50);
				}

				$scope.copyToClipboard = function (storyid) {
					var clipboard;
					var story = $('#'+storyid);
					clipboard = new Clipboard("[data-clipboard-text]", story.selector);

					clipboard.on("success", function (e) {
						
					});

					clipboard.on("error", function (e) {
						
					});
				}

				$scope.saveStoryTitle = function() {
					if ($scope.story_title.text == '') {
						$scope.story_title.required = true;
						return;
					}

					$scope.story_title.required = false;
					$scope.story.title = $scope.story_title.text;
					var changed_data = {
						_id:	$scope.story._id,
						field:  'title',
						value:	$scope.story.title,
					};
					$scope.story_title.accept = false;

					SocketIO.emit(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.UPDATE_STORY, changed_data);
				}

				$scope.cancelStoryTitle = function() {
					$scope.story_title.text = $scope.story.title;
					$scope.story_title.accept = false;
					$scope.story_title.required = false;
				}

				$scope.saveStoryDescription = function() {
					if ($scope.story_description.text == '') {
						$scope.story_description.required = true;
						return;
					}

					$scope.story_description.required = false;
					$scope.story.description = $scope.story_description.text;
					var changed_data = {
						_id:			$scope.story._id,
						field:			'description',
						value:			$scope.story.description,
					};
					$scope.story_description.accept = false;

					SocketIO.emit(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.UPDATE_STORY, changed_data);
				}

				$scope.cancelStoryDescription = function() {
					$scope.story_description.text = $scope.story.description;
					$scope.story_description.accept = false;
					$scope.story_description.required = false;
				}

				$scope.changeStory = function(field, value) {
					if (field == 'members') {
						value = value == '' ? [] : value.split(',');
					}

					var changed_data = {
						_id:		$scope.story._id,
						field:		field,
						value:		value,
						project_id: $rootScope.project._id,
					};

					SocketIO.emit(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.UPDATE_STORY, changed_data);
				}

				$scope.changeStatus = function(status) {
					$scope.story.status = status;
					var changed_data = {
						_id:		$scope.story._id,
						project_id: $rootScope.project._id,
						field:		'status',
						value:		$scope.story.status,
					};

					SocketIO.emit(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.UPDATE_STORY, changed_data);
				}
				
				$scope.deleteStory = function() {
					if (confirm('Are you sure?')) {
						SocketIO.emit(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.REMOVE_STORY, {_id: $scope.story._id});
					}
				}

				$scope.isMyStory = function() {
					return $scope.story.members.indexOf($rootScope.loginUser._id) != -1
				}

				$scope.init();

				$rootScope.$watchCollection('project.tms', function (data, olddata){
					if (data != olddata) {
						
						var story_members = [];
						var members = angular.copy($rootScope.project.tms);
						angular.forEach(members, function (member, index){
							$rootScope.makeSimpleName(member);
							story_members.push({id: member._id, text: member.simple_name});
						});
						$rootScope.handleMultiSelect2($('#story_' + $scope.story._id).find('.story_members'), story_members, 'Select the Owners');
					}
				});
			}]);