const mongoose = require("mongoose");

const { Schema } = require("mongoose");

const offroadAppointmentSchema = new Schema({
  offroadId: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model(
  "OffroadAppointment",
  offroadAppointmentSchema
);
