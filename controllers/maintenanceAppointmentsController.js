const MaintenanceAppointment = require("../model/MaintenanceAppointment");

const saveNewMaintenanceAppointment = async (req) => {
  const { id, date } = req;
  try {
    const newAppointment = new MaintenanceAppointment({
      maintenanceId: id,
      date: date,
    });
    newAppointment.save().then(() => console.log("appointment saved"));
    return true;
  } catch (err) {
    console.log(err.message);
    return false;
  }
};

const getAllMaintenanceAppointments = async () => {
  const allAppointments = await MaintenanceAppointment.find();
  // if (!allUser) return res.sendStatus(204);
  return allAppointments;
};

const getLastMaintenanceAppointmentId = async () => {
  const allAppointments = await MaintenanceAppointment.find()
    .select("-id")
    .lean()
    .exec();
  // if (!allUser) return res.sendStatus(204);
  // return res.json(allUser);
  return allAppointments[allAppointments.length - 1].maintenanceId;
};

module.exports = {
  saveNewMaintenanceAppointment,
  getAllMaintenanceAppointments,
  getLastMaintenanceAppointmentId,
};
