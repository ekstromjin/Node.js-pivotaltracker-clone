angular
	.module('pivotalApp.controllers')
		.controller('topbarController', ['$scope', '$rootScope', 'SocketIO', '$animateCss',
			function ($scope, $rootScope, SocketIO, $animateCss) {

				$rootScope.index_page = true;
				$rootScope.detail_page = false;

				SocketIO.watch('connected', function (data) {
					$rootScope.members = angular.copy(data.members);
					$rootScope.allUsers = angular.copy(data.allUsers);

					$rootScope.filteredUsers = $rootScope.filterDatas($rootScope.allUsers);
					$rootScope.filteredMembers = $rootScope.filterDatas($rootScope.members);
					$rootScope.loginUser = data.loginUser;
					
					$rootScope.makeSimpleName($rootScope.loginUser);

					SocketIO.emit(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.GET_ALL_PROJECT, {});
				});


				/*
				 */

				$rootScope.handleDatePickers = function(selector) {
					selector.datepicker({
						autoclose: true,
						format: 'yyyy-mm-dd'
					});
				}

				$rootScope.handleMultiSelect2 = function(selector, data, placeholder) {
					selector.select2({
						multiple: true,
						data: data,
						placeholder: placeholder
					})
				}

				$rootScope.handleSingleSelect2 = function(selector, data, placeholder) {
					selector.select2({
						data: data,
						placeholder: placeholder
					})
				}

				$rootScope.filterDatas = function(data) {
					var tempData = angular.copy(data);
					var filterData = {};
					angular.forEach(tempData, function(data) {
						filterData[data['_id']] = data;
					});

					return filterData;
				}

				$rootScope.makeSimpleName = function (user) {
					if (user.lastname.indexOf(' ') != -1) {
						user.simple_name = user.firstname + ' ' + user.lastname.slice(0,1) + user.lastname.slice(user.lastname.indexOf(' ') + 1 ,user.lastname.indexOf(' ') + 2);
					}
					else {
						user.simple_name = user.firstname + ' ' + user.lastname.slice(0,1);	
					}
				}

				$rootScope.getShortName = function (member) {
					if (angular.isUndefined(member))
						return '';
					return member.firstname + ' ' + member.lastname.split(' ').map(function(word) {return word.charAt(0)}).join('');
				}

				$rootScope.getFullName = function (member) {
					if (angular.isUndefined(member))
						return '';
					return member.firstname + ' ' + member.lastname;
				}

				SocketIO.watch(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.CREATE_STORY_SUCCESS, function (data){
					if (typeof $rootScope.project.stories == 'undefined')
						$rootScope.project.stories = {};
					console.log(data);
					$rootScope.project.stories[data._id] = data;
					console.log($rootScope.project);
					$rootScope.filterStoiresByCategory($rootScope.project);
					$('#addstory').modal('hide');
				});

				SocketIO.watch(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.STORY, function (data) {
					switch (data['type']){
						case 'comment' :
							if (typeof $rootScope.project.stories[data.result.story_id].comments == 'undefined')
								$rootScope.project.stories[data.result.story_id]['comments'] = [];
							$rootScope.project.stories[data.result.story_id].comments.push(data.result);
							break;
						case 'task':
							switch (data['method']) {
								case 'create':
									var task = {
										_id: data['result']._id,
										title: data['result'].title,
										status: data['result'].status,
										story_id: data['result'].story_id,
										user_id: data['result'].user_id
									};
									if (typeof $rootScope.project.stories[task.story_id] == 'undefined')
										$rootScope.project.stories[task.story_id].tasks = [];
									$rootScope.project.stories[task.story_id].tasks.push(task);
									break;
								case 'remove':
									var task_id = data['result']['_id'];
									var story_id = data['result']['story_id'];
									angular.forEach($rootScope.project.stories[story_id].tasks, function (task, index) {
										if (task._id == task_id) {
											$rootScope.project.stories[story_id].tasks.splice(index, 1);
										}
									});
									break;
								case 'done':
									if (data['task']) {
										var tasks = $rootScope.project.stories[data['task'].story_id].tasks;
										angular.forEach(tasks, function(value, index) {
											if (value._id == data['task']._id){
												$rootScope.project.stories[data['task'].story_id].tasks[index] = data['task'];
											}
										});
									}
									break;
								default:
									break;
							}
							break;
						case 'update' :
							var story_info = angular.copy(data['result']);
							if (angular.isDefined($rootScope.project.stories[story_info._id])) {
								$rootScope.project.stories[story_info._id][story_info.field] = story_info.value;
								$rootScope.project.stories[story_info._id] = angular.copy($rootScope.project.stories[story_info._id]);

								if (story_info.field == 'members' || story_info.field == 'points')
									$rootScope.filterStoiresByCategory($rootScope.project);
								console.log(story_info)
								if (story_info.field == 'points' && story_info.remove_rating == true) {
									$rootScope.project.rating_story = 'undefined';
								}
							}
							break;
						case 'status':
							var story_info = data['result'];
							if (angular.isDefined($rootScope.project.stories[story_info._id])) {
								$rootScope.project.stories[story_info._id]['status'] = story_info.value;
							}
							$rootScope.filterStoiresByCategory($rootScope.project);
							break;
						case 'rating':
							switch (data['method']) {
								case 'start':
									var rating_info = data['result'];
									if (rating_info.project_id == $rootScope.project._id)
										$rootScope.project.rating_story = angular.copy(rating_info);
									break;
								case 'expect':
									var result = angular.copy(data['result']);
									if (result.project_id == $rootScope.project._id)
										$rootScope.project.rating_story = result;
									break;
								case 'estimate':
									var result = angular.copy(data['result']);
									if ($rootScope.project._id == result.project_id) {
										$rootScope.project.stories[result.story_id].points = result.points;
										$rootScope.project.stories[result.story_id] = angular.copy($rootScope.project.stories[result.story_id]);
										$rootScope.project.rating_story = 'undefined';
									}
									break;
								default:
									break;
							}
							break;
						case 'remove':
							var story_id = data['result']['_id'];
							delete $rootScope.project.stories[story_id];
							$rootScope.filterStoiresByCategory($rootScope.project);
							break;
						default :
							break;
					}
				});
				
				SocketIO.watch(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.GET_ALL_PROJECT, function (data) {
					$rootScope.all_projects = data.projects;
				});

			}]);