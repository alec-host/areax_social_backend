const { jwtVerifyToken } = require("../services/JWT");

const verifyToken = (req, res, next) => {
    const token =
        req.body.token || req.query.token || req.params.token || req.headers["x-access-token"] || req.headers.authorization;

        if (!token) {
            return res.status(403).json({
                success: false,
                error: true,
                message: "A token is required for authentication"
            });
        }

        try {
            if(!token.startsWith("Bearer ")){
               return res.status(401).json({
                   success: false,
                   error: true,
                   message: "Invalid Token Format",
               });
            }
            const resp = jwtVerifyToken(token.split(" ")[1]);
	    console.log("JWT Verify Response:", resp);	
            if(!resp[0]){
                return res.status(401).json({
                    success: false,
                    error: true,
                    message: resp[1]
                });
            }
        } catch (err) {
            return res.status(401).json({
                success: false,
                error: true,
                message: "Invalid Token"
            });
        }
    return next();
  };

  module.exports = verifyToken;
