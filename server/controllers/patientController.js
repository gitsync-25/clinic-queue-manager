const Patient = require("../models/Patient");

const addPatient = async (req, res) => {
  try {
    const { patientName } = req.body;

    if (!patientName) {
      return res.status(400).json({
        success: false,
        message: "Patient name required",
      });
    }

    const lastPatient = await Patient.findOne().sort({
      tokenNumber: -1,
    });

    const nextToken = lastPatient
      ? lastPatient.tokenNumber + 1
      : 101;

    const patient = await Patient.create({
      patientName,
      tokenNumber: nextToken,
    });

    res.status(201).json({
      success: true,
      patient,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getPatients = async (req, res) => {
  try {
    const patients = await Patient.find()
      .sort({ tokenNumber: 1 });

    res.status(200).json({
      success: true,
      count: patients.length,
      patients,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const callNextPatient = async (req, res) => {
  try {
    const currentPatient = await Patient.findOne({
      status: "in-progress",
    });

    if (currentPatient) {
      currentPatient.status = "completed";
currentPatient.consultationEndTime = new Date();

await currentPatient.save();
    }

    const nextPatient = await Patient.findOne({
      status: "waiting",
    }).sort({
      tokenNumber: 1,
    });

    if (!nextPatient) {
      return res.status(404).json({
        success: false,
        message: "No patients in queue",
      });
    }

    nextPatient.status = "in-progress";
nextPatient.consultationStartTime = new Date();

await nextPatient.save();

    res.status(200).json({
      success: true,
      patient: nextPatient,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getQueueStats = async (req, res) => {
  try {
    const currentPatient = await Patient.findOne({
      status: "in-progress",
    });

    const waitingCount = await Patient.countDocuments({
      status: "waiting",
    });

    const completedPatients = await Patient.find({
      status: "completed",
      consultationStartTime: { $exists: true },
      consultationEndTime: { $exists: true },
    });

    const completedCount = completedPatients.length;

    let averageConsultationTime = 0;

    if (completedPatients.length > 0) {
      const totalTime = completedPatients.reduce(
        (sum, patient) =>
          sum +
          (patient.consultationEndTime -
            patient.consultationStartTime),
        0
      );

      averageConsultationTime =
        Math.round(
          totalTime / completedPatients.length / 60000
        );
    }

    const estimatedWaitingTime =
      waitingCount * averageConsultationTime;

    res.status(200).json({
      success: true,
      currentToken: currentPatient
        ? currentPatient.tokenNumber
        : null,
      waitingCount,
      completedCount,
      averageConsultationTime,
      estimatedWaitingTime,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findOneAndDelete({
      tokenNumber: req.params.tokenNumber,
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Patient deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



module.exports = {
  addPatient,
  getPatients,
  callNextPatient,
  getQueueStats,
  deletePatient,
};


