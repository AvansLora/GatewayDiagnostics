var mongoose    = require('mongoose');
var db          = require('./mongoose');

module.exports = {
    registerUser,
    authenticateUser,
    checkUsername
}

function registerUser(username, password, callback){
    db.connectDatabase(db.UsersTable,db.UsersSchema, function(table){
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