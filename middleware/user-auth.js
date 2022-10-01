const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    let token = null;
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
        jwt.verify(token, "Developed&DesignedByP@rthG@ndhi", async function (err, decoded) {
            if (err) {
                return res.status(401).send({
                    message: "Unauthorized Access"
                })
            }
            if (decoded.userId) {
                req.authData = decoded
                next()
            }
        })
    } else {
        return res.status(401).send({
            message: "Unauthorized Access"
        })
    }

}