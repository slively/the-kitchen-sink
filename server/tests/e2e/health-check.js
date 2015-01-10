var request = require('supertest'),
    server = require('../../server.js');

describe('Health Check Endpoint', function() {
    it('should have a public GET at /health-check/', function(done){
        request(server)
            .get('/health-check/')
            .expect(200)
            .expect('OK ' + server.get('env'))
            .end(done);
    });
});