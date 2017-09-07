"use strict";

var config = require("../config"),
    mongoose = require("mongoose"),
    uniqueValidator = require("mongoose-unique-validator"),
    Schema = mongoose.Schema;

module.exports = function() {
    var projectSchema = new Schema({
        title: { type: String, required: true, trim: true },
        startdate: { type: Date, required: true, trim: true },
        enddate: { type: Date, required: true, trim: true },
        members: [ {type: Schema.Types.ObjectId, ref: "tb_user", default: null} ],
        leader: { type: Schema.Types.ObjectId, ref: "tb_user", required: true },
        specdoc: { type: String, trim: true },
        attached_file: { type: String, trim: true },
        photo_url: { type: String, trim: true },
        repository_url: { type: String, trim: true },
        created: { type: Date }
    });

    projectSchema.set("toJSON", { virtuals: true });
    projectSchema.set("toObject", { virtuals: true });

    mongoose.model("tb_project", projectSchema);
};