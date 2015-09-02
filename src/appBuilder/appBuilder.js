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

/*
 * Module dependencies.
 */
 
 const Middleware = require('./middleware').default,
    Images = require('../util/images').default,
    guidFactory = require('../util/guid').default,
    
    shallow = require('../util/shallow'),
    merge = shallow.merge,
    copy = shallow.copy,
    clone = shallow.clone,
    
    constants = require('../iopa/constants'),
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

const APPBUILDER =
    {
        ExpandContext: "appbuilder.ExpandContext",
    }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/***
* AppBuilder Class to Compile/Build all Middleware in the Pipeline into single IOPA AppFunc
*
* @class 
* @public
*/
function AppBuilder() {
    var properties = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, AppBuilder);

    var defaults = {};
    defaults[SERVER.AppId] = guidFactory();
    defaults[SERVER.Capabilities] = {};
    defaults[SERVER.Logger] = console;
    defaults[APP.DefaultApp] = DefaultApp;
    defaults[APP.DefaultMiddleware] = [RespondMiddleware];
    defaults[SERVER.AppId] = guidFactory();

    this.properties = merge(properties, defaults);
    this.log = this.properties[SERVER.Logger];
    this.middleware = [];

    this.expand = this.properties[APPBUILDER.ExpandContext];
}

AppBuilder.prototype.use = function use(mw) {
    this.middleware.push(Middleware(this, mw));
    return this;
}
        
/***
* Method to Compile/Build all Middleware in the Pipeline into single IOPA AppFunc
*
* @return {function(context)} IOPA application 
* @public
*/
AppBuilder.prototype.build = function build() {
    var middleware = this.properties[APP.DefaultMiddleware].concat(this.middleware).concat(this.properties[APP.DefaultApp]);
    var app = this;
    var pipeline = function appbuilder_pipeline(context) {
        var i, prev, curr;
        i = middleware.length;
        prev = function () {
            return Promise.resolve(null);
        };
        while (i--) {
            curr = middleware[i];
            prev = curr.bind(app, context, prev);
        }
        return prev();
    };
    pipeline.log = this.log;
    return pipeline;
}

 /**
  * DEFAULT EXPORT
  */
exports.default = AppBuilder;

// DEFAULT HANDLERS:  RESPOND, DEFAULT APP, ERROR HELPER

function RespondMiddleware(context, next) {

    //  if (this.expand)
    //     expandContext.expandContext.call(this, context);

    var value = next();
    
    if (value == undefined)
    {
      context.log.error("Server/Middleware Error: One of the middleware functions on this server returned no value");
    }
    else
      return value.then(
        function (ret) {
            //        if (this.expand)
            //           expandContext.shrinkContext(context);
            return ret;
        },
        function (err) {
            DefaultError(context, err);
            //      if (this.expand)
            //         expandContext.shrinkContext(context);
            return Promise.resolve(null);
        });
}

function DefaultApp(context, next) {
    if (context[IOPA.Error]) {
        return Promise.reject(context[IOPA.Error]);
    }
    else {
        return Promise.resolve(null);
    }
}

function DefaultError(context, err) {
    if (context[IOPA.Protocol] == PROTOCOLS.HTTP) {
        DefaultErrorHttp(context, err);
    }
    else {
        context.log.error("Server/Middleware Error: " + err);
        throw (err);
    }
}

function DefaultErrorHttp(context, err) {
    context.log.error(err);
    if (err === 404) {
        context.response.writeHead(404, { 'Content-Type': 'text/html' });
        context.response.write(Images.logo);
        context.response.end('<h1>404 Not Found</h1><p>Could not find resource:</p><xmb>' + this.request.path + '</xmb>');
    }
    else {
        context.response.writeHead(500, { 'Content-Type': 'text/html' });
        context.response.write(Images.logo);
        context.response.end('<h1>500 Server Error</h1><p>An error has occurred:</p><xmb>' + err + '</xmb> ');
    }
}