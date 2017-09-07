"use strict";

var config = require("../config"),
	consts = require("../libs/consts"),
	mongoose = require("mongoose"),
	uniqueValidator = require("mongoose-unique-validator"),
	Schema = mongoose.Schema;

module.exports = function (){
	var taskSchema = new Schema({
		title: {type: String, require: true},
		story_id: {type: Schema.Types.ObjectId, ref: 'tb_story'},
		user_id: {type: Schema.Types.ObjectId, ref: 'tb_user'},
		status: {type: String, require: true, default: 0},
		created_at: {type: String, require: true, default: Date.now()}

	});

	taskSchema.plugin(uniqueValidator, {error: "Error, expected {PATH} to be unique."});
	taskSchema.set('toJSON', {virtuals: true});
	taskSchema.set('toObject', {virtuals: true});

	mongoose.model('tb_task', taskSchema);
}