"use strict";
var mongoose    = require('mongoose');
var db          = require('./mongoose');
var encryption  = require('./encryption');

module.exports = {
  registerUser,
  authenticateUser,
  checkUsername,
  addUserRight,
  getGateways,
  getAllGateways
};

function registerUser(username, password, callback){
    var encryptedPass = encryption.encryptPassword(password);
    db.connectDatabase(db.UsersTable, db.UsersSchema, function(table){
        table.count({},function(err, count){
            if(err) return callback(500, {status:"database error"});

            var newUser = new table({
                Id          : count,
                Username    : username,
                Password    : encryptedPass,
                IsGateway   : false
            });
            newUser.save(function(err){
                if(err) return callback(500, {status: err});
                return callback(200, {status: "succesfull registered"});
            });
        });
    });
}

function authenticateUser(username, password, callback){
    db.connectDatabase(db.UsersTable,db.UsersSchema, function(table){
        table.find({Username: username},function(err, data){
            if(err){console.log(err); return callback(false);}
            if(data.length == 0)
                return callback(false);
            if(encryption.comparePassword(password,data[0].Password))        
                return callback(true, data[0]);
            return callback(false);
        });
    });
}

//returns amount of users
function checkUsername(username, callback){
    db.connectDatabase(db.UsersTable,db.UsersSchema, function(table){
        table.find({Username: username},function(err, data){
           if(err) return callback(-1);
           callback(data.length); 
        });
    });
}

function addUserRight(userdata, gwUsername, gwPassword, callback){
    checkGateway(gwUsername,gwPassword, function(gatewayData){
        if(!gatewayData) return  callback(400,{status:"unknown gateway, or incorrect password"});
        getGateWayId(gatewayData, function(hardwareId){
            console.log("inside: " + hardwareId);
            if(hardwareId == undefined) return callback(500, {status:"could not find gateway"});
            addUserRightRow(userdata.Id,hardwareId,function(err){
                if(err) return callback(400, err);
                callback(200, {status: "succesfull added gateway to user"});
            });
        });
    });
}

function addUserRightRow(userId, hardwareId,callback){
    db.connectDatabase(db.UserRightsTable,db.UserRightsSchema, function(table){
        table.find({UserId:userId,HardwareId:hardwareId},function(err,data){
            if(data.length > 0) return callback({status:"already access to gateway"});

            var newUserRight = new table({
                UserId:userId,
                HardwareId: hardwareId
            });
            newUserRight.save(function(err){
                if(err) return callback(err);
                callback();
            });
        });
    });
}

function getGateWayId(gatewayUserData, callback){
    db.connectDatabase(db.UserRightsTable, db.UserRightsSchema, function(table){
        table.find({UserId: gatewayUserData.Id}, function(err, data){
            if(err || data.length <= 0) return callback();

            callback(data[0].HardwareId);
        });
    });
}

function checkGateway(gwUsername, gwPassword, callback){
    db.connectDatabase(db.UsersTable, db.UsersSchema, function(table){
        table.find({Username: gwUsername}, function(err, data){
            if(err || data.length <= 0 ) return callback();

            if(encryption.comparePassword(gwPassword, data[0].Password))
                return callback(data[0]);
            callback();
        });
    });
}

function getGateways(userdata, callback){
    db.connectDatabase(db.UserRightsTable,db.UserRightsSchema, function(table){
        table.find({UserId: userdata.Id}, function(err, data){
            if(err) return callback(500, {status: err});
            if(data.length <= 0) return callback(401, {status:"no gateways available"});
            listGateway(data,function(status, data){
                return callback(status, data);
            });
        });
    });
}

function listGateway(hardwareIds, callback){
    let gateways = [];
    db.connectDatabase(db.GateWaysTable, db.GateWaysSchema, function(table){
        table.find({}, function(err,data){
            for(let i = 0; i < hardwareIds.length; i ++){
                let toFind = hardwareIds[i].HardwareId;
                for(let j = 0; j < data.length; j++){
                    if(toFind == data[j].HardwareId)
                        gateways.push(data[j]);
                }
            }
            callback(200, {gateways});
        });
    });
}

function getAllGateways(callback) {
  const gateways = [];
  const combined = {
    'Id': '',
    'Username': '',
    'HardwareId': '',
    'HardwareName': ''
  };
  
  db.connectDatabase(db.UserRightsTable, db.UserRightsSchema, function (table) {
    table.find({}, function (err, userRights) {
      if (err) {
        if (callback) callback(500, gateways);
        console.log(err);
      }

      db.connectDatabase(db.GateWaysTable, db.GateWaysSchema, function (table) {
        table.find({}, function (err, gatewaysList) {
          if (err) {
            if (callback) callback(500, gateways);
            console.log(err);
          }

          db.connectDatabase(db.UsersTable, db.UsersSchema, function (table) {
            table.find({}, function (err, users) {
              if (err) {
                if (callback) callback(500, gateways);
                console.log(err);
              }

              userRights.forEach(function (userRight) {
                const gateway = gatewaysList.find(function (gateway) {
                  return gateway.HardwareId === userRight.HardwareId;
                });

                const user = users.find(function (user) {
                  return (user.Id === userRight.UserId && user.IsGateway);
                });

                const newCombined = {};
                for(var k in combined) {
                  if (k in gateway) newCombined[k] = gateway[k];
                  if (k in user) newCombined[k] = user[k];
                }
                gateways.push(newCombined);
              });

              callback(200, gateways);
            })
          });
        });
      });
    });
  });
}

