module.exports = function healthCheck(server) {
    var env = server.get('env');
    // health check endpoint for load balancers to ping
    server.get('/health-check/',function(req,res){
        res.status(200).end('OK ' + env);
    });
};