const jwt = require('jsonwebtoken');

const generateJWT = ( user = '' ) => {

    return new Promise( (resolve, reject ) => {
        const payload = { user };
        jwt.sign( payload, process.env.SECRETORPRIVATEKEY, {
            expiresIn : '2h'
        }, ( err, token ) => {
            if ( err ) {
                console.log(err);
                reject( 'The token could not be generated' )
            } else {
                resolve( token );
            }
        });
    })
}

module.exports = {
    generateJWT
}