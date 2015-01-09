'use strict';

module.exports = ['$scope', '$window', function($, $window) {
    $.message = 'Welcome to the kitchen sink.';
    $.config = $window.config;
}];