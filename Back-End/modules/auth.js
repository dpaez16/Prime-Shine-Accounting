const jwt = require('jsonwebtoken');
const { JWT_HEADER } = require('./consts');

const JWT_TTL = '2h';

module.exports = {
    verifyToken: (req, res, next) => {
        const token = req.headers[JWT_HEADER.toLowerCase()];

        if (!token) {
            return res.status(403).send({ error: `A token is required for authentication (missing header in '${JWT_HEADER}' field).` });
        }
    
        jwt.verify(token, process.env.JWT_TOKEN, (err, decoded) => {
            if (err) {
                return res.status(401).send({ error: "User is unauthorized." });
            }

            next();
        });
    },
    getJwtToken: (user) => {
        const payload = { user_id: user._id, user_email: user.email };
        const token = jwt.sign(
            payload,
            process.env.JWT_TOKEN,
            { expiresIn: JWT_TTL }
        );

        return token;
    }
};