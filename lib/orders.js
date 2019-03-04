var _data = require('./data');
var _helpers = require('./helpers');
var _tokens = require('./tokens');

//These are the request handlers

var orderhandlers = {};

 

orderhandlers.order = function (data, callback) {
    var acceptedoperations = ['post', 'get','put'];
    if (acceptedoperations.indexOf(data.method) > -1) {
        console.log('this is the choosen method=', data.method);
        orderhandlers._order[data.method](data, callback);
    } else {
        callback(405);
    }
};
orderhandlers._order = {};
//this post method is used to pick the users order, charge payment and then send a receipt to email of user 
//then remove the order from the cart to confirm that its paid for and ready to ship
//@TODO later will need to add functionality to mark it as  paid for and not then accessible as a processing order. 
// for now we will just remove it from the system.
orderhandlers._order.post = function (data, callback) {
    var amount = 0;
    var emailaddress = typeof (data.payload.emailaddress) == 'string' &&
        data.payload.emailaddress.trim().length > 0 ? data.payload.emailaddress.trim() : false;
    var token = typeof (data.headers.token) == 'string' && data.headers.token.trim().length > 0 ? data.headers.token.trim() : false;
    if (emailaddress) {
        _tokens.verifyToken(token, emailaddress, function (isTokenValid) {
            if (isTokenValid) {
                _data.readFileData('orders', emailaddress, function (err, orderData) {
                    if (!err && orderData) {
                        //proceed to go trhough the orderData reading the amount and computing total as amount and then post it to stripes end point. 
                        _data.readFileData('orders', emailaddress, function (err, orderdata) {
                            if (!err && orderData) {
                                var orderArray = orderData.toString().split("\n");
                                orderArray.forEach(function (value) {
                                    if (value.length > 0) {
                                        amount += JSON.parse(value).menuCost;
                                        console.log('cumulative amount=',amount);
                                    }

                                });
                                if (amount > 0) {
                                    // call the stripe API and post the charge and see what we receive. 
                                    _helpers.chargePayments(emailaddress, amount, function (err,Code, PaymentData) {
                                        console.log('PaymentData=', err,Code, PaymentData);
                                        if (!err && PaymentData) {
                                            
                                            callback(Code,PaymentData)
                                        } else {
                                            //callback with failure
                                            callback(Code)
                                        }
                                    });

                                } else {
                                    callback(500, {'responseCode':'-9','responseMsg':'an error during computation of order'})
                                }
                            } else {
                                //error reading the order data for the supplied email address
                                console.log(err)
                            }
                        });

                    } else {

                        //unable to read data confirm err to user
                    }
                });
            } else {
                //token is invalid alert user that they need to log in again
                callback(500, { 'responseCode': '-89', 'responseMsg': 'invalid token provided' });
            }
        });
    } else {
        //invalid email address 
        callback(500, { 'responseCode': '-90', 'responseMsg': 'invalid email address.' });
    }

};


//this is for posting into owners shopping Cart
//put requires [orderid,menuid,validToken]
//The menuid posted by the frontend it currently assumed correct validation not done on it yet. 
//@TODO add menuid validation on the order. 
orderhandlers._order.put = function (data, callback) {
    console.log('PutOrder Data =', data);
    var quantity = typeof (data.payload.quantity) == 'number' &&
        data.payload.quantity > 0 ? data.payload.quantity : false;
    var emailaddress = typeof (data.payload.emailaddress) == 'string' &&
        data.payload.emailaddress.trim().length > 0 ? data.payload.emailaddress.trim() : false;
    var token = typeof (data.headers.token) == 'string' && data.headers.token.trim().length > 0 ? data.headers.token.trim() : false;
    var menuid = typeof (data.payload.menuid) == 'string' && data.payload.menuid.trim().length > 0 ? data.payload.menuid.trim() : false;
    var menucost = typeof (data.payload.menucost) == 'number' &&
        data.payload.menucost > 0 ? data.payload.menucost : false;
    if (emailaddress) {
        _tokens.verifyToken(token, emailaddress, function (isTokenValid) {
            console.log('tokenValid=', isTokenValid);
            if (isTokenValid) {
                // proceed since the token is valid
                _data.ReadData('orders', emailaddress, function (err, orderData) {
                    var orderItem = {
                        'OrderDate': Date.now().Date,
                        'menuItem': menuid,
                        'menuCost': menucost,
                        'quantity': quantity
                    };
                    if (!err && orderData) {
                        if (orderData.orderDate < Date.now().Date) {
                            //fail order because there is an existing unfufiled order
                            callback(304, { 'responseCode': '-9', 'responseMsg': 'The user has an existing unfulfilled order' })

                        } else {
                            _data.updateMenu('orders', emailaddress, orderItem, function (err) {
                                if (!err) {
                                    callback(200, { 'responseCode': '0', 'responseMsg': 'order was successfully placed' })
                                } else {
                                    callback(304, { 'responseCode': '-9', 'responseMsg': 'The order could not be placed' })
                                }
                            });

                        }
                    }
                    else {
                        //create a new order
                        
                            _data.updateMenu('orders', emailaddress, orderItem, function (err) {
                                if (!err) {
                                    callback(200, { 'responseCode': '0', 'responseMsg': 'order was successfully placed' })
                                } else {
                                    callback(304, { 'responseCode': '-9', 'responseMsg': 'The order could not be placed' })
                                }
                            });
                        
                    }
                });
            } else {
                callback(500, { 'responseCode': '-9', 'responseMsg': 'The supplied token is invalid' });
            }
        });
    } else {
        callback(500, { 'responseCode': '-9', 'responseMsg': 'The supplied email address seems invalid' });
    }

};
//an authenticated user can get order that belongs to them and see details
//requires a valid token and orderid and emailaddress
orderhandlers._order.get = function () {

};


module.exports = orderhandlers;