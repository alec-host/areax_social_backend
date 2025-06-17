const { BASIC_AUTH_USERNAME, BASIC_AUTH_PASSWORD } = require("../constants/app_constants");

const basicAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if(!authHeader){
        return res.status(401).json({ success: false, error: true,message: 'Missing Authorization Header' });
    }

    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const username = auth[0];
    const password = auth[1];

    const validUsername = BASIC_AUTH_USERNAME;
    const validPassword = BASIC_AUTH_PASSWORD;

    if(username === validUsername && password === validPassword) {
         return next();
    }else{
         return res.status(401).json({ success: false, error: true, message: 'Invalid Credentials' });
    }
};

module.exports = basicAuth;
