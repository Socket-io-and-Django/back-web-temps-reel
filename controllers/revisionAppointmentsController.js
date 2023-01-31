const RevisionAppointment = require("../model/RevisionAppointment");

const saveNewRevisionAppointment = async (id, date) => {
  try {
    const newAppointment = new RevisionAppointment({
      revisionId: id,
      date: date,
    });
    newAppointment.save().then(() => console.log("appointment saved"));
    return true;
  } catch (err) {
    console.log(err.message);
    return false;
  }
};

const getAllRevisionAppointments = async () => {
  let allAppointments = await RevisionAppointment.find();
  return allAppointments;
};

const getNextRevisionAppointmentId = async () => {
  const allAppointments = await RevisionAppointment.find();
  if (allAppointments.length === 0) return 0;
  return allAppointments[allAppointments.length - 1].revisionId + 1;
};

module.exports = {
  saveNewRevisionAppointment,
  getAllRevisionAppointments,
  getNextRevisionAppointmentId,
};
