"use strict";

var mongoose = require("mongoose"),
    ObjectId = mongoose.Types.ObjectId,
    project = mongoose.model('tb_project'),
    config = require("../../config"),
    log = require("../../libs/log")(module),
    utils = require("../../libs/utils"),
    async = require("async"),
    consts = require("../../libs/consts");

function create (data, callback) {
    project.collection.insert(data, function (error, success) {
        if (error) {
            callback(error, null);
        }
        else {
            callback(null, success);
        }
    });
}

function update (data, callback) {
    project.findOne({_id: data.id}, function (err, findProject) {
        if (err) {
            callback(err, null);
        }
        else {
            if (findProject) {
                project.update({_id: data.id}, data, function (error, success) {
                    if (error) {
                        callback(error, null);
                    }
                    else {
                        callback(null, findProject);
                    }
                });
            }
            else {
                callback('failed to find this project', null);
            }
        }
    });
}

function getProjectsByCurrentUser(user, page_options, callback) {
    if (user.role == consts.ROLE.ADMIN) {
        project.find({title: {$regex: page_options['search_key'], $options: 'i'}}, null, {
            skip: (page_options.current_page - 1) * page_options.items_per_page,
            limit: page_options.items_per_page,
            sort: {
                'created': -1
            }
        }, function (err, projects) {
            callback(null, projects);
        });
    }
    else {
        project.find({$and: [{title: {$regex: page_options['search_key'], $options: 'i'}}, {members: new ObjectId(user._id)}]}, null, {
            skip: (page_options.current_page - 1) * page_options.items_per_page,
            limit: page_options.items_per_page,
            sort: {
                'created': -1
            }
        }, function (err, projects) {
            callback(null, projects);
        });
    }
}

function getCurrentProjectsCount(user, search_key, callback) {
    if (user.role == consts.ROLE.ADMIN) {
        project.find({title: {$regex: search_key, $options: 'i'}}).count(function (err, count) {
            if (err) {
                callback(err, null);
            }
            else {
                callback(null, count);
            }
        });
    }
    else {
        project.find({$and: [{title: {$regex: search_key, $options: 'i'}}, {members: new ObjectId(user._id)}]}).count(function (err, count) {
            if (err) {
                callback(err, null);
            }
            else {
                callback(null, count);
            }
        });
    }
}

function getProjectById(project_id, callback) {
    project.findOne({_id: project_id}, function (err, project) {
        if (err) {
            callback(err, null);
        }
        else {
            callback(null, project);
        }
    });
}

function getAllProjects(callback) {
    project.find({}, function (err, projects) {
        if (err) {
            callback(err, null);
        }
        else {
            callback(null, projects);
        }
    })
}

exports.create = create;
exports.update = update;
exports.getProjectsByCurrentUser = getProjectsByCurrentUser;
exports.getCurrentProjectsCount = getCurrentProjectsCount;
exports.getProjectById = getProjectById;
exports.getAllProjects = getAllProjects;