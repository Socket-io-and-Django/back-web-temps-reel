const mongoose = require("mongoose");

const { Schema } = require("mongoose");

const maintenanceAppointmentSchema = new Schema({
  maintenanceId: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model(
  "MaintenanceAppointment",
  maintenanceAppointmentSchema
);
