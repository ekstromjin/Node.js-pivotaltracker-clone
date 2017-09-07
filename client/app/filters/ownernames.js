angular.module('pivotalApp.filters')
	.filter('ownerNames', function () {
		return function (userids, users) {
			if (!userids) {return 'None';}
			if (!users) {return 'None';}
			if (userids.length==0) {return 'None';}
			var ownerNames = '';
			
			for (var i = 0; i < userids.length; i++) {
				for (var j = 0; j < users.length; j++) {
					if (userids[i] == users[j]._id) {
						ownerNames = ownerNames + makeSimpleName(users[j]) + ', ';
					}
				};
			};

			if (ownerNames == '') {return 'None';}

			return ownerNames.slice(0, ownerNames.length-2);
		}

		function makeSimpleName(user) {
			var simple_name = '';
			simple_name = simple_name + user.firstname + ' ';
			if (user.lastname.indexOf(' ') == -1) {
				simple_name = simple_name + user.lastname.slice(0, 1);
			}
			else {
				simple_name = simple_name + user.lastname.slice(0, 1) + user.lastname.slice(user.lastname.indexOf(' ')+1, user.lastname.indexOf(' ')+2);
			}
			return simple_name;
		}
	});