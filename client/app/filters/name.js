angular.module('pivotalApp.filters')
	.filter('name', function () {
		return function (user, type) {
			if (angular.isUndefined(user))
				return '';
			
			if (type == 'full')
				return user.firstname + ' ' + user.lastname;
			else if (type == 'short')
				return user.firstname + ' ' + user.lastname.split(' ').map(function(word) {return word.charAt(0)}).join('');
			else
				return '';
		}
	});