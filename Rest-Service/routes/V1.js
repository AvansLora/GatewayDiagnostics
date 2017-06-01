 /**
* Created by renek on 9-5-2017.
*/
var express     = require('express');
var jwt         = require('jsonwebtoken');
var router      = express.Router();
var settings    = require('./../config.json');
var database    = require('../Model/database');

//for test purpose:
router.post('/registerUser', function(req,res){
    var username    = req.body.username;
    var password    = req.body.password;
    var hardware    = req.body.hardwareId;
    var token       = req.body.token;
    if(token == settings.secret){
        database.registerUser(username, password, hardware, function(status, message){
            res.status(status).send(message);
        });
    }
});
 //call this function with post message with this body
 //{username: 'user', password: 'password'}
 //return value is userdata in json
router.post('/authenticate', function(req,res){
    var username = req.body.username;
    var password = req.body.password;
    database.authenticateUser(username, password, function(success, user){
        if(success){
            var token = jwt.sign({data: user},settings.secret,{expiresIn: '1h'})
            res.status(200).json({
                succes:true,
                message: "Enjoy your token",
                token: token
            });
        }else{
            res.status(401).json({
                succes: false,
                message:"authentication failure"
            });
        }
    });
});

router.use(function(req,res,next){
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if(token){
        jwt.verify(token, settings.secret, function(err,decoded){
            if(err){
                return res.status(401).send({succes:false, message:'failed to authenticate token'});
            }else{
                next();
            }
        })
    }else{
        return res.status(403).send({succes:false, message:'no token provided'});
    }

})

router.post('/addmeasurement', function(req,res){
   var hardwareId = req.body.hardwareId;
   var measurements = req.body.measurements;
   database.addMeasurement(hardwareId, measurements, function(status, message){
       res.status(status).send(message);
   })
});

 //all unknown calls:
router.get('*', function(req,res){
    res.status(400).send({
        "description": "unknown call"
    });
});

module.exports = router;
