const Doctor = require("../models/doctor");

module.exports = async function (req, res, next) {
  try {
    const { pass1, pass2, email } = req.body;

    const doctor = await Doctor.findOne({ email });
    if (doctor) return res.status(400).send("This doctor already exist.");
    if (pass1 !== pass2) return res.status(400).send("Password did not match.");
    next();
  } catch (ex) {
    next(ex);
  }
};
