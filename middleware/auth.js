const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  try {
    const jwtPrivateKey = process.env.jwtPrivateKey;

    const token = req.header("x-auth-token");
    if (!token) return res.status(401).send("Forbidden. Not Authorized");
    const decoded = jwt.verify(token, jwtPrivateKey);
    req.user = decoded;
    // console.log(req.user);
    next();
  } catch (e) {
    res.status(400).send("Invalid Token");
  }
}

function isPatient(req, res, next) {
  if (!req.user.isPatient)
    return res.status(403).send("Sorry but you're not a patient");
  next();
}

function isDoctor(req, res, next) {
  if (!req.user.isDoctor)
    return res.status(403).send("Sorry but you're not a doctor.");
  next();
}

function isConfirmed(req, res, next) {
  if (!req.user.isConfirmed)
    return res
      .status(401)
      .send(
        "Sorry but you're not confirmed by the admins. Please wait for the confirmation."
      );
  next();
}

module.exports = { auth, isPatient, isDoctor, isConfirmed };
