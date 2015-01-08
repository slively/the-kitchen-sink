var fs = require('fs');

module.exports = function mountRestApi(server) {
    var routesPath = __dirname + '/../routes/';

    // Custom Routes
    fs.readdirSync(routesPath).forEach(function(file){
        if (file.length && file.indexOf('.js') > -1) {
            require(routesPath + file)(server);
        }
    });

    // Model Routes
    server.use(server.get('restApiRoot'), server.loopback.rest());
};