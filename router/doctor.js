const express = require("express");
const router = express.Router();
const Doctor = require("../models/doctor");
const Admin = require("../models/admin");
const { Prescription } = require("../models/prescription");
const { auth, isDoctor, isConfirmed } = require("../middleware/auth");

const multer = require("multer");
const { storage } = require("../cloudinary/index");
const upload = multer({ storage });

const register = require("../middleware/doctorRegister");
const {
  doctorRegisterValidator,
  doctorLoginValidator,
  decideAppointmentValidator,
  userUpdateValidator,
  userChangePassValidator,
  doctorPrescriptionValidator,
} = require("../utils/formValidator");

const bcrypt = require("bcrypt");
const Patient = require("../models/patient");
const { renderCustomId } = require("../helpers/customId");

// =========================================================================
// ==================== GET ALL DOCTOR'S INFORMATION =======================
// =========================================================================

router.get("/allDoctors", async (req, res, next) => {
  try {
    const doctors = await Doctor.find();
    const confirmedDoctors = doctors.filter((doc) => doc.isConfirmed);
    res.send(confirmedDoctors);
  } catch (ex) {
    next(ex);
  }
});

// =========================================================================
// ================= GET CURRENT DOCTOR'S INFORMATION ======================
// =========================================================================
router.get("/me", [auth, isDoctor, isConfirmed], async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ _id: req.user._id });
    if (!doctor) return res.status(400).send("User was not found");

    res.send(doctor);
  } catch (ex) {
    next(ex);
  }
});

// =========================================================================
// ============ GET CURRENT DOCTOR'S REQUESTED APPOINTMENTS ================
// =========================================================================
router.get(
  "/requestAppointments",
  [auth, isConfirmed, isDoctor],
  async (req, res, next) => {
    try {
      const doctor = await Doctor.findOne({ _id: req.user._id });
      if (!doctor)
        return res.status(400).send("Doctor was not found or not accepted.");

      res.send(doctor.requestAppointment);
    } catch (ex) {
      next(ex);
    }
  }
);

// =========================================================================
// ============= GET CURRENT DOCTOR'S INCOMING APPOINTMENTS ================
// =========================================================================

router.get(
  "/comingAppointments",
  [auth, isConfirmed, isDoctor],
  async (req, res, next) => {
    try {
      const doctor = await Doctor.findOne({ _id: req.user._id }).select(
        "acceptedAppointments"
      );
      if (!doctor)
        return res.status(400).send("Doctor was not found or not accepted.");

      res.send(doctor.acceptedAppointments);
    } catch (ex) {
      next(ex);
    }
  }
);

// =========================================================================
// =============== THINGS THAT NEED TO DO AFTER APPOINTMENT ================
// =========================================================================

router.post(
  "/post-appointment",
  [auth, isConfirmed, isDoctor],
  async (req, res, next) => {
    try {
      const { apptId, patientId, apptDate, prescription, findings } = req.body;
      const { error } = doctorPrescriptionValidator(req.body);
      if (error) {
        for (let items of error.details) {
          return res.status(400).send(items.message);
        }
      }

      const admin = await Admin.findOne({ full_name: "Harmony Admin" });
      if (!admin) return res.status(400).send("Admin did not found.");

      const patient = await Patient.findOne({ _id: patientId }).select(
        "prescriptions profile_picture full_name"
      );

      if (!patient) return res.status(400).send("Patient did not found.");

      const doctor = await Doctor.findByIdAndUpdate(
        { _id: req.user._id },
        {
          $pull: {
            acceptedAppointments: {
              _id: apptId,
            },
          },
        },
        {
          new: true,
          select: "full_name acceptedAppointments profile_picture specialty",
        }
      );

      if (!doctor)
        return res.status(400).send("Doctor was not found or not accepted.");

      const prescript = new Prescription({
        prescribedBy: {
          profile_picture: doctor.profile_picture,
          full_name: doctor.full_name,
          specialty: doctor.specialty,
        },
        patient: {
          profile_picture: patient.profile_picture,
          full_name: patient.full_name,
          date: apptDate,
        },
        prescription,
        findings,
        customId: renderCustomId(4, 2),
      });

      patient.prescriptions.push(prescript);

      await patient.save();
      await prescript.save();

      res.send(prescript);
    } catch (ex) {
      next(ex);
    }
  }
);

