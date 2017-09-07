"use strict";

var express = require("express"),
    router = express.Router(),
    config = require("../../config"),
    storyDAO = require("../../core/dao/story-dao"),
    utils = require("../../libs/utils"),
    async = require("async"),
    file = require('fs-extra'),
    consts = require("../../libs/consts");

router.post('/getStoryFiles', function (req, res, next){
	return utils.successResponse(req.files.file, res, next);
});

module.exports = router;