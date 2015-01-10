var chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    expect = chai.expect;

chai.use(sinonChai);

describe('health-check', function() {
    var server,
        route = '/health-check/';

    beforeEach(function() {
        // stub out server.get
        server = { get: sinon.spy() };
        require('../../routes/health-check.js')(server);
    });

    it('should mount a GET endpoint as \'/health-check/\'.', function() {
        var envCall = server.get.getCall(0),
            mountCall = server.get.getCall(1);

        expect(server.get).to.have.been.calledTwice;
        expect(envCall).to.have.been.calledWith('env');
        expect(mountCall).to.have.been.calledWith(route);
    });

    it('should mount send a status of 200 with a string of \'OK\'.', function() {
        // retrieve server.get callback
        var env = 'env',
            getStub = sinon.stub(),
            server = {
                get: getStub
            };

        getStub.withArgs('env').returns(env);

        require('../../routes/health-check.js')(server);

        var mountRoute = getStub.secondCall.args[0],
            mountFunction = getStub.secondCall.args[1],
            end = sinon.spy(),
            req = {},
            res = {
                status: sinon.stub().withArgs(200).returns({
                    end: end
                })
            };

        expect(mountRoute).to.equal(route);

        mountFunction(req, res);

        // make sure .end(...) get's called
        expect(end).to.have.been.calledOnce;
        expect(end).to.have.been.calledWithExactly('OK ' + env);
    });
});