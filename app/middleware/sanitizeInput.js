// middleware/sanitizeInput.js
function escapeLDAP(str){
  return typeof str === 'string'
    ? str.replace(/[\*\(\)\\\0]/g, '\\$&')
    : str;
}

function sanitizeObject(obj){
  for(const key in obj){
    if(typeof obj[key] === 'string'){
      obj[key] = escapeLDAP(obj[key]);
    }else if(typeof obj[key] === 'object' && obj[key] !== null){
      sanitizeObject(obj[key]); // recursive for nested objects
    }
  }
}

function sanitizeInputMiddleware(req, res, next){
  sanitizeObject(req.body);
  sanitizeObject(req.query);
  sanitizeObject(req.params);
  next();
}

module.exports = sanitizeInputMiddleware;
