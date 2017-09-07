"use strict";

var express = require("express"),
    expSession = require("express-session"),
    router = express.Router(),
    config = require("../../config"),
    utils = require("../../libs/utils"),
    checkAuth = require("../../core/user/check-auth"),
    userDAO = require("../../core/dao/user-dao"),
    consts = require("../../libs/consts"),
    emailer = require("../../libs/emailer");

router.get("/", function(req, res, next) {
	checkAuth(req, res, next, function (findUserErr, currentUser){
		if (findUserErr) {
			var site = config.get("site");
            site.nowyear = new Date().getFullYear();
			res.render('login', site);
		}
		else {
			var now = new Date();
			var site_info = {
				nowyear: now.getFullYear(),
				title: config.get("site:title"),
				officename: config.get("site:officename"),
				officeurl: config.get("site:officeurl")
			}
			res.render('index', {site: site_info, user: req.session.user.loginuser});
		}
	});
});

router.get('/logout', function(req, res, next) {
	utils.destroySession(req);
    res.redirect('/');
});

router.get('/user/activate', function (req, res, next) {
    var activate_key = req.query.activate_key;
    userDAO.activateUser(activate_key, function (err, result) {
        if (err) {
            // console.log(err);
            var site = config.get("site");
            site.nowyear = new Date().getFullYear();
            res.render('404', site);
        }
        else {
            req.session.user = {
                loginuser: result
            }
            req.session.save();
            emailer.sendActivationSuccesMail(result, function (err, result) {
            	if (err) {
            		// console.log(err);
            	}
            	else {
            		// console.log(result);
            	}
            });
            res.redirect('/');
        }
    })
});

router.get('/user/resetpassword', function (req, res, next) {
    var activate_key = req.query.activate_key;
    userDAO.getUserByActivateKey(activate_key, function (err, user) {
        if (user == null) {
            res.render('404');
        }
        else {
            req.session.user = {reset_email: user.emailaddress};
            req.session.save();
            res.redirect('/#!/resetpassword');
        }
    });
});

module.exports = router;