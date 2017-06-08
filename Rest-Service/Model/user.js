var mongoose    = require('mongoose');
var db          = require('./mongoose');
var encryption  = require('./encryption');

module.exports = {
    registerUser,
    authenticateUser,
    checkUsername
}

function registerUser(username, password, callback){
    callback(200,{status:"not implemented"})
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