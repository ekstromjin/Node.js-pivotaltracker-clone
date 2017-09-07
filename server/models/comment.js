"use strict";

var config = require("../config"),
	consts = require("../libs/consts"),
	mongoose = require("mongoose"),
	uniqueValidator = require("mongoose-unique-validator"),
	Schema = mongoose.Schema;

module.exports = function (){
	var commentSchema = new Schema({
		comment: {type: String, require: true},
		story_id: {type: Schema.Types.ObjectId, ref: 'tb_story'},
		user_id: {type: Schema.Types.ObjectId, ref: 'tb_user'},
		attached: [{type: String, default: null}],
		created_at: {type: String, require: true, default: Date.now()}

	});

	commentSchema.plugin(uniqueValidator, {error: "Error, expected {PATH} to be unique."});
	commentSchema.set('toJSON', {virtuals: true});
	commentSchema.set('toObject', {virtuals: true});

	mongoose.model('tb_comment', commentSchema);
}