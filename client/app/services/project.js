'use strict';

angular.module('pivotalApp.services')
.service('projectService', ['$http', '$rootScope', 'SocketIO', function($http, $rootScope, SocketIO) {
	this.createProject = function(scope, project) {
		$http.post(consts.api.version + '/api/project/create', project).then(function(response) {
			scope.clearProjectForm();
			if (scope.current_page == 1) {
				$rootScope.getCurrentProjects(1, $rootScope.project_searchkey);
				SocketIO.emit(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.GET_ALL_PROJECT, {});
			}
			else {
				scope.current_page = 1;
			}
		});
	}

	this.updateProject = function(scope, project) {
		SocketIO.emit(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.UPDATE_CURRENT_PROJECT, project);
	}
	SocketIO.watch(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.UPDATE_CURRENT_PROJECT, function(data) {
		if (data) {
			$(document).ready(function() {
				$("#projectUpdateResultSuc").css({display:'block'});
				setTimeout( function () {
					$("#projectUpdateResultSuc").css({display:'none'});
				}, 2000);
			});
		}
		else {
			$(document).ready(function() {
				$("#projectUpdateResultErr").css({display:'block'});
				setTimeout( function () {
					$("#projectUpdateResultErr").css({display:'none'});
				}, 2000);
			});
		}
		$http.post('/v1/api/project/getProject', {
			project_id: data._id
		}).success(function (data, status) {
			if (typeof data.message.error == 'undefined') {
				$rootScope.project = data.message;

				$rootScope.filterStoiresByCategory($rootScope.project);
			}
		});
	});

	this.uploadFile = function(scope, fd, field_name) {
		$http.post(consts.api.version + "/api/project/uploadFile",
			fd,
			{
				withCredentials: true,
				headers: {'Content-Type': undefined },
				transformRequest: angular.identity
			}
		).then(function(response) {
			scope.project_uploads[field_name] = response.data.message;
		});
	}

}]);