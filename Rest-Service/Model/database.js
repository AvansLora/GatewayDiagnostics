var mongoose = require('mongoose');

//database tables:
var UsersTable          = 'Users';
var UserRightsTable     = 'UserRights';
var GateWaysTable       = 'Gateways';
var MeasurementsTable   = 'Measurements';

var UsersSchema = new mongoose.Schema({
    UserId              : Number,
    Username            : String,
    Password            : String,
    IsAdmin             : Boolean 
});

var UserRightsSchema = new mongoose.Schema({
    UserId              : Number,
    HardwareId          : Number
});

var GateWaysSchema = new mongoose.Schema({
    HardwareId          : Number,
    HardwareName        : String
});

var MeasurementsSchema = new mongoose.Schema({
    DateTime            : {type: Date, default: Date.now},
    CPUTemp             : Number,
    CaseTemp            : Number,
    Humidity            : Number
});

function connectDatabase(table, schema, callback){
    var table = mongoose.model(table, schema);
    if(mongoose.connection.readyState == 1) return callback(table);

    mongoose.connect('mongodb://localhost/GateWayDiagnostics');
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connections error:'));
    db.once('open', function(){callback(table);});
}

function registerUser(username, password, hardwareId, callback){
    connectDatabase(UsersTable,UsersSchema, function(table){
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
    connectDatabase(UsersTable,UsersSchema, function(table){
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