var driver = require('../helpers/e2e-driver'),
    chai = require('chai').use(require('chai-webdriver')(driver));

describe('home page functional test', function() {
    it('should have a h3 title of \'Welcome to the LAN party.\'', function(done) {
        driver.get('http://localhost:3000/');
        chai.expect('#home h3').dom.to.contain.text('Welcome to the LAN party.',done);
    }) ;
});