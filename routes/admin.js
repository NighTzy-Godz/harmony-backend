const express = require("express");
const router = express.Router();

const { isAuth, isAdmin } = require("../middleware/auth");
const {
  userLoginValidator,
  userUpdatePassword,
  userUpdateAccountValidator,
} = require("../utils/formValidator");
const Admin = require("../models/Admin");
const bcrypt = require("bcrypt");
const { storage } = require("../cloudinary/cloudinary");
const multer = require("multer");
const { documentIdValidator } = require("../utils/formValidator");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const upload = multer({ storage });

router.get("/me", [isAuth, isAdmin], async (req, res, next) => {
  try {
    const admin = await Admin.findOne({ _id: req.user._id });
    if (!admin) return res.status(404).send("Admin did not found.");

    res.send(admin);
  } catch (error) {
    next(error);
  }
});

router.get("/past-appts", [isAuth, isAdmin], async (req, res, next) => {
  try {
    const admin = await Admin.findOne({ email: process.env.admin_email })
      .select("listOfAppointments")
      .populate("listOfAppointments");

    if (!admin) return res.status(404).send("Admin did not found.");

    const pastAppts = admin.listOfAppointments.filter((item) => {
      return item.status !== "Pending";
    });

    return res.send(pastAppts);
  } catch (error) {
    next(error);
  }
});

router.get("/incoming-appts", [isAuth, isAdmin], async (req, res, next) => {
  try {
    const admin = await Admin.findOne({ email: process.env.admin_email })
      .select("listOfAppointments")
      .populate("listOfAppointments");

    if (!admin) return res.status(404).send("Admin did not found.");

    const incomingAppts = admin.listOfAppointments.filter((item) => {
      return item.status === "Pending";
    });

    return res.send(incomingAppts);
  } catch (error) {
    next(error);
  }
});

router.get("/all-patients", [isAuth, isAdmin], async (req, res, next) => {
  try {
    const admin = await Admin.findOne({ email: process.env.admin_email })
      .select("listOfPatients")
      .populate("listOfPatients");

    if (!admin) return res.status(404).send("Admin did not found.");

    return res.send(admin.listOfPatients);
  } catch (error) {
    next(error);
  }
});

router.get("/unconfirmedDoctors", [isAuth, isAdmin], async (req, res, next) => {
  try {
    const admin = await Admin.findOne({ email: process.env.admin_email })
      .select("listOfDoctors")
      .populate("listOfDoctors");

    if (!admin) return res.status(404).send("Admin did not found.");

    const unconfirmedDoctors = admin.listOfDoctors.filter((docs) => {
      return !docs.isConfirmed;
    });

    return res.send(unconfirmedDoctors);
  } catch (error) {
    next(error);
  }
});

router.post("/acceptDoctor", [isAuth, isAdmin], async (req, res, next) => {
  try {
    const { document_id } = req.body;
    const { error } = documentIdValidator(req.body);
    if (error) {
      for (let items of error.details) {
        return res.status(400).send(items.message);
      }
    }

    const doctor = await Doctor.findOne({ _id: document_id }).select(
      "isConfirmed"
    );

    if (!doctor) return res.status(404).send("Doctor did not found.");

    doctor.isConfirmed = true;

    await doctor.save();

    res.send(doctor);
  } catch (error) {
    next(error);
  }
});

router.post("/update-pass", [isAuth, isAdmin], async (req, res, next) => {
  try {
    const { currentPass, newPass, confirmPass } = req.body;
    const { error } = userUpdatePassword(req.body);
    if (error) {
      for (let items of error.details) {
        return res.status(400).send(items.message);
      }
    }

    const admin = await Admin.findOne({ _id: req.user._id }).select("password");
    if (!admin) return res.status(404).send("Admin did not found.");

    if (newPass !== confirmPass)
      return res
        .status(400)
        .send("New Password and Confirm Password did not match.");

    const validPassword = await bcrypt.compare(currentPass, admin.password);
    if (!validPassword)
      return res.status(400).send("Current credentials did not match.");

    const salt = await bcrypt.genSalt(10);

    admin.password = await bcrypt.hash(newPass, salt);

    await admin.save();

    res.send(admin);
  } catch (error) {
    next(error);
  }
});

router.post(
  "/update-account",
  upload.single("img"),
  [isAuth, isAdmin],
  async (req, res, next) => {
    try {
      const { first_name, last_name, email, contact } = req.body;
      const { error } = userUpdateAccountValidator(req.body);
      if (error) {
        for (let items of error.details) {
          return res.status(400).send(items.message);
        }
      }

      const admin = await Admin.findOne({ _id: req.user._id });
      if (!admin) return res.status(404).send("Patient did not found.");

      admin.first_name = first_name;
      admin.last_name = last_name;
      admin.email = email;
      admin.contact = contact;
      admin.profile_pic = !req.file ? admin.profile_pic : req.file.path;

      await admin.save();

      res.send(admin);
    } catch (error) {
      next(error);
    }
  }
);

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

router.delete(
  "/banPatient/:document_id",
  [isAuth, isAdmin],
  async (req, res, next) => {
    try {
      const { document_id } = req.params;
      console.log(req.params);
      const { error } = documentIdValidator(req.params);
      if (error) {
        for (let items of error.details) {
          return res.status(400).send(items.message);
        }
      }

      const patient = await Patient.findByIdAndDelete(document_id);
      if (!patient) return res.status(404).send("Patient did not found.");

      res.send(patient);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/banDoctor/:document_id",
  [isAuth, isAdmin],
  async (req, res, next) => {
    try {
      const { document_id } = req.params;

      const { error } = documentIdValidator(req.params);
      if (error) {
        for (let items of error.details) {
          return res.status(400).send(items.message);
        }
      }

      const doctor = await Doctor.findByIdAndDelete(document_id);
      if (!doctor) return res.status(404).send("Doctor did not found.");
      console.log(doctor);

      res.send(doctor);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
