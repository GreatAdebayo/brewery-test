const jwt = require('jsonwebtoken');



const generatejwt = (userid, callback) => {
    /* JWT payload */
    const payload = {
        user: { id: userid }
    }


    /* Generate Token */
    jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: 600000000
    }, (err, token) => {
        if (err) throw err;
        callback(token)
    });
}



module.exports = generatejwt