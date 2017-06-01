//file with all constansts for mongoose

//database tables:
var UsersTable          = 'Users';
var UserRightsTable     = 'UserRights';
var GateWaysTable       = 'Gateways';
var MeasurementsTable   = 'Measurements';

var UsersSchema = new mongoose.Schema({
    UserId              : Number,
    Username            : String,
    Password            : String,
    IsAdmin             : Boolean 
});

var UserRightsSchema = new mongoose.Schema({
    UserId              : Number,
    HardwareId          : Number
});

var GateWaysSchema = new mongoose.Schema({
    HardwareId          : Number,
    HardwareName        : String
});

var MeasurementsSchema = new mongoose.Schema({
    DateTime            : {type: Date, default: Date.now},
    CPUTemp             : Number,
    CaseTemp            : Number,
    Humidity            : Number
});

var dbLocation = 'mongodb://localhost/GateWayDiagnostics';

module.exports = {
    UsersTable,
    UserRightsTable,
    GateWaysTable,
    MeasurementsTable,
    UsersSchema,
    UserRightsSchema,
    GateWaysSchema,
    MeasurementsSchema,
    dbLocation
}