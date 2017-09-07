'use strict';

angular.module('pivotalApp.directives')
.directive('projectSearch', ['$rootScope', function($rootScope) {
	return {
		restrict: 'E',
		link: function(scope) {
			scope.searchProject = function(search_key) {
				$rootScope.project_searchkey = search_key;
				$rootScope.getCurrentProjects(1, search_key);
			}
		},
		template: [ '<div class="search_bar" accept-charset="utf-8">',
					'<a class="magnify"></a>',
					'<input type="text" ng-model="search_key" ng-change="searchProject(search_key)" placeholder="Search Project" />',
					'<a class="anchor search_help"></a>',
					'</div>'].join('')
	}
}]);