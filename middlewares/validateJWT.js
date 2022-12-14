const { request, response } = require('express');

const jwt = require('jsonwebtoken');

const validateJWT = ( req = request, res = response, next ) => {
    const token = req.header('x3-token');

    if ( !token ) {
        return res.status(401).json({
            "error_description" : "There is no token in the request"
        })
    };

    try {
        jwt.verify( token, process.env.SECRETORPRIVATEKEY);
        
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({
            "error_description" : "Invalid token " + (error.message ?? '')
        })        
    }
};

module.exports = { validateJWT };