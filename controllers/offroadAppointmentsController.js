const OffroadAppointment = require("../model/OffroadAppointment");

const saveNewOffroadAppointment = async (id, date) => {
  try {
    const newAppointment = new OffroadAppointment({
      offroadId: id,
      date: date,
    });
    newAppointment.save().then(() => console.log("appointment saved"));
    return true;
  } catch (err) {
    console.log(err.message);
    return false;
  }
};

const getAllOffroadAppointments = async () => {
  let allAppointments = await OffroadAppointment.find();
  return allAppointments;
};

const getNextOffroadAppointmentId = async () => {
  const allAppointments = await OffroadAppointment.find();
  if (allAppointments.length === 0) return 0;
  return allAppointments[allAppointments.length - 1].offroadId + 1;
};

module.exports = {
  saveNewOffroadAppointment,
  getAllOffroadAppointments,
  getNextOffroadAppointmentId,
};
