const RoadAppointment = require("../model/RoadAppointment");

const saveNewRoadAppointment = async (id, date) => {
  try {
    const newAppointment = new RoadAppointment({
      roadId: id,
      date: date,
    });
    newAppointment.save().then(() => console.log("appointment saved"));
    return true;
  } catch (err) {
    console.log(err.message);
    return false;
  }
};

const getAllRoadAppointments = async () => {
  let allAppointments = await RoadAppointment.find();
  return allAppointments;
};

const getNextRoadAppointmentId = async () => {
  const allAppointments = await RoadAppointment.find();
  if (allAppointments.length === 0) return 0;
  return allAppointments[allAppointments.length - 1].revisionId + 1;
};

module.exports = {
  saveNewRoadAppointment,
  getAllRoadAppointments,
  getNextRoadAppointmentId,
};
