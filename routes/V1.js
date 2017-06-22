"use strict";
var express     = require('express');
var jwt         = require('jsonwebtoken');
var router      = express.Router();
var settings    = require('./../config.json');
var user        = require('../Model/user');
var gateway     = require('../Model/gateway');

router.post('/registeruser', function(req,res){
    var username    = req.body.username;
    var password    = req.body.password;
    var token       = req.body.token;
    //check data
    if(token !== settings.password) return  res.status(401).send({status:"wrong register token"});
    if(!username || !password) return res.status(401).send({status:"missing some parameters"});

    user.checkUsername(username, function(amountOfUsers){
        if(amountOfUsers != 0) return res.status(400).send({status:"username already exist"});
        
        //register user
        user.registerUser(username, password, function(status, message){
            res.status(status).send(message);
        });
    });    
});

router.post('/registergateway', function(req,res){

    let token       = req.body.token;
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
    let username = req.body.username;
    let password = req.body.password;
    if(!username || !password)
        return res.status(401).send({status:"username / password not valid"});

    user.authenticateUser(username, password, function(success, user){
        if(success){
            let token = jwt.sign({data: user},settings.secret,{expiresIn: '1h'})
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

router.post('/addgatewaytouser', function(req,res){
    let gwusername  = req.body.username;
    let token       = req.body.token;
    jwt.verify(token, settings.secret, function(err, userdata){
        if(err) return res.status(500).send({status: err});
        if(userdata.IsGateway) return res.status(401).send({status: "gateways may not access other gateways"});
        user.addUserRight(userdata,gwusername, function(status, message){
            res.status(status).send(message);
        });
    });
});

router.post('/listgateways', function(req,res){
    let token = req.body.token;
    jwt.verify(token, settings.secret, function(err, userdata){
        if(err) return res.status(500).send({status:err});
        user.getGateways(userdata, function(status, message){
            res.status(status).send(message);
        });
    });
});


router.post('/allgateways', function (req, res) {
  user.getAllGateways(function (response, data) {
    res.status(response).send({"data": data});
  });
});

//measurement:
//{"cputemp": 50, "casetemp":20, "humidity":70}
router.post('/addmeasurement', function(req,res){
   let token            = req.body.token || req.query.token || req.headers['x-access-token'];
   let measurement      = req.body.measurement;
   if(!measurement){
        let cputemp     = req.body.cputemp;
        let casetemp    = req.body.casetemp;
        let humidity    = req.body.humidity;
        measurement = {cputemp: cputemp,casetemp: casetemp, humidity : humidity};
   }
   jwt.verify(token, settings.secret, function (err, decoded){
       if(err) return res.status(500).send({status: err});
       let gatewayData = decoded.data;
       if(!gatewayData.IsGateway) return res.status(401).send({status:"only gateways may add data"});
       gateway.addMeasurement(gatewayData, measurement, function(status, message){
            res.status(status).send(message);
       });
   });
}); 

router.post('/lastmeasurement', function(req,res){
    let hardwareId = req.body.gatewayid;
    if(hardwareId == undefined) return res.status(400).send({status: "no gatewayid"});
    gateway.getLastMeasurement(hardwareId,function(status, message){
        res.status(status).send(message);
    });
});


router.post('getmeasurements', function(req, res){
    let hardwareId = req.body.gatewayid;
    let amountOfMeasurements = req.body.measurementamount;

    if(hardwareId == undefined) return res.status(400).send({status: "no gatewayid"});
    if(amountOfMeasurements == undefined) amountOfMeasurements = 48;
    gateway.getMeasurements(hardwareId, amountOfMeasurements, function(status, body){
        res.status(status).send(body);
    });

});

router.post('/allmeasurements', function(req,res){
    let hardwareId = req.body.gatewayid;
    if(hardwareId == undefined) return res.status(400).send({status: "no gatewayid"});


    gateway.getAllMeasurements(hardwareId, function(status, message){
        res.status(status).send(message);
    });
});

 //all unknown calls:
router.get('*', function(req,res){
    res.status(501).send({
        "description": "unknown call"
    });
});

module.exports = router;