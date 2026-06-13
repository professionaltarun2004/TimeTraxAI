import React, { useState, useMemo } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart as RechartsPie, Pie, Cell 
} from 'recharts';
import { 
  Briefcase, AlertTriangle, TrendingUp, DollarSign, Calendar, 
  Loader2, Key, Users, Sparkles, Activity
} from 'lucide-react';
import { MOCK_EVENTS, MOCK_EMPLOYEE_RATE } from './lib/mockData';
import { analyzeMeetingsWithOpenRouter, generateExecutiveSummary } from './lib/aiEngine';
import { calculateRisk } from './lib/riskEngine';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#64748b'];

export default function App() {
  const [apiKey, setApiKey] = useState(localStorage.getItem('openrouter_key') || '');
  const [hourlyRate, setHourlyRate] = useState(MOCK_EMPLOYEE_RATE);
  const [events, setEvents] = useState([]);
  const [classifications, setClassifications] = useState([]);
  const [leakages, setLeakages] = useState([]);
  const [execSummary, setExecSummary] = useState(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      alert("Google OAuth Success! In this demo, falling back to mock data as full GAPI is not wired.");
      loadDemoData();
    },
    onError: (errorResponse) => {
      console.warn("Google OAuth Failed or Unavailable:", errorResponse);
      alert("Google OAuth unavailable. Falling back gracefully to Demo Mode.");
      loadDemoData();
    },
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
  });

  const handleConnectGCal = () => {
    if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      alert("Google Client ID is not configured in .env. Falling back to Demo Mode to prevent errors.");
      loadDemoData();
      return;
    }
    login();
  };

  const loadDemoData = () => {
    setEvents(MOCK_EVENTS);
    setClassifications([]);
    setLeakages([]);
    setExecSummary(null);
  };

  const handleSaveKey = (val) => {
    setApiKey(val);
    localStorage.setItem('openrouter_key', val);
  };

  const runAiEngine = async () => {
    if (!apiKey) {
      alert("Please enter your OpenRouter API Key.");
      return;
    }
    setIsAiProcessing(true);
    try {
      // 1. Classification & Leakages
      const result = await analyzeMeetingsWithOpenRouter(events, apiKey);
      setClassifications(result.classifications || []);
      setLeakages(result.leakages || []);

      // 2. Compute Dashboard Data for Executive Summary
      const combined = events.map(e => {
        const c = (result.classifications || []).find(cls => cls.id === e.id) || {};
        const cost = e.duration * (e.attendees * hourlyRate);
        return { ...e, projectName: c.projectName || 'Unclassified', cost };
      });
      
      const totalCost = combined.reduce((sum, m) => sum + m.cost, 0);
      const totalWaste = (result.leakages || []).reduce((sum, l) => sum + (Number(l.potentialSavings) || 0), 0);

      // 3. Exec Summary
      const summary = await generateExecutiveSummary({
        totalMeetings: events.length,
        totalCost,
        totalWaste,
        leakageTypes: (result.leakages || []).map(l => l.type)
      }, apiKey);
      
      setExecSummary(summary);
    } catch (err) {
      alert("AI Processing Failed. Check console.");
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Data Aggregation
  const enrichedEvents = useMemo(() => {
    return events.map(e => {
      const cls = classifications.find(c => c.id === e.id);
      const cost = e.duration * (e.attendees * hourlyRate);
      return { 
        ...e, 
        cost, 
        projectName: cls?.projectName || 'Unclassified',
        confidenceScore: cls?.confidenceScore,
        reasoning: cls?.reasoning
      };
    });
  }, [events, classifications, hourlyRate]);

  const totalWorkforceCost = enrichedEvents.reduce((s, e) => s + e.cost, 0);
  const totalPotentialWaste = leakages.reduce((s, l) => s + (Number(l.potentialSavings) || 0), 0);

  const projectsMap = enrichedEvents.reduce((acc, e) => {
    if (!acc[e.projectName]) acc[e.projectName] = { name: e.projectName, cost: 0, count: 0, meetings: [] };
    acc[e.projectName].cost += e.cost;
    acc[e.projectName].count += 1;
    acc[e.projectName].meetings.push(e.id);
    return acc;
  }, {});

  const projectsList = Object.values(projectsMap).map(p => ({
    ...p,
    ...calculateRisk(p, leakages)
  })).sort((a,b) => b.cost - a.cost);

  const highestCostProject = projectsList[0];
  const highestRiskProject = [...projectsList].sort((a,b) => b.score - a.score)[0];

  const formatCurrency = (v) => new Intl.NumberFormat('en-US', {style:'currency', currency:'USD', maximumFractionDigits:0}).format(v);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg"><Activity className="text-white w-6 h-6" /></div>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600">
              Workforce Cost Copilot
            </h1>
            <p className="text-xs text-slate-500 font-medium">Executive AI Dashboard</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
            <DollarSign className="w-4 h-4 text-slate-500" />
            <input 
              type="number" 
              className="bg-transparent w-16 text-sm font-semibold outline-none" 
              value={hourlyRate} 
              onChange={e => setHourlyRate(Number(e.target.value))}
              title="Employee Blended Hourly Rate"
            />
            <span className="text-xs text-slate-400">/hr</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
            <Key className="w-4 h-4 text-slate-500" />
            <input 
              type="password" 
              className="bg-transparent w-48 text-sm outline-none" 
              placeholder="OpenRouter API Key"
              value={apiKey} 
              onChange={e => handleSaveKey(e.target.value)}
            />
          </div>

          <button onClick={handleConnectGCal} className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 flex items-center gap-2 transition-colors">
            <Calendar className="w-4 h-4 text-blue-500" /> Connect GCal
          </button>
          
          <button onClick={loadDemoData} className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-700 transition-colors">
            Demo Mode
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <div className="bg-blue-50 text-blue-600 p-4 rounded-full mb-4">
              <Calendar className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Connect your Calendar</h2>
            <p className="text-slate-500 max-w-md mb-6">Import your organization's meeting metadata to detect workforce cost leakages and generate executive insights.</p>
            <div className="flex gap-4">
              <button onClick={handleConnectGCal} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-200 hover:bg-blue-700 transition">
                Sign in with Google
              </button>
              <button onClick={loadDemoData} className="bg-white border border-slate-300 text-slate-700 px-6 py-3 rounded-xl font-semibold hover:bg-slate-50 transition">
                Use Demo Data
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Controls */}
            <div className="flex items-center justify-between">
              <div className="flex bg-slate-200 p-1 rounded-lg">
                <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-1.5 rounded-md text-sm font-semibold transition ${activeTab==='dashboard' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>Dashboard</button>
                <button onClick={() => setActiveTab('meetings')} className={`px-4 py-1.5 rounded-md text-sm font-semibold transition ${activeTab==='meetings' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>Raw Data</button>
              </div>

              <button 
                onClick={runAiEngine}
                disabled={isAiProcessing}
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-5 py-2 rounded-lg font-semibold shadow-md hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-70"
              >
                {isAiProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {isAiProcessing ? 'Running AI Engine...' : 'Run Copilot AI'}
              </button>
            </div>

            {activeTab === 'dashboard' && (
              <>
                {/* Executive Summary Section */}
                {execSummary && (
                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      <Sparkles className="w-48 h-48" />
                    </div>
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-violet-300">
                      <Sparkles className="w-5 h-5" /> Executive Copilot Brief
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                      <div className="space-y-4">
                        <div><h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">What Happened</h3><p className="text-sm text-slate-200">{execSummary.whatHappened}</p></div>
                        <div><h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">Why It Happened</h3><p className="text-sm text-slate-200">{execSummary.whyItHappened}</p></div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">Recommended Actions</h3>
                          <ul className="list-disc pl-4 text-sm text-emerald-300 space-y-1">
                            {Array.isArray(execSummary.recommendedActions) ? execSummary.recommendedActions.map((a,i) => <li key={i}>{a}</li>) : <li>{execSummary.recommendedActions}</li>}
                          </ul>
                        </div>
                        <div><h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">Potential Savings</h3><p className="text-xl font-bold text-emerald-400">{execSummary.potentialSavings}</p></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between text-slate-500 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider">Total Cost</span>
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div className="text-3xl font-black text-slate-800">{formatCurrency(totalWorkforceCost)}</div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-rose-100 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between text-rose-500 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider">Potential Waste</span>
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div className="text-3xl font-black text-rose-600">{formatCurrency(totalPotentialWaste)}</div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between text-slate-500 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider">Top Project</span>
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div className="text-xl font-bold text-slate-800 truncate">{highestCostProject?.name || '-'}</div>
                    <div className="text-sm text-slate-500 mt-1">{highestCostProject ? formatCurrency(highestCostProject.cost) : ''}</div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between text-slate-500 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider">Highest Risk</span>
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div className="text-xl font-bold text-slate-800 truncate">{highestRiskProject?.name || '-'}</div>
                    {highestRiskProject && (
                      <div className={`text-xs font-bold mt-2 px-2 py-1 rounded inline-block w-fit ${highestRiskProject.level==='HIGH'?'bg-rose-100 text-rose-700':highestRiskProject.level==='MEDIUM'?'bg-amber-100 text-amber-700':'bg-emerald-100 text-emerald-700'}`}>
                        {highestRiskProject.level} RISK ({highestRiskProject.score}/100)
                      </div>
                    )}
                  </div>
                </div>

                {/* Charts & Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Cost by Project Chart */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-bold uppercase text-slate-500 mb-6">Cost by Project</h3>
                    <div className="h-[250px] w-full min-h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={projectsList}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} tickFormatter={(val) => `$${val}`} />
                          <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border:'none', boxShadow:'0 4px 6px -1px rgb(0 0 0 / 0.1)'}} formatter={(val) => formatCurrency(val)} />
                          <Bar dataKey="cost" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Project Risk Engine */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-auto h-[328px]">
                    <h3 className="text-sm font-bold uppercase text-slate-500 mb-4">Project Risk Engine</h3>
                    <div className="space-y-3">
                      {projectsList.map((p, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition">
                          <div>
                            <div className="font-semibold text-slate-800">{p.name}</div>
                            <div className="text-xs text-slate-500">{p.count} meetings • {formatCurrency(p.cost)}</div>
                          </div>
                          <div className="text-right">
                            <div className={`text-xs font-bold px-2 py-1 rounded inline-block mb-1 ${p.level==='HIGH'?'bg-rose-100 text-rose-700':p.level==='MEDIUM'?'bg-amber-100 text-amber-700':'bg-emerald-100 text-emerald-700'}`}>
                              {p.level} RISK
                            </div>
                            <div className="text-xs text-slate-400 font-medium">Score: {p.score}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* AI Cost Leakage Engine */}
                {leakages.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      Detected Cost Leakages
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {leakages.map((l, i) => (
                        <div key={i} className="bg-white p-5 rounded-xl border border-amber-100 shadow-sm relative overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400"></div>
                          <div className="font-bold text-amber-700 mb-2">{l.type}</div>
                          <div className="text-sm text-slate-600 mb-3">{l.observation}</div>
                          <div className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Impact</div>
                          <div className="text-sm text-slate-700 mb-3">{l.impact}</div>
                          <div className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Recommendation</div>
                          <div className="text-sm text-emerald-700 font-medium mb-3 bg-emerald-50 p-2 rounded">{l.recommendation}</div>
                          <div className="font-bold text-slate-800">Est. Savings: <span className="text-emerald-600">{formatCurrency(l.potentialSavings)}</span></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Raw Data Tab */}
            {activeTab === 'meetings' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                        <th className="p-4 font-bold">Meeting Details</th>
                        <th className="p-4 font-bold">Metrics</th>
                        <th className="p-4 font-bold">Total Cost</th>
                        <th className="p-4 font-bold">AI Attribution</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {enrichedEvents.map((e, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition">
                          <td className="p-4">
                            <div className="font-semibold text-slate-800">{e.title}</div>
                            <div className="text-xs text-slate-500 line-clamp-1">{e.description}</div>
                            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1"><Users className="w-3 h-3"/> {e.organizer}</div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm text-slate-700">{e.duration} hrs</div>
                            <div className="text-xs text-slate-500">{e.attendees} attendees</div>
                          </td>
                          <td className="p-4 font-bold text-slate-800">
                            {formatCurrency(e.cost)}
                          </td>
                          <td className="p-4 min-w-[250px]">
                            {e.projectName !== 'Unclassified' ? (
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">{e.projectName}</span>
                                  <span className="text-xs font-medium text-slate-400">{e.confidenceScore}%</span>
                                </div>
                                <div className="text-xs text-slate-500 italic">"{e.reasoning}"</div>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Run Copilot AI to classify</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
          </div>
        )}
      </main>
    </div>
  );
}
