'user strict';

// Define Controller
angular.module('pivotalApp.controllers', []);
// Define Directive
angular.module('pivotalApp.directives', []);
// Define Services
angular.module('pivotalApp.services', []);

angular.module('pivotalApp.filters', []);

angular.module('pivotalApp.elements', []);
//models

var dependencies = [
	'btford.socket-io',
	'ui.bootstrap',
	'angularMoment',
	'ngRoute',
	'ngAnimate',
  'ngCookies',
	'pivotalApp.controllers',
	'pivotalApp.directives',
	'pivotalApp.services',
	'pivotalApp.filters',
  'pivotalApp.elements'
];

angular.module('pivotalApp', dependencies)

.constant('wsEntryPoint', window.location.host)
.constant('wsConfig', {
  'reconnection delay': 1000,
  'reconnection limit': 1000,
  'max reconnection attempts': 'Infinity'
})

.constant('firstLoadEventList', ['connected'])

.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
  $locationProvider
    .html5Mode(false)
    .hashPrefix('!');
  $routeProvider.
    when('/', {
      templateUrl: 'app/templates/project/list.html',
      controller: 'projectsController'
    }).
    when('/project/:id', {
      templateUrl: 'app/templates/project/detail.html',
      controller: 'projectDetailController'
    }).
    when('/project/:id/story/:story_id', {
      templateUrl: 'app/templates/project/detail.html',
      controller: 'projectDetailController'
    }).
    otherwise({
        redirectTo: '/'
    });
}])

.run(function ($rootScope) {
	
});

angular.module('pivotalAppSign', [
  'ui.bootstrap',
  'ngRoute',
  'ngCookies',
])
.constant('wsEntryPoint', window.location.host)
.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
  $locationProvider
    .html5Mode(false)
    .hashPrefix('!');
  $routeProvider.
    when('/', {
      templateUrl: 'app/templates/login/signin.html',
      controller: 'signinController'
    }).
    when('/signup', {
      templateUrl: 'app/templates/login/signup.html',
      controller: 'signupController'
    }).
    when('/forgotpassword', {
      templateUrl: 'app/templates/login/forgot.html',
      controller: 'forgotPasswordController'
    }).
    when('/resetpassword', {
      templateUrl: 'app/templates/login/reset.html',
      controller: 'resetPasswordController'
    }).
    when('/project/:id', {
      resolve: {
        data: ['$rootScope', '$location', '$timeout', '$cookies', function ($rootScope, $location, $timeout, $cookies) {
          $timeout(function() {
            $cookies.putObject('project_path', $location.path());
            $location.path('/login');
          }, 10);
        }]
      }
    }).
    when('/project/:id/story/:story_id', {
      resolve: {
        data: ['$rootScope', '$location', '$timeout', '$cookies', function ($rootScope, $location, $timeout, $cookies) {
          $timeout(function() {
            console.log('before');
            $cookies.putObject('story_path', $location.path());
            $location.path('/login');
          }, 10);
        }]
      }
    }).
    otherwise({
        redirectTo: '/'
    });
}])

.run(function ($rootScope) {
  
});
