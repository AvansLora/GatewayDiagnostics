//node packages
var express     = require('express');
var path        = require('path');
var bodyParser  = require('body-parser');
var jws         = require('jsonwebtoken');
var morgan      = require('morgan');
var app         = express();


//files
var settings    = require('./config.json');
var version1    = require('./routes/V1')

app.set('superSecret',settings.secret);
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(morgan('dev'));
app.all('*', function(req,res,next){
    // console.log("got request:");
    // console.log(req.method + " " + req.url);



    //Access-Control-Allow-Headers: Content-Type
    //Access-Control-Allow-Methods: GET, POST, OPTIONS
    //Access-Control-Allow-Origin: *
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

app.use('/apiV1', version1);

//start server
var server = app.listen( settings.webPort , function() {
    console.log('Listening server on port ' + server.address().port );
});