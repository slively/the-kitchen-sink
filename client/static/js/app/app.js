'use strict';
require('angular');
require('angular-resource');
require('angular-route');
require('./../lb-services.js');

module.exports = angular.module('app',[
    require('./modules/router').name,
    require('./modules/home').name
]);