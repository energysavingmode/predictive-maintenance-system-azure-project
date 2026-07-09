const db = require('../models/database');
const { exec } = require('child_process');

// 1. POST /sensor (Replaces our old route)
exports.logSensorData = (req, res) => {
    const { device_id, temperature, vibration, pressure } = req.body;
    const query = `
        INSERT INTO telemetry (device_id, temperature, vibration, pressure)
        VALUES (?, ?, ?, ?)
    `;
    db.run(query, [device_id, temperature, vibration, pressure], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Sensor data logged", id: this.lastID });
    });
};

// 2. POST /predict (Calls python predict.py as a local placeholder)
exports.predictFailure = (req, res) => {
    const { device_id, temperature, vibration, pressure } = req.body;

    // Pass features as arguments to the python script
    exec(`python predict.py ${temperature} ${vibration} ${pressure}`, (error, stdout, stderr) => {
        if (error) {
            // Fallback if Python isn't configured yet on Person 1's Mac
            return res.json({ 
                device_id, 
                prediction: "Healthy (Local Fallback)", 
                note: "Azure ML will fully handle this later" 
            });
        }

        try {
            const result = JSON.parse(stdout.trim());
            res.json({ device_id, ...result });
        } catch (parseError) {
            res.json({ device_id, prediction: stdout.trim() || "Healthy" });
        }
    });
};

// 3. GET /history
exports.getHistory = (req, res) => {
    db.all("SELECT * FROM telemetry ORDER BY timestamp DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

// 4. GET /machines
exports.getMachines = (req, res) => {
    db.all("SELECT DISTINCT device_id FROM telemetry", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const machines = rows.map(row => row.device_id);
        res.json({ machines });
    });
};
