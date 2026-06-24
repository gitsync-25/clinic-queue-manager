const express = require("express");

const {
  addPatient,
  getPatients,
  callNextPatient,
  getQueueStats,
  deletePatient,
} = require("../controllers/patientController");

const router = express.Router();

router.post("/", addPatient);
router.get("/", getPatients);
router.post("/call-next", callNextPatient);
router.get("/stats", getQueueStats);
router.delete("/:tokenNumber", deletePatient);



module.exports = router;
