angular
	.module('pivotalApp.directives')
		.directive('elementMemberList', ['$rootScope', '$modal',
			function ($rootScope, $modal){
				return {
					restrict: 'E',
					scope: true,
					transclude: true,
					templateUrl: 'app/elements/project/members/template.html',
					controller: 'membersController',
					link: function (scope, element, attrs) {
						scope.showProfile = function(member) {
							$modal.open({
								templateUrl : 'app/elements/project/members/profile/template.html',
								controller : 'memberProfileController',
								resolve : {
									member : function () {
										return member
									},
									projects : function() {
										if ($rootScope.loginUser.role == consts.admin.role)
											return $rootScope.all_projects;
										else
											return scope.projectsForMember[member._id];
									}
								}
							});
						}
					}
				}
			}])
		.controller('membersController', ['$scope', '$rootScope', '$timeout', 'SocketIO',
			function ($scope, $rootScope, $timeout, SocketIO){
				$scope.projectsForMember = {};

				$rootScope.$watch('project.tms', function (data) {
					if (data) {
						angular.forEach($rootScope.project.tms, function (value, index) {
							$rootScope.project.tms[index]['project_count'] = 0;
							$scope.projectsForMember[value._id] = [];
							angular.forEach($rootScope.all_projects, function (val, id) {
								if (val.members.indexOf($rootScope.project.tms[index]._id) != -1){
									$rootScope.project.tms[index]['project_count']++;
									$scope.projectsForMember[value._id].push(val);
								}
							});
						});
					}
				});
			}]);