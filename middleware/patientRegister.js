const Patient = require("../models/patient");

module.exports = async function (req, res, next) {
  try {
    const { pass1, pass2, contact } = req.body;

    const patient = await Patient.findOne({ contact }).select("contact");
    if (patient)
      return res.status(400).send("A user with this number already exist");

    if (pass1 !== pass2) {
      return res.status(400).send("Password didnt match.");
    }
    next();
  } catch (e) {
    next(e);
  }
};
