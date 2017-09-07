angular.module('pivotalApp.filters')
	.filter('objectID', function () {
		return function (objectid) {
			if (!objectid) {return '';}

			var BSON = bson();
			return BSON.ObjectID(objectid).generationTime;
		}
	});