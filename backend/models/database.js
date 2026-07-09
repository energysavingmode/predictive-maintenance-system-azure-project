const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Target the dedicated 'database' folder at the root level
const dbPath = path.resolve(__dirname, '../../database/predictive_maintenance.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening local SQLite DB:', err.message);
    } else {
        console.log('Connected to SQLite database at:', dbPath);
        db.run('PRAGMA foreign_keys = ON;'); // Enforce relational data integrity
        initializeTables();
    }
});

function initializeTables() {
    db.serialize(() => {
        // 1. Machine Table
        db.run(`
            CREATE TABLE IF NOT EXISTS Machines (
                MachineID TEXT PRIMARY KEY,
                MachineType TEXT CHECK(MachineType IN ('L', 'M', 'H')),
                InstallationDate TEXT,
                CurrentStatus TEXT CHECK(CurrentStatus IN ('Healthy', 'Warning', 'Failure')) DEFAULT 'Healthy'
            )
        `);

        // 2. Sensor Data Table (Matches AI4I dataset and simulator outputs)
        db.run(`
            CREATE TABLE IF NOT EXISTS SensorData (
                SensorID INTEGER PRIMARY KEY AUTOINCREMENT,
                MachineID TEXT,
                Timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
                AirTemp REAL,
                ProcessTemp REAL,
                RPM REAL,
                Torque REAL,
                ToolWear REAL,
                FOREIGN KEY (MachineID) REFERENCES Machines(MachineID) ON DELETE CASCADE
            )
        `);

        // 3. Prediction Table
        db.run(`
            CREATE TABLE IF NOT EXISTS Predictions (
                PredictionID INTEGER PRIMARY KEY AUTOINCREMENT,
                MachineID TEXT,
                Timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
                Prediction INTEGER CHECK(Prediction IN (0, 1)),
                FailureProbability REAL,
                Confidence REAL,
                FOREIGN KEY (MachineID) REFERENCES Machines(MachineID) ON DELETE CASCADE
            )
        `);

        // 4. Maintenance Table
        db.run(`
            CREATE TABLE IF NOT EXISTS Maintenance (
                MaintenanceID INTEGER PRIMARY KEY AUTOINCREMENT,
                MachineID TEXT,
                MaintenanceDate TEXT,
                Reason TEXT,
                Status TEXT CHECK(Status IN ('Completed', 'Scheduled')) DEFAULT 'Scheduled',
                FOREIGN KEY (MachineID) REFERENCES Machines(MachineID) ON DELETE CASCADE
            )
        `);

        // Seed initial asset IDs if empty so your dashboard can read them instantly
        db.get("SELECT COUNT(*) as count FROM Machines", [], (err, row) => {
            if (row && row.count === 0) {
                const seedQuery = `INSERT INTO Machines (MachineID, MachineType, InstallationDate, CurrentStatus) VALUES (?, ?, ?, ?)`;
                db.run(seedQuery, ['M_001', 'M', '2024-01-15', 'Healthy']);
                db.run(seedQuery, ['L_002', 'L', '2024-03-22', 'Healthy']);
                db.run(seedQuery, ['H_003', 'H', '2023-11-05', 'Healthy']);
                console.log(' Seeded foundational machine assets into database/ directory.');
            }
        });
    });
}

module.exports = db;
