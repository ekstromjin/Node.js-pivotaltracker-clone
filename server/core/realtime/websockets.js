"use strict";

var utils = require("../../libs/utils"),
    consts = require("../../libs/consts"),
    config = require("../../config"),
    cronJob  = require("cron").CronJob,
    async = require("async"),
    JSON = require("json3"),
    projectDao = require('../dao/project-dao'),
    mongoose = require("mongoose"),
    ObjectId = mongoose.Types.ObjectId,
    fs = require('fs-extra'),
    userDao = require('../dao/user-dao'),
    storyDAO = require('../dao/story-dao'),
    commentDAO = require('../dao/comment-dao'),
    taskDAO = require('../dao/task-dao'),
    emailer = require("../../libs/emailer");

/**
 * Function defines server events and adds/removes client socket
 * @access public
 * @param {object} io - socket initial object
 * @returns {void}
 */
exports.run = function(io, sessionParameters) {
    io.use(require("express-socket.io-session")(sessionParameters));
    
    var clients = {};
    var clients_socket = {};
    var project_ratings = {};

    io.sockets.on("connection", function (socket) {
        // console.log("SOCKET_CONNECTED: " +socket.id);
        
        clients_socket[socket.id] = {
            socket: socket
        };

        if(typeof socket.handshake.session.user != 'undefined' && typeof socket.handshake.session.user.loginuser != 'undefined') {
            clients[socket.handshake.session.user.loginuser.id] = {
                loginuser: socket.handshake.session.user.loginuser,
                socketid: socket.id
            };

            async.parallel({
                members: function(callback) {
                    userDao.getMembers(function(err, members) {
                        if (err) {
                            callback(err, null);
                        }
                        else {
                            callback(null, members);
                        }
                    });
                },
                allUsers: function(callback) {
                    userDao.getAllUsers(function(err, users) {
                        if (err) {
                            callback(err, null);
                        }
                        else {
                            callback(null, users);
                        }
                    });
                },
                loginUser: function(callback) {
                    callback(null, socket.handshake.session.user.loginuser);
                }
            }, function (err, results) {
                if (err) {
                    socket.emit('connected', { socketId: socket.id, message: results, success: false });
                }
                else {
                    socket.emit('connected', { socketId: socket.id, message: results, success: true });
                }
            });            
        }

        socket.on(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.getCurrentProjects, function(page_options) {
            async.parallel({
                projects: function(callback) {
                    projectDao.getProjectsByCurrentUser(socket.handshake.session.user.loginuser, page_options, function(err, projects) {
                        if (projects)
                        {
                            callback(null, projects);
                        }
                        else
                        {
                            callback(err, null);
                        }
                    })
                },
                projects_count: function(callback) {
                    projectDao.getCurrentProjectsCount(socket.handshake.session.user.loginuser, page_options['search_key'], function(err, count) {
                        if (count) {
                            callback(null, count);
                        }
                        else {
                            callback(err, null);
                        }
                    });
                }
            }, function (err, results) {
                if (err)
                {
                    socket.emit(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.getCurrentProjects, {message: 'Error', success: false});
                }
                else
                {
                    socket.emit(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.getCurrentProjects, {message: results, success: true});
                }
            });
        });

        socket.on(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.updateCurrentProjects, function (data) {
            if (typeof socket.handshake.session.user != 'undefined' && typeof socket.handshake.session.user.loginuser != 'undefined') {

                if (socket.handshake.session.user.loginuser.role != consts.ROLE.ADMIN) {
                    socket.emit(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.updateCurrentProjects, {message: 'Error', success: false});
                }
                else {
                    data['photo_url']['original_name'] = data['photo_url']['original_name'] != '' ? 'project.jpg': '';
                    var uploadFields = {photo_url: data['photo_url'], specdoc: data['specdoc'], attached_file: data['attached_file']};

                    data['photo_url'] = data['photo_url']['original_name'];
                    data['specdoc'] = data['specdoc']['original_name'];
                    data['attached_file'] = data['attached_file']['original_name'];
                    
                    data['leader'] = new ObjectId(data['leader']);
                    data['startdate'] = new Date(data['startdate']);
                    data['enddate'] = new Date(data['enddate']);

                    data['created'] = new Date();

                    
                    data['members'] = data['members'].split(',').map(function(member_id) {
                        return new ObjectId(member_id);
                    });
                    
                    projectDao.update(data, function(err, success) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            for (var key in uploadFields) {
                                var uploadField = uploadFields[key];
                                if (uploadField['filename'] != '') {
                                    var from = consts.PHOTO_URL.TEMP + uploadField['filename'];
                                    var to = consts.PHOTO_URL.PROJECT + data.id + '/' + key + '/' + uploadField['original_name'];
                                    fs.move(from, to, {clobber: true}, function (err){
                                    });
                                }
                            }

                            projectDao.getProjectById(data.id, function (err, result) {
                                if (err) {
                                    socket.emit(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.updateCurrentProjects, {message: 'Error', success: false});
                                }
                                else {
                                    socket.emit(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.updateCurrentProjects, {message: result, success: true});
                                }
                            });
                        }
                    });
                }
            }
            else {
                socket.emit(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.updateCurrentProjects, {message: 'Error', success: false});
            }
        });

        socket.on(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.CREATE_STORY, function (data){
            projectDao.getProjectById(data['project_id'], function (err, project) {
                if (project) {
                    if ((consts.ROLE.ADMIN == socket.handshake.session.user.loginuser.role) || (project.leader == socket.handshake.session.user.loginuser._id)) {
                        data['project_id'] = new ObjectId(data['project_id']);
                        data['members'] = data['members'].map(function (member_id) {
                            return new ObjectId(member_id);
                        });

                        var temp_files = data['tempFiles'];
                        delete data['tempFiles'];

                        data['requester'] = new ObjectId(data['requester']);

                        storyDAO.createNewStory(data, function (err, story) {
                            if (err) {
                                console.log('Error', err)
                            }
                            else {
                                if (story.files) {
                                    for (var i = 0; i < story.files.length; i++) {
                                        var temp_file = '';
                                        var real_file = '';

                                        temp_file = consts.PHOTO_URL.TEMP + temp_files[i];
                                        real_file = consts.PHOTO_URL.STORY + story._id + '/' + story.files[i];

                                        fs.move(temp_file, real_file, function (err) {});
                                    };
                                }
                                io.sockets.emit(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.CREATE_STORY_SUCCESS, {message: story, success: true});
                            }
                        });
                    }
                    else {
                        socket.emit(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.CREATE_STORY_ERROR, {message: 'error', success: true});
                    }
                }
                else {
                    socket.emit(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.CREATE_STORY_ERROR, {message: 'error', success: true});
                }
            });
        });

        socket.on(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.CREATE_COMMENT, function (data) {
            storyDAO.getStoryById(data['story_id'], function (err, story) {
                if (story) {
                    if ((consts.ROLE.ADMIN == socket.handshake.session.user.loginuser.role) || (data.tms.indexOf(socket.handshake.session.user.loginuser._id) != -1)) {
                        data['story_id'] = new ObjectId(data['story_id']);
                        if (data['uploadfiles']) {
                            data['files'] = data['uploadfiles'].map(function (file) {
                                return file['original_name'];
                            });
                            var temp_files = data['uploadfiles'];
                            delete data['uploadfiles'];
                        }
                        var team_members = data['tms'];
                        var project_id = story.project_id
                        delete data["socketId"];
                        delete data['tms'];
                        commentDAO.createComment(data, function (err, comment) {
                            if (err) {
                                console.log('Error', err)
                            }
                            else {
                                userDao.getTeamMembersByProject(team_members, function (err, tms){
                                    if (tms) {
                                        emailer.sendNewCommentEmail(socket.handshake.session.user.loginuser, tms, comment[0], project_id, function (err, suc){});
                                    }
                                });
                                if (comment[0].files) {
                                    var story_route = consts.PHOTO_URL.STORY + data['story_id'];
                                    var comment_route = story_route + '/' + 'comment/' ;
                                    fs.exists(story_route, function (exists) {
                                        if (!exists) {
                                            fs.mkdir(story_route);
                                        }

                                        for (var i = 0; i < temp_files.length; i++) {
                                            var temp_file = '';
                                            var real_file = '';
                                            temp_file = consts.PHOTO_URL.TEMP + temp_files[i].filename;
                                            real_file = comment_route + comment[0]._id + '/' + temp_files[i].original_name;

                                            fs.move(temp_file, real_file, function (err) {});
                                        };
                                    });
                                }
                                io.sockets.emit(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.STORY, {message: {'type': 'comment', 'result': comment[0]}, success: true});
                            }
                        });
                    }
                    else {
                        socket.emit(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.STORY, {message: 'error', success: true});
                    }
                }
                else {
                    socket.emit(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.STORY, {message: 'error', success: true});
                }
            });
        });

        socket.on(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.CREATE_TASK, function (data){
            delete data['socketId'];
            data['user_id'] = new ObjectId(data['user_id']);
            data['story_id'] = new ObjectId(data['story_id']);

            taskDAO.createTask(data, function (err, suc){
                if (err) {

                }
                else {
                    io.sockets.emit(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.STORY, {message: {type: 'task', method: 'create', result: suc}, success: true});
                }
            });
        });

        socket.on(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.REMOVE_TASK, function (data){
            taskDAO.removeTask(data._id, function (err, suc) {
                if (err) {
                    console.log(err);
                }
                else {
                    io.sockets.emit(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.STORY, {message: {type: 'task', method: 'remove', result: data}, success: true});
                }
            });
        });

        socket.on(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.UPDATE_STORY, function (data) {
            if (data['field'] == 'members') {
                data['value'] = data['value'].map(function (member_id) {
                    return new ObjectId(member_id);
                });
            }
            else if (data['field'] == 'status') {
                var status = Number(data['value']);
                projectDao.getProjectById(data.project_id, function (err, project) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        switch (status) {
                            case 2:
                                userDao.getManagers(project.leader, function (err, managers) {
                                    if (err) {
                                        console.log(err);
                                    }
                                    else {
                                        var story_info = { id: data._id, status: 'finish', project_id: data.project_id };
                                        var manager_emails = managers.map(function (manager){ return manager.emailaddress; });
                                        emailer.sendChangeStoryStatus(manager_emails, story_info, function (err, result) {
                                            if (err) {
                                                console.log(err);
                                            }
                                            else {
                                            }
                                        });
                                    }
                                });
                                break;
                            case 3:
                                storyDAO.getStoryById(data._id, function (err, story) {
                                    if (err) {
                                        console.log(err);
                                    }
                                    else {
                                        userDao.getTeamMembersByProject(story.members, function (err, users) {
                                            if (err) {
                                                console.log(err);
                                            }
                                            else {
                                                var story_info = { id: data._id, status: 'reject', project_id: data.project_id };
                                                var user_emails = users.map(function (user){ return user.emailaddress; });
                                                emailer.sendChangeStoryStatus(user_emails, story_info, function (err, result) {
                                                    if (err) {
                                                        console.log(err);
                                                    }
                                                    else {
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                                break;
                            case 4:
                                storyDAO.getStoryById(data._id, function (err, story) {
                                    if (err) {
                                        console.log(err);
                                    }
                                    else {
                                        userDao.getTeamMembersByProject(story.members, function (err, users) {
                                            if (err) {
                                                console.log(err);
                                            }
                                            else {
                                                var story_info = { id: data._id, status: 'accept', project_id: data.project_id };
                                                var user_emails = users.map(function (user){ return user.emailaddress; });
                                                emailer.sendChangeStoryStatus(user_emails, story_info, function (err, result) {
                                                    if (err) {
                                                        console.log(err);
                                                    }
                                                    else {
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                                break;
                            default:
                                break;
                        }
                    }
                });
            }
            else if (data['field'] == 'points') {
                if (Number(data['value']) > 0 && typeof project_ratings[data.project_id] != 'undefined') {
                    if (project_ratings[data.project_id].story_id == data._id) {
                        delete project_ratings[data.project_id];
                        data['remove_rating'] = true;
                    }
                }
            }

            var update_data = {
                _id: data._id
            }

            update_data[data['field']] = data['value'];

            storyDAO.updateStory(update_data, function (err, success) {
                if (err) {
                    console.log(err);
                }
                else {
                    storyDAO.getStoryById(data._id, function (err, story) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            if (data['field'] == 'status')
                                io.sockets.emit(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.STORY, {message: {type: 'status', result: data}, success: true});
                            else
                                io.sockets.emit(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.STORY, {message: {type: 'update', result: data}, success: true});
                        }
                    });
                }
            });
        });

        socket.on(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.STORY_RATING_START, function (data) {
            if (typeof project_ratings[data.project_id] != 'undefined')
                return;

            var rating_info = {project_id: data.project_id, story_id: data.story_id, ratings: {}};
            project_ratings[data.project_id] = rating_info;
            io.sockets.emit(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.STORY, {message: {type: 'rating', method: 'start', result: rating_info}, success: true});
        });

        socket.on(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.REMOVE_STORY, function (data){
            storyDAO.removeStory(data._id, function (err, suc) {
                if (err) {
                    console.log(err);
                }
                else {
                    fs.delete(consts.PHOTO_URL.STORY+data._id);
                    taskDAO.removeTasksByStoryID(data._id, function (err, callback) {

                    });
                    commentDAO.removeCommentsByStoryID(data._id, function (err, callback) {

                    });

                    io.sockets.emit(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.STORY, {message: {type: 'remove', result: data}, success: true});
                }
            });
        });

        socket.on('pivotal_app:getProject', function (data){
            var project_id = data.project_id;

            projectDao.getProjectById(project_id, function (err, project) {
                if (err) {
                    return utils.successResponse({error: err}, res, next);
                }
                else {
                    var final_project = {};
                    final_project = {
                        _id: project._id,
                        title: project.title,
                        startdate: project.startdate,
                        enddate: project.enddate,
                        leader: project.leader,
                        photo_url: project.photo_url,
                        specdoc: project.specdoc,
                        attached_file: project.attached_file,
                        created: project.created,
                        members: project.members,
                        repository_url: project.repository_url,
                        id: project.id,
                        tms: [],
                        stories: {},
                        rating_story: 'undefined'
                    };

                    if (typeof project_ratings[project._id] != 'undefined') {
                        final_project.rating_story = project_ratings[project._id];
                    }

                    storyDAO.getAllStoriesByProject(project._id, function (err, stories) {
                        if (stories.length > 0) {
                            final_project.stories = stories;
                        }
                        else {
                            final_project.stories = {};
                        }
                        userDao.getTeamMembersByProject(final_project.members, function (err, tms){
                            final_project.tms = tms;
                            var temp_stories = {};
                            var story;

                            if (final_project.stories.length>0) {
                                for (var i = 0; i < final_project.stories.length; i++) {
                                    story = {
                                        _id: final_project.stories[i]._id,
                                        title: final_project.stories[i].title,
                                        project_id: final_project.stories[i].project_id,
                                        points: final_project.stories[i].points,
                                        description: final_project.stories[i].description,
                                        requester: final_project.stories[i].requester,
                                        files: final_project.stories[i].files,
                                        created_at: final_project.stories[i].created_at,
                                        status: final_project.stories[i].status,
                                        members: final_project.stories[i].members,
                                        type: final_project.stories[i].type,
                                        id: final_project.stories[i].id,
                                        tasks: [],
                                        comments: []
                                    };
                                    temp_stories[story._id] = story;
                                };

                                Object.keys(temp_stories).forEach(function(value, key){
                                    async.parallel([
                                        function (callback){
                                            commentDAO.getAllCommentsByStory(value, function (err, comments){
                                                temp_stories[value].comments = comments;
                                                callback(null, null);
                                            });
                                        }, function (callback){
                                            taskDAO.getAllTasksByStory(value, function (err, tasks){
                                                temp_stories[value].tasks = tasks;
                                                callback(null, null);
                                            });
                                        }], function (err, result){
                                            if (key == final_project.stories.length-1) {
                                                final_project.stories = temp_stories;
                                                final_project.currentStories = [];
                                                final_project.myworkStories = [];
                                                final_project.testStories = [];
                                                final_project.backlogStories = [];
                                                final_project.doneStories = [];
                                                socket.emit('pivotal_app:getProject', {message: final_project, success: true});
                                            }
                                        });
                                });
                            }
                            else {
                                socket.emit('pivotal_app:getProject', {message: final_project, success: true});
                            }
                        });
                    });
                }
            });
        });

        socket.on(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.DONE_TASK, function (task) {
            storyDAO.getStoryById(task.story_id, function (err, story) {
                if (err) {
                    socket.emit(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.STORY, {message: {type:'task', method: 'done', task: null, tip: 'No exists current story'}, success: false});
                }
                else {
                    if (story) {
                        if (story.members.indexOf(socket.handshake.session.user.loginuser._id) != -1) {
                            taskDAO.doneTask(task._id, function (err, result) {
                                if (err) {
                                    socket.emit(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.STORY, {message: {type:'task', method: 'done', 'task': null, 'tip': 'Failed to done task.'}, success: false});
                                }
                                else {
                                    if (result) {
                                        io.sockets.emit(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.STORY, {message: {type:'task', method: 'done', 'task': result, 'tip':'Success to done task.'}, success: true});
                                    }
                                    else {
                                        socket.emit(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.STORY, {message: {type:'task', method: 'done', 'task': null, 'tip': 'Failed to done task.'}, success: false});
                                    }
                                }
                            })
                        }
                        else {
                            socket.emit(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.STORY, {message: {type:'task', method: 'done', 'task': null, 'tip': 'You must be manager of this story.'}, success: false});
                        }
                    }
                    else {
                        socket.emit(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.STORY, {message: {type:'task', method: 'done', 'task': null, 'tip': 'No exists current story.'}, success: false});
                    }
                }
            })
        });

        socket.on(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.GET_ALL_PROJECT, function (data) {
            projectDao.getAllProjects(function (err, result) {
                if (err) {
                    socket.emit(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.GET_ALL_PROJECT, {message: {}, success:false})
                }
                else {
                    socket.emit(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.GET_ALL_PROJECT, {message: {projects: result}, success:true})
                }
            });
        });

        socket.on(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.EXPECT_CURRENT_STORY, function (data) {
            var temp_rating = project_ratings[data.project_id];
            temp_rating.ratings[socket.handshake.session.user.loginuser._id] = data.points;

            io.sockets.emit(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.STORY, {message: {type: 'rating', method: 'expect', result: temp_rating}, success: true});
        });

        socket.on(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.ESTIMATE_STORY, function (data){
            var temp = {
                _id: data.story_id,
                points: data.points
            }
            storyDAO.updateStory(temp, function (err, suc){
                if (suc == 1) {
                    delete project_ratings[data.project_id];
                    io.sockets.emit(consts.WEBSOCKET_EVENTS.PIVOTAL_APP.STORY, {message: {type: 'rating', method: 'estimate', result: data}, success: true});
                }
            });
        });
            

        socket.on("disconnect", function () {
            if(typeof socket.handshake.session.user != 'undefined' && typeof socket.handshake.session.user.loginuser != 'undefined') {
                delete clients[socket.handshake.session.user.loginuser.id];
                delete clients_socket[socket.id];
            }
            
            // console.log("SOCKET_DISCONNECT: " +socket.id);
        });
    });

    //start reading data and sending to client by cron job
    var websocketJob = new cronJob({
        cronTime: config.get("websocketsRestartCronTime"),
        onTick: function() {

            //console.log('CRON worker: ' + cluster.worker.id + ' clients: ' + _.size(clients));

            for(var socketId in clients) {
                if(clients[socketId]) {
                    var clientObject = clients[socketId];
                }

            }
        },
        start: false
    });

    websocketJob.start();
};