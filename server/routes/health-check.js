module.exports = function healthCheck(server) {
    // health check endpoint for load balancers to ping
    server.get('/health-check/',function(req,res){
        res.status(200).end('OK');
    });
};