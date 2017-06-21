"use strict";
var mongoose    = require('mongoose');
var db          = require('./mongoose');
var encryption  = require('./encryption');

module.exports = {
    registerGateway,
    addMeasurement,
    getLastMeasurement,
    getAllMeasurements
};

//add gateway in user schema, so gateway could login
function registerGateway(username, password, gatewayName, callback){
    if(username == password) return callback(400,{status:"username & password are equal"});
    if(username.length < 4 || password.length < 4)return callback(400,{status:"username / password too short"});
    var encryptedPass = encryption.encryptPassword(password);
    db.connectDatabase(db.UsersTable,db.UsersSchema, function(table){
        table.count({}, function(err, count){
            var newGateway = new table({
                Id          : count,
                Username    : username,
                Password    : encryptedPass,
                IsGateway   : true
            });
            newGateway.save(function(err){
                if(err) return callback(500, {"status":err});
                addGateway(count,gatewayName,callback);
            });
        }); 
    });
}

function addMeasurement(gatewayData, measuserments, callback){
    getHardwareId(gatewayData.Id, function(id){
        if(id < 0) return callback(401, {satus: "no gateway found"});
        saveMeasurement(id,measuserments, function(status, message){
           callback(status, message); 
        });
    });
}

//add gateway in gateway table
function addGateway(userId, gatewayName, callback){
    db.connectDatabase(db.GateWaysTable, db.GateWaysSchema, function(table){
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
}

//measurements:
//{"cputemp": 50, "casetemp":20, "humidity":70}
function saveMeasurement(hardwareId,measurements, callback){
    if(!measurements.cputemp || !measurements.casetemp || !measurements.humidity)
        return callback(401, {status: "missing measurements"});
        
    db.connectDatabase(db.MeasurementsTable,db.MeasurementsSchema, function(table){
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
}

function getHardwareId(userId, callback){
    db.connectDatabase(db.UserRightsTable,db.UserRightsSchema, function(table){
        table.find({UserId: userId}, function(err, data){
            if(err || data.length <= 0) return callback(-1);
            callback(data[0].HardwareId);
        });
    });
}

//setup bridge 
function setUserHardwareBridge(userId, hardwareId, callback){
    db.connectDatabase(db.UserRightsTable, db.UserRightsSchema, function(table){
        var newBridge = new table({
            UserId      : userId,
            HardwareId  : hardwareId
        });
        newBridge.save(function(err){
            if(err) return callback(500, {status:err});
            return callback(200);
        });
    });
}

function getLastMeasurement(hardwareId, callback){
    db.connectDatabase(db.MeasurementsTable, db.MeasurementsSchema, function(table){
       table.find({HardwareId: hardwareId},{},
       {
           skip:0,
           limit:1,
           sort:{
               DateTime:-1
           }
       },function(err, data){
           console.log(data);
           if(err || data.length == 0) return callback(400, {status:"no measurements yet"});
           callback(200, data[0]);
       });
    }); 
}

function getAllMeasurements(hardwareId, callback){
    db.connectDatabase(db.MeasurementsTable, db.MeasurementsSchema, function(table){
        table.find({HardwareId: hardwareId}, function(err, data){
            if(err) return callback(400, {status: err});
            return callback(200, data);
        });
    });
}