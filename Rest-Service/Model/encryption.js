var bcrypt      = require("bcrypt-nodejs");

function encryptPassword(password){
    //TODO use bcrypt
    var hash = bcrypt.hashSync(password);
    console.log("new hash:", hash);
    return hash;
}

function comparePassword(plainPassword, hash){
    console.log("comparing:", plainPassword, " with: ", hash);
    return bcrypt.compareSync(plainPassword,hash);
}


module.exports = {
    encryptPassword,
    comparePassword
}