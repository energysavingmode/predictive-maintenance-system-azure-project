const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const telemetryRoutes = require('./routes/telemetryRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Wire up our MVC routes
app.use('/api', telemetryRoutes);

app.get('/', (req, res) => {
    res.json({ status: "Online", project: "P58 Predictive Maintenance API" });
});

app.listen(PORT, () => {
    console.log(` Local backend server running on http://localhost:${PORT}`);
});
