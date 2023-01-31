const mongoose = require("mongoose");

const { Schema } = require("mongoose");

const sportAppointmentSchema = new Schema({
  sportId: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model(
  "SportAppointment",
  sportAppointmentSchema
);
