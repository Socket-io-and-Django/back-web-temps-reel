const mongoose = require("mongoose");

const { Schema } = require("mongoose");

const roadAppointmentSchema = new Schema({
  roadId: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model(
  "RoadAppointment",
  roadAppointmentSchema
);
