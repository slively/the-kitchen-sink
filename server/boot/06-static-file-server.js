/*
    This is a static file server that supports push-state for angular apps and injecting server side configuration.
    If you want a very basic file server, delete all this and use the commented code at the bottom.
*/
var staticServer = require('loopback').static,
    path = require('path'),
    ejs = require('ejs'),
    indexFilePath = path.join(__dirname, '../../client/index.ejs'),
    // Any config.json items you want to show up in the client add the name to this array.
    // It will exist in window.config.MY_CONFIG_ITEM on the client.
    publicConfigKeys = [

    ];

module.exports = function mountStaticFileServer(server) {
    var cachedIndexPage = '',
        indexPageEjsData = {
            serverConfig: {}
        };

    ['/css', '/js', '/img', '/html', '/fonts'].forEach(function(folder){
        server.use(folder, staticServer(path.join(__dirname, '../../client' + folder)));
        server.use(folder, function(req, res){
            res.status(404).send('File not found.');
        });
    });

    // retrieve config items for client
    publicConfigKeys.forEach(function(key){
        indexPageEjsData.serverConfig[key] = server.get(key);
    });

    // nothing matched, so just send the homepage
    server.use(function(req, res) {
        // in production and have a cached version, we will just send that
        if (server.get('env') === 'production' && cachedIndexPage.length) {
            res.status(200).type('html').end(cachedIndexPage);

        // render the index page & cache for production
        } else {
            // cache the file in memory
            ejs.renderFile(indexFilePath, indexPageEjsData, function(err, page) {
                if (err) {
                    return console.log(err);
                }
                cachedIndexPage = page;
                res.status(200).type('html').end(cachedIndexPage);
            });
        }
    });
};


/*
// Very basic file server from the client directory
//  (be sure to rename index.ejs to index.html and remove any <% tags %>
var staticServer = require('loopback').static,
    path = require('path');

module.exports = function mountStaticFileServer(server) {
    server.use(staticServer(path.join(__dirname, '../../client')));
};
*/
