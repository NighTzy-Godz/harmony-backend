const express = require("express");
const router = express.Router();
const Doctor = require("../models/doctor");
const { auth, isDoctor, isConfirmed } = require("../middleware/auth");
const register = require("../middleware/doctorRegister");
const {
  doctorRegisterValidator,
  doctorLoginValidator,
  decideAppointmentValidator,
} = require("../utils/formValidator");

const bcrypt = require("bcrypt");
const Patient = require("../models/patient");

router.get("/allDoctors", async (req, res, next) => {
  try {
    const doctors = await Doctor.find();
    const confirmedDoctors = doctors.filter((doc) => doc.isConfirmed);
    res.send(confirmedDoctors);
  } catch (ex) {
    next(ex);
  }
});

router.get("/me", [auth, isDoctor, isConfirmed], async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ _id: req.user._id });
    if (!doctor) return res.status(400).send("User was not found");

    res.send(doctor);
  } catch (ex) {
    next(ex);
  }
});

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
        return res.status(400).send("User or Appointment  not found.");

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
          contact: patient.contact,
        };
        doctor.acceptedAppointments.push(doctorApptDetail);
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

router.post("/register", register, async (req, res, next) => {
  try {
    const { first_name, last_name, specialty, contact, email, pass1 } =
      req.body;
    const { error } = doctorRegisterValidator(req.body);
    if (error) {
      for (let item of error.details) {
        return res.status(400).send(item.message);
      }
    }

    let doctor = new Doctor({
      first_name,
      last_name,
      specialty,
      contact,
      email,
    });

    const salt = await bcrypt.genSalt(10);
    doctor.password = await bcrypt.hash(pass1, salt);

    await doctor.save();
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
