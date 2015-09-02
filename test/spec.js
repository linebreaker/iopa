/*
 * Copyright (c) 2015 Limerun Project Contributors
 * Portions Copyright (c) 2015 Internet of Protocols Assocation (IOPA)
  *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const should = require('should');

const iopa = require('../index'),
  IopaApp = iopa.default,
  iopaFactory = iopa.factory,
  iopaUtil = iopa.util,

  constants = iopa.constants,
  IOPA = constants.IOPA,
  SERVER = constants.SERVER,
  METHODS = constants.METHODS,
  PORTS = constants.PORTS,
  SCHEMES = constants.SCHEMES,
  PROTOCOLS = constants.PROTOCOLS,
  APP = constants.APP,
  COMMONKEYS = constants.COMMONKEYS,
  OPAQUE = constants.OPAQUE,
  WEBSOCKET = constants.WEBSOCKET,
  SECURITY = constants.SECURITY;

describe('#IOPA()', function () {

  var context, app;

  it('should create empty context', function () {

    context = iopaFactory.createContext();

    (context.hasOwnProperty(IOPA.Version) == -1).should.be.false;
    (context.hasOwnProperty(IOPA.CallCancelled) == -1).should.be.false;
    (context.hasOwnProperty(IOPA.Events) == -1).should.be.false;
    (context.hasOwnProperty(IOPA.Seq) == -1).should.be.false;
    (context.hasOwnProperty(SERVER.Logger) == -1).should.be.false;
    (context.hasOwnProperty(SERVER.CallCancelledSource) == -1).should.be.false;
    (context.hasOwnProperty(IOPA.Headers) == -1).should.be.false;
    (context.hasOwnProperty(IOPA.Method) == -1).should.be.false;
    (context.hasOwnProperty(IOPA.Host) == -1).should.be.false;
    (context.hasOwnProperty(IOPA.Path) == -1).should.be.false;
    (context.hasOwnProperty(IOPA.PathBase) == -1).should.be.false;
    (context.hasOwnProperty(IOPA.Protocol) == -1).should.be.false;
    (context.hasOwnProperty(IOPA.QueryString) == -1).should.be.false;
    (context.hasOwnProperty(IOPA.Scheme) == -1).should.be.false;
    (context.hasOwnProperty(IOPA.Body) == -1).should.be.false;
    (context.hasOwnProperty("IGNOREME") == -1).should.be.true;

  });

  it('should create app that updates context using both signatures', function () {

    var test = new IopaApp();
            
    // use standard IOPA signature with context
    test.use(function (context, next) {
      context[IOPA.Method] = "GET";
              
      // continue to next middleware in pipeline
      return next();
    });
            
    // use fast IOPA signature with `this` set to context
    test.use(function (next) {
      this[IOPA.Method].should.equal("GET");
      this[IOPA.Method] = "PUT";
                
      // show as complete
      return Promise.resolve("ABC");
    });

    app = test.build();

  });


  it('should call app with context updated', function (done) {

    var context = iopaFactory.createContext();

    app(context).then(function (value) {
      context[IOPA.Method].should.equal("PUT");
      iopaFactory.dispose(context);
      (context[IOPA.Method] == undefined).should.be.true;
      value.should.equal("ABC");
      done();
    })
  });

});