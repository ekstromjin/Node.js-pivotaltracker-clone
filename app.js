"use strict";

require('./server/models');

var express = require("express"),
    fs = require('fs'),
    config = require("./server/config"),
    log = require("./server/libs/log")(module) || "",
    mongoose = require("mongoose"),
    path = require("path"),
    cookieParser = require("cookie-parser"),
    multer  = require("multer"),
    favicon = require("static-favicon"),
    bodyParser = require("body-parser"),
    session = require("express-session"),
    MongoStore = require("connect-mongo")(session),
    utils = require("./server/libs/utils"),
    generalRoutes = require("./server/routes"),
    argv = require("minimist")(process.argv.slice(2)),
    websockets = require("./server/core/realtime/websockets");
var http    = require("http");              // http server core module
var io      = require("socket.io");         // web socket external module

function startServer(port, runScheduler) {
    mongoose.connect(config.get("db:connection"), config.get("db:options"), function (mongooseError) {
        var app = express();
        
        var applicationTitle = config.get("application") || "";

        app.use(function (req, res, next) {
            var domain = config.get("domain");
            var cookieDomain = config.get("session:cookieDomain");
            //var origin = req.header("host");
            var origin = config.get("domain");
            if (origin) {
                origin = origin.toLowerCase().indexOf(cookieDomain) > -1 ? req.headers.origin : domain;
                //res.header("Access-Control-Allow-Origin", origin);
            } else {
                //res.header("Access-Control-Allow-Origin", "*");
            }
            // CORS headers
            res.header("Access-Control-Allow-Origin", "*");

            res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');

            // Set custom headers for CORS
            res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, viewerTZOffset");
            //res.header("Access-Control-Allow-Headers", "Content-Type, Accept, X-Access-Token, X-Key");
            res.header("Access-Control-Allow-Credentials", true);
            next();
        });

        //check if app is on eb and over http, and then redirect to https
        app.use(function (req, res, next) {
            if ((req.originalUrl.indexOf("/presentation?id=") > -1) &&
                (req.get("X-Forwarded-Proto") && req.get("X-Forwarded-Proto") === "https")) {
                res.redirect("http://" + req.get("Host") + req.url);
            }
            else if ((!req.secure) && (req.originalUrl.indexOf("/presentation?id=") < 0) &&
                (req.get("X-Forwarded-Proto") && req.get("X-Forwarded-Proto") !== "https")) {
                res.redirect("https://" + req.get("Host") + req.url);
            }
            else {
                next();
            }
        });

        //select the rootPath
        app.use(express.static(path.join(__dirname, "client")));
        // view engine setup
        app.set("views", path.join(__dirname, "/server/views"));
        app.set("view engine", "jade");

        app.use(favicon(__dirname + '/client/dist/images/favicon.ico'));
        app.use(bodyParser.json({
            limit: "5mb"
        }));
        app.use(bodyParser.urlencoded({
            extended: false,
            limit: "5mb"
        }));
        app.use(cookieParser());
        
        //session parameters
        var sessionParameters = session({
            name: config.get('session:cookieName'),
            secret: config.get('session:key'),
            saveUninitialized: false,
            resave: false,
            store: new MongoStore({
                db: mongoose.connection.db
            }),
            cookie: {
                path: "/",
                domain: utils.isDevelopmentEnv() ? null : config.get("session:cookieDomain"),
                httpOnly: true,
                secure: config.get("cookie:secure")
            }
        });
        app.use(sessionParameters);

        generalRoutes.register(app);

        // catch 404
        app.use(function (req, res, next) {
            var site = config.get("site");
            site.nowyear = new Date().getFullYear();
            res.render('404', site);
        });

        // error handlers
        app.use(function (err, req, res, next) {
            //utils.setAccessControlAllowOrigin(req, res, true);
            console.log(err);
            res.status(err.status || 500);
            res.send(new utils.serverAnswer(false, err));
        });

        var server = app.listen(port, function () {
            log.info("Express server listening on port: %s", server.address().port);
            log.info("Environment: %s", config.get("env"));
            log.info('application: ' + applicationTitle);
        });
        

        // Start Socket.io so it attaches itself to Express server
        var socketServer = io.listen(server, {
            "transports": [
                "websocket",
                "flashsocket",
                "htmlfile",
                "xhr-polling",
                "jsonp-polling",
                "polling"],
            "pingTimeout": 500000,
            "log level":1
        });
        
        websockets.run(socketServer, sessionParameters);
    });
    
}

var basePort = process.env.PORT || config.get("port");

startServer(basePort, true);
