const mongoose = require("mongoose");

const dbUrl = process.env.dbUrl || "mongodb://localhost:27017/harmony";

mongoose
  .connect(dbUrl)
  .then(() =>
    console.log("Successfully connected to the database. Prescription")
  )
  .catch((err) =>
    console.log("There was an error in the database. Prescription", err)
  );

const prescription_schema = new mongoose.Schema({
  prescribedBy: {
    type: new mongoose.Schema({
      profile_picture: {
        type: String,
      },
      full_name: {
        type: String,
      },
      specialty: {
        type: String,
      },
    }),
    required: true,
  },
  patient: {
    type: new mongoose.Schema({
      profile_picture: {
        type: String,
      },
      full_name: {
        type: String,
      },
      date: {
        type: String,
      },
    }),
  },

  prescription: {
    type: String,
    required: true,
  },

  findings: {
    type: String,
    required: true,
  },

  customId: {
    type: String,
  },
});

const Prescription = mongoose.model("Prescription", prescription_schema);

module.exports = { Prescription, prescription_schema };
