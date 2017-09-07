"use strict";

var userDAO = require("../dao/user-dao"),
    consts = require("../../libs/consts");

module.exports = function (req, res, next, callback) {
	if (typeof req.session.user == 'undefined' || typeof req.session.user.loginuser == 'undefined') {
		callback({error: "No session info"}, null);
	}
	else {
		userDAO.authenticate(req.session.user.loginuser, function (findUserErr, findUser){
			if (findUserErr) {
				callback(findUserErr, null);
			}
			else {
				if (findUser){
					callback(null, findUser);
				}
				else {
					res.render('login');
				}
			}
		});
	}
}