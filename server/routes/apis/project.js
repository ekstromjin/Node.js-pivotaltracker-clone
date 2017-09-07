/*
 *
 * Project Api Router
 * Created by paek, 2017-01-10
 *
 */

"use strict";

var express = require("express"),
    router = express.Router(),
    consts = require("../../libs/consts"),
    config = require("../../config"),
    utils = require("../../libs/utils"),
    projectDAO = require("../../core/dao/project-dao"),
    storyDAO = require("../../core/dao/story-dao"),
    userDAO = require("../../core/dao/user-dao"),
    taskDAO = require("../../core/dao/task-dao"),
    commentDAO = require("../../core/dao/comment-dao"),
    mongoose = require("mongoose"),
    ObjectId = mongoose.Types.ObjectId,
    fs = require('fs-extra'),
    multer = require('multer'),
    JSON3 = require('json3'),
    upload = multer();
var async = require("async");

/*
 * 1. Create Project
 * 2. Upload File
 */

/*
 * Create Project Method
 * Request : Project Data
 * Return : Created project object
 */

router.post("/create", function(req, res, next) {
    if (typeof req.session.user != 'undefined' && typeof req.session.user.loginuser != 'undefined') {

        if (req.session.user.loginuser.role == consts.ROLE.ADMIN) {
            var data = req.body;
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


            projectDAO.create(data, function(err, success) {
                if (err) {
                    console.log(err);
                }
                else {
                    for (var key in uploadFields) {
                        var uploadField = uploadFields[key];
                        if (uploadField['filename'] != '') {
                            var from = consts.PHOTO_URL.TEMP + uploadField['filename'];
                            var to = consts.PHOTO_URL.PROJECT + success[0]['_id'] + '/' + key + '/' + uploadField['original_name'];
                            fs.move(from, to, function (err){
                            });
                        }
                    }
                        
                    return utils.successResponse(success[0], res, next);
                }
            });
        }
        else {
            return utils.failedResponse('You are not Admin.', res, next);
        }
    } 
    else {
        return utils.failedResponse('You didn`t log in', res, next);
    }
});


/*
 * Get the project information
 * Param Project Id
 * return Project Object
 */

 router.post('/getProject', function (req, res, next){
    var project_id = req.body.project_id;


    projectDAO.getProjectById(project_id, function (err, project) {
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
                id: project.id,
                tms: [],
                stories: {}
            };
            storyDAO.getAllStoriesByProject(project._id, function (err, stories) {
                final_project.stories = stories;
                userDAO.getTeamMembersByProject(final_project.members, function (err, tms){
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
                                        return utils.successResponse(final_project, res, next);
                                    }
                                });
                        });
                    }
                    else {
                        return utils.successResponse(final_project, res, next);
                    }
                });
            });
        }
    });
 });

/*
 * UploadFile Method
 * Request : Files
 * Return : Uploaded file name
 */

router.post('/uploadFile', function(req, res, next) {
    if (req.files.file) {
        var names = {'filename': req.files.file.name, 'original_name': req.files.file.originalname};
        return utils.successResponse(names, res, next);
    }
    else
        return utils.successResponse({'filename': '', 'original_name': ''}, res, next);
});

module.exports = router;