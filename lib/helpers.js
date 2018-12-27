// these are utilities for various tasks within the application. 

//dependencies 
var fs = require('fs');
var crypto = require('crypto');
var querystring = require('querystring');
var https = require('https');
var config = require('./config');
var helpers = {};

//receives a string and parses to a json object. 
//This happens without throwing. 
helpers.jsonparser = function (str) {
    try {
        console.log('String to Json fy==', str);
        var obj = JSON.parse(str);
        console.log('This is the object to return ', obj);
        return obj;
    } catch (e) {
        console.log('error=>',e)
        return {};
    }
};
//creates string of random alphanumeric string of length X
helpers.createRandomString = function (strLength) {
    var stringLength = typeof (strLength) == 'number' && strLength > 0 ? strLength : false;
    if (stringLength) {
        //define all possible characters.
        var possibleCharacters = 'abcdefghijklmnopqrstuvwx0123456789';
        var str = '';
        for (i = 1; i < stringLength; i++) {
            //get a possible character from the possibleCharacters and append this to the str.
            var randomchar = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
            str += randomchar;  
        }     
        return str;
    } else {
        return false;
    }

};

//verify that the token id belongs to a certain user

//this is the utility function to hash password
helpers.hash = function (data) {
    if (typeof (data) == 'string' && data.length > 0) {
        var hash = crypto.createHash('sha256', config.hashsecret).update(data).digest('hex');
        return hash;
    } else {
        return false;
    }
};

var sendReceipt = function (emailaddress, amount, callback) {
    var emailaddress = typeof (emailaddress) == 'string' && emailaddress.trim().length ? emailaddress.trim() : false;
    var amount = typeof (amount) == 'number' && amount > 0 ? amount : false;
    if (amount && emailaddress) {
        //this is the payload we will send to stripe
        var payload =
        {

            'from': 'Excited User < postmaster@sandboxf7ce55c69e304a6eae978a98432af638.mailgun.org>',
            'subject': 'Payment Receipt',
            'text': 'We are glad to inform you that your payment for $' + amount + '. has been received. \n with thanks',
            'to': emailaddress
        };
        //string fy the same and configure the request details 

        var stringpayload = querystring.stringify(payload);



        var request_details = {
            'protocol': 'https:',
            'hostname': 'api.mailgun.net',
            'method': 'POST',
            'path': '/v3/sandboxf7ce55c69e304a6eae978a98432af638.mailgun.org',
            'headers': {
                'api': '2057190f755313ffd339d57a44370b02-41a2adb4-edb34080',
                'Content-Length': Buffer.byteLength(stringpayload),
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        //create a request object and dispatch the above. 

        var request = https.request(request_details, function (res) {
            var status = res.statusCode;
            console.log('status=', status);
            var headers = res.headers || {};
            console.log('mail sending headers: ', headers);
            //obtain the request id as follows
            res.setEncoding('utf8');
            var responseData = '';
            //on data receive chunks of the data till it is all reveived then fire the end listener
            res.on('data', function (received) {
                responseData += received;
            });
            //this is executed when the response is finally received in totallity. 
            //afew fields are exposed to through the API but more can be exposed if needed. 
            res.on('end', function () {
                //var jsonres = JSON.parse(responseData);
                console.log('Mailsending jsonres==', responseData);
                //respond with false error if the status is 200 and true if status is otherwise
                callback(status == 200 ? false : true, status);
            });



        });
        //if request has an error instead of throwing error provide a call back with the error.
        request.on('error', function (e) {
            callback(e)
        });

        request.write(stringpayload);
        //dispatch the request object now. 
        request.end();
        //bind to error event so it does not kill the thread.

    } else {
        callback(false, 'Email Address is invalid');
    }

};


helpers.chargePayments = function (emailaddress, amount, callback) {
    var emailaddress = typeof (emailaddress) == 'string' && emailaddress.trim().length ? emailaddress.trim() : false;
    var amount = typeof (amount) == 'number' && amount > 0 ? amount : false;
    if (amount && emailaddress) {
        //this is the payload we will send to stripe
        var payload =
        {
            
            'amount': amount,
            'currency': 'usd',
            'source': 'tok_visa',
            'receipt_email': emailaddress
        };
        //string fy the same and configure the request details 

        var stringpayload = querystring.stringify(payload);

       

        var request_details = {
            'protocol': 'https:',
            'hostname': 'api.stripe.com',
            'method': 'POST',               
            'path': '/v1/charges',        
            'headers': {             
                'Authorization': 'Bearer sk_test_LgBQGVPAeZA7IQLXN8ZecR4Q',
                'Content-Length': Buffer.byteLength(stringpayload),
                'Accept': 'application/json',                
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        //create a request object and dispatch the above. 
        
        var request = https.request(request_details, function (res) {
            var status = res.statusCode;
            var headers = res.headers || {};
            var request_id = headers['request-id'];
            //obtain the request id as follows
            res.setEncoding('utf8');
            var responseData = '';
            //on data receive chunks of the data till it is all reveived then fire the end listener
            res.on('data', function (received) {
                responseData += received;
            });
            //this is executed when the response is finally received in totallity. 
            //afew fields are exposed to through the API but more can be exposed if needed. 
            res.on('end', function () {               
                var jsonres = JSON.parse(responseData);
                console.log('jsonres==', jsonres);
                //respond with false error if the status is 200 and true if status is otherwise
                 sendReceipt(emailaddress, amount, function (err) {
                    console.log('Email sending ', err);
                });

                callback(status == 200 ? false : true, status, { 'request_id': request_id, 'amount': jsonres.amount, 'status': jsonres.status, 'currency': jsonres.currency });
            });
           

            
        });
        //if request has an error instead of throwing error provide a call back with the error.
        request.on('error', function (e) {
            callback(e)
        });

        request.write(stringpayload);
        //dispatch the request object now. 
        request.end();
        //bind to error event so it does not kill the thread.
        
    } else {
        callback(false, 'Email Address is invalid');
    }
};




module.exports = helpers;