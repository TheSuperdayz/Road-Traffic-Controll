
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Alert, AlertSeverity, Incident, DriverBehaviorState, Unit, DEFAULT_CATEGORIES, AlertCategory, IncidentOutcome } from '../types';
import { 
  ShieldAlert, 
  Clock, 
  Play, 
  MapPin, 
  Camera, 
  User, 
  FileText, 
  ChevronRight, 
  Phone, 
  Share2, 
  CheckCircle2, 
  Activity, 
  Search,
  Filter,
  AlertTriangle,
  History,
  Grid,
  Archive,
  Inbox,
  Lock,
  UserCheck,
  EyeOff,
  RefreshCw,
  LayoutGrid,
  List,
  Eye,
  CircleStop,
  CameraOff,
  Navigation,
  FolderArchive,
  UserMinus,
  Timer as TimerIcon,
  ThumbsUp,
  ThumbsDown,
  X,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  UserRoundX,
  Forward,
  ZapOff,
  Sparkles,
  Zap,
  CheckCircle,
  BrainCircuit,
  Wand2,
  Target,
  BarChart3,
  Dna,
  Binary
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { useNavigate } from 'react-router-dom';

const REASSIGNMENT_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes in milliseconds

const getEventConfig = (event: string) => {
  const e = event.toLowerCase();
  
  if (e.includes('operator') || e.includes('manual') || e.includes('intervention')) {
    return { icon: User, bg: 'bg-zinc-900', text: 'text-white', border: 'border-zinc-800' };
  }
  
  if (e.includes('dms') || e.includes('drowsiness') || e.includes('distraction')) {
    return { icon: Eye, bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' };
  }
  
  if (e.includes('stopped') || e.includes('stop')) {
    return { icon: CircleStop, bg: 'bg-rose-100', text: 'text-rose-600', border: 'border-rose-200' };
  }
  
  if (e.includes('escalation') || e.includes('breach') || e.includes('unauthorized') || e.includes('deadline')) {
    return { icon: ShieldAlert, bg: 'bg-rose-100', text: 'text-rose-600', border: 'border-rose-200' };
  }
  
  if (e.includes('deviation') || e.includes('route')) {
    return { icon: Navigation, bg: 'bg-amber-100', text: 'text-amber-600', border: 'border-amber-200' };
  }
  
  if (e.includes('call') || e.includes('comm')) {
    return { icon: Phone, bg: 'bg-indigo-100', text: 'text-indigo-600', border: 'border-indigo-200' };
  }
  
  if (e.includes('blockage') || e.includes('frozen') || e.includes('log')) {
    return { icon: Lock, bg: 'bg-zinc-100', text: 'text-zinc-500', border: 'border-zinc-200' };
  }

  return { icon: Activity, bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' };
};

interface Props {
  alerts: Alert[];
  onAddTicket?: (ticket: { unitId: string; driverName: string; issue: string; assignedTo: string }) => void;
  units: Unit[];
  incidents: Incident[];
  onUpdateStatus: (id: string, status: Incident['status']) => void;
  onUpdateCategory?: (id: string, category: AlertCategory) => void;
  onAddEvent: (id: string, event: string) => void;
  onSetOutcome: (id: string, outcome: IncidentOutcome) => void;
}

const IncidentWorkspace: React.FC<Props> = ({ alerts, onAddTicket, units, incidents, onUpdateStatus, onUpdateCategory, onAddEvent, onSetOutcome }) => {
  const [currentTab, setCurrentTab] = useState<'active' | 'archived'>('active');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(incidents[0]?.id || '');
  const [isSelectingOutcome, setIsSelectingOutcome] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{ [key: string]: string }>({});
  const [loadingAi, setLoadingAi] = useState(false);
  const [loadingTriage, setLoadingTriage] = useState(false);
  const [triageSuggestion, setTriageSuggestion] = useState<{ [key: string]: { category: AlertCategory, reasoning: string, confidence: number } }>({});
  const [now, setNow] = useState(Date.now());
  const [showFeedback, setShowFeedback] = useState(false);
  const navigate = useNavigate();

  const initializedIncidents = useRef<Set<string>>(new Set());
  const reassignedIncidents = useRef<Set<string>>(new Set());
  const triageAttempts = useRef<Set<string>>(new Set());

  useEffect(() => {
    const inc = incidents.find(i => i.id === selectedIncidentId);
    if (inc && !inc.category && !triageSuggestion[inc.id] && !loadingTriage && !triageAttempts.current.has(inc.id)) {
      triageIncidentWithAi();
    }
  }, [selectedIncidentId, incidents]);

  useEffect(() => {
    incidents.forEach(inc => {
      if (inc.status === 'OPEN' && !initializedIncidents.current.has(inc.id)) {
        if (!inc.lastActivityTime) {
          onAddEvent(inc.id, 'System: Incident visible to response cluster - 5m timer active.');
        }
        initializedIncidents.current.add(inc.id);
      }
    });
  }, [incidents, onAddEvent]);

  useEffect(() => {
    const timer = setInterval(() => {
      const currentTime = Date.now();
      setNow(currentTime);
      
      incidents.forEach(inc => {
        if (inc.status === 'OPEN' && inc.lastActivityTime) {
          const timeElapsed = currentTime - inc.lastActivityTime;
          if (timeElapsed >= REASSIGNMENT_THRESHOLD_MS && !reassignedIncidents.current.has(inc.id)) {
            reassignedIncidents.current.add(inc.id);
            onUpdateStatus(inc.id, 'ESCALATED');
            onAddEvent(inc.id, 'System Alert: SLA BREACH - 5m timeout reached. Incident reassigned to Lead Supervisor Terminal.');
          }
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [incidents, onUpdateStatus, onAddEvent]);

  const filteredIncidents = useMemo(() => {
    return incidents.filter(inc => {
      if (currentTab === 'active') {
        // Active includes OPEN, ESCALATED, and HSSE_ESCALATED
        return inc.status !== 'CLOSED';
      } else {
        // Archived specifically means CLOSED
        return inc.status === 'CLOSED';
      }
    });
  }, [incidents, currentTab]);

  const selectedIncident = useMemo(() => {
    const found = filteredIncidents.find(inc => inc.id === selectedIncidentId);
    return found || filteredIncidents[0] || null;
  }, [filteredIncidents, selectedIncidentId]);

  useEffect(() => {
    if (filteredIncidents.length > 0 && !filteredIncidents.some(i => i.id === selectedIncidentId)) {
      setSelectedIncidentId(filteredIncidents[0].id);
    }
  }, [currentTab, filteredIncidents]);

  const handleBeginResolve = () => {
    setIsSelectingOutcome(true);
  };

  const finalizeOutcome = (id: string, outcome: IncidentOutcome) => {
    onSetOutcome(id, outcome);
    onAddEvent(id, `Operator: Case finalized with outcome: ${outcome.replace('_', ' ')}.`);
    onAddEvent(id, 'System: Behavioral telemetry tagged for AI training loop.');
    setIsSelectingOutcome(false);
  }

  const handleReopen = (id: string) => {
    onUpdateStatus(id, 'OPEN');
    onAddEvent(id, 'Operator: Incident reclaimed and restored to active response queue');
  };

  const handleCallDriver = () => {
    if (selectedIncident) {
      onAddEvent(selectedIncident.id, 'Operator: Initiated emergency cabin-voice intervention');
      setShowFeedback(true);
    }
  };

  const triageIncidentWithAi = async () => {
    const targetId = selectedIncidentId;
    if (!targetId || triageAttempts.current.has(targetId)) return;
    
    const inc = incidents.find(i => i.id === targetId);
    if (!inc) return;

    triageAttempts.current.add(targetId);
    setLoadingTriage(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `You are a Senior Logistics Risk Assessor for high-risk fuel distribution. 
      Analyze the following incident dossier and suggest the BEST classification from this exact list: [${DEFAULT_CATEGORIES.join(', ')}].
      
      Incident ID: ${inc.id}
      Severity: ${inc.severity}
      Timeline:
      ${inc.timeline.map(t => `- ${t.time}: ${t.event}`).join('\n')}
      
      Respond in JSON format only: 
      { "category": "category_name", "reasoning": "brief explanation", "confidence": 0.0-1.0 }`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          systemInstruction: "You only suggest categories from the provided list. If the timeline suggests driver fatigue or eyes closed, use DMS_Fatigue. If it suggests distraction or mobile use, use DMS_Distraction. If it involves unauthorized routes or stops, use Security or Compliance. If it is about hardware or sensors, use Operational.",
        }
      });
      
      const result = JSON.parse(response.text || '{}');
      if (result.category && result.reasoning) {
        setTriageSuggestion(prev => ({ 
          ...prev, 
          [targetId]: { category: result.category, reasoning: result.reasoning, confidence: result.confidence || 0.8 } 
        }));
      }
    } catch (err) {
      console.error("AI Triage failed", err);
      triageAttempts.current.delete(targetId);
    } finally {
      setLoadingTriage(false);
    }
  };

  const applyAiCategory = (id: string, category: AlertCategory) => {
    if (onUpdateCategory) {
      onUpdateCategory(id, category);
      onAddEvent(id, `System: Incident triaged as ${category} via AI logic correlation.`);
      setTriageSuggestion(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }
  };

  const handleFeedback = (quality: 'good' | 'bad') => {
    if (!selectedIncident) return;

    if (quality === 'bad' && onAddTicket) {
      const unit = units.find(u => u.id === selectedIncident.unitId);
      onAddTicket({
        unitId: selectedIncident.unitId,
        driverName: unit?.driverName || 'Unknown Driver',
        issue: 'Critical Audio Quality Degradation / Communication Failure',
        assignedTo: 'Technician Team A'
      });
      onAddEvent(selectedIncident.id, 'Operator: Poor voice quality reported - Maintenance hardware ticket generated');
    } else {
      onAddEvent(selectedIncident.id, 'Operator: Voice intervention confirmed successful - Audio quality clear');
    }

    onAddEvent(selectedIncident.id, 'System: Post-intervention protocol complete. Moving case to outcome audit.');
    setIsSelectingOutcome(true);
    setShowFeedback(false);
  };

  const handleHseEscalation = () => {
    if (selectedIncident) {
      onUpdateStatus(selectedIncident.id, 'HSSE_ESCALATED');
      onAddEvent(selectedIncident.id, 'Operator: High-risk security/safety breach - Escalated to Field HSE Teams');
      navigate('/hse');
    }
  };

  const analyzeIncidentWithAi = async () => {
    if (!selectedIncident) return;
    onAddEvent(selectedIncident.id, 'System: AI Policy Compliance Audit started');
    setLoadingAi(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze this logistics risk event:
        ID: ${selectedIncident.id}
        Unit: ${selectedIncident.unitId}
        Timeline: ${selectedIncident.timeline.map(t => `${t.time}: ${t.event}`).join(', ')}
        Severity: ${selectedIncident.severity}
        
        Analyze Driver Behavior and identify Security Policy breaches.
        Provide: 
        1. Contextual summary.
        2. Compliance failure points.
        3. Recommended intervention protocol.`,
        config: {
          systemInstruction: "You are an Operations Audit AI for high-risk fuel distribution. Be professional, clinical, and fact-oriented.",
        }
      });
      setAiAnalysis(prev => ({ ...prev, [selectedIncident.id]: response.text || "Analysis unavailable." }));
    } catch (err) {
      console.error("AI Analysis failed", err);
      setAiAnalysis(prev => ({ ...prev, [selectedIncident.id]: "Audit engine service interruption." }));
    } finally {
      setLoadingAi(false);
    }
  };

  const formatTimeLeft = (inc: Incident) => {
    if (inc.status !== 'OPEN' || !inc.lastActivityTime) return null;
    const timeLeftMs = REASSIGNMENT_THRESHOLD_MS - (now - inc.lastActivityTime);
    if (timeLeftMs <= 0) return "0:00";
    const minutes = Math.floor(timeLeftMs / 60000);
    const seconds = Math.floor((timeLeftMs % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTimerPercentage = (inc: Incident) => {
    if (!inc.lastActivityTime) return 0;
    const elapsed = now - inc.lastActivityTime;
    return Math.min((elapsed / REASSIGNMENT_THRESHOLD_MS) * 100, 100);
  };

  return (
    <div className="h-full flex gap-6 overflow-hidden relative">
      {/* Call Feedback Interaction */}
      {showFeedback && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] p-10 shadow-2xl max-w-sm w-full border border-gray-100 scale-105 transition-transform">
            <div className="flex justify-between items-start mb-8">
              <div className="bg-blue-600 p-4 rounded-2xl text-white shadow-lg shadow-blue-100">
                <Phone size={28} />
              </div>
              <button onClick={() => setShowFeedback(false)} className="p-2 text-gray-300 hover:text-black transition-colors">
                <X size={24} />
              </button>
            </div>
            <h3 className="text-2xl font-black mb-2">Voice Assessment</h3>
            <p className="text-sm text-gray-500 mb-10 leading-relaxed">
              Distribution unit <span className="text-black font-bold">{selectedIncident?.unitId}</span> call complete. Rate the communication clarity before audit.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => handleFeedback('good')}
                className="flex flex-col items-center gap-3 p-6 rounded-[32px] border border-gray-100 bg-gray-50 hover:bg-emerald-50 hover:border-emerald-100 hover:text-emerald-700 transition-all group"
              >
                <ThumbsUp size={28} className="text-gray-300 group-hover:text-emerald-500 transition-colors" />
                <span className="text-xs font-black uppercase tracking-widest">Clear Link</span>
              </button>
              <button 
                onClick={() => handleFeedback('bad')}
                className="flex flex-col items-center gap-3 p-6 rounded-[32px] border border-gray-100 bg-gray-50 hover:bg-rose-50 hover:border-rose-100 hover:text-rose-700 transition-all group"
              >
                <ThumbsDown size={28} className="text-gray-300 group-hover:text-rose-500 transition-colors" />
                <span className="text-xs font-black uppercase tracking-widest">Poor Audio</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Outcome Selector Modal */}
      {isSelectingOutcome && selectedIncident && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-zinc-950/80 backdrop-blur-xl animate-in fade-in zoom-in duration-300">
          <div className="bg-white rounded-[56px] p-12 shadow-2xl max-w-3xl w-full border border-white/20 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                <Binary size={300} />
             </div>
             
             <div className="flex justify-between items-start mb-12 relative z-10">
                <div className="space-y-1">
                   <div className="flex items-center gap-2 mb-2">
                      <BrainCircuit size={18} className="text-indigo-600 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">AI Feedback Loop Active</span>
                   </div>
                   <h2 className="text-3xl font-black tracking-tight text-zinc-900">Intervention Audit</h2>
                   <p className="text-sm text-zinc-500 font-bold uppercase tracking-widest">Case ID: {selectedIncident.id}</p>
                </div>
                <button onClick={() => setIsSelectingOutcome(false)} className="p-3 bg-zinc-50 text-zinc-400 rounded-2xl hover:bg-zinc-100 transition-all">
                   <X size={24} />
                </button>
             </div>

             <div className="grid grid-cols-2 gap-6 relative z-10 mb-10">
                <OutcomeTile 
                  icon={UserCheck} 
                  label="Driver Responsive" 
                  desc="Behavior corrected immediately after voice protocol."
                  color="emerald"
                  onClick={() => finalizeOutcome(selectedIncident.id, 'RESPONSIVE')}
                />
                <OutcomeTile 
                  icon={CircleStop} 
                  label="Driver Stopped" 
                  desc="Safe stop performed in designated or monitored zone."
                  color="blue"
                  onClick={() => finalizeOutcome(selectedIncident.id, 'STOPPED')}
                />
                <OutcomeTile 
                  icon={ShieldAlert} 
                  label="Escalated" 
                  desc="Case required field HSSE or manual supervisor bypass."
                  color="rose"
                  onClick={() => finalizeOutcome(selectedIncident.id, 'ESCALATED')}
                />
                <OutcomeTile 
                  icon={ZapOff} 
                  label="False Positive" 
                  desc="Sensor glitch, glare, or false AI behavioral trigger."
                  color="zinc"
                  onClick={() => finalizeOutcome(selectedIncident.id, 'FALSE_POSITIVE')}
                />
             </div>

             <div className="bg-zinc-50 p-6 rounded-[32px] border border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-white rounded-2xl border border-zinc-200 text-indigo-600 shadow-sm">
                      <Dna size={20} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-0.5">Neural Training Impact</p>
                      <p className="text-xs font-bold text-zinc-700">Calibrating RTC Prediction Accuracy for {selectedIncident.category?.replace('_', ' ') || 'Behavioral'} streams.</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Left Panel: Regional Response Queue */}
      <div className="w-80 flex flex-col gap-4 overflow-hidden">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight">RTC Response</h2>
          </div>
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button 
              onClick={() => setCurrentTab('active')}
              className={`p-2 rounded-lg transition-all flex items-center gap-2 ${currentTab === 'active' ? 'bg-white shadow-sm text-black' : 'text-gray-400 hover:text-gray-600'}`}
              title="Active Incidents (Awaiting Action)"
            >
              <Inbox size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">{incidents.filter(i => i.status !== 'CLOSED').length}</span>
            </button>
            <button 
              onClick={() => setCurrentTab('archived')}
              className={`p-2 rounded-lg transition-all flex items-center gap-2 ${currentTab === 'archived' ? 'bg-white shadow-sm text-black' : 'text-gray-400 hover:text-gray-600'}`}
              title="History & Reassigned Cases"
            >
              <Archive size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">{incidents.filter(i => i.status === 'CLOSED').length}</span>
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar px-1">
          {filteredIncidents.length > 0 ? filteredIncidents.map((inc) => {
            const timeLeftStr = formatTimeLeft(inc);
            const isUrgent = timeLeftStr && (timeLeftStr.startsWith('0:') || timeLeftStr.startsWith('1:'));
            const timerPercentage = getTimerPercentage(inc);
            const isReassigned = inc.status === 'ESCALATED';
            const isUncategorized = !inc.category;
            
            return (
              <button
                key={inc.id}
                onClick={() => {
                  setSelectedIncidentId(inc.id);
                  if (viewMode === 'grid') setViewMode('list');
                }}
                className={`w-full text-left p-5 rounded-[28px] transition-all border group relative overflow-hidden ${
                  selectedIncident?.id === inc.id && viewMode === 'list'
                    ? 'bg-black border-black text-white shadow-2xl scale-[1.02] z-10' 
                    : isReassigned 
                      ? 'bg-zinc-100 border-zinc-200 opacity-80 grayscale-[0.5] ring-2 ring-rose-500/10' 
                      : 'bg-white border-gray-100 hover:border-gray-300 shadow-sm'
                }`}
              >
                {/* Visual Progress Bar for Active Timer */}
                {inc.status === 'OPEN' && (
                  <div 
                    className={`absolute bottom-0 left-0 h-1.5 transition-all duration-1000 ease-linear ${isUrgent ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' : 'bg-blue-500'}`}
                    style={{ width: `${100 - timerPercentage}%` }}
                  />
                )}

                <div className="flex justify-between items-start mb-3">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${selectedIncident?.id === inc.id && viewMode === 'list' ? 'text-gray-500' : 'text-gray-400'}`}>
                    {inc.id}
                  </span>
                  <div className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                    inc.severity === AlertSeverity.CRITICAL 
                      ? (selectedIncident?.id === inc.id && viewMode === 'list' ? 'bg-red-500/20 text-red-200' : 'bg-red-50 text-red-600') 
                      : (selectedIncident?.id === inc.id && viewMode === 'list' ? 'bg-amber-500/20 text-amber-200' : 'bg-amber-50 text-amber-600')
                  }`}>
                    {inc.severity}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                   <h4 className={`font-black text-sm ${selectedIncident?.id === inc.id && viewMode === 'list' ? 'text-white' : 'text-gray-900'}`}>
                     Unit {inc.unitId}
                   </h4>
                   {isReassigned && <Forward size={14} className="text-rose-600 animate-pulse" />}
                   {isUncategorized && inc.status === 'OPEN' && (
                     <Sparkles size={14} className="text-blue-500 animate-pulse" />
                   )}
                </div>

                {inc.category ? (
                  <p className={`text-[9px] font-black uppercase tracking-[0.2em] mt-2 ${selectedIncident?.id === inc.id && viewMode === 'list' ? 'text-white/60' : 'text-zinc-400'}`}>
                    {inc.category.replace('_', ' ')}
                  </p>
                ) : inc.status === 'OPEN' ? (
                  <p className={`text-[9px] font-black uppercase tracking-[0.2em] mt-2 text-blue-500/60 flex items-center gap-1 animate-pulse`}>
                    <Zap size={10} /> Triage Pending
                  </p>
                ) : null}
                
                {inc.status === 'OPEN' && timeLeftStr && (
                   <div className={`mt-4 flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black tracking-tighter w-fit shadow-sm ${
                     isUrgent 
                       ? (selectedIncident?.id === inc.id && viewMode === 'list' ? 'bg-red-600 border-red-500 text-white animate-pulse' : 'bg-red-50 border-red-100 text-red-600 animate-pulse')
                       : (selectedIncident?.id === inc.id && viewMode === 'list' ? 'bg-white/10 border-white/20 text-gray-400' : 'bg-gray-50 border-gray-100 text-gray-500')
                   }`}>
                      <TimerIcon size={12} strokeWidth={3} />
                      SLA: {timeLeftStr}
                   </div>
                )}

                {isReassigned && (
                  <div className="mt-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-600/10 border border-rose-600/20 text-[10px] font-black text-rose-600 tracking-widest uppercase shadow-inner">
                      <ZapOff size={12} strokeWidth={3} />
                      SLA BREACHED
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 mt-4">
                  <div className={`flex items-center gap-1.5 text-[10px] font-bold ${selectedIncident?.id === inc.id && viewMode === 'list' ? 'text-gray-500' : 'text-gray-400'}`}>
                    <Clock size={12} /> {inc.startTime}
                  </div>
                  {inc.status === 'CLOSED' && <div className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1"><CheckCircle2 size={10}/> {inc.outcome?.replace('_', ' ') || 'Resolved'}</div>}
                </div>
              </button>
            );
          }) : (
            <div className="flex flex-col items-center justify-center py-24 text-gray-300 opacity-60 text-center px-6">
              {currentTab === 'archived' ? <FolderArchive size={48} className="mb-4 text-gray-200" /> : <Inbox size={48} className="mb-4 text-gray-200" />}
              <p className="text-sm font-black uppercase tracking-widest leading-relaxed">
                {currentTab === 'archived' ? 'History Archive Empty' : 'Regional Active Queue Clear'}
              </p>
              <p className="text-[10px] mt-2 italic font-medium">Auto-handover protocol is active for all response zones.</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Incident Dossier View */}
      <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex flex-col space-y-6 overflow-hidden">
            {selectedIncident ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className={`p-4 rounded-[24px] border shadow-lg ${
                      selectedIncident.severity === AlertSeverity.CRITICAL 
                        ? 'bg-rose-100 text-rose-600 border-rose-200 shadow-rose-50' 
                        : 'bg-amber-100 text-amber-600 border-amber-200 shadow-amber-50'
                    }`}>
                      <ShieldAlert size={32} />
                    </div>
                    <div>
                      <div className="flex items-center gap-4">
                        <h2 className="text-3xl font-black tracking-tight">{selectedIncident.id}</h2>
                        {selectedIncident.category ? (
                          <span className="px-3 py-1 bg-zinc-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-zinc-800 shadow-sm">
                            {selectedIncident.category.replace('_', ' ')}
                          </span>
                        ) : selectedIncident.status === 'OPEN' && (
                          <div className="flex items-center gap-2 px-3 py-1 bg-blue-600/10 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-200 animate-pulse">
                            <Sparkles size={12} /> AI Triage In Progress
                          </div>
                        )}
                        <span className="text-gray-400 text-sm flex items-center gap-1.5 font-bold uppercase tracking-tight">
                          <Clock size={16} /> Logged {selectedIncident.startTime}
                        </span>
                      </div>
                      <p className="text-gray-500 font-bold text-lg mt-0.5">Response Protocol for Unit {selectedIncident.unitId}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    {selectedIncident.status === 'OPEN' ? (
                      <button 
                        onClick={handleBeginResolve}
                        className="bg-emerald-600 text-white px-8 py-3 rounded-[20px] text-sm font-black uppercase tracking-widest shadow-xl shadow-emerald-100 flex items-center gap-2 hover:bg-emerald-700 hover:scale-[1.02] active:scale-95 transition-all"
                      >
                        <Archive size={18} /> Close & Archive
                      </button>
                    ) : selectedIncident.status === 'CLOSED' ? (
                      <button 
                        onClick={() => handleReopen(selectedIncident.id)}
                        className="bg-zinc-900 text-white px-8 py-3 rounded-[20px] text-sm font-black uppercase tracking-widest shadow-xl flex items-center gap-2 hover:bg-black hover:scale-[1.02] active:scale-95 transition-all"
                      >
                        <RefreshCw size={18} /> Restore Control
                      </button>
                    ) : (
                      // For ESCALATED or HSSE_ESCALATED cases
                      <div className="flex gap-2">
                        <button 
                          onClick={handleBeginResolve}
                          className="bg-emerald-600 text-white px-6 py-3 rounded-[20px] text-sm font-black uppercase tracking-widest shadow-xl shadow-emerald-100 flex items-center gap-2 hover:bg-emerald-700 transition-all"
                        >
                          <Archive size={18} /> Resolve & Archive
                        </button>
                        <button 
                          onClick={() => handleReopen(selectedIncident.id)}
                          className="bg-zinc-100 text-zinc-600 px-6 py-3 rounded-[20px] text-sm font-black uppercase tracking-widest hover:bg-zinc-200 transition-all"
                        >
                          <RefreshCw size={18} /> Restore Control
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Handover Countdown HUD */}
                {selectedIncident.status === 'OPEN' && (
                  <div className="bg-zinc-950 text-white px-10 py-6 rounded-[40px] relative overflow-hidden shadow-2xl border border-white/5">
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-5">
                        <div className={`p-4 rounded-2xl ${getTimerPercentage(selectedIncident) > 80 ? 'bg-rose-600/20 ring-2 ring-rose-500 shadow-xl shadow-rose-500/20' : 'bg-white/10 ring-1 ring-white/10'} transition-all`}>
                          <TimerIcon size={32} className={getTimerPercentage(selectedIncident) > 80 ? 'text-rose-400 animate-pulse' : 'text-blue-400'} />
                        </div>
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-1">Response Reassignment Deadline</p>
                          <h4 className={`text-3xl font-black tabular-nums tracking-tighter ${getTimerPercentage(selectedIncident) > 80 ? 'text-rose-500' : 'text-white'}`}>
                            {formatTimeLeft(selectedIncident)}
                          </h4>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-1">Queue Status</p>
                        <p className={`text-xs font-black uppercase tracking-widest ${getTimerPercentage(selectedIncident) > 80 ? 'text-rose-400 animate-bounce' : 'text-emerald-400'}`}>
                          {getTimerPercentage(selectedIncident) > 80 ? 'CRITICAL: HANDOVER PENDING' : 'Awaiting Operator Intervention'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-6 w-full h-2 bg-white/5 rounded-full overflow-hidden">
                       <div 
                        className={`h-full transition-all duration-1000 ease-linear ${getTimerPercentage(selectedIncident) > 80 ? 'bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.6)]' : 'bg-blue-600'}`}
                        style={{ width: `${getTimerPercentage(selectedIncident)}%` }}
                       />
                    </div>
                  </div>
                )}

                <div className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">
                  <div className="col-span-8 space-y-6 overflow-y-auto pr-2 pb-12 custom-scrollbar">
                    <div className="bg-zinc-900 rounded-[40px] aspect-video relative overflow-hidden shadow-2xl border-[10px] border-white group ring-1 ring-gray-100">
                      <img 
                        src={`https://picsum.photos/seed/${selectedIncident.id}/1200/675`} 
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-85 transition-opacity duration-700" 
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                         <div className="bg-white/10 backdrop-blur-xl p-8 rounded-full border border-white/20 hover:scale-110 transition-all cursor-pointer shadow-2xl">
                            <Play fill="white" size={40} className="text-white ml-1" />
                         </div>
                      </div>
                      <div className="absolute top-6 left-6 flex gap-2">
                        <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full animate-pulse uppercase tracking-widest">Live Surveillance Feed</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col">
                        <h3 className="text-lg font-black mb-8 flex items-center gap-3 text-zinc-900 uppercase tracking-tight">
                          <History size={20} className="text-zinc-400" /> Event Timeline
                        </h3>
                        <div className="flex-1 space-y-10 relative before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[3px] before:bg-zinc-50">
                          {selectedIncident.timeline.map((item, idx) => {
                            const config = getEventConfig(item.event);
                            const Icon = config.icon;
                            return (
                              <div key={idx} className="flex gap-5 relative group/timeline">
                                <div className={`w-8 h-8 rounded-full ${config.bg} ${config.text} border-4 border-white flex items-center justify-center z-10 shadow-lg ring-1 ring-zinc-50 group-hover/timeline:scale-110 transition-transform`}>
                                  <Icon size={12} strokeWidth={3} />
                                </div>
                                <div className="flex flex-col flex-1 bg-zinc-50/50 p-4 rounded-[24px] border border-zinc-100/50 group-hover/timeline:bg-white group-hover/timeline:border-zinc-200 transition-all">
                                  <div className="flex justify-between items-center mb-1.5">
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                                      <Clock size={12} /> {item.time}
                                    </p>
                                  </div>
                                  <p className="text-sm font-bold text-zinc-800 leading-snug">{item.event}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col">
                        <h3 className="text-lg font-black mb-8 flex items-center gap-3 text-zinc-900 uppercase tracking-tight">
                          <FileText size={20} className="text-zinc-400" /> Integrity Evidence
                        </h3>
                        <div className="space-y-4 flex-1">
                          <EvidenceItem label="DMS Facial Telemetry" type="IMAGE" onClick={() => onAddEvent(selectedIncident.id, 'Operator: Re-audited cabin facial telemetry')} />
                          <EvidenceItem label="Behavioral Clip (7s Loop)" type="VIDEO" onClick={() => onAddEvent(selectedIncident.id, 'Operator: Reviewed behavioral event video')} />
                          <EvidenceItem label="G-Force Diagnostic Stream" type="DATA" onClick={() => onAddEvent(selectedIncident.id, 'Operator: Evaluated telemetry sensor stream')} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-4 space-y-6 overflow-y-auto custom-scrollbar">
                    {selectedIncident.status === 'OPEN' && !selectedIncident.category && (
                      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-8 rounded-[40px] border border-blue-100 shadow-xl relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                            <BrainCircuit size={80} />
                         </div>
                         <h3 className="text-xl font-black mb-2 flex items-center gap-2 tracking-tight text-indigo-900">
                           <Sparkles size={20} className="text-blue-600 animate-pulse" /> AI Smart Triage
                         </h3>
                         <p className="text-xs text-indigo-700/70 font-bold mb-6 leading-relaxed">
                           Gemini is correlating behavioral telemetry with compliance logs to suggest a regulatory category.
                         </p>

                         {loadingTriage ? (
                           <div className="flex flex-col items-center justify-center py-6 gap-3">
                              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest animate-pulse">Analyzing Timeline...</span>
                           </div>
                         ) : triageSuggestion[selectedIncident.id] ? (
                           <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                              <div className="bg-white p-5 rounded-3xl border border-indigo-100 shadow-sm ring-1 ring-blue-50">
                                 <div className="flex justify-between items-center mb-2">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Suggested Classification</p>
                                    <span className="text-[10px] font-black text-emerald-600 flex items-center gap-1">
                                       <Target size={10}/> {Math.round(triageSuggestion[selectedIncident.id].confidence * 100)}% Match
                                    </span>
                                 </div>
                                 <p className="text-lg font-black text-indigo-600">{triageSuggestion[selectedIncident.id].category.replace('_', ' ')}</p>
                                 <p className="text-[11px] text-gray-500 mt-3 font-medium leading-relaxed bg-indigo-50/30 p-3 rounded-xl border border-indigo-50">
                                    <Wand2 size={12} className="inline mr-2 mb-0.5 text-indigo-400" />
                                    {triageSuggestion[selectedIncident.id].reasoning}
                                 </p>
                              </div>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => applyAiCategory(selectedIncident.id, triageSuggestion[selectedIncident.id].category)}
                                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                                >
                                  Confirm & Classify
                                </button>
                                <button 
                                  onClick={() => {
                                    triageAttempts.current.delete(selectedIncident.id);
                                    triageIncidentWithAi();
                                  }}
                                  className="px-5 py-4 bg-white text-gray-400 rounded-2xl border border-indigo-100 hover:text-indigo-600 transition-all shadow-sm"
                                  title="Re-run AI Triage"
                                >
                                  <RefreshCw size={16} />
                                </button>
                              </div>
                           </div>
                         ) : (
                           <div className="flex flex-col items-center justify-center py-6 text-indigo-400/50">
                              <BrainCircuit size={32} className="mb-2 opacity-20" />
                              <p className="text-[10px] font-black uppercase tracking-widest">Waiting for Signal...</p>
                           </div>
                         )}
                      </div>
                    )}

                    {selectedIncident.status === 'OPEN' && (
                      <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl">
                        <h3 className="text-xl font-black mb-6 tracking-tight">Critical Actions</h3>
                        <div className="space-y-4">
                          <ActionBtn 
                            icon={Phone} 
                            label="Initiate Cabin Audio" 
                            color="bg-rose-50 text-rose-700 border-rose-100" 
                            onClick={handleCallDriver}
                          />
                          <ActionBtn 
                            icon={ShieldAlert} 
                            label="Escalate to Regional HSSE" 
                            color="bg-black text-white" 
                            primary 
                            onClick={handleHseEscalation}
                          />
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-6 text-center italic">
                          Manual action resets the re-routing timer.
                        </p>
                      </div>
                    )}

                    {selectedIncident.status === 'ESCALATED' && (
                      <div className="bg-rose-50 p-8 rounded-[40px] border border-rose-200 shadow-xl animate-pulse">
                        <h3 className="text-xl font-black mb-4 text-rose-600 flex items-center gap-2">
                          <ZapOff size={24} /> SLA Breach Detected
                        </h3>
                        <p className="text-xs text-rose-700 font-medium leading-relaxed mb-6">
                          This incident exceeded the 5-minute response window. Terminal ownership has been revoked from Cluster RTC and passed to RTC Lead.
                        </p>
                        <button 
                          onClick={() => handleReopen(selectedIncident.id)}
                          className="w-full py-3 bg-rose-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg hover:bg-rose-700 transition-all flex items-center justify-center gap-2"
                        >
                          <RefreshCw size={18} /> Restore Control
                        </button>
                      </div>
                    )}

                    <div className="bg-zinc-50 p-8 rounded-[40px] border-2 border-dashed border-zinc-200">
                      <div className="flex justify-between items-center mb-6">
                         <h3 className="text-sm font-black flex items-center gap-2 uppercase tracking-widest text-zinc-900">
                           <Activity size={18} className="text-blue-600" /> Operational AI Audit
                         </h3>
                         {!aiAnalysis[selectedIncident.id] && !loadingAi && selectedIncident.status === 'OPEN' && (
                           <button onClick={analyzeIncidentWithAi} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Start Audit</button>
                         )}
                      </div>
                      {loadingAi ? (
                        <div className="flex flex-col items-center justify-center py-10 space-y-4">
                           <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                           <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Evaluating logs...</p>
                        </div>
                      ) : aiAnalysis[selectedIncident.id] ? (
                        <div className="space-y-4">
                          <div className="text-xs text-zinc-700 leading-relaxed bg-white p-6 rounded-[28px] border border-zinc-100 shadow-sm font-medium">
                            {aiAnalysis[selectedIncident.id]}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-zinc-400 leading-relaxed italic text-center font-medium">
                          {selectedIncident.status !== 'OPEN' && selectedIncident.status !== 'ESCALATED' ? "Audit logs are finalized for non-active incidents." : "AI behavioral analysis is recommended to optimize intervention accuracy."}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
                <Archive size={80} strokeWidth={1} className="mb-6 opacity-10" />
                <p className="text-sm font-black uppercase tracking-widest">Incident Dossier Locked</p>
                <p className="text-xs mt-3 italic font-medium">Select an active incident from the response queue.</p>
              </div>
            )}
          </div>
      </div>
    </div>
  );
};

const OutcomeTile = ({ icon: Icon, label, desc, color, onClick }: any) => {
  const styles: Record<string, string> = {
    emerald: 'border-emerald-100 hover:border-emerald-500 hover:bg-emerald-50 text-emerald-600',
    blue: 'border-blue-100 hover:border-blue-500 hover:bg-blue-50 text-blue-600',
    rose: 'border-rose-100 hover:border-rose-500 hover:bg-rose-50 text-rose-600',
    zinc: 'border-zinc-200 hover:border-zinc-900 hover:bg-zinc-50 text-zinc-400 hover:text-zinc-900',
  };

  const iconStyles: Record<string, string> = {
    emerald: 'bg-emerald-500 text-white',
    blue: 'bg-blue-500 text-white',
    rose: 'bg-rose-500 text-white',
    zinc: 'bg-zinc-200 text-zinc-600',
  };

  return (
    <button 
      onClick={onClick}
      className={`p-6 rounded-[32px] border text-left transition-all group relative overflow-hidden flex flex-col justify-between h-40 ${styles[color]}`}
    >
       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg ${iconStyles[color]}`}>
          <Icon size={24} />
       </div>
       <div>
          <h4 className="font-black text-sm uppercase tracking-tight mb-1 group-hover:text-inherit">{label}</h4>
          <p className="text-[10px] text-zinc-400 font-bold leading-relaxed">{desc}</p>
       </div>
    </button>
  );
};

const EvidenceItem = ({ label, type, onClick }: any) => (
  <div 
    onClick={onClick}
    className="flex items-center justify-between p-4 bg-zinc-50 rounded-[24px] border border-zinc-100 hover:bg-white hover:border-zinc-300 hover:shadow-lg transition-all group cursor-pointer"
  >
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-zinc-100 shadow-sm group-hover:scale-105 transition-transform">
         {type === 'IMAGE' ? <Camera size={20} className="text-zinc-400" /> : type === 'VIDEO' ? <Play size={20} className="text-zinc-400" /> : <Activity size={20} className="text-zinc-400" />}
      </div>
      <div>
        <p className="text-sm font-black text-zinc-900">{label}</p>
        <p className="text-[10px] text-zinc-400 uppercase font-black tracking-tighter mt-0.5">{type} EVIDENCE</p>
      </div>
    </div>
    <ChevronRight size={20} className="text-zinc-200 group-hover:text-zinc-900 transition-colors" />
  </div>
);

const ActionBtn = ({ icon: Icon, label, color, primary, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between p-5 rounded-[24px] border transition-all hover:scale-[1.02] active:scale-95 ${color} ${primary ? 'shadow-2xl shadow-black/10' : ''}`}
  >
    <div className="flex items-center gap-4">
      <Icon size={20} strokeWidth={3} />
      <span className="text-xs font-black uppercase tracking-widest">{label}</span>
    </div>
    <ChevronRight size={18} strokeWidth={3} />
  </button>
);

export default IncidentWorkspace;
