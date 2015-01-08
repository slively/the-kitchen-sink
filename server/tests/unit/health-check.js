var chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    expect = chai.expect;

chai.use(sinonChai);

describe('health-check', function() {
    var server;

    beforeEach(function() {
        // stub out server.get
        server = { get: sinon.spy() };
        require('../../routes/health-check.js')(server);
    });

    it('should mount a GET endpoint as \'/health-check/\'.', function() {
        expect(server.get).to.have.been.calledOnce;
        expect(server.get).to.have.been.calledWith('/health-check/');
    });

    it('should mount send a status of 200 with a string of \'OK\'.', function() {
        // retrieve server.get callback
        var mountFunction = server.get.getCall(0).args[1];
        expect(mountFunction).to.be.a('function');

        // stub out res.status(200) and return a spy
        var end = sinon.spy(),
            res = {
                status: sinon.stub().withArgs(200).returns({
                    end: end
                })
            };


        // execute server.get callback
        mountFunction({}, res);

        // make sure .end(...) get's called
        expect(end).to.have.been.calledOnce;
        expect(end).to.have.been.calledWithExactly('OK');
    });
});