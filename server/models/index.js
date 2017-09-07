/**
 * Created by Administrator on 12/8/2015.
 */

"use strict";

// require all nested models

var models = [
	'project.js',
	'user.js',
	'story.js',
	'task.js',
	'comment.js'
];

var l = models.length;
for (var i = 0; i < l; i++) {
    var model = "./" + models[i];
    require(model)();
}
