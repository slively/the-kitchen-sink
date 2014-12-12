module.exports = function healthCheck(app) {
    app.get('/health-check/',function(req,res){
        res.status(200).end();
    });
};
