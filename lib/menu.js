var _data = require('./data');
var _helpers = require('./helpers');
var fs = require('fs');
var _tokens = require('./tokens');

//These are the request handlers

var menuhandlers = {};


menuhandlers.menu = function (data, callback) {
    var acceptedoperations = ['post', 'get', 'put', 'delete'];
    if (acceptedoperations.indexOf(data.method) > -1) {
        menuhandlers._menu[data.method](data, callback);
    } else {
        callback(405);
    }
};


menuhandlers._menu = {};

//this is used to create menu items by the administrator type of user
//@TODO later to enable checking of a menuID if it is exists or not
//post requires [title, usertoken,emailaddress , menucost,menuid,menudescription.]
menuhandlers._menu.post = function (data, callback) {
    console.log('menu post data ==', data.payload);
    var emailaddress = typeof (data.payload.emailaddress) == 'string' && data.payload.emailaddress.trim().length > 0 ? data.payload.emailaddress.trim() : false;
    console.log('emailaddress=', data.payload.emailaddress.trim().length);
    var menucost = typeof (data.payload.menucost) == 'number' && data.payload.menucost > 0 ? data.payload.menucost : false;
    var menuid = typeof (data.payload.menuid) == 'string' && data.payload.menuid.trim().length > 0 ? data.payload.menuid.trim() : false;
    var menudescription = typeof (data.payload.menudescription) == 'string' && data.payload.menudescription.trim().Length > 0 ? data.payload.menudescription.trim() : false;
    var usertype = typeof (data.payload.usertype) == 'string' && data.payload.usertype.trim().length > 0 &&
        data.payload.usertype.trim() == 'admin' ? true : false;
    var tokenid = typeof (data.headers.token) == 'string' && data.headers.token.trim().length > 0 ? data.headers.token.trim() : false;
    _data.ReadData('users', emailaddress, function (err, userData) {
        console.log('users==menu=', err);
        if (!err && userData) {
            _tokens.verifyToken(tokenid, emailaddress, function (isTokenValid) {
                var menuToCreate = {
                    'menucost': menucost,
                    'menuid': menuid,
                    'menudescription': menudescription,
                    'menucreator': emailaddress
                };
                _data.updateMenu('menu', 'menus', menuToCreate, function (err) {
                    console.log('create menu error.=', err)
                    if (!err) {
                        callback(200, {'responseCode':'0','responseMsg':'Menu item created successfully'})
                    } else {
                        callback(500, {'responseCode':'-9','responseMsg':'Failed to Create Menu'})
                    }
                });
               
            });
        } else {
            //user does not exists hence we cannot create menu. 
            callback(404, {'responseCode':'-9','responseMsg':'user does not exists'})
        }
    });
    

};
//this gets the menu items as a list in order to display to for ordering. 
//requires a valid token and that is all.
menuhandlers._menu.get = function (data,callback) {
    var token = typeof (data.headers.token) == 'string' && data.headers.token.trim().length > 0 ? data.headers.token.trim() : false;
    var emailaddress = typeof (data.queryStringObject.emailaddress) == 'string' && data.queryStringObject.emailaddress.trim().length > 0 ? data.queryStringObject.emailaddress.trim() : false;
    _data.ReadData('users', emailaddress, function (err, userData) {
        if (!err && userData) {
            _tokens.verifyToken(token, emailaddress, function (isTokenValid) {
                if (isTokenValid) {
                    _data.readFileData('menu', 'menus', function (err, menuData) {
                        console.log('Menuread..', err, typeof (menuData), menuData)
                        if (!err && menuData) {
                            callback(false, { 'data': '[' + menuData + ']' });
                        }
                        else {
                            callback(err, {'responseCode':'500','responseMsg':'unable to read menu file'})
                        }
                    });
                    
                } else {
                    callback(403, {'responseCode':'-15','responseMsg':'The token provided is invalid'})
                }
            });
        } else {
            callback(404, {'responseCode':'-10','responseMsg':'user could not be found'})
        }

    });  


};
//the admin type user can edit existing menu items. 
//to be implemented later to be able to edit menu items
menuhandlers._menu.put = function () {

};
//the admin user can delete a menu item in the event that they need to remove 
//requires [menuid,validtoken]
menuhandlers._menu.delete = function () {

};

menuhandlers.notFound = function (data, callback) {
    callback(404, '{"status":"-1","status_description":"The path is off"}');
};
module.exports = menuhandlers;