var express     = require('express');
var jwt         = require('jsonwebtoken');
var router      = express.Router();
var settings    = require('./../config.json');
var user        = require('../Model/user');
var gateway     = require('../Model/gateway');

//for test purpose:
router.post('/registeruser', function(req,res){
    var username    = req.body.username;
    var password    = req.body.password;
    var token       = req.body.token;
    if(token == settings.password){
        if(!username || !password) 
            return res.status(401).send({status:"missing some parameters"});
        user.checkUsername(username, function(amountOfUsers){
            if(amountOfUsers != 0) return res.status(400).send({status:"username already exist"});
            user.registerUser(username, password, function(status, message){
                res.status(status).send(message);
            });
        });    
    }
});

router.post('/registergateway', function(req,res){
    let token       = req.body.token
    let gatewayName = req.body.gatewayname;
    let username    = req.body.username;
    let password    = req.body.password;

    if(token !== settings.password)
        return res.status(403).send({status:"wrong key"});
    if(!gatewayName || !username || !password)
        return res.status(401).send({status:"missing some parameters"});

    user.checkUsername(username,function(amountOfUsers){
        if(amountOfUsers !== 0) return res.status(400).send({status: "username already exist"});
        gateway.registerGateway(username, password, gatewayName, function(status, message){
            res.status(status).send(message);
        });
    });
});

//call this function with post message with this body
//{username: 'user', password: 'password'}
//return value is userdata in json
router.post('/authenticate', function(req,res){
    var username = req.body.username;
    var password = req.body.password;
    if(!username || !password)
        return res.status(401).send({status:"username / password not valid"});

    user.authenticateUser(username, password, function(success, user){
        if(success){
            var token = jwt.sign({data: user},settings.secret,{expiresIn: '1h'})
            res.status(200).json({
                message: "Enjoy your token",
                token: token
            });
        }else{
            res.status(401).json({
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
                return res.status(401).send({message:'failed to authenticate token'});
            }else{
                next();
            }
        })
    }else{
        return res.status(403).send({message:'no token provided'});
    }
});

//measurement:
//{"cputemp": 50, "casetemp":20, "humidity":70}
router.post('/addmeasurement', function(req,res){
   let token            = req.body.token || req.query.token || req.headers['x-access-token'];
   let measurement      = req.body.measurement;
   if(!measurement)
        return res.status(401).send({status: "missing measurements"});
   let user             = jwt.verify(token, settings.secret, function (err, decoded){
       if(err) return res.status(500).send({success: false, message: err});
       let gatewayData = decoded.data;
       if(!gatewayData.IsGateway) return res.status(401).send({status:"only gateways may add data"});
       gateway.addMeasurement(gatewayData, measurement, function(status, message){
            res.status(status).send(message);
       });
   });
}); 

 //all unknown calls:
router.get('*', function(req,res){
    res.status(501).send({
        "description": "unknown call"
    });
});

module.exports = router;