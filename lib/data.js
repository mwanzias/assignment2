//This is the collection of functions that are planned 
//to work on the file system.
var fs = require('fs');
var helpers = require('./helpers');
var path = require('path');
//container for library functions to write, read, to and froom files
var lib = {};
//obtain the data directory path 
lib.baseDir = path.join(__dirname, '/../data/');
//This is the function to update
lib.editUpdate = function (dir, filename, data, callback) {
    fs.open(lib.baseDir + dir + '/' + filename + '.json','r+', function (err, fileDescriptor)
    {
        if (!err && fileDescriptor) {

            var dataToWrite = JSON.stringify(data);

            fs.truncate(fileDescriptor, function (err) {
                if (!err) {
                    fs.writeFile(fileDescriptor, dataToWrite, function (err) {
                        if (!err) {
                            fs.close(fileDescriptor, function (err) {
                                if (!err) {
                                    callback(false);
                                } else {
                                    callback('error closing file');
                                }
                            });
                        } else {
                            callback('Error updating file');
                        }
                    });
                } else {
                    callback('error Truncating file.');
                }    
            });
        }
        else
        {
            callback('The file does not exists....');
        }
    });

};
//Function to write menu items to file. 
lib.updateMenu = function (dir, filename, data, callback) {   
            var dataToWrite = JSON.stringify(data)+'\n';
    fs.appendFile(lib.baseDir + dir + '/' + filename + '.json', dataToWrite, function (err)
    {                             
                     if (!err) {
                            callback(false);
                        } else {
                            callback('error appending data to file');
                        }
                 });  
};


//This is the function to delete
lib.delete = function (dir, filename, callback)
{
    //unlinking, meaning removing file from file system
    fs.unlink(lib.baseDir + dir + '/' + filename + '.json', function (err) {
        if (!err) {
            callback(false);
        } else {
            callback('The file could not be deleted');
        }
    });
 };

//This is the function to readData
lib.ReadData = function (dir, filename, callback) {
    fs.readFile(lib.baseDir + dir + '/' + filename + '.json', 'utf8', function (err, data) {
        if (!err && data) {
            var parsedData = helpers.jsonparser(data);
            callback(false, parsedData);
        } else {
            callback(err,data);
        }
        
    });
};


lib.readFileData = function (dir, filename, callback) {
    fs.readFile(lib.baseDir + dir + '/' + filename + '.json', 'utf8',
        function (err, fileData) {
            if (!err && fileData) {           
                callback(false,fileData);
        } else {
                callback(500,err);
        }

    });
};

//dir is the collection for which we are writing or creating the file into 
lib.create = function (dir, filename, data, callback) {
    //open the file for purposes of writing.
    fs.open(lib.baseDir + dir + '/' + filename + '.json', 'wx',
        function (err, fileDescriptor) {
            console.log('Error::' + err);
            if (!err && fileDescriptor) {
                var stringToWrite = JSON.stringify(data);
                fs.writeFile(fileDescriptor, stringToWrite, function (err) {
                    if (!err) {
                        callback(false);
                    } else {
                        callback('Error writing to new file::' + err);
                    }
                });
            } else {
                callback('could not create new file, it may already exists');
            }
        });


};

module.exports = lib;