"use strict";

var mongoose = require("mongoose"),
    Task = mongoose.model('tb_task'),
    ObjectId = mongoose.Types.ObjectId,
    config = require("../../config"),
    log = require("../../libs/log")(module),
    utils = require("../../libs/utils"),
    async = require("async"),
    consts = require("../../libs/consts");

function createTask(task, callback) {
	Task.collection.insert(task, function (err, suc){
		if (err) {
			callback(err, null);
		}
		else {
			callback(null, suc[0]);
		}
	});
}

function getAllTasksByStory(story_id, callback) {
	Task.find({story_id: story_id}, function (err, tasks){
		if (err) {
			callback(err, null);
		}
		else {
			callback(null, tasks);
		}
	});
}

function removeTasksByStoryID(story_id, callback) {
	Task.remove({story_id: story_id}, function (err, success){
		if (err)
		{
			callback(err, null);
		}
		else
		{
			callback(null, success);
		}
	});	
}

function doneTask(task_id, callback) {
	Task.findOne({_id: task_id}, function (err, task){
		if (err) {
			callback(err, null);
		}
		else {
			if (task) {
				var status = task.status==0?1:0;
				Task.update({_id: task._id}, {$set:{status: status}}, function (err, result) {
					if (err) {
						callback('Failed to update task for done', null);
					}
					else {
						task.status = status;
						callback(null, task);
					}
				})
			}
			else {
				callback('No exists current task', null);
			}
		}
	});
}

function removeTask(task_id, callback)
{
	Task.remove({_id: task_id}, function (err, success){
		if (err)
		{
			callback(err, null);
		}
		else
		{
			callback(null, success);
		}
	});
}

exports.createTask = createTask;
exports.doneTask = doneTask;
exports.getAllTasksByStory = getAllTasksByStory;
exports.removeTask = removeTask;
exports.removeTasksByStoryID = removeTasksByStoryID;
