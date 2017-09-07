"use strict";

var config = require("../config");

function isDevelopmentEnv() {
    return config.get("env") === "development";
}

function serverAnswer(status, answer) {
    this.success = (status === true) ? 1 : 0;

    if (!status) {
        this.message = answer;
    } else {
        this.message = answer;
    }
}

function successResponse(message, response, next) {
    response.send(new serverAnswer(true, message));
}

function failedResponse(errorText, response, next) {
    response.send(new serverAnswer(false, errorText));
}

function errorResponse(statusCode, errorText, response, next) {
    response.status(statusCode).send(new serverAnswer(true, errorText));
}

function destroySession(req) {
    req.session.destroy();
}

function getDomain(req, useBase) {
    var coreDomain = config.get("platformdomain");
    if (coreDomain) {
        return coreDomain;
    } else if (useBase) {
        return config.get("domain");
    } else {
        var domain = req.protocol + "://" + req.get("host");
        return domain;
    }
}

function htmldecode(str) {
    return str.replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&");
}

exports.isDevelopmentEnv = isDevelopmentEnv;
exports.serverAnswer = serverAnswer;
exports.successResponse = successResponse;
exports.failedResponse = failedResponse;
exports.errorResponse = errorResponse;
exports.destroySession = destroySession;
exports.getDomain = getDomain;
exports.htmldecode = htmldecode;