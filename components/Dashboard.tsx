
import React, { useMemo, useState } from 'react';
import { Unit, Alert, AlertSeverity, JobOrder, VehicleState, JobOrderStatus, DriverBehaviorState } from '../types';
import { 
  Truck, 
  Activity, 
  AlertCircle, 
  Clock, 
  ArrowUpRight, 
  ShieldAlert, 
  Navigation, 
  Package, 
  Zap, 
  ChevronRight, 
  CheckCircle2, 
  Send, 
  PlayCircle, 
  Flag, 
  Filter, 
  UserCheck, 
  EyeOff, 
  UserMinus, 
  AlertTriangle,
  Cpu,
  Radio,
  Signal,
  BrainCircuit,
  Database
} from 'lucide-react';

const ETA_DEVIATION_THRESHOLD_MINS = 20;

const Dashboard: React.FC<{ units: Unit[], alerts: Alert[], jobOrders: JobOrder[] }> = ({ units, alerts, jobOrders }) => {
  const [statusFilter, setStatusFilter] = useState<JobOrderStatus | 'ALL'>('ALL');
  const [behaviorFilter, setBehaviorFilter] = useState<DriverBehaviorState | 'ALL'>('ALL');

  const stats = useMemo(() => {
    return {
      activeOnLo: units.filter(u => u.opState === VehicleState.ACTIVE_ON_LO).length,
      activeNoLo: units.filter(u => u.opState === VehicleState.ACTIVE_NO_LO).length,
      idlePlanned: units.filter(u => u.opState === VehicleState.IDLE_PLANNED).length,
      idleUnplanned: units.filter(u => u.opState === VehicleState.IDLE_UNPLANNED).length,
      criticalStop: units.filter(u => u.opState === VehicleState.CRITICAL_STOP).length,
      // DMS Stats
      dmsNormal: units.filter(u => u.behaviorState === DriverBehaviorState.NORMAL).length,
      dmsWarning: units.filter(u => u.behaviorState === DriverBehaviorState.WARNING).length,
      dmsCritical: units.filter(u => u.behaviorState === DriverBehaviorState.CRITICAL).length,
      dmsOffline: units.filter(u => u.behaviorState === DriverBehaviorState.OFFLINE).length,
    };
  }, [units]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      [JobOrderStatus.SCHEDULED]: 0,
      [JobOrderStatus.DISPATCHED]: 0,
      [JobOrderStatus.IN_TRANSIT]: 0,
      [JobOrderStatus.ARRIVED]: 0,
      [JobOrderStatus.COMPLETED]: 0,
      [JobOrderStatus.EXCEPTION]: 0,
    };
    jobOrders.forEach(lo => {
      counts[lo.status] = (counts[lo.status] || 0) + 1;
    });
    return counts;
  }, [jobOrders]);

  const displayedLOs = useMemo(() => {
    let filtered = jobOrders;
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(lo => lo.status === statusFilter);
    }
    if (behaviorFilter !== 'ALL') {
      const unitIdsWithBehavior = units.filter(u => u.behaviorState === behaviorFilter).map(u => u.id);
      filtered = filtered.filter(lo => unitIdsWithBehavior.includes(lo.vehicleId));
    }
    return filtered;
  }, [jobOrders, statusFilter, behaviorFilter, units]);

  const getStatusConfig = (status: JobOrderStatus) => {
    switch (status) {
      case JobOrderStatus.SCHEDULED: return { color: 'text-gray-500', bg: 'bg-gray-50', icon: Clock };
      case JobOrderStatus.DISPATCHED: return { color: 'text-indigo-600', bg: 'bg-indigo-50', icon: Send };
      case JobOrderStatus.IN_TRANSIT: return { color: 'text-blue-600', bg: 'bg-blue-50', icon: PlayCircle };
      case JobOrderStatus.ARRIVED: return { color: 'text-emerald-600', bg: 'bg-emerald-50', icon: Flag };
      case JobOrderStatus.COMPLETED: return { color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle2 };
      case JobOrderStatus.EXCEPTION: return { color: 'text-rose-600', bg: 'bg-rose-50', icon: AlertCircle };
      default: return { color: 'text-gray-500', bg: 'bg-gray-50', icon: Package };
    }
  };

  const getBehaviorBadge = (unitId: string) => {
    const unit = units.find(u => u.id === unitId);
    if (!unit) return null;
    
    switch (unit.behaviorState) {
      case DriverBehaviorState.NORMAL: 
        return <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black border border-emerald-100 uppercase tracking-tighter"><UserCheck size={10} /> Compliant</div>;
      case DriverBehaviorState.WARNING:
        return <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-black border border-amber-100 uppercase tracking-tighter"><Activity size={10} /> Risk Point</div>;
      case DriverBehaviorState.CRITICAL:
        return <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[10px] font-black border border-rose-100 animate-pulse uppercase tracking-tighter"><AlertCircle size={10} /> Intervention Req</div>;
      case DriverBehaviorState.OFFLINE:
        return <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-black border border-gray-200 uppercase tracking-tighter"><EyeOff size={10} /> Signal Lost</div>;
      default: return null;
    }
  };

  const renderEtaWithDeviation = (lo: JobOrder) => {
    const unit = units.find(u => u.id === lo.vehicleId);
    const eta = unit?.eta || 'N/A';
    const planned = lo.plannedArrival;

    const etaMins = (timeStr: string) => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    if (eta === 'N/A' || eta === 'DELAYED' || !planned) {
      return (
        <div className="flex flex-col">
          <span className={`text-sm font-black tracking-tight ${eta === 'DELAYED' ? 'text-rose-600' : 'text-zinc-900'}`}>{eta}</span>
          <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">Plan: {planned}</span>
        </div>
      );
    }

    const diff = etaMins(eta) - etaMins(planned);
    const isSignificant = diff >= ETA_DEVIATION_THRESHOLD_MINS;

    return (
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-sm font-black tracking-tight text-zinc-900">{eta}</span>
          {isSignificant && (
            <div className="flex items-center gap-0.5 text-rose-600 font-black text-[9px] animate-pulse">
              <AlertTriangle size={10} /> +{diff}m
            </div>
          )}
        </div>
        <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">Plan: {planned}</span>
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-zinc-900 tracking-tighter uppercase flex items-center gap-4">
            Data RTC Hub
            <div className="h-4 w-[1px] bg-zinc-200"></div>
            <span className="text-zinc-400 text-sm font-medium normal-case tracking-normal">Real-time Road Traffic Control Terminal</span>
          </h2>
        </div>
        <div className="flex gap-3">
          <div className="bg-white border border-gray-100 rounded-2xl px-5 py-2.5 flex items-center gap-4 shadow-sm">
            <div className="flex flex-col">
               <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">Data Link Health</span>
               <div className="flex items-center gap-2 text-xs font-black text-emerald-600">
                  <Signal size={12} strokeWidth={3} />
                  ENCRYPTED 
               </div>
            </div>
            <div className="w-[1px] h-8 bg-zinc-100"></div>
            <div className="flex flex-col">
               <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">Active Nodes</span>
               <span className="text-xs font-black text-zinc-900">{units.length} UNITS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Behavioral Telemetry Engine Panel */}
      <section className="bg-zinc-900 p-8 rounded-[48px] border border-white/5 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
           <BrainCircuit size={160} />
        </div>
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20"><BrainCircuit size={24} /></div>
            <div className="space-y-1">
               <h3 className="text-xl font-black text-white tracking-tight">Behavioral Telemetry Stream</h3>
               <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">DMS AI Correlation Matrix</p>
            </div>
          </div>
          <button 
            onClick={() => setBehaviorFilter('ALL')}
            className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${behaviorFilter === 'ALL' ? 'text-zinc-600' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            Reset Filter
          </button>
        </div>
        <div className="grid grid-cols-4 gap-6 relative z-10">
          <RiskSummaryCard 
            label="Verified Normal" 
            value={stats.dmsNormal} 
            color="text-emerald-400" 
            bg="bg-white/5" 
            icon={UserCheck} 
            active={behaviorFilter === DriverBehaviorState.NORMAL}
            onClick={() => setBehaviorFilter(DriverBehaviorState.NORMAL)}
          />
          <RiskSummaryCard 
            label="Active Warning" 
            value={stats.dmsWarning} 
            color="text-amber-400" 
            bg="bg-white/5" 
            icon={Activity} 
            active={behaviorFilter === DriverBehaviorState.WARNING}
            onClick={() => setBehaviorFilter(DriverBehaviorState.WARNING)}
          />
          <RiskSummaryCard 
            label="Critical Breach" 
            value={stats.dmsCritical} 
            color="text-rose-500" 
            bg="bg-white/5" 
            icon={AlertCircle} 
            animate
            active={behaviorFilter === DriverBehaviorState.CRITICAL}
            onClick={() => setBehaviorFilter(DriverBehaviorState.CRITICAL)}
          />
          <RiskSummaryCard 
            label="Offline Anomaly" 
            value={stats.dmsOffline} 
            color="text-zinc-500" 
            bg="bg-white/5" 
            icon={Zap} 
            active={behaviorFilter === DriverBehaviorState.OFFLINE}
            onClick={() => setBehaviorFilter(DriverBehaviorState.OFFLINE)}
          />
        </div>
      </section>

      {/* Path Integrity HUD */}
      <section className="grid grid-cols-5 gap-4">
        <HeartbeatCard label="Validated Path" value={stats.activeOnLo} color="text-emerald-600" bg="bg-white border-emerald-50" icon={CheckCircle2} />
        <HeartbeatCard label="Path Anomaly" value={stats.activeNoLo} color="text-rose-600" bg="bg-white border-rose-50" icon={Database} animate />
        <HeartbeatCard label="Standby (Planned)" value={stats.idlePlanned} color="text-blue-600" bg="bg-white border-blue-50" icon={Clock} />
        <HeartbeatCard label="Unplanned Idle" value={stats.idleUnplanned} color="text-amber-600" bg="bg-white border-amber-50" icon={AlertCircle} />
        <HeartbeatCard label="Terminal Force Stop" value={stats.criticalStop} color="text-rose-700" bg="bg-rose-50 border-rose-100" icon={ShieldAlert} animate />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[48px] border border-gray-100 shadow-xl overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-zinc-900 rounded-2xl text-white shadow-lg"><Cpu size={24} /></div>
                 <div>
                    <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Distribution Surveillance</h3>
                    <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em]">Operational Integrity Feed</p>
                 </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${statusFilter === 'ALL' ? 'bg-zinc-200 text-zinc-500 opacity-50 cursor-not-allowed' : 'bg-zinc-900 text-white shadow-xl hover:bg-black'}`}
                  disabled={statusFilter === 'ALL'}
                >
                  Reset Feed
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto min-h-[400px]">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-50/50 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-gray-50">
                    <th className="px-8 py-5">Node ID / Route</th>
                    <th className="px-8 py-5">State</th>
                    <th className="px-8 py-5">Telemetry</th>
                    <th className="px-8 py-5">ETA Window</th>
                    <th className="px-8 py-5">Link</th>
                    <th className="px-8 py-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-medium">
                  {displayedLOs.length > 0 ? displayedLOs.map((lo) => (
                    <tr key={lo.id} className="group hover:bg-zinc-50/80 transition-all duration-300">
                      <td className="px-8 py-6">
                        <span className="font-black text-zinc-900 text-sm">{lo.id}</span>
                        <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-1">{lo.origin} → {lo.destination}</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-[10px] text-zinc-500 uppercase font-black tracking-tight">{units.find(u=>u.id===lo.vehicleId)?.opState}</span>
                      </td>
                      <td className="px-8 py-6">
                        {getBehaviorBadge(lo.vehicleId)}
                      </td>
                      <td className="px-8 py-6">
                        {renderEtaWithDeviation(lo)}
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-1.5 text-emerald-500">
                            <Signal size={12} strokeWidth={3} />
                            <span className="text-[9px] font-black uppercase">LIVE</span>
                         </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button className="p-2.5 bg-zinc-50 text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-xl transition-all shadow-sm">
                          <ChevronRight size={18} />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="px-8 py-32 text-center">
                        <div className="flex flex-col items-center justify-center text-zinc-300">
                          <Database size={48} className="mb-4 opacity-10" />
                          <p className="text-xs font-black uppercase tracking-[0.2em]">No stream data matches current filters.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <section className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <Filter size={14} className="text-zinc-400" />
              <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">Operational Phase Filter</h4>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {Object.values(JobOrderStatus).map((status) => {
                const { color, bg, icon: StatusIcon } = getStatusConfig(status);
                const isActive = statusFilter === status;
                return (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(isActive ? 'ALL' : status)}
                    className={`flex flex-col p-5 rounded-3xl border transition-all text-left group ${
                      isActive 
                        ? 'bg-zinc-900 border-zinc-900 text-white shadow-2xl scale-105 z-10' 
                        : `bg-white border-zinc-100 hover:border-zinc-300 shadow-sm`
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-4 transition-all ${
                      isActive ? 'bg-white/10 text-white' : `${bg} ${color} shadow-inner`
                    }`}>
                      <StatusIcon size={20} />
                    </div>
                    <p className={`text-[9px] font-black uppercase tracking-[0.1em] mb-1.5 ${isActive ? 'text-zinc-400' : 'text-zinc-400'}`}>
                      {status.replace('_', ' ')}
                    </p>
                    <span className="text-xl font-black tabular-nums">{statusCounts[status] || 0}</span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[48px] border border-gray-100 shadow-xl">
            <h3 className="text-xl font-black mb-8 flex items-center gap-3 tracking-tight">
               <AlertCircle size={24} className="text-rose-500" /> Telemetry Watchlist
            </h3>
            <div className="space-y-4">
              {units.filter(u => u.behaviorState === DriverBehaviorState.CRITICAL || u.behaviorState === DriverBehaviorState.OFFLINE).map(unit => (
                <div key={unit.id} className={`p-6 rounded-[32px] border transition-all ${unit.behaviorState === DriverBehaviorState.CRITICAL ? 'bg-rose-50 border-rose-100' : 'bg-zinc-50 border-zinc-100'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-lg border ${unit.behaviorState === DriverBehaviorState.CRITICAL ? 'bg-rose-500 text-white border-rose-400' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                      {unit.behaviorState}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tabular-nums">{unit.lastUpdate}</span>
                  </div>
                  <h4 className="text-lg font-black text-zinc-900">{unit.plateNumber}</h4>
                  <p className="text-xs text-zinc-500 mt-2 font-medium leading-relaxed">{unit.behaviorReason || 'No behavioral logs received'}</p>
                  <div className="mt-6 flex gap-3">
                    <button className={`flex-1 py-3.5 text-[10px] font-black uppercase tracking-widest rounded-2xl border transition-all shadow-sm ${
                      unit.behaviorState === DriverBehaviorState.CRITICAL ? 'bg-white text-rose-600 border-rose-200 hover:bg-rose-100' : 'bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-100'
                    }`}>
                      Command Voice
                    </button>
                    <button className={`px-4 py-3.5 rounded-2xl text-white shadow-lg transition-all active:scale-95 ${unit.behaviorState === DriverBehaviorState.CRITICAL ? 'bg-rose-600 hover:bg-rose-700' : 'bg-zinc-900 hover:bg-black'}`}>
                       <ShieldAlert size={16}/>
                    </button>
                  </div>
                </div>
              ))}
              {units.filter(u => u.behaviorState === DriverBehaviorState.CRITICAL || u.behaviorState === DriverBehaviorState.OFFLINE).length === 0 && (
                 <div className="text-center py-12 px-6">
                    <UserCheck size={48} strokeWidth={1} className="mx-auto text-zinc-100 mb-4" />
                    <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest leading-relaxed">System scan complete. No critical data anomalies detected.</p>
                 </div>
              )}
            </div>
          </div>

          <div className="bg-indigo-600 p-10 rounded-[56px] shadow-2xl text-white relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center mb-6 shadow-xl"><Radio size={28} /></div>
              <h3 className="font-black text-2xl mb-3 tracking-tight">SOP Compliance Audit</h3>
              <p className="text-indigo-100 text-xs leading-relaxed mb-8 font-medium">
                Data RTC strictly enforces SOP-24 protocols. All intervention events are cryptographically logged for policy verification.
              </p>
              <button className="w-full py-4 bg-white text-indigo-700 text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:bg-indigo-50 transition-all hover:scale-[1.02] active:scale-95">
                Audit Registry
              </button>
            </div>
            <div className="absolute -bottom-16 -right-16 text-white/5 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-[2s]">
              <ShieldAlert size={320} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RiskSummaryCard = ({ label, value, color, bg, icon: Icon, animate, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`p-6 rounded-3xl border transition-all text-left flex flex-col justify-between h-36 group ${
      active ? 'bg-white border-white text-zinc-900 shadow-[0_20px_50px_rgba(0,0,0,0.3)] scale-105 z-10' : `${bg} border-white/5`
    }`}
  >
    <div className={`p-3 rounded-2xl w-fit transition-all ${active ? 'bg-zinc-900 text-white' : `bg-black/40 ${color}`} ${animate && !active ? 'animate-pulse' : ''}`}>
      <Icon size={20} />
    </div>
    <div>
      <p className={`text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-2 ${active ? 'text-zinc-500' : 'text-zinc-500'}`}>{label}</p>
      <h3 className={`text-3xl font-black tabular-nums ${active ? 'text-zinc-900' : 'text-white'}`}>{value}</h3>
    </div>
  </button>
);

const HeartbeatCard = ({ label, value, color, bg, icon: Icon, animate }: any) => (
  <div className={`p-6 ${bg} rounded-[32px] border shadow-sm flex flex-col justify-between h-36 group hover:shadow-xl hover:scale-[1.02] transition-all duration-300`}>
    <div className="flex justify-between items-start">
      <div className={`p-2.5 rounded-2xl bg-white shadow-lg border border-zinc-50 ${color} ${animate ? 'animate-pulse' : ''}`}>
        <Icon size={22} />
      </div>
      <ArrowUpRight size={18} className="text-zinc-200 group-hover:text-zinc-900 transition-colors" />
    </div>
    <div>
      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.15em] leading-none mb-2">{label}</p>
      <h3 className={`text-3xl font-black tabular-nums tracking-tighter ${color}`}>{value}</h3>
    </div>
  </div>
);

export default Dashboard;
