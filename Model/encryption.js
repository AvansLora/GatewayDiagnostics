var bcrypt = require("bcrypt-nodejs");

function encryptPassword(password){
    //TODO use bcrypt
    var hash = bcrypt.hashSync(password);
    return hash;
}

function comparePassword(plainPassword, hash){
    return bcrypt.compareSync(plainPassword,hash);
}

module.exports = {
    encryptPassword,
    comparePassword
};