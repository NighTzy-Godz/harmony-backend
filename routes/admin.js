const express = require("express");
const router = express.Router();

const { isAuth, isAdmin } = require("../middleware/auth");
const { userLoginValidator } = require("../utils/formValidator");
const Admin = require("../models/Admin");
const bcrypt = require("bcrypt");

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { error } = userLoginValidator(req.body);
    if (error) {
      for (let items of error.details) {
        return res.status(400).send(items.message);
      }
    }

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).send("Admin did not found");

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword)
      return res.status(400).send("Credentials did not match.");

    const token = admin.generateAuthToken(admin);

    res
      .header("x-auth-token", token)
      .header("access-control-expose-headers", "x-auth-token")
      .send(token);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
