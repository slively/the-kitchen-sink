// start the server
require('../../../server/server.js').start();

// Start with a webdriver instance:
var webdriver = require('selenium-webdriver'),
    driver = new webdriver.Builder().withCapabilities({'browserName': 'phantomjs'}).build();

module.exports = driver;