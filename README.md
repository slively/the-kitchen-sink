## Getting Started Server-side (./server)
All code concerning booting/configuring/developing the web server lives in this directory.
The server is built on [loopback.io](http://loopback.io/) which is build on [expressjs](http://expressjs.com/).
Anything you may be used to with expressjs will work, there are just a bunch of built in extras here.

--
### server.js
This is the main entry point for the server. You shouldn't ~~need to~~ edit this file.

--
### config.json
This is used to set server environment variables that can be accessed with ```server.get('variable')``` ([documentation](http://docs.strongloop.com/display/public/LB/Environment-specific+configuration)).

--
### datasources.json
This is used to set datasource (re: database) configuration for each environment ([documentation](http://docs.strongloop.com/display/public/LB/Environment-specific+configuration)).

--
### model-config.json 
This file maps models to datasources and makes models accessible through the rest api using ```public: true``` ([documentation](http://docs.strongloop.com/display/public/LB/model-config.json)).

--
### logger/
This folder holds configuration for [winston](https://www.npmjs.com/package/winston) loggers.
All environemnts will use logger.js by default, but you can create environment specific loggers with: logger.environment.js

--
### routes/
Here is where you would route custom endpoints just like you would in expressjs.
```javascript
module.exports = function healthCheck(server) {
    // health check endpoint for load balancers to ping
    server.get('/health-check/',function(req,res){
        res.status(200).end('OK ' + server.get('env')); // send OK <environment-name>
    });
};
```

--
### models/

The .json & .js configuration files for every model lives here. One of the short-comings of the current state of this framework is the limited json configuration options, leaving a bunch to be done in javascript.
##### MyModel.json
This file can be used to set the properties of the model, relationships to other models, mapping to database tables, access control, and there are more features waiting to be implemented ([documentation](http://docs.strongloop.com/display/public/LB/Model+definition+JSON+file#ModeldefinitionJSONfile-Overview)).
##### MyModel.js
This is a place to make other changes to the model not possible in the .json file ([documentation](http://docs.strongloop.com/display/public/LB/Customizing+models#Customizingmodels-CustomizingamodelwithJavaScriptcode)).

##### Model Code Recipes (should be placed in ./server/models/MyModel.js)

###### I want to add more validation to MyModel ([documentation](http://docs.strongloop.com/display/public/LB/Validatable+class)).
```javascript  
module.exports = function(MyModel) {
  MyModel.validatesLengthOf('name', {
      min: 3, 
      max: 25
  });
  
  MyModel.validate('traffic_percentage', function(err){
      if (this.traffic_percentage < 1 || this.traffic_percentage > 100) {
          err();
      }
  }, {
      message: 'Traffic Percentage must be between 1 and 100.'
  });
}
```

###### I want to add hooks to MyModel when it is validated/updated/created/etc... ([documentation](http://docs.strongloop.com/display/public/LB/Model+hooks)).
```javascript
module.exports = function(MyModel) {
  MyModel.beforeCreate = function(next, modelInstance) {
      if(modelInstance.thisIsBadNews) {
          var e = new Error('Bad news bears!');
          e.status = e.statusCode = 400;
          next(e);
          return;
      }
      modelInstance.createDtTm = new Date();
      next();
  };
};
```
###### I want to add new REST endpoints/methods to MyModel ([documentation](http://docs.strongloop.com/display/public/LB/Remote+methods)).
```javascript
module.exports = function(MyModel) {
  MyModel.randomSuccess = function (id, body, cb) {
      // id is a number, body is an object just like req.body with express
      
      if (!body.name) {
          var e = new Error('The name field is required.');
          e.status = e.statusCode = 400;
          cb(e);
          return;
      }
      
      if (Math.random() <= .5) {
          var e = new Error('Awww shucks');
          e.status = e.statusCode = 500;
          cb(e);
          return;
      }
      
      cb(null, 'Hooray, great job ' + body.name + '!');
  };
  
  MyModel.remoteMethod('randomSuccess', {
      accepts: [
          {
              arg: 'id',
              type: 'Number',
              required: true,
              http: {
                  source: 'path'
              }
          },
          {
              arg: 'name',
              type: 'String',
              required: true,
              http: {
                  source: 'body'
              }
          }
      ],
      http: {
          path: '/:id/randomSuccess',
          verb: 'POST'
      },
      description: 'This is the brief description on the line in swagger.',
      notes: [
          'This is the longer description inside the swagger item.',
          'It can be an array of strings.'
      ]
  });
};
```

###### I want to disable a REST endpoint for MyModel ([documentation](http://docs.strongloop.com/display/public/LB/Exposing+models+over+REST#ExposingmodelsoverREST-HidingmethodsandRESTendpoints)).
```javascript
module.exports = function(MyModel) {

  // disable endpoints on the model
  MyModel.disableRemoteMethod('find', true);                 // GET /MyModel
  MyModel.disableRemoteMethod('findOne', true);              // GET /MyModel/findOne
  MyModel.disableRemoteMethod('count', true);                // GET /MyModel/count
  MyModel.disableRemoteMethod('findById', true);             // GET /MyModel/:id
  MyModel.disableRemoteMethod('exists', true);               // HEAD /MyModel/:id
  MyModel.disableRemoteMethod('upsert', true);               // PUT /MyModel
  MyModel.disableRemoteMethod('updateAttributes', false);    // PUT /MyModel/:id *NOTE* second parameter is different
  MyModel.disableRemoteMethod('create', true);               // POST /MyModel
  MyModel.disableRemoteMethod('updateAll', true);            // POST /MyModel/update
  MyModel.disableRemoteMethod('deleteById', true);           // DELETE /MyModel/:id
  
  // disable endpoints when MyModel has many SubModels (*NOTE* the pluralization of the submodel).
  MyModel.disableRemoteMethod('__get__SubModels', false);         // GET /MyModel/:id/SubModels
  MyModel.disableRemoteMethod('__findById__SubModels', false);    // GET /MyModel/:id/SubModels/:sid
  MyModel.disableRemoteMethod('__count__SubModels', false);       // GET /MyModel/:id/SubModels/count
  MyModel.disableRemoteMethod('__create__SubModels', false);      // POST /MyModel/:id/SubModels
  MyModel.disableRemoteMethod('__updateById__SubModels', false);  // PUT /MyModel/:id/SubModels/:sid
  MyModel.disableRemoteMethod('__destroyById__SubModels', false); // DELETE /MyModel/:id/SubModels/:sid
  MyModel.disableRemoteMethod('__delete__SubModels', false);      // DELETE /MyModel/:id/SubModels
  
  // disable endpoints when MyModel has many SubModels through SubModelReltn 
  MyModel.disableRemoteMethod('__exists__SubModels', false);  // HEAD /MyModel/:id/SubModels/rel/:sid
  MyModel.disableRemoteMethod('__link__SubModels', false);    // PUT /MyModel/:id/SubModels/rel/:sid
  MyModel.disableRemoteMethod('__unlink__SubModels', false);  // DELETE /MyModel/:id/SubModels/rel/:sid
};
```

###### I want to interact with other models when changing a model's behavior
```javascript
// When a new MyModel is created, also create a new AuditLogModel
// This could be generalized by looping through every model in server.models
var server = require('../../server/server');

module.exports = function(MyModel) {
    var AuditLogModel = server.models.AuditLogModel;
        
    MyModel.beforeCreate = function(next, exp) {
        AuditLogModel.create({
            createDtTm: new Date(),
            ModelJsonString: JSON.stringify(exp)
        });
        next();
    };
};
```

--

### tests/
All test related files for the server go here.

##### e2e/
This folder is for testing the REST API of the server using [supertest](https://www.npmjs.com/package/supertest).
```javascript
var request = require('supertest'),
    server = require('../../server.js');

describe('Health Check Endpoint', function() {
    it('should have a public GET at /health-check/', function(done){
        request(server)
            .get('/health-check/')
            .expect(200)
            .expect('OK')
            .end(done);
    });
});
```

##### unit/
This folder is for unit testing any models, routes, or other .js files using [chai](https://www.npmjs.com/package/chai) and [sinon](https://www.npmjs.com/package/sinon) using [sinon-chai](https://www.npmjs.com/package/sinon-chai) to bind them together.
```javascript
var chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    expect = chai.expect;

chai.use(sinonChai);

describe('health-check', function() {
    var server;

    beforeEach(function() {
        // stub out server.get
        server = { get: sinon.spy() };
        require('../../routes/health-check.js')(server);
    });

    it('should mount a GET endpoint as \'/health-check/\'.', function() {
        expect(server.get).to.have.been.calledOnce;
        expect(server.get).to.have.been.calledWith('/health-check/');
    });
    
    ...
});
```

--
<br/>
<br/>

## Getting Started Client-side (./client)
All code concerning configuring/testing/developing the client lives here.
The front-end framework is [Angular](https://angularjs.org/), css is build with [Less](http://lesscss.org/),  dependencies are included using [Browserify](http://browserify.org/) and declared using [NPM](https://www.npmjs.com/), and environment variables are included using [index-env](https://github.com/slively/index-env).

##### tldr
__non-production__: File changes don't require server restarts.

__production__: The entire client will be rolled into three optimized files and cached in memory on server start.

##### Overview
In any non-production environment the server has middleware setup so browserify and less are run as needed on request (unchanged files should be cached so it should be fast) using [browserify-middleware](https://www.npmjs.com/package/browserify-middleware) and [less-middleware](https://www.npmjs.com/package/less-middleware) in the ./server/boot/04-static-file-server.js file.

After running ```NODE_ENV=production npm run build``` or ```NODE_ENV=production npm run build-client``` index.ejs will be compiled to index.html, browserify and less will compile with production settings, angular teplates in the html folder will be bundled into bundle.js, uglify will be run on the bundle.js, and the server will cache index.html, style.css, and bundle.js in memory. 


--
### index.ejs
This is the index file for the client, when the build task is run it will be compile to index.html using the relevant config.json file. The config is accessible with ```var cfg = window.config;``` in the browser;
```
npm run build-client // index.ejs + config.json -> index.html
NODE_ENV=production npm run build-client // index.ejs + config.production.json -> index.html
```

--
### less/
All your less files goe here, the build job will compile style.less > ./client/static/css/style.css

--
### static/
Everything thing this folder is served as a static file, if not found a blank 404 page is returned.


##### html/
Put all of your angular templates in here and they will be rolled into bundle.js on build.


##### js/lib/
Put your included libraries here that aren't on NPM, this folder is ignore by jshint.


##### js/app/
All Angular code goes here. This is the entry point for browserify, you can organize files however you like in this folder, but make sure app.js is the main file.

--
### tests/
All client side tests go in this folder, when the test coverage task is run it will be put into ./client/tests/coverage


##### e2e/
This folder is for functional selenium tests of the client.
```javascript
var driver = require('../helpers/e2e-driver'),
    chai = require('chai').use(require('chai-webdriver')(driver));

describe('home page functional test', function() {
    it('should have a h3 title of \'Welcome to the LAN party.\'', function(done) {
        driver.get('http://localhost:3000/');
        chai.expect('#home h3').dom.to.contain.text('Welcome to the kitchen sink.',done);
    }) ;
});
```

##### unit/
This folder is for unit testing Angular code.
```javascript
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
});
```

--
### NPM Cheat Sheet 
```
npm start // start server
npm run test-server // run all unit & e2e tests and 'npm test-coverage-server'
npm run test-coverage-server // output test coverage report to ./server/tests/coverage/
npm run jshint-server // run jshint in ./server/ except ./server/tests/coverage/ (see .jshintrc & .jshintignore for more)
npm run migrations-create // create a new migration script (will be prompted for script name)
npm run migrations-up // run up on all new migrations
npm run migrations-down // run down on all previously run migrations
npm run discover-models // generate ./server/models/MyModel.js & ./server/models/MyModel.json from an existing datasource
```

--

### NPM Tips

##### Set environment
```
NODE_ENV=enviroment npm run ...
NODE_ENV=enviroment npm start
```

##### Remove the spinner
```
npm config set spin false
```

##### Don't display that long error message if something fails
```
npm run <some-command> --loglevel silent
```

##### Got error : Error: EACCES, permission denied
```
sudo npm ....
```
