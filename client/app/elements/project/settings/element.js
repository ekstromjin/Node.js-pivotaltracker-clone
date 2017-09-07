'use strict';

angular.module('pivotalApp.directives')
.directive('projectSettingsForm', ['$rootScope', 'projectService', '$timeout', function($rootScope, projectService, $timeout) {
	return {
		restrict: 'E',
		link: function(scope, element) {
			$rootScope.$watch('members', function(data) {
				if (data) {
					scope.handleSelectMembers();
				}
			});

			$rootScope.$watch('project', function () {
				if ($rootScope.project) {
					scope.id = $rootScope.project.id;
					scope.project_title = $rootScope.project.title;
					scope.project_startdate = $rootScope.project.startdate.split("T")[0];
					scope.project_enddate = $rootScope.project.enddate.split("T")[0];
					scope.project_teamleader = $rootScope.project.leader;
					scope.project_members = $rootScope.project.members.join();
					scope.project_uploads = {
						'photo_url' 	: {'filename': '', 'original_name': $rootScope.project.photo_url},
						'specdoc' 		: {'filename': '', 'original_name': $rootScope.project.specdoc},
						'attached_file' : {'filename': '', 'original_name': $rootScope.project.attached_file}
					};
					$timeout(function() { scope.handleSelectMembers(); }, 50);
				}
			})

			scope.handleSelectMembers = function() {
				if (!angular.isUndefined($rootScope.members) && !angular.isUndefined($rootScope.project)) {
					var selectable_members = [];
					var current_members = [];
					angular.forEach($rootScope.members, function (member) {
						selectable_members.push({id: member._id, text: scope.getShortName(member)});
					});
					angular.forEach($rootScope.project.tms, function (member) {
						current_members.push({id: member._id, text: scope.getShortName(member)});
					});
					$(".project_members").val($rootScope.project.members.join());
					$rootScope.handleMultiSelect2(element.find('.select2-teammembers'), selectable_members, 'Select team members');
					$rootScope.handleSingleSelect2($('.select2-teamleader'), current_members, 'Select a team leader');
				}
			}

			scope.changeMembers = function(members) {
				scope.project_members = members;
				var team_members = [];

				if (members != '') {
					$('.private-member .text-error').addClass('display-hide');
					var team_memberids = members.split(',');

					angular.forEach(team_memberids, function (member_id) {
						team_members.push({id: $rootScope.filteredMembers[member_id]['_id'],text: scope.getShortName($rootScope.filteredMembers[member_id])})
					});
				}
				else {
					$('.private-member .text-error').removeClass('display-hide');
				}
				
				$('.select2-teamleader').val('');
				$rootScope.handleSingleSelect2($('.select2-teamleader'), team_members, 'Select a team leader');
			}

			scope.changeTeamleader = function(teamleader) {
				scope.project_teamleader = teamleader;
				if (teamleader != '') {
					$('.team-leader .text-error').addClass('display-hide');
				}
				else {
					$('.team-leader .text-error').removeClass('display-hide');
				}
			}

			scope.getShortName = function (member) {
				if (angular.isUndefined(member))
					return '';

				var shortname = member.firstname;
				var lastname_words = member.lastname.split(' ');

				shortname += ' ';
				
				lastname_words.forEach(function (word) {
					shortname += word.charAt(0);
				});
				
				return shortname;
			}

			scope.uploadFile = function(files, field_name) {
				var fd = new FormData();
				fd.append("file", files[0]);

				projectService.uploadFile(scope, fd, field_name);
			}

			scope.updateProject = function() {

				var available = scope.updateProjectForm.$valid;
				
				if (scope.project_members == '') {
					available = false;
					$('.private-member .text-error').removeClass('display-hide');
				}

				if (scope.project_teamleader == '') {
					available = false;
					$('.team-leader .text-error').removeClass('display-hide');
				}

				if (available) {
					var project = {
						id: $rootScope.project._id,
						title: scope.project_title,
						startdate: scope.project_startdate,
						enddate: scope.project_enddate,
						members: scope.project_members,
						leader: scope.project_teamleader,
						photo_url: scope.project_uploads['photo_url'],
						specdoc: scope.project_uploads['specdoc'],
						attached_file: scope.project_uploads['attached_file'],
					}

					projectService.updateProject(scope, project);
				}
			}

			$(document).ready(function () {
				var handleDatePicker = function (){
					$('.date-picker').datepicker({
						autoclose: true,
						format: 'yyyy-mm-dd',
					});
				};

				handleDatePicker();
			});

		},
		templateUrl: 'app/elements/project/settings/template.html'
	}
}]);