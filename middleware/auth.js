const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).send("Access denied");

  try {
    const decoded = jwt.verify(token, "webparamJwtPrivateKey");
    req.user = decoded;
    next();
  } catch (err) {
    console.log(err.message);
    res.status(400).send("Invalid Token");
  }
};
