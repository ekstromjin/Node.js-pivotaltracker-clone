"use strict";

var config = require("../config"),
	consts = require("../libs/consts"),
	mongoose = require("mongoose"),
	uniqueValidator = require("mongoose-unique-validator"),
	Schema = mongoose.Schema;

module.exports = function (){
	var storySchema = new Schema({
		title: {type: String, require: true},
		type: {type: Number, require: true, default: 0},
		points: {type: Number, require: true},
		members: [
			{type: Schema.Types.ObjectId, ref: 'tb_user'}
		],
		description: {type: String, require: true},
		project_id: {type: Schema.Types.ObjectId, ref: 'tb_project'},
		status: {type: Number, require: true, default: 0},
		created_at: {type: String, require: true, default: Date.now()},
		files: [
			{type: String}
		],
		requester: { type: Schema.Types.ObjectId, ref: "tb_user", required: true }
	});

	storySchema.plugin(uniqueValidator, {error: "Error, expected {PATH} to be unique."});
	storySchema.set('toJSON', {virtuals: true});
	storySchema.set('toObject', {virtuals: true});

	mongoose.model('tb_story', storySchema);
}