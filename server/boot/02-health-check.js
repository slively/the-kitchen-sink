module.exports = function healthCheck(server) {
    server.get('/health-check/',function(req,res){
        res.status(200).end();
    });
};
