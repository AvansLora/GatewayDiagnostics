var mongoose    = require('mongoose');
var db          = require('./mongoose');

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
        table.find({Username: username, Password: password},function(err, data){
            if(err){console.log(err); return callback(false);}
            if(data.length == 0)
                return callback(false);    
            callback(true, data[0]);
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