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
      const response = await fetch('http://localhost:3001/api/history');
      const data = await response.json();
      // Reverse array data for chronological chart reading (left-to-right timeline)
      setTelemetry(data.reverse());
      setLoading(false);
    } catch (error) {
      console.error("Error fetching metrics from Express Server backend:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000); // Dynamic polling window loop every 3s
    return () => clearInterval(interval);
  }, []);

  // Filter out and slide window to display only the last 10 log updates on real-time charts
  const chartDataLimited = telemetry.slice(-10);
  const timestamps = chartDataLimited.map(t => t.Timestamp ? new Date(t.Timestamp).toLocaleTimeString() : '');

  // 1. Chart Configuration: Unified Temperature Thermal Profiles (Process vs Ambient Air)
  const tempChartData = {
    labels: timestamps,
    datasets: [
      {
        label: 'Process Temp (K)',
        data: chartDataLimited.map(t => t.ProcessTemp),
        borderColor: '#ff6384',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.3
      },
      {
        label: 'Air Temp (K)',
        data: chartDataLimited.map(t => t.AirTemp),
        borderColor: '#4bc0c0',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.3
      }
    ]
  };

  // 2. Chart Configuration: Mechanical Load Diagnostics Profile (RPM Engine Speed vs Torque Newton-Meters)
  const mechanicsChartData = {
    labels: timestamps,
    datasets: [
      {
        label: 'Rotational Speed (RPM)',
        data: chartDataLimited.map(t => t.RPM),
        borderColor: '#36a2eb',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.2,
        yAxisID: 'y'
      },
      {
        label: 'Torque (Nm)',
        data: chartDataLimited.map(t => t.Torque),
        borderColor: '#ffce56',
        backgroundColor: 'rgba(255, 206, 86, 0.2)',
        tension: 0.2,
        yAxisID: 'y1'
      }
    ]
  };

  // 3. Chart Configuration: Fleet Health Ratio Statistics Heuristic calculation
  const totalMachinesCount = new Set(telemetry.map(t => t.MachineID)).size || 3;
  const failureMachinesCount = telemetry.filter(t => t.CurrentStatus === 'Failure').length ? 1 : 0; 
  const healthyMachinesCount = totalMachinesCount - failureMachinesCount;

  const fleetDistributionChart = {
    labels: ['Healthy Operations Status', 'Critical Failures Identified'],
    datasets: [{
      label: 'Total Rig Count',
      data: [healthyMachinesCount, failureMachinesCount],
      backgroundColor: ['#28a745', '#dc3545'],
    }]
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <header style={{ marginBottom: '20px', borderBottom: '2px solid #dee2e6', paddingBottom: '10px' }}>
        <h2>📊 Enterprise SCADA Predictive Maintenance Dashboard</h2>
        <span style={{ color: '#6c757d' }}>Live telemetry telemetry arrays bound directly to machine learning pipelines</span>
      </header>
      
      {loading ? (
        <h3>Awaiting Data Streams from Factory Floor Simulator...</h3>
      ) : (
        <div>
          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
            <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <Line data={tempChartData} options={{ responsive: true, plugins: { title: { display: true, text: 'Thermal Runaway & Load Profile' } } }} />
            </div>
            <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <Line 
                data={mechanicsChartData} 
                options={{ 
                  responsive: true, 
                  plugins: { title: { display: true, text: 'Mechanical Structural Performance Metrics' } },
                  scales: {
                    y: { type: 'linear', display: true, position: 'left' },
                    y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false } }
                  }
                }} 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginBottom: '30px' }}>
            {/* Risk Distribution Chart Widget */}
            <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <Bar data={fleetDistributionChart} options={{ responsive: true, plugins: { legend: { display: false }, title: { display: true, text: 'Active Fleet Health Proportions' } } }} />
            </div>
            
            {/* Unified Ingestion Feed Table */}
            <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', overflowY: 'auto', maxHeight: '310px' }}>
              <h3 style={{ marginTop: 0 }}>📋 Relational Ingestion Data Stream (Live Database View)</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f3f5', borderBottom: '2px solid #dee2e6' }}>
                    <th style={{ padding: '8px' }}>Machine Asset ID</th>
                    <th style={{ padding: '8px' }}>Process Temp (K)</th>
                    <th style={{ padding: '8px' }}>Rotational Speed (RPM)</th>
                    <th style={{ padding: '8px' }}>Torque (Nm)</th>
                    <th style={{ padding: '8px' }}>Tool Wear (min)</th>
                    <th style={{ padding: '8px' }}>ML Predicted Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[...telemetry].reverse().slice(0, 7).map((row, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #e9ecef', backgroundColor: row.CurrentStatus === 'Failure' ? '#fde8e8' : 'transparent' }}>
                      <td style={{ padding: '8px', fontWeight: 'bold' }}>{row.MachineID}</td>
                      <td style={{ padding: '8px' }}>{row.ProcessTemp} K</td>
                      <td style={{ padding: '8px' }}>{row.RPM} rpm</td>
                      <td style={{ padding: '8px' }}>{row.Torque} Nm</td>
                      <td style={{ padding: '8px' }}>{row.ToolWear} min</td>
                      <td style={{ padding: '8px', fontWeight: 'bold', color: row.CurrentStatus === 'Failure' ? '#dc3545' : row.CurrentStatus === 'Warning' ? '#ffc107' : '#28a745' }}>
                        {row.CurrentStatus || 'Healthy'}
                      </td>
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
