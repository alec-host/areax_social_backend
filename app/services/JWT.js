const jwt = require("jsonwebtoken");
const { JWT_SECRET, JWT_REFRESH_SECRET } = require("../constants/app_constants");
module.exports.accessToken = (data) => {
  const token = jwt.sign(data,JWT_SECRET,{expiresIn: '1h'});

  return token;
};

module.exports.refreshToken = (data) => {
  const refreshToken = jwt.sign(data,JWT_REFRESH_SECRET,{ expiresIn: '7d' });

  return refreshToken;
};

module.exports.jwtVerifyToken = (token) => {
  try {
    const decoded = jwt.verify(token,JWT_SECRET);
    return [true, decoded];
  } catch(error){	  
    let err;
    switch (error.name) {
      case 'TokenExpiredError': err = 'Token Expired'; break;
      default: err = error.name; break;
    }
    return [false, err];
  }
};

module.exports.jwtVerifyRefreshToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token,JWT_REFRESH_SECRET,(err,user) => {
       if(err){
         reject(err.message);
       }else{
         const token = jwt.sign({ email: user.email,reference_number: user.reference_number },JWT_SECRET,{ expiresIn: '1h' });
         resolve(token);
       }
    });
  });
};
