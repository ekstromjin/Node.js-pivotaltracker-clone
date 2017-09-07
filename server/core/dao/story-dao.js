"use strict";

var mongoose = require("mongoose"),
    Story = mongoose.model('tb_story'),
    ObjectId = mongoose.Types.ObjectId,
    config = require("../../config"),
    log = require("../../libs/log")(module),
    utils = require("../../libs/utils"),
    async = require("async"),
    consts = require("../../libs/consts");

function createNewStory(story, callback) {
	Story.collection.insert(story, function (err, suc){
		if (err) {
			callback(err, null);
		}
		else {
			callback(null, suc[0]);
		}
	})
}

function getAllStoriesByProject(project_id, callback) {
	Story.find({project_id: project_id}, function (err, stories) {
		if (err) {
			callback(err, null);
		}
		else {
			callback(null, stories);
		}
	});
}

function getStoryById(story_id, callback) {
	Story.findOne({_id: story_id}, function (err, story) {
		if (err) {
			callback(err, null);
		}
		else {
			callback(null, story);
		}
	})
}

function updateStory(data, callback) {
	Story.update({_id: data._id}, data, function (err, success){
		if (err) {
			callback(err, null);
		}
		else {
			callback(null, success);
		}
	})
}

function removeStory(story_id, callback)
{
	Story.remove({_id: story_id}, function (err, success){
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

function estimatePointOfStoryByMembers(data, callback) {
	var story_id = data.story_id;
	var points = data.points;
	var member_id = new ObjectId(data.member_id);
	Story.findOne({_id: story_id}, function (error, story) {
		if (error) {
			callback(error, null);
		}
		else {
			if (story) {
				var rating_data = story.ratings;
				rating_data.push({member_id: member_id, rating_point: points});
				Story.update({_id: story._id}, {$set:{ratings: rating_data}}, function (err, result) {
					if (err) {
						callback('Updating Current Story has some problems.', null);
					}
					else {
						Story.findOne({_id: story._id}, function (e, res) {
							if (e) {
								callback(e, null);
							}
							else {
								if (res) {
									callback(null, res);
								}
								else {
									callback('No exist Current Story.', null);
								}
							}
						})
					}
				})
			}
			else {
				callback('No exist Current Story.', null);
			}
		}
	});
}

exports.createNewStory = createNewStory;
exports.getAllStoriesByProject = getAllStoriesByProject;
exports.getStoryById = getStoryById;
exports.updateStory = updateStory;
exports.removeStory = removeStory;
exports.estimatePointOfStoryByMembers = estimatePointOfStoryByMembers;