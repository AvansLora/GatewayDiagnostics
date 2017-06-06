 /**
* Created by renek on 9-5-2017.
*/
var express     = require('express');
var jwt         = require('jsonwebtoken');
var router      = express.Router();
var settings    = require('./../config.json');
var database    = require('../Model/database');

//for test purpose:
router.post('/registeruser', function(req,res){
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

router.post('/registergateway', function(req,res){
    let token       = req.body.token
    let gatewayName = req.body.gatewayname;
    let username    = req.body.username;
    let password    = req.body.password;

    
    if(token !== settings.secret)
        return res.status(403).send({status:"wrong key"});
    database.registerGateway(username, password, gatewayName, function(status, message){
        res.status(status).send(message);
    });
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
});

//measurements:
//{"cputemp": 50, "casetemp":20, "humidity":70}
router.post('/addmeasurement', function(req,res){
   let token            = req.body.token || req.query.token || req.headers['x-access-token'];
   let measurement      = req.body.measurement;
   let user             = jwt.verify(token, settings.secret, function (err, decoded){
       if(err) return res.status(500).send({success: false, message: err});
       let gatewayData = decoded.data;
       if(!gatewayData.IsGateway) return res.status(401).send({status:"only gateways may add data"});
       database.addMeasurement(gatewayData, measurement, function(status, message){
            res.status(status).send(message);
       });

       //res.status(200).send("goeie");
   });
}); 

 //all unknown calls:
router.get('*', function(req,res){
    res.status(405).send({
        "description": "unknown call"
    });
});

module.exports = router;
