'use strict';

angular.module('pivotalApp.elements')
.directive('elementRating', ['$rootScope', function($rootScope) {
	return {
		restrict: 'E',
		templateUrl: 'app/elements/project/rating/template.html',
		controller:　'ratingController',
		link: function(scope, element) {
			
		},
	}
}])
.controller('ratingController', ['$scope', '$rootScope', 'SocketIO', function ($scope, $rootScope, SocketIO) {
	$rootScope.$watchCollection('project.stories', function (newdata, olddata){
		if (newdata) {
			$rootScope.project.unestimatedStories = [];
			angular.forEach($rootScope.project.stories, function (value, index){
				if (value.points == 0) {
					$rootScope.project.unestimatedStories.push(value);
				}
			});
		}
	});
}]);