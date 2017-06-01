var mongoose = require('mongoose');
var parameters = require('./mongoose');

function connectDatabase(table, schema, callback){
    var table = mongoose.model(table, schema);
    if(mongoose.connection.readyState == 1) return callback(table);

    mongoose.connect(parameters.dbLocation);
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connections error:'));
    db.once('open', function(){callback(table);});
}

function registerUser(username, password, hardwareId, callback){
    connectDatabase(parameters.UsersTable,parameters.UsersSchema, function(table){
        table.count({}, function(err, count){
            var newUser = new table(
                {
                    UserId      : count,
                    Username    : username,
                    Password    : password,
                    isAdmin     : true
                }
            );
            newUser.save(function(err){
                if(err) return callback(500, {"status": err});
                callback(200, {newUser});
            });
        });
    });
}

function authenticateUser(username, password, callback){
    connectDatabase(parameters.UsersTable,parameters.UsersSchema, function(table){
        table.find({Username: username, Password: password},function(err, data){
            if(err){console.log(err); return callback(false);}
            if(data.length > 0)
                return callback(true, data[0]);
            callback(false);
        });
    });
}

function addMeasurement(hardwareId, measurements, callback){

    callback(200, {status:"measurement added"});
}

function getMeasurements(hardwareId, callback){
    callback(200, {temp:"28"});
}

module.exports = {
    registerUser,
    authenticateUser,
    addMeasurement, 
    getMeasurements
}