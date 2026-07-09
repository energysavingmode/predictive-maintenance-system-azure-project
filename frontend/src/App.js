import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const [telemetry, setTelemetry] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/history');
      const data = await response.json();
      // Reverse data for chronological chart reading (left-to-right)
      setTelemetry(data.reverse());
      setLoading(false);
    } catch (error) {
      console.error("Error fetching metrics:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000); // Poll every 3s
    return () => clearInterval(interval);
  }, []);

  // Prepare chart time slices (Last 10 updates)
  const chartDataLimited = telemetry.slice(-10);
  const timestamps = chartDataLimited.map(t => new Date(t.timestamp).toLocaleTimeString());

  // 1. Chart Configuration: Temperature Trend
  const tempChartData = {
    labels: timestamps,
    datasets: [{
      label: 'Temperature (°C)',
      data: chartDataLimited.map(t => t.temperature),
      borderColor: '#ff6384',
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      tension: 0.3
    }]
  };

  // 2. Chart Configuration: RPM (Vibration proxy) & Torque (Pressure proxy)
  const mechanicsChartData = {
    labels: timestamps,
    datasets: [
      {
        label: 'RPM (Vibration Hz Scale)',
        data: chartDataLimited.map(t => t.vibration * 15), // Scaled to look like engine RPM
        borderColor: '#36a2eb',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.2
      },
      {
        label: 'Torque (Pressure kPa Scale)',
        data: chartDataLimited.map(t => t.pressure * 0.8), // Scaled to Torque Nm representation
        borderColor: '#ffce56',
        backgroundColor: 'rgba(255, 206, 86, 0.2)',
        tension: 0.2
      }
    ]
  };

  // 3. Chart Configuration: Failure Probability Tracker
  // Evaluates risk percentage dynamically based on raw sensor thresholds
  const highRiskCount = telemetry.filter(t => t.temperature > 80 || t.vibration > 90).length;
  const healthRate = telemetry.length ? ((telemetry.length - highRiskCount) / telemetry.length) * 100 : 100;
  
  const totalFailProbabilityChart = {
    labels: ['Current Fleet Health Rating', 'Estimated Structural Failure Probability'],
    datasets: [{
      label: 'Percentage %',
      data: [healthRate.toFixed(1), (100 - healthRate).toFixed(1)],
      backgroundColor: ['#28a745', '#dc3545'],
    }]
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <header style={{ marginBottom: '20px', borderBottom: '2px solid #dee2e6', paddingBottom: '10px' }}>
        <h2>📊 Advanced Predictive Maintenance Analytics Center</h2>
        <span style={{ color: '#6c757d' }}>Real-time telemetry streams matched against failure heuristics</span>
      </header>

      {loading ? (
        <h3>Awaiting Data Streams from Factory Floor...</h3>
      ) : (
        <div>
          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
            <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <Line data={tempChartData} options={{ responsive: true, plugins: { title: { display: true, text: 'Thermal Load Profile (Temperature)' } } }} />
            </div>
            <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <Line data={mechanicsChartData} options={{ responsive: true, plugins: { title: { display: true, text: 'Mechanical Stress Diagnostics (RPM & Torque)' } } }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginBottom: '30px' }}>
            <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <Bar data={totalFailProbabilityChart} options={{ responsive: true, plugins: { legend: { display: false }, title: { display: true, text: 'Fleet-wide Risk Ratio' } } }} />
            </div>
            
            {/* Live Data Logs Table */}
            <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', overflowY: 'auto', maxHeight: '310px' }}>
              <h3 style={{ marginTop: 0 }}>📋 Raw Ingestion Feed</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f3f5', borderBottom: '2px solid #dee2e6' }}>
                    <th style={{ padding: '8px' }}>Machine</th>
                    <th style={{ padding: '8px' }}>Temp (°C)</th>
                    <th style={{ padding: '8px' }}>Vib (Hz)</th>
                    <th style={{ padding: '8px' }}>Press (kPa)</th>
                  </tr>
                </thead>
                <tbody>
                  {[...telemetry].reverse().slice(0, 5).map((row, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #e9ecef' }}>
                      <td style={{ padding: '8px', fontWeight: 'bold' }}>{row.device_id}</td>
                      <td style={{ padding: '8px' }}>{row.temperature}</td>
                      <td style={{ padding: '8px' }}>{row.vibration}</td>
                      <td style={{ padding: '8px' }}>{row.pressure}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
