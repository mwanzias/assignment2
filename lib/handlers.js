var _data = require('./data');
var _helpers = require('./helpers');
//These are the request handlers

var handlers = {};

handlers.hello = function (data, callback) {
    console.log('This is the data received. ' + data);
    var ret = JSON.stringify(data);
    _data.create('test', 'mwanzias', data, function (err) {
        console.log('This was the error: ' + err);
        if (!err) {
            callback(200, ret);
        } else {
            callback(403, ret);
        }
    });

};
handlers.read = function (data, callback) {
    console.log('We are now reading data ' + data);
    _data.ReadData('test', 'mwanzias', function (err, data) {
        console.log('This was the error: ' + err);
        if (!err) {
            callback(200, data);
        } else {
            callback(403);
        }
    });

};
handlers.notFound = function (data, callback) {
    callback(404, '{"status":"-1","status_description":"The path is off"}');
};

module.exports = handlers;
