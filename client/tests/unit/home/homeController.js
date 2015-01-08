var chai = require('chai'),
    expect = chai.expect;

describe('home controller', function() {
    var controllerArgs = require('../../../static/js/app/modules/home/homeController.js'),
        controller = controllerArgs[2];

    it('should $scope and $window.', function() {
        expect(controllerArgs[0]).to.equal('$scope');
        expect(controllerArgs[1]).to.equal('$window');
        expect(controller).to.be.a('function');
    });

    it('should attach message & config properties to the scope.', function() {
        var scope = {},
            window = {
                config: 'config'
            };

        controller(scope, window);

        expect(scope.message).is.a('string');
        expect(scope.config).to.equal(window.config);
    });

});