angular
	.module('pivotalApp.directives')
		.directive('elementProjectAnalytics', ['$rootScope',
			function ($rootScope){
				return {
					restrict: 'E',
					scope: true,
					transclude: true,
					templateUrl: 'app/elements/project/analytics/template.html',
					controller: 'analyticsController',
					link: function (scope, element, attrs) {

					}
				}
			}])
		.controller('analyticsController', ['$scope', '$rootScope', '$timeout',
			function ($scope, $rootScope, $timeout){

				var chat;

				$rootScope.$watchCollection('project', function (data, olddata){
					if (data != olddata) {
						$scope.initProjectAnalytics();
					}
				});

				$rootScope.$watchCollection('project.tms', function (data, olddata){
					if (data != olddata) {
						$scope.analytics_members = angular.copy($rootScope.project.tms);
						$scope.makeFullName($scope.analytics_members);
						$scope.analyticsStories($scope.analytics_members);
					}
				});

				$scope.initProjectAnalytics = function () {
					$scope.analytics_members = angular.copy($rootScope.project.tms);

					$scope.makeFullName($scope.analytics_members);
					$scope.analyticsStories($scope.analytics_members);

					$scope.drawStoriesChart(angular.copy($rootScope.project.stories));
				}

				$scope.makeFullName = function (members) {
					angular.forEach(members, function (member, index){
						member.full_name = member.firstname + ' ' + member.lastname;
					});
				}

				$scope.analyticsStories = function (members) {
					angular.forEach(members, function (member, index){
						member.processing = 0;
						member.waiting = 0;
						member.finish = 0;
						member.points = 0;

						angular.forEach($rootScope.project.stories, function (value, index){
							if (value.members.indexOf(member._id) != -1) {
								if (value.status == 1 || value.status == 2) {
									member.processing++;
								}
								else if (value.status == 0 || value.status == 3) {
									member.waiting++;
								}
								else if (value.status == 4) {
									member.finish++;
									member.points += Number(value.points);
								}
							}
						});
					});
				}

				$scope.drawStoriesChart = function (stories) {
					var chart_data = [];
					var processing_count = 0;
					var waiting_count = 0;
					var finish_count = 0;

					angular.forEach(stories, function (value, index){
						if (value.status == 0 || value.status == 3) {
							waiting_count++;
						}
						else if (value.status == 1 || value.status == 2) {
							processing_count++;
						}
						else if (value.status == 4) {
							finish_count++;
						} 
					});

					chart_data.push({story: 'Done', value: finish_count});
					chart_data.push({story: 'Processing', value: processing_count});
					chart_data.push({story: 'Waiting', value: waiting_count});

					// PIE CHART
					chart = new AmCharts.AmPieChart();
					chart.dataProvider = chart_data;
					chart.titleField = "story";
					chart.valueField = "value";
					chart.outlineColor = "#FFFFFF";
					chart.outlineAlpha = 0.8;
					chart.outlineThickness = 2;
					// this makes the chart 3D
					chart.depth3D = 15;
					chart.angle = 30;

					// WRITE
					chart.write("chartdiv");
				}

				$rootScope.initChartDraw = function () {
					$timeout(function () {
						chart.handleResize();
					}, 300);
				}
			}]);