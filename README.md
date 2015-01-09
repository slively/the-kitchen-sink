# the-kitchen-sink
From git clone to production ASAP.
<br />
<br />

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
