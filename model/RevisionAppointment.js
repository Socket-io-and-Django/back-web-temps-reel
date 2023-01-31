const mongoose = require("mongoose");

const { Schema } = require("mongoose");

const revisionAppointmentSchema = new Schema({
  revisionId: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model(
  "RevisionAppointment",
  revisionAppointmentSchema
);
