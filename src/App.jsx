import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { UploadCloud, FileSpreadsheet, Trash2 } from 'lucide-react';
import './index.css';

function App() {
  const [meetings, setMeetings] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      parseCSV(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      parseCSV(e.dataTransfer.files[0]);
    }
  };

  const parseCSV = (file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedData = results.data.map((row, index) => ({
          id: index,
          title: row['Meeting Title'] || row.Title || 'Unknown Meeting',
          description: row['Description'] || '',
          duration: parseFloat(row['Duration'] || 0), // in hours
          participants: parseInt(row['Participants'] || 1, 10),
          hourlyCost: parseFloat(row['Hourly Cost'] || 0)
        }));
        
        // Calculate total cost for each meeting
        const meetingsWithCost = parsedData.map(m => ({
          ...m,
          totalCost: m.duration * m.participants * m.hourlyCost
        }));
        
        setMeetings(meetingsWithCost);
      },
      error: (error) => {
        console.error("Error parsing CSV:", error);
        alert("Failed to parse CSV file. Please check the format.");
      }
    });
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const clearData = () => {
    setMeetings([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const totalAppCost = meetings.reduce((sum, m) => sum + m.totalCost, 0);
  const totalDuration = meetings.reduce((sum, m) => sum + m.duration, 0);
  const totalMeetings = meetings.length;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  return (
    <div className="app-container">
      <header className="header">
        <FileSpreadsheet size={36} className="header-icon" />
        <h1>Workforce Cost Copilot</h1>
      </header>

      <div className="dashboard">
        {meetings.length === 0 ? (
          <div 
            className={`upload-section ${isDragging ? 'drag-active' : ''}`}
            onClick={triggerFileInput}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <UploadCloud size={64} className="upload-icon" />
            <h2 className="upload-text">Upload Meeting Data (CSV)</h2>
            <p className="upload-subtext">Drag and drop your file here, or click to browse</p>
            <p className="upload-subtext" style={{marginTop: '1rem', fontSize: '0.8rem'}}>
              Expected columns: Meeting Title, Description, Duration, Participants, Hourly Cost
            </p>
            <input 
              type="file" 
              accept=".csv" 
              className="hidden-input" 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
          </div>
        ) : (
          <>
            <div className="stats-container">
              <div className="stat-card">
                <span className="stat-title">Total Meeting Cost</span>
                <span className="stat-value" style={{color: '#ef4444'}}>{formatCurrency(totalAppCost)}</span>
              </div>
              <div className="stat-card">
                <span className="stat-title">Total Hours</span>
                <span className="stat-value">{totalDuration.toFixed(1)}h</span>
              </div>
              <div className="stat-card">
                <span className="stat-title">Meetings Analyzed</span>
                <span className="stat-value">{totalMeetings}</span>
              </div>
              <div className="stat-card" style={{justifyContent: 'center', alignItems: 'center'}}>
                <button className="btn btn-outline" onClick={clearData}>
                  <Trash2 size={18} />
                  Clear Data
                </button>
              </div>
            </div>

            <div className="card">
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Meeting Title</th>
                      <th>Description</th>
                      <th>Duration (hrs)</th>
                      <th>Participants</th>
                      <th>Avg. Hourly Cost</th>
                      <th>Total Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {meetings.map((meeting) => (
                      <tr key={meeting.id}>
                        <td style={{fontWeight: 500}}>{meeting.title}</td>
                        <td style={{color: '#64748b', fontSize: '0.875rem'}}>{meeting.description}</td>
                        <td>{meeting.duration}</td>
                        <td>{meeting.participants}</td>
                        <td>{formatCurrency(meeting.hourlyCost)}</td>
                        <td className="cost-cell">{formatCurrency(meeting.totalCost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
