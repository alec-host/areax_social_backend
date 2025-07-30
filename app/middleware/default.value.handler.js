module.exports.withDefault = (field, value) => {
  return (req, res, next) => {
    if (req.body[field] === undefined) {
      req.body[field] = value;
    }
    next();
  };
};
