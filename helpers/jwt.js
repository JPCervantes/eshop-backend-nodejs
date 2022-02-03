const expressJwt = require('express-jwt');

function authJwt() {
    const secret = process.env.USER_JWT_SECRET;
    const api = process.env.API_URL;
    return expressJwt({
        secret,
        algorithms: ['HS256'],
        isRevoked: isRevoked    //Allows to revoke a token in specific conditions
    }).unless({
        path: [     //This are REGEX - regex101.com
            {url: /\/api\/v1\/products(.*)/ , methods: ['GET', 'OPTIONS'] }, // this specifies the scoope of methods for products route
            {url: /\/api\/v1\/categories(.*)/ , methods: ['GET', 'OPTIONS'] },
            {url: /\/public\/uploads(.*)/ , methods: ['GET', 'OPTIONS'] },  //To allow access to media from the public
            `${api}/users/login`,
            `${api}/users/register`    //this exclude urls from autentication
        ]
    })
}

async function isRevoked (req, payload, done) {     //this function speficies the condition to revoke the token
    if(!payload.isAdmin) {      //Payload allows to access to the data on the token, in this case to isAdmin
        done(null, true)       //if there is not isAdmin revoke this token.
    }
    done();     //otherwise allows the token
}

module.exports = authJwt;