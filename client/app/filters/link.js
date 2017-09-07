angular
	.module('pivotalApp.filters')
		.filter('link', ['$sce', function ($sce) {
			return function (description) {
				if (!description) {return '';}
				var html = angular.copy(description);
				html = html.replace(/((http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?)/g, '<a href="$1" target="_blank">$1</a>');
				html = html.replace(/\n/g, "<br />");

				html = $sce.trustAsHtml(html);
				return html;
			}
		}]);