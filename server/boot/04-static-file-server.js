/*
    This is a static file server that supports push-state for angular apps and injecting server side configuration.
    If you want a very basic file server, delete all this and use the commented code at the bottom.
*/
var loopback = require('loopback'),
    fs = require('fs'),
    clientPath = __dirname + '/../../client',
    bundleJSPath = '/static/js/bundle.js',
    bundleCSSPath = '/static/css/style.css',
    cacheMaxAge = 600;

function sendCachedFileMiddleware(filepath, type) {
    var cachedFile;

    return function sendCachedFile(req, res, next) {
        if (cachedFile) {
            res.status(200).set('Cache-Control', 'public, max-age=' + cacheMaxAge).type(type).end(cachedFile);
        } else {
            fs.readFile(filepath, function (err, result) {
                if (err) {
                    return next(err);
                }
                cachedFile = result;
                res.status(200).set('Cache-Control', 'public, max-age=' + cacheMaxAge).type(type).end(cachedFile);
            });
        }
    };
}

module.exports = function mountStaticFileServer(server) {

    // Set up the /favicon.ico
    server.use(loopback.favicon(__dirname+'/../../client/static/img/favicon.ico'));

    //  In production we assume a build has happened and bundles.js & style.css exist.
    //  Otherwise we use the middleware so updates happen without server restart.
    if (server.get('env') === 'production') {
        server.get(bundleJSPath,sendCachedFileMiddleware(clientPath + bundleJSPath, 'js'));
        server.get(bundleCSSPath,sendCachedFileMiddleware(clientPath + bundleCSSPath, 'css'));
    } else {
        server.get(bundleJSPath, require('browserify-middleware')(clientPath + '/static/js/app/app.js'));
        server.use('/static/css', require('less-middleware')(clientPath + '/less', {
            dest: clientPath + '/static/css',
            compiler: {
                compress: false,
                sourceMap: true
            }
        }));
    }

    // static files should 404 if not found
    server.use('/static', loopback.static(clientPath + '/static'));
    server.use('/static', function(req, res){
        res.status(404).send('File not found.');
    });

    // All non-static routes serve the homepage for push-state support
    //  In production we assume a build has happened and a production index.html exists.
    //  Otherwise we use the middleware so updates happen without server restart.
    if (server.get('env') === 'production') {
        server.use(sendCachedFileMiddleware(clientPath + '/index.html', 'html'));
    } else {
        server.use(require('index-env').middleware({
            inputFilePath: clientPath + '/index.ejs',
            configFolderPath: clientPath
        }));
    }
};