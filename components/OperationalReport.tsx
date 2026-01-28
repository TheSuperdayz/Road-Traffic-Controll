
import React, { useMemo } from 'react';
import { Unit, JobOrder, Alert, AlertSeverity, JobOrderStatus, VehicleState, Incident, IncidentOutcome } from '../types';
import { 
  FileText, 
  Printer, 
  Download, 
  Share2, 
  CheckCircle, 
  ShieldAlert, 
  Activity, 
  Clock, 
  PhoneCall, 
  UserCheck, 
  Timer,
  ShieldCheck,
  Zap,
  Award,
  Eye,
  BrainCircuit,
  AlertCircle,
  CameraOff,
  UserRoundX,
  TrendingUp,
  BarChart3,
  Dna,
  ZapOff,
  CircleStop,
  Target
} from 'lucide-react';

interface Props {
  units: Unit[];
  jobOrders: JobOrder[];
  alerts: Alert[];
  incidents: Incident[];
}

const OperationalReport: React.FC<Props> = ({ units, jobOrders, alerts, incidents }) => {
  const shiftStats = {
    totalIncidents: incidents.length,
    avgResponseTime: '38s',
    slaAdherence: '96.4%',
    successfulInterventions: 18,
    voiceQualityScore: '4.8/5',
    hseEscalations: 3,
    slaBreachReassignments: 2,
    behaviorCorrectionRate: '88.5%',
    fatigueEvents: 12,
    distractionEvents: 24,
    cameraBlockages: 6,
    avgCorrectionTime: '4.2m',
    criticalRepeatOffenders: 3
  };

  const outcomeCounts = useMemo(() => {
    const counts: Record<IncidentOutcome, number> = {
      RESPONSIVE: 0,
      STOPPED: 0,
      ESCALATED: 0,
      FALSE_POSITIVE: 0,
      PENDING: 0
    };
    incidents.forEach(inc => {
      if (inc.outcome) counts[inc.outcome]++;
    });
    return counts;
  }, [incidents]);

  const behaviorAnomalies = [
    { type: 'Micro-sleep Correlation', count: 4, impact: 'High Risk', trend: '+10%' },
    { type: 'Mobile Device Tethering', count: 18, impact: 'Medium Risk', trend: '-5%' },
    { type: 'Lens Obscuration', count: 6, impact: 'Compliance Failure', trend: 'Stable' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-zinc-900">RTC Shift Audit</h2>
          <p className="text-gray-500 mt-1">Operational performance & behavioral risk telemetry.</p>
        </div>
        <div className="flex gap-2">
          <button className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 shadow-sm transition-all active:scale-95"><Printer size={20}/></button>
          <button className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 shadow-sm transition-all active:scale-95"><Download size={20}/></button>
          <button className="bg-black text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-black/10 hover:bg-zinc-800 transition-all active:scale-95">
            <Share2 size={18} /> Send to Shift Lead
          </button>
        </div>
      </div>

      <div className="bg-white p-12 rounded-[56px] border border-gray-100 shadow-xl space-y-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
          <ShieldCheck size={400} />
        </div>

        <div className="flex justify-between items-start border-b border-gray-100 pb-12 relative z-10">
          <div className="flex items-center gap-5">
             <div className="bg-zinc-900 p-4 rounded-3xl text-white shadow-xl">
                <ShieldCheck size={36} />
             </div>
             <div>
                <h1 className="text-2xl font-black tracking-tighter uppercase">RTC Command Operations</h1>
                <p className="text-[10px] text-gray-400 font-black tracking-[0.3em] uppercase mt-1">Shift Integrity Audit • Level 4 Surveillance</p>
             </div>
          </div>
          <div className="text-right">
             <p className="text-sm font-black text-zinc-900">AUDIT ID: RTCP-LOG-{Date.now().toString().slice(-6)}</p>
             <p className="text-xs text-gray-400 font-bold mt-1 italic uppercase">{new Date().toLocaleDateString('en-GB')} • 06:00 - 14:00 Shift</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-12 relative z-10">
           <div className="space-y-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Activity size={12} className="text-blue-500" /> Incident Workload
              </p>
              <h3 className="text-5xl font-black text-gray-900 tracking-tighter">{shiftStats.totalIncidents} <span className="text-xs text-gray-400 font-black uppercase tracking-widest align-middle ml-1">Cases</span></h3>
              <p className="text-[10px] text-emerald-600 font-black uppercase tracking-tighter">+8% Volume vs. Prev. Shift</p>
           </div>
           <div className="space-y-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Timer size={12} className="text-indigo-500" /> Avg. Response (ART)
              </p>
              <h3 className="text-5xl font-black text-indigo-600 tracking-tighter">{shiftStats.avgResponseTime}</h3>
              <p className="text-[10px] text-emerald-600 font-black uppercase tracking-tighter">Elite-Class Agility</p>
           </div>
           <div className="space-y-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <BrainCircuit size={12} className="text-emerald-500" /> Correction Rate
              </p>
              <h3 className="text-5xl font-black text-emerald-500 tracking-tighter">{shiftStats.behaviorCorrectionRate}</h3>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">Behavioral Compliance</p>
           </div>
        </div>

        <div className="space-y-8 relative z-10">
           <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-zinc-900">
                 <Target className="text-indigo-600" size={18} /> Intervention Outcome Efficiency
              </h3>
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Feedback Loop Validated</span>
           </div>
           
           <div className="grid grid-cols-4 gap-6">
              <OutcomeStat icon={UserCheck} label="Driver Responsive" value={outcomeCounts.RESPONSIVE} color="text-emerald-600" bg="bg-emerald-50" />
              <OutcomeStat icon={CircleStop} label="Driver Stopped" value={outcomeCounts.STOPPED} color="text-blue-600" bg="bg-blue-50" />
              <OutcomeStat icon={ShieldAlert} label="HSSE Escalated" value={outcomeCounts.ESCALATED} color="text-rose-600" bg="bg-rose-50" />
              <OutcomeStat icon={ZapOff} label="False Positive" value={outcomeCounts.FALSE_POSITIVE} color="text-zinc-500" bg="bg-zinc-100" />
           </div>
        </div>

        <div className="relative z-10 bg-zinc-900 rounded-[48px] p-10 text-white shadow-2xl overflow-hidden group">
           <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
              <Eye size={120} />
           </div>
           <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                 <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
                    <BrainCircuit size={20} className="text-blue-400" /> Risk Correlation Data
                 </h3>
                 <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">DMS Telemetry Correlation Matrix</p>
              </div>
              <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl text-[10px] font-black uppercase text-zinc-400">
                Shift Status: Verified
              </div>
           </div>

           <div className="grid grid-cols-4 gap-6">
              <BehaviorStat icon={AlertCircle} label="Fatigue (Eyes Closed)" value={shiftStats.fatigueEvents} color="text-rose-400" />
              <BehaviorStat icon={Activity} label="Distraction Triggers" value={shiftStats.distractionEvents} color="text-amber-400" />
              <BehaviorStat icon={CameraOff} label="Sensor Blockage" value={shiftStats.cameraBlockages} color="text-zinc-400" />
              <BehaviorStat icon={UserRoundX} label="Policy Violations" value={shiftStats.hseEscalations} color="text-rose-500" />
           </div>

           <div className="mt-10 grid grid-cols-2 gap-8 pt-8 border-t border-white/5">
              <div className="space-y-4">
                 <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Behavioral Anomaly Breakdown</p>
                 <div className="space-y-3">
                    {behaviorAnomalies.map((b, i) => (
                       <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                          <div className="flex items-center gap-3">
                             <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                             <span className="text-[11px] font-bold text-zinc-300">{b.type}</span>
                          </div>
                          <span className="text-[11px] font-black text-white">{b.count} events</span>
                       </div>
                    ))}
                 </div>
              </div>
              <div className="flex flex-col justify-center gap-8">
                 <div className="flex items-center justify-between">
                    <div>
                       <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1 block">Critical Correction Speed</span>
                       <span className="text-xl font-black text-emerald-400">{shiftStats.avgCorrectionTime} Avg.</span>
                    </div>
                    <div className="text-right">
                       <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1 block">Repeat Risk Drivers</span>
                       <span className="text-xl font-black text-rose-400">{shiftStats.criticalRepeatOffenders} IDs</span>
                    </div>
                 </div>
                 <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4">
                    <TrendingUp size={24} className="text-blue-400" />
                    <div>
                       <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Intervention Efficiency Trend</p>
                       <p className="text-xs text-emerald-400 font-bold">12% Improvement vs. Target</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-10 relative z-10">
          <div className="bg-zinc-50 rounded-[40px] p-10 border border-zinc-100 shadow-inner group hover:bg-white hover:border-zinc-200 transition-all">
             <h3 className="font-black text-sm uppercase tracking-widest mb-8 flex items-center gap-3 text-zinc-900">
               <PhoneCall size={18} className="text-blue-600" /> Response Quality
             </h3>
             <div className="space-y-6">
                <AuditRow label="Voice Assessments Conducted" value={shiftStats.successfulInterventions} />
                <AuditRow label="Intervention Clarity Score" value={shiftStats.voiceQualityScore} isRating />
                <AuditRow label="Technician Tickets Generated" value={units.filter(u => u.status === 'CRITICAL').length} isWarning />
                <AuditRow label="HSE Escalation Handovers" value={shiftStats.hseEscalations} />
             </div>
          </div>

          <div className="bg-zinc-50 rounded-[40px] p-10 border border-zinc-100 shadow-inner group hover:bg-white hover:border-zinc-200 transition-all">
             <h3 className="font-black text-sm uppercase tracking-widest mb-8 flex items-center gap-3 text-zinc-900">
               <ShieldAlert size={18} className="text-rose-600" /> Operational Exceptions
             </h3>
             <div className="space-y-6">
                <AuditRow label="Manual Reassignments (SLA Breach)" value={shiftStats.slaBreachReassignments} isCritical />
                <AuditRow label="Unauthorized Route Deviations" value={units.filter(u => u.routeDeviation).length} isWarning />
                <AuditRow label="Movement without LO (Audit Trigger)" value={units.filter(u => u.opState === 'Active (No LO) Anomaly').length} isCritical />
                <AuditRow label="Protocol Overrides Performed" value={0} />
             </div>
          </div>
        </div>

        <div className="space-y-6 relative z-10">
           <h3 className="font-black text-sm uppercase tracking-widest text-zinc-400 flex items-center gap-2">
             <Award size={16} className="text-zinc-300" /> Shift Performance Remarks
           </h3>
           <div className="p-8 bg-zinc-950 text-white rounded-[40px] text-sm leading-relaxed shadow-2xl italic font-medium relative group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Zap size={48} />
              </div>
              "Intervention Outcome Audit shows that **88.5% of drivers were Responsive** to first-stage voice protocols. HSSE Escalations (3) were specifically triggered by route deviations that occurred post-drowsiness warnings. AI Telemetry calibration is recommended for the South Sector where **False Positives (2)** were recorded due to low-light sensor noise. Overall ART remains within the Elite threshold."
           </div>
        </div>

        <div className="pt-12 border-t border-gray-100 flex justify-between items-center opacity-60 relative z-10">
           <div className="flex items-center gap-3">
              <div className="p-1.5 bg-emerald-500 rounded-lg text-white">
                <CheckCircle size={14} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900">Shift Protocol Verification: GRANTED</span>
           </div>
           <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">System Code: BBM-RTC-OUTCOME-A</span>
        </div>
      </div>
    </div>
  );
};

const OutcomeStat = ({ icon: Icon, label, value, color, bg }: any) => (
  <div className={`p-6 ${bg} rounded-[32px] border border-transparent shadow-sm flex flex-col justify-between h-36 group hover:shadow-md transition-all`}>
    <div className={`p-2.5 rounded-2xl bg-white shadow-sm w-fit ${color}`}>
       <Icon size={20} />
    </div>
    <div>
       <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1.5">{label}</p>
       <h3 className={`text-2xl font-black ${color}`}>{value} <span className="text-[10px] font-bold text-zinc-300">CASES</span></h3>
    </div>
  </div>
);

const BehaviorStat = ({ icon: Icon, label, value, color }: any) => (
  <div className="bg-white/5 border border-white/10 p-5 rounded-3xl hover:bg-white/10 transition-all group">
     <div className={`p-2 w-fit rounded-xl bg-black border border-white/5 mb-4 ${color}`}>
        <Icon size={18} />
     </div>
     <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
     <p className={`text-2xl font-black ${color}`}>{value}</p>
  </div>
);

interface AuditRowProps {
  label: string;
  value: string | number;
  isCritical?: boolean;
  isWarning?: boolean;
  isRating?: boolean;
}

const AuditRow: React.FC<AuditRowProps> = ({ label, value, isCritical, isWarning, isRating }) => (
  <div className="flex justify-between items-center group/row">
     <div className="flex items-center gap-4">
        <div className={`w-2 h-2 rounded-full transition-transform group-hover/row:scale-125 ${isCritical ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]' : isWarning ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'}`}></div>
        <span className="text-xs font-bold text-zinc-500 group-hover/row:text-zinc-900 transition-colors uppercase tracking-tight">{label}</span>
     </div>
     <div className="flex items-baseline gap-1">
       <span className={`font-black text-sm tabular-nums ${
         (value as number) > 0 && isCritical ? 'text-rose-600' : 
         (value as number) > 0 && isWarning ? 'text-amber-600' : 
         isRating ? 'text-blue-600' :
         'text-zinc-900'
       }`}>
         {value}
       </span>
       {typeof value === 'number' && !isRating && <span className="text-[9px] font-black text-zinc-300 uppercase tracking-tighter">Units</span>}
     </div>
  </div>
);

export default OperationalReport;
