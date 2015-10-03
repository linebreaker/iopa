/*
 * Copyright (c) 2015 Internet of Protocols Alliance (IOPA)
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

const FreeList = require('../util/freelist').FreeList,
    Events = require('events'),
    URL = require('url'),
 
    CancellationTokenSource = require('../util/cancellation').default,
    contextExtensionsAddTo = require('./contextExtensions').addTo,

    constants = require('./constants'),
    IOPA = constants.IOPA,
    SERVER = constants.SERVER,

    mergeContext = require('../util/shallow').mergeContext,
    cloneDoubleLayer = require('../util/shallow').cloneDoubleLayer,
    merge = require('../util/shallow').merge

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* *********************************************************
 * IOPA CONTEXT
 * ********************************************************* */

/**
 * Represents IOPA Context object for any REST Request/Response
 * See http://iopa.io for further details
 *
 * @class IopaContext
 * @constructor
 */
function IopaContext() {
    return this;
}
    
/**
* Initialize blank IopaContext object
* Generic properties common to all server types included
*
* @method Init
*/
IopaContext.prototype.init = function init() {
    this[IOPA.Version] = "1.2";
    var _cancellationTokenSource = new CancellationTokenSource();
    this[SERVER.CancelTokenSource] = _cancellationTokenSource;
    this[SERVER.Capabilities] = {};
    this[IOPA.CancelToken] = _cancellationTokenSource.token;
    this[IOPA.Events] = new Events.EventEmitter();
    this[IOPA.Seq] = "#" + _nextSequence();
    return this;
};

// INITIALIZATION
contextExtensionsAddTo(IopaContext.prototype);

/**
 * Represents IopaContext Factory of up to 100 items
 *
 * @instance IopaContextFactory

 * @method alloc()  get new IopaContext from pool or by creation if none available; remember to call context.init();
 * @method free(context)   return IopaContext to the pool for reuse
 */
function Factory(options) {
    _classCallCheck(this, Factory);

    options = options || {};
    var size = options["factory.Size"] || 100;
    
    this._logger = options[SERVER.Logger] || console;

    this._factory = new FreeList('IopaContext', size, function () { return IopaContext.apply(Object.create(IopaContext.prototype)); });
}

Object.defineProperty(Factory.prototype, SERVER.Logger, {
    get: function () { return this._logger; },
    set: function (value) { this._logger = value; }
});


/**
* Create a new barebones IOPA Request with or without a response record
*/
Factory.prototype._create = function factory_create() {
    var context = this._factory.alloc().init();
    context.dispose = this._dispose.bind(this, context);
    context[SERVER.Logger] = this._logger;
    context[SERVER.Factory] = this;
     return context;
};

/**
* Release the memory used by a given IOPA Context
*
* @param context the context to free 
*/
Factory.prototype._dispose = function factory_dispose(context) {
   if (context == null || context[SERVER.CancelTokenSource] == null)
        return;

 //  if (!(context[IOPA.CancelToken].isCancelled))
 //      context[SERVER.CancelTokenSource].cancel(IOPA.EVENTS.Finish);
   
    if (context.response) {
        var response = context.response;
        for (var prop in response) { if (response.hasOwnProperty(prop)) { response[prop] = null; } }
        this._factory.free(response);
    }

    for (var prop in context) { if (context.hasOwnProperty(prop)) { context[prop] = null; } };

    this._factory.free(context);
};

/**
* Create a new IOPA Context, with default [iopa.*] values populated
*/
Factory.prototype.createContext = function factory_createContext() {
    var context = this._create();
    var response = this._create();
    context.response = response;
    context.response[SERVER.ParentContext] = context;

    context[IOPA.Headers] = {};
    context[IOPA.Method] = "";
    context[IOPA.Host] = "";
    context[IOPA.Path] = "";
    context[IOPA.PathBase] = "";
    context[IOPA.Protocol] = "";
    context[IOPA.QueryString] = "";
    context[IOPA.Scheme] = "";
    context[IOPA.Body] = null;

    response[IOPA.Headers] = {};
    response[IOPA.StatusCode] = null;
    response[IOPA.ReasonPhrase] = "";
    response[IOPA.Protocol] = "";
    response[IOPA.Body] = null;
    response[IOPA.Headers]["Content-Length"] = null;

    return context;
};

/**
* Create a new IOPA Context, with default [iopa.*] values populated
*/
Factory.prototype.mergeCapabilities = function factory_mergeCapabilities(childContext, parentContext) {
   
    childContext[SERVER.ParentContext] = parentContext;
    merge(childContext[SERVER.Capabilities], cloneDoubleLayer(parentContext[SERVER.Capabilities]));
   
    if (childContext.response)
       merge(childContext.response[SERVER.Capabilities], cloneDoubleLayer(parentContext.response[SERVER.Capabilities]));

};


