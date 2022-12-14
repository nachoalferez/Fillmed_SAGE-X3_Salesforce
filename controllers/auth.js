const { response, request } = require("express");
const users =require("../apiUsers.json");
const { generateJWT } = require("../helpers/generateJWT");


const login = async(req = request, res = response) => {

    const { user, password, secret_key } = req.query;

    try {
        // User verification
        const indice = users.findIndex( usr => usr.user === user );
        if (indice < 0) {
            return res.status(400).send({
                "error_description" : "User does not exist"
            })
        };
        // Password verification
        if ( password !== users[indice].password ) {
            return res.status(400).send({
                "error_description" : "Wrong password"
            })            
        };
        // secret_key verification
        if ( secret_key !== process.env.SECRETORPRIVATEKEY ) {
            return res.status(400).send({
                "error_description" : "Wrong secret key"
            })            
        };
        // Generate JWT
        const token = await generateJWT( user );

        res.status(200).send({
            "token" : token
        })
    } catch (error) {
        return res.status(500).send({
            "error_description" : "Internal Server Error. Please contact the server administrator"
        });
    }
};

module.exports = {
    login
}