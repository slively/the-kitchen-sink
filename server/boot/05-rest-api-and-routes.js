var fs = require('fs');

module.exports = function mountRestApi(server) {
    var restApiRoot = server.get('restApiRoot'),
        routesPath = __dirname + '/../routes/',
        routes = fs.readdirSync(routesPath);

    // Custom Routes
    routes.forEach(function(file){
        if (file.length && file.indexOf('.js') > -1) {
            server.use(restApiRoot, require(routesPath + file));
        }
    });

    // Model Routes
    server.use(restApiRoot, server.loopback.rest());
};