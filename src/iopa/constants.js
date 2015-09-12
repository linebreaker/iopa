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
 
exports.IOPA = {
    Scheme: "iopa.Scheme",
    Method: "iopa.Method",
    PathBase: "iopa.PathBase",
    Path: "iopa.Path",
    QueryString: "iopa.QueryString",
    Protocol: "iopa.Protocol",
    Headers: "iopa.Headers",
    Body: "iopa.Body",
    Host: "iopa.Host",

    response: "response",
    StatusCode: "iopa.StatusCode",
    ReasonPhrase: "iopa.ReasonPhrase",

    CallCancelled: "iopa.CallCancelled",

    IopaVersion: "iopa.Version",

    Error: "iopa.Error",
    SetHeader: "iopa.SetHeader",
    GetHeader: "iopa.GetHeader",
    RemoveHeader: "iopa.RemoveHeader",
    WriteHead: "iopa.WriteHead",
    HeadersSent: "iopa.HeadersSent",

    Id: "iopa.Id",
    Version: "iopa.Version",
    Seq: "iopa.Seq",
    Events: "iopa.Events",
    MessasgeId: "iopa.MessageId",
    Token: "iopa.Token",

    METHODS: {
        GET: "GET",
        PUT: "PUT",
        DELETE: "DELETE",
        POST: "POST",
    },

    PORTS: {
        HTTP: 80,
        HTTPS: 443,
        COAP: 5683,
        COAPS: 5684,
        MQTT: 1883,
        MQTTS: 8883
    },

    SCHEMES: {
        HTTP: "http:",
        HTTPS: "https:",
        COAP: "coap:",
        COAPS: "coaps:",
        MQTT: "mqtt:",
        MQTTS: "mqtts:"
    },

    PROTOCOLS: {
        HTTP: "HTTP/1.1",
        COAP: "COAP/1.0",
        MQTT: "MQTT/3.1.1",
    },

    EVENTS: {
        Request: "request",
        Response: "response",
        Finish: "finish",
        Disconnect: "disconnect"
    }
};

exports.SERVER = {
    Capabilities: "server.Capabilities",
    Logger: "server.Logger",
    CallCancelledSource: "server.CallCancelledSource",
    IsLocalOrigin: "server.IsLocalOrigin",
    OriginalUrl: "server.OriginalUrl",
    RemoteAddress: "server.RemoteAddress",
    RemotePort: "server.RemotePort",
    LocalAddress: "server.LocalAddress",
    LocalPort: "server.LocalPort",
    RawStream: "server.RawStream",
    IsRequest: "server.IsRequest",
    SessionId: "server.SessionId",
    TLS: "server.TLS",
    AppId: "server.AppId",
    IsChild: "server.IsChild",
    ParentContext: "server.ParentContext",
    Fetch: "fetch",
};

exports.APPBUILDER =
{
    AddSignatureConversion: "app.AddSignatureConversion",
    DefaultApp: "app.DefaultApp",
    DefaultMiddleware: "app.DefaultMiddleware"
};

exports.SENDFILE =
{
    Version: "sendfile.Version",
    Support: "sendfile.Support",
    Concurrency: "sendfile.Concurrency",
    SendAsync: "sendfile.SendAsync"
};

exports.OPAQUE =
{
    // 3.1. Startup
    
    Version: "opaque.Version",
    
    // 3.2. Per Request
    
    Upgrade: "opaque.Upgrade",
    
    // 5. Consumption
    
    Stream: "opaque.Stream",
    CallCancelled: "opaque.CallCancelled",
};

exports.WEBSOCKET =
{
    // 3.1. Startup
    Version: "websocket.Version",
    
    // 3.2. Per Request
    Accept: "websocket.Accept",
    
    // 4. Accept
    SubProtocol: "websocket.SubProtocol",
    
    // 5. Consumption
    SendAsync: "websocket.SendAsync",
    ReceiveAsync: "websocket.ReceiveAsync",
    CloseAsync: "websocket.CloseAsync",
    CallCancelled: "websocket.CallCancelled",
    ClientCloseStatus: "websocket.ClientCloseStatus",
    ClientCloseDescription: "websocket.ClientCloseDescription"
};

exports.SECURITY =
{

    ClientCertificate: "ssl.ClientCertificate",
    // 3.2. Per Request
    User: "server.User",
    Authenticate: "security.Authenticate",
    
    // 3.3. Response
    SignIn: "security.SignIn",
    SignOut: "security.SignOut",
    Challenge: "security.Challenge"
};

exports.MQTT = {
    ProtocolId: "mqtt.ProtocolId",
    ProtocolVersion: "mqtt.ProtocolVersion",
    Clean: "mqtt.Clean",
    ClientId: "mqtt.ClientId",
    KeepAlive: "mqtt.KeepAlive",
    UserName: "mqtt.UserName",
    Password: "mqtt.Password",
    Will: "mqtt.Will",
    Qos: "mqtt.Qos",
    Subscriptions: "mqtt.Subscriptions",
    Dup: "mqtt.Dup",
    Retain: "mqtt.Retain",
    SessionPresent: "mqtt.SessionPresent",
    Granted: "mqtt.Granted",

    METHODS: {
        CONNECT: "CONNECT",
        SUBSCRIBE: "SUBSCRIBE",
        UNSUBSCRIBE: "UNSUBSCRIBE",
        PUBLISH: "PUBLISH",
        PINGREQ: "PINGREQ",
        DISCONNECT: "DISCONNECT",
        CONNACK: "CONNACK",
        SUBACK: "SUBACK",
        UNSUBACK: "UNSUBACK",
        PUBACK: "PUBACK",
        PUBREC: "PUBREC",
        PUBREL: "PUBREL",
        PUBCOMP: "PUBCOMP",
        PINGRESP: "PINGRESP"
    },
    
    RETURN_CODES:
    {
    0: 'OK',
    1: 'Unacceptable protocol version',
    2: 'Identifier rejected',
    3: 'Server unavailable',
    4: 'Bad user name or password',
    5: 'Not authorized',
    }

};
 