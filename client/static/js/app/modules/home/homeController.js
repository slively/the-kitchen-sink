'use strict';

module.exports = ['$scope', '$window', function($, $window) {
    $.message = 'Welcome to the LAN party.';
    $.config = $window.config;
}];