/**
* Create a new IOPA Context, with default [iopa.*] values populated
*/
Factory.prototype.createRequest = function createRequest(urlStr, options) {

    if (typeof options === 'string' || options instanceof String)
        options = { "iopa.Method": options };

    options = options || {};

    var context = this._create();
    context[SERVER.IsLocalOrigin] = true;
    context[SERVER.IsRequest] = true;
    context[SERVER.OriginalUrl] = urlStr;
    context[IOPA.Method] = options[IOPA.Method] || IOPA.METHODS.GET;

    var urlParsed = URL.parse(urlStr);
    context[IOPA.PathBase] = "";
    context[IOPA.Path] = urlParsed.pathname || "";
    context[IOPA.QueryString] = urlParsed.query;
    context[IOPA.Scheme] = urlParsed.protocol;
    context[SERVER.RemoteAddress] = urlParsed.hostname;
    context[IOPA.Host] = urlParsed.hostname;
    context[IOPA.Headers] = {};
    context[IOPA.Body] = null;

    const SCHEMES = IOPA.SCHEMES,
        PROTOCOLS = IOPA.PROTOCOLS,
        PORTS = IOPA.PORTS

    switch (urlParsed.protocol) {
        case SCHEMES.HTTP:
            context[IOPA.Protocol] = PROTOCOLS.HTTP;
            context[SERVER.TLS] = false;
            context[IOPA.Headers]["Host"] = context[IOPA.Host];
            context[SERVER.RemotePort] = parseInt(urlParsed.port) || PORTS.HTTP;
            break;
        case SCHEMES.HTTPS:
            context[IOPA.Protocol] = PROTOCOLS.HTTP;
            context[SERVER.TLS] = true;
            context[IOPA.Headers]["Host"] = context[IOPA.Host];
            context[SERVER.RemotePort] = parseInt(urlParsed.port) || PORTS.HTTPS;
            break;
        case SCHEMES.COAP:
            context[IOPA.Protocol] = PROTOCOLS.COAP;
            context[SERVER.TLS] = false;
            context[SERVER.RemotePort] = parseInt(urlParsed.port) || PORTS.HTTP;
            break;
        case SCHEMES.HTTPS:
            context[IOPA.Protocol] = PROTOCOLS.HTTP;
            context[SERVER.TLS] = true;
            context[IOPA.Headers]["Host"] = context[IOPA.Host];
            context[SERVER.RemotePort] = parseInt(urlParsed.port) || PORTS.COAP;
            break;
        case SCHEMES.COAPS:
            context[IOPA.Protocol] = PROTOCOLS.COAP;
            context[SERVER.TLS] = true;
            context[SERVER.RemotePort] = parseInt(urlParsed.port) || PORTS.HTTP;
            break;
        case SCHEMES.HTTPS:
            context[IOPA.Protocol] = PROTOCOLS.HTTP;
            context[SERVER.TLS] = true;
            context[IOPA.Headers]["Host"] = context[IOPA.Host];
            context[SERVER.RemotePort] = parseInt(urlParsed.port) || PORTS.COAPS;
            break;
        case SCHEMES.MQTT:
            context[IOPA.Protocol] = PROTOCOLS.MQTT;
            context[SERVER.TLS] = false;
            context[SERVER.RemotePort] = parseInt(urlParsed.port) || PORTS.HTTP;
            break;
        case SCHEMES.HTTPS:
            context[IOPA.Protocol] = PROTOCOLS.HTTP;
            context[SERVER.TLS] = true;
            context[IOPA.Headers]["Host"] = context[IOPA.Host];
            context[SERVER.RemotePort] = parseInt(urlParsed.port) || PORTS.MQTT;
            break;
        case SCHEMES.MQTTS:
            context[IOPA.Protocol] = PROTOCOLS.MQTT;
            context[SERVER.TLS] = true;
            context[SERVER.RemotePort] = parseInt(urlParsed.port) || PORTS.HTTP;
            break;
        case SCHEMES.HTTPS:
            context[IOPA.Protocol] = PROTOCOLS.HTTP;
            context[SERVER.TLS] = true;
            context[IOPA.Headers]["Host"] = context[IOPA.Host];
            context[SERVER.RemotePort] = parseInt(urlParsed.port) || PORTS.MQTTS;
            break;
        default:
            context[IOPA.Protocol] = urlParsed.protocol;
            context[SERVER.TLS] = false;
            context[SERVER.RemotePort] =parseInt(urlParsed.port) || PORTS.HTTP;
            break;
        case SCHEMES.HTTPS:
            context[IOPA.Protocol] = PROTOCOLS.HTTP;
            context[SERVER.TLS] = true;
            context[IOPA.Headers]["Host"] = context[IOPA.Host];
            context[SERVER.RemotePort] = parseInt(urlParsed.port) || PORTS.HTTPS;
    };

    mergeContext(context, options);

    return context;
};

/**
* Create a new IOPA Context, with default [iopa.*] values populated
*/
Factory.prototype.createRequestResponse = function createRequestResponse(urlStr, options) {
    var context = this.createRequest(urlStr, options);

    var response = this._create();
    context.response = response;
    context.response[SERVER.ParentContext] = context;

    response[IOPA.Headers] = {};
    response[IOPA.StatusCode] = null;
    response[IOPA.ReasonPhrase] = "";
    response[IOPA.Protocol] = context[IOPA.Protocol];
    response[IOPA.Body] = null;
    response[SERVER.TLS] = context[SERVER.TLS];
    response[SERVER.RemoteAddress] = context[SERVER.RemoteAddress];
    response[SERVER.RemotePort] = context[SERVER.RemotePort];
    response[SERVER.IsLocalOrigin] = false;
    response[SERVER.IsRequest] = false;
    response[SERVER.Logger] = context[SERVER.Logger];

    return context;
}

const maxSequence = Math.pow(2, 16);
var _lastSequence = Math.floor(Math.random() * (maxSequence - 1));

function _nextSequence() {
    if (++_lastSequence === maxSequence)
        _lastSequence = 1;

    return _lastSequence.toString();
};

// EXPORTS  
exports.default = Factory;