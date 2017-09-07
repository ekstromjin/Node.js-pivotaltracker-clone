"use strict";

var express = require("express"),
    router = express.Router(),
    config = require("../../config"),
    userDAO = require("../../core/dao/user-dao"),
    utils = require("../../libs/utils"),
    async = require("async"),
    file = require('fs-extra'),
    consts = require("../../libs/consts");

var emailer = require("../../libs/emailer");

router.post('/signup', function (req, res, next){
    var user_data = req.body;

    userDAO.registerUser(user_data, function (err, suc){
        if (suc) {
            var temp_avatar = consts.PHOTO_URL.TEMP+user_data.avatar;
            var profile_image = consts.PHOTO_URL.USER+suc[0]._id+'/'+user_data.avatar;

            file.copy(temp_avatar, profile_image, function (err){
                if (!err) {
                    file.delete(temp_avatar);
                }
            });
            suc[0].password = user_data.password;
            emailer.sendActivationEmail(suc[0], function (err, result) {
                if (err) {
                    console.log(err);
                }
                else {
                    // console.log(result);
                }
            });
            return utils.successResponse({success: suc[0]}, res, next);
        }
        else {
            return utils.successResponse({error: err}, res, next);   
        }
    });
});

router.post('/login', function (req, res, next){
    var user = req.body;

    userDAO.authenticate(user, function (err, suc){
        if (err) {
            return utils.successResponse({error: err}, res, next);
        }
        else {
            req.session.user = {
                loginuser: suc
            }
            req.session.save();

            return utils.successResponse({success: suc}, res, next);
        }
    });
});

router.post('/change_password', function (req, res, next) {
    var user_info = {
        emailaddress: req.session.user.loginuser.emailaddress,
        password: req.body.current_password,
    }

    userDAO.authenticate(user_info, function (err, suc) {
        if (err) {
            return utils.successResponse('incorrect', res, next);
        }
        else {
            var new_user_info = {
                emailaddress: req.session.user.loginuser.emailaddress,
                password: req.body.new_password
            }
            userDAO.changePassword(new_user_info, function (err, hashed_password) {
                if (err) {
                    return utils.successResponse('incorrect', res, next);
                }
                else {
                    req.session.user.loginuser.password = hashed_password;
                    return utils.successResponse('success', res, next);
                }
            });
        }
    });
});

router.post('/forgot_password', function (req, res, next) {
    userDAO.getUserByEmail(req.body.useremail, function (err, finduser) {
        emailer.sendForgotPasswordEmail(finduser, function (err, result) {
            if (err) {
                console.log(err);
            }
            else {
            }
        });
    });
    
    return utils.successResponse('success', res, next);
});

router.post('/reset_password', function (req, res, next) {
    var reset_email = '';
    if (typeof req.session.user != 'undefined' && typeof req.session.user.reset_email != 'undefined') {
        reset_email = req.session.user.reset_email;
    }

    userDAO.getUserByEmail(reset_email, function (err, finduser) {
        if (err) {
            console.log(err);
        }
        else {
            var user_info = {
                emailaddress: finduser.emailaddress,
                password: req.body.password,
            }
            userDAO.changePassword(user_info, function (err, finduser) {
                if (err) {
                    console.log(err);
                }
                else {
                    emailer.sendResetPasswordEmail(user_info, function (err, result) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            
                        }
                    });
                }
            });
        }
    });

    utils.successResponse('success', res, next)
});

router.post('/upload_profile', function (req, res, next){
    return utils.successResponse(req.files.files.name, res, next);
});

router.post('/update', function (req, res, next){
    var user_data = req.body;

    userDAO.updateUser(user_data, function (err, suc){
        if (suc) {
            async.waterfall([
                function(callback) {
                    if (user_data.avatar) {
                        var temp_avatar = consts.PHOTO_URL.TEMP+user_data.avatar;
                        var profile_image = consts.PHOTO_URL.USER+user_data.id+'/'+user_data.avatar;

                        file.copy(temp_avatar, profile_image, function (err){
                            if (!err) {
                                file.delete(temp_avatar);
                            }
                        });
                    }
                    callback(null);
                },
                function(callback) {
                    userDAO.getUserById(user_data.id, function (err, user) {
                        if (err) {
                            callback(err, null);
                        }
                        else {
                            req.session.user = {
                                loginuser: user
                            }
                            req.session.save();
                            callback(null, user)
                        }
                    });
                }
            ],function (err, result) {
                return utils.successResponse({success: result}, res, next);
            });
        }
        else {
            return utils.successResponse({error: err}, res, next);   
        }
    });
});

module.exports = router;