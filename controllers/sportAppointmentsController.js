const SportAppointment = require("../model/SportAppointment");

const saveNewSportAppointment = async (id, date) => {
  try {
    const newAppointment = new SportAppointment({
      sportId: id,
      date: date,
    });
    newAppointment.save().then(() => console.log("appointment saved"));
    return true;
  } catch (err) {
    console.log(err.message);
    return false;
  }
};

const getAllSportAppointments = async () => {
  let allAppointments = await SportAppointment.find();
  return allAppointments;
};

const getNextSportAppointmentId = async () => {
  const allAppointments = await SportAppointment.find();
  if (allAppointments.length === 0) return 0;
  return allAppointments[allAppointments.length - 1].sportId + 1;
};

module.exports = {
  saveNewSportAppointment,
  getAllSportAppointments,
  getNextSportAppointmentId,
};
