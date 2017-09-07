'use strict';

angular.module('pivotalApp.directives')
	.directive('elementSidebar', ['$rootScope', '$timeout',
		function ($rootScope, $timeout) {
			return {
				restrict: 'E',
				scope: true,
				transclude: true,
				templateUrl: 'app/elements/project/sidebar/template.html',
				controller: 'sidebarController',
				link: function (scope, element, attrs, controller) {

					$rootScope.$watch('project', function (data, olddata){
						if (data != olddata) {
							$rootScope.initSidebar();
						}
					});
				}
			}
		}])
	.controller('sidebarController', ['$rootScope', '$scope', '$cookies',
		function ($rootScope, $scope, $cookies){
			$scope.consts = consts;

			$scope.openPanel = function(panelName) {
				var sidebarItem = $('.item.'+panelName);
				if (sidebarItem.hasClass('visible')) {
					return;
				}
				else {
					sidebarItem.addClass('visible');
					var panel = $('#'+panelName+'_panel');
					panel.addClass('visible');

					var temp = {};
					$('section.panels').find('.panel.visible').each(function () {
						temp[$(this).data('order')] = 1;
					});

					$cookies.putObject('panel_visible', temp);
				}
			}
			$scope.toggleSidebar = function () {
				var panelArea = $('section.main.project');
				var sidebar = $('aside.sidebar');
				panelArea.toggleClass('sidebar_closed');
				sidebar.toggleClass('collapsed');
			}

			$rootScope.initSidebar = function () {
				$scope.storiescount = Object.keys($rootScope.project.stories).length;
				$scope.myworkStoriesCount = $rootScope.project.myworkStories.length;
				$scope.currentStoriesCount = $rootScope.project.currentStories.length;
				$scope.backlogStoriesCount = $rootScope.project.backlogStories.length;
				$scope.testStoriesCount = $rootScope.project.testStories.length;
				$scope.doneStoriesCount = $rootScope.project.doneStories.length;
			}
		}]);