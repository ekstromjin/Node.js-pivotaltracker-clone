"use strict";

var consts = require("../libs/consts"),
    pageRouter = require("./pages"),
    projectRouter = require("./apis/project"),
    config = require("../config"),
    userAPIRouter = require("./apis/user"),
    storyAPIRouter = require("./apis/story");

var multer = require('multer');

function register(app) {
	app.use(multer({dest: consts.PHOTO_URL.TEMP}));
	// page routers
    app.use("/", pageRouter);
    
    // api routers
    app.use("/" + config.get("api:version") + '/user', userAPIRouter);
    app.use("/" + config.get("api:version") + "/api/project", projectRouter);
    app.use("/" + config.get("api:version") + "/story", storyAPIRouter);
}

exports.register = register;
