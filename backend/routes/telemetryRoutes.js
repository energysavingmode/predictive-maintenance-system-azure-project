const express = require('express');
const router = express.Router();
const telemetryController = require('../controllers/telemetryController');

router.post('/sensor', telemetryController.logSensorData);
router.post('/predict', telemetryController.predictFailure);
router.get('/history', telemetryController.getHistory);
router.get('/machines', telemetryController.getMachines);

module.exports = router;
