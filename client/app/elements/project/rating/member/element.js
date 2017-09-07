'use strict';

angular.module('pivotalApp.elements')
.directive('elementRatingMember', ['$rootScope', function($rootScope) {
	return {
		restrict: 'E',
		templateUrl: 'app/elements/project/rating/member/template.html',
		controller:　'ratingMemberController',
		link: function(scope, element) {

		},
	}
}])
.controller('ratingMemberController', ['$scope', '$rootScope', 'SocketIO', function ($scope, $rootScope, SocketIO) {
	
	$rootScope.$watch('project.rating_story', function (data) {
		if (data) {
			$scope.estimate_status = false;
			if (typeof data.ratings != 'undefined' && angular.isDefined(data.ratings[$rootScope.loginUser._id])) {
				$scope.estimate_status = true;
				$scope.estimated_point = data.ratings[$rootScope.loginUser._id];
			}
		}
	});
	$scope.ratingPoint = function (story_id, point) {
		if (!$scope.estimate_status){
			SocketIO.emit(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.EXPECT_CURRENT_STORY, {project_id: $rootScope.project._id, story_id: story_id, points: point});
		}
	}
}]);