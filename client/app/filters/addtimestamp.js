angular.module('pivotalApp.filters')
	.filter('addTimestamp', function () {
		return function (url) {
			var random = (new Date()).getTime();
			return url + "?" + random;
		}
	});