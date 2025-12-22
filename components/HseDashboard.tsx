
import React, { useMemo } from 'react';
import { Incident, AlertSeverity } from '../types';
import { 
  ShieldAlert, 
  MapPin, 
  Clock, 
  User, 
  Activity, 
  ChevronRight, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Navigation,
  ArrowUpRight,
  Search,
  History,
  MessageSquare
} from 'lucide-react';

interface Props {
  incidents: Incident[];
  onUpdateStatus: (id: string, status: Incident['status']) => void;
  onAddEvent: (id: string, event: string) => void;
}

const HseDashboard: React.FC<Props> = ({ incidents, onUpdateStatus, onAddEvent }) => {
  const hseIncidents = useMemo(() => {
    return incidents.filter(inc => inc.status === 'HSSE_ESCALATED');
  }, [incidents]);

  const stats = useMemo(() => ({
    totalEscalated: hseIncidents.length,
    critical: hseIncidents.filter(i => i.severity === AlertSeverity.CRITICAL).length,
    inFieldResponse: Math.floor(hseIncidents.length * 0.6), // Simulated
  }), [hseIncidents]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-rose-600 p-2 rounded-xl text-white shadow-lg shadow-rose-200">
              <ShieldAlert size={24} />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900">HSSE Command Console</h2>
          </div>
          <p className="text-gray-500">Security & Environment Field Intervention Management.</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Field Personnel</span>
              <div className="flex items-center gap-1.5 text-xs font-black text-emerald-600">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                 12 ONLINE
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <HseStatCard label="Critical Breaches" value={stats.critical} color="text-rose-600" bg="bg-rose-50" icon={AlertTriangle} />
        <HseStatCard label="Pending Intervention" value={stats.totalEscalated} color="text-amber-600" bg="bg-amber-50" icon={Activity} />
        <HseStatCard label="Active Responders" value={stats.inFieldResponse} color="text-blue-600" bg="bg-blue-50" icon={User} />
        <HseStatCard label="Network Compliance" value="89%" color="text-emerald-600" bg="bg-emerald-50" icon={ShieldCheck} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
             <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-zinc-50/50">
               <h3 className="text-xl font-bold flex items-center gap-3">
                 <Navigation size={22} className="text-rose-600" />
                 Active Field Escalations
               </h3>
               <div className="relative">
                 <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                 <input 
                   type="text" 
                   placeholder="Search cases..." 
                   className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-full text-xs outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
                 />
               </div>
             </div>

             <div className="divide-y divide-gray-50">
               {hseIncidents.length > 0 ? hseIncidents.map((inc) => (
                 <div key={inc.id} className="p-6 hover:bg-zinc-50 transition-colors flex flex-col gap-6 group">
                   <div className="flex justify-between items-start">
                     <div className="flex gap-4">
                        <div className={`p-3 rounded-2xl border ${inc.severity === AlertSeverity.CRITICAL ? 'bg-rose-100 border-rose-200 text-rose-600' : 'bg-amber-100 border-amber-200 text-amber-600'}`}>
                           <ShieldAlert size={20} />
                        </div>
                        <div>
                           <div className="flex items-center gap-3">
                             <h4 className="text-lg font-bold text-zinc-900">{inc.unitId}</h4>
                             <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{inc.id}</span>
                           </div>
                           <p className="text-xs text-gray-500 font-medium mt-1">
                             Policy breach detected at {inc.startTime}. Operator manually requested HSE field support.
                           </p>
                        </div>
                     </div>
                     <div className="text-right">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded border bg-rose-50 text-rose-600 border-rose-100 uppercase tracking-widest">
                          HSSE Escalated
                        </span>
                        <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1 justify-end">
                           <Clock size={10} /> 12m since escalation
                        </p>
                     </div>
                   </div>

                   <div className="flex gap-3">
                      <button 
                        onClick={() => {
                          onUpdateStatus(inc.id, 'CLOSED');
                          onAddEvent(inc.id, 'HSSE: Field investigation complete. Incident resolved.');
                        }}
                        className="flex-1 bg-rose-600 text-white py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all"
                      >
                        Confirm Field Resolution
                      </button>
                      <button className="px-4 py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all flex items-center gap-2">
                        <MessageSquare size={14} /> Brief Team
                      </button>
                      <button className="p-2.5 border border-zinc-100 rounded-xl hover:bg-zinc-100 transition-all">
                        <ChevronRight size={18} className="text-zinc-400" />
                      </button>
                   </div>
                 </div>
               )) : (
                 <div className="p-20 text-center text-gray-400">
                    <ShieldCheck size={48} className="mx-auto mb-4 opacity-10" />
                    <p className="text-sm font-bold uppercase tracking-widest">No Active HSE Field Escalations</p>
                    <p className="text-xs mt-2 italic">Monitoring standard RTC distribution flow.</p>
                 </div>
               )}
             </div>
           </div>
        </div>

        <div className="space-y-6">
          <div className="bg-zinc-900 p-8 rounded-[32px] text-white shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-xl font-black mb-4">Intervention SOP</h3>
              <div className="space-y-4 mb-8">
                 <SopItem label="Dispatch Field Unit" active />
                 <SopItem label="Secure Unit Area" />
                 <SopItem label="Personnel Audit" />
                 <SopItem label="System Log Freeze" />
              </div>
              <button className="w-full py-3 bg-white text-zinc-900 text-xs font-black rounded-2xl shadow-lg hover:bg-zinc-50 transition-all flex items-center justify-center gap-2">
                HSSE Manual-04 <ArrowUpRight size={14} />
              </button>
            </div>
            <div className="absolute -bottom-10 -right-10 text-white/5 group-hover:scale-110 transition-transform duration-700">
               <ShieldAlert size={200} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
             <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                <History size={16} className="text-zinc-400" /> Audit Log
             </h3>
             <div className="space-y-6 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[1px] before:bg-zinc-100">
                <AuditEntry time="11:45" event="Unit TRK-009 escalated to Field HSE" />
                <AuditEntry time="11:30" event="TRK-003 Driver Drowsiness Escalated" />
                <AuditEntry time="10:15" event="Shift handover - SOP check PASS" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HseStatCard = ({ label, value, color, bg, icon: Icon }: any) => (
  <div className={`p-6 ${bg} rounded-[28px] border border-transparent shadow-sm flex flex-col justify-between h-32 group hover:shadow-md transition-all`}>
    <div className="flex justify-between items-start">
      <div className={`p-2 rounded-xl bg-white/60 shadow-sm ${color}`}>
        <Icon size={20} />
      </div>
      <ChevronRight size={16} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1.5">{label}</p>
      <h3 className={`text-2xl font-black ${color}`}>{value}</h3>
    </div>
  </div>
);

const SopItem = ({ label, active }: any) => (
  <div className="flex items-center gap-3">
    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${active ? 'bg-rose-500 border-rose-500' : 'border-zinc-700'}`}>
      {active && <CheckCircle2 size={12} className="text-white" />}
    </div>
    <span className={`text-xs font-bold ${active ? 'text-white' : 'text-zinc-500'}`}>{label}</span>
  </div>
);

const AuditEntry = ({ time, event }: any) => (
  <div className="pl-6 relative">
    <div className="absolute left-0 top-1.5 w-3.5 h-3.5 bg-white border border-zinc-200 rounded-full flex items-center justify-center">
       <div className="w-1 h-1 bg-zinc-300 rounded-full"></div>
    </div>
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{time}</p>
    <p className="text-xs font-bold text-zinc-700 mt-0.5 line-clamp-1">{event}</p>
  </div>
);

export default HseDashboard;
