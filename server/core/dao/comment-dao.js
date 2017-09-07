"use strict";

var mongoose = require("mongoose"),
    Comment = mongoose.model('tb_comment'),
    ObjectId = mongoose.Types.ObjectId,
    config = require("../../config"),
    log = require("../../libs/log")(module),
    utils = require("../../libs/utils"),
    async = require("async"),
    consts = require("../../libs/consts");

function createComment(comment, callback) {
    var d = new Date();
    comment.created_at = [d.getFullYear(), "-", (d.getMonth() + 1), "-", d.getDate(), " " , d.getHours(), ":", d.getUTCMinutes()].join("");
	Comment.collection.insert(comment, function (error, success) {
        if (error) {
            callback(error, null);
        }
        else {
            callback(null, success);
        }
    });
}

function getAllCommentsByStory(story_id, callback) {
	Comment.find({story_id: story_id}, function (err, comments) {
		if (err) {
			callback(err, null);
		}
		else {
			callback(null, comments);
		}
	});
}

function removeCommentsByStoryID(story_id, callback) {
    Comment.remove({story_id: story_id}, function (err, success){
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

exports.createComment = createComment;
exports.getAllCommentsByStory = getAllCommentsByStory;
exports.removeCommentsByStoryID = removeCommentsByStoryID;