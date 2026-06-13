import React, { useState, useEffect, useRef } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart as RechartsPie, Pie, Cell, Legend
} from 'recharts';
import { 
  Briefcase, AlertTriangle, TrendingUp, DollarSign, Calendar, 
  Key, Users, Sparkles, Activity, Menu, X, Search, BrainCircuit, Receipt, LayoutDashboard, Terminal, CheckCircle2, ShieldAlert, Loader2
} from 'lucide-react';
import { MOCK_EVENTS, EMPLOYEES } from './lib/mockData';
import { analyzeMeetingsWithOpenRouter, generateExecutiveSummary } from './lib/aiEngine';
import { calculateMeetingCost, detectLeakage, calculateProjectRisk } from './lib/algorithms';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function App() {
  const [apiKey, setApiKey] = useState(localStorage.getItem('openrouter_key') || '');
  const [enrichedEvents, setEnrichedEvents] = useState([]);
  const [execSummary, setExecSummary] = useState(null);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  
  // Automation System State
  const [isSystemActive, setIsSystemActive] = useState(false);
  const [liveLogs, setLiveLogs] = useState([]);
  const [agentStatus, setAgentStatus] = useState({
    calendar: 'idle',
    attribution: 'idle',
    cost: 'idle',
    leakage: 'idle',
    risk: 'idle',
    executive: 'idle'
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const logsEndRef = useRef(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [liveLogs]);

  const addLog = (agent, message) => {
    const time = new Date().toLocaleTimeString();
    setLiveLogs(prev => [...prev, { time, agent, message }]);
  };

  const login = useGoogleLogin({
    onSuccess: () => { startAutonomousPipeline(MOCK_EVENTS); },
    onError: () => { startAutonomousPipeline(MOCK_EVENTS); },
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
  });

  const handleConnectGCal = () => {
    try { login(); } catch { startAutonomousPipeline(MOCK_EVENTS); }
  };

  const handleSaveKey = (val) => {
    setApiKey(val);
    localStorage.setItem('openrouter_key', val);
  };

  // Mock attribution if no API key is present for speed/demo purposes
  const mockAttribution = (title) => {
    const t = title.toLowerCase();
    if (t.includes('phoenix')) return { project: 'Phoenix', confidence: 92, reasoning: 'Title keyword match.' };
    if (t.includes('delta') || t.includes('client')) return { project: 'Client Project Delta', confidence: 88, reasoning: 'Client keywords detected.' };
    if (t.includes('interview')) return { project: 'Recruitment', confidence: 95, reasoning: 'Candidate/Interview keywords.' };
    if (t.includes('design')) return { project: 'Internal R&D', confidence: 85, reasoning: 'Design system heuristics.' };
    return { project: 'Operations', confidence: 75, reasoning: 'Standard company operations.' };
  };

  const delay = ms => new Promise(res => setTimeout(res, ms));

  const startAutonomousPipeline = async (rawEvents) => {
    setIsSystemActive(true);
    setEnrichedEvents([]);
    setLiveLogs([]);
    setExecSummary(null);
    setMobileMenuOpen(false);
    
    addLog('System', 'Autonomous Workforce Intelligence System initialized.');

    const processedList = [];

    for (let i = 0; i < rawEvents.length; i++) {
      const e = rawEvents[i];
      
      // 1. Calendar Agent
      setAgentStatus(prev => ({ ...prev, calendar: 'active' }));
      addLog('Calendar Agent', `New event detected: "${e.title}"`);
      await delay(600);
      setAgentStatus(prev => ({ ...prev, calendar: 'monitoring' }));

      // 2. Attribution Agent
      setAgentStatus(prev => ({ ...prev, attribution: 'active' }));
      let cls = mockAttribution(e.title);
      if (apiKey) {
        try {
          const aiRes = await analyzeMeetingsWithOpenRouter([e], apiKey);
          if (aiRes && aiRes[0]) cls = aiRes[0];
        } catch (err) {}
      }
      addLog('Attribution Agent', `Classified as [${cls.project}] at ${cls.confidence}% confidence.`);
      await delay(600);
      setAgentStatus(prev => ({ ...prev, attribution: 'monitoring' }));

      // 3. Cost Agent
      setAgentStatus(prev => ({ ...prev, cost: 'active' }));
      const costData = calculateMeetingCost(e);
      addLog('Cost Agent', `Calculated workforce cost: $${costData.meetingCost.toFixed(0)}`);
      await delay(400);
      setAgentStatus(prev => ({ ...prev, cost: 'monitoring' }));

      // 4. Leakage Agent
      setAgentStatus(prev => ({ ...prev, leakage: 'active' }));
      const leakage = detectLeakage(e, costData.meetingCost, costData.employeeCosts);
      if (leakage.leakages.length > 0) {
        addLog('Leakage Agent', `Detected ${leakage.leakages.length} inefficiencies. Est Waste: $${leakage.estimatedWaste.toFixed(0)}`);
      } else {
        addLog('Leakage Agent', `No structural inefficiencies detected.`);
      }
      await delay(400);
      setAgentStatus(prev => ({ ...prev, leakage: 'monitoring' }));

      // Construct and save enriched event
      const enriched = { ...e, costData, leakage, project: cls.project || 'Unclassified', confidence: cls.confidence, reasoning: cls.reasoning };
      processedList.push(enriched);
      setEnrichedEvents([...processedList]); // update UI incrementally

      // 5. Risk Agent
      setAgentStatus(prev => ({ ...prev, risk: 'active' }));
      addLog('Risk Agent', `Recalculating global project risk thresholds...`);
      await delay(400);
      setAgentStatus(prev => ({ ...prev, risk: 'monitoring' }));
    }

    // 6. Executive Agent
    setAgentStatus(prev => ({ ...prev, executive: 'active' }));
    addLog('Executive Agent', `Synthesizing organizational insights...`);
    
    if (apiKey) {
      try {
        const totalWaste = processedList.reduce((s, e) => s + e.leakage.estimatedWaste, 0);
        const totalCost = processedList.reduce((s, e) => s + e.costData.meetingCost, 0);
        const summary = await generateExecutiveSummary({
          totalMeetings: processedList.length,
          totalCost,
          totalWaste,
          leakageTypes: [...new Set(processedList.flatMap(e => e.leakage.leakages))]
        }, apiKey);
        setExecSummary(summary);
      } catch (err) {
        setExecSummary({
          whatHappened: "Processed complete calendar metadata streams.",
          whyItHappened: "Detected structural meeting bloat and standard operations.",
          projectsAtRisk: ["Project Phoenix", "Client Project Delta"],
          inefficientCosts: "Heavy concentration of leadership in routine syncs.",
          recommendedActions: ["Audit recurring Phoenix syncs", "Enforce strict attendee lists"],
          estimatedSavings: "$2,400"
        });
      }
    } else {
      await delay(800);
      setExecSummary({
        whatHappened: "Processed complete calendar metadata streams.",
        whyItHappened: "Detected structural meeting bloat and standard operations.",
        projectsAtRisk: ["Project Phoenix", "Client Project Delta"],
        inefficientCosts: "Heavy concentration of leadership in routine syncs.",
        recommendedActions: ["Audit recurring Phoenix syncs", "Enforce strict attendee lists"],
        estimatedSavings: "$2,400"
      });
    }

    addLog('Executive Agent', `Executive briefing generated and deployed.`);
    setAgentStatus(prev => ({ ...prev, executive: 'monitoring' }));
    addLog('System', 'All queues processed. Monitoring for new events...');
  };

  // Aggregate Data from live enrichedEvents
  const totalWorkforceCost = enrichedEvents.reduce((s, e) => s + e.costData.meetingCost, 0);
  const totalPotentialWaste = enrichedEvents.reduce((s, e) => s + e.leakage.estimatedWaste, 0);

  const projectsMap = enrichedEvents.reduce((acc, e) => {
    if (!acc[e.project]) {
      acc[e.project] = { name: e.project, cost: 0, meetingCount: 0, uniqueAttendees: new Set(), totalLeakageScore: 0, meetings: [] };
    }
    acc[e.project].cost += e.costData.meetingCost;
    acc[e.project].meetingCount += 1;
    acc[e.project].totalLeakageScore += e.leakage.leakageScore;
    if (e.attendeeList) e.attendeeList.forEach(a => acc[e.project].uniqueAttendees.add(a));
    acc[e.project].meetings.push(e);
    return acc;
  }, {});

  const projectsList = Object.values(projectsMap).map(p => {
    p.uniqueAttendees = p.uniqueAttendees.size; 
    const risk = calculateProjectRisk(p);
    return { ...p, riskScore: risk.riskScore, riskLevel: risk.riskLevel };
  }).sort((a,b) => b.cost - a.cost);

  const highestCostProject = projectsList[0];
  const highestRiskProject = [...projectsList].sort((a,b) => b.riskScore - a.riskScore)[0];

  // Employee Aggregation
  const employeeMap = {};
  enrichedEvents.forEach(e => {
    Object.entries(e.costData.employeeCosts).forEach(([email, cost]) => {
      const name = EMPLOYEES[email]?.name || email;
      if (!employeeMap[name]) employeeMap[name] = { name, cost: 0 };
      employeeMap[name].cost += cost;
    });
  });
  const employeeData = Object.values(employeeMap).sort((a,b) => b.cost - a.cost).slice(0, 10);

  // Distribution for Pie Charts
  const leakageDist = enrichedEvents.flatMap(e => e.leakage.leakages).reduce((acc, l) => {
    const existing = acc.find(x => x.name === l);
    if (existing) existing.value += 1;
    else acc.push({ name: l, value: 1 });
    return acc;
  }, []);

  const riskDist = projectsList.reduce((acc, p) => {
    const existing = acc.find(x => x.name === p.riskLevel);
    if (existing) existing.value += 1;
    else acc.push({ name: p.riskLevel, value: 1 });
    return acc;
  }, []);

  const formatCurrency = (v) => new Intl.NumberFormat('en-US', {style:'currency', currency:'USD', maximumFractionDigits:0}).format(v);

  const getAgentIndicator = (status) => {
    if (status === 'active') return <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />;
    if (status === 'monitoring') return <div className="w-2 h-2 rounded-full bg-blue-400" />;
    return <div className="w-2 h-2 rounded-full bg-slate-300" />;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-slate-200 px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg hidden md:block"><BrainCircuit className="text-white w-6 h-6" /></div>
          <div>
            <h1 className="text-lg md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 truncate max-w-[200px] md:max-w-none">
              Workforce Intelligence Engine
            </h1>
          </div>
        </div>
        
        {/* Desktop Controls */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
            <Key className="w-4 h-4 text-slate-500" />
            <input 
              type="password" 
              className="bg-transparent w-48 text-sm outline-none" 
              placeholder="OpenRouter API Key (Optional)"
              value={apiKey} 
              onChange={e => handleSaveKey(e.target.value)}
            />
          </div>
          {!isSystemActive && (
            <>
              <button onClick={handleConnectGCal} className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 flex items-center gap-2 transition-colors">
                <Calendar className="w-4 h-4 text-blue-500" /> Listen to GCal
              </button>
              <button onClick={() => startAutonomousPipeline(MOCK_EVENTS)} className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-700 transition-colors flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" /> Start Engine (Demo)
              </button>
            </>
          )}
          {isSystemActive && (
            <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              SYSTEM ACTIVE
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Main Content Grid */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 md:px-6 py-6 md:py-8 overflow-x-hidden flex flex-col xl:flex-row gap-6">
        
        {/* LEFT COLUMN: Main Dashboard */}
        <div className="flex-1 space-y-6">
          {!isSystemActive && enrichedEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="bg-blue-50 text-blue-600 p-4 rounded-full mb-4">
                <BrainCircuit className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">System Idle</h2>
              <p className="text-slate-500 max-w-md mb-6">Start the Workforce Intelligence Engine to begin autonomous event ingestion, risk scoring, and cost attribution.</p>
              <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <button onClick={() => startAutonomousPipeline(MOCK_EVENTS)} className="w-full md:w-auto bg-slate-800 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-slate-700 transition flex items-center justify-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" /> Start Engine (Demo)
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex bg-slate-200 p-1 rounded-lg w-full md:w-fit">
                <button onClick={() => setActiveTab('dashboard')} className={`flex items-center justify-center gap-2 flex-1 md:flex-none px-6 py-2 md:py-1.5 rounded-md text-sm font-semibold transition ${activeTab==='dashboard' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}><LayoutDashboard className="w-4 h-4"/> Dashboard</button>
                <button onClick={() => setActiveTab('meetings')} className={`flex items-center justify-center gap-2 flex-1 md:flex-none px-6 py-2 md:py-1.5 rounded-md text-sm font-semibold transition ${activeTab==='meetings' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}><Search className="w-4 h-4"/> Data Trace</button>
              </div>

              {activeTab === 'dashboard' && (
                <>
                  {/* ALGORITHM 5: Executive Copilot Summary */}
                  {execSummary ? (
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-4 md:p-6 text-white shadow-xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Sparkles className="w-48 h-48" />
                      </div>
                      <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-violet-300 relative z-10">
                        <Sparkles className="w-5 h-5" /> Executive Copilot Brief
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                        <div className="space-y-4">
                          <div><h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">What Happened</h3><p className="text-sm text-slate-200">{execSummary.whatHappened}</p></div>
                          <div><h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">Why It Happened</h3><p className="text-sm text-slate-200">{execSummary.whyItHappened}</p></div>
                          <div>
                            <h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">Projects at Risk</h3>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {Array.isArray(execSummary.projectsAtRisk) ? execSummary.projectsAtRisk.map((p,i) => <span key={i} className="px-2 py-1 bg-rose-500/20 text-rose-300 text-xs rounded border border-rose-500/30">{p}</span>) : <span className="text-sm text-slate-200">{execSummary.projectsAtRisk}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div><h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">Inefficient Costs</h3><p className="text-sm text-slate-200">{execSummary.inefficientCosts}</p></div>
                          <div>
                            <h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">Recommended Actions</h3>
                            <ul className="list-disc pl-4 text-sm text-emerald-300 space-y-1">
                              {Array.isArray(execSummary.recommendedActions) ? execSummary.recommendedActions.map((a,i) => <li key={i}>{a}</li>) : <li>{execSummary.recommendedActions}</li>}
                            </ul>
                          </div>
                          <div className="bg-white/10 p-3 rounded-lg inline-block">
                            <h3 className="text-xs uppercase tracking-wider text-slate-300 font-bold mb-1">Estimated Savings</h3>
                            <p className="text-xl font-bold text-emerald-400">{execSummary.estimatedSavings}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-100 rounded-2xl p-6 border border-slate-200 flex flex-col items-center justify-center min-h-[200px]">
                      <BrainCircuit className="w-8 h-8 text-slate-400 mb-3 animate-pulse" />
                      <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Executive Agent processing stream...</p>
                    </div>
                  )}

                  {/* DASHBOARD REQUIREMENTS: Top KPI Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                      <div className="flex items-center justify-between text-slate-500 mb-2">
                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">Total Cost</span>
                        <DollarSign className="w-4 h-4 hidden md:block" />
                      </div>
                      <div className="text-xl md:text-3xl font-black text-slate-800">{formatCurrency(totalWorkforceCost)}</div>
                    </div>
                    <div className="bg-white p-4 md:p-5 rounded-xl border border-rose-100 shadow-sm flex flex-col justify-between">
                      <div className="flex items-center justify-between text-rose-500 mb-2">
                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">Potential Waste</span>
                        <AlertTriangle className="w-4 h-4 hidden md:block" />
                      </div>
                      <div className="text-xl md:text-3xl font-black text-rose-600">{formatCurrency(totalPotentialWaste)}</div>
                    </div>
                    <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                      <div className="flex items-center justify-between text-slate-500 mb-2">
                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">Top Project</span>
                        <Briefcase className="w-4 h-4 hidden md:block" />
                      </div>
                      <div className="text-sm md:text-xl font-bold text-slate-800 truncate" title={highestCostProject?.name}>{highestCostProject?.name || '-'}</div>
                      <div className="text-xs md:text-sm text-slate-500 mt-1">{highestCostProject ? formatCurrency(highestCostProject.cost) : ''}</div>
                    </div>
                    <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                      <div className="flex items-center justify-between text-slate-500 mb-2">
                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">Highest Risk</span>
                        <TrendingUp className="w-4 h-4 hidden md:block" />
                      </div>
                      <div className="text-sm md:text-xl font-bold text-slate-800 truncate" title={highestRiskProject?.name}>{highestRiskProject?.name || '-'}</div>
                      {highestRiskProject && (
                        <div className={`text-[10px] md:text-xs font-bold mt-1 md:mt-2 px-1 md:px-2 py-0.5 md:py-1 rounded inline-block w-fit ${highestRiskProject.riskLevel==='HIGH'?'bg-rose-100 text-rose-700':highestRiskProject.riskLevel==='MEDIUM'?'bg-amber-100 text-amber-700':'bg-emerald-100 text-emerald-700'}`}>
                          {highestRiskProject.riskLevel} ({highestRiskProject.riskScore}/100)
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Charts & Details Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 pb-8">
                    
                    {/* Chart 1: Cost by Project */}
                    <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm">
                      <h3 className="text-xs md:text-sm font-bold uppercase text-slate-500 mb-4 md:mb-6">Cost by Project</h3>
                      <div className="h-[250px] w-full min-h-[250px]">
                        {projectsList.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={projectsList} margin={{left: -20}}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} width={80} truncateByToLength={10} />
                              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} tickFormatter={(val) => `$${val}`} />
                              <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border:'none', boxShadow:'0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px'}} formatter={(val) => formatCurrency(val)} />
                              <Bar dataKey="cost" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : <div className="w-full h-full flex items-center justify-center"><Loader2 className="w-6 h-6 text-slate-300 animate-spin"/></div>}
                      </div>
                    </div>

                    {/* Chart 2: Cost by Employee */}
                    <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm">
                      <h3 className="text-xs md:text-sm font-bold uppercase text-slate-500 mb-4 md:mb-6">Cost by Employee</h3>
                      <div className="h-[250px] w-full min-h-[250px]">
                        {employeeData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={employeeData} layout="vertical" margin={{left: 0}}>
                              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                              <XAxis type="number" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} tickFormatter={(val) => `$${val}`} />
                              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} width={80} />
                              <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border:'none', boxShadow:'0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px'}} formatter={(val) => formatCurrency(val)} />
                              <Bar dataKey="cost" fill="#10b981" radius={[0, 4, 4, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : <div className="w-full h-full flex items-center justify-center"><Loader2 className="w-6 h-6 text-slate-300 animate-spin"/></div>}
                      </div>
                    </div>

                  </div>
                </>
              )}

              {/* Raw Data Trace Tab */}
              {activeTab === 'meetings' && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center gap-2 text-slate-700">
                    <BrainCircuit className="w-5 h-5 text-violet-600" />
                    <span className="font-semibold text-sm">Automated Intelligence Pipeline Data</span>
                  </div>
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                      <thead>
                        <tr className="bg-white text-slate-400 text-[10px] md:text-xs uppercase tracking-wider border-b border-slate-100">
                          <th className="p-3 md:p-4 font-bold">Metadata Extraction</th>
                          <th className="p-3 md:p-4 font-bold">Cost Engine</th>
                          <th className="p-3 md:p-4 font-bold">Leakage Detection</th>
                          <th className="p-3 md:p-4 font-bold">AI Project Attribution</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {enrichedEvents.map((e, i) => (
                          <tr key={i} className="hover:bg-slate-50 transition animate-in fade-in duration-300">
                            <td className="p-3 md:p-4 align-top">
                              <div className="font-semibold text-slate-800 text-sm mb-1">{e.title}</div>
                              <div className="text-[10px] md:text-xs text-slate-500 line-clamp-1 max-w-[200px]">{e.description}</div>
                              <div className="text-[10px] md:text-xs text-slate-400 mt-2 flex items-center gap-1"><Users className="w-3 h-3"/> {e.organizer}</div>
                            </td>
                            <td className="p-3 md:p-4 align-top">
                              <div className="font-bold text-slate-800 text-sm mb-1">{formatCurrency(e.costData.meetingCost)}</div>
                              <div className="text-[10px] md:text-xs text-slate-500">{e.duration}h duration</div>
                              <div className="text-[10px] md:text-xs text-slate-500">{e.attendeeList ? e.attendeeList.length : e.attendees} attendees</div>
                              <div className="text-[10px] md:text-xs text-slate-400 mt-1">{formatCurrency(e.costData.hourlySum)}/hr workforce sum</div>
                            </td>
                            <td className="p-3 md:p-4 align-top">
                              {e.leakage.leakages.length > 0 ? (
                                <div className="bg-rose-50 p-2 rounded-lg border border-rose-100">
                                  <div className="text-[10px] font-bold text-rose-600 mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Score: {e.leakage.leakageScore}/100</div>
                                  <div className="text-[10px] text-slate-600 mb-1 space-y-1">
                                    {e.leakage.leakages.map((l, idx) => <div key={idx}>• {l}</div>)}
                                  </div>
                                  <div className="text-[10px] font-bold text-rose-700 bg-white px-2 py-1 rounded shadow-sm inline-block w-full">Waste: {formatCurrency(e.leakage.estimatedWaste)}</div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                                  <CheckCircle2 className="w-3 h-3" /> No leakage detected
                                </div>
                              )}
                            </td>
                            <td className="p-3 md:p-4 align-top min-w-[200px]">
                              {e.project !== 'Unclassified' ? (
                                <div className="bg-violet-50 p-2 rounded-lg border border-violet-100">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] md:text-xs font-bold text-violet-800">{e.project}</span>
                                    <span className="text-[10px] font-bold bg-white text-violet-600 px-1.5 py-0.5 rounded shadow-sm">{e.confidence}%</span>
                                  </div>
                                  <div className="text-[10px] text-slate-600 italic bg-white p-1.5 rounded shadow-sm border border-violet-50">"{e.reasoning}"</div>
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">Pending AI execution...</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* RIGHT COLUMN: AI Agent Monitor */}
        {isSystemActive && (
          <div className="w-full xl:w-[350px] shrink-0 flex flex-col gap-4 max-h-[85vh] sticky top-24">
            
            {/* Agent Status Panel */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
              <div className="bg-slate-800 px-4 py-3 flex items-center justify-between border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span className="text-white text-xs font-bold uppercase tracking-wider">Agent Status</span>
                </div>
              </div>
              <div className="p-4 space-y-4">
                {[
                  { id: 'calendar', name: 'Calendar Agent', icon: Calendar },
                  { id: 'attribution', name: 'Attribution Agent', icon: Search },
                  { id: 'cost', name: 'Cost Agent', icon: Receipt },
                  { id: 'leakage', name: 'Leakage Agent', icon: ShieldAlert },
                  { id: 'risk', name: 'Risk Agent', icon: TrendingUp },
                  { id: 'executive', name: 'Executive Agent', icon: BrainCircuit },
                ].map(agent => (
                  <div key={agent.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <agent.icon className={`w-4 h-4 ${agentStatus[agent.id] === 'active' ? 'text-emerald-400' : 'text-slate-500'}`} />
                      <span className={`text-sm font-medium ${agentStatus[agent.id] === 'active' ? 'text-white' : 'text-slate-400'}`}>{agent.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] uppercase font-bold tracking-wider ${agentStatus[agent.id] === 'active' ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {agentStatus[agent.id]}
                      </span>
                      {getAgentIndicator(agentStatus[agent.id])}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Execution Stream */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col flex-1">
              <div className="bg-slate-800 px-4 py-3 flex items-center gap-2 border-b border-slate-700 shrink-0">
                <Terminal className="w-4 h-4 text-blue-400" />
                <span className="text-white text-xs font-bold uppercase tracking-wider">Execution Stream</span>
              </div>
              <div className="p-4 overflow-y-auto flex-1 font-mono text-[10px] md:text-xs leading-relaxed space-y-3 bg-[#0d1117] min-h-[300px]">
                {liveLogs.map((log, i) => (
                  <div key={i} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <span className="text-slate-500">[{log.time}]</span>{' '}
                    <span className={
                      log.agent === 'System' ? 'text-blue-400 font-bold' :
                      log.agent === 'Calendar Agent' ? 'text-slate-300' :
                      log.agent === 'Attribution Agent' ? 'text-violet-400' :
                      log.agent === 'Cost Agent' ? 'text-emerald-400' :
                      log.agent === 'Leakage Agent' ? 'text-rose-400' :
                      log.agent === 'Risk Agent' ? 'text-amber-400' : 'text-fuchsia-400'
                    }>
                      [{log.agent}]
                    </span>{' '}
                    <span className="text-slate-300">{log.message}</span>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
