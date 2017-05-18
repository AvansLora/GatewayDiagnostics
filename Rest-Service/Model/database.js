var mongoose = require('mongoose');

function addMeasurement(hardwareId, measurements, callback){
    callback(200, {status:"measurement added"});
}

function getMeasurements(hardwareId, callback){
    callback(200, {temp:"28"});
}

module.exports = {
    addMeasurement, 
    getMeasurements
}