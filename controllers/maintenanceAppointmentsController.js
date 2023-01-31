const MaintenanceAppointment = require("../model/MaintenanceAppointment");

const saveNewMaintenanceAppointment = async (id, date) => {
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

const getAllMaintenanceAppointments = async (req, res) => {
  let allAppointments = await MaintenanceAppointment.find();
  // if (!allUser) return res.sendStatus(204);
  // if (res !== undefined) return res.json(allAppointments);
  // return [];
  return allAppointments;
};

const getNextMaintenanceAppointmentId = async () => {
  const allAppointments = await MaintenanceAppointment.find();
    // .select("-maintenanceId")
    // .lean()
    // .exec();
  // console.log("hello");
  // console.log(allAppointments);
  // if (!allUser) return res.sendStatus(204);
  // return res.json(allUser)
  if (allAppointments.length === 0) return 0;
  return allAppointments[allAppointments.length - 1].maintenanceId + 1;
};

module.exports = {
  saveNewMaintenanceAppointment,
  getAllMaintenanceAppointments,
  getNextMaintenanceAppointmentId,
};
