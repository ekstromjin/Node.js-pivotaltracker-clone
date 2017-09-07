angular
	.module('pivotalApp.directives')
		.directive('elementPanel', ['$rootScope',
			function ($rootScope){
				return {
					restrict: 'E',
					scope: true,
					transclude: true,
					templateUrl: 'app/elements/project/panel/template.html',
					controller: 'panelController',
					link: function (scope, element, attrs, controller){
						scope.panelName = attrs.panelName;
					}
				}
			}])
		.controller('panelController', ['$scope', '$rootScope', '$timeout', '$cookies',
			function ($scope, $rootScope, $timeout, $cookies){

				$scope.closePanel = function (panelName) {
					var panel = $('#'+panelName+'_panel');
					panel.removeClass('visible');
					var sidebarItem = $('.item.'+panelName+'.visible');
					sidebarItem.removeClass('visible');

					var temp = {};
					$('section.panels').find('.panel.visible').each(function () {
						temp[$(this).data('order')] = 1;
					});

					$cookies.putObject('panel_visible', temp);
				}

				$scope.openStoiresOnPanel = function (panelName) {
					var panel = $('#'+panelName+'_panel');
					panel.find('.items_container').find('.item').each(function (){
						var story = $(this);
						var body = story.find('.item-body');
						var icon = story.find('.item-header-top>.item-collapse>i');
						if (icon.hasClass('fa-plus')) {
							icon.removeClass('fa-plus');
							icon.addClass('fa-minus');
							body.slideDown();
							story.addClass('expand');
						}

						var story_id = story.attr('id');

						if (angular.isUndefined($scope.expandedStories[story_id])) {

							$scope.expandedStories[story_id] = 1;
							$cookies.putObject('expanded_stories', $scope.expandedStories);
						}
					});
				}

				$scope.closeStoiresOnPanel = function (panelName) {
					var panel = $('#'+panelName+'_panel');
					panel.find('.item').each(function (){
						var story = $(this);
						var icon = story.find('.item-header-top>.item-collapse>i');
						var body = story.find('.item-body').slideUp();
						if (icon.hasClass('fa-minus')) {
							icon.removeClass('fa-minus');
							icon.addClass('fa-plus');
							body.slideUp();
							story.removeClass('expand');
						}

						var story_id = story.attr('id');

						if ($scope.isExistExpandedStories()) {
							if (angular.isDefined($scope.expandedStories[story_id])) {
								delete $scope.expandedStories[story_id];
								$cookies.putObject('expanded_stories', $scope.expandedStories);
							}
						}
					});
				}

				$scope.getExpandedStories = function() {
					$scope.expandedStories = {};
					if (angular.isUndefined($cookies.getObject('expanded_stories')))
						$cookies.putObject('expanded_stories', {});
					else
						$scope.expandedStories = $cookies.getObject('expanded_stories');
				}

				$scope.isExistExpandedStories = function () {
					return Object.keys($scope.expandedStories).length != 0;
				}

				$scope.getExpandedStories();
			}]);