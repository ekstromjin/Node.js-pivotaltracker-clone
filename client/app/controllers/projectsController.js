'use strict';

angular.module('pivotalApp.controllers')
.controller('projectsController', ['$rootScope', '$scope', 'projectService', 'SocketIO', '$cookies', '$location',
function($rootScope, $scope, projectService, SocketIO, $cookies, $location) {
	if (angular.isDefined($cookies.getObject('project_path'))) {
		var project_path = $cookies.getObject('project_path');
		$cookies.remove('project_path');
		$location.path(project_path);
	}
	else if (angular.isDefined($cookies.getObject('story_path'))) {
		var story_path = $cookies.getObject('story_path');
		$cookies.remove('story_path');
		$location.path(story_path);	
	}

	$scope.consts = consts;
	$rootScope.index_page = true;
	$rootScope.detail_page = false;

	$rootScope.project_searchkey = '';

	$scope.current_projects = [];
	$scope.current_page = 1;
	$scope.project_uploads = {
		'photo_url'		: {'filename' : '', 'original_name' : ''},
		'specdoc'		: {'filename' : '', 'original_name' : ''},
		'attached_file'	: {'filename' : '', 'original_name' : ''},
	};

	$scope.selectable_members = [];

/*
 * Get current projects
 */

	$scope.$watch('current_page', function(data) {
		if (!angular.isUndefined(data)) {
			$rootScope.getCurrentProjects(data, $rootScope.project_searchkey);
		}
	});

	$rootScope.getCurrentProjects = function(current_page, search_key) {
		SocketIO.emit(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.GET_CURRENT_PROJECTS, {
			items_per_page : consts.project.per_page,
			current_page : current_page,
			search_key : search_key,
		});
	}

	SocketIO.watch(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.GET_CURRENT_PROJECTS, function(data) {
		if (data == 'Error') {
			$scope.current_projects = [];
		}
		else {
			$scope.current_projects = angular.copy(data.projects);
			$scope.projects_count = data.projects_count;
		}
	});

/*
 * Init datas and set member data to select2-teammembers
 */

	$scope.init = function() {
		$scope.project_members = '';
		$scope.project_teamleader = '';
		
		$rootScope.handleDatePickers($('.date-picker.project-range'));
	}

	$scope.$watch('members', function(data) {
		if (!angular.isUndefined($rootScope.members)) {
			angular.forEach($rootScope.members, function (member) {
				$scope.selectable_members.push({id: member._id, text: $rootScope.getShortName(member)})
			});

			$rootScope.handleMultiSelect2($('.select2-teammembers'), $scope.selectable_members, 'Select team members');
			$rootScope.handleSingleSelect2($('.select2-teamleader'), [], 'Select a team leader');
		}
	});

/*
 * Project fields
 */

	$scope.changeMembers = function(members) {
		$scope.project_members = members;
		var team_members = [];

		if (members != '') {
			$('.private-member .text-error').addClass('display-hide');
			var team_memberids = members.split(',');

			angular.forEach(team_memberids, function (member_id) {
				team_members.push({id: $rootScope.filteredMembers[member_id]['_id'],text: $rootScope.getShortName($rootScope.filteredMembers[member_id])})
			});
		}
		else {
			$('.private-member .text-error').removeClass('display-hide');
		}
		
		$('.select2-teamleader').val('');
		$rootScope.handleSingleSelect2($('.select2-teamleader'), team_members, 'Select a team leader');
	}

	$scope.changeTeamleader = function(teamleader) {
		$scope.project_teamleader = teamleader;
		if (teamleader != '') {
			$('.team-leader .text-error').addClass('display-hide');
		}
		else {
			$('.team-leader .text-error').removeClass('display-hide');
		}
	}

	$scope.uploadFile = function(files, field_name) {
		var fd = new FormData();
		fd.append("file", files[0]);

		projectService.uploadFile($scope, fd, field_name);
	}

/*
 * Create Project
 */

	$scope.createProject = function() {
		if (typeof $rootScope.loginUser == 'undefined' || $rootScope.loginUser.role != 9)
			return;
		
		var available = $scope.createProjectForm.$valid;
		
		if ($scope.project_members == '') {
			available = false;
			$('.private-member .text-error').removeClass('display-hide');
		}

		if ($scope.project_teamleader == '') {
			available = false;
			$('.team-leader .text-error').removeClass('display-hide');
		}

		if (available) {
			var project = {
				title: $scope.project_title,
				startdate: $scope.project_startdate,
				enddate: $scope.project_enddate,
				members: $scope.project_members,
				leader: $scope.project_teamleader,
				photo_url: $scope.project_uploads['photo_url'],
				specdoc: $scope.project_uploads['specdoc'],
				attached_file: $scope.project_uploads['attached_file'],
				repository_url: $scope.project_repository,
			}

			projectService.createProject($scope, project);
		}
	}

	$scope.clearProjectForm = function() {
		$scope.project_title = '';
		$scope.project_startdate = '';
		$scope.project_enddate = '';
		$scope.project_members = '';
		$scope.project_teamleader = '';
		
		$scope.project_uploads = {
			'photo_url'		: {'filename' : '', 'original_name' : ''},
			'specdoc'		: {'filename' : '', 'original_name' : ''},
			'attached_file'	: {'filename' : '', 'original_name' : ''},
		};

		$('.project_specdoc').val('');
		$('.project_attached_url').val('');
		$('.project_photo_url').val('');

		$('.create-project-form .photo_url_form a.fileupload-exists').trigger('click');

		$('.select2-teammembers').val('');
		$('.select2-teamleader').val('');
		$('.private-member .text-error').addClass('display-hide');
		$('.team-leader .text-error').addClass('display-hide');

		$rootScope.handleSingleSelect2($('.select2-teamleader'), $scope.selectable_members, 'Select a team leader');
		$rootScope.handleMultiSelect2($('.select2-teammembers'), $scope.selectable_members, 'Select team members');

		$('#createproject').modal('hide');
	}

	$scope.init();
}]);