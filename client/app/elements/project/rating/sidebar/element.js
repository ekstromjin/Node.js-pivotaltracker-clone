'use strict';

angular.module('pivotalApp.elements')
.directive('elementRatingSidebar', ['$rootScope', function($rootScope) {
	return {
		restrict: 'E',
		templateUrl: 'app/elements/project/rating/sidebar/template.html',
		controller:　'ratingSidebarController',
		link: function(scope, element) {
			
		},
	}
}])
.controller('ratingSidebarController', ['$scope', '$rootScope', 'SocketIO', function ($scope, $rootScope, SocketIO) {
	$scope.startRating = function (story_id) {
		if ($rootScope.project.rating_story != "undefined")
			return;

		var post_data = {
			story_id: story_id,
			project_id: $rootScope.project._id
		}
		SocketIO.emit(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.STORY_RATING_START, post_data);
	}
}]);