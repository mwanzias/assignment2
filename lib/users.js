var _data = require('./data');
var _helpers = require('./helpers');
var _tokens = require('./tokens');
//These are the request handlers

var usershandlers = {};

usershandlers.users = function (data, callback) {
    var acceptedoperations = ['post', 'get', 'put', 'delete'];
    if (acceptedoperations.indexOf(data.method) > -1) {
        usershandlers._users[data.method](data, callback);
    } else {
        callback(405);
    }
};


usershandlers._users = {};
//users post accepts data to create them
//required fields are emailaddress, name, street address, 
//The email address will be used as the key for each user.

//authorization and authentication to be worked on after tokens.
    usershandlers._users.post = function (data, callback) {
    console.log('This is the post data', typeof (data));

    //read token data from the headers and then check if it is valid. 


    var name = typeof (data.payload.name) == 'string' && data.payload.name.trim().length > 0 ? data.payload.name : false;
    var emailaddress = typeof (data.payload.emailAddress) == 'string' && data.payload.emailAddress.trim().length > 0 ? data.payload.emailAddress : false;
    var userPassword = typeof (data.payload.userPassword) == 'string' && data.payload.userPassword.trim().length > 0 ? data.payload.userPassword : false;
    var streetAddress = typeof (data.payload.streetAddress) == 'string' && data.payload.streetAddress.trim().length > 0 ? data.payload.streetAddress : false;
    var termsAgreement = typeof (data.payload.termsAgreement) == 'boolean' && data.payload.termsAgreement == true ? true : false;

    var token = typeof (data.headers.token) == 'string'
        && data.headers.token.trim().length > 0 ? data.headers.token.trim() : false;
        //we do not validate tokens for signing up.
        
            if (termsAgreement && streetAddress &&
                emailaddress && name && userPassword) {
                //email address will be the unique one so we need to make certain that the email address does not exists. 
                //make sure no file called this email adress exists before creating the file. 
                _data.ReadData('users', emailaddress, function (err, userData) {
                    //if error it means user does not exists already, else user exists.
                    if (err) {
                        //go ahead and create user. 
                        _hashedPassword = _helpers.hash(userPassword);
                        //continue only when the password has been hashed and received back. 
                        //if it fails we return an error on the call back
                        if (_hashedPassword) {
                            var userCreateObject = {
                                'name': name,
                                'emailaddress': emailaddress,
                                'userPassword': userPassword,
                                'streetAddress': streetAddress,
                                'termsAgreement': true
                            }
                            _data.create('users', emailaddress, userCreateObject, function (err) {
                                if (!err) {
                                    callback(200, { 'Code': '0', 'Message': 'User Created successfully.' })
                                } else {
                                    callback(500, { 'Code': '-1', 'Message': 'user Creation failed' })
                                }
                            });

                        } else {
                            callback(500, { 'Code': '-4', 'Message': 'Password encryption failed.' })
                        }

                    } else {
                        callback(400, { 'Code': '-3', 'Error': 'User with this emailaddress already exists' })
                    }

                });
            } else {
                callback(400, { 'Code': '-2', 'Error': 'Missing required fields' });
            }
       

   



};
//handler to delete users
    usershandlers._users.delete = function (data, callback) {
    var emailaddress = typeof (data.payload.emailAddress) == 'string' && data.payload.emailAddress.trim().length > 0 ? data.payload.emailAddress.trim() : false;
    if (emailaddress) {
        var token = typeof (data.headers.token) == 'string'
            && data.headers.token.trim().length > 0 ? data.headers.token.trim() : false;
        _tokens.verifyToken(token, emailaddress, function (isTokenValid) {
            if (isTokenValid) {
                _data.delete('users', emailaddress, function (err) {
                    if (err) {
                        callback(500, { 'responseCode': '-6', 'responseMsg': 'We could not delete user' })
                    } else {
                        callback(400, { 'responseCode': '0', 'responseMsg': 'The user has been successfully deleted' })
                    }
                });
            } else {
                callback(403, { 'responseCode': '-9', 'responseMsg': 'The token provided is invalid' })
            }

        });
                    

    } else {
        callback(400, { 'responseCode': '-5', 'responseMsg': 'The user email address is not found in the body.' })
    }

    

};
    //this handler does update users 
    //Require Data = [emailAddress, OPtional Data : password,   name,streetAddres, termsAgreement]
    //atleast one of the optionals need be present.
    usershandlers._users.put = function (data, callback) {
        console.log('shared data=', data);
        var token = typeof (data.headers.token) == 'string'
            && data.headers.token.trim().length > 0 ? data.headers.token.trim() : false;

        var emailaddress = typeof (data.payload.emailaddress)
            && data.payload.emailaddress.trim().length > 0 ? data.payload.emailaddress.trim() : false;


        if (emailaddress) {

            _tokens.verifyToken(token, emailaddress,
                function (isTokenValid) {
                    if (isTokenValid) {

                        var name = typeof (data.payload.name) == 'string' && data.payload.name.trim().length > 0 ? data.payload.name : false;
                        var userPassword = typeof (data.payload.userPassword) == 'string' && data.payload.userPassword.trim().length > 0 ? data.payload.userPassword : false;
                        var streetAddress = typeof (data.payload.streetAddress) == 'string' && data.payload.streetAddress.trim().length > 0 ? data.payload.streetAddress : false;
                        var termsAgreement = typeof (data.payload.termsAgreement) == 'boolean' && data.payload.termsAgreement == true ? true : false;
                        //error if nothing is set to be updated
                        if (name || userPassword || streetAddress || termsAgreement) {
                            _data.ReadData('users', emailaddress, function (err, userData) {
                                if (!err && userData) {
                                    //update the necesary fields. 
                                    if (name) {
                                        userData.name = name;
                                    }
                                    if (userPassword) {
                                        userData.userPassword = _helpers.hash(userPassword);
                                    }
                                    if (streetAddress) {
                                        userData.streetAddress = streetAddress;
                                    }
                                    if (termsAgreement) {
                                        userData.termsAgreement = termsAgreement;
                                    }
                                    _data.editUpdate('users', emailaddress, userData, function (err) {
                                        if (!err) {
                                            callback(200, { 'responseCode': '200', 'responseMsg': 'The data update was correct.' })
                                        } else {
                                            callback(500, { 'responseCode': '500', 'responseMsg': 'There was an error updating the user data.' })
                                        }
                                    });

                                } else {
                                    callback(404, { 'responseCode': '-11', 'responseMsg': 'user seems to be absent.' })
                                }
                            });


                        }
                        else {
                            callback(402, { 'responseCode': '-10', 'responseMsg': 'one field to edit is required.' })
                        }
                    } else {
                        callback(403, { 'responseCode': '', 'responseMsg': 'The token provided is invalid.' })
                    }
                });


        } else {
            callback(404, { 'responseCode': '-9', 'responseMsg': 'The email address does not exists.' })
        }


    };
    //this one gets details about a certain user.
    //required data [emailaddress] 
    //@ only authenticated users can get details for a user or themselves. 
    usershandlers._users.get = function (data, callback) {
        console.log('shared data=', data);
        var emailaddress = typeof (data.queryStringObject.emailaddress)
            && data.queryStringObject.emailaddress.trim().length > 0 ? data.queryStringObject.emailaddress.trim() : false;

        var token = typeof (data.headers.token) == 'string' && data.headers.token.trim().length > 0 ? data.headers.token.trim() : false;
        if (emailaddress) {

            _tokens.verifyToken(token, emailaddress,
                function (isTokenValid) {
                    if (isTokenValid) {
                        _data.ReadData('users', emailaddress, function (err, fileData) {
                            console.log('fileData =', fileData);
                            if (!err && fileData) {
                                delete fileData.userPassword;
                                callback(200, fileData);
                            } else {
                                callback(404, { 'responseCode': '-2', 'responseMsg': 'The user data cannot be found.' });
                            }

                        });
                    } else {
                        callback(403, { 'responseCode': '-9', 'responseMsg': 'The token provided is invalid' })
                    }
                });
        } else {
            callback(404, { 'Error': 'The email address is not present' })
        }

        console.log(data);
    };


usershandlers.notFound = function (data, callback) {
    callback(404, '{"status":"-1","status_description":"The path is off"}');
};

module.exports = usershandlers;