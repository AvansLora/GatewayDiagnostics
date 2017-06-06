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
                    Id          : count,
                    Username    : username,
                    Password    : password,
                    IsGateway   : false
                }
            );
            newUser.save(function(err){
                if(err) return callback(500, {"status": err});
                callback(200, {newUser});
            });
        });
    });
};

//setup bridge 
function setUserHardwareBridge(userId, hardwareId, callback){
    connectDatabase(parameters.UserRightsTable, parameters.UserRightsSchema, function(table){
        var newBridge = new table({
            UserId      : userId,
            HardwareId  : hardwareId
        });
        newBridge.save(function(err){
            if(err) return callback(500, {status:err});
            return callback(200);
        });
    });
};

//add gateway in gateway table
function addGateway(userId, gatewayName, callback){
    connectDatabase(parameters.GateWaysTable, parameters.GateWaysSchema, function(table){
        table.count({}, function(err, count){
            if(err) return callback(500,{"status":err});
            var newGateway = new table({
                HardwareId      : count,
                HardwareName    : gatewayName
            });
            newGateway.save(function(err){
                if(err) return callback(500, {status:err});
                setUserHardwareBridge(userId,count, function(status, message){
                    if(status !== 200)
                        return callback(status, message);
                    return callback(200, {
                        status  : "successful registered"
                    });
                });
            });
        });
    });
};

//add gateway in user schema, so gateway could login
function registerGateway(username, password, gatewayName, callback){
    connectDatabase(parameters.UsersTable,parameters.UsersSchema, function(table){
        table.count({}, function(err, count){
            var newGateway = new table({
                Id          : count,
                Username    : username,
                Password    : password,
                IsGateway   : true
            });
            newGateway.save(function(err){
                if(err) return callback(500, {"status":err});
                addGateway(count,gatewayName,callback);
            });
        }); 
    });
};

function authenticateUser(username, password, callback){
    connectDatabase(parameters.UsersTable,parameters.UsersSchema, function(table){
        table.find({Username: username, Password: password},function(err, data){
            if(err){console.log(err); return callback(false);}
            if(data.length == 0)
                return callback(false);    
            callback(true, data[0]);
        });
    });
};

function getHardwareId(userId, callback){
    connectDatabase(parameters.UserRightsTable,parameters.UserRightsSchema, function(table){
        table.find({UserId: userId}, function(err, data){
            if(err || data.length <= 0) callback(-1);
            callback(data[0].HardwareId);
        });
    });
};

//measurements:
//{"cputemp": 50, "casetemp":20, "humidity":70}
function saveMeasurement(hardwareId,measurements, callback){
    connectDatabase(parameters.MeasurementsTable,parameters.MeasurementsSchema, function(table){
        let newMeasurement = new table({
            HardwareId  : hardwareId,
            CPUTemp     : measurements.cputemp,
            CaseTemp    : measurements.casetemp,
            Humidity    : measurements.humidity
        });
        newMeasurement.save(function(err){
            if(err) return callback(500,{status: err});
            callback(200, {status:"successfull added"});
        });
    });
};


function addMeasurement(gatewayData, measuserments, callback){
    getHardwareId(gatewayData.Id, function(id){
        if(id < 0) return callback(401, {satus: "no gateway found"});
        saveMeasurement(id,measuserments, function(status, message){
           callback(status, message); 
        });
    });
};

module.exports = {
    registerUser,
    registerGateway,
    authenticateUser,
    addMeasurement
}