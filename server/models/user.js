"use strict";

var config = require("../config"),
	consts = require("../libs/consts"),
	mongoose = require("mongoose"),
	uniqueValidator = require("mongoose-unique-validator"),
	Schema = mongoose.Schema;

module.exports = function (){
	var userSchema = new Schema({
		firstname: {type: String, require: true},
		lastname: {type: String, require: true},
		emailaddress: {type: String, require: true},
		birthday: {type: String, require: true},
		gender: {type: Number, require: true},
		password: {type: String, require: true},
		avatar: {type: String},
		role: {type: Number, default: 0, require: true},
		activate_key: {type: String, require: true},
		activated: {type: Number, default: 0, require: true}
	});

	userSchema.plugin(uniqueValidator, {error: "Error, expected {PATH} to be unique."});
	userSchema.set('toJSON', {virtuals: true});
	userSchema.set('toObject', {virtuals: true});

	mongoose.model('tb_user', userSchema);
}