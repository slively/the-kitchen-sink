module.exports = angular
    .module('app.router',['ngRoute'])
    .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
        $routeProvider
            .when('/', { templateUrl: '/static/html/views/home.html', controller: 'homeController' })
            .otherwise({ redirectTo: '/' });
    }]);