// =========================================================================
// ========= DECIDE IF DOCTOR GONNA ACCEPT OR DECLINE APPOINTMENT ==========
// =========================================================================
router.post(
  "/decideAppointment",
  [auth, isConfirmed, isDoctor],
  async (req, res, next) => {
    try {
      const { error } = decideAppointmentValidator(req.body);
      if (error) {
        for (let item of error.details) {
          return res.status(400).send(item.message);
        }
      }

      const doctor = await Doctor.findByIdAndUpdate(
        { _id: req.user._id },
        {
          $pull: {
            requestAppointment: {
              _id: req.body.apptId,
            },
          },
        }
      );

      if (!doctor)
        return res.status(400).send("Doctor was not found or not accepted.");

      const patient = await Patient.findOne({
        _id: req.body.patientId,
      });

      if (!patient)
        return res.status(400).send("User or Appointment  not found.");

      let appointment = patient.appointments.find(
        (item) => item._id.toString() === req.body.apptId
      );

      if (!appointment)
        return res.status(400).send("User or Appointment did not found.");

      appointment.status = req.body.status;

      const patientApptDetail = {
        doctor: {
          _id: doctor._id,
          name: doctor.first_name + " " + doctor.last_name,
          specialty: doctor.specialty,
        },
        amount: appointment.amount,
        date: appointment.date,
        status: appointment.status,
        modeOfConsultation: appointment.modeOfConsultation,
        time: appointment.time,
        contact: patient.contact,
      };

      if (req.body.status === "Confirmed") {
        const doctorApptDetail = {
          patient: {
            _id: patient._id,
            name: patient.first_name + " " + patient.last_name,
          },

          amount: appointment.amount,
          date: appointment.date,
          time: appointment.time,
          status: appointment.status,
          modeOfConsultation: appointment.modeOfConsultation,
          contact: patient.contact,
        };
        doctor.acceptedAppointments.push(doctorApptDetail);
        doctor.numberOfPatients + 1;
      }

      patient.appointmentHistory.push(patientApptDetail);

      appointment.remove();

      await doctor.save();

      await patient.save();
    } catch (ex) {
      next(ex);
    }
  }
);

// =========================================================================
// ================= UPDATE CURRENT DOCTOR'S INFORMATION ===================
// =========================================================================
router.post(
  "/updateAccount",
  upload.single("img"),
  [auth, isDoctor, isConfirmed],
  async (req, res, next) => {
    try {
      const { first_name, last_name, email, contact } = req.body;
      const { error } = userUpdateValidator(req.body);
      if (error) {
        for (let item of error.details) {
          return res.status(400).send(item.message);
        }
      }

      const doctor = await Doctor.findOne({ _id: req.user._id });
      if (!doctor) return res.status(400).send("Doctor Did not found.");

      doctor.first_name = first_name;
      doctor.last_name = last_name;
      doctor.full_name = doctor.first_name + " " + doctor.last_name;
      doctor.email = email;
      doctor.contact = contact;
      doctor.profile_picture = !req.file
        ? doctor.profile_picture
        : req.file.path;

      await doctor.save();

      res.send(doctor);
    } catch (ex) {
      next(ex);
    }
  }
);

// =========================================================================
// ================ AUTHENTICATION AND AUTHORIZATION =======================
// =========================================================================

router.post(
  "/change-password",
  [auth, isDoctor, isConfirmed],
  async (req, res, next) => {
    try {
      const { currPass, newPass, confirmPass } = req.body;
      const { error } = userChangePassValidator(req.body);
      if (error) {
        for (let items of error.details) {
          res.status(400).send(items.message);
        }
      }

      const doctor = await Doctor.findOne({ _id: req.user._id }).select(
        "password"
      );
      if (!doctor) return res.status(400).send("Doctor did not found.");

      const validPassword = await bcrypt.compare(currPass, doctor.password);
      if (!validPassword)
        return res.status(400).send("Current Password did not match.");

      if (newPass !== confirmPass)
        return res
          .status(400)
          .send("New Password and Confirm Password did not match.");

      const salt = await bcrypt.genSalt(10);
      doctor.password = await bcrypt.hash(newPass, salt);

      await doctor.save();
      res.send(doctor);
    } catch (ex) {
      next(ex);
    }
  }
);

router.post("/register", register, async (req, res, next) => {
  try {
    const { first_name, last_name, specialty, gender, contact, email, pass1 } =
      req.body;
    const { error } = doctorRegisterValidator(req.body);
    if (error) {
      for (let item of error.details) {
        return res.status(400).send(item.message);
      }
    }

    const admin = await Admin.findOne({ full_name: "Harmony Admin" });
    if (!admin)
      return res
        .status(401)
        .send("Admin did not found. You are not authorized.");

    let doctor = new Doctor({
      first_name,
      last_name,
      specialty,
      contact,
      email,
      gender,
      full_name: first_name + " " + last_name,
    });

    const salt = await bcrypt.genSalt(10);
    doctor.password = await bcrypt.hash(pass1, salt);

    const pendingDoctor = {
      full_name: doctor.full_name,
      contact: doctor.contact,
      email: doctor.email,
    };

    admin.pendingDoctors.push(pendingDoctor);

    await doctor.save();
    await admin.save();
    res.send(doctor);
  } catch (ex) {
    next(ex);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { error } = doctorLoginValidator;
    if (error) {
      for (let item of error) {
        return res.status(400).send(item.message);
      }
    }

    const doctor = await Doctor.findOne({ email: req.body.email });
    if (!doctor) return res.status(400).send("Doctor not found.");

    const validatePassword = await bcrypt.compare(
      req.body.password,
      doctor.password
    );

    if (!validatePassword)
      return res.status(400).send("Password did not match.");

    const token = doctor.generateAuthToken();
    res
      .header("x-auth-token", token)
      .header("access-control-expose-headers", "x-auth-token")
      .send(doctor);
  } catch (ex) {
    next(ex);
  }
});

module.exports = router;
