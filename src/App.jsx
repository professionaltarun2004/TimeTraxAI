import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { UploadCloud, FileSpreadsheet, Trash2, Key, Sparkles, Loader2, PieChart, AlertTriangle } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import './index.css';

function App() {
  const [meetings, setMeetings] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDetectingLeakage, setIsDetectingLeakage] = useState(false);
  const [costLeakages, setCostLeakages] = useState([]);
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
        const parsedData = results.data.map((row, index) => {
          const duration = parseFloat(row['Duration'] || 0);
          const participants = parseInt(row['Participants'] || 1, 10);
          const avgHourlyCost = parseFloat(row['Hourly Cost'] || 0);
          
          const sumEmployeeHourlyCost = participants * avgHourlyCost;
          const totalCost = duration * sumEmployeeHourlyCost;

          return {
            id: `mtg_${index}_${Date.now()}`,
            title: row['Meeting Title'] || row.Title || 'Unknown Meeting',
            description: row['Description'] || '',
            duration,
            participants,
            hourlyCost: avgHourlyCost,
            sumEmployeeHourlyCost,
            totalCost,
            projectName: null,
            confidenceScore: null,
            reasoning: null
          };
        });
        
        setMeetings(parsedData);
        setCostLeakages([]); // Reset leakages on new upload
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
    setCostLeakages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const analyzeMeetings = async () => {
    if (!apiKey) {
      alert("Please enter a Gemini API Key in the top right corner.");
      return;
    }
    if (meetings.length === 0) return;

    setIsAnalyzing(true);
    
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `You are an AI assistant that classifies meetings into projects.
Available projects MUST be one of: Phoenix, Delta, Atlas, Internal, Recruitment.

Analyze the following list of meetings:
${JSON.stringify(meetings.map(m => ({id: m.id, title: m.title, description: m.description})))}

Return a JSON array of objects. Each object MUST correspond to a meeting from the input and contain exactly these keys:
- "id": the meeting id (must match the input exactly)
- "projectName": The exact name of the project from the allowed list.
- "confidenceScore": A number between 0 and 100 representing your confidence.
- "reasoning": A brief 1-sentence explanation of why you chose this project.

Return strictly valid JSON array. Do not wrap it in markdown. Just the array.`;

      const result = await model.generateContent(prompt);
      let text = result.response.text();
      
      if (text.startsWith('```json')) text = text.replace(/```json\n?/, '').replace(/```$/, '');
      else if (text.startsWith('```')) text = text.replace(/```\n?/, '').replace(/```$/, '');
      
      const parsed = JSON.parse(text);

      const updatedMeetings = meetings.map(m => {
        const classification = parsed.find(p => p.id === m.id);
        if (classification) {
          return { ...m, ...classification };
        }
        return m;
      });

      setMeetings(updatedMeetings);
      localStorage.setItem('gemini_api_key', apiKey);
    } catch (error) {
      console.error("Error analyzing meetings:", error);
      alert("Failed to classify meetings. Check console for details.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runCostLeakageAnalysis = async () => {
    if (!apiKey) {
      alert("Please enter a Gemini API Key in the top right corner.");
      return;
    }
    if (meetings.length === 0) return;

    setIsDetectingLeakage(true);
    
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

      const prompt = `You are a corporate finance AI analyzing a dataset of meetings for "Cost Leakages".
Detect patterns related to:
1. Low attendance meetings (e.g., 1-2 people where an email might suffice)
2. High cost meetings (e.g., extremely expensive total cost)
3. Meetings with many attendees (e.g., large all-hands or standups that might be inefficient)
4. Repeated recurring meetings (e.g., same title occurring multiple times or daily syncs taking too much time)

Here is the meeting data:
${JSON.stringify(meetings.map(m => ({
  title: m.title, 
  duration: m.duration, 
  participants: m.participants, 
  totalCost: m.totalCost 
})))}

Generate exactly 3 to 4 distinct major cost leakage insights. 
Return strictly a valid JSON array of objects. Each object MUST contain exactly these keys:
- "type": A short label (e.g., "High Cost Meeting", "Excessive Attendees", "Repeated Meetings")
- "observation": What did you notice?
- "impact": What is the business or financial impact?
- "recommendation": How to fix this or mitigate the cost?
- "potentialSavings": The estimated dollar amount saved if the recommendation is followed (as a number).
- "relatedMeetings": An array of strings representing the titles of the meetings involved.

Do not wrap the response in markdown blocks. Just return the JSON array.`;

      const result = await model.generateContent(prompt);
      let text = result.response.text();
      
      if (text.startsWith('```json')) text = text.replace(/```json\n?/, '').replace(/```$/, '');
      else if (text.startsWith('```')) text = text.replace(/```\n?/, '').replace(/```$/, '');
      
      const parsed = JSON.parse(text);
      setCostLeakages(parsed);
      localStorage.setItem('gemini_api_key', apiKey);
    } catch (error) {
      console.error("Error running leakage analysis:", error);
      alert("Failed to analyze cost leakages. Check console for details.");
    } finally {
      setIsDetectingLeakage(false);
    }
  };

  const totalAppCost = meetings.reduce((sum, m) => sum + m.totalCost, 0);
  const totalDuration = meetings.reduce((sum, m) => sum + m.duration, 0);
  const totalMeetings = meetings.length;
  const analyzedMeetings = meetings.filter(m => m.projectName).length;

  const projectAggregates = meetings.reduce((acc, m) => {
    const proj = m.projectName || 'Unclassified';
    if (!acc[proj]) {
      acc[proj] = { name: proj, cost: 0, hours: 0, count: 0 };
    }
    acc[proj].cost += m.totalCost;
    acc[proj].hours += m.duration;
    acc[proj].count += 1;
    return acc;
  }, {});

  const aggregatedList = Object.values(projectAggregates).sort((a, b) => b.cost - a.cost);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-left">
          <FileSpreadsheet size={36} className="header-icon" />
          <h1>Workforce Cost Copilot</h1>
        </div>
        <div className="api-key-container">
          <Key size={16} className="text-secondary" color="#6c757d" />
          <input 
            type="password" 
            className="api-key-input" 
            placeholder="Enter Gemini API Key..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>
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
                <span className="stat-value">{analyzedMeetings} / {totalMeetings}</span>
              </div>
            </div>

            <div style={{display: 'flex', gap: '1rem', marginBottom: '1rem'}}>
              <button 
                className="btn btn-warning" 
                onClick={runCostLeakageAnalysis}
                disabled={isDetectingLeakage}
              >
                {isDetectingLeakage ? <Loader2 size={16} className="spin" /> : <AlertTriangle size={16} />}
                {isDetectingLeakage ? 'Analyzing Leakage...' : 'Run Cost Leakage Analysis'}
              </button>
              
              <button 
                className="btn btn-ai" 
                onClick={analyzeMeetings}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />}
                {isAnalyzing ? 'Classifying...' : 'Auto-Classify Projects'}
              </button>
              
              <button className="btn btn-outline" onClick={clearData} style={{marginLeft: 'auto'}}>
                <Trash2 size={16} />
                Clear Data
              </button>
            </div>

            {/* AI Cost Leakage Insights */}
            {costLeakages.length > 0 && (
              <div style={{marginBottom: '2rem'}}>
                <h3 style={{display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem 0', color: '#1e293b'}}>
                  <Sparkles size={20} color="#8b5cf6" />
                  AI Cost Leakage Insights
                </h3>
                <div className="insights-grid">
                  {costLeakages.map((leakage, idx) => (
                    <div key={idx} className="insight-card">
                      <div className="insight-header">
                        <AlertTriangle size={20} color="#ef4444" />
                        <span className="insight-type">{leakage.type}</span>
                      </div>
                      <div className="insight-body">
                        <div className="insight-item">
                          <span className="insight-label">Observation</span>
                          <span className="insight-value">{leakage.observation}</span>
                        </div>
                        <div className="insight-item">
                          <span className="insight-label">Business Impact</span>
                          <span className="insight-value impact">{leakage.impact}</span>
                        </div>
                        <div className="insight-item">
                          <span className="insight-label">Recommendation</span>
                          <span className="insight-value recommendation">{leakage.recommendation}</span>
                        </div>
                        <div className="insight-item" style={{alignItems: 'flex-start'}}>
                          <span className="insight-label">Potential Savings</span>
                          <span className="insight-savings">
                            ~{formatCurrency(leakage.potentialSavings)}
                          </span>
                        </div>
                        {leakage.relatedMeetings && leakage.relatedMeetings.length > 0 && (
                          <div className="related-meetings">
                            <span className="insight-label" style={{display: 'block', marginBottom: '0.25rem'}}>Related Meetings:</span>
                            {leakage.relatedMeetings.map((mtg, i) => (
                              <span key={i} className="related-meeting-tag">{mtg}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Aggregations View */}
            {analyzedMeetings > 0 && (
              <div style={{marginBottom: '2rem'}}>
                <h3 style={{display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem 0', color: '#1e293b'}}>
                  <PieChart size={20} color="#64748b" />
                  Costs by Project
                </h3>
                <div className="projects-grid">
                  {aggregatedList.map(proj => (
                    <div key={proj.name} className={`project-card ${proj.name}`}>
                      <div className="project-name">{proj.name}</div>
                      <div className="project-stat">
                        <span className="project-stat-label">Total Cost:</span>
                        <span className="project-stat-value" style={{color: '#10b981'}}>{formatCurrency(proj.cost)}</span>
                      </div>
                      <div className="project-stat">
                        <span className="project-stat-label">Total Hours:</span>
                        <span className="project-stat-value">{proj.hours.toFixed(1)}h</span>
                      </div>
                      <div className="project-stat">
                        <span className="project-stat-label">Meetings:</span>
                        <span className="project-stat-value">{proj.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="card">
              <h3 style={{margin: '0 0 1rem 0', fontSize: '1.2rem', color: '#1a202c'}}>Meeting Data</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Meeting Info</th>
                      <th>Duration / Px</th>
                      <th>Cost Formula</th>
                      <th>Total Cost</th>
                      <th>AI Project Classification</th>
                    </tr>
                  </thead>
                  <tbody>
                    {meetings.map((meeting) => (
                      <tr key={meeting.id}>
                        <td style={{maxWidth: '250px'}}>
                          <div style={{fontWeight: 600, color: '#1a202c'}}>{meeting.title}</div>
                          <div style={{color: '#64748b', fontSize: '0.85rem', marginTop: '0.25rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'}} title={meeting.description}>
                            {meeting.description}
                          </div>
                        </td>
                        <td>
                          <div>{meeting.duration} hrs</div>
                          <div style={{fontSize: '0.85rem', color: '#64748b'}}>{meeting.participants} participants</div>
                        </td>
                        <td style={{fontSize: '0.85rem', color: '#475569'}}>
                          <div>{meeting.duration}h × {formatCurrency(meeting.sumEmployeeHourlyCost)}/hr</div>
                          <div style={{fontSize: '0.75rem', color: '#94a3b8'}}>(Sum of Employee Cost)</div>
                        </td>
                        <td className="cost-cell">{formatCurrency(meeting.totalCost)}</td>
                        <td style={{minWidth: '250px'}}>
                          {meeting.projectName ? (
                            <div>
                              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem'}}>
                                <span className={`badge badge-${meeting.projectName}`}>{meeting.projectName}</span>
                                <span style={{fontSize: '0.75rem', fontWeight: 600, color: meeting.confidenceScore > 80 ? '#10b981' : '#f59e0b'}}>
                                  {meeting.confidenceScore}% match
                                </span>
                              </div>
                              <div className="confidence-bar-container">
                                <div className="confidence-bar" style={{width: `${meeting.confidenceScore}%`, backgroundColor: meeting.confidenceScore > 80 ? '#10b981' : '#f59e0b'}}></div>
                              </div>
                              <div style={{fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem', fontStyle: 'italic'}}>
                                "{meeting.reasoning}"
                              </div>
                            </div>
                          ) : (
                            <span style={{color: '#94a3b8', fontSize: '0.875rem', fontStyle: 'italic'}}>Not classified</span>
                          )}
                        </td>
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
