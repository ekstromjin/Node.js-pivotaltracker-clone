angular
	.module('pivotalApp.directives')
		.directive('elementRatingLeader', ['$rootScope', function ($rootScope){
			return {
				restrict: 'E',
				scope: true,
				transclude: true,
				controller: 'ratingLeaderController',
				templateUrl: 'app/elements/project/rating/leader/template.html',
				link: function (scope, element, attrs){

				}
			}
		}])
		.controller('ratingLeaderController', ['$scope', '$rootScope', '$timeout', 'SocketIO', function ($scope, $rootScope, $timeout, SocketIO){
			$rootScope.$watchCollection('project.rating_story', function (data){
				if (data) {
					$scope.average = 0;
					$scope.estimated_flag = false;
					$scope.processing = angular.copy($rootScope.project.rating_story);
					$scope.rating_members = $scope.makeRatingMembers(angular.copy($rootScope.project.tms));
					$scope.setRatingPoint($scope.rating_members);
				}
			});

			$scope.makeRatingMembers = function (members) {
				$scope.estimated_flag = false;
				var results = [];
				var total_point = 0;

				angular.forEach(members, function (member, index) {
					if (member._id != $rootScope.project.leader) {
						results.push(member);
					}
				});

				if ($scope.processing != 'undefined' && results.length == Object.keys($scope.processing.ratings).length) {
					$scope.estimated_flag = true;
					angular.forEach($scope.processing.ratings, function (point, key){
						total_point += point;
					});
					if (results.length > 0) {
						$scope.average = Math.round(total_point / results.length);
					}
				}

				return results;
			}

			$scope.setRatingPoint = function (members) {
				angular.forEach(members, function (member, index){
					member.rating_value = 0;
					if (typeof $scope.processing != 'undefined' && typeof $scope.processing.ratings != 'undefined') {
						if (typeof $scope.processing.ratings[member._id] != 'undefined') {
							member.rating_value = $scope.processing.ratings[member._id];
						}
					}
				});
			}

			$scope.estimatePoint = function () {
				$scope.final_point = Number($('#estimate_point').val());
				if ($scope.final_point == 0) {
					$('.error-required').slideDown();
				}
				else {
					$('.error-required').slideUp();
				}

				if ($scope.final_point != 0 && ($scope.final_point < 1 || $scope.final_point > 8)) {
					$('.error-point').slideDown();
					return;
				}
				else {
					$('.error-point').slideUp();
					var data = {
						project_id: $scope.processing.project_id,
						story_id: $scope.processing.story_id,
						points: $scope.final_point
					}
					SocketIO.emit(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.ESTIMATE_STORY, data);
				}
			}
		}]);