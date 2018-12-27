'use strict';
var http = require('http');
var urlC = require('url');
var _data = require('./lib/data');
var decod = require('string_decoder').StringDecoder; //stringdecoder.;
var Buffer = require('buffer');
var decode = require('punycode').decode;
var error = require('util');
var handlers = require('./lib/handlers');
var usershandlers = require('./lib/users');
var helpers = require('./lib/helpers');
var menuhandlers = require('./lib/menu');
var orderhandlers = require('./lib/orders');
var tokenhandlers = require('./lib/tokens');
var port = process.env.PORT || 4000;

//instantiate the HTTP server
var server = http.createServer();

server.on("request", function (req, res) {

    var parsedUrl = urlC.parse(req.url, true);

    var headers = req.headers;

    var method = req.method.toLowerCase();

    var queryStringObject = parsedUrl.query;

    var path = parsedUrl.pathname;
    var paths = path.replace(/^\/+|\/+$/g,'');
      
    console.log('This is the path = ', parsedUrl);

    //this is the choice of the handler to handle a certain request depending on the 
    //route that the user has chosen. 
    const chosenHandler = typeof (router[paths]) !== 'undefined' ? router[paths] : handlers['notFound'];

    console.log('choosenhandler', chosenHandler);

    var decoder = new decod('utf-8');
    var buffer = '';

    res.on("error", (err) => {
        res.writeHead(400, { 'content-type': 'application/json', 'X-Powered-By': 'todaytech' });
        res.end(JSON.stringify('{"status":"-1","status_description":"The transaction failed on account of malformed response."}'));
    });
    req.on('data', function (data) {
        buffer += decoder.write(data);
    });
    req.on('end', function () {
            buffer += decoder.end();
            console.log('buffer Received ', buffer);
            res.writeHead(200, {
                'Content-Type': 'application/json',
                'X-Powered-By': 'todaytech'
            });
        console.log('buffer=', buffer);
            //Call the choosen handler 
        var payloads = helpers.jsonparser(buffer);

        console.log('payload=', payloads);

        var datapayload = {
            'trimmedpath': paths,
            'payload': payloads,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers
        };
        // Route the request to the handler specified in the router
        chosenHandler(datapayload, function (statusCode, payload) {

            // Use the status code returned from the handler, or set the default status code to 200
            statusCode = typeof (statusCode) == 'number' ? statusCode : 200;

            // Use the payload returned from the handler, or set the default payload to an empty object
            payload = typeof (payload) == 'object' ? payload : {};

            // Convert the payload to a string
            var payloadString = JSON.stringify(payload);           
            res.end(payloadString);
            console.log('Query path ', paths);
        });

        }).on("error", (err) => {
            res.writeHead(400, {
                'Content-Type': 'application/json',
                'X-Powered-By': 'todaytech'
            });
            res.end(JSON.stringify('{"status":"-1","status_description":"The transaction failed: bad Request."}'))
        });
});

// this will be what handles client errors instead of breaking the node JS process
server.on("clientError", (err, socket) => {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

//this starts the server listening on port indicated on the port. 
server.listen(port, function () {
    console.log('The server has started well now, listening on port '+port);
});


var router = {
    'hello': handlers.hello,
    'read': handlers.read,
    'users': usershandlers.users,
    'tokens': tokenhandlers.tokens,
    'menu': menuhandlers.menu,
    'order': orderhandlers.order
};
