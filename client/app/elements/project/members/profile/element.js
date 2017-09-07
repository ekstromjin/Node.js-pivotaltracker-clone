angular.module('pivotalApp.directives')
.controller('memberProfileController', ['$scope', '$rootScope', '$location', '$timeout', '$modalInstance', 'member', 'projects', 
function ($scope, $rootScope, $location, $timeout, $modalInstance, member, projects) {
	$scope.member = member;
	$scope.projects = projects;
	$scope.consts = consts;

	$scope.relatedProjects = [];

	$scope.closeModal = function() {
		$modalInstance.close();
	}

	$scope.linkToProject = function(project_id) {
		$scope.closeModal();
		$timeout(function() {
			$location.path('project/' + project_id);	
		}, 100)
	}

	$scope.getRelatedProjects = function() {
		if ($rootScope.loginUser.role == consts.admin.role)
			$scope.relatedProjects = projects;
		else {
			angular.forEach($scope.projects, function (project, index) {
				if (project.members.indexOf($rootScope.loginUser._id) != -1)
					$scope.relatedProjects.push(project);
			});
		}
	}

	$scope.getRelatedProjects();
}]);
