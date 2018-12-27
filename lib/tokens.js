var _data = require('./data');
var _helpers = require('./helpers');

//These are the request handlers

var tokenhandlers = {};


// global token handling function
tokenhandlers.tokens = function (data, callback) {
    var acceptedoperations = ['post', 'get', 'put', 'delete'];

    if (acceptedoperations.indexOf(data.method) > -1) {
        tokenhandlers._tokens[data.method](data, callback);
    } else {
        callback(405);
    }
};

tokenhandlers.verifyToken = function (id, emailaddress, callback) {
    _data.ReadData('tokens', id, function (err, tokenData) {
        if (!err && tokenData) {
            if (tokenData.emailAddress == emailaddress && tokenData.expires > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false)
        }
    });


};

tokenhandlers._tokens = {};
//required data [emailaddress and userpassword]
//no optional data email and password used to verify the requesting user
tokenhandlers._tokens.post = function (data, callback) {

    var emailaddress = typeof (data.payload.emailAddress) == 'string' && data.payload.emailAddress.trim().length > 0 ? data.payload.emailAddress : false;
    var userPassword = typeof (data.payload.userPassword) == 'string' && data.payload.userPassword.trim().length > 0 ? data.payload.userPassword : false;
    if (emailaddress && userPassword) {
        //get user details  to verify existence and then if exists 
        //create a token for them 
        _data.ReadData('users', emailaddress, function (err, userData) {
            if (!err && userData) {
                //hash the supplied password and compare it with the existing password
                var _newhashPasword = _helpers.hash(userPassword);
                if (_newhashPasword == userData.userPassword) {
                    //create a new token with random string, with a expire date 2 hours later
                    var tokenID = _helpers.createRandomString(20);
                    var expires = Date.now() + 1000 * 60 * 60 * 2; //2 hours later

                    var tokenToDisk = {
                        'emailAddress': emailaddress,
                        'id': tokenID,
                        'expires': expires
                    };
                    _data.create('tokens', tokenID, tokenToDisk, function (err) {
                        if (!err) {
                            console.log('token to Disk = ', tokenToDisk);
                            callback(200, tokenToDisk);
                        } else {
                            callback(500, { 'responseCode': '-1', 'responseMsg': 'Error Creating Token' })
                        }
                    });

                } else {
                    callback(400, { 'responseCode': '-5', 'responseMsg': 'Password does not match any stored user' })
                }

            }
            else {
                callback(404, { 'responseCode': '', 'responseMsg': 'The email and password do not exists' })
            }
        });

    } else {
        callback(404, { 'responseCode': '-9', 'responseMsg': 'Email Address and Password not set' })
    }
};
//helps extend the token expiration by 1 hour
//required fields are [emailAddress, extend true, userpassword]
tokenhandlers._tokens.put = function (data, callback) {
    var emailaddress = typeof (data.payload.emailAddress) == 'string' && data.payload.emailAddress.trim().length > 0 ? data.payload.emailAddress : false;
    var userPassword = typeof (data.payload.userPassword) == 'string' && data.payload.userPassword.trim().length > 0 ? data.payload.userPassword : false;
    var tokenID = typeof (data.payload.id) == 'string' && data.payload.id.trim().length > 0 ? data.payload.id : false;
    var extend = typeof (data.payload.extend) == 'boolean' ? data.payload.extend : false;
    if (emailaddress && userPassword && tokenID && extend) {
        _data.ReadData('users', emailaddress, function (err, userData) {
            if (!err && userData) {
                var _authhashed = _helpers.hash(userPassword);
                if (_authhashed == userData.userPassword) {
                    _data.ReadData('tokens', tokenID, function (err, tokenData) {
                        if (!err && tokenData) {
                            tokenData.expires = Date.now() * 1000 * 60 * 60;
                            _data.editUpdate('tokens', tokenID, tokenData, function (err) {
                                if (!err) {
                                    callback(200, tokenData)
                                } else {
                                    callback(500, { 'responseCode': '-9', 'responseMsg': 'Internal error Occured' })
                                }
                            });
                        } else {
                            callback(400, { 'responseCode': '-9', 'responseMsg': 'Missing token Data' })
                        }
                    });
                } else {
                    callback(403, { 'responseCode': '-89', 'responseMsg': 'The user authentication failed' })
                }


            } else {
                callback(400, { 'responseCode': '-9', 'responseMsg': 'missing data realised' })
            }

        });

    } else {
        callback(404, { 'responseCode': '', 'responseMsg': 'some required fields are required.' })
    }

};
tokenhandlers._tokens.get = function (data, callback) {
    var tokenid = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length > 0 ? data.queryStringObject.id.trim() : false;
    if (tokenid) {
        _data.ReadData('tokens', tokenid, function (err, tokenData) {
            if (!err && tokenData) {
                callback(200, tokenData);
            } else {
                callback(404, { 'responseCode': '-4', 'responseMsg': 'getting token data failed' });
            }
        });

    } else {
        callback(404, { 'responseCode': '-1', 'responseMsg': 'The requests misses some required fields' })
    }
};
tokenhandlers._tokens.delete = function (data, callback) {
    var tokenID = typeof (data.payload.id) == 'string' && data.payload.id.trim().length > 0 ? data.payload.id.trim() : false;
    var emailAddress = typeof (data.payload.emailAddress) == 'string' && data.payload.emailAddress.trim().length > 0 ? data.payload.emailAddress.trim() : false;
    var userPassword = typeof (data.payload.userPassword) == 'string' && data.payload.userPassword.trim().length > 0 ? data.payload.userPassword.trim() : false;
    if (emailAddress && tokenID && userPassword) {
        _data.ReadData('users', emailAddress, function (err, userData) {
            if (!err && userData) {
                var _hashedentrypass = _helpers.hash(userPassword);
                if (_hashedentrypass == userData.userPassword) {
                    _data.delete('tokens', tokenID, function (err) {
                        if (err) {
                            callback(500, { 'responseCode': '-6', 'responseMsg': 'We could not delete token' })
                        } else {
                            callback(400, { 'responseCode': '0', 'responseMsg': 'The token has been successfully deleted' })
                        }
                    });

                } else {
                    callback(403, { 'responseCode': '-9', 'responseMsg': 'Not authorised to access: password does not match' });
                }
            } else {
                //user could not be found
                callback(403, { 'responseCode': '-9', 'responseMsg': 'Not authorised to access: password does not match' });
            }

        });
    } else {
        callback(400, { 'responseCode': '-5', 'responseMsg': 'The user email address is not found in the body.' })
    }

};

tokenhandlers.notFound = function (data, callback) {
    callback(404, '{"status":"-1","status_description":"The path is off"}');
};

module.exports = tokenhandlers;
