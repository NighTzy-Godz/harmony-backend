const jwt = require("jsonwebtoken");
const secretPass = process.env.jwtSecretPass;

function isAuth(req, res, next) {
  try {
    const token = req.headers["x-auth-token"];
    if (!token) return res.status(401).send("Forbidden. Not Authorized");

    const decoded = jwt.verify(token, secretPass);
    req.user = decoded;

    next();
  } catch (e) {
    return res.status(400).send("Invalid Token");
  }
}

module.exports = { isAuth };
