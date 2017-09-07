"use strict";

var mongoose = require("mongoose"),
    User = mongoose.model("tb_user"),
    ObjectId = mongoose.Types.ObjectId,
    config = require("../../config"),
    log = require("../../libs/log")(module),
    utils = require("../../libs/utils"),
    async = require("async"),
    bcrypt = require("bcryptjs"),
    consts = require("../../libs/consts");

function getUserByEmail(email, callback) {
	if (email) {
		email = email.toLowerCase();
	}
	User.findOne({emailaddress: email}, function (err, finduser){
		if (err) {
			callback(err, null);
		}
		else {
			callback(null, finduser);
		}
	});
}

function getUserById(id, callback) {
	User.findOne({_id: id}, function (err, finduser) {
		if (err) {
			callback(err, null);
		}
		else {
			callback(null, finduser);
		}
	});
}

function getUserByActivateKey(activate_key, callback) {
	User.findOne({activate_key: activate_key}, function (err, finduser) {
		if (err) {
			callback(err, null);
		}
		else {
			callback(null, finduser);
		}
	});
}

function registerUser(user, callback) {
	getUserByEmail(user.emailaddress, function (err, finduser){
		if (finduser) {
			callback(consts.ERROR.DUPLICATE_EMAIL, null);
		}
		else {
			bcrypt.genSalt(10, function (err, salt){
				bcrypt.hash(user.password, salt, function (err, hash){
					user.password = hash;
					productActivateKey(user.emailaddress + user.password, function (err, result) {
						if (err) {
							callback(err, null);
						}
						else {
							user.activate_key = result;
							user.activated = 0;
							User.collection.insert(user, function (err, suc){
								if (err) {
									callback(err, null);
								}
								else {
									callback(null, suc)
								}
							});
						}
					});
				});
			});
		}
	});
}

function authenticate(user, callback) {
	if (user.emailaddress) {
		user.emailaddress = user.emailaddress.toLowerCase();
	}

	getUserByEmail(user.emailaddress, function (err, finduser){
		if (finduser) {
			if (finduser.activated == 0) {
				callback(consts.ERROR.NOT_ACTIVATE, null);
			}
			else {
				// console.log(user.activated);
				if(typeof user.activated != 'undefined') {
					if (finduser.password != user.password) {
						callback(consts.ERROR.IN_CORRECT_PASSWORD, null);
					}
					else {
						callback(null, finduser);
					}
				} else {
					bcrypt.compare(user.password, finduser.password, function (error, res){
						if (res == true) {
							callback(null, finduser);
						}
						else {
							callback(consts.ERROR.IN_CORRECT_PASSWORD, null);
						}
					});
				}
			}
		}
		else {
			callback(consts.ERROR.NO_USER, null);
		}
	});
}

function getMembers(callback) {
	User.find({role: consts.ROLE.MEMBER}, '_id firstname lastname birthday gender emailaddress avatar', function (err, members) {
		if (err) {
            callback(err, null);
        } else {
            callback(null, members);
        }
	});
}

function getAllUsers(callback) {
	User.find({}, '_id firstname lastname avatar', function (err, users) {
		if (err) {
            callback(err, null);
        } else {
            callback(null, users);
        }
	});
}

function changePassword(user_info, callback) {
	bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(user_info.password, salt, function(err, hash) {
            if (!err)
            {
				productActivateKey(user_info.emailaddress + hash, function (err, result) {
					if (err) {
						console.log(err);
					}
					else {
						User.update(
					        { emailaddress: user_info.emailaddress },
					        { $set: {password: hash, activate_key: result} }, function(err, success) {
					            if (err) {
					                callback(err, null);
					            }
					            else {
					                callback(null, hash);
					            }
					        } 
				    	);
					}
				});
            }
        });
    });
}

function activateUser (activate_key, callback) {
	User.findOne({activate_key: activate_key}, function (err, finduser){
		if (err) {
			callback(err, null);
		}
		else {
			if (finduser) {
				User.update({_id:finduser._id}, {$set:{activated: 1}}, function (err, success) {
	                if (err) {
	                    callback(err, null);
	                } else {
	                    callback(null, finduser);
	                }
	            });
			}
			else {
				callback('failed to find user', null);
			}
		}
	});
}

function productActivateKey (base_data, callback) {
	bcrypt.genSalt(10, function (err, salt){
		bcrypt.hash(base_data, salt, function (err, hash){
			if (err) {
				callback(err, null);
			}
			else {
				callback(null, hash);
			}
		});
	});
}

function updateUser (user_data, callback) {
	User.findOne({_id: user_data.id}, function (err, finduser){
		if (err) {
			callback(err, null);
		}
		else {
			if (finduser) {
				User.update({_id:finduser._id}, user_data, function (err, success) {
	                if (err) {
	                    callback(err, null);
	                } else {
	                    callback(null, finduser);
	                }
	            });
			}
			else {
				callback('failed to find user', null);
			}
		}
	});
}

function getTeamMembersByProject(tm_ids, callback) {
	User.find({_id: {$in: tm_ids}}, function (err, tms) {
		if (err) {
			callback(err, null);
		}
		else {
			callback(null, tms);
		}
	});
}

function getManagers(leader, callback) {
	User.find({$or: [{_id: leader}, {role: consts.ROLE.ADMIN}]}, function (err, managers) {
		if (err) {
			callback(err, null);
		}
		else {
			callback(null, managers);
		}
	});
}

exports.registerUser = registerUser;
exports.authenticate = authenticate;
exports.changePassword = changePassword;
exports.getMembers = getMembers;
exports.getAllUsers = getAllUsers;
exports.getUserByEmail = getUserByEmail;
exports.activateUser = activateUser;
exports.updateUser = updateUser;
exports.getTeamMembersByProject = getTeamMembersByProject;
exports.getUserById = getUserById;
exports.getUserByActivateKey = getUserByActivateKey;
exports.getManagers = getManagers;